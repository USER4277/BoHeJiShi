import { useState, useEffect } from 'react'
import { Table, Card, Button, Space, Tag, Input, Modal, Form, message, Alert, Select } from 'antd'
import { InboxOutlined, WarningOutlined, SearchOutlined, ExportOutlined } from '@ant-design/icons'
import { inventoryApi } from '../../api/inventory'
import { productApi } from '../../api/product'
import PageContainer from '../../components/PageContainer'
import { mintTheme } from '../../theme/colors'

export default function InventoryList() {
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState([])
  const [filteredData, setFilteredData] = useState([])
  const [warnings, setWarnings] = useState([])
  const [modalVisible, setModalVisible] = useState(false)
  const [form] = Form.useForm()
  const [keyword, setKeyword] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [categoryFilter, setCategoryFilter] = useState<number | undefined>(undefined)
  const [categories, setCategories] = useState<any[]>([])
  const [allProducts, setAllProducts] = useState<any[]>([])

  useEffect(() => {
    loadData()
    loadAllProducts()
    loadCategories()
  }, [])

  const loadCategories = async () => {
    try {
      const res: any = await productApi.getCategories()
      setCategories(res.data || [])
    } catch (e) {
      console.error('加载分类失败', e)
    }
  }

  const loadAllProducts = async () => {
    try {
      const res: any = await productApi.getList({ page: 1, pageSize: 1000 })
      setAllProducts(res.data.list)
    } catch (e) {
      console.error('加载商品列表失败', e)
    }
  }

  const loadData = async () => {
    setLoading(true)
    try {
      const res: any = await inventoryApi.getList()
      setData(res.data)
      setFilteredData(res.data)
      const warnRes: any = await inventoryApi.getWarnings()
      setWarnings(warnRes.data)
    } catch (e) {
      console.error('加载失败', e)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    let result = [...data]

    // 关键词搜索
    if (keyword) {
      result = result.filter((item: any) => {
        const productName = item.sku?.product?.name || ''
        const skuCode = item.sku?.skuCode || ''
        return productName.includes(keyword) || skuCode.includes(keyword)
      })
    }

    // 分类筛选
    if (categoryFilter) {
      result = result.filter((item: any) => item.sku?.product?.categoryId === categoryFilter)
    }

    // 状态筛选
    if (statusFilter === 'low') {
      result = result.filter((item: any) => item.quantity < item.safeQuantity)
    } else if (statusFilter === 'normal') {
      result = result.filter((item: any) => item.quantity >= item.safeQuantity)
    }

    setFilteredData(result)
  }

  const handleReset = () => {
    setKeyword('')
    setStatusFilter('all')
    setCategoryFilter(undefined)
    setFilteredData(data)
  }

  const handleIn = () => {
    form.resetFields()
    form.setFieldsValue({ type: 'in' })
    setModalVisible(true)
  }

  const handleOut = () => {
    form.resetFields()
    form.setFieldsValue({ type: 'out' })
    setModalVisible(true)
  }

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      if (values.type === 'in') {
        await inventoryApi.in(values.skuId, values.quantity, values.remark)
        message.success('入库成功')
      } else {
        await inventoryApi.out(values.skuId, values.quantity, values.remark)
        message.success('出库成功')
      }
      setModalVisible(false)
      loadData()
    } catch (e: any) {
      message.error(e.message || '操作失败')
    }
  }

  const columns = [
    {
      title: 'SKU编码',
      dataIndex: ['sku', 'skuCode'],
      key: 'skuCode',
      render: (text: string) => (
        <span style={{ color: mintTheme.primary[600], fontFamily: 'monospace' }}>{text}</span>
      )
    },
    {
      title: '商品名称',
      dataIndex: ['sku', 'product', 'name'],
      key: 'productName',
      render: (text: string) => (
        <span style={{ color: mintTheme.primary[800], fontWeight: 500 }}>{text}</span>
      )
    },
    {
      title: '当前库存',
      dataIndex: 'quantity',
      key: 'quantity',
      align: 'right' as const,
      render: (qty: number, record: any) => (
        <span style={{
          color: qty < record.safeQuantity ? '#f97316' : mintTheme.primary[600],
          fontWeight: qty < record.safeQuantity ? 'bold' : 'normal'
        }}>
          {qty}
        </span>
      )
    },
    {
      title: '安全库存',
      dataIndex: 'safeQuantity',
      key: 'safeQuantity',
      align: 'right' as const
    },
    {
      title: '状态',
      key: 'status',
      align: 'center' as const,
      render: (_: any, record: any) => (
        record.quantity < record.safeQuantity
          ? <Tag color="error" icon={<WarningOutlined />}>库存不足</Tag>
          : <Tag color="success">正常</Tag>
      )
    }
  ]

  return (
    <PageContainer
      title="库存管理"
      subtitle="Inventory Management"
      extra={
        <Space size="middle">
          <Button
            icon={<InboxOutlined />}
            onClick={handleIn}
            size="large"
            style={{
              borderRadius: mintTheme.borderRadius.lg,
              borderColor: mintTheme.primary[500],
              color: mintTheme.primary[600]
            }}
          >
            入库
          </Button>
          <Button
            icon={<ExportOutlined />}
            onClick={handleOut}
            size="large"
            style={{
              borderRadius: mintTheme.borderRadius.lg,
              borderColor: mintTheme.primary[500],
              color: mintTheme.primary[600]
            }}
          >
            出库
          </Button>
        </Space>
      }
    >
      {warnings.length > 0 && (
        <Alert
          message={`库存预警: ${warnings.length} 件商品库存不足`}
          description="请及时补充库存，避免影响销售"
          type="warning"
          showIcon
          icon={<WarningOutlined />}
          style={{
            marginBottom: 16,
            borderRadius: mintTheme.borderRadius.lg,
            border: `1px solid #fbbf24`
          }}
        />
      )}

      {/* 搜索条件 */}
      <Card
        style={{
          marginBottom: 16,
          borderRadius: mintTheme.borderRadius.lg,
          border: `1px solid ${mintTheme.primary[200]}`
        }}
      >
        <Space size="middle" wrap>
          <Input
            placeholder="搜索商品名称或SKU编码"
            prefix={<SearchOutlined />}
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onPressEnter={handleSearch}
            style={{ width: 260 }}
            allowClear
          />
          <Select
            placeholder="选择分类"
            value={categoryFilter}
            onChange={setCategoryFilter}
            style={{ width: 150 }}
            allowClear
          >
            {categories.map((cat: any) => (
              <Select.Option key={cat.id} value={cat.id}>
                {cat.name}
              </Select.Option>
            ))}
          </Select>
          <Select
            value={statusFilter}
            onChange={setStatusFilter}
            style={{ width: 150 }}
            options={[
              { label: '全部状态', value: 'all' },
              { label: '库存正常', value: 'normal' },
              { label: '库存不足', value: 'low' }
            ]}
          />
          <Button
            type="primary"
            icon={<SearchOutlined />}
            onClick={handleSearch}
            style={{
              background: mintTheme.gradients.primary,
              border: 'none'
            }}
          >
            搜索
          </Button>
          <Button onClick={handleReset}>
            重置
          </Button>
        </Space>
      </Card>

      <Card
        style={{
          ...mintTheme.glass,
          borderRadius: mintTheme.borderRadius.xl,
          border: `1px solid ${mintTheme.primary[200]}`
        }}
        bodyStyle={{ padding: 0 }}
      >
        <Table
          dataSource={filteredData}
          columns={columns}
          loading={loading}
          rowKey="id"
          pagination={{
            showTotal: (total) => (
              <span style={{ color: mintTheme.primary[600] }}>共 {total} 条记录</span>
            ),
            showSizeChanger: true,
            pageSizeOptions: ['10', '20', '50', '100']
          }}
        />
      </Card>

      <Modal
        title={form.getFieldValue('type') === 'in' ? '入库' : '出库'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="type" hidden />
          <Form.Item
            name="skuId"
            label="选择商品"
            rules={[{ required: true, message: '请选择商品' }]}
            extra="选择要入库/出库的商品SKU"
          >
            <Select
              showSearch
              placeholder="搜索商品名称或SKU编码"
              optionFilterProp="children"
              filterOption={(input, option: any) =>
                (option?.label || '').toLowerCase().includes(input.toLowerCase())
              }
              style={{ width: '100%' }}
              options={allProducts.flatMap((product: any) =>
                (product.skus || []).map((sku: any) => ({
                  label: `${product.name} - ${sku.skuCode} (${sku.specs || '默认规格'})`,
                  value: sku.id
                }))
              )}
            />
          </Form.Item>
          <Form.Item name="quantity" label="数量" rules={[{ required: true, message: '请输入数量' }]}>
            <Input type="number" placeholder="请输入数量" min={1} />
          </Form.Item>
          <Form.Item name="remark" label="备注">
            <Input.TextArea placeholder="可选" rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </PageContainer>
  )
}