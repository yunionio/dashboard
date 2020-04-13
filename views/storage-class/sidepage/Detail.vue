<template>
  <div>
    <detail
    :on-manager="onManager"
    :data="data"
    :base-info="baseInfo"
    resource="storageclasses" />
  </div>

</template>

<script>
import { getCopyWithContentTableColumn } from '@/utils/common/tableColumn'

export default {
  name: 'K8sStorageclassDetail',
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
        getCopyWithContentTableColumn({ field: 'cluster', title: '集群' }),
        {
          field: 'isDefault',
          title: '默认',
          formatter: ({ cellValue }) => {
            return cellValue ? '是' : '否'
          },
        },
        {
          field: 'provisioner',
          title: '供应者',
        },
        {
          field: 'creationTimestamp',
          title: '创建时间',
          formatter: ({ cellValue }) => {
            return this.$moment(cellValue).format()
          },
        },
      ],
    }
  },
}
</script>
