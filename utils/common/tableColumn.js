import * as R from 'ramda'
import _ from 'lodash'
import moment from 'moment'
import BrandIcon from '@/sections/BrandIcon'
import TagTableColumn from '@/sections/TagTableColumn'
import { SHARE_SCOPE } from '@/constants'
import store from '@/store'

export const getProjectTableColumn = ({ field = 'tenant', title = '项目', projectsItem = 'tenant', sortable = true } = {}) => {
  return {
    field,
    title,
    sortable,
    showOverflow: 'ellipsis',
    minWidth: 100,
    slots: {
      default: ({ row }, h) => {
        const ret = []
        let project = row[field]
        if (R.is(Array, project)) {
          for (let i = 0, len = project.length; i < len; i++) {
            const row = project[i]
            ret.push(<list-body-cell-wrap copy row={row} field={projectsItem} />)
          }
        } else {
          ret.push(<list-body-cell-wrap copy field={field} row={{ [field]: project }} />)
        }
        const domain = row.project_domain || row.domain
        if (domain) {
          ret.push(
            <list-body-cell-wrap hide-field copy field="domain" row={{ domain }}>
              <span class='text-weak'>{ domain }</span>
            </list-body-cell-wrap>
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
    showOverflow: 'ellipsis',
    minWidth: 100,
    slots: {
      default: ({ row }, h) => {
        const val = _.get(row, field)
        const ret = []
        ret.push(
          <list-body-cell-wrap hide-field copy field={field} row={row}>
            <span style={{ color: '#0A1F44' }}>{ val }</span>
          </list-body-cell-wrap>
        )
        if (row.zone) {
          ret.push(
            <list-body-cell-wrap hide-field copy field="zone" row={row}>
              <span style={{ color: '#53627C' }}>{ row.zone }</span>
            </list-body-cell-wrap>
          )
        }
        return ret
      },
    },
  }
}

export const getBrandTableColumn = ({ field = 'brand', title = '平台', hidden = false } = {}) => {
  return {
    field,
    title,
    width: 70,
    sortable: true,
    slots: {
      default: ({ row }, h) => {
        const val = _.get(row, field)
        if (!val) return '-'
        return [
          <BrandIcon name={ val } />,
        ]
      },
    },
    hidden,
  }
}

export const getStatusTableColumn = ({ field = 'status', title = '状态', statusModule, sortable = true, minWidth = 80 } = {}) => {
  return {
    field,
    title,
    sortable,
    showOverflow: 'ellipsis',
    minWidth,
    slots: {
      default: ({ row }, h) => {
        if (!statusModule) return 'status module undefined'
        return [
          <div class='text-truncate'>
            <status status={ row[field] } statusModule={ statusModule } />
          </div>,
        ]
      },
    },
  }
}

export const getEnabledTableColumn = ({ field = 'enabled', title = '启用状态', minWidth } = {}) => {
  return getStatusTableColumn({
    field,
    title,
    statusModule: 'enabled',
    minWidth,
  })
}

export const getPublicTableColumn = ({ field = 'share_mode', title = '共享模式' } = {}) => {
  const shareMode = {
    account_domain: '私有',
    system: '共享云账号',
    provider_domain: '共享订阅',
  }
  return {
    field,
    title,
    width: 100,
    slots: {
      default: ({ row }, h) => {
        return shareMode[row[field]]
      },
    },
  }
}

export const getNameDescriptionTableColumn = ({
  slotCallback,
  vm,
  addLock,
  hideField,
  showDesc = true,
  sortable = true,
  addBackup,
} = {}) => {
  return {
    field: 'name',
    title: '名称',
    sortable,
    showOverflow: 'ellipsis',
    minWidth: 100,
    fixed: 'left',
    slots: {
      default: ({ row }, h) => {
        const ret = [
          <list-body-cell-wrap copy edit row={row} list={vm.list} hideField={ hideField } addLock={ addLock } addBackup={ addBackup }>
            { slotCallback ? slotCallback(row) : null }
          </list-body-cell-wrap>,
        ]
        if (showDesc) {
          ret.push(<list-body-cell-wrap edit field="description" row={row} list={vm.list} />)
        }
        return ret
      },
    },
  }
}

export const getCopyWithContentTableColumn = ({
  field = 'name',
  title = '名称',
  hideField,
  message,
  sortable,
  slotCallback,
} = {}) => {
  return {
    field,
    title,
    sortable,
    showOverflow: 'ellipsis',
    minWidth: 100,
    slots: {
      default: ({ row }, h) => {
        const text = message || row[field] || '-'
        return [
          <list-body-cell-wrap copy field={field} row={row} hideField={hideField} message={text}>
            { slotCallback ? slotCallback(row) : null }
          </list-body-cell-wrap>,
        ]
      },
    },
  }
}

export const getIpsTableColumn = ({ field = 'ips', title = 'IP' } = {}) => {
  return {
    field,
    title,
    showOverflow: 'ellipsis',
    width: '120px',
    slots: {
      default: ({ row }, h) => {
        if (!row.eip && !row.ips) return '-'
        let ret = []
        if (row.eip) {
          ret.push(
            <list-body-cell-wrap row={row} field="eip" copy />
          )
        }
        if (row.ips) {
          const ips = row.ips.split(',').map(ip => {
            return <list-body-cell-wrap copy row={{ ip }} hide-field field="ip">{ ip }</list-body-cell-wrap>
          })
          ret = ret.concat(ips)
        }
        return ret
      },
    },
  }
}

export const getSwitchTableColumn = ({ field, title, change }) => {
  return {
    field,
    title,
    slots: {
      default: ({ row }, h) => {
        return [
          <a-switch checked={ row[field] } checkedChildren='开' unCheckedChildren='关' onChange={ change } />,
        ]
      },
    },
  }
}

export const getTagTableColumn = ({
  vm,
  field = 'metadata',
  title = '标签',
  ignoreKeys,
  needExt,
  resource,
} = {}) => {
  return {
    field,
    title,
    width: 50,
    slots: {
      default: ({ row }, h) => {
        return [
          <TagTableColumn
            vm={ vm }
            row={ row }
            metadata={ row[field] || {} }
            ignoreKeys={ ignoreKeys }
            needExt={ needExt }
            resource={ resource } />,
        ]
      },
    },
  }
}

export const isPublicTableColumn = ({ field = 'is_public', title = '共享范围' } = {}) => {
  return {
    field,
    title,
    minWidth: 70,
    visible: store.getters.isAdminMode || store.getters.isDomainMode,
    formatter: ({ row }) => {
      let text = ''
      if (!row.is_public) {
        text = '私有'
        if (row.shared_projects) {
          text = '项目'
        }
      } else {
        const scopeText = (SHARE_SCOPE[row.public_scope] || {})['label'] || row.public_scope
        if (row.public_scope) {
          text = scopeText
        } else {
          text = '系统'
        }
      }
      return text
    },
  }
}
export const getTimeTableColumn = ({
  field = 'created_at',
  title = '创建时间',
} = {}) => {
  return {
    field,
    title,
    width: 150,
    formatter: ({ cellValue }) => {
      return moment(cellValue).format()
    },
  }
}

export const getAccountTableColumn = ({
  field = 'account',
  title = '云账号',
} = {}) => {
  return {
    field,
    title,
    width: 150,
    formatter: ({ cellValue }) => {
      return cellValue || '-'
    },
  }
}
