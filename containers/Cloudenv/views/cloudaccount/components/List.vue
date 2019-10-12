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
  getBrandTableColumn,
  getStatusTableColumn,
  getEnabledTableColumn,
  getPublicTableColumn,
  getCopyWithContentTableColumn,
  getNameDescriptionTableColumn,
} from '@/utils/common/tableColumn'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'CloudaccountList',
  mixins: [WindowsMixin],
  data () {
    return {
      list: this.$list.createList(this, {
        resource: 'cloudaccounts',
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
        getNameDescriptionTableColumn({ vm: this }),
        {
          field: 'access_url',
          title: '服务器地址',
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
        getStatusTableColumn({ statusModule: 'cloudaccountHealthStatus', title: '健康状态', field: 'health_status' }),
        {
          field: 'guest_count',
          title: '虚拟机',
        },
        {
          field: 'balance',
          title: '余额',
        },
        {
          field: 'host_count',
          title: '宿主机',
        },
        getCopyWithContentTableColumn({ field: 'account', title: '账号' }),
        getBrandTableColumn(),
        getEnabledTableColumn({ field: 'enable_auto_sync', title: '自动同步' }),
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
        getPublicTableColumn(),
        getProjectTableColumn({ field: 'projects' }),
      ],
      groupActions: [
        {
          label: '新建',
          action: () => {
            this.$router.push({ name: 'CloudaccountCreate' })
          },
          meta: () => {
            return {
              buttonType: 'primary',
            }
          },
        },
      ],
      singleActions: [
        {
          label: '更新账号密码',
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
            if (!ownerDomain) tooltip = '无权限操作'
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
                action: () => {
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
                meta: () => {
                  let tooltip
                  if (!obj.enabled) tooltip = '请先启用云账号'
                  if (obj.enable_auto_sync) tooltip = '请先取消设置自动同步'
                  if (!ownerDomain) tooltip = '无权限操作'
                  return {
                    validate: (obj.enabled && !obj.enable_auto_sync) && ownerDomain,
                    tooltip,
                  }
                },
              },
              {
                label: '设置自动同步',
                action: () => {
                  this.createDialog('CloudaccountSetAutoSyncDialog', {
                    data: [obj],
                    columns: this.columns,
                    list: this.list,
                  })
                },
                meta: () => {
                  let tooltip
                  if (!obj.enabled) tooltip = '请先启用云账号'
                  if (!ownerDomain) tooltip = '无权限操作'
                  return {
                    validate: obj.enabled && ownerDomain,
                    tooltip,
                  }
                },
              },
              {
                label: '连接测试',
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
                  if (!ownerDomain) tooltip = '无权限操作'
                  return {
                    validate: (obj.enabled && !obj.enable_auto_sync) && ownerDomain,
                    tooltip,
                  }
                },
              },
              {
                label: '设置为共享',
                action: () => {
                  this.list.onManager('performAction', {
                    id: obj.id,
                    managerArgs: {
                      action: 'public',
                    },
                  })
                },
                meta: () => {
                  return {
                    validate: !obj.is_public,
                  }
                },
              },
              {
                label: '设置为私有',
                action: () => {
                  this.list.onManager('performAction', {
                    id: obj.id,
                    managerArgs: {
                      action: 'private',
                    },
                  })
                },
                meta: () => {
                  return {
                    validate: obj.is_public,
                  }
                },
              },
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
                  if (!ownerDomain) tooltip = '无权限操作'
                  return {
                    validate: !obj.enabled && ownerDomain,
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
                  if (!ownerDomain) tooltip = '无权限操作'
                  return {
                    validate: obj.enabled && ownerDomain,
                    tooltip,
                  }
                },
              },
              {
                label: '删除',
                action: () => {
                  this.createDialog('DeleteResDialog', {
                    data: [obj],
                    columns: this.columns,
                    title: '删除云账号',
                    list: this.list,
                  })
                },
                meta: () => {
                  let tooltip
                  if (obj.enabled) tooltip = '请先禁用该账户'
                  if (obj.enable_auto_sync) tooltip = '请先关闭自动同步'
                  if (obj.sync_status === 'syncing') tooltip = '当前账号正在同步中，请稍后再试'
                  if (!ownerDomain) tooltip = '无权限操作'
                  return {
                    validate: obj.can_delete && ownerDomain,
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
    this.list.fetchData()
  },
}
</script>
