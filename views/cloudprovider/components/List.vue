<template>
  <page-list
    :list="list"
    :columns="columns"
    :group-actions="groupActions"
    :single-actions="singleActions" />
</template>

<script>
import expectStatus from '@/constants/expectStatus'
import {
  getProjectTableColumn,
  getStatusTableColumn,
  getEnabledTableColumn,
  getNameDescriptionTableColumn,
} from '@/utils/common/tableColumn'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'CloudproviderList',
  mixins: [WindowsMixin],
  props: {
    getParams: {
      type: [Function, Object],
    },
  },
  data () {
    const ownerDomain = list => this.$store.getters.isAdminMode || list.selectedItems.every(obj => obj.domain_id === this.$store.getters.userInfo.projectDomainId)
    return {
      list: this.$list.createList(this, {
        resource: 'cloudproviders',
        getParams: this.getParams,
        steadyStatus: Object.values(expectStatus.cloudaccount).flat(),
        filterOptions: {
          name: {
            label: '名称',
            filter: true,
            formatter: val => {
              return `name.contains(${val})`
            },
          },
        },
      }),
      columns: [
        getNameDescriptionTableColumn({
          vm: this,
          hideField: true,
          slotCallback: row => {
            return (
              <side-page-trigger onTrigger={ () => this.sidePageTriggerHandle(row.id, 'CloudproviderSidePage') }>{ row.name }</side-page-trigger>
            )
          },
        }),
        {
          field: 'account',
          title: '订阅（Subscription）ID',
          slots: {
            default: ({ row }) => {
              let subscribeIds = (row.account && row.account.split('/')) || []
              const text = subscribeIds.length > 1 ? subscribeIds[1] : subscribeIds[0]
              return [
                <list-body-cell-wrap message={text} copy hideField={true}>
                  <span>{text}</span>
                </list-body-cell-wrap>,
              ]
            },
          },
        },
        getEnabledTableColumn(),
        getStatusTableColumn({ statusModule: 'cloudaccount' }),
        {
          field: 'last_auto_sync',
          title: '同步时间',
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
        {
          field: 'sync_status',
          title: '同步状态',
          slots: {
            default: ({ row }) => {
              return [
                <status status={ row.sync_status } statusModule='cloudaccountSyncStatus' />,
              ]
            },
          },
        },
        getProjectTableColumn(),
      ],
      groupActions: [
        {
          label: '启用',
          action: () => {
            this.list.batchPerformAction('enable', null)
          },
          meta: () => {
            let tooltip
            if (!ownerDomain(this.list)) tooltip = '无权限操作'
            return {
              validate: this.list.selectedItems.length && ownerDomain(this.list),
              tooltip,
            }
          },
        },
        {
          label: '禁用',
          action: () => {
            this.list.batchPerformAction('disable', null)
          },
          meta: () => {
            let tooltip
            if (!ownerDomain(this.list)) tooltip = '无权限操作'
            return {
              validate: this.list.selectedItems.length && ownerDomain(this.list),
              tooltip,
            }
          },
        },
        {
          label: '更改项目',
          action: () => {
            this.createDialog('ChangeProjectDialog', {
              data: this.list.selectedItems,
              columns: this.columns,
              list: this.list,
            })
          },
          meta: () => {
            return {
              validate: this.list.selectedItems.length && this.list.selectedItems.every(val => val.enabled) && ownerDomain(this.list),
            }
          },
        },
      ],
      singleActions: [
        {
          label: '更改项目',
          action: obj => {
            this.createDialog('ChangeProjectDialog', {
              data: [obj],
              columns: this.columns,
              list: this.list,
            })
          },
          meta: obj => {
            let tooltip
            if (!obj.enabled) tooltip = '请先启用'
            if (!ownerDomain(this.list)) tooltip = '无权限操作'
            return {
              validate: obj.enabled && ownerDomain(this.list),
              tooltip,
            }
          },
        },
        {
          label: '全量同步',
          action: obj => {
            this.list.onManager('performAction', {
              id: obj.id,
              steadyStatus: this.list.steadyStatus,
              managerArgs: {
                action: 'sync',
                params: {
                  full_sync: true,
                },
              },
            })
          },
          meta: obj => {
            let tooltip
            let validate = true
            if (!ownerDomain(this.list)) {
              tooltip = '权限不足'
              validate = false
            }
            if (!obj.enabled) {
              tooltip = '请先启用'
              validate = false
            }
            return {
              tooltip,
              validate,
            }
          },
        },
        {
          label: '更多',
          actions: obj => {
            return [
              {
                label: '启用',
                action: () => {
                  this.list.onManager('performAction', {
                    id: obj.id,
                    managerArgs: {
                      action: 'enable',
                    },
                  })
                },
                meta: () => {
                  let tooltip
                  if (!ownerDomain(this.list)) tooltip = '无权限操作'
                  return {
                    validate: !obj.enabled && ownerDomain(this.list),
                    tooltip,
                  }
                },
              },
              {
                label: '禁用',
                action: () => {
                  this.list.onManager('performAction', {
                    id: obj.id,
                    managerArgs: {
                      action: 'disable',
                    },
                  })
                },
                meta: () => {
                  let tooltip
                  if (!ownerDomain(this.list)) tooltip = '无权限操作'
                  return {
                    validate: obj.enabled && ownerDomain(this.list),
                    tooltip,
                  }
                },
              },
            ]
          },
        },
      ],
    }
  },
  created () {
    this.initSidePageTab('cloudaccount-detail')
    this.list.fetchData()
  },
}
</script>
