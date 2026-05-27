import { useState, useEffect } from 'react'
import { Table, Button, Space, Input, Tag, Modal, Form, message, Popconfirm, Select } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, LockOutlined } from '@ant-design/icons'
import { systemApi } from '../../api/system'

export default function UserList() {
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [keyword, setKeyword] = useState('')
  const [modalVisible, setModalVisible] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form] = Form.useForm()
  const [resetModalVisible, setResetModalVisible] = useState(false)
  const [resetUserId, setResetUserId] = useState<number | null>(null)

  useEffect(() => {
    loadData()
  }, [page, keyword])

  const loadData = async () => {
    setLoading(true)
    try {
      const res: any = await systemApi.getUsers({ page, pageSize: 20, keyword })
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
      username: record.username,
      realName: record.realName,
      phone: record.phone,
      email: record.email,
      role: record.role,
      status: record.status
    })
    setModalVisible(true)
  }

  const handleResetPassword = async (id: number) => {
    try {
      await systemApi.resetPassword(id, '123456')
      message.success('密码已重置为: 123456')
    } catch (e) {
      message.error('重置失败')
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await systemApi.updateUser(id, { status: -1 } as any)
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
        await systemApi.updateUser(editingId, values)
        message.success('更新成功')
      } else {
        await systemApi.createUser(values)
        message.success('创建成功')
      }
      setModalVisible(false)
      loadData()
    } catch (e: any) {
      message.error(e.message || '操作失败')
    }
  }

  const roleColors: any = {
    admin: 'red',
    manager: 'blue',
    staff: 'green'
  }

  const columns = [
    { title: '用户名', dataIndex: 'username', key: 'username' },
    { title: '姓名', dataIndex: 'realName', key: 'realName' },
    { title: '手机号', dataIndex: 'phone', key: 'phone' },
    { title: '邮箱', dataIndex: 'email', key: 'email' },
    { 
      title: '角色', 
      dataIndex: 'role', 
      key: 'role',
      render: (r: string) => <Tag color={roleColors[r] || 'default'}>{r?.toUpperCase()}</Tag>
    },
    { 
      title: '状态', 
      dataIndex: 'status', 
      key: 'status',
      render: (s: number) => <Tag color={s === 1 ? 'green' : 'red'}>{s === 1 ? '启用' : '禁用'}</Tag>
    },
    { title: '创建时间', dataIndex: 'createdAt', key: 'createdAt', render: (d: string) => new Date(d).toLocaleString() },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: any) => (
        <Space>
          <Button size="small" type="link" icon={<EditOutlined />} onClick={() => handleEdit(record)} />
          <Button size="small" type="link" icon={<LockOutlined />} onClick={() => handleResetPassword(record.id)} />
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
        <h1 style={{ fontSize: 20 }}>用户管理</h1>
        <Space>
          <Input 
            placeholder="搜索用户" 
            prefix={<SearchOutlined />}
            value={keyword}
            onChange={e => setKeyword(e.target.value)}
            style={{ width: 200 }}
          />
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>新增用户</Button>
        </Space>
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
        title={editingId ? '编辑用户' : '新增用户'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
      >
        <Form form={form} layout="vertical">
          {!editingId && (
            <>
              <Form.Item name="username" label="用户名" rules={[{ required: true }]}>
                <Input placeholder="请输入用户名" />
              </Form.Item>
              <Form.Item name="password" label="密码" rules={[{ required: true }]}>
                <Input.Password placeholder="请输入密码" />
              </Form.Item>
            </>
          )}
          <Form.Item name="realName" label="姓名" rules={[{ required: true }]}>
            <Input placeholder="请输入姓名" />
          </Form.Item>
          <Form.Item name="phone" label="手机号">
            <Input placeholder="请输入手机号" />
          </Form.Item>
          <Form.Item name="email" label="邮箱">
            <Input placeholder="请输入邮箱" />
          </Form.Item>
          <Form.Item name="role" label="角色" rules={[{ required: true }]}>
            <Select>
              <Select.Option value="admin">超级管理员</Select.Option>
              <Select.Option value="manager">店长</Select.Option>
              <Select.Option value="staff">收银员</Select.Option>
            </Select>
          </Form.Item>
          {editingId && (
            <Form.Item name="status" label="状态">
              <Select>
                <Select.Option value={1}>启用</Select.Option>
                <Select.Option value={0}>禁用</Select.Option>
              </Select>
            </Form.Item>
          )}
        </Form>
      </Modal>
    </div>
  )
}