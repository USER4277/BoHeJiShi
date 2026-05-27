import { useState, useEffect } from 'react'
import { Table, Card, Button, Space, Tag, Input, Modal, Form, message } from 'antd'
import { InboxOutlined, WarningOutlined, SearchOutlined } from '@ant-design/icons'
import { inventoryApi } from '../../api/inventory'
import { productApi } from '../../api/product'

export default function InventoryList() {
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState([])
  const [warnings, setWarnings] = useState([])
  const [modalVisible, setModalVisible] = useState(false)
  const [form] = Form.useForm()
  const [keyword, setKeyword] = useState('')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const res: any = await inventoryApi.getList()
      setData(res.data)
      const warnRes: any = await inventoryApi.getWarnings()
      setWarnings(warnRes.data)
    } catch (e) {
      console.error('加载失败', e)
    } finally {
      setLoading(false)
    }
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
    { title: 'SKU编码', dataIndex: ['sku', 'skuCode'], key: 'skuCode' },
    { title: '商品名称', dataIndex: ['sku', 'product', 'name'], key: 'productName' },
    { title: '当前库存', dataIndex: 'quantity', key: 'quantity' },
    { title: '安全库存', dataIndex: 'safeQuantity', key: 'safeQuantity' },
    { 
      title: '状态',
      key: 'status',
      render: (_: any, record: any) => (
        record.quantity < record.safeQuantity 
          ? <Tag color="error" icon={<WarningOutlined />}>库存不足</Tag>
          : <Tag color="success">正常</Tag>
      )
    }
  ]

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h1 style={{ fontSize: 20 }}>库存管理</h1>
        <Space>
          <Button icon={<InboxOutlined />} onClick={handleIn}>入库</Button>
          <Button onClick={handleOut}>出库</Button>
        </Space>
      </div>

      {warnings.length > 0 && (
        <Card title="库存预警" style={{ marginBottom: 16, borderColor: '#ff4d4f' }}>
          <Tag color="error" style={{ fontSize: 14 }}>{warnings.length} 件商品库存不足</Tag>
        </Card>
      )}

      <Table
        dataSource={data}
        columns={columns}
        loading={loading}
        rowKey="id"
      />

      <Modal
        title={form.getFieldValue('type') === 'in' ? '入库' : '出库'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="type" hidden />
          <Form.Item name="skuId" label="商品SKU" rules={[{ required: true }]}>
            <Input type="number" placeholder="请输入SKU ID" />
          </Form.Item>
          <Form.Item name="quantity" label="数量" rules={[{ required: true }]}>
            <Input type="number" placeholder="请输入数量" />
          </Form.Item>
          <Form.Item name="remark" label="备注">
            <Input.TextArea placeholder="可选" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}