import { useState, useEffect } from 'react'
import { Table, Button, Space, Card, Tag, Modal, Form, Input, InputNumber, message, Popconfirm, Select } from 'antd'
import { PlusOutlined, EditOutlined, EyeOutlined, CheckOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { productApi } from '../../api/product'
import request from '../../api'

export default function StocktakingList() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [modalVisible, setModalVisible] = useState(false)
  const [detailVisible, setDetailVisible] = useState(false)
  const [currentOrder, setCurrentOrder] = useState<any>(null)
  const [form] = Form.useForm()
  const [categories, setCategories] = useState([])

  useEffect(() => {
    loadData()
    loadCategories()
  }, [page])

  const loadData = async () => {
    setLoading(true)
    try {
      const res: any = await request.get('/stocktaking', { params: { page, pageSize: 20 } })
      setData(res.data.list)
      setTotal(res.data.total)
    } catch (e) {
      console.error('加载失败', e)
    } finally {
      setLoading(false)
    }
  }

  const loadCategories = async () => {
    try {
      const res: any = await request.get('/category')
      setCategories(res.data.list || [])
    } catch (e) {
      console.error('加载分类失败', e)
    }
  }

  const handleCreate = async () => {
    try {
      const values = await form.validateFields()
      await request.post('/stocktaking', values)
      message.success('创建成功')
      setModalVisible(false)
      form.resetFields()
      loadData()
    } catch (e: any) {
      message.error(e.message || '创建失败')
    }
  }

  const handleStart = async (id: number) => {
    try {
      await request.put(`/stocktaking/${id}/start`)
      message.success('已开始盘点')
      loadData()
    } catch (e) {
      message.error('操作失败')
    }
  }

  const handleViewDetail = async (record: any) => {
    try {
      const res: any = await request.get(`/stocktaking/${record.id}`)
      setCurrentOrder(res.data)
      setDetailVisible(true)
    } catch (e) {
      message.error('加载详情失败')
    }
  }

  const handleAudit = async (id: number) => {
    try {
      await request.put(`/stocktaking/${id}/audit`)
      message.success('审核完成')
      loadData()
      setDetailVisible(false)
    } catch (e) {
      message.error('审核失败')
    }
  }

  const statusColors: any = { 0: 'default', 1: 'processing', 2: 'success' }
  const statusText: any = { 0: '待盘点', 1: '盘点中', 2: '已完成' }

  const columns = [
    { title: '盘点单号', dataIndex: 'code', key: 'code' },
    { 
      title: '类型', 
      dataIndex: 'type', 
      key: 'type',
      render: (t: number) => t === 1 ? '全盘' : '抽盘'
    },
    { title: '仓库', dataIndex: 'warehouse', key: 'warehouse', render: (w: any) => w?.name || '-' },
    { title: '计划日期', dataIndex: 'plannedDate', key: 'plannedDate', render: (d: string) => new Date(d).toLocaleDateString() },
    { title: '操作员', dataIndex: 'operator', key: 'operator', render: (o: any) => o?.realName || '-' },
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
          {record.status === 0 && (
            <Button size="small" type="link" icon={<EditOutlined />} onClick={() => handleStart(record.id)}>开始</Button>
          )}
        </Space>
      )
    }
  ]

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h1 style={{ fontSize: 20 }}>库存盘点</h1>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalVisible(true)}>新建盘点</Button>
      </div>

      <Card>
        <Table
          dataSource={data}
          columns={columns}
          loading={loading}
          rowKey="id"
          pagination={{ current: page, total, onChange: setPage }}
        />
      </Card>

      <Modal
        title="新建盘点单"
        open={modalVisible}
        onOk={handleCreate}
        onCancel={() => setModalVisible(false)}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="type" label="盘点类型" initialValue={1}>
            <Select>
              <Select.Option value={1}>全盘</Select.Option>
              <Select.Option value={2}>抽盘</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="warehouseId" label="仓库" rules={[{ required: true }]}>
            <Select placeholder="请选择仓库">
              <Select.Option value={1}>默认仓库</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="plannedDate" label="计划日期" initialValue={new Date().toISOString().split('T')[0]}>
            <Input type="date" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="盘点详情"
        open={detailVisible}
        onCancel={() => setDetailVisible(false)}
        footer={currentOrder?.status === 1 ? (
          <Button type="primary" icon={<CheckOutlined />} onClick={() => handleAudit(currentOrder.id)}>
            审核确认
          </Button>
        ) : null}
        width={800}
      >
        {currentOrder && (
          <div>
            <div style={{ marginBottom: 16 }}>
              <Space>
                <span>单号: {currentOrder.code}</span>
                <Tag color={statusColors[currentOrder.status]}>{statusText[currentOrder.status]}</Tag>
              </Space>
            </div>
            <Table
              dataSource={currentOrder.items}
              columns={[
                { title: '商品', dataIndex: ['sku', 'product', 'name'], key: 'productName' },
                { title: 'SKU编码', dataIndex: ['sku', 'skuCode'], key: 'skuCode' },
                { title: '系统库存', dataIndex: 'systemQuantity', key: 'systemQuantity' },
                { 
                  title: '实际数量', 
                  dataIndex: 'actualQuantity', 
                  key: 'actualQuantity',
                  render: (v: number) => v || '-'
                },
                { 
                  title: '差异', 
                  dataIndex: 'difference', 
                  key: 'difference',
                  render: (d: number) => d === 0 ? '-' : <Tag color={d > 0 ? 'green' : 'red'}>{d > 0 ? `+${d}` : d}</Tag>
                }
              ]}
              rowKey="id"
              pagination={false}
              size="small"
            />
          </div>
        )}
      </Modal>
    </div>
  )
}