import { useState, useEffect } from 'react'
import { Form, Input, InputNumber, Select, Card, Button, Space, message, Upload, Modal, TreeSelect } from 'antd'
import { PlusOutlined, UploadOutlined, DeleteOutlined } from '@ant-design/icons'
import { useNavigate, useParams } from 'react-router-dom'
import { productApi, categoryApi } from '../../api/product'
import type { UploadFile } from 'antd/es/upload/interface'

const { TextArea } = Input

export default function ProductForm() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState([])
  const [mainImage, setMainImage] = useState<string>('')
  const [detailImages, setDetailImages] = useState<string[]>([])
  const [detailList, setDetailList] = useState<UploadFile[]>([])

  const isEdit = !!id

  useEffect(() => {
    loadCategories()
    if (isEdit) {
      loadProduct()
    }
  }, [id])

  const loadCategories = async () => {
    try {
      const res: any = await categoryApi.getList()
      setCategories(res.data)
    } catch (e) {
      console.error('加载分类失败', e)
    }
  }

  const loadProduct = async () => {
    try {
      const res: any = await productApi.getDetail(parseInt(id!))
      const data = res.data
      form.setFieldsValue({
        name: data.name,
        categoryId: data.categoryId,
        brand: data.brand,
        material: data.material,
        price: data.price,
        memberPrice: data.memberPrice,
        costPrice: data.costPrice,
      })
      setMainImage(data.mainImage || '')
      setDetailImages(data.detailImages ? JSON.parse(data.detailImages) : [])
    } catch (e) {
      console.error('加载商品失败', e)
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
              style={{ width: '100%' }}
            />
          </Form.Item>
          
          <Form.Item name="brand" label="品牌">
            <Input placeholder="请输入品牌" />
          </Form.Item>
          
          <Form.Item name="material" label="材质">
            <Input placeholder="如: 纯银、镀金、不锈钢" />
          </Form.Item>
          
          <Space style={{ width: '100%' }} size="large">
            <Form.Item name="price" label="吊牌价(元)" rules={[{ required: true }]}>
              <InputNumber min={0} precision={2} style={{ width: 150 }} />
            </Form.Item>
            
            <Form.Item name="memberPrice" label="会员价(元)">
              <InputNumber min={0} precision={2} style={{ width: 150 }} />
            </Form.Item>
            
            <Form.Item name="costPrice" label="成本价(元)">
              <InputNumber min={0} precision={2} style={{ width: 150 }} />
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
                action="/api/upload"
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
                action="/api/upload"
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

function renderCategoryTree(categories: any[], parentId: number | null = null): any[] {
  return categories
    .filter(c => c.parentId === parentId)
    .map(c => ({
      title: c.name,
      value: c.id,
      children: renderCategoryTree(categories, c.id)
    }))
}