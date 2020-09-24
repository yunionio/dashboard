<template>
  <div>
    <detail
    :on-manager="onManager"
    :data="data"
    :base-info="baseInfo"
    resource="federatedrolebindings" />
  </div>

</template>

<script>
import { roleRefColumn, subjectsColumn } from '@K8S/utils/sidePageColumn'
import { k8sStatusColumn } from '@K8S/utils/tableColumns'

export default {
  name: 'K8sFederatedrolebindingDetail',
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
        k8sStatusColumn(),
        {
          field: 'creationTimestamp',
          title: this.$t('k8s.text_74'),
          formatter: ({ cellValue }) => {
            return this.$moment(cellValue).format()
          },
        },
        roleRefColumn('spec.template.roleRef'),
        subjectsColumn('spec.template.subjects'),
      ],
    }
  },
}
</script>
