import { useState, useEffect } from 'react'
import { Card, Descriptions, Table, Button, Space, Tag, Modal, Form, Input, InputNumber, message, Tabs } from 'antd'
import { ArrowLeftOutlined, PoundOutlined, GiftOutlined, HistoryOutlined } from '@ant-design/icons'
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
  const [form] = Form.useForm()

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