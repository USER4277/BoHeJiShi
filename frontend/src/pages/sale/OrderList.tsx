import { useState, useEffect } from 'react'
import { Table, Card, Space, Button, Tag, Input, Select, DatePicker, Modal, message, Descriptions, Divider } from 'antd'
import { EyeOutlined, UndoOutlined, PrinterOutlined, SearchOutlined } from '@ant-design/icons'
import { saleApi } from '../../api/sale'
import dayjs from 'dayjs'

const { RangePicker } = DatePicker

export default function OrderList() {
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [detailVisible, setDetailVisible] = useState(false)
  const [currentOrder, setCurrentOrder] = useState<any>(null)
  const [filters, setFilters] = useState({
    keyword: '',
    status: undefined as number | undefined,
    dateRange: [] as any[]
  })

  useEffect(() => {
    loadData()
  }, [page, filters])

  const loadData = async () => {
    setLoading(true)
    try {
      const params: any = { page, pageSize: 20 }
      if (filters.status !== undefined) params.status = filters.status
      
      const res: any = await saleApi.getOrders(params)
      let list = res.data.list
      
      // 前端过滤关键词
      if (filters.keyword) {
        list = list.filter((item: any) => 
          item.orderNo.includes(filters.keyword) ||
          item.member?.name.includes(filters.keyword)
        )
      }
      
      // 前端过滤日期
      if (filters.dateRange?.length) {
        const start = filters.dateRange[0].startOf('day').valueOf()
        const end = filters.dateRange[1].endOf('day').valueOf()
        list = list.filter((item: any) => {
          const time = new Date(item.createdAt).valueOf()
          return time >= start && time <= end
        })
      }
      
      setData(list)
      setTotal(res.data.total)
    } catch (e) {
      console.error('加载失败', e)
    } finally {
      setLoading(false)
    }
  }

  const handleViewDetail = async (record: any) => {
    try {
      const res: any = await saleApi.getOrderDetail(record.id)
      setCurrentOrder(res.data)
      setDetailVisible(true)
    } catch (e) {
      message.error('加载详情失败')
    }
  }

  const handleReturn = async (order: any) => {
    Modal.confirm({
      title: '确认退货',
      content: '确定要退货此订单吗？退货后库存将恢复，积分将扣除。',
      onOk: async () => {
        try {
          await saleApi.returnOrder(order.id, { returnReason: '顾客要求退货' })
          message.success('退货成功')
          loadData()
        } catch (e: any) {
          message.error(e.message || '退货失败')
        }
      }
    })
  }

  const handlePrint = (order: any) => {
    const receiptContent = `
================================
      薄荷集市 - 饰品店
================================
单号: ${order.orderNo}
时间: ${new Date(order.createdAt).toLocaleString()}
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
${order.member ? `会员: ${order.member.name}\n积分:+${order.pointsEarned || 0}` : ''}
================================
    `.trim()
    
    console.log(receiptContent)
    // 打印逻辑
  }

  const statusColors: any = { 1: 'success', 0: 'default' }
  const statusText: any = { 1: '已完成', 0: '已退货' }

  const columns = [
    { 
      title: '订单号', 
      dataIndex: 'orderNo', 
      key: 'orderNo',
      render: (no: string) => <span style={{ fontFamily: 'monospace' }}>{no}</span>
    },
    { title: '会员', dataIndex: 'member', key: 'member', render: (m: any) => m?.name || '-', ellipsis: true },
    { title: '收银员', dataIndex: 'cashier', key: 'cashier', render: (c: any) => c?.username || '-' },
    { 
      title: '时间', 
      dataIndex: 'createdAt', 
      key: 'createdAt',
      render: (d: string) => dayjs(d).format('YYYY-MM-DD HH:mm')
    },
    { title: '商品数', dataIndex: 'totalQuantity', key: 'totalQuantity', align: 'center' as const },
    { 
      title: '实付金额', 
      dataIndex: 'payAmount', 
      key: 'payAmount',
      render: (a: number) => <span style={{ color: '#ff4d4f', fontWeight: 'bold' }}>¥{a?.toFixed(2)}</span>
    },
    { 
      title: '状态', 
      dataIndex: 'status', 
      key: 'status',
      render: (s: number) => <Tag color={statusColors[s]}>{statusText[s]}</Tag>
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: any) => (
        <Space>
          <Button size="small" type="link" icon={<EyeOutlined />} onClick={() => handleViewDetail(record)}>详情</Button>
          {record.status === 1 && (
            <>
              <Button size="small" type="link" icon={<PrinterOutlined />} onClick={() => handlePrint(record)}>打印</Button>
              <Button size="small" type="link" danger icon={<UndoOutlined />} onClick={() => handleReturn(record)}>退货</Button>
            </>
          )}
        </Space>
      )
    }
  ]

  return (
    <div>
      <h1 style={{ fontSize: 20, marginBottom: 16 }}>销售订单</h1>
      
      <Card style={{ marginBottom: 16 }}>
        <Space wrap>
          <Input
            placeholder="订单号/会员名"
            value={filters.keyword}
            onChange={e => setFilters({ ...filters, keyword: e.target.value })}
            style={{ width: 150 }}
            prefix={<SearchOutlined />}
          />
          <Select
            placeholder="订单状态"
            style={{ width: 100 }}
            allowClear
            value={filters.status}
            onChange={v => setFilters({ ...filters, status: v })}
          >
            <Select.Option value={1}>已完成</Select.Option>
            <Select.Option value={0}>已退货</Select.Option>
          </Select>
          <RangePicker 
            onChange={(dates) => setFilters({ ...filters, dateRange: dates || [] })}
          />
          <Button type="primary" onClick={loadData}>查询</Button>
        </Space>
      </Card>

      <Card>
        <Table
          dataSource={data}
          columns={columns}
          loading={loading}
          rowKey="id"
          pagination={{ current: page, total, onChange: setPage, pageSize: 20 }}
        />
      </Card>

      <Modal
        title="订单详情"
        open={detailVisible}
        onCancel={() => setDetailVisible(false)}
        footer={[
          <Button key="print" icon={<PrinterOutlined />} onClick={() => currentOrder && handlePrint(currentOrder)}>
            打印小票
          </Button>,
          <Button key="close" onClick={() => setDetailVisible(false)}>关闭</Button>
        ]}
        width={700}
      >
        {currentOrder && (
          <div>
            <Descriptions column={2} bordered size="small">
              <Descriptions.Item label="订单号">{currentOrder.orderNo}</Descriptions.Item>
              <Descriptions.Item label="状态">
                <Tag color={statusColors[currentOrder.status]}>{statusText[currentOrder.status]}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="会员">{currentOrder.member?.name || '-'}</Descriptions.Item>
              <Descriptions.Item label="收银员">{currentOrder.cashier?.username || '-'}</Descriptions.Item>
              <Descriptions.Item label="下单时间">{dayjs(currentOrder.createdAt).format('YYYY-MM-DD HH:mm:ss')}</Descriptions.Item>
              <Descriptions.Item label="支付方式">{JSON.parse(currentOrder.payWay || '[]')[0]?.way || '-'}</Descriptions.Item>
            </Descriptions>
            
            <Divider>商品明细</Divider>
            <Table
              dataSource={currentOrder.items}
              columns={[
                { title: '商品', dataIndex: 'productName', key: 'productName' },
                { title: '数量', dataIndex: 'quantity', key: 'quantity', align: 'center' as const },
                { title: '单价', dataIndex: 'unitPrice', key: 'unitPrice', render: (p: number) => `¥${p}` },
                { title: '小计', dataIndex: 'amount', key: 'amount', render: (a: number) => `¥${a}` }
              ]}
              rowKey="id"
              pagination={false}
              size="small"
            />
            
            <Divider orientation="right">
              <Space direction="vertical" style={{ textAlign: 'right' }}>
                <div>商品数量: {currentOrder.totalQuantity}</div>
                <div>商品金额: ¥{currentOrder.totalAmount}</div>
                {currentOrder.discountAmount > 0 && <div>折扣优惠: -¥{currentOrder.discountAmount}</div>}
                <div style={{ fontSize: 18, fontWeight: 'bold', color: '#ff4d4f' }}>
                  实付金额: ¥{currentOrder.payAmount}
                </div>
                {currentOrder.pointsEarned > 0 && (
                  <div style={{ color: '#52c41a' }}>获得积分: +{currentOrder.pointsEarned}</div>
                )}
              </Space>
            </Divider>
            
            {currentOrder.remark && (
              <div style={{ marginTop: 16, color: '#999' }}>
                备注: {currentOrder.remark}
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}