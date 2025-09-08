<template>
  <page-list
    show-tag-columns
    show-tag-columns2
    show-tag-filter
    show-tag-config
    :columns="columns"
    :list="list"
    :showSearchbox="showSearchbox"
    :defaultSearchKey="defaultSearchKey"
    :export-data-options="exportDataOptions"
    :tag-config-params="tagConfigParams" />
</template>
<script>

import ListMixin from '@/mixins/list'
import {
  getNameFilter,
  getFilter,
  getTenantFilter,
  getDomainFilter,
  getStatusFilter,
  getBrandFilter,
  getCloudProviderFilter,
  getAccountFilter,
  getDescriptionFilter,
  getCreatedAtFilter,
} from '@/utils/common/tableFilter'
import expectStatus from '@/constants/expectStatus'
import WindowsMixin from '@/mixins/windows'
import regexp from '@/utils/regexp'
import ColumnsMixin from '@DB/views/rds/mixins/columns'

export default {
  name: 'RDSList',
  mixins: [WindowsMixin, ListMixin, ColumnsMixin],
  props: {
    id: String,
    getParams: {
      type: Object,
    },
  },
  data () {
    return {
      list: this.$list.createList(this, {
        ctx: this,
        id: this.id,
        resource: 'dbinstances',
        getParams: this.getParam,
        steadyStatus: Object.values(expectStatus.rds).flat(),
        filterOptions: {
          external_id: {
            label: this.$t('table.title.external_id'),
          },
          id: {
            label: this.$t('table.title.id'),
          },
          name: getNameFilter(),
          description: getDescriptionFilter(),
          status: getStatusFilter('rds'),
          brand: getBrandFilter('rds_engine_brands'),
          account: getAccountFilter(),
          manager: getCloudProviderFilter(),
          projects: getTenantFilter(),
          billing_type: getFilter({
            field: 'billing_type',
            title: this.$t('db.text_54'),
            items: [
              { label: this.$t('db.text_55'), key: 'postpaid' },
              { label: this.$t('db.text_56'), key: 'prepaid' },
            ],
          }),
          engine: getFilter({
            field: 'engine',
            title: this.$t('db.text_57'),
            items: [
              { label: 'MySQL', key: 'MySQL' },
              { label: 'PostgreSQL', key: 'PostgreSQL' },
              { label: 'SQLServer', key: 'SQLServer' },
            ],
          }),
          internal_connection_str: getFilter({
            field: 'internal_connection_str',
            title: this.$t('db.text_58'),
          }),
          connection_str: getFilter({
            hiddenField: 'internal_connection_str',
            field: 'connection_str',
            title: this.$t('db.text_59'),
          }),
          ip_addr: { hiddenField: 'internal_connection_str', label: this.$t('db.url_ip') },
          region: {
            label: this.$t('db.text_40'),
          },
          project_domains: getDomainFilter(),
          created_at: getCreatedAtFilter(),
        },
        responseData: this.responseData,
        hiddenColumns: ['metadata', 'vcpu_count', 'account', 'created_at'],
        autoHiddenFilterKey: 'rds_hidden_columns',
      }),
      tagConfigParams: {
        resource: 'dbinstances',
        queryTreeId: 'project-tag-value-tree',
      },
    }
  },
  computed: {
    exportDataOptions () {
      return {
        items: [
          { label: 'ID', key: 'id' },
          ...this.columns,
        ],
        title: this.$t('dictionary.dbinstance'),
        downloadType: 'local',
      }
    },
  },
  created () {
    this.webconsoleManager = new this.$Manager('webconsole', 'v1')
    this.list.fetchData()
    this.initSidePageTab('detail')
    this.$bus.$on('RdsRefresh', () => {
      this.refresh()
    })
  },
  beforeDestroy () {
    this.$bus.$off('RdsRefresh')
  },
  methods: {
    getParam () {
      const ret = {
        ...this.getParams,
        details: true,
      }
      return ret
    },
    handleOpenSidepage (row, tab) {
      this.sidePageTriggerHandle(this, 'RDSSidePage', {
        id: row.id,
        resource: 'dbinstances',
        getParams: {
          details: true,
        },
        steadyStatus: Object.values(expectStatus.rds).flat(),
      }, {
        list: this.list,
        tab,
      })
    },
    refresh () {
      this.list.refresh()
    },
    defaultSearchKey (search) {
      if (regexp.isIPv4(search)) {
        return 'ip_addr'
      }
      return 'name'
    },
  },
}
</script>
<style lang="less">
.td-ellipsis {
  width: 150px;
  word-break: keep-all;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
