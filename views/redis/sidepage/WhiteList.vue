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
import expectStatus from '@/constants/expectStatus'

export default {
  name: 'RedisWhiteList',
  mixins: [WindowsMixin],
  props: {
    params: {
      type: Object,
    },
    data: {
      type: Object,
    },
  },
  data () {
    return {
      list: this.$list.createList(this, {
        resource: 'elasticcacheacls',
        getParams: this.params,
        steadyStatus: Object.values(expectStatus.redisACL).flat(),
      }),
      columns: [
        {
          field: 'name',
          title: '名称',
        },
        getStatusTableColumn({ statusModule: 'redisACL' }),
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
            this.createDialog('RedisWhiteListFormDialog', {
              title: '新建',
              list: this.list,
              redisItem: this.data,
            })
          },
          meta: () => {
            const isHuawei = this.data.brand === 'Huawei'
            return {
              buttonType: 'primary',
              validate: !isHuawei,
              tooltip: isHuawei ? '华为云不支持创建白名单' : null,
            }
          },
        },
      ],
      singleActions: [
        {
          label: '修改',
          action: (obj) => {
            this.createDialog('RedisWhiteListFormDialog', {
              title: '修改',
              initialValues: {
                name: obj.name,
                ip_list: obj.ip_list,
              },
              data: [obj],
              list: this.list,
              columns: this.columns,
              redisItem: this.data,
            })
          },
          meta: () => {
            const isHuawei = this.data.brand === 'Huawei'
            return {
              buttonType: 'primary',
              validate: !isHuawei,
              tooltip: isHuawei ? '华为云不支持此操作' : null,
            }
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
  },
}
</script>
