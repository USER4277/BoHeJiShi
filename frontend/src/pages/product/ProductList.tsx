import { useState, useEffect } from 'react'
import { Table, Button, Space, Input, Tag, Popconfirm, message, Card, Select } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons'
import { productApi } from '../../api/product'
import { mintTheme } from '../../theme/colors'

export default function ProductList() {
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [keyword, setKeyword] = useState('')

  useEffect(() => {
    loadData()
  }, [page])

  const loadData = async () => {
    setLoading(true)
    try {
      const res: any = await productApi.getList({ page, pageSize: 20 })
      setData(res.data.list)
      setTotal(res.data.total)
    } catch (e) {
      console.error('加载失败', e)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await productApi.delete(id)
      message.success('删除成功')
      loadData()
    } catch (e) {
      message.error('删除失败')
    }
  }

  const columns = [
    {
      title: '编码',
      dataIndex: 'code',
      key: 'code',
      width: 120,
      render: (text: string) => (
        <span style={{ color: mintTheme.primary[600], fontFamily: 'monospace' }}>{text}</span>
      )
    },
    {
      title: '商品名称',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => (
        <span style={{ color: mintTheme.primary[800], fontWeight: 500 }}>{text}</span>
      )
    },
    {
      title: '分类',
      dataIndex: 'category',
      key: 'category',
      render: (cat: any) => (
        <Tag
          color="blue"
          style={{
            borderRadius: mintTheme.borderRadius.md,
            padding: '4px 12px'
          }}
        >
          {cat?.name || '-'}
        </Tag>
      )
    },
    {
      title: '吊牌价',
      dataIndex: 'price',
      key: 'price',
      align: 'right' as const,
      render: (p: number) => (
        <span style={{ color: mintTheme.primary[800], fontWeight: 'bold' }}>¥{p}</span>
      )
    },
    {
      title: '库存',
      dataIndex: 'stockQuantity',
      key: 'stockQuantity',
      align: 'right' as const,
      render: (qty: number) => (
        <span style={{
          color: qty < 10 ? '#f97316' : mintTheme.primary[600],
          fontWeight: qty < 10 ? 'bold' : 'normal'
        }}>
          {qty} {qty < 10 && '⚠️'}
        </span>
      )
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      align: 'center' as const,
      render: (s: number) => (
        <Tag
          color={s === 1 ? 'success' : 'error'}
          style={{
            borderRadius: mintTheme.borderRadius.md,
            padding: '4px 12px'
          }}
        >
          {s === 1 ? '上架' : '下架'}
        </Tag>
      )
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (d: string) => (
        <span style={{ color: '#6b7280' }}>
          {new Date(d).toLocaleDateString('zh-CN')}
        </span>
      )
    },
    {
      title: '操作',
      key: 'action',
      align: 'center' as const,
      width: 120,
      render: (_: any, record: any) => (
        <Space>
          <Button
            size="small"
            type="link"
            icon={<EditOutlined />}
            style={{ color: '#3b82f6' }}
          >
          </Button>
          <Popconfirm title="确定删除?" onConfirm={() => handleDelete(record.id)}>
            <Button
              size="small"
              type="link"
              danger
              icon={<DeleteOutlined />}
            />
          </Popconfirm>
        </Space>
      )
    }
  ]

  return (
    <div style={{
      background: mintTheme.gradients.soft,
      minHeight: 'calc(100vh - 64px)',
      padding: 24
    }}>
      <div style={{ maxWidth: 1400, margin: '0 auto' }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 24
        }}>
          <div>
            <h1 style={{
              fontSize: 28,
              fontWeight: 'bold',
              color: mintTheme.primary[800],
              margin: 0
            }}>
              商品管理
            </h1>
            <p style={{ color: mintTheme.primary[600], fontSize: 14, margin: '4px 0 0 0' }}>
              Product Management
            </p>
          </div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            size="large"
            style={{
              background: mintTheme.gradients.primary,
              border: 'none',
              borderRadius: mintTheme.borderRadius.lg,
              fontWeight: 600,
              boxShadow: '0 4px 12px rgba(34, 197, 94, 0.3)'
            }}
          >
            新增商品
          </Button>
        </div>

        {/* Filters */}
        <Card
          style={{
            ...mintTheme.glass,
            borderRadius: mintTheme.borderRadius.xl,
            marginBottom: 16,
            border: `1px solid ${mintTheme.primary[200]}`
          }}
          bodyStyle={{ padding: 16 }}
        >
          <Space size="middle" wrap>
            <Input
              placeholder="搜索商品..."
              prefix={<SearchOutlined />}
              value={keyword}
              onChange={e => setKeyword(e.target.value)}
              style={{
                width: 240,
                borderRadius: mintTheme.borderRadius.lg,
                border: `2px solid ${mintTheme.primary[200]}`
              }}
              size="large"
            />
            <Select
              placeholder="全部分类"
              style={{ width: 160 }}
              size="large"
              options={[
                { label: '全部分类', value: '' },
                { label: '戒指', value: 'ring' },
                { label: '项链', value: 'necklace' },
                { label: '耳饰', value: 'earring' },
              ]}
            />
            <Select
              placeholder="全部状态"
              style={{ width: 160 }}
              size="large"
              options={[
                { label: '全部状态', value: '' },
                { label: '上架', value: '1' },
                { label: '下架', value: '0' },
              ]}
            />
          </Space>
        </Card>

        {/* Table */}
        <Card
          style={{
            ...mintTheme.glass,
            borderRadius: mintTheme.borderRadius.xl,
            border: `1px solid ${mintTheme.primary[200]}`
          }}
          bodyStyle={{ padding: 0 }}
        >
          <Table
            dataSource={data}
            columns={columns}
            loading={loading}
            rowKey="id"
            pagination={{
              current: page,
              total,
              onChange: setPage,
              showTotal: (total) => (
                <span style={{ color: mintTheme.primary[600] }}>共 {total} 条记录</span>
              ),
              showSizeChanger: true,
              pageSizeOptions: ['10', '20', '50', '100']
            }}
            style={{
              borderRadius: mintTheme.borderRadius.xl,
              overflow: 'hidden'
            }}
          />
        </Card>
      </div>
    </div>
  )
}