import { useState, useEffect } from 'react'
import { Table, Button, Space, Card, Tag, Modal, Form, Input, InputNumber, message, Select } from 'antd'
import { PlusOutlined, CheckOutlined, CloseOutlined } from '@ant-design/icons'
import request from '../../api'

export default function TransferList() {
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [modalVisible, setModalVisible] = useState(false)
  const [detailVisible, setDetailVisible] = useState(false)
  const [currentOrder, setCurrentOrder] = useState<any>(null)
  const [form] = Form.useForm()

  useEffect(() => {
    loadData()
  }, [page])

  const loadData = async () => {
    setLoading(true)
    try {
      const res: any = await request.get('/transfers', { params: { page, pageSize: 20 } })
      setData(res.data.list)
      setTotal(res.data.total)
    } catch (e) {
      console.error('加载失败', e)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async () => {
    try {
      const values = await form.validateFields()
      // 获取选中的商品
      const { products, ...rest } = values
      await request.post('/transfers', {
        ...rest,
        items: products?.map((id: number) => ({ skuId: id, quantity: 1 })) || []
      })
      message.success('创建成功')
      setModalVisible(false)
      form.resetFields()
      loadData()
    } catch (e: any) {
      message.error(e.message || '创建失败')
    }
  }

  const handleAudit = async (id: number, pass: boolean) => {
    try {
      await request.put(`/transfers/${id}/audit`, { pass })
      message.success(pass ? '审核通过' : '审核驳回')
      loadData()
    } catch (e) {
      message.error('操作失败')
    }
  }

  const handleOut = async (id: number) => {
    try {
      await request.put(`/transfers/${id}/out`)
      message.success('出库完成')
      loadData()
    } catch (e: any) {
      message.error(e.message || '出库失败')
    }
  }

  const handleIn = async (id: number) => {
    try {
      await request.put(`/transfers/${id}/in`)
      message.success('入库完成')
      loadData()
    } catch (e: any) {
      message.error(e.message || '入库失败')
    }
  }

  const handleViewDetail = async (record: any) => {
    try {
      const res: any = await request.get(`/transfers/${record.id}`)
      setCurrentOrder(res.data)
      setDetailVisible(true)
    } catch (e) {
      message.error('加载详情失败')
    }
  }

  const statusColors: any = { 0: 'default', 1: 'processing', 2: 'blue', 3: 'success', 4: 'error' }
  const statusText: any = { 0: '待审核', 1: '已审核', 2: '已出库', 3: '已完成', 4: '已驳回' }

  const columns = [
    { title: '调拨单号', dataIndex: 'code', key: 'code' },
    { title: '调出仓', dataIndex: 'fromWarehouse', key: 'fromWarehouse', render: (w: any) => w?.name || '-' },
    { title: '调入仓', dataIndex: 'toWarehouse', key: 'toWarehouse', render: (w: any) => w?.name || '-' },
    { title: '操作员', dataIndex: 'operator', key: 'operator', render: (o: any) => o?.realName || '-' },
    { title: '创建时间', dataIndex: 'createdAt', key: 'createdAt', render: (d: string) => new Date(d).toLocaleString() },
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
          <Button size="small" type="link" onClick={() => handleViewDetail(record)}>详情</Button>
          {record.status === 0 && (
            <>
              <Button size="small" type="link" onClick={() => handleAudit(record.id, true)}>通过</Button>
              <Button size="small" type="link" danger onClick={() => handleAudit(record.id, false)}>驳回</Button>
            </>
          )}
          {record.status === 1 && (
            <Button size="small" type="link" onClick={() => handleOut(record.id)}>执行出库</Button>
          )}
          {record.status === 2 && (
            <Button size="small" type="link" onClick={() => handleIn(record.id)}>执行入库</Button>
          )}
        </Space>
      )
    }
  ]

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h1 style={{ fontSize: 20 }}>库存调拨</h1>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalVisible(true)}>新建调拨单</Button>
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
        title="新建调拨单"
        open={modalVisible}
        onOk={handleCreate}
        onCancel={() => setModalVisible(false)}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="fromWarehouseId" label="调出仓" rules={[{ required: true }]}>
            <Select placeholder="请选择调出仓">
              <Select.Option value={1}>默认仓库</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="toWarehouseId" label="调入仓" rules={[{ required: true }]}>
            <Select placeholder="请选择调入仓">
              <Select.Option value={2}>门店仓库</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="remark" label="备注">
            <Input.TextArea rows={3} placeholder="请输入备注" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="调拨详情"
        open={detailVisible}
        onCancel={() => setDetailVisible(false)}
        footer={null}
        width={700}
      >
        {currentOrder && (
          <div>
            <div style={{ marginBottom: 16 }}>
              <Space direction="vertical">
                <div>单号: {currentOrder.code}</div>
                <div>调出仓: {currentOrder.fromWarehouse?.name}</div>
                <div>调入仓: {currentOrder.toWarehouse?.name}</div>
                <div>状态: <Tag color={statusColors[currentOrder.status]}>{statusText[currentOrder.status]}</Tag></div>
              </Space>
            </div>
            <Table
              dataSource={currentOrder.items}
              columns={[
                { title: '商品', dataIndex: ['sku', 'product', 'name'], key: 'productName' },
                { title: 'SKU编码', dataIndex: ['sku', 'skuCode'], key: 'skuCode' },
                { title: '调拨数量', dataIndex: 'quantity', key: 'quantity' },
                { title: '实际数量', dataIndex: 'actualQuantity', key: 'actualQuantity', render: (v: number) => v || '-' }
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