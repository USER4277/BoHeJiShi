import { useState, useEffect } from 'react'
import { Form, Input, InputNumber, Select, Card, Button, Space, message, Upload, Modal, TreeSelect, Divider } from 'antd'
import { PlusOutlined, UploadOutlined, DeleteOutlined, CalculatorOutlined } from '@ant-design/icons'
import { useNavigate, useParams } from 'react-router-dom'
import { productApi, categoryApi, brandApi, materialApi } from '../../api/product'
import { systemApi } from '../../api/system'
import type { UploadFile } from 'antd/es/upload/interface'

const { TextArea } = Input

export default function ProductForm() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState([])
  const [brands, setBrands] = useState([])
  const [materials, setMaterials] = useState([])
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null)
  const [mainImage, setMainImage] = useState<string>('')
  const [detailImages, setDetailImages] = useState<string[]>([])
  const [detailList, setDetailList] = useState<UploadFile[]>([])
  const [memberDiscountRate, setMemberDiscountRate] = useState<number>(0.95) // 默认95折

  const isEdit = !!id

  useEffect(() => {
    loadCategories()
    loadMemberDiscount()
    if (isEdit) {
      loadProduct()
    }
  }, [id])

  useEffect(() => {
    if (selectedCategoryId) {
      loadBrands(selectedCategoryId)
      loadMaterials(selectedCategoryId)
    }
  }, [selectedCategoryId])

  const loadMemberDiscount = async () => {
    try {
      const res: any = await systemApi.getConfigByKey('memberDiscountRate')
      if (res.data?.configValue) {
        setMemberDiscountRate(parseFloat(res.data.configValue))
      }
    } catch (e) {
      console.warn('加载会员折扣配置失败，使用默认值95折', e)
    }
  }

  const loadCategories = async () => {
    try {
      const res: any = await categoryApi.getList()
      setCategories(res.data)
    } catch (e) {
      console.error('加载分类失败', e)
    }
  }

  const loadBrands = async (categoryId: number) => {
    try {
      const res: any = await brandApi.getList({ categoryId })
      setBrands(res.data.list || [])
    } catch (e) {
      console.error('加载品牌失败', e)
    }
  }

  const loadMaterials = async (categoryId: number) => {
    try {
      const res: any = await materialApi.getList({ categoryId })
      setMaterials(res.data.list || [])
    } catch (e) {
      console.error('加载材质失败', e)
    }
  }

  const loadProduct = async () => {
    try {
      const res: any = await productApi.getDetail(parseInt(id!))
      const data = res.data
      form.setFieldsValue({
        name: data.name,
        categoryId: data.categoryId,
        brandId: data.brandId,
        materialId: data.materialId,
        price: data.price,
        memberPrice: data.memberPrice,
        costPrice: data.costPrice,
      })
      setMainImage(data.mainImage || '')
      setDetailImages(data.detailImages ? JSON.parse(data.detailImages) : [])
      setSelectedCategoryId(data.categoryId)
    } catch (e) {
      console.error('加载商品失败', e)
    }
  }

  const handleCategoryChange = (categoryId: number) => {
    setSelectedCategoryId(categoryId)
    // 清空品牌和材质选择
    form.setFieldsValue({ brandId: undefined, materialId: undefined })
    setBrands([])
    setMaterials([])
  }

  // 根据成本价和毛利率计算吊牌价
  const calculatePriceFromMargin = (costPrice: number, marginRate: number) => {
    if (!costPrice || !marginRate) return null
    // 吊牌价 = 成本价 / (1 - 毛利率)
    const price = costPrice / (1 - marginRate / 100)
    return Math.round(price * 100) / 100 // 保留两位小数
  }

  // 根据吊牌价和会员折扣计算会员价
  const calculateMemberPrice = (price: number) => {
    if (!price || !memberDiscountRate) return null
    const memberPrice = price * memberDiscountRate
    return Math.round(memberPrice * 100) / 100 // 保留两位小数
  }

  // 毛利率变化时自动计算价格
  const handleMarginRateChange = (marginRate: number | null) => {
    if (!marginRate) return

    const costPrice = form.getFieldValue('costPrice')
    if (costPrice) {
      const calculatedPrice = calculatePriceFromMargin(costPrice, marginRate)
      if (calculatedPrice) {
        form.setFieldsValue({ price: calculatedPrice })

        // 同时计算会员价
        const calculatedMemberPrice = calculateMemberPrice(calculatedPrice)
        if (calculatedMemberPrice) {
          form.setFieldsValue({ memberPrice: calculatedMemberPrice })
        }
      }
    } else {
      message.warning('请先输入成本价')
    }
  }

  // 成本价变化时，如果有毛利率则自动计算价格
  const handleCostPriceChange = (costPrice: number | null) => {
    if (!costPrice) return

    const marginRate = form.getFieldValue('marginRate')
    if (marginRate) {
      const calculatedPrice = calculatePriceFromMargin(costPrice, marginRate)
      if (calculatedPrice) {
        form.setFieldsValue({ price: calculatedPrice })

        // 同时计算会员价
        const calculatedMemberPrice = calculateMemberPrice(calculatedPrice)
        if (calculatedMemberPrice) {
          form.setFieldsValue({ memberPrice: calculatedMemberPrice })
        }
      }
    }
  }

  // 吊牌价变化时自动计算会员价
  const handlePriceChange = (price: number | null) => {
    if (!price) return

    const calculatedMemberPrice = calculateMemberPrice(price)
    if (calculatedMemberPrice) {
      form.setFieldsValue({ memberPrice: calculatedMemberPrice })
    }
  }

  const handleMainImageChange = (info: any) => {
    if (info.file.status === 'done') {
      setMainImage(info.file.response.data.url)
    }
  }

  const handleDetailChange = ({ fileList }: any) => {
    setDetailList(fileList)
    setDetailImages(fileList.map((f: any) => f.response?.data?.url || f.url))
  }

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      const data = {
        ...values,
        mainImage,
        detailImages: JSON.stringify(detailImages)
      }
      
      if (isEdit) {
        await productApi.update(parseInt(id!), data)
        message.success('更新成功')
      } else {
        await productApi.create(data)
        message.success('创建成功')
      }
      
      navigate('/products')
    } catch (e: any) {
      message.error(e.message || '操作失败')
    }
  }

  return (
    <div>
      <Button onClick={() => navigate('/products')} style={{ marginBottom: 16 }}>
        返回
      </Button>
      
      <Card title={isEdit ? '编辑商品' : '新增商品'}>
        <Form form={form} layout="vertical" style={{ maxWidth: 800 }}>
          <Form.Item name="name" label="商品名称" rules={[{ required: true }]}>
            <Input placeholder="请输入商品名称" />
          </Form.Item>
          
          <Form.Item name="categoryId" label="商品分类" rules={[{ required: true }]}>
            <TreeSelect
              placeholder="请选择分类"
              treeData={renderCategoryTree(categories)}
              treeDefaultExpandAll
              onChange={handleCategoryChange}
              style={{ width: '100%' }}
            />
          </Form.Item>

          <Form.Item name="brandId" label="品牌">
            <Select
              placeholder="请先选择分类"
              disabled={!selectedCategoryId}
              options={brands.map(b => ({ label: b.name, value: b.id }))}
              allowClear
            />
          </Form.Item>

          <Form.Item name="materialId" label="材质">
            <Select
              placeholder="请先选择分类"
              disabled={!selectedCategoryId}
              options={materials.map(m => ({ label: m.name, value: m.id }))}
              allowClear
            />
          </Form.Item>

          <Divider orientation="left">
            <CalculatorOutlined /> 价格设置
          </Divider>

          <Space style={{ width: '100%', marginBottom: 16 }} align="start">
            <Form.Item
              name="costPrice"
              label="成本价(元)"
              rules={[{ required: true, message: '请输入成本价' }]}
            >
              <InputNumber
                min={0}
                precision={2}
                style={{ width: 150 }}
                placeholder="成本价"
                onChange={handleCostPriceChange}
              />
            </Form.Item>

            <Form.Item name="marginRate" label="毛利率(%)">
              <InputNumber
                min={0}
                max={100}
                precision={1}
                style={{ width: 150 }}
                placeholder="如: 30"
                onChange={handleMarginRateChange}
                addonAfter="%"
              />
            </Form.Item>
          </Space>

          <div style={{
            background: '#f0f9ff',
            padding: '12px 16px',
            borderRadius: 8,
            marginBottom: 16,
            fontSize: 12,
            color: '#0369a1'
          }}>
            💡 提示: 输入成本价和毛利率后，系统会自动计算吊牌价和会员价（当前会员折扣: {(memberDiscountRate * 100).toFixed(0)}折）
          </div>

          <Space style={{ width: '100%' }} size="large">
            <Form.Item
              name="price"
              label="吊牌价(元)"
              rules={[{ required: true, message: '请输入吊牌价' }]}
            >
              <InputNumber
                min={0}
                precision={2}
                style={{ width: 150 }}
                placeholder="吊牌价"
                onChange={handlePriceChange}
              />
            </Form.Item>

            <Form.Item name="memberPrice" label="会员价(元)">
              <InputNumber
                min={0}
                precision={2}
                style={{ width: 150 }}
                placeholder="会员价"
              />
            </Form.Item>
          </Space>
          
          <Form.Item label="主图">
            <div>
              {mainImage && (
                <div style={{ marginBottom: 8 }}>
                  <img src={mainImage} alt="主图" style={{ width: 120, height: 120, objectFit: 'cover' }} />
                  <Button type="link" danger onClick={() => setMainImage('')}>删除</Button>
                </div>
              )}
              <Upload
                action="/api/upload/image"
                name="file"
                showUploadList={false}
                onChange={handleMainImageChange}
              >
                <Button icon={<UploadOutlined />}>上传主图</Button>
              </Upload>
            </div>
          </Form.Item>
          
          <Form.Item label="详情图">
            <div>
              <Upload
                action="/api/upload/image"
                name="file"
                listType="picture-card"
                fileList={detailList}
                onChange={handleDetailChange}
              >
                <PlusOutlined />
              </Upload>
            </div>
          </Form.Item>
          
          <Form.Item>
            <Space>
              <Button type="primary" onClick={handleSubmit} loading={loading}>
                {isEdit ? '保存' : '创建'}
              </Button>
              <Button onClick={() => navigate('/products')}>取消</Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  )
}

function renderCategoryTree(categories: any[]): any[] {
  return categories.map(c => ({
    title: c.name,
    value: c.id,
    children: c.children && c.children.length > 0 ? renderCategoryTree(c.children) : undefined
  }))
}