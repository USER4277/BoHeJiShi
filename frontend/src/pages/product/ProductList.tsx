import { useState, useEffect } from 'react'
import { Table, Button, Space, Input, Tag, Popconfirm, message, Card, Select, Row, Col, Image, Segmented } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, AppstoreOutlined, UnorderedListOutlined, EyeOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { productApi } from '../../api/product'
import { mintTheme } from '../../theme/colors'
import PageContainer from '../../components/PageContainer'

export default function ProductList() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [keyword, setKeyword] = useState('')
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list')

  useEffect(() => {
    loadData()
  }, [page])

  const loadData = async () => {
    setLoading(true)
    try {
      const res: any = await productApi.getList({ page, pageSize: 20, keyword })
      setData(res.data.list)
      setTotal(res.data.total)
    } catch (e) {
      console.error('加载失败', e)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    setPage(1)
    loadData()
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
      title: '商品图片',
      dataIndex: 'mainImage',
      key: 'mainImage',
      width: 80,
      render: (img: string) => (
        <Image
          src={img || 'https://via.placeholder.com/60'}
          width={60}
          height={60}
          style={{ borderRadius: 8, objectFit: 'cover' }}
          preview={!!img}
          fallback="https://via.placeholder.com/60?text=No+Image"
        />
      )
    },
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
      title: '品牌',
      dataIndex: 'brand',
      key: 'brand',
      render: (brand: any) => brand?.name || '-'
    },
    {
      title: '材质',
      dataIndex: 'material',
      key: 'material',
      render: (material: any) => material?.name || '-'
    },
    {
      title: '吊牌价',
      dataIndex: 'price',
      key: 'price',
      align: 'right' as const,
      render: (val: number) => `¥${val.toFixed(2)}`
    },
    {
      title: '会员价',
      dataIndex: 'memberPrice',
      key: 'memberPrice',
      align: 'right' as const,
      render: (val: number) => val ? `¥${val.toFixed(2)}` : '-'
    },
    {
      title: '成本价',
      dataIndex: 'costPrice',
      key: 'costPrice',
      align: 'right' as const,
      render: (val: number) => val ? (
        <span style={{ color: '#f97316', fontWeight: 500 }}>
          ¥{val.toFixed(2)}
        </span>
      ) : '-'
    },
    {
      title: '库存',
      dataIndex: 'stockQuantity',
      key: 'stockQuantity',
      align: 'right' as const,
      render: (qty: number) => (
        <span style={{ color: qty > 0 ? mintTheme.primary[600] : '#ef4444', fontWeight: 500 }}>
          {qty}
        </span>
      )
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      align: 'center' as const,
      render: (status: number) => (
        <Tag color={status === 1 ? 'success' : 'error'}>
          {status === 1 ? '上架' : '下架'}
        </Tag>
      )
    },
    {
      title: '操作',
      key: 'action',
      width: 180,
      render: (_: any, record: any) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => navigate(`/products/${record.id}`)}
          >
            详情
          </Button>
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => navigate(`/products/${record.id}/edit`)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这个商品吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button
              type="link"
              size="small"
              danger
              icon={<DeleteOutlined />}
            >
              删除
            </Button>
          </Popconfirm>
        </Space>
      )
    }
  ]

  // 卡片视图渲染
  const renderGridView = () => (
    <Row gutter={[16, 16]}>
      {data.map((product: any) => (
        <Col key={product.id} xs={24} sm={12} md={8} lg={6} xl={4}>
          <Card
            hoverable
            style={{
              borderRadius: mintTheme.borderRadius.lg,
              border: `1px solid ${mintTheme.primary[200]}`,
              overflow: 'hidden'
            }}
            bodyStyle={{ padding: 12 }}
            cover={
              <div style={{
                width: '100%',
                paddingTop: '100%',
                position: 'relative',
                background: '#f5f5f5'
              }}>
                <img
                  src={product.mainImage || 'https://via.placeholder.com/200?text=No+Image'}
                  alt={product.name}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                  onError={(e: any) => {
                    e.target.src = 'https://via.placeholder.com/200?text=No+Image'
                  }}
                />
                {product.stockQuantity === 0 && (
                  <div style={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    background: '#ef4444',
                    color: 'white',
                    padding: '2px 8px',
                    borderRadius: 4,
                    fontSize: 12
                  }}>
                    缺货
                  </div>
                )}
              </div>
            }
          >
            <div style={{ marginBottom: 8 }}>
              <div style={{
                fontSize: 14,
                fontWeight: 500,
                color: mintTheme.primary[800],
                marginBottom: 4,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }} title={product.name}>
                {product.name}
              </div>
              <div style={{
                fontSize: 12,
                color: '#6b7280',
                marginBottom: 4
              }}>
                {product.code}
              </div>
              <div style={{ marginBottom: 4 }}>
                <Tag color="blue" style={{ fontSize: 11 }}>
                  {product.category?.name}
                </Tag>
              </div>
            </div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 8
            }}>
              <div>
                <div style={{
                  fontSize: 16,
                  fontWeight: 'bold',
                  color: '#ef4444'
                }}>
                  ¥{product.price.toFixed(2)}
                </div>
                {product.memberPrice && (
                  <div style={{
                    fontSize: 12,
                    color: '#6b7280'
                  }}>
                    会员 ¥{product.memberPrice.toFixed(2)}
                  </div>
                )}
                {product.costPrice && (
                  <div style={{
                    fontSize: 11,
                    color: '#f97316',
                    fontWeight: 500
                  }}>
                    成本 ¥{product.costPrice.toFixed(2)}
                  </div>
                )}
              </div>
              <div style={{
                fontSize: 12,
                color: mintTheme.primary[600]
              }}>
                库存 {product.stockQuantity}
              </div>
            </div>
            <Space size="small" style={{ width: '100%', justifyContent: 'space-between' }}>
              <Button
                type="primary"
                size="small"
                icon={<EyeOutlined />}
                onClick={() => navigate(`/products/${product.id}`)}
                style={{ flex: 1 }}
              >
                详情
              </Button>
              <Button
                size="small"
                icon={<EditOutlined />}
                onClick={() => navigate(`/products/${product.id}/edit`)}
              >
                编辑
              </Button>
              <Popconfirm
                title="确定删除？"
                onConfirm={() => handleDelete(product.id)}
                okText="确定"
                cancelText="取消"
              >
                <Button
                  size="small"
                  danger
                  icon={<DeleteOutlined />}
                />
              </Popconfirm>
            </Space>
          </Card>
        </Col>
      ))}
    </Row>
  )

  return (
    <PageContainer
      title="商品管理"
      subtitle="Product Management"
      extra={
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => navigate('/products/new')}
          size="large"
          style={{
            background: mintTheme.gradients.primary,
            border: 'none',
            borderRadius: mintTheme.borderRadius.lg
          }}
        >
          新增商品
        </Button>
      }
    >
      {/* 搜索和视图切换 */}
      <Card style={{ marginBottom: 16, borderRadius: mintTheme.borderRadius.lg }}>
        <Space size="middle" style={{ width: '100%', justifyContent: 'space-between' }}>
          <Space size="middle">
            <Input
              placeholder="搜索商品名称或编码"
              prefix={<SearchOutlined />}
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onPressEnter={handleSearch}
              style={{ width: 260 }}
              allowClear
            />
            <Button
              type="primary"
              icon={<SearchOutlined />}
              onClick={handleSearch}
              style={{
                background: mintTheme.gradients.primary,
                border: 'none'
              }}
            >
              搜索
            </Button>
          </Space>
          <Segmented
            value={viewMode}
            onChange={(value) => setViewMode(value as 'list' | 'grid')}
            options={[
              {
                label: '列表视图',
                value: 'list',
                icon: <UnorderedListOutlined />
              },
              {
                label: '卡片视图',
                value: 'grid',
                icon: <AppstoreOutlined />
              }
            ]}
          />
        </Space>
      </Card>

      {/* 内容区域 */}
      {viewMode === 'list' ? (
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
              pageSize: 20,
              onChange: setPage,
              showTotal: (total) => (
                <span style={{ color: mintTheme.primary[600] }}>共 {total} 条记录</span>
              ),
              showSizeChanger: false
            }}
          />
        </Card>
      ) : (
        <Card
          loading={loading}
          style={{
            ...mintTheme.glass,
            borderRadius: mintTheme.borderRadius.xl,
            border: `1px solid ${mintTheme.primary[200]}`
          }}
        >
          {renderGridView()}
          {total > 20 && (
            <div style={{ marginTop: 24, textAlign: 'center' }}>
              <Space>
                <Button
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                >
                  上一页
                </Button>
                <span style={{ color: mintTheme.primary[600] }}>
                  第 {page} 页，共 {Math.ceil(total / 20)} 页
                </span>
                <Button
                  disabled={page >= Math.ceil(total / 20)}
                  onClick={() => setPage(page + 1)}
                >
                  下一页
                </Button>
              </Space>
            </div>
          )}
        </Card>
      )}
    </PageContainer>
  )
}
