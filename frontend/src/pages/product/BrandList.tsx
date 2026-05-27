import { useState, useEffect } from 'react'
import { Table, Button, Space, Input, Modal, Form, message, Popconfirm, Card } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons'
import request from '../../api'

export default function BrandList() {
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [keyword, setKeyword] = useState('')
  const [modalVisible, setModalVisible] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form] = Form.useForm()

  useEffect(() => {
    loadData()
  }, [page, keyword])

  const loadData = async () => {
    setLoading(true)
    try {
      const res: any = await request.get('/brands', { params: { page, pageSize: 20, keyword } })
      setData(res.data.list)
      setTotal(res.data.total)
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
      enName: record.enName,
      intro: record.intro,
      sort: record.sort,
      status: record.status
    })
    setModalVisible(true)
  }

  const handleDelete = async (id: number) => {
    try {
      await request.delete(`/brands/${id}`)
      message.success('删除成功')
      loadData()
    } catch (e) {
      message.error('删除失败')
    }
  }

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      if (editingId) {
        await request.put(`/brands/${editingId}`, values)
        message.success('更新成功')
      } else {
        await request.post('/brands', values)
        message.success('创建成功')
      }
      setModalVisible(false)
      loadData()
    } catch (e: any) {
      message.error(e.message || '操作失败')
    }
  }

  const columns = [
    { title: '品牌名称', dataIndex: 'name', key: 'name' },
    { title: '英文名', dataIndex: 'enName', key: 'enName' },
    { title: '简介', dataIndex: 'intro', key: 'intro', ellipsis: true },
    { title: '排序', dataIndex: 'sort', key: 'sort' },
    { 
      title: '状态', 
      dataIndex: 'status', 
      key: 'status',
      render: (s: number) => s === 1 ? '启用' : '禁用'
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
        <h1 style={{ fontSize: 20 }}>品牌管理</h1>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>新增品牌</Button>
      </div>

      <Table
        dataSource={data}
        columns={columns}
        loading={loading}
        rowKey="id"
        pagination={{
          current: page,
          total,
          onChange: setPage
        }}
      />

      <Modal
        title={editingId ? '编辑品牌' : '新增品牌'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="品牌名称" rules={[{ required: true }]}>
            <Input placeholder="请输入品牌名称" />
          </Form.Item>
          <Form.Item name="enName" label="英文名">
            <Input placeholder="请输入英文名" />
          </Form.Item>
          <Form.Item name="intro" label="简介">
            <Input.TextArea rows={3} placeholder="请输入品牌简介" />
          </Form.Item>
          <Form.Item name="sort" label="排序" initialValue={0}>
            <Input type="number" placeholder="数值越小越靠前" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}