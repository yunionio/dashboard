<template>
  <vxe-grid :data="data[field] || []" :columns="columns" resizable />
</template>

<script>
import { k8sEnvColumn } from '@K8S/utils/tableColumns'

export default {
  name: 'K8SContainerSidepage',
  props: {
    data: {
      type: Object,
      required: true,
    },
    field: {
      type: String,
      default: 'containers',
    },
  },
  data () {
    return {
      columns: [
        {
          field: 'name',
          title: this.$t('k8s.text_41'),
        },
        {
          field: 'image',
          title: this.$t('k8s.text_42'),
        },
        k8sEnvColumn(),
        {
          field: 'commands',
          title: this.$t('k8s.text_43'),
          formatter: ({ row }) => row.commands ? `[ ${row.commands} ]` : '-',
        },
        {
          field: 'args',
          title: this.$t('k8s.text_44'),
          formatter: ({ row }) => row.args ? `[ ${row.args} ]` : '-',
        },
      ],
    }
  },
}
</script>
