import * as R from 'ramda'
import _ from 'lodash'
import moment from 'moment'
import BrandIcon from '@/sections/BrandIcon'
import TagTableColumn from '@/sections/TagTableColumn'
import IpSupplement from '@/sections/IpSupplement'
import store from '@/store'
import i18n from '@/locales'
import { hasPermission } from '@/utils/auth'
import { typeClouds } from '@/utils/common/hypervisor'
import { HOST_CPU_ARCHS } from '@/constants/compute'
import expectStatus from '@/constants/expectStatus'
import setting from '@/config/setting'

export const getProjectTableColumn = ({ vm = {}, field = 'tenant', title = i18n.t('res.project'), projectsItem = 'tenant', sortable = true, hidden = false, minWidth = 100 } = {}) => {
  return {
    field,
    title,
    sortable,
    showOverflow: 'ellipsis',
    minWidth,
    slots: {
      default: ({ row }, h) => {
        const ret = []
        const project = row[field]
        if (vm.isPreLoad && !project) return [<data-loading />]
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
            </list-body-cell-wrap>,
          )
        }
        return ret
      },
    },
    hidden,
  }
}

export const getRegionTableColumn = ({ field = 'region', title = i18n.t('res.region'), showOverflow = 'ellipsis', hidden, vm = {} } = {}) => {
  return {
    field,
    title,
    showOverflow,
    minWidth: 120,
    slots: {
      default: ({ row }, h) => {
        const val = _.get(row, field)
        if (vm.isPreLoad && !val) return [<data-loading />]
        const ret = []
        ret.push(
          <list-body-cell-wrap hide-field copy field={field} row={row}>
            <span style={{ color: '#0A1F44' }}>{ val }</span>
          </list-body-cell-wrap>,
        )
        if (row.zone) {
          ret.push(
            <list-body-cell-wrap hide-field copy field="zone" row={row}>
              <span style={{ color: '#53627C' }}>{ row.zone }</span>
            </list-body-cell-wrap>,
          )
        }
        if (row.zone_1_name) {
          ret.push(
            <list-body-cell-wrap hide-field copy field="zone_1_name" row={row}>
              <span style={{ color: '#53627C' }}>{ i18n.t('scope.text_958', [row.zone_1_name]) }</span>
            </list-body-cell-wrap>,
          )
        }
        return ret
      },
    },
    hidden,
  }
}

export const getBrandTableColumn = ({ field = 'brand', title = i18n.t('table.title.brand'), hidden = false, minWidth = 70, sortable = true } = {}) => {
  return {
    field,
    title,
    minWidth,
    sortable,
    slots: {
      default: ({ row }, h) => {
        const val = _.get(row, field)
        if (!val) return [<data-loading />]
        return [
          <BrandIcon name={ val } />,
        ]
      },
    },
    hidden,
  }
}

export const getStatusTableColumn = ({ vm = {}, field = 'status', title = i18n.t('common.status'), statusModule, sortable = true, minWidth = 120, slotCallback } = {}) => {
  return {
    field,
    title,
    sortable,
    showOverflow: 'ellipsis',
    minWidth,
    slots: {
      default: ({ row }, h) => {
        if (slotCallback && R.type(slotCallback) === 'Function') {
          const slot = slotCallback(row)
          if (slot || slot === 0) return slot
        }
        if (!statusModule) return 'status module undefined'
        const val = _.get(row, field) || false
        if (R.isNil(val) || !_.get(row, field)) return '-'
        const log = <side-page-trigger class="ml-1" onTrigger={ () => vm.handleOpenSidepage(row, 'event-drawer') }>{ i18n.t('common.view_logs') }</side-page-trigger>
        const isError = ['invalid', 'unknown'].includes(val) || /failed|fail$/.test(val)
        return [
          <div class='d-flex align-items-center text-truncate'>
            <status status={ val } statusModule={ statusModule } />
            { isError ? log : null }
          </div>,
        ]
      },
    },
  }
}

export const getEnabledTableColumn = ({ field = 'enabled', title = i18n.t('table.title.enable_status'), minWidth = 90 } = {}) => {
  return getStatusTableColumn({
    field,
    title,
    statusModule: 'enabled',
    minWidth,
  })
}

export const getPublicTableColumn = ({ field = 'share_mode', title = i18n.t('common_286') } = {}) => {
  const shareMode = {
    account_domain: i18n.t('common_287'),
    system: i18n.t('common_288'),
    provider_domain: i18n.t('common_289'),
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
  resource = '', // 资源名称
  title = i18n.t('table.title.name'),
  field = 'name',
  descField = 'description',
  slotCallback,
  onManager,
  steadyStatus,
  statusModule,
  addLock,
  hideField,
  showDesc = true,
  sortable = true,
  addBackup,
  formRules,
  descriptionRules = [],
  cellWrapSlots,
  edit = true,
  editDesc = true,
  minWidth = 100,
  message,
} = {}) => {
  return {
    field,
    title,
    sortable,
    showOverflow: 'ellipsis',
    minWidth,
    slots: {
      default: ({ row }, h) => {
        const text = (message && R.type(message) === 'Function') ? message(row) : (message || (row[field] && row[field].toString()) || '-')
        const ret = [
          h('list-body-cell-wrap', {
            props: {
              message: text,
              resource: resource,
              copy: true,
              edit: (R.type(edit) === 'Function' && edit(row)) || edit === true,
              field,
              row,
              onManager,
              steadyStatus: steadyStatus || (expectStatus[statusModule] && Object.values(expectStatus[statusModule]).flat()),
              hideField,
              addLock,
              addBackup,
              formRules,
            },
            scopedSlots: {
              default: () => slotCallback ? slotCallback(row, h) : null,
              ...(cellWrapSlots && R.is(Function, cellWrapSlots) ? cellWrapSlots(row) : {}),
            },
          }),
        ]
        if ((R.type(showDesc) === 'Function' && showDesc(row)) || showDesc === true) {
          descriptionRules.push({
            max: 256,
            message: i18n.t('validator.maxLength', ['256']),
          })
          let field = descField
          if (_.get(row, '_i18n.description')) field = '_i18n.description' // 如果多语言里面有备注，则取多语言里的字段
          ret.push(h('list-body-cell-wrap', {
            props: {
              resource: resource,
              edit: (R.is(Function, editDesc) && editDesc(row)) || editDesc === true,
              field,
              row,
              onManager,
              steadyStatus,
              formRules: descriptionRules,
            },
          }))
        }
        return ret
      },
    },
  }
}

export const getCopyWithContentTableColumn = ({
  field = 'name',
  title = i18n.t('common_186'),
  hideField,
  message,
  sortable,
  slotCallback,
  hidden,
  minWidth = 100,
  vm = {},
} = {}) => {
  return {
    field,
    title,
    sortable,
    showOverflow: 'ellipsis',
    minWidth,
    slots: {
      default: ({ row }, h) => {
        if (vm.isPreLoad && !row[field]) return [<data-loading />]
        const text = (message && R.type(message) === 'Function') ? message(row) : (message || (row[field] && row[field].toString()) || '-')
        return [
          <list-body-cell-wrap copy field={field} row={row} hideField={hideField} message={text}>
            { slotCallback ? slotCallback(row) : null }
          </list-body-cell-wrap>,
        ]
      },
    },
    hidden,
  }
}

export const getIpsTableColumn = ({ field = 'ips', title = 'IP', vm = {}, sortable = false } = {}) => {
  return {
    field,
    title,
    width: '180px',
    sortBy: 'order_by_ip',
    sortable,
    slots: {
      default: ({ row }, h) => {
        if (!row.eip && !row.ips && !row.vips) {
          if (row.hypervisor === typeClouds.hypervisorMap.esxi.key && ['ready', 'running'].includes(row.status)) {
            return [
              h(IpSupplement, {
                props: {
                  row,
                  field,
                  vm,
                },
              }),
            ]
          } else {
            if (vm.isPreLoad) return [<data-loading />]
            return []
          }
        }
        let ret = []
        if (row.eip) {
          ret.push(
            <list-body-cell-wrap row={row} field="eip" copy><span class="text-color-help">({ row.eip_mode === 'elastic_ip' ? i18n.t('common_290') : i18n.t('common_291') })</span></list-body-cell-wrap>,
          )
        }
        if (row.ips) {
          const iparr = row.ips.split(',')
          const ips = iparr.map(ip => {
            return <list-body-cell-wrap copy row={{ ip }} hide-field field="ip">{ ip }<span class="text-color-help">({ i18n.t('common_287') })</span></list-body-cell-wrap>
          })
          ret = ret.concat(ips)
        }
        if (row.vips) {
          const ips = row.vips.map(ip => {
            return <list-body-cell-wrap copy row={{ ip }} hide-field field="ip">{ip}<span class="text-color-help">({i18n.t('common_vip')})</span></list-body-cell-wrap>
          })
          ret = ret.concat(ips)
        }
        if (row.vip) {
          const iparr = row.vip.split(',')
          const ips = iparr.map(ip => {
            return <list-body-cell-wrap copy row={{ ip }} hide-field field="ip">{ip}<span class="text-color-help">({i18n.t('common_vip')})</span></list-body-cell-wrap>
          })
          ret = ret.concat(ips)
        }
        if (row.vip_eip) {
          const iparr = row.vip_eip.split(',')
          const ips = iparr.map(ip => {
            return <list-body-cell-wrap copy row={{ ip }} hide-field field="ip">{ip}<span class="text-color-help">({i18n.t('common_evip')})</span></list-body-cell-wrap>
          })
          ret = ret.concat(ips)
        }
        return ret
      },
    },
  }
}

export const getSwitchTableColumn = ({ field, title, change, disabled }) => {
  return {
    field,
    title,
    slots: {
      default: ({ row }, h) => {
        let checked = _.get(row, field)
        if (R.is(String, checked)) {
          if (checked === 'true') checked = true
          if (checked === 'false') checked = false
        }
        return [
          <a-switch checked={ checked } disabled={ disabled } checkedChildren={i18n.t('common_292')} unCheckedChildren={i18n.t('common_293')} onChange={ change } />,
        ]
      },
    },
  }
}

export const getTagTableColumn = ({
  field = 'metadata',
  title = i18n.t('table.title.tag'),
  ignoreKeys,
  needExt,
  resource,
  onManager,
  columns,
  tipName,
  ignorePrefix,
  width = 50,
  customTitle = '',
  list = {},
  params = {}, // 请求已有标签传入参数
} = {}) => {
  return {
    field,
    title,
    width,
    slots: {
      default: ({ row }, h) => {
        return [
          h(TagTableColumn, {
            props: {
              row,
              onManager,
              metadata: _.get(row, field) || {},
              ignoreKeys,
              needExt,
              resource,
              columns,
              tipName,
              ignorePrefix,
              customTitle,
              list,
              tagParams: params,
            },
          }),
        ]
      },
    },
  }
}

export const isPublicTableColumn = ({ field = 'is_public', title = i18n.t('common_101') } = {}) => {
  return {
    field,
    title,
    minWidth: 70,
    visible: store.getters.isAdminMode || store.getters.isDomainMode,
    formatter: ({ row }) => {
      let text = ''
      if (row.is_public === false || row.is_public === 'false') {
        text = i18n.t('common_287')
        if (row.shared_projects) {
          text = i18n.t('shareScope.project')
        }
      } else {
        const scopeText = i18n.t(`shareScope.${row.public_scope}`)
        if (row.public_scope) {
          text = scopeText
        } else {
          text = i18n.t('shareScope.system')
        }
      }
      return text
    },
  }
}
export const getTimeTableColumn = ({
  field = 'created_at',
  title = i18n.t('table.title.create_time'),
  sortable = true,
  fromNow = false,
  vm = {},
} = {}) => {
  return {
    field,
    title,
    width: 160,
    sortable,
    slots: {
      default: ({ row }, h) => {
        if (vm.isPreLoad && !row[field]) return [<data-loading />]
        if (fromNow) return row[field] ? moment(row[field]).fromNow() : '-'
        return row[field] ? moment(row[field]).format() : '-'
      },
    },
  }
}

export const getTimeRangeColumn = ({
  field = 'time_range',
  start_field = 'start_time',
  end_field = 'end_time',
  title = i18n.t('table.title.create_time'),
  sortable = false,
} = {}) => {
  return {
    field,
    start_field,
    end_field,
    title,
    width: 160,
    sortable,
    slots: {
      default: ({ row }, h) => {
        const start = row[start_field] ? moment(row[start_field]).format() : '-'
        const end = row[end_field] ? moment(row[end_field]).format() : '-'
        return `${start} ~ ${end}`
      },
    },
  }
}

export const getAccountTableColumn = ({
  field = 'account',
  title = i18n.t('res.cloudaccount'),
  hidden,
  managerField = 'manager',
  brandField = 'brand',
  vm = {},
} = {}) => {
  return {
    field,
    title,
    minWidth: 120,
    showOverflow: 'ellipsis',
    hidden: () => {
      if (store.getters.isProjectMode) {
        return true
      }
      if (R.is(Function, hidden)) return hidden()
      return hidden
    },
    slots: {
      default: ({ row }, h) => {
        let val = _.get(row, field)
        if (vm.isPreLoad && !val) return [<data-loading />]
        // OneStack => oem en
        if (val === 'OneStack' && row[brandField] && row[brandField] === 'OneCloud') {
          val = setting.brand.en || val
        }
        const ret = []
        ret.push(
          <list-body-cell-wrap hide-field copy field={field} row={{ [field]: val }}>
            <span style={{ color: '#0A1F44' }}>{ val || '-' }</span>
          </list-body-cell-wrap>,
        )
        if (row[managerField]) {
          ret.push(
            <list-body-cell-wrap hide-field copy field={managerField} row={row}>
              <span style={{ color: '#53627C' }}>{row[managerField] }</span>
            </list-body-cell-wrap>,
          )
        }
        return ret
      },
    },
  }
}

export const getBillingTypeTableColumn = ({ field = 'billing_type', title = i18n.t('table.title.bill_type'), width = '120px' } = {}) => {
  return {
    field,
    title,
    showOverflow: 'ellipsis',
    width,
    slots: {
      default: ({ row }, h) => {
        const ret = []
        if (row[field] === 'postpaid') {
          ret.push(<div style={{ color: '#0A1F44' }}>{i18n.t('billingType.postpaid')}</div>)
        } else if (row[field] === 'prepaid') {
          ret.push(<div style={{ color: '#0A1F44' }}>{i18n.t('billingType.prepaid')}</div>)
        }
        if (row.expired_at) {
          const dateArr = moment(row.expired_at).fromNow().split(' ')
          const date = dateArr.join(' ')
          const seconds = moment(row.expired_at).diff(new Date()) / 1000
          const textColor = seconds / 24 / 60 / 60 < 7 ? '#DD2727' : '#53627C'
          const text = seconds < 0 ? i18n.t('common_296') : i18n.t('common_297', [date])
          ret.push(<div style={{ color: textColor }}>{ text }</div>)
        }
        return ret
      },
    },
  }
}

export const getPublicScopeTableColumn = ({
  field = 'public_scope',
  title = i18n.t('table.title.share_range'),
  vm,
  resource,
  width = '110px',
  hidden,
} = {}) => {
  return {
    title,
    field,
    showOverflow: 'title',
    width,
    hidden: () => {
      if (!store.getters.l3PermissionEnable && (store.getters.scopeResource && store.getters.scopeResource.domain.includes(resource))) {
        return true
      }
      if (R.is(Function, hidden)) return hidden()
      return hidden
    },
    slots: {
      default: ({ row }, h) => {
        const i18nPrefix = store.getters.l3PermissionEnable ? 'shareDesc' : 'shareDescPrimary'
        if (row.is_public === false || row.is_public === 'false') return i18n.t(`${i18nPrefix}.none`)
        const { public_scope: publicScope, shared_projects: sharedProjects, shared_domains: sharedDomains } = row
        if (publicScope === 'project' && sharedProjects && sharedProjects.length > 0) {
          return [
            <a onClick={() => {
              vm.createDialog('CommonDialog', {
                hiddenCancel: true,
                header: i18n.t('common_101'),
                body: () => {
                  return [
                    <a-alert class='mb-2' message={ i18n.t('common_298', [sharedProjects.length]) } />,
                    <dialog-table
                      vxeGridProps={{ showOverflow: 'title' }}
                      data={ sharedProjects }
                      columns={
                        [
                          getCopyWithContentTableColumn({
                            field: 'id',
                            title: 'ID',
                            minWidth: 140,
                          }),
                          getCopyWithContentTableColumn({
                            field: 'name',
                            title: i18n.t('common_186'),
                          }),
                          getCopyWithContentTableColumn({
                            field: 'domain',
                            title: i18n.t('table.title.owner_domain'),
                          }),
                        ]
                      } />,
                  ]
                },
              })
            }}>{ i18n.t(`${i18nPrefix}.project`) }</a>,
          ]
        }
        if (publicScope === 'domain') {
          if (sharedDomains && sharedDomains.length > 0) {
            return [
              <a onClick={() => {
                vm.createDialog('CommonDialog', {
                  hiddenCancel: true,
                  header: i18n.t('common_101'),
                  body: () => {
                    return [
                      <a-alert class='mb-2' message={ i18n.t('common_300', [sharedDomains.length]) } />,
                      <dialog-table
                        vxeGridProps={{ showOverflow: 'title' }}
                        data={ sharedDomains }
                        columns={
                          [
                            getCopyWithContentTableColumn({
                              field: 'id',
                              title: 'ID',
                              minWidth: 140,
                            }),
                            getCopyWithContentTableColumn({
                              field: 'name',
                              title: i18n.t('common_186'),
                            }),
                          ]
                        } />,
                    ]
                  },
                })
              }}>{ i18n.t(`${i18nPrefix}.domain`) }</a>,
            ]
          }
          return i18n.t(`${i18nPrefix}.projectAll`)
        }
        if (publicScope === 'system') {
          return i18n.t(`${i18nPrefix}.domainAll`)
        }
        return '-'
      },
    },
  }
}

export const getProjectDomainTableColumn = ({
  field = 'project_domain',
  title = i18n.t('table.title.owner_domain'),
  sortable = true,
  vm = {},
} = {}) => {
  return getCopyWithContentTableColumn({
    title,
    field,
    sortable,
    hidden: !(store.getters.isAdminMode || store.getters.isDomainMode),
    vm,
  })
}

export const getBillingTableColumn = ({
  vm,
  field = 'billing_type',
  title = i18n.t('table.title.bill_type'),
  minWidth = 120,
  showOverflow = 'ellipsis',
  hiddenSetBtn,
} = {}) => {
  return {
    title,
    field,
    minWidth,
    showOverflow,
    slots: {
      default: ({ row }, h) => {
        const billingType = row[field]
        const ret = []
        const openVmSetDurationDialog = () => {
          if (!vm) return null
          vm.createDialog('SetDurationDialog', {
            data: [row],
            columns: vm.columns,
            onManager: vm.onManager,
            refresh: vm.refresh,
          })
        }
        if (billingType === 'postpaid') {
          ret.push(<div style={{ color: '#0A1F44' }}>{ i18n.t('billingType.postpaid') }</div>)
        } else if (billingType === 'prepaid') {
          ret.push(<div style={{ color: '#0A1F44' }}>{ i18n.t('billingType.prepaid') }</div>)
        }
        if (row.expired_at) {
          const time = vm.$moment(row.expired_at).format()
          let tooltipCon = <div slot="help"></div>
          if (billingType === 'postpaid') {
            const isHiddenSetButton = R.is(Function, hiddenSetBtn) ? hiddenSetBtn() : hiddenSetBtn
            if (hasPermission({ key: 'server_perform_cancel_expire' }) && !isHiddenSetButton) {
              tooltipCon = <div slot="help">{ i18n.t('common_301', [time]) }<span class="link-color" style="cursor: pointer" onClick={ openVmSetDurationDialog }>{ i18n.t('common_453') }</span></div>
            } else {
              tooltipCon = <div slot="help">{ i18n.t('common_301', [time]) }</div>
            }
          } else if (billingType === 'prepaid') {
            if (row.auto_renew) {
              tooltipCon = <div slot="help">{ i18n.t('common_301', [time]) }{ i18n.t('common_451') }</div>
            } else {
              tooltipCon = <div slot="help">{ i18n.t('common_301', [time]) }{ i18n.t('common_452')}</div>
            }
          }
          const help = <a-tooltip>
            <template slot="title">
              { tooltipCon }
            </template>
            <icon type="help" />
          </a-tooltip>
          const dateArr = vm.$moment(row.expired_at).fromNow().split(' ')
          const date = dateArr.join(' ')
          const seconds = vm.$moment(row.expired_at).diff(new Date()) / 1000
          const textColor = seconds / 24 / 60 / 60 < 7 ? '#DD2727' : '#53627C'
          const text = seconds < 0 ? i18n.t('common_296') : i18n.t('common_297', [date])
          ret.push(<div class='text-truncate' title={text} style={{ color: textColor }}>{ text } { help }</div>)
        }
        return ret
      },
    },
  }
}

export const getZone1TableColumn = ({
  vm,
  field = 'zone_1_name',
  idField = 'zone_1_id',
  title = i18n.t('table.title.zone_1_name'),
  sortable = true,
} = {}) => {
  return {
    field,
    title,
    slots: {
      default: ({ row }) => {
        if (!row[idField]) return row[field] || '-'
        const p = hasPermission({ key: 'zones_get' })
        let node
        if (p) {
          node = (
            <list-body-cell-wrap copy row={ row } field={field} title={ row[field] } hideField={ true }>
              <side-page-trigger permission='zones_get' name='ZoneSidePage' id={row[idField]} vm={vm}>{ row[field] }</side-page-trigger>
            </list-body-cell-wrap>
          )
        } else {
          node = (
            <list-body-cell-wrap copy row={ row } field={field} title={ row[field] } />
          )
        }
        return [
          <div class='text-truncate'>{ node }</div>,
        ]
      },
    },
  }
}

export const getOsArch = ({
  field = 'os_arch',
  title = i18n.t('table.title.os_arch'),
} = {}) => {
  return {
    field,
    title,
    formatter: ({ row }) => {
      let arch = _.get(row, field)
      if (!arch && field !== 'os_arch') {
        arch = _.get(row, 'os_arch')
      }
      if (arch === HOST_CPU_ARCHS.arm.capabilityKey) arch = HOST_CPU_ARCHS.arm.key
      if (arch === HOST_CPU_ARCHS.x86.capabilityKey) arch = HOST_CPU_ARCHS.x86.key
      if (arch) {
        return _.get(HOST_CPU_ARCHS, `${arch}.label`) || arch
      }
      return HOST_CPU_ARCHS.x86.label
    },
  }
}

export const getInstanceSnapshotsTableColumn = ({
  field = 'instance_snapshots',
  title = i18n.t('dictionary.instance_snapshot'),
  sortable = true,
} = {}) => {
  return {
    field,
    title,
    sortable,
    formatter: ({ row }) => {
      const extResource = _.get(row, 'ext_resource') || {}
      return _.get(extResource, field) || '-'
    },
  }
}

export const getServerMonitorAgentInstallStatus = ({
  field = 'metadata',
  title = i18n.t('compute.monitor.agent.install_status'),
} = {}) => {
  return {
    field,
    title,
    slots: {
      default: function ({ row }, h) {
        const status = _.get(row, ['metadata', 'sys:monitor_agent']) || _.get(row, ['metadata', '__monitor_agent'])
        if (row.hasOwnProperty('agent_status')) {
          if (row.agent_status === 'succeed') {
            return i18n.t('compute.monitor.agent.install_status.installed')
          } else if (row.agent_status === 'applying') {
            return (<div>{i18n.t('compute.monitor.agent.install_status.installing')}<a-icon style="margin-left:5px" type="loading" /></div>)
          } else if (row.agent_status === 'failed') {
            return i18n.t('compute.monitor.agent.install_status.installfailed')
          }
        } else if (status) {
          return i18n.t('compute.monitor.agent.install_status.installed')
        }
        return i18n.t('compute.monitor.agent.install_status.uninstall')
      },
    },
  }
}
