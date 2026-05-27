import { useState, useEffect } from 'react'
import { Tree, Button, Space, Modal, Form, Input, message, Popconfirm, Card } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import { categoryApi } from '../../api/product'
import PageContainer from '../../components/PageContainer'
import { mintTheme } from '../../theme/colors'

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
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '4px 0'
        }}>
          <span style={{
            flex: 1,
            color: mintTheme.primary[800],
            fontWeight: 500
          }}>
            {item.name}
          </span>
          <Space size="small">
            <Button
              size="small"
              type="link"
              icon={<EditOutlined />}
              onClick={() => handleEdit(item)}
              style={{ color: '#3b82f6' }}
            />
            <Popconfirm title="确定删除?" onConfirm={() => handleDelete(item.id)}>
              <Button
                size="small"
                type="link"
                danger
                icon={<DeleteOutlined />}
              />
            </Popconfirm>
          </Space>
        </div>
      ),
      children: item.children?.length > 0 ? renderTreeNodes(item.children) : undefined
    }))
  }

  return (
    <PageContainer
      title="商品分类"
      subtitle="Category Management"
      extra={
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleAdd}
          size="large"
          style={{
            background: mintTheme.gradients.primary,
            border: 'none',
            borderRadius: mintTheme.borderRadius.lg,
            fontWeight: 600,
            boxShadow: '0 4px 12px rgba(34, 197, 94, 0.3)'
          }}
        >
          新增分类
        </Button>
      }
    >
      <Card
        style={{
          ...mintTheme.glass,
          borderRadius: mintTheme.borderRadius.xl,
          border: `1px solid ${mintTheme.primary[200]}`
        }}
        bodyStyle={{ padding: 24 }}
      >
        <Tree
          treeData={renderTreeNodes(data)}
          selectable={false}
          showLine
          style={{ background: 'transparent' }}
        />
      </Card>

      <Modal
        title={editingId ? '编辑分类' : '新增分类'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="分类名称" rules={[{ required: true, message: '请输入分类名称' }]}>
            <Input placeholder="请输入分类名称" />
          </Form.Item>
          <Form.Item name="sort" label="排序" initialValue={0}>
            <Input type="number" placeholder="数值越小越靠前" />
          </Form.Item>
        </Form>
      </Modal>
    </PageContainer>
  )
}