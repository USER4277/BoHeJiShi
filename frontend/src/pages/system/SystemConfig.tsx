import { useState, useEffect } from 'react'
import { Card, Form, Input, Button, Switch, message, Tabs, InputNumber, Row, Col } from 'antd'
import { SettingOutlined } from '@ant-design/icons'
import { systemApi } from '../../api/system'

const { TextArea } = Input

export default function SystemConfig() {
  const [loading, setLoading] = useState(false)
  const [form] = Form.useForm()
  const [activeTab, setActiveTab] = useState('shop')

  useEffect(() => {
    loadConfig()
  }, [])

  const loadConfig = async () => {
    try {
      const res: any = await systemApi.getConfig()
      const configObj: any = {}
      res.data.forEach((item: any) => {
        configObj[item.configKey] = item.configValue
      })
      form.setFieldsValue(configObj)
    } catch (e) {
      console.error('加载配置失败', e)
    }
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      const values = form.getFieldsValue()
      const configs = Object.entries(values).map(([key, value]) => ({
        configKey: key,
        configValue: String(value)
      }))
      await systemApi.batchUpdateConfig(configs)
      message.success('保存成功')
    } catch (e) {
      message.error('保存失败')
    } finally {
      setLoading(false)
    }
  }

  const tabItems = [
    {
      key: 'shop',
      label: '店铺信息',
      children: (
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="shop_name" label="店铺名称">
                <Input placeholder="请输入店铺名称" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="shop_phone" label="联系电话">
                <Input placeholder="请输入联系电话" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="shop_address" label="店铺地址">
            <Input placeholder="请输入店铺地址" />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="business_start" label="营业开始时间">
                <Input placeholder="如: 09:00" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="business_end" label="营业结束时间">
                <Input placeholder="如: 22:00" />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      )
    },
    {
      key: 'inventory',
      label: '库存设置',
      children: (
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="safe_stock" label="安全库存预警值">
                <InputNumber min={0} style={{ width: '100%' }} placeholder="库存低于此值时预警" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="auto_backup" label="自动备份" valuePropName="checked">
                <Switch />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      )
    },
    {
      key: 'member',
      label: '会员设置',
      children: (
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="points_rate" label="积分倍率(每消费1元)">
                <InputNumber min={0} style={{ width: '100%' }} placeholder="每消费1元获得的积分" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="points_to_money" label="积分抵现比例">
                <InputNumber min={1} style={{ width: '100%' }} placeholder="100积分抵多少元" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="silver_threshold" label="银卡升级门槛(元)">
                <InputNumber min={0} style={{ width: '100%' }} placeholder="累计消费达到此值升级银卡" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="gold_threshold" label="金卡升级门槛(元)">
                <InputNumber min={0} style={{ width: '100%' }} placeholder="累计消费达到此值升级金卡" />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      )
    },
    {
      key: 'print',
      label: '打印设置',
      children: (
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="print_copies" label="小票打印份数">
                <InputNumber min={1} max={5} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="print_qrcode" label="打印二维码" valuePropName="checked">
                <Switch />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="receipt_footer" label="小票底部公告">
            <TextArea rows={3} placeholder="如: 欢迎下次光临" />
          </Form.Item>
        </Form>
      )
    },
    {
      key: 'payment',
      label: '支付设置',
      children: (
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="enable_cash" label="现金支付" valuePropName="checked">
                <Switch />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="enable_wechat" label="微信支付" valuePropName="checked">
                <Switch />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="enable_alipay" label="支付宝" valuePropName="checked">
                <Switch />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="enable_card" label="银行卡" valuePropName="checked">
                <Switch />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="enable_member" label="会员卡支付" valuePropName="checked">
                <Switch />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      )
    }
  ]

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h1 style={{ fontSize: 20 }}><SettingOutlined /> 系统参数配置</h1>
        <Button type="primary" loading={loading} onClick={handleSave}>保存配置</Button>
      </div>

      <Card>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={tabItems}
        />
      </Card>
    </div>
  )
}