<template>
  <vxe-grid :data="data.conditions || []" :columns="columns" resizable />
</template>

<script>

export default {
  name: 'K8SStatusSidepage',
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
          title: 'Type',
          minWidth: 100,
          showOverflow: 'ellipsis',
        },
        {
          field: 'status',
          title: 'Status',
          width: 75,
        },
        {
          field: 'lastTransitionTime',
          title: 'LastTransitionTime',
          minWidth: 100,
          showOverflow: 'ellipsis',
          formatter: ({ cellValue }) => {
            return this.$moment(cellValue).format(this.$t('k8s.text_37'))
          },
        },
        {
          field: 'reason',
          title: 'Reason',
          minWidth: 70,
          showOverflow: 'ellipsis',
        },
        {
          field: 'message',
          title: 'Message',
          minWidth: 70,
          showOverflow: 'ellipsis',
        },
      ],
    }
  },
}
</script>
