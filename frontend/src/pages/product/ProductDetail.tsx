import { useState, useEffect } from 'react'
import { Card, Descriptions, Image, Button, Tag, Space, DescriptionsProps } from 'antd'
import { ArrowLeftOutlined } from '@ant-design/icons'
import { useNavigate, useParams } from 'react-router-dom'
import { productApi } from '../../api/product'

export default function ProductDetail() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (id) loadData()
  }, [id])

  const loadData = async () => {
    setLoading(true)
    try {
      const res: any = await productApi.getDetail(parseInt(id!))
      setData(res.data)
    } catch (e) {
      console.error('加载失败', e)
    } finally {
      setLoading(false)
    }
  }

  if (!data) return null

  const items: DescriptionsProps['items'] = [
    { key: 'code', label: '商品编码', children: data.code },
    { key: 'name', label: '商品名称', children: data.name },
    { key: 'category', label: '商品分类', children: data.category?.name },
    { key: 'brand', label: '品牌', children: data.brand || '-' },
    { key: 'material', label: '材质', children: data.material || '-' },
    { key: 'price', label: '吊牌价', children: `¥${data.price}` },
    { key: 'memberPrice', label: '会员价', children: data.memberPrice ? `¥${data.memberPrice}` : '-' },
    { key: 'costPrice', label: '成本价', children: data.costPrice ? `¥${data.costPrice}` : '-' },
    { key: 'stockQuantity', label: '库存数量', children: data.stockQuantity },
    { 
      key: 'status', 
      label: '状态', 
      children: <Tag color={data.status === 1 ? 'green' : 'red'}>{data.status === 1 ? '上架' : '下架'}</Tag>
    },
    { key: 'createdAt', label: '创建时间', children: new Date(data.createdAt).toLocaleString() },
  ]

  return (
    <div>
      <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/products')} style={{ marginBottom: 16 }}>
        返回
      </Button>

      <Card title="商品信息">
        <Descriptions items={items} column={2} />
      </Card>

      {data.mainImage && (
        <Card title="商品图片" style={{ marginTop: 16 }}>
          <div style={{ marginBottom: 16 }}>
            <h4>主图</h4>
            <Image src={data.mainImage} width={200} />
          </div>
          {data.detailImages && (
            <div>
              <h4>详情图</h4>
              <Space>
                {JSON.parse(data.detailImages).map((url: string, i: number) => (
                  <Image key={i} src={url} width={120} />
                ))}
              </Space>
            </div>
          )}
        </Card>
      )}

      {data.skus?.length > 0 && (
        <Card title="SKU规格" style={{ marginTop: 16 }}>
          <Space direction="vertical" style={{ width: '100%' }}>
            {data.skus.map((sku: any) => (
              <Card key={sku.id} size="small">
                <Descriptions column={4} size="small">
                  <Descriptions.Item label="SKU编码">{sku.skuCode}</Descriptions.Item>
                  <Descriptions.Item label="规格属性">{sku.attributes || '-'}</Descriptions.Item>
                  <Descriptions.Item label="库存">{sku.quantity}</Descriptions.Item>
                  <Descriptions.Item label="价格">¥{sku.price}</Descriptions.Item>
                </Descriptions>
              </Card>
            ))}
          </Space>
        </Card>
      )}
    </div>
  )
}