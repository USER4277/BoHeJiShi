import { useState, useEffect } from 'react'
import { Table, Button, Space, Input, Tag, Modal, Form, message, Card, Select, Radio, DatePicker } from 'antd'
import { PlusOutlined, SearchOutlined, UserOutlined, EyeOutlined } from '@ant-design/icons'
import { memberApi } from '../../api/member'
import { useNavigate } from 'react-router-dom'
import PageContainer from '../../components/PageContainer'
import { mintTheme } from '../../theme/colors'
import dayjs from 'dayjs'

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
  }, [page])

  useEffect(() => {
    if (keyword) {
      const timer = setTimeout(() => {
        setPage(1)
        loadData()
      }, 500)
      return () => clearTimeout(timer)
    } else {
      loadData()
    }
  }, [keyword])

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
      const values = await form.validateFields()

      // 处理 birthday 字段
      if (values.birthday) {
        values.birthday = values.birthday.format('YYYY-MM-DD')
      }

      await memberApi.create(values)
      message.success('创建成功')
      setModalVisible(false)
      loadData()
    } catch (e: any) {
      message.error(e.message || '创建失败')
    }
  }

  const levelColors: any = {
    normal: 'default',
    silver: '#c0c0c0',
    gold: 'gold',
    diamond: 'blue'
  }

  const levelNames: any = {
    normal: '普通会员',
    silver: '银卡会员',
    gold: '金卡会员',
    diamond: '钻石会员'
  }

  const columns = [
    {
      title: '会员编号',
      dataIndex: 'code',
      key: 'code',
      render: (text: string) => (
        <span style={{ color: mintTheme.primary[600], fontFamily: 'monospace' }}>{text}</span>
      )
    },
    {
      title: '姓名',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => (
        <span style={{ color: mintTheme.primary[800], fontWeight: 500 }}>{text}</span>
      )
    },
    {
      title: '手机号',
      dataIndex: 'phone',
      key: 'phone',
      render: (text: string) => (
        <span style={{ fontFamily: 'monospace' }}>{text}</span>
      )
    },
    {
      title: '等级',
      dataIndex: 'level',
      key: 'level',
      align: 'center' as const,
      render: (l: string) => (
        <Tag
          color={levelColors[l] || 'default'}
          style={{
            borderRadius: mintTheme.borderRadius.md,
            padding: '4px 12px'
          }}
        >
          {levelNames[l] || l}
        </Tag>
      )
    },
    {
      title: '积分',
      dataIndex: 'points',
      key: 'points',
      align: 'right' as const,
      render: (p: number) => (
        <span style={{ color: mintTheme.primary[600], fontWeight: 500 }}>
          {p?.toLocaleString() || 0}
        </span>
      )
    },
    {
      title: '储值',
      dataIndex: 'balance',
      key: 'balance',
      align: 'right' as const,
      render: (b: number) => (
        <span style={{ color: '#f97316', fontWeight: 'bold' }}>
          ¥{(b || 0).toFixed(2)}
        </span>
      )
    },
    {
      title: '累计消费',
      dataIndex: 'totalConsume',
      key: 'totalConsume',
      align: 'right' as const,
      render: (c: number) => (
        <span style={{ color: '#6b7280' }}>¥{(c || 0).toFixed(2)}</span>
      )
    },
    {
      title: '操作',
      key: 'action',
      align: 'center' as const,
      width: 120,
      render: (_: any, record: any) => (
        <Button
          type="link"
          icon={<EyeOutlined />}
          onClick={() => navigate(`/members/${record.id}`)}
          style={{ color: '#3b82f6' }}
        >
          详情
        </Button>
      )
    }
  ]

  return (
    <PageContainer
      title="会员管理"
      subtitle="Member Management"
      extra={
        <Space size="middle">
          <Input
            placeholder="搜索会员姓名或手机号"
            prefix={<SearchOutlined />}
            value={keyword}
            onChange={e => setKeyword(e.target.value)}
            allowClear
            style={{
              width: 240,
              borderRadius: mintTheme.borderRadius.lg
            }}
            size="large"
          />
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
            新增会员
          </Button>
        </Space>
      }
    >
      <Card
        style={{
          ...mintTheme.glass,
          borderRadius: mintTheme.borderRadius.xl,
          border: `1px solid ${mintTheme.primary[200]}`
        }}
        bodyStyle={{ padding: 0 }}
      >
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
            showTotal: (total) => (
              <span style={{ color: mintTheme.primary[600] }}>共 {total} 位会员</span>
            ),
            showSizeChanger: true,
            pageSizeOptions: ['10', '20', '50', '100']
          }}
        />
      </Card>

      <Modal
        title="新增会员"
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        width={500}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="姓名"
            rules={[{ required: true, message: '请输入姓名' }]}
          >
            <Input placeholder="请输入会员姓名" />
          </Form.Item>
          <Form.Item
            name="phone"
            label="手机号"
            rules={[
              { required: true, message: '请输入手机号' },
              {
                pattern: /^1[3-9]\d{9}$/,
                message: '请输入正确的11位手机号码'
              },
              {
                validator: (_, value) => {
                  if (!value) return Promise.resolve()
                  // 验证手机号格式
                  if (!/^1[3-9]\d{9}$/.test(value)) {
                    return Promise.reject(new Error('手机号格式不正确，必须是1开头的11位数字'))
                  }
                  // 验证是否全是相同数字
                  if (/^(\d)\1{10}$/.test(value)) {
                    return Promise.reject(new Error('手机号格式不正确'))
                  }
                  return Promise.resolve()
                }
              }
            ]}
          >
            <Input
              placeholder="请输入11位手机号"
              maxLength={11}
              onChange={(e) => {
                // 只允许输入数字
                const value = e.target.value.replace(/\D/g, '')
                form.setFieldValue('phone', value)
              }}
            />
          </Form.Item>
          <Form.Item name="gender" label="性别">
            <Radio.Group>
              <Radio value={1}>男</Radio>
              <Radio value={2}>女</Radio>
            </Radio.Group>
          </Form.Item>
          <Form.Item name="birthday" label="生日">
            <DatePicker
              style={{ width: '100%' }}
              placeholder="请选择生日"
              format="YYYY-MM-DD"
            />
          </Form.Item>
        </Form>
      </Modal>
    </PageContainer>
  )
}