import { useState, useEffect } from 'react'
import { Table, Card, Button, Space, Tag, Modal, Form, Input, InputNumber, Select, DatePicker, message, Popconfirm } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, GiftOutlined } from '@ant-design/icons'
import request from '../../api'
import dayjs from 'dayjs'

const { RangePicker } = DatePicker

export default function PromotionList() {
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState([])
  const [modalVisible, setModalVisible] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form] = Form.useForm()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const res: any = await request.get('/promotions')
      setData(res.data)
    } catch (e) {
      console.error('加载失败', e)
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = () => {
    setEditingId(null)
    form.resetFields()
    setModalVisible(true)
  }

  const handleEdit = (record: any) => {
    setEditingId(record.id)
    form.setFieldsValue({
      name: record.name,
      type: record.type,
      rules: record.rules,
      startTime: record.startTime ? dayjs(record.startTime) : null,
      endTime: record.endTime ? dayjs(record.endTime) : null,
      status: record.status
    })
    setModalVisible(true)
  }

  const handleDelete = async (id: number) => {
    try {
      await request.delete(`/promotions/${id}`)
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
      
      if (editingId) {
        await request.put(`/promotions/${editingId}`, data)
        message.success('更新成功')
      } else {
        await request.post('/promotions', data)
        message.success('创建成功')
      }
      setModalVisible(false)
      loadData()
    } catch (e: any) {
      message.error(e.message || '操作失败')
    }
  }

  const typeNames: any = { 1: '满减', 2: '折扣', 3: '买赠', 4: '特价' }
  const typeColors: any = { 1: 'red', 2: 'blue', 3: 'green', 4: 'orange' }

  const columns = [
    { title: '活动名称', dataIndex: 'name', key: 'name' },
    { 
      title: '类型', 
      dataIndex: 'type', 
      key: 'type',
      render: (t: number) => <Tag color={typeColors[t]}>{typeNames[t] || '未知'}</Tag>
    },
    { title: '规则', dataIndex: 'rules', key: 'rules', ellipsis: true },
    { title: '开始时间', dataIndex: 'startTime', key: 'startTime', render: (d: string) => d ? dayjs(d).format('YYYY-MM-DD') : '-' },
    { title: '结束时间', dataIndex: 'endTime', key: 'endTime', render: (d: string) => d ? dayjs(d).format('YYYY-MM-DD') : '-' },
    { 
      title: '状态', 
      dataIndex: 'status', 
      key: 'status',
      render: (s: number) => <Tag color={s === 1 ? 'green' : 'default'}>{s === 1 ? '生效中' : '已禁用'}</Tag>
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: any) => (
        <Space>
          <Button size="small" type="link" icon={<EditOutlined />} onClick={() => handleEdit(record)} />
          <Popconfirm title="确定删除?" onConfirm={() => handleDelete(record.id)}>
            <Button size="small" type="link" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      )
    }
  ]

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h1 style={{ fontSize: 20 }}>促销活动</h1>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>新建活动</Button>
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
        title={editingId ? '编辑活动' : '新建活动'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="活动名称" rules={[{ required: true }]}>
            <Input placeholder="如: 满200减20" />
          </Form.Item>
          <Form.Item name="type" label="活动类型" rules={[{ required: true }]}>
            <Select placeholder="请选择类型">
              <Select.Option value={1}>满减</Select.Option>
              <Select.Option value={2}>折扣</Select.Option>
              <Select.Option value={3}>买赠</Select.Option>
              <Select.Option value={4}>特价</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="rules" label="活动规则">
            <Input.TextArea rows={3} placeholder="如: 消费满200元减20元" />
          </Form.Item>
          <Form.Item name="timeRange" label="活动时间">
            <RangePicker style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}