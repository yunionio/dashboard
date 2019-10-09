import * as R from 'ramda'
import BrandIcon from '@/sections/BrandIcon'

export const getProjectTableColumn = ({ field = 'tenant', title = '项目' } = {}) => {
  return {
    field,
    title,
    slots: {
      default: ({ row }, h) => {
        const ret = []
        let project = row[field]
        if (R.is(Array, project)) {
          for (let i = 0, len = project.length; i < len; i++) {
            ret.push(<copy-with-content message={ project[i]['tenant'] }>{ project[i]['tenant'] }</copy-with-content>)
          }
        } else {
          ret.push(<copy-with-content message={ project }>{ project }</copy-with-content>)
        }
        const domain = row.project_domain || row.domain
        if (domain) {
          ret.push(
            <copy-with-content message={ domain }>
              <span class='text-weak'>{ domain }</span>
            </copy-with-content>
          )
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
        ret.push(
          <copy-with-content message={ row[field] }>
            <span style={{ color: '#0A1F44' }}>{ row[field] }</span>
          </copy-with-content>
        )
        if (row.zone) {
          ret.push(
            <copy-with-content message={ row.zone }>
              <span style={{ color: '#53627C' }}>{ row.zone }</span>
            </copy-with-content>
          )
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

export const getCopyWithContentTableColumn = ({ field = 'name', title = '名称' } = {}) => {
  return {
    field,
    title,
    slots: {
      default: ({ row }, h) => {
        return [
          <copy-with-content message={ row[field] }>{ row[field] }</copy-with-content>,
        ]
      },
    },
  }
}
