<template>
  <page-list
    :list="list"
    :columns="columns"
    :group-actions="groupActions"
    :single-actions="singleActions"
    :export-data-options="exportDataOptions" />
</template>

<script>
import * as R from 'ramda'
import { mapGetters } from 'vuex'
import expectStatus from '@/constants/expectStatus'
import {
  getBrandTableColumn,
  getStatusTableColumn,
  getEnabledTableColumn,
  getPublicTableColumn,
  getCopyWithContentTableColumn,
  getNameDescriptionTableColumn,
} from '@/utils/common/tableColumn'
import { getNameFilter, getFilter, getEnabledFilter, getStatusFilter, getBrandFilter, getPublicFilter } from '@/utils/common/tableFilter'
import WindowsMixin from '@/mixins/windows'
import { changeToArr } from '@/utils/utils'

const syncPolicy = (item, ownerDomain) => {
  let tooltip
  const items = changeToArr(item)
  if (!items.length) return { validate: false }
  const enabledValid = items.every(obj => {
    if (!obj.enabled) {
      tooltip = '请先启用云账号'
      return false
    }
    return true
  })
  const autoSyncValid = items.every(obj => {
    if (obj.enable_auto_sync) {
      tooltip = '请先取消设置自动同步'
      return false
    }
    return true
  })
  return {
    validate: enabledValid && autoSyncValid && ownerDomain,
    tooltip,
  }
}

const setAutoSyncPolicy = (item, ownerDomain) => {
  let tooltip
  const items = changeToArr(item)
  if (!items.length) return { validate: false }
  const enabledValid = items.every(obj => {
    if (!obj.enabled) {
      tooltip = '请先启用云账号'
      return false
    }
    return true
  })
  return {
    validate: enabledValid && ownerDomain,
    tooltip,
  }
}

export default {
  name: 'CloudaccountList',
  mixins: [WindowsMixin],
  props: {
    id: String,
    getParams: {
      type: Object,
      default: () => ({}),
    },
    cloudEnv: String,
  },
  data () {
    return {
      list: this.$list.createList(this, {
        id: this.id,
        resource: 'cloudaccounts',
        getParams: this.getParam,
        steadyStatus: {
          status: Object.values(expectStatus.cloudaccount).flat(),
          sync_status: Object.values(expectStatus.cloudaccountSyncStatus).flat(),
        },
        filterOptions: {
          name: getNameFilter(),
          access_url: getFilter({
            field: 'access_url',
            title: '服务器地址',
          }),
          enabled: getEnabledFilter(),
          status: getStatusFilter('cloudaccount'),
          health_status: getStatusFilter({
            field: 'health_status',
            statusModule: 'cloudaccountHealthStatus',
            title: '健康状态',
          }),
          brand: getBrandFilter(),
          enable_auto_sync: getEnabledFilter({ title: '自动同步' }),
          share_mode: getPublicFilter(),
          // tenant: getTenantFilter(),
        },
      }),
      exportDataOptions: {
        items: [
          { label: 'ID', key: 'id' },
          { label: '名称', key: 'name' },
          { label: '服务器地址', key: 'access_url' },
          { label: '启用状态', key: 'enabled' },
          { label: '状态', key: 'status' },
          { label: '健康状态', key: 'health_status' },
          { label: '虚拟机', key: 'guest_count' },
          { label: '余额', key: 'balance' },
          { label: '宿主机', key: 'host_count' },
          { label: '云账号', key: 'account' },
          { label: '平台', key: 'brand' },
          { label: '自动同步', key: 'enable_auto_sync' },
          { label: '同步时间', key: 'last_auto_sync' },
        ],
      },
      columns: [
        getNameDescriptionTableColumn({
          vm: this,
          hideField: true,
          slotCallback: row => {
            return (
              <side-page-trigger onTrigger={ () => this.sidePageTriggerHandle(row.id, 'CloudaccountSidePage') }>{ row.name }</side-page-trigger>
            )
          },
        }),
        {
          field: 'access_url',
          title: '服务器地址',
          minWidth: 100,
          showOverflow: 'ellipsis',
          slots: {
            default: ({ row }) => {
              if (!row.access_url) return '-'
              return [
                <a class="link-color" href={ row.access_url }>{ row.access_url }</a>,
              ]
            },
          },
        },
        getEnabledTableColumn(),
        getStatusTableColumn({ statusModule: 'cloudaccount' }),
        getStatusTableColumn({ statusModule: 'cloudaccountHealthStatus', title: '健康状态', field: 'health_status', minWidth: 90 }),
        {
          field: 'guest_count',
          title: '虚拟机',
          width: 60,
        },
        {
          field: 'balance',
          title: '余额',
          minWidth: 70,
          showOverflow: 'ellipsis',
        },
        {
          field: 'host_count',
          title: '宿主机',
          minWidth: 70,
        },
        getCopyWithContentTableColumn({ field: 'account', title: '账号' }),
        getBrandTableColumn(),
        getEnabledTableColumn({ field: 'enable_auto_sync', title: '自动同步', minWidth: 90 }),
        {
          field: 'last_auto_sync',
          title: '同步时间',
          width: 70,
          slots: {
            default: ({ row }) => {
              if (row.sync_status !== 'idle') { // 表示正在同步中
                return [
                  <status status={ row.sync_status } statusModule='cloudaccountSyncStatus' />,
                ]
              } else {
                let time = this.$moment(row.last_sync)
                if (row.enable_auto_sync) {
                  time = this.$moment(row.last_auto_sync)
                }
                if (time) {
                  return time.fromNow()
                } else {
                  return '-'
                }
              }
            },
          },
        },
        getPublicTableColumn(),
        {
          field: 'projects',
          title: '项目',
          showOverflow: 'ellipsis',
          minWidth: 100,
          slots: {
            default: ({ row }) => {
              const projects = row.projects.map(val => val.tenant)
              const projectsText = projects.join('，')
              return [
                <list-body-cell-wrap hide-field copy field="projects" row={ row } message={ projectsText }>{ projectsText }</list-body-cell-wrap>,
                <list-body-cell-wrap hide-field copy field="projects" row={ row } message={ row.domain }>{ row.domain }</list-body-cell-wrap>,
              ]
            },
          },
        },
      ],
      groupActions: [
        {
          label: '新建',
          permisssion: 'cloudaccounts_create',
          action: () => {
            this.$router.push({ name: 'CloudaccountCreate' })
          },
          meta: () => {
            return {
              buttonType: 'primary',
            }
          },
        },
        {
          label: '更多',
          actions: () => {
            const ownerDomain = this.$store.getters.isAdminMode || this.list.selectedItems.every(obj => obj.domain_id === this.$store.getters.userInfo.projectDomainId)
            return [
              {
                label: '全量同步',
                permission: 'cloudaccounts_perform_sync',
                action: () => {
                  this.list.batchPerformAction('sync', { full_sync: true }, this.list.steadyStatus)
                },
                meta: () => syncPolicy(this.list.selectedItems, ownerDomain),
              },
              {
                label: '设置自动同步',
                permission: 'cloudaccounts_perform_enable_auto_sync,cloudaccounts_perform_disable_auto_sync',
                action: () => {
                  this.createDialog('CloudaccountSetAutoSyncDialog', {
                    data: this.list.selectedItems,
                    columns: this.columns,
                    list: this.list,
                  })
                },
                meta: () => setAutoSyncPolicy(this.list.selectedItems, ownerDomain),
              },
              {
                label: '连接测试',
                permission: 'cloudaccounts_perform_sync',
                action: () => {
                  this.list.batchPerformAction('sync', null, this.list.steadyStatus)
                },
                meta: () => syncPolicy(this.list.selectedItems, ownerDomain), // 和【全量同步】同逻辑
              },
              {
                label: '启用',
                permission: 'cloudaccounts_perform_enable',
                action: () => {
                  this.list.batchPerformAction('enable', null)
                },
                meta: () => {
                  return {
                    validate: this.list.selectedItems.length && ownerDomain,
                  }
                },
              },
              {
                label: '禁用',
                permission: 'cloudaccounts_perform_disable',
                action: () => {
                  this.list.batchPerformAction('disable', null)
                },
                meta: () => {
                  return {
                    validate: this.list.selectedItems.length && ownerDomain,
                  }
                },
              },
              {
                label: '删除',
                permission: 'cloudaccounts_delete',
                action: () => {
                  this.createDialog('DeleteResDialog', {
                    data: this.list.selectedItems,
                    columns: this.columns,
                    title: '删除云账号',
                    list: this.list,
                  })
                },
                meta: () => this.$getDeleteResult(this.list.selectedItems),
              },
            ]
          },
        },
      ],
      singleActions: [
        {
          label: '更新账号密码',
          permission: 'cloudaccounts_perform_update_credential',
          action: obj => {
            this.createDialog('CloudaccountUpdateDialog', {
              data: [obj],
              columns: this.columns,
              list: this.list,
            })
          },
          meta: obj => {
            const ownerDomain = this.$store.getters.isAdminMode || obj.domain_id === this.$store.getters.userInfo.projectDomainId
            let tooltip
            if (!obj.enabled) tooltip = '请先启用云账号'
            return {
              validate: obj.enabled && ownerDomain,
              tooltip,
            }
          },
        },
        {
          label: '更多',
          actions: obj => {
            const ownerDomain = this.$store.getters.isAdminMode || obj.domain_id === this.$store.getters.userInfo.projectDomainId
            return [
              {
                label: '全量同步',
                permission: 'cloudaccounts_perform_sync',
                action: () => {
                  this.list.onManager('performAction', {
                    id: obj.id,
                    steadyStatus: this.list.steadyStatus,
                    managerArgs: {
                      action: 'sync',
                      data: {
                        full_sync: true,
                      },
                    },
                  })
                },
                meta: () => syncPolicy(obj, ownerDomain),
              },
              {
                label: '设置自动同步',
                permission: 'cloudaccounts_perform_enable_auto_sync,cloudaccounts_perform_disable_auto_sync',
                action: () => {
                  this.createDialog('CloudaccountSetAutoSyncDialog', {
                    data: [obj],
                    columns: this.columns,
                    list: this.list,
                  })
                },
                meta: () => setAutoSyncPolicy(obj, ownerDomain),
              },
              {
                label: '连接测试',
                permission: 'cloudaccounts_perform_sync',
                action: () => {
                  this.list.onManager('performAction', {
                    id: obj.id,
                    steadyStatus: this.list.steadyStatus,
                    managerArgs: {
                      action: 'sync',
                    },
                  })
                },
                meta: () => {
                  let tooltip
                  if (!obj.enabled) tooltip = '请先启用云账号'
                  if (obj.enable_auto_sync) tooltip = '请先取消设置自动同步'
                  return {
                    validate: (obj.enabled && !obj.enable_auto_sync) && ownerDomain,
                    tooltip,
                  }
                },
              },
              {
                label: '设置共享',
                action: () => {
                  this.createDialog('CloudaccountSetShareDialog', {
                    data: [obj],
                    columns: this.columns,
                    list: this.list,
                  })
                },
                meta: () => {
                  let tooltip = ''
                  if (!this.l3PermissionEnable) {
                    tooltip = '无操作权限'
                  }
                  if (!obj.is_public) {
                    if (!ownerDomain) {
                      tooltip = '无操作权限'
                    }
                  }
                  return {
                    validate: this.l3PermissionEnable && !obj.is_public && ownerDomain,
                    tooltip,
                  }
                },
              },
              {
                label: '启用',
                permission: 'cloudaccounts_perform_enable',
                action: () => {
                  this.list.onManager('performAction', {
                    id: obj.id,
                    managerArgs: {
                      action: 'enable',
                    },
                  })
                },
                meta: () => {
                  return {
                    validate: !obj.enabled && ownerDomain,
                  }
                },
              },
              {
                label: '禁用',
                permission: 'cloudaccounts_perform_disable',
                action: () => {
                  this.list.onManager('performAction', {
                    id: obj.id,
                    managerArgs: {
                      action: 'disable',
                    },
                  })
                },
                meta: () => {
                  return {
                    validate: obj.enabled && ownerDomain,
                  }
                },
              },
              {
                label: '删除',
                permission: 'cloudaccounts_delete',
                action: () => {
                  this.createDialog('DeleteResDialog', {
                    data: [obj],
                    columns: this.columns,
                    title: '删除云账号',
                    list: this.list,
                  })
                },
                meta: () => this.$getDeleteResult(obj),
              },
            ]
          },
        },
      ],
    }
  },
  computed: {
    ...mapGetters(['l3PermissionEnable']),
  },
  watch: {
    cloudEnv (val) {
      this.$nextTick(() => {
        this.list.fetchData(0)
      })
    },
  },
  created () {
    this.initSidePageTab('cloudaccount-detail')
    this.list.fetchData()
  },
  methods: {
    getParam () {
      const ret = {
        ...(R.is(Function, this.getParams) ? this.getParams() : this.getParams),
      }
      if (this.cloudEnv) ret.cloud_env = this.cloudEnv
      return ret
    },
  },
}
</script>
