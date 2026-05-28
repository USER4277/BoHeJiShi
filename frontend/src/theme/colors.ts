// 薄荷清新主题色
export const mintTheme = {
  // 主色调 - 薄荷绿
  primary: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d',
  },

  // 辅助色 - 翡翠绿
  emerald: {
    50: '#ecfdf5',
    100: '#d1fae5',
    200: '#a7f3d0',
    300: '#6ee7b7',
    400: '#34d399',
    500: '#10b981',
    600: '#059669',
    700: '#047857',
    800: '#065f46',
    900: '#064e3b',
  },

  // 渐变背景
  gradients: {
    background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 30%, #bbf7d0 60%, #d1fae5 100%)',
    primary: 'linear-gradient(135deg, #22c55e, #16a34a)',
    card: 'linear-gradient(135deg, #4ade80, #22c55e)',
    soft: 'linear-gradient(135deg, #f0fdf4, #dcfce7)',
    page: 'linear-gradient(to bottom, #f0fdf4 0%, #e0f2fe 50%, #f0fdf4 100%)',
  },

  // 玻璃拟态效果
  glass: {
    background: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(34, 197, 94, 0.3)',
    boxShadow: '0 8px 32px rgba(34, 197, 94, 0.15)',
  },

  // 圆角
  borderRadius: {
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '20px',
    '2xl': '24px',
    '3xl': '28px',
  },
}

// Ant Design 主题配置
export const antdTheme = {
  token: {
    colorPrimary: '#22c55e',
    colorSuccess: '#22c55e',
    colorInfo: '#22c55e',
    colorLink: '#22c55e',
    borderRadius: 8,
    fontFamily: "'Noto Sans SC', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },
  components: {
    Button: {
      colorPrimary: '#22c55e',
      colorPrimaryHover: '#16a34a',
      borderRadius: 12,
      controlHeight: 40,
    },
    Input: {
      borderRadius: 12,
      controlHeight: 40,
    },
    Card: {
      borderRadiusLG: 16,
    },
    Table: {
      borderRadius: 16,
      headerBg: '#f0fdf4',
      headerColor: '#15803d',
    },
    Layout: {
      siderBg: '#ffffff',
      headerBg: '#ffffff',
    },
    Menu: {
      itemSelectedBg: '#dcfce7',
      itemSelectedColor: '#15803d',
      itemHoverBg: '#f0fdf4',
    },
  },
}
