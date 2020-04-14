<template>
  <vxe-grid :data="data[field] || []" :columns="columns" />
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
          title: '名称',
        },
        {
          field: 'image',
          title: '镜像',
        },
        k8sEnvColumn(),
        {
          field: 'commands',
          title: '命令',
          formatter: ({ row }) => row.commands ? `[ ${row.commands} ]` : '-',
        },
        {
          field: 'args',
          title: '参数',
          formatter: ({ row }) => row.args ? `[ ${row.args} ]` : '-',
        },
      ],
    }
  },
}
</script>
