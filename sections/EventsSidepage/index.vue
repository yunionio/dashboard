<template>
  <vxe-grid :data="data.events || []" :columns="columns" />
</template>

<script>

export default {
  name: 'K8SEventSidepage',
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
          field: 'message',
          title: '内容',
          minWidth: 150,
          showOverflow: 'ellipsis',
        },
        {
          field: 'sourceComponent',
          title: '来源',
          width: 120,
        },
        {
          field: 'reason',
          title: '原因',
          minWidth: 70,
          showOverflow: 'ellipsis',
        },
        {
          field: 'creationTimestamp',
          title: '创建于',
          minWidth: 100,
          showOverflow: 'ellipsis',
          formatter: ({ row }) => {
            const value = row.objectMeta.creationTimestamp
            return this.$moment(value).fromNow()
          },
        },
      ],
    }
  },
}
</script>
