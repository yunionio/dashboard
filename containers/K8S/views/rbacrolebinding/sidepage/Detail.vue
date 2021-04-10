<template>
  <div>
    <detail
    :on-manager="onManager"
    :data="data"
    :base-info="baseInfo"
    :is-edit-name="false"
    resource="rbacrolebindings" />
  </div>

</template>

<script>
import { getCopyWithContentTableColumn } from '@/utils/common/tableColumn'
import { roleRefColumn, subjectsColumn } from '@K8S/utils/sidePageColumn'
import { k8sStatusColumn } from '@K8S/utils/tableColumns'

export default {
  name: 'K8sRbacrolebindingDetail',
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
          field: 'creationTimestamp',
          title: this.$t('k8s.text_74'),
          formatter: ({ cellValue }) => {
            return this.$moment(cellValue).format()
          },
        },
        { field: 'namespace', title: this.$t('k8s.text_23') },
        roleRefColumn(),
        subjectsColumn(),
      ],
    }
  },
}
</script>
