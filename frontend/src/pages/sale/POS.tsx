import { useState, useEffect } from 'react'
import { Card, Row, Col, Input, Button, Table, Space, message, Modal, Select, Divider, Badge, List, Tag } from 'antd'
import { ShoppingCartOutlined, DeleteOutlined, UserOutlined, PauseOutlined, PayCircleOutlined } from '@ant-design/icons'
import { saleApi } from '../../api/sale'
import { productApi } from '../../api/product'
import { memberApi } from '../../api/member'

interface CartItem {
  skuId: number
  productName: string
  quantity: number
  price: number
  discount?: number
}

export default function POS() {
  const [cart, setCart] = useState<CartItem[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const [products, setProducts] = useState<any[]>([])
  const [payModalVisible, setPayModalVisible] = useState(false)
  const [memberModalVisible, setMemberModalVisible] = useState(false)
  const [holdModalVisible, setHoldModalVisible] = useState(false)
  const [member, setMember] = useState<any>(null)
  const [members, setMembers] = useState<any[]>([])
  const [holds, setHolds] = useState<any[]>([])
  const [payWay, setPayWay] = useState<string>('cash')
  const [discountAmount, setDiscountAmount] = useState<number>(0)
  const [remark, setRemark] = useState('')

  const totalAmount = cart.reduce((sum, item) => {
    const itemPrice = item.discount ? item.discount : item.price
    return sum + itemPrice * item.quantity
  }, 0)
  const totalQuantity = cart.reduce((sum, item) => sum + item.quantity, 0)
  const finalAmount = totalAmount - discountAmount

  useEffect(() => {
    loadHolds()
  }, [])

  const loadHolds = async () => {
    try {
      const res: any = await saleApi.getHolds()
      setHolds(res.data)
    } catch (e) {
      console.error('加载挂单失败', e)
    }
  }

  const handleSearch = async () => {
    if (!search) return
    setLoading(true)
    try {
      const res: any = await productApi.getList({ keyword: search, pageSize: 10, status: 1 })
      setProducts(res.data.list)
    } catch (e) {
      console.error('搜索失败', e)
    } finally {
      setLoading(false)
    }
  }

  const handleAddProduct = (product: any) => {
    const exist = cart.find(item => item.skuId === product.id)
    if (exist) {
      setCart(cart.map(item => 
        item.skuId === product.id 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ))
    } else {
      setCart([...cart, {
        skuId: product.id,
        productName: product.name,
        quantity: 1,
        price: product.price
      }])
    }
    setProducts([])
    setSearch('')
  }

  const handleRemove = (skuId: number) => {
    setCart(cart.filter(item => item.skuId !== skuId))
  }

  const handleQuantityChange = (skuId: number, quantity: number) => {
    if (quantity <= 0) {
      handleRemove(skuId)
    } else {
      setCart(cart.map(item => 
        item.skuId === skuId ? { ...item, quantity } : item
      ))
    }
  }

  const handleSelectMember = async (memberId: number) => {
    try {
      const res: any = await memberApi.getDetail(memberId)
      setMember(res.data)
      setMemberModalVisible(false)
      message.success(`已选择会员: ${res.data.name}`)
    } catch (e) {
      message.error('获取会员信息失败')
    }
  }

  const handleClearMember = () => {
    setMember(null)
  }

  const handlePay = async () => {
    if (cart.length === 0) {
      return message.warning('请先添加商品')
    }
    try {
      const orderData = {
        items: cart.map(item => ({
          skuId: item.skuId,
          productName: item.productName,
          quantity: item.quantity,
          unitPrice: item.discount || item.price
        })),
        memberId: member?.id,
        payWay: [{ way: payWay, amount: finalAmount }],
        discountAmount,
        remark
      }
      
      const res: any = await saleApi.createOrder(orderData)
      message.success('结算成功')
      printReceipt(res.data)
      setCart([])
      setMember(null)
      setDiscountAmount(0)
      setRemark('')
      setPayModalVisible(false)
    } catch (e: any) {
      message.error(e.message || '结算失败')
    }
  }

  const handleHold = async () => {
    if (cart.length === 0) {
      return message.warning('请先添加商品')
    }
    try {
      await saleApi.holdOrder({
        memberId: member?.id,
        data: { cart, totalAmount, discountAmount, remark }
      })
      message.success('挂单成功')
      setCart([])
      setMember(null)
      setHoldModalVisible(false)
      loadHolds()
    } catch (e) {
      message.error('挂单失败')
    }
  }

  const handleRetrieveHold = async (holdNo: string) => {
    try {
      const res: any = await saleApi.getHold(holdNo)
      if (res.data.data.cart) {
        setCart(res.data.data.cart)
        setDiscountAmount(res.data.data.discountAmount || 0)
        setRemark(res.data.data.remark || '')
      }
      message.success('取单成功')
      setHoldModalVisible(false)
    } catch (e) {
      message.error('取单失败')
    }
  }

  const printReceipt = (order: any) => {
    const receiptContent = `
================================
      薄荷集市 - 饰品店
================================
单号: ${order.orderNo}
时间: ${new Date().toLocaleString()}
收银员: ${order.cashier?.username || '系统'}

--------------------------------
商品名称        数量    单价    小计
--------------------------------
${order.items?.map((item: any) => 
`${item.productName.substring(0, 8)}
       ${item.quantity}     ${item.unitPrice}     ${item.amount}`
).join('\n')}
--------------------------------
合计数量: ${order.totalQuantity}
商品金额: ¥${order.totalAmount}
折扣优惠: -¥${order.discountAmount || 0}
应付金额: ¥${order.payAmount}
--------------------------------
${member ? `会员: ${member.name}\n积分:+${order.pointsEarned || 0}` : ''}
================================
谢谢惠顾，欢迎下次光临！
================================
    `.trim()
    
    console.log(receiptContent)
    // 可以调用打印接口
    // window.print() 或调用打印机API
  }

  const columns = [
    { title: '商品', dataIndex: 'productName', key: 'productName', width: 150 },
    { title: '单价', dataIndex: 'price', key: 'price', render: (p: number, record: CartItem) => 
      record.discount ? (
        <><span style={{ textDecoration: 'line-through', color: '#999' }}>¥{p}</span>
        <span style={{ color: '#ff4d4f' }}> ¥{record.discount}</span></>
      ) : `¥${p}`
    },
    { 
      title: '数量', 
      key: 'quantity',
      width: 80,
      render: (_: any, record: CartItem) => (
        <Input 
          type="number" 
          value={record.quantity} 
          onChange={e => handleQuantityChange(record.skuId, parseInt(e.target.value) || 0)}
          style={{ width: 50 }}
          min={1}
        />
      )
    },
    { 
      title: '小计', 
      key: 'subtotal',
      render: (_: any, record: CartItem) => {
        const price = record.discount || record.price
        return `¥${(price * record.quantity).toFixed(2)}`
      }
    },
    {
      title: '操作',
      key: 'action',
      width: 60,
      render: (_: any, record: CartItem) => (
        <Button type="link" danger icon={<DeleteOutlined />} onClick={() => handleRemove(record.skuId)} />
      )
    }
  ]

  return (
    <div style={{ height: 'calc(100vh - 180px)' }}>
      <Row gutter={16} style={{ height: '100%' }}>
        <Col span={14}>
          <Card title="商品搜索" style={{ height: '100%' }} extra={
            <Space>
              <Button icon={<UserOutlined />} onClick={() => setMemberModalVisible(true)}>
                {member ? member.name : '选择会员'}
              </Button>
              <Badge count={holds.length}>
                <Button icon={<PauseOutlined />} onClick={() => setHoldModalVisible(true)}>挂单</Button>
              </Badge>
            </Space>
          }>
            <Input.Search
              placeholder="输入商品名称或编码搜索"
              value={search}
              onChange={e => setSearch(e.target.value)}
              onSearch={handleSearch}
              enterButton="搜索"
              loading={loading}
              size="large"
            />
            
            {products.length > 0 && (
              <List
                size="small"
                bordered
                dataSource={products}
                style={{ marginTop: 16, maxHeight: 200, overflow: 'auto' }}
                renderItem={(item: any) => (
                  <List.Item 
                    onClick={() => handleAddProduct(item)}
                    style={{ cursor: 'pointer' }}
                    actions={[<Button type="link" size="small">添加</Button>]}
                  >
                    <List.Item.Meta 
                      title={item.name}
                      description={`编码: ${item.code} | 库存: ${item.stockQuantity || 0}`}
                    />
                    <span style={{ color: '#ff4d4f', fontWeight: 'bold' }}>¥{item.price}</span>
                  </List.Item>
                )}
              />
            )}

            <div style={{ marginTop: 24 }}>
              <h4>快捷分类</h4>
              <Space wrap style={{ marginTop: 8 }}>
                {['戒指', '项链', '手链', '耳饰', '发饰', '胸针', '手镯', '脚链'].map(cat => (
                  <Button key={cat} onClick={() => { setSearch(cat); handleSearch(); }}>{cat}</Button>
                ))}
              </Space>
            </div>
          </Card>
        </Col>
        
        <Col span={10}>
          <Card 
            title={<><ShoppingCartOutlined /> 购物车</>} 
            extra={<Tag color="blue">共 {totalQuantity} 件</Tag>}
            style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
            bodyStyle={{ flex: 1, display: 'flex', flexDirection: 'column' }}
          >
            {member && (
              <div style={{ 
                background: '#f6ffed', 
                padding: 8, 
                borderRadius: 4, 
                marginBottom: 8,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <Space>
                  <UserOutlined />
                  <span>{member.name}</span>
                  <Tag color="gold">Lv.{member.level || 1}</Tag>
                  <span style={{ color: '#999' }}>积分: {member.points || 0}</span>
                </Space>
                <Button type="link" size="small" onClick={handleClearMember}>清除</Button>
              </div>
            )}
            
            <Table
              dataSource={cart}
              columns={columns}
              pagination={false}
              size="small"
              scroll={{ y: 200 }}
              rowKey="skuId"
              locale={{ emptyText: '购物车为空' }}
            />
            
            <div style={{ 
              borderTop: '1px solid #f0f0f0', 
              padding: '16px 0',
              marginTop: 'auto'
            }}>
              <div style={{ marginBottom: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>商品金额:</span>
                  <span>¥{totalAmount.toFixed(2)}</span>
                </div>
                {discountAmount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#52c41a' }}>
                    <span>优惠:</span>
                    <span>-¥{discountAmount.toFixed(2)}</span>
                  </div>
                )}
              </div>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                marginBottom: 16,
                fontSize: 20,
                fontWeight: 'bold'
              }}>
                <span>应付:</span>
                <span style={{ color: '#ff4d4f' }}>¥{finalAmount.toFixed(2)}</span>
              </div>
              <Space style={{ width: '100%' }}>
                <Button 
                  block 
                  size="large" 
                  onClick={() => setPayModalVisible(true)} 
                  disabled={cart.length === 0}
                  type="primary"
                  icon={<PayCircleOutlined />}
                >
                  结算
                </Button>
                <Button 
                  block 
                  size="large"
                  onClick={handleHold}
                  disabled={cart.length === 0}
                >
                  挂单
                </Button>
              </Space>
            </div>
          </Card>
        </Col>
      </Row>

      {/* 收款确认 */}
      <Modal
        title="确认收款"
        open={payModalVisible}
        onOk={handlePay}
        onCancel={() => setPayModalVisible(false)}
        okText="确认收款"
        width={400}
      >
        <div style={{ textAlign: 'center', padding: 16 }}>
          <div style={{ fontSize: 14, color: '#666', marginBottom: 8 }}>应付金额</div>
          <div style={{ fontSize: 36, fontWeight: 'bold', color: '#ff4d4f' }}>
            ¥{finalAmount.toFixed(2)}
          </div>
          
          <Divider>收款方式</Divider>
          <Select 
            value={payWay} 
            onChange={setPayWay} 
            style={{ width: '100%' }}
            size="large"
          >
            <Select.Option value="cash">现金</Select.Option>
            <Select.Option value="wechat">微信支付</Select.Option>
            <Select.Option value="alipay">支付宝</Select.Option>
            <Select.Option value="card">银行卡</Select.Option>
            <Select.Option value="mixed">混合支付</Select.Option>
          </Select>
          
          <div style={{ marginTop: 16 }}>
            <Input 
              placeholder="折扣金额(可为空)" 
              type="number"
              value={discountAmount}
              onChange={e => setDiscountAmount(parseFloat(e.target.value) || 0)}
              prefix="折扣:"
              suffix="元"
            />
          </div>
          
          <div style={{ marginTop: 16 }}>
            <Input.TextArea 
              placeholder="备注(可选)" 
              value={remark}
              onChange={e => setRemark(e.target.value)}
              rows={2}
            />
          </div>
        </div>
      </Modal>

      {/* 选择会员 */}
      <Modal
        title="选择会员"
        open={memberModalVisible}
        onCancel={() => setMemberModalVisible(false)}
        footer={null}
        width={500}
      >
        <Input.Search
          placeholder="输入手机号或姓名搜索会员"
          onSearch={async (keyword) => {
            try {
              const res: any = await memberApi.getList({ keyword, pageSize: 20 })
              setMembers(res.data.list)
            } catch (e) {
              console.error('搜索会员失败', e)
            }
          }}
          enterButton="搜索"
          style={{ marginBottom: 16 }}
        />
        <List
          size="small"
          bordered
          dataSource={members}
          renderItem={(item: any) => (
            <List.Item 
              onClick={() => handleSelectMember(item.id)}
              style={{ cursor: 'pointer' }}
            >
              <List.Item.Meta 
                title={item.name}
                description={`手机: ${item.phone} | 等级: ${['普通', '银卡', '金卡', '钻石'][item.level - 1] || '普通'} | 积分: ${item.points || 0}`}
              />
            </List.Item>
          )}
          locale={{ emptyText: '搜索会员' }}
        />
      </Modal>

      {/* 挂单列表 */}
      <Modal
        title="我的挂单"
        open={holdModalVisible}
        onCancel={() => setHoldModalVisible(false)}
        footer={null}
        width={500}
      >
        {holds.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 24, color: '#999' }}>
            暂无挂单
          </div>
        ) : (
          <List
            size="small"
            bordered
            dataSource={holds}
            renderItem={(item: any) => (
              <List.Item 
                actions={[
                  <Button type="link" onClick={() => handleRetrieveHold(item.holdNo)}>取单</Button>
                ]}
              >
                <List.Item.Meta 
                  title={`挂单号: ${item.holdNo}`}
                  description={`时间: ${new Date(item.createdAt).toLocaleString()}`}
                />
              </List.Item>
            )}
          />
        )}
      </Modal>
    </div>
  )
}