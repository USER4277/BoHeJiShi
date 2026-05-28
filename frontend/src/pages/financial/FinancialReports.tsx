import { Tabs } from 'antd'
import { FundOutlined, DollarOutlined } from '@ant-design/icons'
import PageContainer from '../../components/PageContainer'
import CashflowReport from './CashflowReport'
import ProfitLossReport from './ProfitLossReport'

export default function FinancialReports() {
  const items = [
    {
      key: 'cashflow',
      label: (
        <span>
          <DollarOutlined /> 现金流量表
        </span>
      ),
      children: <CashflowReport />
    },
    {
      key: 'profit-loss',
      label: (
        <span>
          <FundOutlined /> 损益表
        </span>
      ),
      children: <ProfitLossReport />
    }
  ]

  return (
    <PageContainer
      title="财务报表"
      subtitle="Financial Reports"
      icon={<FundOutlined />}
    >
      <Tabs items={items} size="large" />
    </PageContainer>
  )
}
