<template>
  <page-list
    :columns="columns"
    :group-actions="groupActions"
    :list="list"
    :single-actions="singleActions" />
</template>

<script>
import { getStatusTableColumn } from '@/utils/common/tableColumn'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'RedisList',
  mixins: [WindowsMixin],
  props: {
    getParams: {
      type: Function,
    },
    data: {
      type: Object,
    },
  },
  data () {
    return {
      list: this.$list.createList(this, {
        resource: 'elasticcacheacls',
        getParams: this.getParams,
      }),
      columns: [
        {
          field: 'name',
          title: '名称',
        },
        getStatusTableColumn(),
        {
          field: 'ip',
          title: 'IP',
          slots: {
            default: ({ row }) => {
              if (row.ip_list) {
                const ips = row.ip_list.split(',')
                return ips.map(ip => {
                  return <div><a-tag>{ip}</a-tag></div>
                })
              }
              return ''
            },
          },
        },
      ],
      groupActions: [
        {
          label: '新建',
          action: (obj) => {
            this.createDialog('RedisWhiteListCreate', {
              data: [obj],
              columns: this.columns,
              list: this.list,
              redisItem: this.data,
            })
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
          label: '修改',
          action: (obj) => {
          },
        },
        {
          label: '删除',
          action: (obj) => {
            this.createDialog('RedisWhiteListDeleteDialog', {
              data: [obj],
              columns: this.columns,
              title: '删除白名单',
              list: this.list,
            })
          },
        },
      ],
    }
  },
  created () {
    this.list.fetchData()
    console.log(this.data)
  },
}
</script>
