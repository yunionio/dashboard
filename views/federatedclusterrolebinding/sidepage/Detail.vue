<template>
  <div>
    <detail
    :on-manager="onManager"
    :data="data"
    :base-info="baseInfo"
    resource="federatedclusterrolebindings" />
  </div>

</template>

<script>
import { getCopyWithContentTableColumn } from '@/utils/common/tableColumn'
import { roleRefColumn, subjectsColumn } from '@K8S/utils/sidePageColumn'

export default {
  name: 'K8sFederatedclusterrolebindingDetail',
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
        getCopyWithContentTableColumn({ field: 'cluster', title: this.$t('k8s.text_19') }),
        {
          field: 'status',
          title: this.$t('k8s.text_35'),
          width: 200,
          slots: {
            default: ({ row }, h) => {
              const ret = [<span style={{ color: row.status === 'Active' ? '#67C23A' : '#F56C6C' }}>{ row.status }</span>]
              return ret
            },
          },
        },
        {
          field: 'creationTimestamp',
          title: this.$t('k8s.text_74'),
          formatter: ({ cellValue }) => {
            return this.$moment(cellValue).format()
          },
        },
        roleRefColumn('spec.template'),
        subjectsColumn('spec.template'),
      ],
    }
  },
}
</script>
