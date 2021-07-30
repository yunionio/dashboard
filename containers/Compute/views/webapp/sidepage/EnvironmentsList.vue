<template>
  <page-list
    :list="list"
    :columns="columns"
    :single-actions="singleActions" />
</template>

<script>
import WindowsMixin from '@/mixins/windows'
import ListMixin from '@/mixins/list'

export default {
  name: 'EnvironmentsListForWebAppSidepage',
  mixins: [WindowsMixin, ListMixin],
  props: {
    resId: String,
    data: {
      type: Object,
      required: true,
    },
  },
  data () {
    return {
      list: this.$list.createList(this, {
        resource: 'webappenvironments',
        getParams: {
          app_id: this.data.id,
        },
      }),
      columns: [
        {
          field: 'name',
          title: this.$t('compute.webapp.env'),
          minWidth: 100,
          formatter: ({ row }) => {
            return row.name
          },
        },
        {
          field: 'instance_type',
          title: this.$t('compute.webapp.instance_type'),
          minWidth: 100,
          formatter: ({ row }) => {
            return row.instance_type
          },
        },
        {
          field: 'instance_number',
          title: this.$t('compute.webapp.instance_number'),
          minWidth: 100,
          formatter: ({ row }) => {
            return row.instance_number
          },
        },
      ],
      singleActions: [
        {
          label: this.$t('common.action.delete'),
          action: (obj) => {
            this.createDialog('DeleteResDialog', {
              vm: this,
              data: [obj],
              columns: this.columns,
              title: this.$t('common.action.delete'),
              name: this.$t('compute.webapp.env'),
              onManager: this.onManager,
            })
          },
          meta: (obj) => this.$getDeleteResult(obj),
        },
      ],
    }
  },
  created () {
    this.list.fetchData()
  },
  methods: {
  },
}
</script>
