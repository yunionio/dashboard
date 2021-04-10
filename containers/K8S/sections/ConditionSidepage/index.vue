<template>
  <vxe-grid :data="data.conditions || []" :columns="columns" resizable />
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
          title: this.$t('k8s.text_34'),
        },
        {
          field: 'status',
          title: this.$t('k8s.text_35'),
        },
        {
          field: 'lastProbeTime',
          title: this.$t('k8s.text_36'),
          formatter: ({ row }) => row.lastProbeTime ? this.$moment(row.lastProbeTime).format(this.$t('k8s.text_37')) : '-',
        },
        {
          field: 'lastTransitionTime',
          title: this.$t('k8s.text_38'),
          formatter: ({ row }) => row.lastTransitionTime ? this.$moment(row.lastTransitionTime).format(this.$t('k8s.text_37')) : '-',
        },
        {
          field: 'reason',
          title: this.$t('k8s.text_39'),
        },
        {
          field: 'message',
          title: this.$t('k8s.text_40'),
        },
      ],
    }
  },
}
</script>
