<template>
  <div>
    <detail
      :on-manager="onManager"
      :data="data"
      :base-info="baseInfo"
      :is-edit-name="false"
      resource="storageclasses" />
  </div>

</template>

<script>
import { getCopyWithContentTableColumn } from '@/utils/common/tableColumn'
import { k8sStatusColumn } from '@K8S/utils/tableColumns'

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
        getCopyWithContentTableColumn({ field: 'cluster', title: this.$t('k8s.text_19') }),
        k8sStatusColumn(),
        {
          field: 'isDefault',
          title: this.$t('k8s.text_359'),
          formatter: ({ cellValue }) => {
            return cellValue ? this.$t('k8s.text_360') : this.$t('k8s.text_361')
          },
        },
        {
          field: 'provisioner',
          title: this.$t('k8s.text_362'),
        },
        {
          field: 'creationTimestamp',
          title: this.$t('k8s.text_74'),
          formatter: ({ cellValue }) => {
            return this.$moment(cellValue).format()
          },
        },
      ],
    }
  },
}
</script>
