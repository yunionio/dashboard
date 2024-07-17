<template>
  <div>
    <a-alert class="mb-2" :message="$t('cloudenv.smal_provider_tips')" />
    <page-list
      :list="list"
      :columns="columns"
      :group-actions="groupActions"
      :single-actions="singleActions"
      :export-data-options="exportDataOptions" />
  </div>
</template>

<script>
import { getNameFilter } from '@/utils/common/tableFilter'
import WindowsMixin from '@/mixins/windows'
import ListMixin from '@/mixins/list'
import ColumnsMixin from '../mixins/columns'
import SingleActionsMixin from '../mixins/singleActions'

export default {
  name: 'SamlProviderList',
  mixins: [WindowsMixin, ListMixin, ColumnsMixin, SingleActionsMixin],
  props: {
    id: String,
    getParams: {
      type: Object,
    },
  },
  data () {
    return {
      list: this.$list.createList(this, {
        id: this.id || 'SamlProviderList',
        resource: 'saml_providers',
        getParams: this.getParams,
        filterOptions: {
          name: getNameFilter(),
        },
        hiddenColumns: ['created_at'],
      }),
      groupActions: [],
    }
  },
  computed: {
    exportDataOptions () {
      return {
        downloadType: 'local',
        title: this.$t('cloudenv.saml_provider'),
        items: [
          { field: 'id', title: 'ID' },
          ...this.columns,
        ],
      }
    },
  },
  created () {
    this.list.fetchData()
  },
  methods: {
    handleOpenSidepage (row) {
      this.sidePageTriggerHandle(this, 'SamlProviderSidePage', {
        id: row.id,
        resource: 'saml_providers',
        getParams: this.getParam,
      }, {
        list: this.list,
        tab: 'event-drawer',
      })
    },
  },
}
</script>
