import { useState } from 'react'
import { Card, Button, Table, Space, Modal, message, Popconfirm, Tag } from 'antd'
import { CloudUploadOutlined, DeleteOutlined, DownloadOutlined, ReloadOutlined } from '@ant-design/icons'
import { systemApi } from '../../api/system'
import dayjs from 'dayjs'

export default function DataBackup() {
  const [backups, setBackups] = useState([])
  const [loading, setLoading] = useState(false)

  const loadBackups = async () => {
    setLoading(true)
    try {
      const res: any = await systemApi.getBackups()
      setBackups(res.data)
    } catch (e) {
      console.error('加载失败', e)
    } finally {
      setLoading(false)
    }
  }

  useState(() => {
    loadBackups()
  })

  const handleBackup = async () => {
    try {
      await systemApi.backup()
      message.success('备份成功')
      loadBackups()
    } catch (e) {
      message.error('备份失败')
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
  }

  const columns = [
    { 
      title: '文件名', 
      dataIndex: 'filename', 
      key: 'filename',
      render: (f: string) => <Tag>{f}</Tag>
    },
    { 
      title: '大小', 
      dataIndex: 'size', 
      key: 'size',
      render: (s: number) => formatFileSize(s)
    },
    { 
      title: '创建时间', 
      dataIndex: 'createdAt', 
      key: 'createdAt',
      render: (d: string) => dayjs(d).format('YYYY-MM-DD HH:mm:ss')
    },
    {
      title: '操作',
      key: 'action',
      render: () => (
        <Space>
          <Button size="small" type="link" icon={<DownloadOutlined />}>下载</Button>
          <Popconfirm title="确定删除?">
            <Button size="small" type="link" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      )
    }
  ]

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h1 style={{ fontSize: 20 }}>数据备份与恢复</h1>
        <Button type="primary" icon={<CloudUploadOutlined />} onClick={handleBackup}>
          立即备份
        </Button>
      </div>

      <Card title="备份说明" style={{ marginBottom: 16 }}>
        <ul style={{ lineHeight: 2 }}>
          <li>系统每天23:00自动备份数据库一次</li>
          <li>备份文件保存在: ~/Documents/薄荷集市/data/backup/</li>
          <li>默认保留最近30天的备份文件</li>
          <li>如需恢复备份，请联系技术人员处理</li>
        </ul>
      </Card>

      <Card title="备份历史">
        <Table
          dataSource={backups}
          columns={columns}
          loading={loading}
          rowKey="filename"
          pagination={false}
        />
      </Card>
    </div>
  )
}