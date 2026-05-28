import { useState, useEffect } from 'react'
import { Card, Row, Col, Statistic, Table, Spin } from 'antd'
import {
  DollarOutlined,
  ShoppingOutlined,
  TeamOutlined,
  WarningOutlined,
  RiseOutlined,
  FallOutlined
} from '@ant-design/icons'
import ReactECharts from 'echarts-for-react'
import { reportApi } from '../api/report'
import { mintTheme } from '../theme/colors'

export default function Dashboard() {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<any>({
    today: { sales: 0, count: 0, quantity: 0 },
    month: { sales: 0, count: 0 },
    newMembers: 0,
    inventoryWarnings: 0,
    hotProducts: [],
    refundLeaderboard: []
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const res: any = await reportApi.getDashboard()
      setData(res.data)
    } catch (e) {
      console.error('加载数据失败', e)
    } finally {
      setLoading(false)
    }
  }

  const chartOption = {
    title: {
      text: '销售趋势 (近7天)',
      left: 'center',
      textStyle: {
        color: mintTheme.primary[800],
        fontWeight: 'bold'
      }
    },
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: mintTheme.primary[200],
      textStyle: { color: mintTheme.primary[800] }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: ['1日', '5日', '10日', '15日', '20日', '25日'],
      axisLine: { lineStyle: { color: mintTheme.primary[300] } },
      axisLabel: { color: mintTheme.primary[600] }
    },
    yAxis: {
      type: 'value',
      axisLine: { lineStyle: { color: mintTheme.primary[300] } },
      axisLabel: { color: mintTheme.primary[600] },
      splitLine: { lineStyle: { color: mintTheme.primary[100] } }
    },
    series: [{
      data: [1200, 1500, 1800, 2200, 2600, 3100],
      type: 'line',
      smooth: true,
      lineStyle: {
        color: mintTheme.primary[500],
        width: 3
      },
      itemStyle: {
        color: mintTheme.primary[500]
      },
      areaStyle: {
        color: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [
            { offset: 0, color: 'rgba(34, 197, 94, 0.3)' },
            { offset: 1, color: 'rgba(34, 197, 94, 0.05)' }
          ]
        }
      }
    }]
  }

  const columns = [
    {
      title: '排名',
      key: 'rank',
      width: 60,
      render: (_: any, __: any, index: number) => (
        <div style={{
          width: 24,
          height: 24,
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 12,
          fontWeight: 'bold',
          color: 'white',
          background: index === 0 ? '#fbbf24' : index === 1 ? '#9ca3af' : index === 2 ? '#fb923c' : mintTheme.primary[400]
        }}>
          {index + 1}
        </div>
      )
    },
    {
      title: '商品名称',
      dataIndex: 'productName',
      key: 'productName',
      render: (text: string) => (
        <span style={{ color: mintTheme.primary[800], fontWeight: 500 }}>{text}</span>
      )
    },
    {
      title: '销量',
      dataIndex: '_sum',
      key: 'quantity',
      align: 'right' as const,
      render: (_: any, record: any) => (
        <span style={{ color: mintTheme.primary[600], fontWeight: 'bold' }}>
          {record._sum?.quantity || 0} 件
        </span>
      )
    }
  ]

  const refundColumns = [
    {
      title: '排名',
      key: 'rank',
      width: 60,
      render: (_: any, __: any, index: number) => (
        <div style={{
          width: 24,
          height: 24,
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 12,
          fontWeight: 'bold',
          color: 'white',
          background: '#ef4444'
        }}>
          {index + 1}
        </div>
      )
    },
    {
      title: '订单号',
      dataIndex: 'orderNo',
      key: 'orderNo',
      render: (text: string) => (
        <span style={{ fontFamily: 'monospace', fontSize: 12 }}>{text}</span>
      )
    },
    {
      title: '会员',
      dataIndex: 'memberName',
      key: 'memberName',
    },
    {
      title: '退款金额',
      dataIndex: 'returnAmount',
      key: 'returnAmount',
      align: 'right' as const,
      render: (amount: number) => (
        <span style={{ color: '#ef4444', fontWeight: 'bold' }}>
          ¥{amount.toFixed(2)}
        </span>
      )
    }
  ]

  // 统计卡片样式
  const statCardStyle = {
    ...mintTheme.glass,
    borderRadius: mintTheme.borderRadius.xl,
    border: `1px solid ${mintTheme.primary[200]}`,
  }

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '60vh'
      }}>
        <Spin size="large" />
      </div>
    )
  }

  return (
    <div style={{
      background: mintTheme.gradients.soft,
      minHeight: 'calc(100vh - 64px)',
      padding: 24
    }}>
      <div style={{ maxWidth: 1400, margin: '0 auto' }}>
        <h1 style={{
          fontSize: 28,
          fontWeight: 'bold',
          color: mintTheme.primary[800],
          marginBottom: 24
        }}>
          经营大屏
        </h1>

        {/* Stats Cards */}
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} lg={6}>
            <Card style={statCardStyle} bordered={false}>
              <Statistic
                title={<span style={{ color: mintTheme.primary[600] }}>今日销售额</span>}
                value={data.today.sales}
                prefix={<DollarOutlined style={{ color: mintTheme.primary[500] }} />}
                suffix="元"
                valueStyle={{
                  color: mintTheme.primary[800],
                  fontWeight: 'bold',
                  fontSize: 32
                }}
              />
              <div style={{
                marginTop: 8,
                color: mintTheme.primary[500],
                fontSize: 14,
                display: 'flex',
                alignItems: 'center',
                gap: 4
              }}>
                <RiseOutlined /> 15.8%
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card style={statCardStyle} bordered={false}>
              <Statistic
                title={<span style={{ color: '#3b82f6' }}>今日订单数</span>}
                value={data.today.count}
                prefix={<ShoppingOutlined style={{ color: '#3b82f6' }} />}
                suffix="笔"
                valueStyle={{
                  color: '#1e40af',
                  fontWeight: 'bold',
                  fontSize: 32
                }}
              />
              <div style={{
                marginTop: 8,
                color: mintTheme.primary[500],
                fontSize: 14,
                display: 'flex',
                alignItems: 'center',
                gap: 4
              }}>
                <RiseOutlined /> 8.2%
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card style={statCardStyle} bordered={false}>
              <Statistic
                title={<span style={{ color: '#a855f7' }}>客单价</span>}
                value={data.month.count ? (data.month.sales / data.month.count).toFixed(0) : 0}
                prefix={<span style={{ color: '#a855f7' }}>¥</span>}
                valueStyle={{
                  color: '#7e22ce',
                  fontWeight: 'bold',
                  fontSize: 32
                }}
              />
              <div style={{
                marginTop: 8,
                color: '#ef4444',
                fontSize: 14,
                display: 'flex',
                alignItems: 'center',
                gap: 4
              }}>
                <FallOutlined /> 2.3%
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card style={statCardStyle} bordered={false}>
              <Statistic
                title={<span style={{ color: '#f97316' }}>新增会员</span>}
                value={data.newMembers}
                prefix={<TeamOutlined style={{ color: '#f97316' }} />}
                suffix="人"
                valueStyle={{
                  color: '#c2410c',
                  fontWeight: 'bold',
                  fontSize: 32
                }}
              />
              <div style={{
                marginTop: 8,
                color: mintTheme.primary[500],
                fontSize: 14,
                display: 'flex',
                alignItems: 'center',
                gap: 4
              }}>
                <RiseOutlined /> 25%
              </div>
            </Card>
          </Col>
        </Row>

        {/* Charts and Lists */}
        <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
          <Col xs={24} lg={16}>
            <Card
              style={{
                ...statCardStyle,
                height: '100%'
              }}
              bordered={false}
            >
              <ReactECharts option={chartOption} style={{ height: 340 }} />
            </Card>
          </Col>
          <Col xs={24} lg={8}>
            <Card
              title={
                <span style={{
                  color: mintTheme.primary[800],
                  fontWeight: 'bold'
                }}>
                  热销商品 TOP 5
                </span>
              }
              style={{
                ...statCardStyle,
                height: '100%'
              }}
              bordered={false}
            >
              <Table
                dataSource={data.hotProducts}
                columns={columns}
                pagination={false}
                size="middle"
                rowClassName={(_, index) => index % 2 === 0 ? '' : 'bg-green-50'}
              />
            </Card>
          </Col>
        </Row>

        {/* Refund Leaderboard */}
        <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
          <Col xs={24}>
            <Card
              title={
                <span style={{
                  color: '#ef4444',
                  fontWeight: 'bold'
                }}>
                  本月退货榜单 TOP 5
                </span>
              }
              style={{
                ...statCardStyle,
                borderColor: '#fecaca'
              }}
              bordered={false}
            >
              <Table
                dataSource={data.refundLeaderboard}
                columns={refundColumns}
                pagination={false}
                size="middle"
                locale={{ emptyText: '暂无退货记录' }}
              />
            </Card>
          </Col>
        </Row>

        {/* Additional Stats */}
        <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
          <Col xs={24} sm={8}>
            <Card style={statCardStyle} bordered={false}>
              <Statistic
                title={<span style={{ color: mintTheme.primary[600] }}>本月销售额</span>}
                value={data.month.sales}
                suffix="元"
                valueStyle={{ color: mintTheme.primary[700], fontWeight: 'bold' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card style={statCardStyle} bordered={false}>
              <Statistic
                title={<span style={{ color: mintTheme.primary[600] }}>本月订单数</span>}
                value={data.month.count}
                suffix="笔"
                valueStyle={{ color: mintTheme.primary[700], fontWeight: 'bold' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card style={statCardStyle} bordered={false}>
              <Statistic
                title={<span style={{ color: mintTheme.primary[600] }}>库存预警</span>}
                value={data.inventoryWarnings}
                prefix={<WarningOutlined />}
                suffix="件"
                valueStyle={{
                  color: data.inventoryWarnings > 0 ? '#ef4444' : mintTheme.primary[500],
                  fontWeight: 'bold'
                }}
              />
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  )
}