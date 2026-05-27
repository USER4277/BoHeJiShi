import { useState, useEffect } from 'react'
import { Card, Row, Col, Statistic, Table, Tag, Spin } from 'antd'
import { 
  DollarOutlined, 
  ShoppingOutlined, 
  TeamOutlined, 
  WarningOutlined 
} from '@ant-design/icons'
import ReactECharts from 'echarts-for-react'
import { reportApi } from '../api/report'

export default function Dashboard() {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<any>({
    today: { sales: 0, count: 0, quantity: 0 },
    month: { sales: 0, count: 0 },
    newMembers: 0,
    inventoryWarnings: 0,
    hotProducts: []
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
    title: { text: '本月销售趋势', left: 'center' },
    tooltip: { trigger: 'axis' },
    xAxis: { type: 'category', data: ['1日', '5日', '10日', '15日', '20日', '25日'] },
    yAxis: { type: 'value' },
    series: [{
      data: [1200, 1500, 1800, 2200, 2600, 3100],
      type: 'line',
      smooth: true,
      areaStyle: { color: '#1890ff20' }
    }]
  }

  const columns = [
    { title: '商品名称', dataIndex: 'productName', key: 'productName' },
    { 
      title: '销量', 
      dataIndex: '_sum', 
      key: 'quantity',
      render: (_: any, record: any) => record._sum?.quantity || 0
    }
  ]

  if (loading) {
    return <Spin style={{ marginTop: 100 }} />
  }

  return (
    <div>
      <h1 style={{ fontSize: 24, marginBottom: 24 }}>经营数据概览</h1>
      
      <Row gutter={16}>
        <Col span={6}>
          <Card>
            <Statistic
              title="今日销售额"
              value={data.today.sales}
              prefix={<DollarOutlined />}
              suffix="元"
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="今日订单数"
              value={data.today.count}
              prefix={<ShoppingOutlined />}
              suffix="笔"
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="本月新增会员"
              value={data.newMembers}
              prefix={<TeamOutlined />}
              suffix="人"
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="库存预警"
              value={data.inventoryWarnings}
              prefix={<WarningOutlined />}
              suffix="件"
              valueStyle={{ color: data.inventoryWarnings > 0 ? '#ff4d4f' : '#52c41a' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={16} style={{ marginTop: 24 }}>
        <Col span={16}>
          <Card title="销售趋势">
            <ReactECharts option={chartOption} style={{ height: 300 }} />
          </Card>
        </Col>
        <Col span={8}>
          <Card title="热销商品 TOP5">
            <Table 
              dataSource={data.hotProducts} 
              columns={columns} 
              pagination={false}
              size="small"
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={16} style={{ marginTop: 24 }}>
        <Col span={8}>
          <Card>
            <Statistic title="本月销售额" value={data.month.sales} suffix="元" />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic title="本月订单数" value={data.month.count} suffix="笔" />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic 
              title="客单价" 
              value={data.month.count ? (data.month.sales / data.month.count).toFixed(2) : 0} 
              suffix="元" 
            />
          </Card>
        </Col>
      </Row>
    </div>
  )
}