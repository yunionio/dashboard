<template>
  <vxe-grid :data="responseData.data || []" :columns="columns" />
</template>

<script>
import * as R from 'ramda'
import WindowsMixin from '@/mixins/windows'
import { getStatusTableColumn } from '@/utils/common/tableColumn'

export default {
  name: 'VmReleaseVirtualmachineSidepage',
  mixins: [WindowsMixin],
  props: {
    responseData: {
      type: Object,
      default: () => ({ data: [] }),
    },
  },
  data () {
    return {
      columns: [
        {
          field: 'name',
          title: this.$t('helm.text_16'),
          minWidth: 100,
          slots: {
            default: ({ row }) => {
              const text = row.name || '-'
              return [
                <list-body-cell-wrap copy hideField={true} field='name' row={row} message={text}>
                  <side-page-trigger name='VmInstanceSidePage' id={row.externalInfo.id} vm={this}>{text}</side-page-trigger>
                </list-body-cell-wrap>,
              ]
            },
          },
        },
        getStatusTableColumn({ statusModule: 'vmReleaseVirtualmachine', sortable: false, minWidth: 50 }),
        {
          field: 'ips',
          title: 'IP',
          minWidth: 120,
          slots: {
            default: ({ row }) => {
              if (!row.externalInfo || !row.externalInfo.ips) return '-'
              return row.externalInfo.ips.map(val => <list-body-cell-wrap copy hideField={true} message={val}>{val}</list-body-cell-wrap>)
            },
          },
        },
        {
          field: 'eip',
          title: this.$t('dictionary.eip'),
          minWidth: 120,
          slots: {
            default: ({ row }) => {
              if (!row.externalInfo || !row.externalInfo.eip) return '-'
              const val = row.externalInfo.eip
              return [<list-body-cell-wrap copy hideField={true} message={val}>{val}</list-body-cell-wrap>]
            },
          },
        },
        {
          field: 'instanceType',
          title: this.$t('helm.text_99'),
        },
      ],
    }
  },
}
</script>
