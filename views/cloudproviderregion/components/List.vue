<template>
  <page-list
    :list="list"
    :columns="columns"
    :group-actions="groupActions"
    :single-actions="singleActions" />
</template>

<script>
import {
  getEnabledTableColumn,
} from '@/utils/common/tableColumn'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'CloudproviderregionList',
  mixins: [WindowsMixin],
  props: {
    getParams: {
      type: [Function, Object],
    },
    cloudproviderId: {
      type: String,
      required: true,
    },
  },
  data () {
    const ownerDomain = list => this.$store.getters.isAdminMode || this.list.selectedItems.every(obj => obj.domain_id === this.$store.getters.userInfo.projectDomainId)
    return {
      list: this.$list.createList(this, {
        resource: 'cloudproviderregions',
        getParams: this.getParams,
        idKey: 'cloudregion_id',
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
        {
          field: 'cloudregion',
          title: '名称',
        },
        getEnabledTableColumn({ title: '启用自动同步' }),
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
      ],
      groupActions: [
        {
          label: '设置同步',
          action: () => {
            this.createDialog('cloudproviderregionsSetAutoSyncDialog', {
              data: this.list.selectedItems,
              columns: this.columns,
              list: this.list,
              cloudproviderId: this.cloudproviderId,
            })
          },
          meta: () => {
            return {
              validate: this.list.selectedItems.length && ownerDomain(this.list),
            }
          },
        },
      ],
      singleActions: [
        {
          label: '设置同步',
          action: obj => {
            this.createDialog('cloudproviderregionsSetAutoSyncDialog', {
              data: [obj],
              columns: this.columns,
              list: this.list,
              cloudproviderId: this.cloudproviderId,
            })
          },
          meta: obj => {
            let tooltip
            if (!ownerDomain(this.list)) tooltip = '无权限操作'
            return {
              validate: ownerDomain(this.list),
              tooltip,
            }
          },
        },
      ],
    }
  },
  created () {
    this.list.fetchData()
  },
  methods: {
  },
}
</script>
