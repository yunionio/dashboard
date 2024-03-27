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
import { status as statusMap } from '@/locales/zh-CN'
import setting from '@/config/setting'
const brandMap = typeClouds.getBrand()

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
              <span class='text-weak'>{domain}</span>
            </list-body-cell-wrap>,
          )
        }
        return ret
      },
    },
    hidden: () => {
      return R.is(Function, hidden) ? hidden() : hidden
    },
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
            <span style={{ color: '#0A1F44' }}>{val}</span>
          </list-body-cell-wrap>,
        )
        if (row.zone) {
          ret.push(
            <list-body-cell-wrap hide-field copy field="zone" row={row}>
              <span style={{ color: '#53627C' }}>{row.zone}</span>
            </list-body-cell-wrap>,
          )
        }
        if (row.zone_1_name) {
          ret.push(
            <list-body-cell-wrap hide-field copy field="zone_1_name" row={row}>
              <span style={{ color: '#53627C' }}>{i18n.t('scope.text_958', [row.zone_1_name])}</span>
            </list-body-cell-wrap>,
          )
        }
        return ret
      },
    },
    hidden: () => {
      return R.is(Function, hidden) ? hidden() : hidden
    },
  }
}

export const getBrandTableColumn = ({ field = 'brand', title = i18n.t('table.title.brand'), hidden = false, minWidth = 70, sortable = true, hideLoading = false } = {}) => {
  return {
    field,
    title,
    minWidth,
    sortable,
    slots: {
      default: ({ row }, h) => {
        const val = _.get(row, field)
        if (!val) return hideLoading ? '-' : [<data-loading />]
        let customStyle = {}
        if (row.brand === brandMap.Baidu.key) {
          customStyle = { fontSize: '16px', marginLeft: '2px' }
        }
        return [
          <BrandIcon name={val} customStyle={customStyle} />,
        ]
      },
    },
    formatter: ({ row }) => {
      const name = _.get(row, field)
      const ret = brandMap[name] || {}
      if (name === 'Cloudpods') {
        const { inner_copyright, inner_copyright_en } = store.state.app.companyInfo || {}
        if (setting.language === 'en' && inner_copyright_en) {
          ret.label = inner_copyright_en
        }
        if (setting.language === 'zh-CN' && inner_copyright) {
          ret.label = inner_copyright
        }
      }
      return ret.label
    },
    hidden: () => {
      return R.is(Function, hidden) ? hidden() : hidden
    },
  }
}

export const getBillBrandTableColumn = ({ field = 'brand', title = i18n.t('table.title.brand'), hidden = false, minWidth = 70, sortable = true, hideLoading = false, emptyValue } = {}) => {
  return {
    field,
    title,
    slots: {
      default: ({ row }, h) => {
        const val = _.get(row, field)
        if (!val) return emptyValue
        if (val === 'k8s' || val === 'Kubernetes') {
          return [<span title='K8S'><icon type='k8s' style="font-size:20px;" /></span>]
        }
        if (val === 'openshift') {
          return [<span title='OpenShift'><icon type='openshift' style="font-size:20px;" /></span>]
        }
        return [
          <BrandIcon name={val} />,
        ]
      },
    },
    formatter: ({ row }) => {
      const name = _.get(row, field)
      if (!name) return emptyValue
      if (name === 'k8s' || name === 'Kubernetes') return 'K8S'
      if (name === 'openshift') return 'OpenShift'
      const ret = brandMap[name] || {}
      if (name === 'Cloudpods') {
        const { inner_copyright, inner_copyright_en } = store.state.app.companyInfo || {}
        if (setting.language === 'en' && inner_copyright_en) {
          ret.label = inner_copyright_en
        }
        if (setting.language === 'zh-CN' && inner_copyright) {
          ret.label = inner_copyright
        }
      }
      return ret.label
    },
    hidden: () => {
      return R.is(Function, hidden) ? hidden() : hidden
    },
  }
}

export const getStatusTableColumn = ({ vm = {}, field = 'status', title = i18n.t('common.status'), statusModule, sortable = true, minWidth = 120, slotCallback, hiddenLogView = false, formatter, helpTool = {}, hidden } = {}) => {
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
        if (R.isNil(val) || _.get(row, field) === undefined) return '-'
        const log = <side-page-trigger class="ml-1" onTrigger={() => vm.handleOpenSidepage(row, 'event-drawer')}>{i18n.t('common.view_logs')}</side-page-trigger>
        const isError = field === 'status' ? !hiddenLogView && vm.handleOpenSidepage && (['invalid', 'unknown'].includes(val) || /failed|fail$/.test(val)) : false
        const help = <a-tooltip class="ml-1" title={helpTool.title}><icon type="question" /></a-tooltip>
        return [
          <div class='d-flex align-items-center text-truncate'>
            <status status={val} statusModule={statusModule} />
            {isError ? log : null}
            {helpTool.isOpen && helpTool.status?.includes(row.status) ? help : null}
          </div>,
        ]
      },
    },
    formatter: ({ row }) => {
      if (formatter) {
        return formatter({ row })
      }
      const val = _.get(row, field) || '-'
      const moduleStatusMap = statusMap[statusModule]
      if (moduleStatusMap) {
        if (moduleStatusMap[val]) {
          return i18n.t(`status.${statusModule}.${val}`)
        }
      }
      if (statusMap.common[val]) {
        return i18n.t(`status.common.${val}`)
      }
      return val
    },
    hidden: () => {
      return R.is(Function, hidden) ? hidden() : hidden
    },
  }
}

export const getEnabledTableColumn = ({ field = 'enabled', title = i18n.t('table.title.enable_status'), minWidth = 90, hidden } = {}) => {
  return getStatusTableColumn({
    field,
    title,
    statusModule: 'enabled',
    minWidth,
    hidden,
  })
}

export const getPublicTableColumn = ({ field = 'share_mode', title = i18n.t('common_286'), hidden } = {}) => {
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
    hidden: () => {
      return R.is(Function, hidden) ? hidden() : hidden
    },
  }
}

export const getNameDescriptionTableColumn = ({
  resource = '', // 资源名称
  title = i18n.t('table.title.name'),
  field = 'name',
  descField = 'description',
  addEncryption,
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
  copyDesc = false,
  minWidth = 100,
  message,
  addEncrypt,
  label,
  formatter,
  hidden,
} = {}) => {
  return {
    field,
    title,
    sortable,
    showOverflow: 'ellipsis',
    minWidth,
    formatter,
    // fixed: 'left',
    slots: {
      default: ({ row }, h) => {
        const text = (message && R.type(message) === 'Function') ? message(row) : (message || (row[field] && row[field].toString()) || '-')
        const _steadyStatus = steadyStatus || (expectStatus[statusModule] && Object.values(expectStatus[statusModule]).flat())
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
              steadyStatus: _steadyStatus,
              hideField,
              addLock,
              addEncrypt,
              addBackup,
              formRules,
              label,
            },
            scopedSlots: {
              default: () => slotCallback ? slotCallback(row, h) : null,
              ...(cellWrapSlots && R.is(Function, cellWrapSlots) ? cellWrapSlots(row) : {}),
            },
          }),
        ]
        if ((R.type(showDesc) === 'Function' && showDesc(row)) || showDesc === true) {
          const realDescRules = [
            ...descriptionRules,
            {
              max: 256,
              message: i18n.t('validator.maxLength', ['256']),
            },
          ]
          let field = descField
          if (_.get(row, '_i18n.description')) field = '_i18n.description' // 如果多语言里面有备注，则取多语言里的字段
          ret.push(h('list-body-cell-wrap', {
            props: {
              resource: resource,
              edit: (R.is(Function, editDesc) && editDesc(row)) || editDesc === true,
              field,
              row,
              onManager,
              steadyStatus: _steadyStatus,
              formRules: realDescRules,
              copy: copyDesc,
            },
          }))
        }
        return ret
      },
    },
    hidden: () => {
      return R.is(Function, hidden) ? hidden() : hidden
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
  customEdit = false,
  customEditCallback = () => { },
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
        if (text === '-') {
          return '-'
        }
        return [
          <list-body-cell-wrap copy field={field} row={row} hideField={hideField} message={text} customEdit={customEdit} customEditCallback={() => customEditCallback(row)}>
            {slotCallback ? slotCallback(row) : null}
          </list-body-cell-wrap>,
        ]
      },
    },
    hidden: () => {
      return R.is(Function, hidden) ? hidden() : hidden
    },
  }
}

export const getIpsTableColumn = ({ field = 'ips', title = 'IP', vm = {}, sortable = false, onlyElastic = false, noElastic = false, hidden } = {}) => {
  return {
    field,
    title,
    minWidth: 180,
    sortBy: onlyElastic ? 'order_by_eip' : 'order_by_ip',
    sortable,
    slots: {
      default: ({ row }, h) => {
        if (!row.eip && !row.ips && !row.vips && (!row.metadata || !row.metadata.sync_ips)) {
          if (row.hypervisor === typeClouds.hypervisorMap.esxi.key && ['ready', 'running'].includes(row.status)) {
            if (noElastic || (!onlyElastic && !noElastic)) {
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
              return '-'
            }
          } else {
            if (vm.isPreLoad) return [<data-loading />]
            return []
          }
        }
        let ret = []
        if (onlyElastic) { // 只展示弹性ip
          if (row.eip && row.eip_mode === 'elastic_ip') {
            ret.push(
              <list-body-cell-wrap row={row} field="eip" copy><span class="text-color-help">({i18n.t('common_290')})</span></list-body-cell-wrap>,
            )
          }
          return ret.length ? ret : '-'
        }
        if (noElastic) {
          if (row.eip && row.eip_mode !== 'elastic_ip') {
            ret.push(
              <list-body-cell-wrap row={row} field="eip" copy><span class="text-color-help">({i18n.t('common_291')})</span></list-body-cell-wrap>,
            )
          }
        } else if (row.eip) {
          ret.push(
            <list-body-cell-wrap row={row} field="eip" copy><span class="text-color-help">({row.eip_mode === 'elastic_ip' ? i18n.t('common_290') : i18n.t('common_291')})</span></list-body-cell-wrap>,
          )
        }
        if (row.ips) {
          const iparr = row.ips.split(',')
          const ips = iparr.map(ip => {
            return <list-body-cell-wrap copy row={{ ip }} hide-field field="ip">{ip}<span class="text-color-help">({i18n.t('common_287')})</span></list-body-cell-wrap>
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
        if (row.metadata && row.metadata.sync_ips) {
          const iparr = row.metadata.sync_ips.split(',')
          const ips = iparr.map(ip => {
            return <list-body-cell-wrap copy row={{ ip }} hide-field field="ip">{ip}<span class="text-color-help">({i18n.t('compute.esxi.sync_ips_outofrange')}<a-icon class="ml-1" style="color:red" type="warning" title={i18n.t('compute.esxi.sync_ips_outofrange_alert')} />)</span></list-body-cell-wrap>
          })
          ret = ret.concat(ips)
        }
        return ret.length ? ret : '-'
      },
    },
    formatter: ({ row }) => {
      const ret = []
      if (onlyElastic) { // 只展示弹性ip
        if (row.eip && row.eip_mode === 'elastic_ip') {
          ret.push(`${row.eip}(${i18n.t('common_290')})`)
        }
        return ret.length ? ret.join(', ') : '-'
      }
      if (noElastic) {
        if (row.eip && row.eip_mode !== 'elastic_ip') {
          ret.push(ret.push(`${row.eip}(${i18n.t('common_291')})`))
        }
      } else if (row.eip) {
        if (row.eip_mode === 'elastic_ip') {
          ret.push(`${row.eip}(${i18n.t('common_290')})`)
        } else {
          ret.push(`${row.eip}(${i18n.t('common_291')})`)
        }
      }
      if (row.ips) {
        const iparr = row.ips.split(',')
        iparr.map(ip => {
          ret.push(`${ip}(${i18n.t('common_287')})`)
        })
      }
      if (row.vips) {
        row.vips.map(ip => {
          ret.push(`${ip}(${i18n.t('common_vip')})`)
        })
      }
      if (row.vip) {
        const iparr = row.vip.split(',')
        iparr.map(ip => {
          ret.push(`${ip}(${i18n.t('common_vip')})`)
        })
      }
      if (row.vip_eip) {
        const iparr = row.vip_eip.split(',')
        iparr.map(ip => {
          ret.push(`${ip}(${i18n.t('common_evip')})`)
        })
      }
      if (row.metadata && row.metadata.sync_ips) {
        const iparr = row.metadata.sync_ips.split(',')
        iparr.map(ip => {
          ret.push(`${ip}(${i18n.t('compute.esxi.sync_ips_outofrange')})`)
        })
      }
      return ret.join(', ')
    },
    hidden: () => {
      return R.is(Function, hidden) ? hidden() : hidden
    },
  }
}

export const getSwitchTableColumn = ({ field, title, change, disabled, hidden }) => {
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
          <a-switch checked={checked} disabled={disabled} checkedChildren={i18n.t('common_292')} unCheckedChildren={i18n.t('common_293')} onChange={change} />,
        ]
      },
    },
    hidden: () => {
      return R.is(Function, hidden) ? hidden() : hidden
    },
  }
}

export const getTagTableColumn = ({
  field = 'metadata',
  title = i18n.t('table.title.tag'),
  ignoreKeys,
  supportKeyStarts = ['user:'],
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
  editCheck = (row) => true,
  hidden,
  manager,
  vm = {},
} = {}) => {
  return {
    field,
    title,
    width,
    slots: {
      default: ({ row }, h) => {
        let metadata = _.get(row, field) || {}
        if (field === 'project_tags' || field === 'object_tags' || field === 'domain_tags') {
          metadata = {}
          const fieldValue = row[field] || []
          fieldValue.map(item => {
            if (metadata.hasOwnProperty(item.key)) {
              if (R.is(Array, metadata[item.key])) {
                metadata[item.key].push(item.value)
              } else {
                metadata[item.key] = [metadata[item.key], item.value]
              }
            } else {
              metadata[item.key] = item.value
            }
          })
        }
        const supportStarts = [...supportKeyStarts]
        if (needExt) {
          supportStarts.push('ext:')
        }
        return [
          h(TagTableColumn, {
            props: {
              row,
              onManager,
              metadata,
              ignoreKeys,
              supportKeyStarts: supportStarts,
              needExt,
              resource,
              columns,
              tipName,
              ignorePrefix,
              customTitle,
              list,
              tagParams: params,
              manager: manager,
              refresh: vm.refresh,
              canEdit: editCheck(row),
            },
          }),
        ]
      },
    },
    formatter: ({ row }) => {
      let metadata = _.get(row, field) || {}
      if (field === 'project_tags' || field === 'object_tags' || field === 'domain_tags') {
        metadata = {}
        const fieldValue = row[field] || []
        fieldValue.map(item => {
          if (metadata.hasOwnProperty(item.key)) {
            if (R.is(Array, metadata[item.key])) {
              metadata[item.key].push(item.value)
            } else {
              metadata[item.key] = [metadata[item.key], item.value]
            }
          } else {
            metadata[item.key] = item.value
          }
        })
      }
      const ret = []
      const keys = Object.keys(metadata)
      const supportStarts = [...supportKeyStarts]
      if (needExt) {
        supportStarts.push('ext:')
      }
      keys.map(key => {
        if (supportStarts.some(s => key.startsWith(s))) {
          let tagKey = key
          supportStarts.map(s => {
            tagKey = tagKey.replace(s, '')
          })
          if (R.is(Array, metadata[key])) {
            metadata[key].map(val => {
              ret.push({ key: tagKey, value: val })
            })
          } else {
            ret.push({ key: tagKey, value: metadata[key] })
          }
        }
      })
      return ret.length ? JSON.stringify(ret) : ''
    },
    hidden: () => {
      return R.is(Function, hidden) ? hidden() : hidden
    },
  }
}

export const isPublicTableColumn = ({ field = 'is_public', title = i18n.t('common_101'), hidden } = {}) => {
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
    hidden: () => {
      return R.is(Function, hidden) ? hidden() : hidden
    },
  }
}
export const getTimeTableColumn = ({
  field = 'created_at',
  title = i18n.t('table.title.create_time'),
  sortable = true,
  fromNow = false,
  minWidth = 180,
  vm = {},
  hidden,
} = {}) => {
  return {
    field,
    title,
    minWidth: minWidth,
    sortable,
    slots: {
      default: ({ row }, h) => {
        if (vm.isPreLoad && !row[field]) return [<data-loading />]
        if (!row[field]) {
          return '-'
        }
        if (fromNow) {
          return [
            <a-tooltip class="ml-1" title={moment(row[field]).format()}>{moment(row[field]).fromNow()}</a-tooltip>,
          ]
        }
        return [
          <a-tooltip class="ml-1" title={moment(row[field]).fromNow()}>{moment(row[field]).format()}</a-tooltip>,
        ]
      },
    },
    formatter: ({ row }) => {
      if (!row[field]) {
        return '-'
      }
      if (fromNow) {
        return moment(row[field]).fromNow()
      }
      return moment(row[field]).format()
    },
    hidden: () => {
      return R.is(Function, hidden) ? hidden() : hidden
    },
  }
}

export const getTimeRangeColumn = ({
  field = 'time_range',
  start_field = 'start_time',
  end_field = 'end_time',
  title = i18n.t('table.title.create_time'),
  sortable = false,
  format = 'YYYY-MM-DD HH:mm:ss',
  hidden,
} = {}) => {
  return {
    field,
    start_field,
    end_field,
    title,
    width: 320,
    sortable,
    slots: {
      default: ({ row }, h) => {
        const start = row[start_field] ? moment(row[start_field]).format(format) : ''
        const end = row[end_field] ? moment(row[end_field]).format(format) : ''
        if (start && end) {
          return `${start} ~ ${end}`
        } else if (start) {
          return i18n.t('common.from_moment', [start])
        } else if (end) {
          return i18n.t('common.until_moment', [end])
        }
        return i18n.t('common.permanent_effect')
      },
    },
    hidden: () => {
      return R.is(Function, hidden) ? hidden() : hidden
    },
  }
}

/**
 * 时长展示
 * @param {Object}
 * @returns string eg: 2分12秒 12秒
 */
export const getTimeDurationColumn = ({
  field = 'time_duration',
  start_field = 'start_time',
  end_field = 'end_time',
  title = i18n.t('table.title.time_duration'),
  hidden,
} = {}) => {
  return {
    field,
    title,
    formatter: ({ row }) => {
      const start = row[start_field] ? moment(row[start_field]) : ''
      const end = row[end_field] ? moment(row[end_field]) : ''
      if (start && end) {
        const duration = parseInt(moment.duration(end.diff(start)) / 1000)
        if (!duration) return `< 1${i18n.t('common.second_unit')}`
        const h = parseInt(duration / (60 * 60))
        const m = parseInt((duration % (60 * 60)) / 60)
        const s = duration % 60
        return `${h ? `${h}${i18n.t('common.hour_unit')} ` : ''}${m ? `${m}${i18n.t('common.minute_unit')} ` : ''}${`${s}${i18n.t('common.second_unit')}`}`
      } else {
        return '-'
      }
    },
    hidden: () => {
      return R.is(Function, hidden) ? hidden() : hidden
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
            <span style={{ color: '#0A1F44' }}>{val || '-'}</span>
          </list-body-cell-wrap>,
        )
        const managerVal = _.get(row, managerField)
        if (managerVal) {
          ret.push(
            <list-body-cell-wrap hide-field copy field={managerField} row={row}>
              <span style={{ color: '#53627C' }}>{managerVal}</span>
            </list-body-cell-wrap>,
          )
        }
        return ret
      },
    },
  }
}

export const getBillingTypeTableColumn = ({ field = 'billing_type', title = i18n.t('table.title.bill_type'), width = '120px', hidden } = {}) => {
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
          ret.push(<div style={{ color: textColor }}>{text}</div>)
        }
        return ret
      },
    },
    formatter: ({ row }) => {
      if (row[field] === 'postpaid') {
        return i18n.t('billingType.postpaid')
      } else if (row[field] === 'prepaid') {
        return i18n.t('billingType.prepaid')
      }
      return ''
    },
    hidden: () => {
      return R.is(Function, hidden) ? hidden() : hidden
    },
  }
}

export const getPublicScopeTableColumn = ({
  field = 'public_scope',
  title = i18n.t('table.title.share_range'),
  vm,
  resource,
  width = 110,
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
                    <a-alert class='mb-2' message={i18n.t('common_298', [sharedProjects.length])} />,
                    <dialog-table
                      vxeGridProps={{ showOverflow: 'title' }}
                      data={sharedProjects}
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
            }}>{i18n.t(`${i18nPrefix}.project`)}</a>,
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
                      <a-alert class='mb-2' message={i18n.t('common_300', [sharedDomains.length])} />,
                      <dialog-table
                        vxeGridProps={{ showOverflow: 'title' }}
                        data={sharedDomains}
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
              }}>{i18n.t(`${i18nPrefix}.domain`)}</a>,
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
  hidden,
} = {}) => {
  return getCopyWithContentTableColumn({
    title,
    field,
    sortable,
    vm,
    hidden: () => {
      if (!(store.getters.isAdminMode || store.getters.isDomainMode)) return true
      return R.is(Function, hidden) ? hidden() : hidden
    },
  })
}

export const getBillingTableColumn = ({
  vm,
  field = 'billing_type',
  title = i18n.t('table.title.bill_type'),
  minWidth = 120,
  showOverflow = 'ellipsis',
  hiddenSetBtn,
  hidden,
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
          ret.push(<div style={{ color: '#0A1F44' }}>{i18n.t('billingType.postpaid')}</div>)
        } else if (billingType === 'prepaid') {
          ret.push(<div style={{ color: '#0A1F44' }}>{i18n.t('billingType.prepaid')}</div>)
        }
        if (row.expired_at) {
          const time = vm.$moment(row.expired_at).format()
          let tooltipCon = <div slot="help"></div>
          if (billingType === 'postpaid') {
            const isHiddenSetButton = R.is(Function, hiddenSetBtn) ? hiddenSetBtn() : hiddenSetBtn
            if (hasPermission({ key: 'server_perform_cancel_expire' }) && !isHiddenSetButton) {
              tooltipCon = <div slot="help">{i18n.t('common_301', [time])}<span class="link-color" style="cursor: pointer" onClick={openVmSetDurationDialog}>{i18n.t('common_453')}</span></div>
            } else {
              tooltipCon = <div slot="help">{i18n.t('common_301', [time])}</div>
            }
          } else if (billingType === 'prepaid') {
            if (row.auto_renew) {
              tooltipCon = <div slot="help">{i18n.t('common_301', [time])}{i18n.t('common_451')}</div>
            } else {
              tooltipCon = <div slot="help">{i18n.t('common_301', [time])}{i18n.t('common_452')}</div>
            }
          }
          const help = <a-tooltip>
            <template slot="title">
              {tooltipCon}
            </template>
            <icon type="help" />
          </a-tooltip>
          const dateArr = vm.$moment(row.expired_at).fromNow().split(' ')
          const date = dateArr.join(' ')
          const seconds = vm.$moment(row.expired_at).diff(new Date()) / 1000
          const textColor = seconds / 24 / 60 / 60 < 7 ? '#DD2727' : '#53627C'
          const text = seconds < 0 ? i18n.t('common_296') : i18n.t('common_297', [date])
          ret.push(<div class='text-truncate' title={text} style={{ color: textColor }}>{text} {help}</div>)
        }
        return ret
      },
    },
    formatter: ({ row }) => {
      const billingType = row[field]
      if (billingType === 'postpaid') {
        return i18n.t('billingType.postpaid')
      } else if (billingType === 'prepaid') {
        return i18n.t('billingType.prepaid')
      }
    },
    hidden: () => {
      return R.is(Function, hidden) ? hidden() : hidden
    },
  }
}

export const getZone1TableColumn = ({
  vm,
  field = 'zone_1_name',
  idField = 'zone_1_id',
  title = i18n.t('table.title.zone_1_name'),
  sortable = true,
  hidden,
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
            <list-body-cell-wrap copy row={row} field={field} title={row[field]} hideField={true}>
              <side-page-trigger permission='zones_get' name='ZoneSidePage' id={row[idField]} vm={vm}>{row[field]}</side-page-trigger>
            </list-body-cell-wrap>
          )
        } else {
          node = (
            <list-body-cell-wrap copy row={row} field={field} title={row[field]} />
          )
        }
        return [
          <div class='text-truncate'>{node}</div>,
        ]
      },
    },
    hidden: () => {
      return R.is(Function, hidden) ? hidden() : hidden
    },
  }
}

export const getOsArch = ({
  field = 'os_arch',
  title = i18n.t('table.title.os_arch'),
  hidden,
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
    hidden: () => {
      return R.is(Function, hidden) ? hidden() : hidden
    },
  }
}

export const getInstanceSnapshotsTableColumn = ({
  field = 'instance_snapshots',
  title = i18n.t('dictionary.instance_snapshot'),
  sortable = true,
  hidden,
} = {}) => {
  return {
    field,
    title,
    sortable,
    formatter: ({ row }) => {
      const extResource = _.get(row, 'ext_resource') || {}
      return _.get(extResource, field) || '-'
    },
    hidden: () => {
      return R.is(Function, hidden) ? hidden() : hidden
    },
  }
}

export const getServerMonitorAgentInstallStatus = ({
  field = 'metadata',
  hiddenField = 'agent_status',
  title = i18n.t('compute.monitor.agent.install_status'),
  hidden,
} = {}) => {
  return {
    field,
    title,
    hiddenField,
    slots: {
      default: function ({ row }, h) {
        const status = _.get(row, ['metadata', 'sys:monitor_agent']) || _.get(row, ['metadata', '__monitor_agent'])
        const deploy = _.get(row, ['metadata', 'telegraf_deployed'])
        if (row.hasOwnProperty('agent_status') || deploy) {
          if (row.agent_status === 'succeed' || deploy) {
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
    hidden: () => {
      return R.is(Function, hidden) ? hidden() : hidden
    },
  }
}

export const getCycleTimerColumn = ({ timeFormat = 'YYYY-MM-DD HH:mm:ss', hidden } = {}) => {
  return {
    field: 'cycle_timer',
    title: i18n.t('cloudenv.text_427'),
    minWidth: 200,
    showOverflow: 'title',
    slots: {
      default: ({ row }, h) => {
        if (!row.cycle_timer) return '-'
        const hour = row.cycle_timer.hour
        const minute = row.cycle_timer.minute
        const timer = i18n.t('cloudenv.text_465', [`${hour > 9 ? hour : `0${hour}`}:${minute > 9 ? minute : `0${minute}`}`])
        if (row.scheduled_type === 'cycle') {
          const cycleType = i18n.t('cloudenvScheduledtaskGroupCycleType')[row.cycle_timer.cycle_type]
          const startEndTime = i18n.t('cloudenv.text_466', [moment(row.cycle_timer.start_time).format(timeFormat), moment(row.cycle_timer.end_time).format(timeFormat)])
          if (row.cycle_timer.cycle_type === 'day') {
            return `${cycleType} ${timer} ${startEndTime}`
          } else if (row.cycle_timer.cycle_type === 'week') {
            const weekDays = row.cycle_timer.week_days.map((v) => {
              return i18n.t('flexGroupSubCycleTypeWeek')[v]
            })
            return `${cycleType} 【${weekDays.join('|')}】 ${timer} ${startEndTime}`
          } if (row.cycle_timer.cycle_type === 'month') {
            const monthDays = row.cycle_timer.month_days.map((v) => {
              return i18n.t('cloudenv.text_436', [v])
            })
            return `${cycleType} 【${monthDays.join('|')}】 ${timer} ${startEndTime}`
          }
        } else {
          return i18n.t('cloudenv.text_467', [moment(row.timer.exec_time).format(timeFormat)])
        }
      },
    },
    hidden: () => {
      return R.is(Function, hidden) ? hidden() : hidden
    },
  }
}

// 所属域
export const getDomainColumn = ({ vm, hidden }) => {
  return {
    field: 'domain',
    title: i18n.t('common.attribution_scope'),
    slots: {
      default: ({ row }, h) => {
        const domain = row.project_domain || row.domain
        if (!row.domain_id) return domain || '-'
        if (!domain) return '-'
        const p = hasPermission({ key: 'domains_get' })
        let node
        if (p) {
          node = (
            <list-body-cell-wrap copy row={vm.data} onManager={vm.onManager} field='project_domain' title={row.project_domain} message={domain} hideField={true}>
              <side-page-trigger permission='domains_get' name='DomainSidePage' id={row.project_domain} vm={vm}>{domain}</side-page-trigger>
            </list-body-cell-wrap>
          )
        } else {
          node = (
            <list-body-cell-wrap copy row={vm.data} onManager={vm.onManager} field='project_domain' title={row.project_domain} message={domain} />
          )
        }
        return [
          <div class='text-truncate'>{node}</div>,
        ]
      },
    },
    hidden: () => {
      if (store.getters.isProjectMode) return true
      return R.is(Function, hidden) ? hidden() : hidden
    },
  }
}

export const getCloudEnvTableColumn = ({ field = 'cloud_env', title = i18n.t('common.cloud_env'), hidden } = {}) => {
  return {
    field,
    title,
    formatter: ({ row }) => {
      return i18n.te(`cloud_env.${row[field]}`) ? i18n.t(`cloud_env.${row[field]}`) : i18n.t('cloud_env.onpremise')
    },
    hidden: () => {
      return R.is(Function, hidden) ? hidden() : hidden
    },
  }
}
