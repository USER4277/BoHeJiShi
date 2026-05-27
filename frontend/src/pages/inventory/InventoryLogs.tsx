import { useState, useEffect } from 'react'
import { Table, Card, Space, Select, DatePicker, Button, Tag } from 'antd'
import { SearchOutlined, FileTextOutlined } from '@ant-design/icons'
import request from '../../api'
import dayjs from 'dayjs'

const { RangePicker } = DatePicker

export default function InventoryLogs() {
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState([])
  const [filters, setFilters] = useState({
    changeType: '',
    dateRange: []
  })

  useEffect(() => {
    loadData()
  }, [filters])

  const loadData = async () => {
    setLoading(true)
    try {
      const params: any = {}
      if (filters.changeType) params.changeType = filters.changeType
      
      const res: any = await request.get('/inventory/logs', { params })
      let list = res.data
      
      // 前端过滤日期范围
      if (filters.dateRange?.length) {
        const start = filters.dateRange[0].toDate().getTime()
        const end = filters.dateRange[1].toDate().getTime()
        list = list.filter((item: any) => {
          const time = new Date(item.createdAt).getTime()
          return time >= start && time <= end
        })
      }
      
      setData(list)
    } catch (e) {
      console.error('加载失败', e)
    } finally {
      setLoading(false)
    }
  }

  const typeColors: any = { in: 'green', out: 'red', adjust: 'blue' }
  const typeText: any = { in: '入库', out: '出库', adjust: '调整' }
  const billTypeText: any = { IN: '采购入库', OUT: '销售出库', PD: '盘点调整', DB: '调拨', SALE: '销售', RETURN: '退货' }

  const columns = [
    { 
      title: '时间', 
      dataIndex: 'createdAt', 
      key: 'createdAt',
      render: (d: string) => dayjs(d).format('YYYY-MM-DD HH:mm')
    },
    { title: '商品', dataIndex: ['sku', 'product', 'name'], key: 'productName' },
    { title: 'SKU编码', dataIndex: ['sku', 'skuCode'], key: 'skuCode' },
    { 
      title: '类型', 
      dataIndex: 'changeType', 
      key: 'changeType',
      render: (t: string) => <Tag color={typeColors[t]}>{typeText[t] || t}</Tag>
    },
    { title: '单据类型', dataIndex: 'billType', key: 'billType', render: (t: string) => billTypeText[t] || t },
    { 
      title: '变动数量', 
      dataIndex: 'changeQuantity', 
      key: 'changeQuantity',
      render: (q: number) => (
        <span style={{ color: q > 0 ? '#52c41a' : '#ff4d4f', fontWeight: 'bold' }}>
          {q > 0 ? `+${q}` : q}
        </span>
      )
    },
    { title: '变动前', dataIndex: 'beforeQuantity', key: 'beforeQuantity' },
    { title: '变动后', dataIndex: 'afterQuantity', key: 'afterQuantity' },
    { title: '备注', dataIndex: 'remark', key: 'remark', ellipsis: true }
  ]

  return (
    <div>
      <h1 style={{ fontSize: 20, marginBottom: 16 }}><FileTextOutlined /> 库存变动记录</h1>
      
      <Card style={{ marginBottom: 16 }}>
        <Space wrap>
          <Select
            placeholder="变动类型"
            style={{ width: 120 }}
            allowClear
            value={filters.changeType || undefined}
            onChange={v => setFilters({ ...filters, changeType: v || '' })}
          >
            <Select.Option value="in">入库</Select.Option>
            <Select.Option value="out">出库</Select.Option>
            <Select.Option value="adjust">调整</Select.Option>
          </Select>
          <RangePicker 
            onChange={(dates) => setFilters({ ...filters, dateRange: dates || [] })}
          />
          <Button type="primary" icon={<SearchOutlined />} onClick={loadData}>查询</Button>
        </Space>
      </Card>

      <Card>
        <Table
          dataSource={data}
          columns={columns}
          loading={loading}
          rowKey="id"
          pagination={{ pageSize: 20 }}
        />
      </Card>
    </div>
  )
}