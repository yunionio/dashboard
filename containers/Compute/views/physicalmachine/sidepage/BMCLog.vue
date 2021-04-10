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
        id: 'BMClogListForPhysicalmachineSidePage',
        resource: 'baremetalevents',
        apiVersion: 'v1',
        getParams: this.getParams,
      }),
      columns: [
        {
          field: 'id',
          title: 'ID',
        },
        getStatusTableColumn({ field: 'severity', title: this.$t('compute.text_746'), statusModule: 'severity' }),
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
          title: this.$t('compute.text_175'),
          formatter: ({ row }) => {
            if (row.type === 'system') {
              return this.$t('compute.text_855')
            } else if (row.type === 'manager') {
              return 'BMC'
            }
            return '-'
          },
        },
        {
          field: 'created',
          title: this.$t('compute.text_856'),
          formatter: ({ row }) => {
            return this.$moment(row.created).format(this.$t('compute.text_857'))
          },
        },
        getCopyWithContentTableColumn({ field: 'message', title: this.$t('compute.text_858') }),
      ],
    }
  },
  created () {
    this.list.fetchData()
  },
}
</script>
