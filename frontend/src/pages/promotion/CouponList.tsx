import { useState, useEffect } from 'react'
import { Table, Card, Button, Space, Tag, Modal, Form, Input, InputNumber, Select, DatePicker, message, Popconfirm } from 'antd'
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons'
import request from '../../api'
import dayjs from 'dayjs'

const { RangePicker } = DatePicker

export default function CouponList() {
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState([])
  const [modalVisible, setModalVisible] = useState(false)
  const [form] = Form.useForm()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const res: any = await request.get('/promotions/coupons')
      setData(res.data)
    } catch (e) {
      console.error('加载失败', e)
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = () => {
    form.resetFields()
    setModalVisible(true)
  }

  const handleDelete = async (id: number) => {
    try {
      await request.delete(`/promotions/coupons/${id}`)
      message.success('删除成功')
      loadData()
    } catch (e) {
      message.error('删除失败')
    }
  }

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      const data = {
        ...values,
        startTime: values.timeRange?.[0]?.toDate(),
        endTime: values.timeRange?.[1]?.toDate()
      }
      delete data.timeRange
      
      await request.post('/promotions/coupons', data)
      message.success('创建成功')
      setModalVisible(false)
      loadData()
    } catch (e: any) {
      message.error(e.message || '创建失败')
    }
  }

  const typeNames: any = { 1: '满减券', 2: '折扣券', 3: '兑换券' }

  const columns = [
    { title: '优惠券名称', dataIndex: 'name', key: 'name' },
    { title: '券码', dataIndex: 'code', key: 'code', render: (c: string) => <code>{c}</code> },
    { 
      title: '类型', 
      dataIndex: 'type', 
      key: 'type',
      render: (t: number) => <Tag>{typeNames[t] || '未知'}</Tag>
    },
    { 
      title: '面值', 
      dataIndex: 'value', 
      key: 'value',
      render: (v: number, record: any) => record.type === 2 ? `${v}折` : `¥${v}`
    },
    { title: '使用门槛', dataIndex: 'minAmount', key: 'minAmount', render: (m: number) => m ? `满¥${m}` : '无门槛' },
    { 
      title: '剩余/发行', 
      key: 'quantity',
      render: (_: any, record: any) => `${record.remainQuantity}/${record.quantity}`
    },
    { title: '有效期', key: 'validity', render: (_: any, record: any) => 
      `${dayjs(record.startTime).format('MM/DD')}-${dayjs(record.endTime).format('MM/DD')}`
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: any) => (
        <Popconfirm title="确定删除?" onConfirm={() => handleDelete(record.id)}>
          <Button size="small" type="link" danger icon={<DeleteOutlined />} />
        </Popconfirm>
      )
    }
  ]

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h1 style={{ fontSize: 20 }}>优惠券管理</h1>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>发行优惠券</Button>
      </div>

      <Card>
        <Table
          dataSource={data}
          columns={columns}
          loading={loading}
          rowKey="id"
          pagination={false}
        />
      </Card>

      <Modal
        title="发行优惠券"
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="优惠券名称" rules={[{ required: true }]}>
            <Input placeholder="如: 新人专享券" />
          </Form.Item>
          <Form.Item name="type" label="优惠券类型" rules={[{ required: true }]}>
            <Select placeholder="请选择类型">
              <Select.Option value={1}>满减券</Select.Option>
              <Select.Option value={2}>折扣券</Select.Option>
              <Select.Option value={3}>兑换券</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="value" label="面值" rules={[{ required: true }]}>
            <InputNumber min={0} style={{ width: '100%' }} placeholder="满减券填金额，折扣券填折扣率如85" />
          </Form.Item>
          <Form.Item name="minAmount" label="使用门槛（金额）">
            <InputNumber min={0} style={{ width: '100%' }} placeholder="0表示无门槛" />
          </Form.Item>
          <Form.Item name="quantity" label="发行数量" rules={[{ required: true }]}>
            <InputNumber min={1} style={{ width: '100%' }} placeholder="请输入发行数量" />
          </Form.Item>
          <Form.Item name="timeRange" label="有效期" rules={[{ required: true }]}>
            <RangePicker style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}