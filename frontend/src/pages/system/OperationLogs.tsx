import { useState, useEffect } from 'react'
import { Table, Card, Space, Input, Select, DatePicker, Button, Tag } from 'antd'
import { SearchOutlined, FileTextOutlined } from '@ant-design/icons'
import { systemApi } from '../../api/system'
import dayjs from 'dayjs'

const { RangePicker } = DatePicker

export default function OperationLogs() {
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [filters, setFilters] = useState({
    module: '',
    action: '',
    dateRange: []
  })

  useEffect(() => {
    loadData()
  }, [page, filters])

  const loadData = async () => {
    setLoading(true)
    try {
      const params: any = { page, pageSize: 20 }
      if (filters.module) params.module = filters.module
      if (filters.action) params.action = filters.action
      if (filters.dateRange?.length) {
        params.startDate = filters.dateRange[0].toDate()
        params.endDate = filters.dateRange[1].toDate()
      }
      
      const res: any = await systemApi.getLogs(params)
      setData(res.data.list)
      setTotal(res.data.total)
    } catch (e) {
      console.error('加载失败', e)
    } finally {
      setLoading(false)
    }
  }

  const actionColors: any = {
    CREATE: 'green',
    UPDATE: 'blue',
    DELETE: 'red',
    LOGIN: 'cyan',
    BACKUP: 'purple'
  }

  const columns = [
    { 
      title: '时间', 
      dataIndex: 'createdAt', 
      key: 'createdAt',
      render: (d: string) => dayjs(d).format('YYYY-MM-DD HH:mm:ss')
    },
    { title: '操作人', dataIndex: ['operator', 'realName'], key: 'operator' },
    { title: '模块', dataIndex: 'module', key: 'module', render: (m: string) => <Tag>{m}</Tag> },
    { 
      title: '操作', 
      dataIndex: 'action', 
      key: 'action',
      render: (a: string) => <Tag color={actionColors[a] || 'default'}>{a}</Tag>
    },
    { title: '描述', dataIndex: 'description', key: 'description' },
    { title: 'IP地址', dataIndex: 'ip', key: 'ip' }
  ]

  return (
    <div>
      <h1 style={{ fontSize: 20, marginBottom: 16 }}><FileTextOutlined /> 操作日志</h1>
      
      <Card style={{ marginBottom: 16 }}>
        <Space wrap>
          <Select
            placeholder="模块"
            style={{ width: 120 }}
            allowClear
            value={filters.module || undefined}
            onChange={v => setFilters({ ...filters, module: v || '' })}
          >
            <Select.Option value="SYS">系统</Select.Option>
            <Select.Option value="PRD">商品</Select.Option>
            <Select.Option value="SAL">销售</Select.Option>
            <Select.Option value="MEM">会员</Select.Option>
          </Select>
          <Select
            placeholder="操作类型"
            style={{ width: 120 }}
            allowClear
            value={filters.action || undefined}
            onChange={v => setFilters({ ...filters, action: v || '' })}
          >
            <Select.Option value="CREATE">新增</Select.Option>
            <Select.Option value="UPDATE">更新</Select.Option>
            <Select.Option value="DELETE">删除</Select.Option>
            <Select.Option value="LOGIN">登录</Select.Option>
            <Select.Option value="BACKUP">备份</Select.Option>
          </Select>
          <RangePicker 
            onChange={(dates) => setFilters({ ...filters, dateRange: dates || [] })}
          />
          <Button type="primary" icon={<SearchOutlined />} onClick={loadData}>查询</Button>
        </Space>
      </Card>

      <Table
        dataSource={data}
        columns={columns}
        loading={loading}
        rowKey="id"
        pagination={{
          current: page,
          total,
          onChange: setPage
        }}
      />
    </div>
  )
}