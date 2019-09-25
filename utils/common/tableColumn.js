import BrandIcon from '@/sections/BrandIcon'

export const getProjectTableColumn = ({ field = 'tenant', title = '项目' } = {}) => {
  return {
    field,
    title,
    slots: {
      default: ({ row }, h) => {
        const ret = []
        ret.push(<div>{ row[field] }</div>)
        if (row.project_domain || row.domain) {
          ret.push(<div class='text-weak'>{ row.project_domain || row.domain }</div>)
        }
        return ret
      },
    },
  }
}

export const getRegionTableColumn = ({ field = 'region', title = '区域' } = {}) => {
  return {
    field,
    title,
    slots: {
      default: ({ row }, h) => {
        const ret = []
        ret.push(<div style={{ color: '#0A1F44' }}>{ row[field] }</div>)
        if (row.zone) {
          ret.push(<div style={{ color: '#53627C' }}>{ row.zone }</div>)
        }
        return ret
      },
    },
  }
}

export const getBrandTableColumn = ({ field = 'brand', title = '平台' } = {}) => {
  return {
    field,
    title,
    slots: {
      default: ({ row }, h) => {
        return [
          <BrandIcon name={ row[field] } />,
        ]
      },
    },
  }
}

export const getStatusTableColumn = ({ field = 'status', title = '状态', statusModule } = {}) => {
  return {
    field,
    title,
    slots: {
      default: ({ row }, h) => {
        if (!statusModule) return 'status module undefined'
        return [
          <status status={ row[field] } statusModule={ statusModule } />,
        ]
      },
    },
  }
}

export const getEnabledTableColumn = ({ field = 'enabled', title = '启用' } = {}) => {
  return getStatusTableColumn({
    field,
    title,
    statusModule: 'enabled',
  })
}

export const getPublicTableColumn = ({ field = 'is_public', title = '是否共享' } = {}) => {
  return {
    field,
    title,
    slots: {
      default: ({ row }) => {
        return row.is_public ? '共享' : '私有'
      },
    },
  }
}
