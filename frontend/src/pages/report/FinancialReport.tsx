import { useState, useEffect } from 'react'
import { Card, Table, Button, Space, DatePicker, Modal, message, Descriptions, Row, Col, Statistic, Tabs } from 'antd'
import { FileTextOutlined, CheckCircleOutlined, DollarOutlined } from '@ant-design/icons'
import request from '../../api'
import dayjs from 'dayjs'

const { RangePicker } = DatePicker

export default function FinancialReport() {
  const [loading, setLoading] = useState(false)
  const [settlements, setSettlements] = useState<any[]>([])
  const [modalVisible, setModalVisible] = useState(false)
  const [currentSettlement, setCurrentSettlement] = useState<any>(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const res: any = await request.get('/reports/settlement', { params: { pageSize: 30 } })
      setSettlements(res.data?.list || [])
    } catch (e) {
      console.error('加载失败', e)
    } finally {
      setLoading(false)
    }
  }

  const handleSettlement = async (date: string) => {
    try {
      await request.post('/reports/settlement', { date })
      message.success('日结成功')
      loadData()
    } catch (e: any) {
      message.error(e.message || '日结失败')
    }
  }

  const handleViewDetail = (record: any) => {
    setCurrentSettlement(record)
    setModalVisible(true)
  }

  const columns = [
    { 
      title: '结算日期', 
      dataIndex: 'settlementDate', 
      key: 'settlementDate',
      render: (d: string) => dayjs(d).format('YYYY-MM-DD')
    },
    { title: '订单数', dataIndex: 'salesCount', key: 'salesCount' },
    { title: '销售金额', dataIndex: 'salesAmount', key: 'salesAmount', render: (a: number) => `¥${a?.toFixed(2)}` },
    { title: '现金', dataIndex: 'cashAmount', key: 'cashAmount', render: (a: number) => `¥${a?.toFixed(2)}` },
    { title: '微信', dataIndex: 'wechatAmount', key: 'wechatAmount', render: (a: number) => `¥${a?.toFixed(2)}` },
    { title: '支付宝', dataIndex: 'alipayAmount', key: 'alipayAmount', render: (a: number) => `¥${a?.toFixed(2)}` },
    { title: '折扣', dataIndex: 'discountAmount', key: 'discountAmount', render: (a: number) => a ? `-¥${a.toFixed(2)}` : '-' },
    { title: '退款', dataIndex: 'refundAmount', key: 'refundAmount', render: (a: number) => a ? `¥${a.toFixed(2)}` : '-' },
    { 
      title: '状态', 
      dataIndex: 'status', 
      key: 'status',
      render: (s: number) => <span style={{ color: s === 1 ? '#52c41a' : '#999' }}>
        {s === 1 ? '✓ 已结' : '未结'}
      </span>
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: any) => (
        <Space>
          <Button size="small" type="link" icon={<FileTextOutlined />} onClick={() => handleViewDetail(record)}>详情</Button>
          {record.status !== 1 && (
            <Button size="small" type="link" icon={<CheckCircleOutlined />} onClick={() => handleSettlement(record.settlementDate)}>
              日结
            </Button>
          )}
        </Space>
      )
    }
  ]

  // 计算汇总
  const totalSales = settlements.reduce((sum, s) => sum + (s.salesAmount || 0), 0)
  const totalCount = settlements.reduce((sum, s) => sum + (s.salesCount || 0), 0)
  const totalCash = settlements.reduce((sum, s) => sum + (s.cashAmount || 0), 0)

  return (
    <div>
      <h1 style={{ fontSize: 20, marginBottom: 16 }}>财务报表</h1>
      
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Card>
            <Statistic title="累计销售" value={totalSales} prefix={<DollarOutlined />} precision={2} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="累计订单" value={totalCount} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="现金收款" value={totalCash} precision={2} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="月结次数" value={settlements.filter((s: any) => s.status === 1).length} />
          </Card>
        </Col>
      </Row>

      <Card>
        <Table
          dataSource={settlements}
          columns={columns}
          loading={loading}
          rowKey="id"
          pagination={{ pageSize: 15 }}
        />
      </Card>

      <Modal
        title="日结详情"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={600}
      >
        {currentSettlement && (
          <div>
            <Descriptions column={2} bordered size="small">
              <Descriptions.Item label="结算日期">
                {dayjs(currentSettlement.settlementDate).format('YYYY-MM-DD')}
              </Descriptions.Item>
              <Descriptions.Item label="状态">
                <span style={{ color: currentSettlement.status === 1 ? '#52c41a' : '#999' }}>
                  {currentSettlement.status === 1 ? '✓ 已结' : '未结'}
                </span>
              </Descriptions.Item>
              <Descriptions.Item label="订单数">{currentSettlement.salesCount}</Descriptions.Item>
              <Descriptions.Item label="退货数">{currentSettlement.refundCount}</Descriptions.Item>
            </Descriptions>
            
            <h4 style={{ marginTop: 16 }}>收款明细</h4>
            <Table
              dataSource={[
                { way: '现金', amount: currentSettlement.cashAmount },
                { way: '微信支付', amount: currentSettlement.wechatAmount },
                { way: '支付宝', amount: currentSettlement.alipayAmount }
              ]}
              columns={[
                { title: '支付方式', dataIndex: 'way', key: 'way' },
                { title: '金额', dataIndex: 'amount', key: 'amount', render: (a: number) => `¥${a?.toFixed(2) || 0}` }
              ]}
              rowKey="way"
              pagination={false}
              size="small"
            />
            
            <div style={{ marginTop: 16, textAlign: 'right', fontSize: 18 }}>
              <span>销售总额: </span>
              <span style={{ fontWeight: 'bold', color: '#ff4d4f' }}>¥{currentSettlement.salesAmount?.toFixed(2)}</span>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}