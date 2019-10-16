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
            const row = project[i]
            ret.push(<list-body-cell-wrap copy row={row} field="tenant" />)
          }
        } else {
          ret.push(<list-body-cell-wrap copy field="project" row={{ project }} message={ project } />)
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

export const getNameDescriptionTableColumn = ({ slotCallback, vm, width, addLock, showDesc = true } = {}) => {
  return {
    width: width || 'auto',
    minWidth: 100,
    field: 'name',
    title: '名称',
    slots: {
      default: ({ row }, h) => {
        let lockSlot = null
        if (addLock && row.disable_delete) {
          lockSlot = <a-tooltip title='删除保护，如需解除，请点击【修改属性】'>
            <a-icon class='ml-1' type='lock' theme='twoTone' twoToneColor='#52c41a' />
          </a-tooltip>
        }
        return [
          <list-body-cell-wrap copy edit row={row} list={vm.list}>
            { slotCallback ? slotCallback(row) : null }
            { lockSlot }
          </list-body-cell-wrap>,
          showDesc ? <list-body-cell-wrap edit field="description" row={row} list={vm.list} /> : null,
        ]
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
        if (!row[field]) return '-'
        return [
          <list-body-cell-wrap copy field={field} row={row} />,
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
            <list-body-cell-wrap row={row} field="eip" copy><span class='ml-2 text-weak'>（弹性）</span></list-body-cell-wrap>
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
