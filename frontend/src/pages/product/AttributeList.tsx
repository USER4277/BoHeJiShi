import { useState, useEffect } from 'react'
import { Table, Button, Space, Modal, Form, Input, message, Popconfirm, Card, Tag } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import { categoryApi } from '../../api/product'
import request from '../../api'

export default function AttributeList() {
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState([])
  const [categories, setCategories] = useState([])
  const [modalVisible, setModalVisible] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form] = Form.useForm()
  const [valuesInput, setValuesInput] = useState('')

  useEffect(() => {
    loadCategories()
    loadData()
  }, [])

  const loadCategories = async () => {
    try {
      const res: any = await categoryApi.getList()
      setCategories(res.data)
    } catch (e) {
      console.error('加载分类失败', e)
    }
  }

  const loadData = async () => {
    setLoading(true)
    try {
      const res: any = await request.get('/attributes')
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
    setValuesInput('')
    setModalVisible(true)
  }

  const handleEdit = (record: any) => {
    setEditingId(record.id)
    form.setFieldsValue({
      name: record.name,
      categoryId: record.categoryId
    })
    setValuesInput(record.values?.map((v: any) => v.value).join(',') || '')
    setModalVisible(true)
  }

  const handleDelete = async (id: number) => {
    try {
      await request.delete(`/attributes/${id}`)
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
        values: valuesInput.split(',').map(v => v.trim()).filter(v => v)
      }
      
      if (editingId) {
        await request.put(`/attributes/${editingId}`, data)
        message.success('更新成功')
      } else {
        await request.post('/attributes', data)
        message.success('创建成功')
      }
      setModalVisible(false)
      loadData()
    } catch (e: any) {
      message.error(e.message || '操作失败')
    }
  }

  const columns = [
    { title: '属性名称', dataIndex: 'name', key: 'name' },
    { title: '所属分类', dataIndex: 'category', key: 'category', render: (c: any) => c?.name || '-' },
    { 
      title: '可选值', 
      key: 'values',
      render: (_: any, record: any) => (
        <Space>
          {record.values?.map((v: any, i: number) => (
            <Tag key={i}>{v.value}</Tag>
          ))}
        </Space>
      )
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
        <h1 style={{ fontSize: 20 }}>商品属性模板</h1>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>新增属性</Button>
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
        title={editingId ? '编辑属性' : '新增属性'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="属性名称" rules={[{ required: true }]}>
            <Input placeholder="如: 颜色、尺寸" />
          </Form.Item>
          <Form.Item name="categoryId" label="所属分类">
            <select className="ant-input">
              <option value="">请选择分类</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </Form.Item>
          <Form.Item label="可选值(逗号分隔)">
            <Input
              value={valuesInput}
              onChange={e => setValuesInput(e.target.value)}
              placeholder="如: 红色,蓝色,绿色"
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}