<template>
  <page-list
    :list="list"
    :columns="columns" />
</template>

<script>
import { getCopyWithContentTableColumn, getStatusTableColumn } from '@/utils/common/tableColumn'
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'BMClogList',
  mixins: [DialogMixin, WindowsMixin],
  props: {
    getParams: {
      type: [Function, Object],
    },
  },
  data () {
    return {
      list: this.$list.createList(this, {
        resource: 'baremetalevents',
        apiVersion: 'v1',
        getParams: this.getParams,
      }),
      columns: [
        {
          field: 'id',
          title: 'ID',
        },
        getStatusTableColumn({ field: 'severity', title: '严重性', statusModule: 'severity' }),
        // {
        //   field: 'severity',
        //   title: '严重性',
        //   formatter: ({ row }) => {
        //     let text = '未知'
        //     switch (row.severity) {
        //       case 'OK':
        //         text = '正常'
        //         break
        //       case 'WARNING':
        //         text = '警告'
        //         break
        //       case 'Critical':
        //         text = '严重'
        //         break
        //       default:
        //         break
        //     }
        //     return text
        //   },
        // },
        {
          field: 'type',
          title: '类型',
          formatter: ({ row }) => {
            if (row.type === 'system') {
              return '硬件'
            } else if (row.type === 'manager') {
              return 'BMC'
            }
            return '-'
          },
        },
        {
          field: 'created',
          title: '时间',
          formatter: ({ row }) => {
            return this.$moment(row.created).format('YYYY年MM月DD日 HH:mm:ss')
          },
        },
        getCopyWithContentTableColumn({ field: 'message', title: '说明' }),
      ],
    }
  },
  created () {
    this.list.fetchData()
  },
}
</script>
