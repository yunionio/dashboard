<template>
  <page-list
    :list="list"
    :columns="columns" />
</template>

<script>
import {
  getCopyWithContentTableColumn,
  getTimeTableColumn,
  getBrandTableColumn,
} from '@/utils/common/tableColumn'
import { getNameFilter, getBrandFilter } from '@/utils/common/tableFilter'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'CloudeventsList',
  mixins: [WindowsMixin],
  props: {
    id: String,
  },
  data () {
    return {
      list: this.$list.createList(this, {
        id: this.id,
        resource: 'cloudevents',
        apiVersion: 'v1',
        idKey: 'created_at',
        filterOptions: {
          name: getNameFilter(),
          brand: getBrandFilter(),
          account: {
            label: '账号',
          },
          manager: {
            label: '订阅',
          },
          service: {
            label: '服务类型',
          },
          action: {
            label: '操作类型',
          },
        },
      }),
      columns: [
        getCopyWithContentTableColumn({
          title: '资源名称',
          field: 'name',
        }),
        getCopyWithContentTableColumn({
          title: '服务类型',
          field: 'service',
        }),
        getCopyWithContentTableColumn({
          title: '操作类型',
          field: 'action',
        }),
        {
          title: '执行状态',
          field: 'success',
          width: 80,
          slots: {
            default: ({ row }) => {
              const txt = row.success ? '成功' : '失败'
              const color = row.success ? '#67C23A' : '#F56C6C'
              return [<span style={{ color }}>{ txt }</span>]
            },
          },
        },
        getTimeTableColumn({
          field: 'created_at',
          title: '操作时间',
        }),
        getBrandTableColumn({
          field: 'provider',
        }),
        getCopyWithContentTableColumn({
          field: 'account',
          title: '账号',
        }),
        getCopyWithContentTableColumn({
          field: 'manager',
          title: '订阅',
        }),
        {
          field: 'notes',
          title: '备注',
          width: 70,
          slots: {
            default: ({ row, column }) => {
              let text = ''
              try {
                text = JSON.stringify(row.request, null, 4)
              } catch (e) {
                text = row.request
              }
              let disabled = false
              if (!row.request) disabled = true
              return [<a-button size='small' type='link' onClick={ () => this.clickHandler(text) } disabled={ disabled }>查看</a-button>]
            },
          },
        },
      ],
    }
  },
  created () {
    this.initSidePageTab('cloudregion-detail')
    this.list.fetchData()
  },
  methods: {
    clickHandler (val) {
      this.createDialog('EventLogDialog', {
        data: val,
      })
    },
  },
}
</script>
