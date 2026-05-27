import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ConfigProvider } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import MainLayout from './pages/layout/MainLayout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import ProductList from './pages/product/ProductList'
import CategoryList from './pages/product/CategoryList'
import InventoryList from './pages/inventory/InventoryList'
import POS from './pages/sale/POS'
import OrderList from './pages/sale/OrderList'
import MemberList from './pages/member/MemberList'
import MemberDetail from './pages/member/MemberDetail'
import UserList from './pages/system/UserList'
import RoleList from './pages/system/RoleList'
import SystemConfig from './pages/system/SystemConfig'
import OperationLogs from './pages/system/OperationLogs'
import DataBackup from './pages/system/DataBackup'
import ProductForm from './pages/product/ProductForm'
import ProductDetail from './pages/product/ProductDetail'
import BrandList from './pages/product/BrandList'
import AttributeList from './pages/product/AttributeList'
import StocktakingList from './pages/inventory/StocktakingList'
import TransferList from './pages/inventory/TransferList'
import InventoryLogs from './pages/inventory/InventoryLogs'
import PromotionList from './pages/promotion/PromotionList'
import CouponList from './pages/promotion/CouponList'
import SalesReport from './pages/report/SalesReport'
import FinancialReport from './pages/report/FinancialReport'
import { useAuthStore } from './stores/authStore'

function App() {
  const { isAuthenticated } = useAuthStore()

  return (
    <ConfigProvider locale={zhCN}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={isAuthenticated ? <MainLayout /> : <Navigate to="/login" />}
          >
            <Route index element={<Dashboard />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="products" element={<ProductList />} />
            <Route path="categories" element={<CategoryList />} />
            <Route path="inventory" element={<InventoryList />} />
            <Route path="pos" element={<POS />} />
            <Route path="orders" element={<OrderList />} />
            <Route path="members" element={<MemberList />} />
            <Route path="members/:id" element={<MemberDetail />} />
            <Route path="system/users" element={<UserList />} />
            <Route path="system/roles" element={<RoleList />} />
            <Route path="system/config" element={<SystemConfig />} />
            <Route path="system/logs" element={<OperationLogs />} />
            <Route path="system/backup" element={<DataBackup />} />
            <Route path="products/new" element={<ProductForm />} />
            <Route path="products/:id/edit" element={<ProductForm />} />
            <Route path="products/:id" element={<ProductDetail />} />
            <Route path="brands" element={<BrandList />} />
            <Route path="attributes" element={<AttributeList />} />
            <Route path="inventory/stocktaking" element={<StocktakingList />} />
            <Route path="inventory/transfer" element={<TransferList />} />
            <Route path="inventory/logs" element={<InventoryLogs />} />
            <Route path="promotions" element={<PromotionList />} />
            <Route path="coupons" element={<CouponList />} />
            <Route path="reports/sales" element={<SalesReport />} />
            <Route path="reports/financial" element={<FinancialReport />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ConfigProvider>
  )
}

export default App