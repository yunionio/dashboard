import './style.scss'
import * as R from 'ramda'
import _ from 'lodash'
import moment from 'moment'
import classNames from 'classnames'
import i18n from '@/locales'
import WindowsMixin from '@/mixins/windows'
import { hasPermission } from '@/utils/auth'

const handleOpenRegionDetail = (vm, row) => {
  vm.initSidePageTab('cloudregion-detail')
  vm.sidePageTriggerHandle(vm, 'CloudregionSidePage', {
    id: row.region_id,
    resource: 'cloudregions',
  })
}

const handleOpenZoneDetail = (vm, row) => {
  vm.initSidePageTab('zone-detail')
  vm.sidePageTriggerHandle(vm, 'ZoneSidePage', {
    id: row.zone_id,
    resource: 'zones',
  })
}

const handleOpenAccountDetail = (vm, row) => {
  vm.initSidePageTab('cloudaccount-detail')
  vm.sidePageTriggerHandle(vm, 'CloudaccountSidePage', {
    id: row.account_id,
    resource: 'cloudaccounts',
  })
}

const handleOpenProjectDetail = (vm, row) => {
  vm.initSidePageTab('project-detail')
  vm.sidePageTriggerHandle(vm, 'ProjectSidePage', {
    id: row.tenant_id,
    resource: 'projects',
    apiVersion: 'v1',
  })
}

const handleOpenDomainDetail = (vm, row) => {
  vm.initSidePageTab('detail')
  vm.sidePageTriggerHandle(vm, 'DomainSidePage', {
    id: row.domain_id,
    resource: 'domains',
    apiVersion: 'v1',
  })
}

// 需要添加区域（cloudregion/cloudregion_id), 可用区（zone/zone_id)，云账号(account/account_id)，云订阅（manager/manager_id)的资源
const appendOutherResources = ['servers', 'hosts', 'disks', 'storages', 'vpcs', 'wires', 'networks', 'snapshots', 'eips', 'dbinstances', 'elasticcaches']

const getDefaultLastBaseInfo = (vm, h, { data, onManager, resource }) => {
  const outher = [
    {
      field: 'region',
      title: '区域',
      slots: {
        default: ({ row }) => {
          if (!row.region_id) return row.region || '-'
          const p = hasPermission({ key: 'cloudregions_get' })
          let node
          if (p) {
            node = (
              <list-body-cell-wrap copy row={ data } onManager={ onManager } field='region' title={ row['region'] } hideField={ true }>
                <side-page-trigger onTrigger={ () => handleOpenRegionDetail(vm, row) }>{ row.region }</side-page-trigger>
              </list-body-cell-wrap>
            )
          } else {
            node = (
              <list-body-cell-wrap copy row={ data } onManager={ onManager } field='region' title={ row['region'] } />
            )
          }
          return [
            <div class='text-truncate'>{ node }</div>,
          ]
        },
      },
    },
    {
      field: 'zone',
      title: '可用区',
      slots: {
        default: ({ row }) => {
          if (!row.zone_id) return row.zone || '-'
          const p = hasPermission({ key: 'zones_get' })
          let node
          if (p) {
            node = (
              <list-body-cell-wrap copy row={ data } onManager={ onManager } field='zone' title={ row['zone'] } hideField={ true }>
                <side-page-trigger onTrigger={ () => handleOpenZoneDetail(vm, row) }>{ row.zone }</side-page-trigger>
              </list-body-cell-wrap>
            )
          } else {
            node = (
              <list-body-cell-wrap copy row={ data } onManager={ onManager } field='zone' title={ row['zone'] } />
            )
          }
          return [
            <div class='text-truncate'>{ node }</div>,
          ]
        },
      },
    },
    {
      field: 'account',
      title: '云账号',
      slots: {
        default: ({ row }) => {
          if (!row.account_id) return row.account || '-'
          const p = hasPermission({ key: 'cloudaccounts_get' })
          let node
          if (p) {
            node = (
              <list-body-cell-wrap copy row={ data } onManager={ onManager } field='account' title={ row['account'] } hideField={ true }>
                <side-page-trigger onTrigger={ () => handleOpenAccountDetail(vm, row) }>{ row.account }</side-page-trigger>
              </list-body-cell-wrap>
            )
          } else {
            node = (
              <list-body-cell-wrap copy row={ data } onManager={ onManager } field='account' title={ row['account'] } />
            )
          }
          return [
            <div class='text-truncate'>{ node }</div>,
          ]
        },
      },
    },
  ]
  let ret = [
    {
      field: 'created_at',
      title: '创建时间',
      formatter: ({ row }) => {
        return (row.created_at && moment(row.created_at).format()) || '-'
      },
    },
    {
      field: 'updated_at',
      title: '更新时间',
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

const getDefaultTopBaseInfo = (vm, h, { idKey, statusKey, statusModule, data, onManager }) => {
  return [
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
    {
      field: statusKey,
      title: '状态',
      slots: {
        default: ({ row }) => {
          if (statusModule && row[statusKey]) {
            return [<status status={ row[statusKey] } statusModule={ statusModule } />]
          }
          return '-'
        },
      },
    },
    {
      field: 'project_domain',
      title: i18n.t('dictionary.domain'),
      slots: {
        default: ({ row }) => {
          const domain = row.project_domain || row.domain
          if (!row.domain_id) return domain || '-'
          const p = hasPermission({ key: 'domains_get' })
          let node
          if (p) {
            node = (
              <list-body-cell-wrap copy row={ data } onManager={ onManager } field='project_domain' title={ row['project_domain'] } message={domain} hideField={ true }>
                <side-page-trigger onTrigger={ () => handleOpenDomainDetail(vm, row) }>{ domain }</side-page-trigger>
              </list-body-cell-wrap>
            )
          } else {
            node = (
              <list-body-cell-wrap copy row={ data } onManager={ onManager } field='project_domain' title={ row['project_domain'] } message={domain} />
            )
          }
          return [
            <div class='text-truncate'>{ node }</div>,
          ]
        },
      },
    },
    {
      field: 'tenant',
      title: i18n.t('dictionary.project'),
      formatter: ({ row }) => {
        return row.tenant || '-'
      },
      slots: {
        default: ({ row }) => {
          if (!row.tenant_id) return row.tenant || '-'
          const p = hasPermission({ key: 'projects_get' })
          let node
          if (p) {
            node = (
              <list-body-cell-wrap copy row={ data } onManager={ onManager } field='tenant' title={ row['tenant'] } hideField={ true }>
                <side-page-trigger onTrigger={ () => handleOpenProjectDetail(vm, row) }>{ row.tenant }</side-page-trigger>
              </list-body-cell-wrap>
            )
          } else {
            node = (
              <list-body-cell-wrap copy row={ data } onManager={ onManager } field='tenant' title={ row['tenant'] } />
            )
          }
          return [
            <div class='text-truncate'>{ node }</div>,
          ]
        },
      },
    },
  ]
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
    resource: String,
  },
  computed: {
    commonBaseInfo () {
      const defaultTopBaseInfo = getDefaultTopBaseInfo(this, this.$createElement, {
        idKey: this.idKey,
        statusKey: this.statusKey,
        statusModule: this.statusModule,
        data: this.data,
        onManager: this.onManager,
      })
      const defaultLastBaseInfo = getDefaultLastBaseInfo(this, this.$createElement, {
        onManager: this.onManager,
        data: this.data,
        resource: this.resource,
      })
      // 与传递进来的baseInfo比较，去除在baseInfo中已有字段
      for (let i = 0; i < this.baseInfo.length; i++) {
        for (let j = 0; j < defaultTopBaseInfo.length; j++) {
          if (this.baseInfo[i].field === defaultTopBaseInfo[j].field || this.baseInfo[i].title === defaultTopBaseInfo[j].title) {
            defaultTopBaseInfo.splice(j, 1)
          }
        }
      }
      let baseInfo = defaultTopBaseInfo.concat(this.baseInfo).concat(defaultLastBaseInfo)
      baseInfo = R.uniqBy(item => item.field && item.title, baseInfo)
      return baseInfo
    },
  },
  methods: {
    renderItem (h, item, renderTitle = true) {
      let val
      if (item.slots && item.slots.default) {
        val = item.slots.default({ row: this.data }, h)
      } else if (item.formatter) {
        val = item.formatter({ row: this.data, cellValue: this.data[item.field] }) || '-'
      } else {
        val = _.get(this.data, item.field) || '-'
      }
      const children = []
      if (renderTitle && item.title) {
        children.push(h('div', { class: 'detail-item-title' }, item.title))
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
      if (type === 'base-info') {
        children = R.insert(1, this.renderName(h), children)
        if (this.showDesc) {
          children.push(this.renderDesc(h))
        }
      }
      return h('div', {
        class: 'detail-items',
      }, children)
    },
    renderTitle (h, icon, title) {
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
    renderContent (h, icon, title, items, item, type) {
      return h('div', {
        class: 'detail-content',
      }, [
        this.renderTitle(h, icon, title),
        items ? this.renderItems(h, items, type) : this.renderItem(h, item, false),
      ])
    },
    renderBase (h) {
      return h('div', {
        class: 'detail-left',
      }, [
        this.renderContent(h, 'info', '基本信息', this.commonBaseInfo, null, 'base-info'),
      ])
    },
    renderExtra (h) {
      return h('div', {
        class: 'detail-right',
      }, this.extraInfo.map(item => {
        return this.renderContent(h, 'info2', item.title, item.items, item)
      }))
    },
    renderDesc (h) {
      const children = [
        h('div', { class: 'detail-item-title' }, '备注'),
        h('div', { class: 'detail-item-value' }, [
          h('list-body-cell-wrap', {
            props: {
              copy: true,
              edit: true,
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
        h('div', { class: 'detail-item-title' }, '名称'),
        h('div', { class: 'detail-item-value' }, [
          h('list-body-cell-wrap', {
            props: {
              copy: true,
              edit: true,
              row: this.data,
              onManager: this.onManager,
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
