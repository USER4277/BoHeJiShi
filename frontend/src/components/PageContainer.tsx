import React, { ReactNode } from 'react'
import { mintTheme } from '../theme/colors'

interface PageContainerProps {
  title: string
  subtitle?: string
  extra?: ReactNode
  children: ReactNode
}

export default function PageContainer({ title, subtitle, extra, children }: PageContainerProps) {
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
          alignItems: 'flex-start',
          marginBottom: 24,
          gap: 16,
          flexWrap: 'wrap'
        }}>
          <div style={{ flex: '1 1 auto', minWidth: 200 }}>
            <h1 style={{
              fontSize: 28,
              fontWeight: 'bold',
              color: mintTheme.primary[800],
              margin: 0,
              lineHeight: 1.2
            }}>
              {title}
            </h1>
            {subtitle && (
              <p style={{
                color: mintTheme.primary[600],
                fontSize: 14,
                margin: '4px 0 0 0'
              }}>
                {subtitle}
              </p>
            )}
          </div>
          {extra && (
            <div style={{
              flex: '0 0 auto',
              display: 'flex',
              gap: 12,
              alignItems: 'center',
              flexWrap: 'wrap'
            }}>
              {extra}
            </div>
          )}
        </div>

        {/* Content */}
        {children}
      </div>
    </div>
  )
}
