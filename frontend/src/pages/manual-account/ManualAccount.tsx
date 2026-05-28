import React, { useState, useEffect } from 'react'
import { Card, Table, Button, Modal, Form, Input, Select, DatePicker, Space, message, Popconfirm, Statistic, Row, Col, Tabs } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, DollarOutlined, AccountBookOutlined } from '@ant-design/icons'
import manualAccountApi from '../../api/manual-account'
import dayjs from 'dayjs'

const { RangePicker } = DatePicker
const { TextArea } = Input

const ManualAccount: React.FC = () => {
  const [loading, setLoading] = useState(false)
  const [records, setRecords] = useState([])
  const [types, setTypes] = useState([])
  const [statistics, setStatistics] = useState<any>({})
  const [pagination, setPagination] = useState({ current: 1, pageSize: 20, total: 0 })
  const [modalVisible, setModalVisible] = useState(false)
  const [typeModalVisible, setTypeModalVisible] = useState(false)
  const [editingRecord, setEditingRecord] = useState<any>(null)
  const [editingType, setEditingType] = useState<any>(null)
  const [form] = Form.useForm()
  const [typeForm] = Form.useForm()
  const [dateRange, setDateRange] = useState<any>([dayjs().startOf('month'), dayjs().endOf('day')])
  const [categoryFilter, setCategoryFilter] = useState<string>()
  const [typeFilter, setTypeFilter] = useState<number>()
  const [activeTab, setActiveTab] = useState('records')

  useEffect(() => {
    loadTypes()
    loadRecords()
    loadStatistics()
  }, [pagination.current, dateRange, categoryFilter, typeFilter])

  const loadTypes = async () => {
    try {
      const res = await manualAccountApi.getTypes()
      if (res.data.code === 200) {
        setTypes(res.data.data)
      }
    } catch (err) {
      message.error('加载类型失败')
    }
  }

  const loadRecords = async () => {
    try {
      setLoading(true)
      const params: any = {
        page: pagination.current,
        pageSize: pagination.pageSize,
      }

      if (dateRange && dateRange[0] && dateRange[1]) {
        params.startDate = dateRange[0].format('YYYY-MM-DD')
        params.endDate = dateRange[1].format('YYYY-MM-DD')
      }

      if (categoryFilter) {
        params.category = categoryFilter
      }

      if (typeFilter) {
        params.typeId = typeFilter
      }

      const res = await manualAccountApi.getRecords(params)
      if (res.data.code === 200) {
        setRecords(res.data.data.list)
        setPagination({ ...pagination, total: res.data.data.total })
      }
    } catch (err) {
      message.error('加载记录失败')
    } finally {
      setLoading(false)
    }
  }

  const loadStatistics = async () => {
    try {
      const params: any = {}
      if (dateRange && dateRange[0] && dateRange[1]) {
        params.startDate = dateRange[0].format('YYYY-MM-DD')
        params.endDate = dateRange[1].format('YYYY-MM-DD')
      }

      const res = await manualAccountApi.getStatistics(params)
      if (res.data.code === 200) {
        setStatistics(res.data.data)
      }
    } catch (err) {
      message.error('加载统计失败')
    }
  }

  const handleAdd = () => {
    setEditingRecord(null)
    form.resetFields()
    form.setFieldsValue({ date: dayjs() })
    setModalVisible(true)
  }

  const handleEdit = (record: any) => {
    setEditingRecord(record)
    form.setFieldsValue({
      ...record,
      date: dayjs(record.date)
    })
    setModalVisible(true)
  }

  const handleDelete = async (id: number) => {
    try {
      const res = await manualAccountApi.deleteRecord(id)
      if (res.data.code === 200) {
        message.success('删除成功')
        loadRecords()
        loadStatistics()
      }
    } catch (err) {
      message.error('删除失败')
    }
  }

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      const data = {
        ...values,
        date: values.date.format('YYYY-MM-DD')
      }

      let res
      if (editingRecord) {
        res = await manualAccountApi.updateRecord(editingRecord.id, data)
      } else {
        res = await manualAccountApi.createRecord(data)
      }

      if (res.data.code === 200) {
        message.success(editingRecord ? '更新成功' : '创建成功')
        setModalVisible(false)
        loadRecords()
        loadStatistics()
      }
    } catch (err) {
      message.error('操作失败')
    }
  }

  const handleAddType = () => {
    setEditingType(null)
    typeForm.resetFields()
    setTypeModalVisible(true)
  }

  const handleEditType = (type: any) => {
    setEditingType(type)
    typeForm.setFieldsValue(type)
    setTypeModalVisible(true)
  }

  const handleDeleteType = async (id: number) => {
    try {
      const res = await manualAccountApi.deleteType(id)
      if (res.data.code === 200) {
        message.success('删除成功')
        loadTypes()
      }
    } catch (err: any) {
      message.error(err.response?.data?.message || '删除失败')
    }
  }

  const handleTypeSubmit = async () => {
    try {
      const values = await typeForm.validateFields()

      let res
      if (editingType) {
        res = await manualAccountApi.updateType(editingType.id, values)
      } else {
        res = await manualAccountApi.createType(values)
      }

      if (res.data.code === 200) {
        message.success(editingType ? '更新成功' : '创建成功')
        setTypeModalVisible(false)
        loadTypes()
      }
    } catch (err) {
      message.error('操作失败')
    }
  }

  const recordColumns = [
    {
      title: '日期',
      dataIndex: 'date',
      key: 'date',
      width: 120,
      render: (date: string) => dayjs(date).format('YYYY-MM-DD')
    },
    {
      title: '类型',
      dataIndex: ['type', 'name'],
      key: 'type',
      width: 120,
    },
    {
      title: '分类',
      dataIndex: ['type', 'category'],
      key: 'category',
      width: 80,
      render: (category: string) => (
        <span style={{ color: category === 'income' ? '#52c41a' : '#ff4d4f' }}>
          {category === 'income' ? '收入' : '支出'}
        </span>
      )
    },
    {
      title: '金额',
      dataIndex: 'amount',
      key: 'amount',
      width: 120,
      render: (amount: number, record: any) => (
        <span style={{
          color: record.type.category === 'income' ? '#52c41a' : '#ff4d4f',
          fontWeight: 'bold'
        }}>
          {record.type.category === 'income' ? '+' : '-'}¥{amount.toFixed(2)}
        </span>
      )
    },
    {
      title: '支付方式',
      dataIndex: 'payWay',
      key: 'payWay',
      width: 100,
      render: (payWay: string) => {
        const payWayMap: any = {
          cash: '现金',
          wechat: '微信',
          alipay: '支付宝',
          card: '银行卡',
        }
        return payWayMap[payWay] || '-'
      }
    },
    {
      title: '说明',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: '操作人',
      dataIndex: ['operator', 'realName'],
      key: 'operator',
      width: 100,
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      fixed: 'right' as const,
      render: (_: any, record: any) => (
        <Space>
          <Button type="link" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            编辑
          </Button>
          <Popconfirm title="确定删除吗?" onConfirm={() => handleDelete(record.id)}>
            <Button type="link" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      )
    }
  ]

  const typeColumns = [
    {
      title: '类型名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '分类',
      dataIndex: 'category',
      key: 'category',
      render: (category: string) => (
        <span style={{ color: category === 'income' ? '#52c41a' : '#ff4d4f' }}>
          {category === 'income' ? '收入' : '支出'}
        </span>
      )
    },
    {
      title: '说明',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: '排序',
      dataIndex: 'sort',
      key: 'sort',
      width: 80,
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_: any, record: any) => (
        <Space>
          <Button type="link" icon={<EditOutlined />} onClick={() => handleEditType(record)}>
            编辑
          </Button>
          <Popconfirm title="确定删除吗?" onConfirm={() => handleDeleteType(record.id)}>
            <Button type="link" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      )
    }
  ]

  const incomeTypes = types.filter((t: any) => t.category === 'income')
  const expenseTypes = types.filter((t: any) => t.category === 'expense')

  return (
    <div>
      <Card style={{ marginBottom: 16 }}>
        <Row gutter={16}>
          <Col span={6}>
            <Statistic
              title="总收入"
              value={statistics.totalIncome || 0}
              precision={2}
              prefix="¥"
              valueStyle={{ color: '#52c41a' }}
            />
          </Col>
          <Col span={6}>
            <Statistic
              title="总支出"
              value={statistics.totalExpense || 0}
              precision={2}
              prefix="¥"
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Col>
          <Col span={6}>
            <Statistic
              title="净额"
              value={statistics.netAmount || 0}
              precision={2}
              prefix="¥"
              valueStyle={{ color: (statistics.netAmount || 0) >= 0 ? '#52c41a' : '#ff4d4f' }}
            />
          </Col>
          <Col span={6}>
            <RangePicker
              value={dateRange}
              onChange={setDateRange}
              style={{ width: '100%', marginTop: 8 }}
            />
          </Col>
        </Row>
      </Card>

      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <Tabs.TabPane tab={<span><AccountBookOutlined />账目记录</span>} key="records">
          <Card
            title="手工账记录"
            extra={
              <Space>
                <Select
                  placeholder="全部分类"
                  value={categoryFilter}
                  onChange={setCategoryFilter}
                  allowClear
                  style={{ width: 120 }}
                >
                  <Select.Option value="income">收入</Select.Option>
                  <Select.Option value="expense">支出</Select.Option>
                </Select>
                <Select
                  placeholder="全部类型"
                  value={typeFilter}
                  onChange={setTypeFilter}
                  allowClear
                  style={{ width: 150 }}
                >
                  {types.map((t: any) => (
                    <Select.Option key={t.id} value={t.id}>
                      {t.name}
                    </Select.Option>
                  ))}
                </Select>
                <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
                  新增记录
                </Button>
              </Space>
            }
          >
            <Table
              columns={recordColumns}
              dataSource={records}
              rowKey="id"
              loading={loading}
              pagination={{
                ...pagination,
                showSizeChanger: true,
                showTotal: (total) => `共 ${total} 条记录`,
                onChange: (page, pageSize) => {
                  setPagination({ ...pagination, current: page, pageSize: pageSize || 20 })
                }
              }}
              scroll={{ x: 1200 }}
            />
          </Card>
        </Tabs.TabPane>

        <Tabs.TabPane tab={<span><DollarOutlined />类型管理</span>} key="types">
          <Card
            title="账目类型管理"
            extra={
              <Button type="primary" icon={<PlusOutlined />} onClick={handleAddType}>
                新增类型
              </Button>
            }
          >
            <Table
              columns={typeColumns}
              dataSource={types}
              rowKey="id"
              pagination={false}
            />
          </Card>
        </Tabs.TabPane>
      </Tabs>

      <Modal
        title={editingRecord ? '编辑记录' : '新增记录'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="typeId" label="类型" rules={[{ required: true, message: '请选择类型' }]}>
            <Select placeholder="请选择类型">
              <Select.OptGroup label="收入类型">
                {incomeTypes.map((t: any) => (
                  <Select.Option key={t.id} value={t.id}>
                    {t.name}
                  </Select.Option>
                ))}
              </Select.OptGroup>
              <Select.OptGroup label="支出类型">
                {expenseTypes.map((t: any) => (
                  <Select.Option key={t.id} value={t.id}>
                    {t.name}
                  </Select.Option>
                ))}
              </Select.OptGroup>
            </Select>
          </Form.Item>

          <Form.Item name="amount" label="金额" rules={[{ required: true, message: '请输入金额' }]}>
            <Input type="number" placeholder="请输入金额" prefix="¥" />
          </Form.Item>

          <Form.Item name="payWay" label="支付方式">
            <Select placeholder="请选择支付方式" allowClear>
              <Select.Option value="cash">现金</Select.Option>
              <Select.Option value="wechat">微信</Select.Option>
              <Select.Option value="alipay">支付宝</Select.Option>
              <Select.Option value="card">银行卡</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item name="date" label="日期" rules={[{ required: true, message: '请选择日期' }]}>
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item name="description" label="说明">
            <TextArea rows={3} placeholder="请输入说明" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={editingType ? '编辑类型' : '新增类型'}
        open={typeModalVisible}
        onOk={handleTypeSubmit}
        onCancel={() => setTypeModalVisible(false)}
      >
        <Form form={typeForm} layout="vertical">
          <Form.Item name="name" label="类型名称" rules={[{ required: true, message: '请输入类型名称' }]}>
            <Input placeholder="请输入类型名称" />
          </Form.Item>

          <Form.Item name="category" label="分类" rules={[{ required: true, message: '请选择分类' }]}>
            <Select placeholder="请选择分类">
              <Select.Option value="income">收入</Select.Option>
              <Select.Option value="expense">支出</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item name="description" label="说明">
            <TextArea rows={2} placeholder="请输入说明" />
          </Form.Item>

          <Form.Item name="sort" label="排序">
            <Input type="number" placeholder="请输入排序值" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default ManualAccount
