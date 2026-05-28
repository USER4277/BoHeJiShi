import { useState, useEffect } from 'react'
import { Card, DatePicker, Button, Space, Row, Col, Statistic, Spin, Progress, Switch } from 'antd'
import { FundOutlined, RiseOutlined, FallOutlined, SyncOutlined } from '@ant-design/icons'
import { financialApi } from '../../api/financial'
import { mintTheme } from '../../theme/colors'
import dayjs from 'dayjs'

const { RangePicker } = DatePicker

export default function ProfitLossReport() {
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
      const res: any = await financialApi.getProfitLoss({
        startDate: dateRange[0].format('YYYY-MM-DD'),
        endDate: dateRange[1].format('YYYY-MM-DD'),
        operatingOnly: operatingOnly ? 'true' : 'false'
      })
      setData(res.data)
    } catch (e) {
      console.error('加载损益报表失败', e)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    loadData()
  }

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

      {/* 关键指标 */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="净利润"
              value={data.profit.netProfit}
              precision={2}
              prefix="¥"
              valueStyle={{
                color: data.profit.netProfit >= 0 ? '#22c55e' : '#ef4444'
              }}
              suffix={data.profit.netProfit >= 0 ? <RiseOutlined /> : <FallOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="营业收入"
              value={data.revenue.netRevenue}
              precision={2}
              prefix="¥"
              valueStyle={{ color: '#3b82f6' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="毛利润"
              value={data.cost.grossProfit}
              precision={2}
              prefix="¥"
              valueStyle={{ color: '#22c55e' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="毛利率"
              value={data.cost.grossProfitMargin}
              precision={2}
              suffix="%"
              valueStyle={{ color: '#22c55e' }}
            />
            <Progress
              percent={data.cost.grossProfitMargin}
              strokeColor="#22c55e"
              showInfo={false}
            />
          </Card>
        </Col>
      </Row>

      {/* 损益表详情 */}
      <Card
        title={<><FundOutlined /> 损益明细表</>}
      >
        <div style={{ maxWidth: 800 }}>
          {/* 收入部分 */}
          <div style={{
            padding: 16,
            background: '#f0fdf4',
            borderRadius: 8,
            marginBottom: 16
          }}>
            <h3 style={{ color: mintTheme.primary[800], marginBottom: 16 }}>一、营业收入</h3>

            <div style={{ marginBottom: 8, paddingLeft: 16 }}>
              <span style={{ color: '#6b7280' }}>营业收入总额</span>
              <span style={{ float: 'right', fontWeight: 500 }}>
                ¥{data.revenue.operatingRevenue.toFixed(2)}
              </span>
            </div>

            <div style={{ marginBottom: 8, paddingLeft: 16 }}>
              <span style={{ color: '#6b7280' }}>减：折扣优惠</span>
              <span style={{ float: 'right', fontWeight: 500, color: '#ef4444' }}>
                -¥{data.revenue.discounts.toFixed(2)}
              </span>
            </div>

            <div style={{ marginBottom: 8, paddingLeft: 16 }}>
              <span style={{ color: '#6b7280' }}>减：退货金额</span>
              <span style={{ float: 'right', fontWeight: 500, color: '#ef4444' }}>
                -¥{data.revenue.returns.toFixed(2)}
              </span>
            </div>

            <div style={{
              borderTop: '2px solid #22c55e',
              paddingTop: 12,
              marginTop: 12,
              fontWeight: 'bold',
              fontSize: 16
            }}>
              <span>净营业收入</span>
              <span style={{ float: 'right', color: '#22c55e' }}>
                ¥{data.revenue.netRevenue.toFixed(2)}
              </span>
            </div>
          </div>

          {/* 成本部分 */}
          <div style={{
            padding: 16,
            background: '#fef9c3',
            borderRadius: 8,
            marginBottom: 16
          }}>
            <h3 style={{ color: '#ca8a04', marginBottom: 16 }}>二、营业成本与毛利</h3>

            <div style={{ marginBottom: 8, paddingLeft: 16 }}>
              <span style={{ color: '#6b7280' }}>销售成本（净）</span>
              <span style={{ float: 'right', fontWeight: 500, color: '#ef4444' }}>
                -¥{data.cost.costOfSales.toFixed(2)}
              </span>
            </div>

            {data.cost.returnCost > 0 && (
              <div style={{ marginBottom: 8, paddingLeft: 32, fontSize: 13, color: '#9ca3af' }}>
                <span>退货成本已扣除</span>
                <span style={{ float: 'right' }}>
                  ¥{data.cost.returnCost.toFixed(2)}
                </span>
              </div>
            )}

            <div style={{
              borderTop: '2px solid #ca8a04',
              paddingTop: 12,
              marginTop: 12,
              fontWeight: 'bold',
              fontSize: 16
            }}>
              <span>毛利润</span>
              <span style={{ float: 'right', color: '#22c55e' }}>
                ¥{data.cost.grossProfit.toFixed(2)}
              </span>
            </div>

            <div style={{ marginTop: 8, paddingLeft: 16, fontSize: 14, color: '#6b7280' }}>
              <span>毛利率</span>
              <span style={{ float: 'right', fontWeight: 500, color: '#22c55e' }}>
                {data.cost.grossProfitMargin.toFixed(2)}%
              </span>
            </div>
          </div>

          {/* 费用部分 */}
          <div style={{
            padding: 16,
            background: '#fef2f2',
            borderRadius: 8,
            marginBottom: 16
          }}>
            <h3 style={{ color: '#dc2626', marginBottom: 16 }}>三、营业费用</h3>

            <div style={{ marginBottom: 8, paddingLeft: 16 }}>
              <span style={{ color: '#6b7280' }}>营业费用</span>
              <span style={{ float: 'right', fontWeight: 500, color: '#ef4444' }}>
                -¥{data.expenses.operatingExpenses.toFixed(2)}
              </span>
            </div>

            <div style={{
              borderTop: '2px solid #dc2626',
              paddingTop: 12,
              marginTop: 12,
              fontWeight: 'bold'
            }}>
              <span>费用合计</span>
              <span style={{ float: 'right', color: '#ef4444' }}>
                -¥{data.expenses.total.toFixed(2)}
              </span>
            </div>
          </div>

          {/* 利润部分 */}
          <div style={{
            padding: 20,
            background: data.profit.netProfit >= 0 ? '#f0fdf4' : '#fef2f2',
            borderRadius: 8,
            border: `2px solid ${data.profit.netProfit >= 0 ? '#22c55e' : '#ef4444'}`
          }}>
            <h3 style={{
              color: data.profit.netProfit >= 0 ? '#15803d' : '#dc2626',
              marginBottom: 16
            }}>
              四、净利润
            </h3>

            <div style={{ marginBottom: 12, paddingLeft: 16 }}>
              <span style={{ color: '#6b7280' }}>营业利润</span>
              <span style={{ float: 'right', fontWeight: 500 }}>
                ¥{data.profit.operatingProfit.toFixed(2)}
              </span>
            </div>

            <div style={{
              borderTop: `3px solid ${data.profit.netProfit >= 0 ? '#22c55e' : '#ef4444'}`,
              paddingTop: 16,
              marginTop: 16,
              fontWeight: 'bold',
              fontSize: 18
            }}>
              <span>净利润</span>
              <span style={{
                float: 'right',
                color: data.profit.netProfit >= 0 ? '#22c55e' : '#ef4444'
              }}>
                ¥{data.profit.netProfit.toFixed(2)}
              </span>
            </div>

            <div style={{ marginTop: 12, paddingLeft: 16, fontSize: 14, color: '#6b7280' }}>
              <span>利润率</span>
              <span style={{
                float: 'right',
                fontWeight: 500,
                color: data.profit.netProfit >= 0 ? '#22c55e' : '#ef4444'
              }}>
                {data.profit.profitMargin.toFixed(2)}%
              </span>
            </div>
          </div>

          {/* 手工账明细 */}
          {!operatingOnly && data.manual && (
            <>
              <div style={{
                marginTop: 16,
                padding: 16,
                background: '#f0fdf4',
                borderRadius: 8,
                border: '1px solid #dcfce7'
              }}>
                <h4 style={{ color: '#22c55e', marginBottom: 12 }}>额外收入明细</h4>
                {data.manual.income.details.length > 0 ? (
                  <>
                    {data.manual.income.details.map((item: any, index: number) => (
                      <div key={index} style={{
                        padding: '6px 0',
                        borderBottom: index < data.manual.income.details.length - 1 ? '1px solid #f0f0f0' : 'none'
                      }}>
                        <span style={{ paddingLeft: 16 }}>{item.typeName}</span>
                        <span style={{ float: 'right', color: '#22c55e', fontWeight: 'bold' }}>
                          +¥{item.amount.toFixed(2)}
                        </span>
                      </div>
                    ))}
                    <div style={{
                      marginTop: 8,
                      paddingTop: 8,
                      borderTop: '2px solid #22c55e',
                      fontWeight: 'bold'
                    }}>
                      <span>小计</span>
                      <span style={{ float: 'right', color: '#22c55e' }}>
                        ¥{data.manual.income.total.toFixed(2)}
                      </span>
                    </div>
                  </>
                ) : (
                  <div style={{ textAlign: 'center', color: '#999' }}>暂无额外收入</div>
                )}
              </div>

              <div style={{
                marginTop: 16,
                padding: 16,
                background: '#fef2f2',
                borderRadius: 8,
                border: '1px solid #fecaca'
              }}>
                <h4 style={{ color: '#ef4444', marginBottom: 12 }}>额外支出明细</h4>
                {data.manual.expense.details.length > 0 ? (
                  <>
                    {data.manual.expense.details.map((item: any, index: number) => (
                      <div key={index} style={{
                        padding: '6px 0',
                        borderBottom: index < data.manual.expense.details.length - 1 ? '1px solid #f0f0f0' : 'none'
                      }}>
                        <span style={{ paddingLeft: 16 }}>{item.typeName}</span>
                        <span style={{ float: 'right', color: '#ef4444', fontWeight: 'bold' }}>
                          -¥{item.amount.toFixed(2)}
                        </span>
                      </div>
                    ))}
                    <div style={{
                      marginTop: 8,
                      paddingTop: 8,
                      borderTop: '2px solid #ef4444',
                      fontWeight: 'bold'
                    }}>
                      <span>小计</span>
                      <span style={{ float: 'right', color: '#ef4444' }}>
                        ¥{data.manual.expense.total.toFixed(2)}
                      </span>
                    </div>
                  </>
                ) : (
                  <div style={{ textAlign: 'center', color: '#999' }}>暂无额外支出</div>
                )}
              </div>
            </>
          )}

          {/* 统计信息 */}
          <div style={{
            marginTop: 16,
            padding: 16,
            background: '#f9fafb',
            borderRadius: 8
          }}>
            <Row gutter={16}>
              <Col span={8}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 24, fontWeight: 'bold', color: '#3b82f6' }}>
                    {data.statistics.orderCount}
                  </div>
                  <div style={{ color: '#6b7280', marginTop: 4 }}>订单数量</div>
                </div>
              </Col>
              <Col span={8}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 24, fontWeight: 'bold', color: '#ef4444' }}>
                    {data.statistics.returnCount}
                  </div>
                  <div style={{ color: '#6b7280', marginTop: 4 }}>退货数量</div>
                </div>
              </Col>
              <Col span={8}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 24, fontWeight: 'bold', color: '#22c55e' }}>
                    ¥{data.statistics.averageOrderValue.toFixed(2)}
                  </div>
                  <div style={{ color: '#6b7280', marginTop: 4 }}>客单价</div>
                </div>
              </Col>
            </Row>
          </div>
        </div>
      </Card>
    </div>
  )
}
