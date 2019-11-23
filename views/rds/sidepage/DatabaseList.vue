<template>
  <page-list
    :columns="columns"
    :group-actions="groupActions"
    :list="list"
    :single-actions="singleActions" />
</template>

<script>
import { ACCOUNT_PRIVILEGES } from '../constants'
import { getStatusTableColumn } from '@/utils/common/tableColumn'
import WindowsMixin from '@/mixins/windows'
import expectStatus from '@/constants/expectStatus'

export default {
  name: 'RDSDatabaseList',
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
        resource: 'dbinstancedatabases',
        getParams: this.params,
        steadyStatus: Object.values(expectStatus.redisAccount).flat(),
      }),
      columns: [
        {
          field: 'name',
          title: '名称',
        },
        getStatusTableColumn({ statusModule: 'rdsDatabase' }),
        {
          field: 'dbinstanceprivileges',
          title: '已授权的账户',
          slots: {
            default: ({ row }) => {
              if (row.dbinstanceprivileges && row.dbinstanceprivileges.length > 0) {
                return row.dbinstanceprivileges.map(({ account, privileges }) => {
                  return <div>{account} <span style="color:#666;margin:0 0 0 3px">({ACCOUNT_PRIVILEGES[privileges]})</span></div>
                })
              }
            },
          },
        },
      ],
      groupActions: [
        {
          label: '新建',
          action: () => {
            this.createDialog('RDSDatabaseCreateDialog', {
              list: this.list,
              title: '新建数据库',
              rdsItem: this.data,
            })
          },
          meta: () => {
            return {
              buttonType: 'primary',
              ...this.commonMeta,
            }
          },
        },
      ],
      singleActions: [
        {
          label: '删除',
          action: (obj) => {
            this.createDialog('DeleteResDialog', {
              data: [obj],
              columns: this.columns,
              title: '删除',
              list: this.list,
            })
          },
        },
      ],
    }
  },
  computed: {
    commonMeta () {
      const isRun = this.data.status === 'running'
      let tooltip = ''
      if (!isRun) {
        tooltip = '仅在运行中状态下支持新建操作'
      }
      return {
        validate: isRun,
        tooltip: tooltip,
      }
    },
  },
  created () {
    this.list.fetchData()
  },
}
</script>
