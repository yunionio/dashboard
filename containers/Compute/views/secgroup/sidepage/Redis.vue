<template>
  <page-list
    show-tag-columns
    show-tag-columns2
    show-tag-filter
    show-tag-config
    :columns="columns"
    :list="list"
    :showSearchbox="showSearchbox"
    :export-data-options="exportDataOptions"
    :tag-config-params="tagConfigParams" />
</template>

<script>
import ListMixin from '@/mixins/list'
import {
  getNameFilter,
  getStatusFilter,
  getTenantFilter,
  getFilter,
  getDomainFilter,
  getBrandFilter,
  getCloudProviderFilter,
  getAccountFilter,
  getDescriptionFilter,
  getCreatedAtFilter,
} from '@/utils/common/tableFilter'
import expectStatus from '@/constants/expectStatus'
import WindowsMixin from '@/mixins/windows'
import ColumnsMixin from '@DB/views/redis/mixins/columns'
import { ENGINE_ARCH } from '@DB/views/redis/constants'

export default {
  name: 'RedisList',
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
        resource: 'elasticcaches',
        getParams: this.getParam,
        steadyStatus: Object.values(expectStatus.redis).flat(),
        filterOptions: {
          external_id: {
            label: this.$t('table.title.external_id'),
          },
          id: {
            label: this.$t('table.title.id'),
          },
          name: getNameFilter(),
          description: getDescriptionFilter(),
          status: getStatusFilter('redis'),
          brand: getBrandFilter('redis_engine_brands'),
          account: getAccountFilter(),
          manager: getCloudProviderFilter(),
          projects: getTenantFilter(),
          project_domains: getDomainFilter(),
          billing_type: getFilter({
            field: 'billing_type',
            title: this.$t('db.text_54'),
            items: [
              { label: this.$t('db.text_55'), key: 'postpaid' },
              { label: this.$t('db.text_56'), key: 'prepaid' },
            ],
          }),
          engine_version: {
            label: this.$t('db.text_236'),
            dropdown: true,
            multiple: true,
            hiddenField: 'engine',
            distinctField: {
              type: 'field',
              key: 'engine_version',
            },
          },
          local_category: {
            label: this.$t('db.text_119'),
            hiddenField: 'instance_type',
            dropdown: true,
            multiple: true,
            items: Object.keys(ENGINE_ARCH).map(key => {
              return { label: ENGINE_ARCH[key], key }
            }),
          },
          private_dns: getFilter({
            field: 'private_dns',
            title: this.$t('db.text_58'),
          }),
          public_dns: getFilter({
            field: 'public_dns',
            hiddenField: 'private_dns',
            title: this.$t('db.text_59'),
          }),
          region: {
            label: this.$t('db.text_40'),
          },
          created_at: getCreatedAtFilter(),
        },
        responseData: this.responseData,
        hiddenColumns: ['metadata', 'instance_type', 'created_at'],
        autoHiddenFilterKey: 'redis_hidden_columns',
      }),
      tagConfigParams: {
        resource: 'elasticcaches',
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
        title: this.$t('dictionary.elasticcache'),
        downloadType: 'local',
      }
    },
  },
  created () {
    this.list.fetchData()
    this.initSidePageTab('redis-detail')
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
      this.sidePageTriggerHandle(this, 'RedisSidePage', {
        id: row.id,
        resource: 'elasticcaches',
        getParams: {
          details: true,
        },
        steadyStatus: Object.values(expectStatus.redis).flat(),
      }, {
        list: this.list,
        tab,
      })
    },
  },
}
</script>
<style lang="less">
 .td-ellipsis{
    width: 150px;
    word-break: keep-all;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
 }
</style>
