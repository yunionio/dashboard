<template>
  <page-list
    :list="list"
    :columns="columns"
    :single-actions="singleActions"
    :group-actions="groupActions"
    :export-data-options="exportDataOptions" />
</template>

<script>
import WindowsMixin from '@/mixins/windows'
import ListMixin from '@/mixins/list'
import { getNameFilter } from '@/utils/common/tableFilter'
import { getNameDescriptionTableColumn } from '@/utils/common/tableColumn'

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
        id: 'WebAppEnvironmentList',
        resource: 'webappenvironments',
        getParams: {
          app_id: this.data.id,
        },
        filterOptions: {
          name: getNameFilter(),
        },
      }),
      exportDataOptions: {
        items: [
          { label: 'ID', key: 'id' },
          { label: this.$t('compute.webapp.env'), key: 'name' },
          { label: this.$t('compute.webapp.instance_type'), key: 'instance_type' },
          { label: this.$t('compute.webapp.instance_number'), key: 'instance_number' },
        ],
      },
      columns: [
        getNameDescriptionTableColumn({
          onManager: this.onManager,
          hideField: true,
          title: this.$t('compute.webapp.env'),
          slotCallback: row => {
            return (
              <side-page-trigger onTrigger={ () => this.handleOpenSidepage(row) }>{ row.name }</side-page-trigger>
            )
          },
        }),
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
      singleActions: [],
      groupActions: [],
    }
  },
  created () {
    this.list.fetchData()
  },
  methods: {
  },
}
</script>
