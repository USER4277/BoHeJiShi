import { useState, useEffect } from 'react'
import { Tree, Button, Space, Modal, Form, Input, message, Popconfirm } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import { categoryApi } from '../../api/product'

export default function CategoryList() {
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
      const res: any = await categoryApi.getList()
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
    form.setFieldsValue({ name: record.name, sort: record.sort })
    setModalVisible(true)
  }

  const handleDelete = async (id: number) => {
    try {
      await categoryApi.delete(id)
      message.success('删除成功')
      loadData()
    } catch (e: any) {
      message.error(e.message || '删除失败')
    }
  }

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      if (editingId) {
        await categoryApi.update(editingId, values)
        message.success('更新成功')
      } else {
        await categoryApi.create(values)
        message.success('创建成功')
      }
      setModalVisible(false)
      loadData()
    } catch (e) {
      console.error('提交失败', e)
    }
  }

  const renderTreeNodes = (data: any[]) => {
    return data.map(item => ({
      key: item.id,
      title: (
        <Space>
          <span>{item.name}</span>
          <Button size="small" type="link" icon={<EditOutlined />} onClick={() => handleEdit(item)} />
          <Popconfirm title="确定删除?" onConfirm={() => handleDelete(item.id)}>
            <Button size="small" type="link" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
      children: item.children?.length > 0 ? renderTreeNodes(item.children) : undefined
    }))
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h1 style={{ fontSize: 20 }}>商品分类</h1>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>新增分类</Button>
      </div>

      <Tree
        treeData={renderTreeNodes(data)}
        selectable={false}
      />

      <Modal
        title={editingId ? '编辑分类' : '新增分类'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="分类名称" rules={[{ required: true }]}>
            <Input placeholder="请输入分类名称" />
          </Form.Item>
          <Form.Item name="sort" label="排序" initialValue={0}>
            <Input type="number" placeholder="数值越小越靠前" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}