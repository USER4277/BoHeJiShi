import { Tabs } from 'antd'
import { DatabaseOutlined } from '@ant-design/icons'
import PageContainer from '../../components/PageContainer'
import CategoryList from './CategoryList'
import BrandManagement from './BrandManagement'
import MaterialManagement from './MaterialManagement'
import { mintTheme } from '../../theme/colors'

export default function MasterDataManagement() {
  const items = [
    {
      key: 'category',
      label: '商品分类',
      children: <CategoryList />
    },
    {
      key: 'brand',
      label: '品牌管理',
      children: <BrandManagement />
    },
    {
      key: 'material',
      label: '材质管理',
      children: <MaterialManagement />
    }
  ]

  return (
    <PageContainer
      title="主数据管理"
      subtitle="Master Data Management"
      icon={<DatabaseOutlined />}
    >
      <Tabs
        items={items}
        size="large"
        style={{
          background: 'white',
          padding: '16px 24px',
          borderRadius: mintTheme.borderRadius.xl,
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)'
        }}
      />
    </PageContainer>
  )
}
