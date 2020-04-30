<template>
  <page-list
    :list="list"
    :columns="columns" />
</template>

<script>
import WindowsMixin from '@/mixins/windows'
import ListMixin from '@/mixins/list'

export default {
  name: 'K8SEventList',
  mixins: [WindowsMixin, ListMixin],
  props: {
    id: String,
    getParams: {
      type: Object,
    },
  },
  data () {
    return {
      list: this.$list.createList(this, {
        id: this.id,
        resource: 'k8s_events',
        getParams: this.getParams,
        apiVersion: 'v1',
        idKey: 'name',
      }),
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
          title: '创建时间',
          minWidth: 100,
          showOverflow: 'ellipsis',
          formatter: ({ row }) => {
            const value = row.creationTimestamp
            return this.$moment(value).fromNow()
          },
        },
      ],
    }
  },
  created () {
    this.list.fetchData()
  },
}
</script>
