<template>
  <page-list
    :list="list"
    :columns="columns"
    :single-actions="singleActions"
    :group-actions="groupActions"
    :export-data-options="exportDataOptions"
    :hiddenExportKeys="['description']"
    :showPage="false" />
</template>

<script>
import WindowsMixin from '@/mixins/windows'
import ListMixin from '@/mixins/list'
// import { getNameFilter } from '@/utils/common/tableFilter'
import { getNameDescriptionTableColumn, getStatusTableColumn } from '@/utils/common/tableColumn'

export default {
  name: 'DomainListForWebAppSidepage',
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
        id: 'WebAppDomainList',
        resource: `webapps/${this.data.id}/custom-domains`,
        getParams: {
        },
        // filterOptions: {
        //   name: getNameFilter(),
        // },
      }),
      columns: [
        getNameDescriptionTableColumn({
          onManager: this.onManager,
          hideField: true,
          title: this.$t('table.title.name'),
          showDesc: false,
          slotCallback: row => {
            return (
              <span>{ row.name }</span>
            )
          },
        }),
        getStatusTableColumn({ statusModule: 'webappDomains' }),
        {
          field: 'ssl_state',
          title: this.$t('network.binding_type'),
          formatter: ({ row }) => {
            return row.ssl_state === 'SniEnabled' ? 'SNI SSL' : '-'
          },
        },
      ],
      singleActions: [],
      groupActions: [],
    }
  },
  computed: {
    exportDataOptions () {
      return {
        downloadType: 'local',
        title: this.$t('network.custom_domain'),
        items: [
          { field: 'id', label: 'ID' },
          ...this.columns,
        ],
      }
    },
  },
  created () {
    this.list.fetchData()
  },
  methods: {
  },
}
</script>
