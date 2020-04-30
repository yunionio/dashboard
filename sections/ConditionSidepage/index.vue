<template>
  <vxe-grid :data="data.conditions || []" :columns="columns" />
</template>

<script>
export default {
  name: 'K8SConditionSidepage',
  props: {
    data: {
      type: Object,
      required: true,
    },
  },
  data () {
    return {
      columns: [
        {
          field: 'type',
          title: '类型',
        },
        {
          field: 'status',
          title: '状态',
        },
        {
          field: 'lastProbeTime',
          title: '最近心跳',
          formatter: ({ row }) => row.lastProbeTime ? this.$moment(row.lastProbeTime).format('YYYY年MM月DD日 HH:mm:ss') : '-',
        },
        {
          field: 'lastTransitionTime',
          title: '最近更改',
          formatter: ({ row }) => row.lastTransitionTime ? this.$moment(row.lastTransitionTime).format('YYYY年MM月DD日 HH:mm:ss') : '-',
        },
        {
          field: 'reason',
          title: '原因',
        },
        {
          field: 'message',
          title: '消息',
        },
      ],
    }
  },
}
</script>
