import './style.scss'
import * as R from 'ramda'
import _ from 'lodash'
import moment from 'moment'
import classNames from 'classnames'
import i18n from '@/locales'
import WindowsMixin from '@/mixins/windows'
import { hasPermission } from '@/utils/auth'
import { changeToArr } from '@/utils/utils'
import store from '@/store'
import expectStatus from '@/constants/expectStatus'

// 需要添加区域（cloudregion/cloudregion_id), 可用区（zone/zone_id)，云账号(account/account_id)，云订阅（manager/manager_id)的资源
const appendOutherResources = ['servers', 'hosts', 'disks', 'storages', 'vpcs', 'wires', 'networks', 'natgateways', 'snapshots', 'eips', 'dbinstances', 'elasticcaches', 'servertemplates', 'buckets', 'networkinterfaces', 'lbs', 'nats', 'nas', 'kafkas', 'elasticsearchs', 'webapps', 'cdn_domains', 'inter_vpc_networks', 'route_tables', 'vpc_peering_connections', 'ipv6_gateways', 'tablestores', 'modelarts_pools', 'meter_instance_caches']

const getDefaultLastBaseInfo = (vm, h, { data, onManager, resource }) => {
  const outher = []
  if (data.region) {
    outher.push(
      {
        field: 'region',
        title: i18n.t('res.region'),
        slots: {
          default: ({ row }) => {
            if (!row.region_id) return row.region || '-'
            const p = hasPermission({ key: 'cloudregions_get' })
            let node
            if (p) {
              node = (
                <list-body-cell-wrap copy row={ data } onManager={ onManager } field='region' title={ row.region } hideField={ true }>
                  <side-page-trigger permission='areas_get' name='CloudregionSidePage' id={row.region_id} vm={vm}>{ row.region }</side-page-trigger>
                </list-body-cell-wrap>
              )
            } else {
              node = (
                <list-body-cell-wrap copy row={ data } onManager={ onManager } field='region' title={ row.region } />
              )
            }
            return [
              <div class='text-truncate'>{ node }</div>,
            ]
          },
        },
      },
    )
  }
  if (data.zone) {
    outher.push(
      {
        field: 'zone',
        hiddenField: 'region',
        title: i18n.t('res.zone'),
        slots: {
          default: ({ row }) => {
            if (!row.zone_id) return row.zone || '-'
            const p = hasPermission({ key: 'zones_get' })
            let node
            if (p) {
              node = (
                <list-body-cell-wrap copy row={ data } onManager={ onManager } field='zone' title={ row.zone } hideField={ true }>
                  <side-page-trigger permission='zones_get' name='ZoneSidePage' id={row.zone_id} vm={vm}>{ row.zone }</side-page-trigger>
                </list-body-cell-wrap>
              )
            } else {
              node = (
                <list-body-cell-wrap copy row={ data } onManager={ onManager } field='zone' title={ row.zone } />
              )
            }
            return [
              <div class='text-truncate'>{ node }</div>,
            ]
          },
        },
      },
    )
  }
  if (data.account && !store.getters.isProjectMode) {
    outher.push(
      {
        field: 'account',
        title: i18n.t('res.cloudaccount'),
        slots: {
          default: ({ row }) => {
            if (!row.account_id) return row.account || '-'
            const p = hasPermission({ key: 'cloudaccounts_get' })
            let node
            if (p) {
              node = (
                <list-body-cell-wrap copy row={ data } onManager={ onManager } field='account' title={ row.account } hideField={ true }>
                  <side-page-trigger permission='cloudaccounts_get' name='CloudaccountSidePage' id={row.account_id} vm={vm}>{ row.account }</side-page-trigger>
                </list-body-cell-wrap>
              )
            } else {
              node = (
                <list-body-cell-wrap copy row={ data } onManager={ onManager } field='account' title={ row.account } />
              )
            }
            return [
              <div class='text-truncate'>{ node }</div>,
            ]
          },
        },
        hidden: () => store.getters.isProjectMode,
      },
    )
  }
  if (data.manager && !store.getters.isProjectMode) {
    outher.push(
      {
        field: 'manager',
        hiddenField: 'account',
        title: i18n.t('res.cloudprovider'),
        slots: {
          default: ({ row }) => {
            if (!row.manager_id) return row.manager || '-'
            const p = hasPermission({ key: 'cloudproviders_get' })
            let node
            if (p) {
              node = (
                <list-body-cell-wrap copy row={ data } onManager={ onManager } field='manager' title={ row.manager } hideField={ true }>
                  <side-page-trigger permission='cloudproviders_get' name='CloudproviderSidePage' id={row.manager_id} vm={vm}>{ row.manager }</side-page-trigger>
                </list-body-cell-wrap>
              )
            } else {
              node = (
                <list-body-cell-wrap copy row={ data } onManager={ onManager } field='manager' title={ row.manager } />
              )
            }
            return [
              <div class='text-truncate'>{ node }</div>,
            ]
          },
        },
        hidden: () => store.getters.isProjectMode,
      },
    )
  }
  let ret = [
    {
      field: 'created_at',
      title: i18n.t('table.title.create_time'),
      formatter: ({ row }) => {
        return (row.created_at && moment(row.created_at).format()) || '-'
      },
    },
    {
      field: 'updated_at',
      hiddenField: 'created_at',
      title: i18n.t('table.title.update_time'),
      formatter: ({ row }) => {
        return (row.updated_at && moment(row.updated_at).format()) || '-'
      },
    },
  ]
  if (resource && appendOutherResources.includes(resource)) {
    ret = R.insertAll(0, outher, ret)
  }
  return ret
}

const getDefaultTopBaseInfo = (vm, h, { idKey, statusKey, statusModule, data, onManager, resource, columns }) => {
  const ret = []
  if (data.external_id) {
    ret.push(
      {
        field: 'external_id',
        title: i18n.t('table.title.external_id'),
        slots: {
          default: ({ row }) => {
            return [
              <div class='text-truncate'>
                <list-body-cell-wrap copy row={ data } field='external_id' title={ row.external_id } />
              </div>,
            ]
          },
        },
      },
    )
  }
  if (data.id) {
    ret.push(
      {
        field: idKey,
        title: 'ID',
        slots: {
          default: ({ row }) => {
            return [
              <div class='text-truncate'>
                <list-body-cell-wrap copy row={ data } onManager={ onManager } field={ idKey } title={ row[idKey] } />
              </div>,
            ]
          },
        },
      },
    )
  }
  ret.push(
    {
      field: statusKey,
      title: i18n.t('common.status'),
      slots: {
        default: ({ row }) => {
          if (vm.specifyStatus) {
            return [<status specifyStatus={vm.specifyStatus} />]
          }
          const cancel = <a class="ml-1"
            onClick={() => vm.createDialog('VmLiveMigrateCancelDialog', {
              data: [row],
              columns: columns,
              onManager: vm.onManager,
            })}>{vm.$t('common.cancel')}</a>
          const rescue_mode = <span class="text-color-help">({ i18n.t('compute.rescue') })</span>

          if (statusModule && row[statusKey]) {
            return [
              <div class='d-flex align-items-center text-truncate'>
                <status status={row[statusKey]} statusModule={statusModule} process={row.progress} showStatusProgress={vm.showStatusProgress} />
                { row.status === 'live_migrating' ? cancel : null }
                { row.rescue_mode === true ? rescue_mode : null }
              </div>,
            ]
          }
          return '-'
        },
      },
    },
  )
  if (data.project_domain && !store.getters.isProjectMode) {
    ret.push(
      {
        field: 'project_domain',
        hiddenField: 'tenant',
        title: i18n.t('res.domain'),
        slots: {
          default: ({ row }) => {
            const domain = row.project_domain || row.domain
            if (!row.domain_id) return domain || '-'
            if (!domain) return '-'
            const p = hasPermission({ key: 'domains_get' })
            let node
            if (p) {
              node = (
                <list-body-cell-wrap copy row={ data } onManager={ onManager } field='project_domain' title={ row.project_domain } message={domain} hideField={ true }>
                  <side-page-trigger
                    permission='domains_get'
                    name='DomainSidePage'
                    id={row.project_domain}
                    options={{ getParams: { pending_delete: 'any' } }}
                    vm={vm}>
                    {domain}
                  </side-page-trigger>
                </list-body-cell-wrap>
              )
            } else {
              node = (
                <list-body-cell-wrap copy row={ data } onManager={ onManager } field='project_domain' title={ row.project_domain } message={domain} />
              )
            }
            return [
              <div class='text-truncate'>{ node }</div>,
            ]
          },
        },
        hidden: () => store.getters.isProjectMode,
      },
    )
  }
  if (data.tenant) {
    ret.push(
      {
        field: 'tenant',
        title: i18n.t('res.project'),
        slots: {
          default: ({ row }) => {
            if (!row.tenant_id) return row.tenant || '-'
            if (!row.tenant) return '-'
            const p = hasPermission({ key: 'projects_get' })
            const customEditCallback = () => {
              vm.createDialog('ChangeOwenrDialog', {
                data: [row],
                onManager: onManager,
                name: i18n.t(`dictionary.${resource.substring(0, resource.length - 1)}`),
                resource: resource,
              })
            }
            let node
            if (p) {
              node = (
                <list-body-cell-wrap copy
                  row={ data }
                  onManager={ onManager }
                  field='tenant'
                  title={ row.tenant }
                  hideField={ true }
                  edit={ true }
                  customEdit={ true }
                  customEditCallback={ customEditCallback } >
                  <side-page-trigger
                    permission='projects_get'
                    name='ProjectSidePage'
                    id={row.tenant_id}
                    vm={vm}
                    options={{ getParams: { pending_delete: 'any' } }}
                  >
                    {row.tenant}
                  </side-page-trigger>
                </list-body-cell-wrap>
              )
            } else {
              node = (
                <list-body-cell-wrap copy row={ data } onManager={ onManager } field='tenant' title={ row.tenant } />
              )
            }
            return [
              <div class='text-truncate'>{ node }</div>,
            ]
          },
        },
      },
    )
  }
  return ret
}

export default {
  name: 'Detail',
  mixins: [WindowsMixin],
  props: {
    data: {
      type: Object,
      required: true,
    },
    baseInfo: {
      type: Array,
      default: () => ([]),
    },
    extraInfo: {
      type: Array,
    },
    onManager: {
      type: Function,
    },
    nameRules: {
      type: Array,
    },
    statusModule: {
      type: String,
    },
    idKey: {
      type: String,
      default: 'id',
    },
    statusKey: {
      type: String,
      default: 'status',
    },
    nameProps: {
      type: Object,
    },
    descProps: {
      type: Object,
    },
    showDesc: {
      type: Boolean,
      default: true,
    },
    showName: {
      type: Boolean,
      default: true,
    },
    hiddenKeys: {
      type: Array,
    },
    autoHiddenColumnsKey: String,
    resource: String,
    isEditDesc: {
      type: Boolean,
      default: true,
    },
    isEditName: {
      type: Boolean,
      default: true,
    },
    hiddenBaseInfo: {
      type: Boolean,
      default: false,
    },
    specifyStatus: {
      type: Object,
    },
    columns: {
      type: Array,
    },
    showStatusProgress: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    commonBaseInfo () {
      const defaultTopBaseInfo = getDefaultTopBaseInfo(this, this.$createElement, {
        idKey: this.idKey,
        statusKey: this.statusKey,
        statusModule: this.statusModule,
        data: this.data,
        onManager: this.onManager,
        resource: this.resource,
        columns: this.columns,
      })
      const defaultLastBaseInfo = getDefaultLastBaseInfo(this, this.$createElement, {
        onManager: this.onManager,
        data: this.data,
        resource: this.resource,
      })
      // 与传递进来的baseInfo比较，去除在baseInfo中已有字段
      /*
      for (let i = 0; i < this.baseInfo.length; i++) {
        for (let j = 0; j < defaultTopBaseInfo.length; j++) {
          if (this.baseInfo[i].field === defaultTopBaseInfo[j].field || this.baseInfo[i].title === defaultTopBaseInfo[j].title) {
            defaultTopBaseInfo.splice(j, 1)
          }
        }
        for (let l = 0; l < defaultLastBaseInfo.length; l++) {
          if (this.baseInfo[i].field === defaultLastBaseInfo[l].field || this.baseInfo[i].title === defaultLastBaseInfo[l].title) {
            defaultLastBaseInfo.splice(l, 1)
          }
        }
      }
      */
      const exists = {}
      let baseInfo = []
      const infoSets = [defaultTopBaseInfo, this.baseInfo, defaultLastBaseInfo]
      for (let k = 0; k < infoSets.length; k++) {
        const infos = infoSets[k]
        for (let i = 0; i < infos.length; i++) {
          if (!(infos[i].field in exists)) {
            baseInfo.push(infos[i])
            exists[infos[i].field] = 1
          }
        }
      }
      // defaultTopBaseInfo.concat(this.baseInfo).concat(defaultLastBaseInfo)
      baseInfo = R.uniqBy(item => item.field && item.title, baseInfo)
        .filter(child => {
          if (this.hiddenKeys && this.hiddenKeys.length && this.hiddenKeys.includes(child.field)) {
            return false
          }
          if (this.autoHiddenColumnsKey && this.$isScopedPolicyMenuHidden(`${this.autoHiddenColumnsKey}.${child.hiddenField || child.field}`)) {
            return false
          }
          if (!R.isNil(child.hidden)) {
            if (R.is(Function, child.hidden)) {
              return !child.hidden(this.data)
            }
          }
          return !child.hidden
        })
      return baseInfo
    },
  },
  methods: {
    renderItem (h, item, renderTitle = true) {
      let val
      // try catch 主要针对后端字段异常且前端没有特别严谨断言的情况下，避免详情白屏
      try {
        if (item.slots && item.slots.default) {
          val = item.slots.default({ row: this.data }, h)
          // 内容为空则直接渲染-
          if (val && val.length && val[0].elm) {
            if (!R.trim(val[0].elm.innerText)) {
              val = '-'
            }
          }
        } else if (item.formatter) {
          const _val = item.formatter({ row: this.data, cellValue: this.data[item.field] })
          val = _val || (R.type(_val) === 'Number' ? _val : '-')
        } else {
          const _val = _.get(this.data, item.field)
          val = _val || (R.type(_val) === 'Number' ? _val : '-')
        }
      } catch (error) {
        val = '-'
        console.warn(`Get field ${item.field} faied`)
        throw error
      }
      const children = []
      if (renderTitle && item.title) {
        children.push(h('div', { class: 'detail-item-title', attrs: { title: R.is(String, item.title) ? item.title : '' } }, R.is(String, item.title) ? item.title : changeToArr(item.title(h))))
      }
      children.push(<div class={classNames('detail-item-value', { 'ml-0': !renderTitle || !item.title })}>{val}</div>)
      return h('div', {
        class: 'detail-item mt-2',
      }, children)
    },
    renderItems (h, items, type) {
      let children = items.map(item => {
        return this.renderItem(h, item)
      })
      if (type === 'base-info' && this.showName) {
        children = R.insert(2, this.renderName(h), children)
        if (this.showDesc) {
          children.push(this.renderDesc(h))
        }
      }
      return h('div', {
        class: 'detail-items',
      }, children)
    },
    renderTitle (h, icon, title, items) {
      if (R.type(title) === 'Function') {
        return title({ row: this.data }, h)
      }
      return h('div', {
        class: 'detail-title',
      }, [
        h('icon', {
          props: {
            name: icon,
          },
        }),
        <span class='ml-2'>{title}</span>,
        // h('span', { class: 'ml-2' }, title),
      ])
    },
    renderContent (h, icon, title, items = [], item, type) {
      let wrapHidden
      if (R.is(Function, item && item.hidden)) {
        wrapHidden = item.hidden(this.data)
      } else {
        wrapHidden = item && item.hidden
      }
      if (wrapHidden) return
      const options = items.filter(item => {
        if (R.is(Function, item.hidden)) {
          return !item.hidden(this.data)
        }
        return !item.hidden
      })
      return h('div', {
        class: 'detail-content',
      }, [
        this.renderTitle(h, icon, title),
        !R.isEmpty(options) ? this.renderItems(h, options, type) : this.renderItem(h, item, false),
      ])
    },
    renderBase (h) {
      if (this.hiddenBaseInfo) {
        return
      }
      return h('div', {
        class: 'detail-left',
      }, [
        this.renderContent(h, 'info', i18n.t('common.info'), this.commonBaseInfo, null, 'base-info'),
      ])
    },
    renderExtra (h) {
      return h('div', {
        class: this.hiddenBaseInfo ? 'detail-all' : 'detail-right',
      }, this.extraInfo.map(item => {
        return this.renderContent(h, 'info2', item.title, item.items, item)
      }))
    },
    renderDesc (h) {
      const children = [
        h('div', { class: 'detail-item-title' }, i18n.t('table.title.desc')),
        h('div', { class: 'detail-item-value' }, [
          h('list-body-cell-wrap', {
            props: {
              copy: true,
              edit: this.isEditDesc,
              row: this.data,
              onManager: this.onManager,
              field: 'description',
              ...this.descProps,
            },
            style: { color: '#999' },
          }),
        ]),
      ]
      return h('div', {
        class: 'detail-item mt-2',
      }, children)
    },
    renderName (h) {
      const children = [
        h('div', { class: 'detail-item-title' }, i18n.t('table.title.name')),
        h('div', { class: 'detail-item-value' }, [
          h('list-body-cell-wrap', {
            props: {
              copy: true,
              edit: this.isEditName,
              row: this.data,
              onManager: this.onManager,
              steadyStatus: expectStatus[this.statusModule] && Object.values(expectStatus[this.statusModule]).flat(),
              formRules: this.nameRules,
              ...this.nameProps,
            },
          }),
        ]),
      ]
      return h('div', {
        class: 'detail-item mt-2',
      }, children)
    },
  },
  render (h, ctx) {
    return (
      <div class='detail-wrap'>
        { this.renderBase(h) }
        { this.extraInfo && this.renderExtra(h) }
      </div>
    )
  },
}
