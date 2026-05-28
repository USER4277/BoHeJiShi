import { useState, useEffect } from 'react'
import { Table, Button, Space, Modal, Form, Input, Select, message, Popconfirm, Card, Upload } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, UploadOutlined } from '@ant-design/icons'
import { brandApi, categoryApi } from '../../api/product'
import { mintTheme } from '../../theme/colors'

export default function BrandManagement() {
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState([])
  const [categories, setCategories] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [modalVisible, setModalVisible] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form] = Form.useForm()

  useEffect(() => {
    loadData()
    loadCategories()
  }, [page])

  const loadData = async () => {
    setLoading(true)
    try {
      const res: any = await brandApi.getList({ page, pageSize: 20 })
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
      const res: any = await categoryApi.getList()
      setCategories(res.data)
    } catch (e) {
      console.error('加载分类失败', e)
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
      categoryId: record.categoryId,
      logo: record.logo,
      sort: record.sort
    })
    setModalVisible(true)
  }

  const handleDelete = async (id: number) => {
    try {
      await brandApi.delete(id)
      message.success('删除成功')
      loadData()
    } catch (e: any) {
      message.error(e.response?.data?.message || '删除失败')
    }
  }

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      if (editingId) {
        await brandApi.update(editingId, values)
        message.success('更新成功')
      } else {
        await brandApi.create(values)
        message.success('创建成功')
      }
      setModalVisible(false)
      loadData()
    } catch (e: any) {
      message.error(e.response?.data?.message || '操作失败')
    }
  }

  const flattenCategories = (cats: any[]): any[] => {
    let result: any[] = []
    cats.forEach(cat => {
      result.push(cat)
      if (cat.children && cat.children.length > 0) {
        result = result.concat(flattenCategories(cat.children))
      }
    })
    return result
  }

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80
    },
    {
      title: '品牌名称',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => (
        <span style={{ color: mintTheme.primary[800], fontWeight: 500 }}>{text}</span>
      )
    },
    {
      title: '所属分类',
      dataIndex: 'category',
      key: 'category',
      render: (cat: any) => (
        <span style={{ color: mintTheme.primary[600] }}>{cat?.name || '-'}</span>
      )
    },
    {
      title: '排序',
      dataIndex: 'sort',
      key: 'sort',
      width: 100,
      align: 'center' as const
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (d: string) => (
        <span style={{ color: '#6b7280' }}>
          {new Date(d).toLocaleDateString('zh-CN')}
        </span>
      )
    },
    {
      title: '操作',
      key: 'action',
      align: 'center' as const,
      width: 120,
      render: (_: any, record: any) => (
        <Space>
          <Button
            size="small"
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            style={{ color: '#3b82f6' }}
          />
          <Popconfirm title="确定删除?" onConfirm={() => handleDelete(record.id)}>
            <Button
              size="small"
              type="link"
              danger
              icon={<DeleteOutlined />}
            />
          </Popconfirm>
        </Space>
      )
    }
  ]

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
        <div></div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleAdd}
          style={{
            background: mintTheme.gradients.primary,
            border: 'none',
            borderRadius: mintTheme.borderRadius.lg,
            fontWeight: 600
          }}
        >
          新增品牌
        </Button>
      </div>

      <Table
        dataSource={data}
        columns={columns}
        loading={loading}
        rowKey="id"
        pagination={{
          current: page,
          total,
          pageSize: 20,
          onChange: setPage,
          showTotal: (total) => `共 ${total} 条记录`
        }}
      />

      <Modal
        title={editingId ? '编辑品牌' : '新增品牌'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        width={600}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 24 }}>
          <Form.Item
            name="name"
            label="品牌名称"
            rules={[{ required: true, message: '请输入品牌名称' }]}
          >
            <Input placeholder="请输入品牌名称" />
          </Form.Item>

          <Form.Item
            name="categoryId"
            label="所属分类"
            rules={[{ required: true, message: '请选择所属分类' }]}
          >
            <Select
              placeholder="请选择分类"
              options={flattenCategories(categories).map(cat => ({
                label: cat.name,
                value: cat.id
              }))}
            />
          </Form.Item>

          <Form.Item name="logo" label="品牌Logo">
            <Input placeholder="Logo URL（选填）" />
          </Form.Item>

          <Form.Item name="sort" label="排序" initialValue={0}>
            <Input type="number" placeholder="数值越小越靠前" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
