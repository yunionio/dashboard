<template>
  <detail
    :onManager="onManager"
    :data="data"
    :base-info="baseInfo"
    :extra-info="extraInfo"
    status-module="sku"
    resource="llm_skus" />
</template>

<script>
import WindowsMixin from '@/mixins/windows'
import {
  getDeviceModelTableColumn,
  getImageTableColumn,
  getBandwidthTableColumn,
  getCpuTableColumn,
  getMemoryTableColumn,
  getDiskTableColumn,
  getLlmTypeTableColumn,
  getLlmModelNameTableColumn,
} from '../utils/columns'

export default {
  name: 'LlmSkuDetail',
  mixins: [WindowsMixin],
  props: {
    data: {
      type: Object,
      required: true,
    },
    onManager: {
      type: Function,
      required: true,
    },
  },
  data () {
    return {
      baseInfo: [
        getDeviceModelTableColumn(),
        getImageTableColumn(),
        getBandwidthTableColumn(),
        getLlmTypeTableColumn(),
        getLlmModelNameTableColumn(),
        getCpuTableColumn(),
        getMemoryTableColumn(),
        getDiskTableColumn(),
      ],
      extraInfo: [
        // {
        //   field: 'mounted_apps',
        //   title: this.$t('aice.mounted_apps'),
        //   slots: {
        //     default: ({ row }) => {
        //       const mounted_apps = row.mounted_apps
        //       if (mounted_apps?.length) {
        //         return mounted_apps.map((item, idx) => {
        //           const parts = item.split('/')
        //           return <list-body-cell-wrap copy hideField={true} field='mounted_apps' row={row} message={parts[0]}>
        //             {parts[0]} (ver: {parts[1]})
        //           </list-body-cell-wrap>
        //         })
        //       }
        //       return '-'
        //     },
        //   },
        // },
      ],
    }
  },
}
</script>
