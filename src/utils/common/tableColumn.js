import * as R from 'ramda'
import BrandIcon from '@/sections/BrandIcon'
import TagTableColumn from '@/sections/TagTableColumn'

export const getProjectTableColumn = ({ field = 'tenant', title = '项目', projectsItem = 'tenant', sortable = true } = {}) => {
  return {
    field,
    title,
    sortable,
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
    slots: {
      default: ({ row }, h) => {
        const ret = []
        ret.push(
          <list-body-cell-wrap hide-field copy field={field} row={row}>
            <span style={{ color: '#0A1F44' }}>{ row[field] }</span>
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

export const getBrandTableColumn = ({ field = 'brand', title = '平台' } = {}) => {
  return {
    field,
    title,
    slots: {
      default: ({ row }, h) => {
        if (!row[field]) return '-'
        return [
          <BrandIcon name={ row[field] } />,
        ]
      },
    },
  }
}

export const getStatusTableColumn = ({ field = 'status', title = '状态', statusModule, sortable = true } = {}) => {
  return {
    field,
    title,
    sortable,
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

export const getPublicTableColumn = ({ field = 'share_mode', title = '共享模式' } = {}) => {
  const shareMode = {
    account_domain: '私有',
    system: '共享云账号',
    provider_domain: '共享订阅',
  }
  return {
    field,
    title,
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
} = {}) => {
  return {
    field: 'name',
    title: '名称',
    sortable,
    slots: {
      default: ({ row }, h) => {
        let lockSlot = null
        if (addLock && row.disable_delete) {
          lockSlot = <a-tooltip title='删除保护，如需解除，请点击【修改属性】'>
            <a-icon class='ml-1' type='lock' theme='twoTone' twoToneColor='#52c41a' />
          </a-tooltip>
        }
        return [
          <list-body-cell-wrap copy edit row={row} list={vm.list} hideField={ hideField }>
            { slotCallback ? slotCallback(row) : null }
            { lockSlot }
          </list-body-cell-wrap>,
          showDesc ? <list-body-cell-wrap edit field="description" row={row} list={vm.list} /> : null,
        ]
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
    slots: {
      default: ({ row }, h) => {
        if (!row.eip && !row.ips) return '-'
        let ret = []
        if (row.eip) {
          ret.push(
            <list-body-cell-wrap row={row} field="eip" copy><span class='ml-2 text-weak'>（公网）</span></list-body-cell-wrap>
          )
        }
        if (row.ips) {
          const ips = row.ips.split(',').map(ip => {
            return <list-body-cell-wrap copy row={{ ip }} hide-field field="ip">{ ip }<span class='ml-2 text-weak'>（内网）</span></list-body-cell-wrap>
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
