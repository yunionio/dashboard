<template>
  <page-list
    :list="list"
    :columns="columns"
    :export-data-options="exportDataOptions" />
</template>

<script>
import ColumnsMixin from '../mixins/columns'
import { getNameFilter, getEnabledFilter, getDescriptionFilter } from '@/utils/common/tableFilter'
import WindowsMixin from '@/mixins/windows'
import ListMixin from '@/mixins/list'

export default {
  name: 'CloudregionList',
  mixins: [WindowsMixin, ListMixin, ColumnsMixin],
  props: {
    id: String,
  },
  data () {
    return {
      list: this.$list.createList(this, {
        id: this.id,
        resource: 'cloudregions',
        getParams: { cloud_env: 'private_or_onpremise' },
        filterOptions: {
          name: getNameFilter(),
          description: getDescriptionFilter(),
          enabled: getEnabledFilter({ label: this.$t('cloudenv.text_98') }),
        },
      }),
      exportDataOptions: {
        items: [
          { label: 'ID', key: 'id' },
          { label: this.$t('cloudenv.text_95'), key: 'name' },
          { label: this.$t('cloudenv.text_98'), key: 'status' },
          { label: this.$t('cloudenv.text_369'), key: 'guest_count' },
          { label: 'VPC', key: 'vpc_count' },
          { label: this.$t('cloudenv.text_11'), key: 'zone_count' },
          { label: this.$t('cloudenv.text_102'), key: 'provider' },
        ],
        getParams: {
          cloud_env: 'private_or_onpremise',
          show_fail_reason: true,
        },
      },
    }
  },
  created () {
    this.initSidePageTab('cloudregion-detail')
    this.list.fetchData()
  },
  methods: {
    handleOpenSidepage (row) {
      this.sidePageTriggerHandle(this, 'CloudregionSidePage', {
        id: row.id,
        resource: 'cloudregions',
      }, {
        list: this.list,
      })
    },
  },
}
</script>
