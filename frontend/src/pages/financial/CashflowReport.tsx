import { useState, useEffect } from 'react'
import { Card, DatePicker, Button, Space, Row, Col, Statistic, Table, Spin, Switch } from 'antd'
import { DollarOutlined, ArrowUpOutlined, ArrowDownOutlined, SyncOutlined } from '@ant-design/icons'
import { financialApi } from '../../api/financial'
import { mintTheme } from '../../theme/colors'
import dayjs from 'dayjs'

const { RangePicker } = DatePicker

export default function CashflowReport() {
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<any>(null)
  const [operatingOnly, setOperatingOnly] = useState(false)
  const [dateRange, setDateRange] = useState<any>([
    dayjs().startOf('month'),
    dayjs()
  ])

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const res: any = await financialApi.getCashflow({
        startDate: dateRange[0].format('YYYY-MM-DD'),
        endDate: dateRange[1].format('YYYY-MM-DD'),
        operatingOnly: operatingOnly ? 'true' : 'false'
      })
      setData(res.data)
    } catch (e) {
      console.error('加载现金流量报表失败', e)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    loadData()
  }

  const paymentColumns = [
    {
      title: '支付方式',
      dataIndex: 'method',
      key: 'method'
    },
    {
      title: '金额',
      dataIndex: 'amount',
      key: 'amount',
      align: 'right' as const,
      render: (val: number) => `¥${val.toFixed(2)}`
    }
  ]

  if (loading || !data) {
    return (
      <div style={{ textAlign: 'center', padding: 100 }}>
        <Spin size="large" />
      </div>
    )
  }

  return (
    <div>
      {/* 查询条件 */}
      <Card style={{ marginBottom: 16 }}>
        <Space>
          <RangePicker
            value={dateRange}
            onChange={(dates) => setDateRange(dates)}
            style={{ width: 300 }}
          />
          <span>仅经营数据:</span>
          <Switch
            checked={operatingOnly}
            onChange={(checked) => {
              setOperatingOnly(checked)
              setTimeout(() => loadData(), 100)
            }}
          />
          <Button
            type="primary"
            icon={<SyncOutlined />}
            onClick={handleSearch}
            style={{
              background: mintTheme.gradients.primary,
              border: 'none'
            }}
          >
            查询
          </Button>
        </Space>
      </Card>

      {/* 汇总指标 */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={8}>
          <Card>
            <Statistic
              title="现金流入"
              value={data.summary.totalInflow}
              precision={2}
              prefix="¥"
              valueStyle={{ color: '#22c55e' }}
              suffix={<ArrowUpOutlined />}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="现金流出"
              value={data.summary.totalOutflow}
              precision={2}
              prefix="¥"
              valueStyle={{ color: '#ef4444' }}
              suffix={<ArrowDownOutlined />}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="净现金流"
              value={data.summary.netCashflow}
              precision={2}
              prefix="¥"
              valueStyle={{
                color: data.summary.netCashflow >= 0 ? '#22c55e' : '#ef4444'
              }}
            />
          </Card>
        </Col>
      </Row>

      {/* 经营活动现金流 */}
      <Card
        title={<><DollarOutlined /> 经营活动现金流</>}
        style={{ marginBottom: 16 }}
      >
        <Row gutter={16}>
          <Col span={12}>
            <div style={{
              padding: 16,
              background: '#f0fdf4',
              borderRadius: 8,
              marginBottom: 16
            }}>
              <h4 style={{ color: mintTheme.primary[800], marginBottom: 12 }}>
                现金流入
              </h4>
              <div style={{ marginBottom: 8 }}>
                <span>销售收入</span>
                <span style={{ float: 'right', fontWeight: 'bold', color: '#22c55e' }}>
                  ¥{data.operating.inflow.salesRevenue.toFixed(2)}
                </span>
              </div>
              <div style={{
                borderTop: '1px solid #dcfce7',
                paddingTop: 8,
                fontWeight: 'bold'
              }}>
                <span>流入小计</span>
                <span style={{ float: 'right', color: '#22c55e' }}>
                  ¥{data.operating.inflow.total.toFixed(2)}
                </span>
              </div>
            </div>
          </Col>

          <Col span={12}>
            <div style={{
              padding: 16,
              background: '#fef2f2',
              borderRadius: 8,
              marginBottom: 16
            }}>
              <h4 style={{ color: '#dc2626', marginBottom: 12 }}>
                现金流出
              </h4>
              <div style={{ marginBottom: 8 }}>
                <span>退货支出</span>
                <span style={{ float: 'right', fontWeight: 'bold', color: '#ef4444' }}>
                  ¥{data.operating.outflow.refunds.toFixed(2)}
                </span>
              </div>
              <div style={{
                borderTop: '1px solid #fecaca',
                paddingTop: 8,
                fontWeight: 'bold'
              }}>
                <span>流出小计</span>
                <span style={{ float: 'right', color: '#ef4444' }}>
                  ¥{data.operating.outflow.total.toFixed(2)}
                </span>
              </div>
            </div>
          </Col>
        </Row>

        <div style={{
          padding: 16,
          background: data.operating.net >= 0 ? '#f0fdf4' : '#fef2f2',
          borderRadius: 8,
          fontSize: 16,
          fontWeight: 'bold'
        }}>
          <span>经营活动净现金流</span>
          <span style={{
            float: 'right',
            color: data.operating.net >= 0 ? '#22c55e' : '#ef4444'
          }}>
            ¥{data.operating.net.toFixed(2)}
          </span>
        </div>
      </Card>

      {/* 按支付方式统计 */}
      <Card title="按支付方式统计" style={{ marginBottom: 16 }}>
        <Table
          dataSource={data.byPaymentMethod}
          columns={paymentColumns}
          rowKey="method"
          pagination={false}
          summary={(pageData) => {
            const total = pageData.reduce((sum, item) => sum + item.amount, 0)
            return (
              <Table.Summary.Row style={{ fontWeight: 'bold', background: '#f9fafb' }}>
                <Table.Summary.Cell index={0}>合计</Table.Summary.Cell>
                <Table.Summary.Cell index={1} align="right">
                  ¥{total.toFixed(2)}
                </Table.Summary.Cell>
              </Table.Summary.Row>
            )
          }}
        />
      </Card>

      {/* 手工账明细 */}
      {!operatingOnly && data.manual && (
        <Row gutter={16}>
          <Col span={12}>
            <Card title="额外收入明细" style={{ marginBottom: 16 }}>
              {data.manual.inflow.details.length > 0 ? (
                <>
                  {data.manual.inflow.details.map((item: any, index: number) => (
                    <div key={index} style={{
                      padding: '8px 0',
                      borderBottom: index < data.manual.inflow.details.length - 1 ? '1px solid #f0f0f0' : 'none'
                    }}>
                      <span>{item.typeName}</span>
                      <span style={{ float: 'right', color: '#22c55e', fontWeight: 'bold' }}>
                        +¥{item.amount.toFixed(2)}
                      </span>
                    </div>
                  ))}
                  <div style={{
                    marginTop: 12,
                    paddingTop: 12,
                    borderTop: '2px solid #e5e7eb',
                    fontWeight: 'bold'
                  }}>
                    <span>小计</span>
                    <span style={{ float: 'right', color: '#22c55e' }}>
                      ¥{data.manual.inflow.total.toFixed(2)}
                    </span>
                  </div>
                </>
              ) : (
                <div style={{ textAlign: 'center', color: '#999', padding: 20 }}>
                  暂无额外收入
                </div>
              )}
            </Card>
          </Col>

          <Col span={12}>
            <Card title="额外支出明细" style={{ marginBottom: 16 }}>
              {data.manual.outflow.details.length > 0 ? (
                <>
                  {data.manual.outflow.details.map((item: any, index: number) => (
                    <div key={index} style={{
                      padding: '8px 0',
                      borderBottom: index < data.manual.outflow.details.length - 1 ? '1px solid #f0f0f0' : 'none'
                    }}>
                      <span>{item.typeName}</span>
                      <span style={{ float: 'right', color: '#ef4444', fontWeight: 'bold' }}>
                        -¥{item.amount.toFixed(2)}
                      </span>
                    </div>
                  ))}
                  <div style={{
                    marginTop: 12,
                    paddingTop: 12,
                    borderTop: '2px solid #e5e7eb',
                    fontWeight: 'bold'
                  }}>
                    <span>小计</span>
                    <span style={{ float: 'right', color: '#ef4444' }}>
                      ¥{data.manual.outflow.total.toFixed(2)}
                    </span>
                  </div>
                </>
              ) : (
                <div style={{ textAlign: 'center', color: '#999', padding: 20 }}>
                  暂无额外支出
                </div>
              )}
            </Card>
          </Col>
        </Row>
      )}
    </div>
  )
}
