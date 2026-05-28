import { useState, useEffect } from 'react'
import { Card, Descriptions, Table, Button, Space, Tag, Modal, Form, Input, InputNumber, message, Tabs, Radio, DatePicker, Select } from 'antd'
import { ArrowLeftOutlined, PoundOutlined, GiftOutlined, HistoryOutlined, EditOutlined } from '@ant-design/icons'
import { useNavigate, useParams } from 'react-router-dom'
import { memberApi } from '../../api/member'
import dayjs from 'dayjs'

export default function MemberDetail() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [member, setMember] = useState<any>(null)
  const [pointsLogs, setPointsLogs] = useState<any[]>([])
  const [balanceLogs, setBalanceLogs] = useState<any[]>([])
  const [rechargeModalVisible, setRechargeModalVisible] = useState(false)
  const [pointsModalVisible, setPointsModalVisible] = useState(false)
  const [editModalVisible, setEditModalVisible] = useState(false)
  const [form] = Form.useForm()
  const [editForm] = Form.useForm()

  const levelNames = ['普通', '银卡', '金卡', '钻石']
  const levelColors = ['', 'default', 'silver', 'gold', 'gold']

  useEffect(() => {
    if (id) loadData()
  }, [id])

  const loadData = async () => {
    try {
      const res: any = await memberApi.getDetail(parseInt(id!))
      setMember(res.data)
    } catch (e) {
      console.error('加载会员信息失败', e)
    }
  }

  const loadPointsLogs = async () => {
    try {
      const res: any = await memberApi.getPoints(parseInt(id!))
      setPointsLogs(res.data)
    } catch (e) {
      console.error('加载积分记录失败', e)
    }
  }

  const handleRecharge = async () => {
    try {
      const values = await form.validateFields()
      await memberApi.recharge(parseInt(id!), values)
      message.success('充值成功')
      setRechargeModalVisible(false)
      form.resetFields()
      loadData()
    } catch (e: any) {
      message.error(e.message || '充值失败')
    }
  }

  const handlePointsAdjust = async () => {
    try {
      const values = await form.validateFields()
      await memberApi.adjustPoints(parseInt(id!), values)
      message.success('积分调整成功')
      setPointsModalVisible(false)
      form.resetFields()
      loadData()
      loadPointsLogs()
    } catch (e: any) {
      message.error(e.message || '调整失败')
    }
  }

  const handleEdit = () => {
    editForm.setFieldsValue({
      name: member.name,
      phone: member.phone,
      gender: member.gender,
      birthday: member.birthday ? dayjs(member.birthday) : null,
      level: member.level,
      status: member.status
    })
    setEditModalVisible(true)
  }

  const handleEditSubmit = async () => {
    try {
      const values = await editForm.validateFields()

      // 处理 birthday 字段
      if (values.birthday) {
        values.birthday = values.birthday.format('YYYY-MM-DD')
      }

      await memberApi.update(parseInt(id!), values)
      message.success('更新成功')
      setEditModalVisible(false)
      loadData()
    } catch (e: any) {
      message.error(e.message || '更新失败')
    }
  }

  const pointsColumns = [
    { title: '时间', dataIndex: 'createdAt', key: 'createdAt', render: (d: string) => dayjs(d).format('YYYY-MM-DD HH:mm') },
    { 
      title: '类型', 
      dataIndex: 'changeType', 
      key: 'changeType',
      render: (t: string) => {
        const typeMap: any = { earn: '获得', refund: '返还', adjust: '调整', exchange: '兑换' }
        return <Tag color={t === 'earn' ? 'green' : 'red'}>{typeMap[t] || t}</Tag>
      }
    },
    { 
      title: '积分', 
      dataIndex: 'points', 
      key: 'points',
      render: (p: number) => <span style={{ color: p > 0 ? '#52c41a' : '#ff4d4f', fontWeight: 'bold' }}>{p > 0 ? `+${p}` : p}</span>
    },
    { title: '余额', dataIndex: 'balance', key: 'balance' },
    { title: '说明', dataIndex: 'description', key: 'description', ellipsis: true }
  ]

  if (!member) return null

  return (
    <div>
      <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/members')} style={{ marginBottom: 16 }}>
        返回
      </Button>

      <Card title="会员信息" style={{ marginBottom: 16 }}>
        <Descriptions column={4}>
          <Descriptions.Item label="会员编号">{member.code}</Descriptions.Item>
          <Descriptions.Item label="姓名">{member.name}</Descriptions.Item>
          <Descriptions.Item label="手机号">{member.phone}</Descriptions.Item>
          <Descriptions.Item label="性别">{member.gender === 1 ? '男' : member.gender === 2 ? '女' : '-'}</Descriptions.Item>
          <Descriptions.Item label="等级">
            <Tag color={levelColors[member.level] || 'default'}>{levelNames[member.level - 1] || '普通'}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="生日">{member.birthday || '-'}</Descriptions.Item>
          <Descriptions.Item label="储值余额">
            <span style={{ color: '#ff4d4f', fontWeight: 'bold' }}>¥{member.balance || 0}</span>
          </Descriptions.Item>
          <Descriptions.Item label="积分余额">
            <span style={{ color: '#52c41a', fontWeight: 'bold' }}>{member.points || 0}</span>
          </Descriptions.Item>
          <Descriptions.Item label="累计消费">
            <span style={{ fontWeight: 'bold' }}>¥{member.totalConsume || 0}</span>
          </Descriptions.Item>
          <Descriptions.Item label="注册时间">{dayjs(member.createdAt).format('YYYY-MM-DD HH:mm')}</Descriptions.Item>
        </Descriptions>
        
        <div style={{ marginTop: 16 }}>
          <Space>
            <Button icon={<EditOutlined />} onClick={handleEdit}>
              编辑信息
            </Button>
            <Button type="primary" icon={<PoundOutlined />} onClick={() => setRechargeModalVisible(true)}>
              储值充值
            </Button>
            <Button icon={<GiftOutlined />} onClick={() => { setPointsModalVisible(true); loadPointsLogs(); }}>
              积分管理
            </Button>
          </Space>
        </div>
      </Card>

      <Card title="消费记录">
        <Table
          dataSource={member.orders || []}
          columns={[
            { title: '订单号', dataIndex: 'orderNo', key: 'orderNo', render: (no: string) => <span style={{ fontFamily: 'monospace' }}>{no}</span> },
            { title: '金额', dataIndex: 'payAmount', key: 'payAmount', render: (a: number) => `¥${a}` },
            { title: '获得积分', dataIndex: 'pointsEarned', key: 'pointsEarned', render: (p: number) => `+${p || 0}` },
            { 
              title: '状态', 
              dataIndex: 'status', 
              key: 'status',
              render: (s: number) => <Tag color={s === 1 ? 'green' : 'default'}>{s === 1 ? '已完成' : '已退货'}</Tag>
            },
            { title: '时间', dataIndex: 'createdAt', key: 'createdAt', render: (d: string) => dayjs(d).format('YYYY-MM-DD HH:mm') }
          ]}
          rowKey="id"
          pagination={false}
          size="small"
        />
      </Card>

      {/* 充值弹窗 */}
      <Modal
        title="储值充值"
        open={rechargeModalVisible}
        onOk={handleRecharge}
        onCancel={() => setRechargeModalVisible(false)}
      >
        <Form form={form} layout="vertical">
          <Form.Item label="当前余额">
            <span style={{ fontSize: 18, fontWeight: 'bold', color: '#ff4d4f' }}>¥{member.balance || 0}</span>
          </Form.Item>
          <Form.Item name="amount" label="充值金额" rules={[{ required: true, min: 0.01 }]}>
            <InputNumber min={0.01} style={{ width: '100%' }} size="large" prefix="¥" placeholder="请输入充值金额" />
          </Form.Item>
          <Form.Item name="payWay" label="支付方式" initialValue="cash">
            <Input placeholder="如: 现金、微信、支付宝" />
          </Form.Item>
          <div style={{ color: '#999', fontSize: 12 }}>
            充值金额将直接添加到会员储值余额中
          </div>
        </Form>
      </Modal>

      {/* 编辑信息弹窗 */}
      <Modal
        title="编辑会员信息"
        open={editModalVisible}
        onOk={handleEditSubmit}
        onCancel={() => setEditModalVisible(false)}
        width={600}
      >
        <Form form={editForm} layout="vertical">
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
                editForm.setFieldValue('phone', value)
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
          <Form.Item name="level" label="会员等级">
            <Select>
              <Select.Option value="normal">普通会员</Select.Option>
              <Select.Option value="silver">银卡会员</Select.Option>
              <Select.Option value="gold">金卡会员</Select.Option>
              <Select.Option value="diamond">钻石会员</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="status" label="状态">
            <Radio.Group>
              <Radio value={1}>正常</Radio>
              <Radio value={0}>停用</Radio>
            </Radio.Group>
          </Form.Item>
        </Form>
      </Modal>

      {/* 积分管理弹窗 */}
      <Modal
        title="积分管理"
        open={pointsModalVisible}
        onCancel={() => setPointsModalVisible(false)}
        footer={null}
        width={800}
      >
        <Tabs 
          items={[
            {
              key: 'adjust',
              label: '积分调整',
              children: (
                <Form form={form} layout="vertical">
                  <Form.Item label="当前积分">
                    <span style={{ fontSize: 16, fontWeight: 'bold', color: '#52c41a' }}>{member.points || 0}</span>
                  </Form.Item>
                  <Form.Item name="points" label="调整积分" rules={[{ required: true }]}>
                    <InputNumber style={{ width: '100%' }} placeholder="正数增加，负数扣减" />
                  </Form.Item>
                  <Form.Item name="description" label="说明">
                    <Input.TextArea rows={2} placeholder="如: 生日双倍积分奖励" />
                  </Form.Item>
                  <Button type="primary" onClick={handlePointsAdjust}>确认调整</Button>
                </Form>
              )
            },
            {
              key: 'history',
              label: '积分记录',
              children: (
                <Table
                  dataSource={pointsLogs}
                  columns={pointsColumns}
                  rowKey="id"
                  pagination={{ pageSize: 10 }}
                  size="small"
                />
              )
            }
          ]}
        />
      </Modal>
    </div>
  )
}