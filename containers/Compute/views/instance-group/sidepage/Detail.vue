<template>
  <detail
    :on-manager="onManager"
    :data="data"
    :base-info="baseInfo"
    status-module="instanceGroup" />
</template>

<script>
import { getEnabledTableColumn } from '@/utils/common/tableColumn'

export default {
  name: 'InstanceGroupDetail',
  props: {
    onManager: {
      type: Function,
      required: true,
    },
    data: {
      type: Object,
      required: true,
    },
  },
  data () {
    return {
      baseInfo: [
        getEnabledTableColumn(),
        {
          field: 'guest_count',
          title: this.$t('compute.associated_instances'),
          slots: {
            default: ({ row }) => {
              return [(
                <a onClick={ () => this.$emit('tab-change', 'associated-instances') }>{ row.guest_count }</a>
              )]
            },
          },
        },
        {
          field: 'force_dispersion',
          title: this.$t('compute.text_694'),
          formatter: ({ cellValue }) => {
            let ret = this.$t('compute.text_696')
            if (cellValue) ret = this.$t('compute.text_695')
            return ret
          },
        },
        {
          field: 'granularity',
          title: this.$t('compute.text_697'),
        },
      ],
    }
  },
}
</script>
