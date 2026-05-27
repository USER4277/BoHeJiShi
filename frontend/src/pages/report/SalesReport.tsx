import { useState, useEffect } from 'react'
import { Card, Row, Col, Statistic, Table, DatePicker, Button, Space, Select, Tag, Descriptions } from 'antd'
import { DollarOutlined, ShoppingOutlined, UserOutlined, RiseOutlined } from '@ant-design/icons'
import request from '../../api'
import dayjs from 'dayjs'

const { RangePicker } = DatePicker

export default function SalesReport() {
  const [loading, setLoading] = useState(false)
  const [dashboardData, setDashboardData] = useState<any>(null)
  const [salesData, setSalesData] = useState<any>(null)
  const [dateRange, setDateRange] = useState<any>([
    dayjs().startOf('month'),
    dayjs().endOf('month')
  ])

  useEffect(() => {
    loadDashboard()
    loadSalesData()
  }, [dateRange])

  const loadDashboard = async () => {
    try {
      const res: any = await request.get('/reports/dashboard')
      setDashboardData(res.data)
    } catch (e) {
      console.error('加载失败', e)
    }
  }

  const loadSalesData = async () => {
    setLoading(true)
    try {
      const res: any = await request.get('/reports/sales', {
        params: {
          startDate: dateRange[0].toDate(),
          endDate: dateRange[1].toDate()
        }
      })
      setSalesData(res.data)
    } catch (e) {
      console.error('加载失败', e)
    } finally {
      setLoading(false)
    }
  }

  const columns = [
    { title: '日期', dataIndex: 'date', key: 'date', render: (d: string) => dayjs(d).format('MM-DD') },
    { title: '销售额', dataIndex: 'sales', key: 'sales', render: (s: number) => `¥${s.toFixed(2)}` },
    { title: '订单数', dataIndex: 'count', key: 'count' }
  ]

  const productColumns = [
    { title: '商品', dataIndex: 'productName', key: 'productName' },
    { title: '销量', dataIndex: '_sum', key: 'quantity', render: (s: any) => s?.quantity || 0 },
    { title: '销售额', dataIndex: '_sum', key: 'amount', render: (s: any) => `¥${(s?.amount || 0).toFixed(2)}` }
  ]

  return (
    <div>
      <h1 style={{ fontSize: 20, marginBottom: 16 }}>销售数据</h1>
      
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Card>
            <Statistic 
              title="今日销售额" 
              value={dashboardData?.today?.sales || 0}
              prefix={<DollarOutlined />}
              precision={2}
              valueStyle={{ color: '#ff4d4f' }}
            />
            <div style={{ color: '#999', marginTop: 8 }}>
              订单 {dashboardData?.today?.count || 0} 笔，商品 {dashboardData?.today?.quantity || 0} 件
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic 
              title="本月销售额" 
              value={dashboardData?.month?.sales || 0}
              prefix={<RiseOutlined />}
              precision={2}
              valueStyle={{ color: '#1890ff' }}
            />
            <div style={{ color: '#999', marginTop: 8 }}>
              订单 {dashboardData?.month?.count || 0} 笔
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic 
              title="本月新增会员" 
              value={dashboardData?.newMembers || 0}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic 
              title="库存预警" 
              value={dashboardData?.inventoryWarnings || 0}
              prefix={<ShoppingOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
      </Row>

      <Card title="销售趋势" style={{ marginBottom: 16 }}>
        <Space style={{ marginBottom: 16 }}>
          <RangePicker value={dateRange} onChange={(dates) => dates && setDateRange(dates)} />
          <Select defaultValue="30" style={{ width: 100 }}>
            <Select.Option value="7">近7天</Select.Option>
            <Select.Option value="30">近30天</Select.Option>
            <Select.Option value="90">近90天</Select.Option>
          </Select>
        </Space>
        
        <Table
          dataSource={salesData?.dailyStats ? Object.entries(salesData.dailyStats).map(([date, stats]: [string, any]) => ({
            date, ...stats
          })) : []}
          columns={columns}
          loading={loading}
          rowKey="date"
          pagination={false}
        />
      </Card>

      <Row gutter={16}>
        <Col span={12}>
          <Card title="热销商品 TOP 10">
            <Table
              dataSource={salesData?.productStats || []}
              columns={productColumns}
              loading={loading}
              rowKey="productName"
              pagination={{ pageSize: 10 }}
              size="small"
            />
          </Card>
        </Col>
        <Col span={12}>
          <Card title="今日概况">
            {dashboardData?.hotProducts?.length > 0 ? (
              <Table
                dataSource={dashboardData.hotProducts}
                columns={[
                  { title: '商品', dataIndex: 'productName', key: 'productName' },
                  { title: '销量', dataIndex: '_sum', key: 'quantity', render: (s: any) => s?.quantity || 0 }
                ]}
                rowKey="skuId"
                pagination={false}
                size="small"
                title={() => '今日热销'}
              />
            ) : (
              <div style={{ textAlign: 'center', padding: 24, color: '#999' }}>暂无数据</div>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  )
}