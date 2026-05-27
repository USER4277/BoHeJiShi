import { useState, useEffect } from 'react'
import { Card, Descriptions, Tag, Table } from 'antd'
import { SafetyCertificateOutlined } from '@ant-design/icons'
import { systemApi } from '../../api/system'

export default function RoleList() {
  const [roles, setRoles] = useState([])

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const res: any = await systemApi.getRoles()
      setRoles(res.data)
    } catch (e) {
      console.error('加载失败', e)
    }
  }

  const roleColors: any = {
    ADMIN: 'red',
    MANAGER: 'blue',
    STAFF: 'green'
  }

  const permissions: any = {
    ADMIN: ['全部权限'],
    MANAGER: ['店铺管理', '商品管理', '库存管理', '销售管理', '会员管理', '报表查看'],
    STAFF: ['POS收银', '销售单据', '会员查询']
  }

  const columns = [
    { title: '角色代码', dataIndex: 'code', key: 'code' },
    { title: '角色名称', dataIndex: 'name', key: 'name' },
    { title: '描述', dataIndex: 'description', key: 'description' },
    { 
      title: '权限',
      key: 'permissions',
      render: (_: any, record: any) => (
        <div>
          {permissions[record.code]?.map((p: string, i: number) => (
            <Tag key={i}>{p}</Tag>
          ))}
        </div>
      )
    }
  ]

  return (
    <div>
      <h1 style={{ fontSize: 20, marginBottom: 16 }}>角色权限管理</h1>
      
      <Card title={<><SafetyCertificateOutlined /> 角色列表</>} style={{ marginBottom: 16 }}>
        <Table
          dataSource={roles}
          columns={columns}
          rowKey="id"
          pagination={false}
        />
      </Card>

      <Card title="权限说明">
        <Descriptions bordered column={1}>
          <Descriptions.Item label="超级管理员 (ADMIN)">
            拥有系统所有权限，可进行所有操作，包括系统配置、用户管理、数据备份等
          </Descriptions.Item>
          <Descriptions.Item label="店长 (MANAGER)">
            店铺管理人员权限，可管理商品、库存、销售、会员，查看经营报表
          </Descriptions.Item>
          <Descriptions.Item label="收银员 (STAFF)">
            普通收银员权限，仅可使用POS收银、查看销售单据、查询会员信息
          </Descriptions.Item>
        </Descriptions>
      </Card>
    </div>
  )
}