<template>
  <div>
    <detail
    :on-manager="onManager"
    :data="data"
    :base-info="baseInfo"
    resource="federatedroles" />
  </div>

</template>

<script>
export default {
  name: 'K8sFederatedroleDetail',
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
      ],
    }
  },
}
</script>
