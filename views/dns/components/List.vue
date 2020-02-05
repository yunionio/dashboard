<template>
  <page-list
    :list="list"
    :columns="columns"
    :single-actions="singleActions"
    :group-actions="groupActions" />
</template>

<script>
import {
  getNameDescriptionTableColumn,
  getEnabledTableColumn,
  getCopyWithContentTableColumn,
} from '@/utils/common/tableColumn'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'DNSList',
  mixins: [WindowsMixin],
  data () {
    return {
      list: this.$list.createList(this, {
        resource: 'dnsrecords',
        filterOptions: {
          name: {
            label: '名称',
            filter: true,
            formatter: val => {
              return `name.contains("${val}")`
            },
          },
        },
      }),
      columns: [
        getNameDescriptionTableColumn({
          vm: this,
          hideField: true,
          title: '域名',
          slotCallback: row => {
            return (
              <side-page-trigger onTrigger={ () => this.sidePageTriggerHandle(row.id, 'DNSSidePage') }>{ row.name }</side-page-trigger>
            )
          },
        }),
        getCopyWithContentTableColumn({
          field: 'records',
          title: '记录值',
        }),
        {
          field: 'ttl',
          title: 'TTL',
          formatter: ({ cellValue, row }) => {
            const ttlTime = parseInt(cellValue / 60)
            if (ttlTime >= 1440) { // 一天是 1440 分钟
              return `${parseInt(ttlTime / 1440)} 天`
            } else if (ttlTime >= 60) {
              return `${parseInt(ttlTime / 60)} 小时`
            } else if (ttlTime > 1) {
              return `${ttlTime} 分钟`
            } else {
              return `${cellValue || 0} 秒`
            }
          },
        },
        getEnabledTableColumn(),
      ],
      groupActions: [
        {
          label: '新建',
          action: () => {
            this.createDialog('DnsCreateDialog', {
              title: '新建',
              data: this.list.selectedItems,
              list: this.list,
              type: 'create',
            })
          },
          meta: () => {
            return {
              buttonType: 'primary',
            }
          },
        },
        {
          label: '删除',
          permission: 'vpcs_delete',
          action: () => {
            this.createDialog('DeleteResDialog', {
              title: '删除',
              data: this.list.selectedItems,
              columns: this.columns,
              list: this.list,
            })
          },
          meta: () => {
            return {
              validate: this.list.allowDelete(),
            }
          },
        },
      ],
      singleActions: [
        {
          label: '启用',
          action: (obj) => {
            this.list.onManager('performAction', {
              id: obj.id,
              managerArgs: {
                action: 'enable',
              },
            })
          },
          meta: (obj) => ({
            validate: !obj.enabled,
          }),
        },
        {
          label: '禁用',
          action: (obj) => {
            this.list.onManager('performAction', {
              id: obj.id,
              managerArgs: {
                action: 'disable',
              },
            })
          },
          meta: (obj) => ({
            validate: obj.enabled,
          }),
        },
        {
          label: '更多',
          actions: obj => {
            return [
              {
                label: '修改',
                action: () => {
                  this.createDialog('DnsCreateDialog', {
                    title: '修改',
                    data: [obj],
                    columns: this.columns,
                    list: this.list,
                    type: 'update',
                  })
                },
                meta: (obj) => ({
                  validate: obj.can_update,
                }),
              },
              {
                label: '克隆',
                action: () => {
                  this.createDialog('DnsCreateDialog', {
                    title: '克隆',
                    data: [obj],
                    columns: this.columns,
                    list: this.list,
                    type: 'clone',
                  })
                },
              },
              {
                label: '删除',
                permission: 'dnsrecords_delete',
                action: () => {
                  this.createDialog('DeleteResDialog', {
                    title: '删除',
                    data: [obj],
                    columns: this.columns,
                    list: this.list,
                    success: () => {
                      this.destroySidePages()
                    },
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
  created () {
    this.initSidePageTab('dns-detail')
    this.list.fetchData()
  },
}
</script>
