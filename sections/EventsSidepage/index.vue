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
      }),
      columns: [
        {
          field: 'message',
          title: this.$t('k8s.text_72'),
          minWidth: 150,
          showOverflow: 'title',
        },
        {
          field: 'sourceComponent',
          title: this.$t('k8s.text_73'),
          width: 120,
        },
        {
          field: 'reason',
          title: this.$t('k8s.text_39'),
          minWidth: 70,
          showOverflow: 'ellipsis',
        },
        {
          field: 'creationTimestamp',
          title: this.$t('k8s.text_74'),
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
