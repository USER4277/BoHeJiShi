import { useState, useEffect } from 'react'
import { Table, Button, Space, Input, Tag, Modal, Form, message, Card } from 'antd'
import { PlusOutlined, SearchOutlined, UserOutlined } from '@ant-design/icons'
import { memberApi } from '../../api/member'
import { useNavigate } from 'react-router-dom'

export default function MemberList() {
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [keyword, setKeyword] = useState('')
  const [modalVisible, setModalVisible] = useState(false)
  const [form] = Form.useForm()
  const navigate = useNavigate()

  useEffect(() => {
    loadData()
  }, [page, keyword])

  const loadData = async () => {
    setLoading(true)
    try {
      const res: any = await memberApi.getList({ page, pageSize: 20, keyword })
      setData(res.data.list)
      setTotal(res.data.total)
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

  const handleSubmit = async () => {
    try {
      await memberApi.create(form.getFieldsValue())
      message.success('创建成功')
      setModalVisible(false)
      loadData()
    } catch (e: any) {
      message.error(e.message || '创建失败')
    }
  }

  const levelColors: any = {
    normal: 'default',
    silver: 'silver',
    gold: 'gold',
    diamond: 'blue'
  }

  const columns = [
    { title: '会员编号', dataIndex: 'code', key: 'code' },
    { title: '姓名', dataIndex: 'name', key: 'name' },
    { title: '手机号', dataIndex: 'phone', key: 'phone' },
    { 
      title: '等级', 
      dataIndex: 'level', 
      key: 'level',
      render: (l: string) => <Tag color={levelColors[l] || 'default'}>{l}</Tag>
    },
    { 
      title: '积分', 
      dataIndex: 'points', 
      key: 'points',
      render: (p: number) => p.toLocaleString()
    },
    { 
      title: '储值', 
      dataIndex: 'balance', 
      key: 'balance',
      render: (b: number) => `¥${b.toFixed(2)}`
    },
    { 
      title: '累计消费', 
      dataIndex: 'totalConsume', 
      key: 'totalConsume',
      render: (c: number) => `¥${c.toFixed(2)}`
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: any) => (
        <Button type="link" onClick={() => navigate(`/members/${record.id}`)}>
          查看详情
        </Button>
      )
    }
  ]

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h1 style={{ fontSize: 20 }}>会员管理</h1>
        <Space>
          <Input 
            placeholder="搜索会员" 
            prefix={<SearchOutlined />}
            value={keyword}
            onChange={e => setKeyword(e.target.value)}
            style={{ width: 200 }}
          />
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>新增会员</Button>
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
        title="新增会员"
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="姓名" rules={[{ required: true }]}>
            <Input placeholder="请输入姓名" />
          </Form.Item>
          <Form.Item name="phone" label="手机号" rules={[{ required: true }]}>
            <Input placeholder="请输入手机号" />
          </Form.Item>
          <Form.Item name="gender" label="性别">
            <Input type="number" placeholder="1-男 2-女" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}