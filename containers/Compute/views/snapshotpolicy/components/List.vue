<template>
  <page-list
    :list="list"
    :columns="columns"
    :group-actions="groupActions"
    :single-actions="singleActions"
    :export-data-options="exportDataOptions"
    :showSearchbox="showSearchbox"
    :showGroupActions="showGroupActions" />
</template>

<script>
import { getNameFilter, getTenantFilter, getStatusFilter, getDomainFilter, getDescriptionFilter } from '@/utils/common/tableFilter'
import expectStatus from '@/constants/expectStatus'
import WindowsMixin from '@/mixins/windows'
import ListMixin from '@/mixins/list'
import GlobalSearchMixin from '@/mixins/globalSearch'
import SingleActionsMixin from '../mixins/singleActions'
import ColumnsMixin from '../mixins/columns'

export default {
  name: 'SnapshotPolicyList',
  mixins: [WindowsMixin, ListMixin, GlobalSearchMixin, ColumnsMixin, SingleActionsMixin],
  props: {
    id: String,
    getParams: {
      type: Object,
      default: () => ({}),
    },
    cloudEnv: String,
    cloudEnvOptions: {
      type: Array,
    },
  },
  data () {
    return {
      list: this.$list.createList(this, {
        id: this.id,
        resource: 'snapshotpolicies',
        steadyStatus: Object.values(expectStatus.snapshotpolicy).flat(),
        getParams: this.getParam,
        filterOptions: {
          id: {
            label: this.$t('table.title.id'),
          },
          name: getNameFilter(),
          description: getDescriptionFilter(),
          status: getStatusFilter('snapshotpolicy'),
          type: {
            label: this.$t('common.resource_type'),
            dropdown: true,
            items: [
              { label: this.$t('dictionary.disk'), key: 'disk' },
              { label: this.$t('dictionary.server'), key: 'server' },
            ],
          },
          projects: getTenantFilter(),
          project_domains: getDomainFilter(),
        },
        hiddenColumns: ['created_at'],
        responseData: this.responseData,
      }),
      exportDataOptions: {
        items: [
          { label: 'ID', key: 'id' },
          { label: this.$t('table.title.name'), key: 'name' },
          { label: this.$t('common.resource_type'), key: 'type' },
          { label: this.$t('table.title.bind_disk_count'), key: 'binding_disk_count' },
          { label: this.$t('compute.bind_resource_count'), key: 'binding_resource_count' },
          { label: this.$t('table.title.strategy'), key: 'repeat_weekdays' },
          { label: this.$t('common.status'), key: 'status' },
          { label: this.$t('res.project'), key: 'tenant' },
        ],
      },
      groupActions: [
        {
          label: this.$t('compute.perform_create'),
          permission: 'snapshotpolicy_create',
          action: () => {
            this.createDialog('CreateSnapshotPolicyDialog', {
              data: this.list.selectedItems,
              columns: this.columns,
              title: this.$t('compute.perform_create'),
              refresh: this.refresh,
            })
          },
          meta: () => {
            return {
              buttonType: 'primary',
            }
          },
        },
        {
          label: this.$t('compute.perform_delete'),
          permission: 'snapshotpolicy_delete',
          action: () => {
            this.createDialog('DeleteResDialog', {
              vm: this,
              data: this.list.selectedItems,
              columns: this.columns,
              title: this.$t('compute.perform_delete'),
              name: this.$t('dictionary.snapshotpolicy'),
              onManager: this.onManager,
            })
          },
          meta: () => this.$getDeleteResult(this.list.selectedItems),
        },
      ],
    }
  },
  watch: {
    cloudEnv (val) {
      this.$nextTick(() => {
        this.list.fetchData(0)
      })
    },
  },
  created () {
    this.initSidePageTab('snapshot-policy-detail')
    this.list.fetchData()
    this.$bus.$on('refresh-snapshotpolicy-list', () => {
      this.list.fetchData()
    })
  },
  methods: {
    getParam () {
      const ret = {
        details: true,
        ...this.getParams,
      }
      if (this.cloudEnv) ret.cloud_env = this.cloudEnv
      return ret
    },
    handleOpenSidepage (row, tab) {
      this.sidePageTriggerHandle(this, 'SnapshotPolicySidePage', {
        id: row.id,
        resource: 'snapshotpolicies',
        getParams: this.getParam,
        steadyStatus: Object.values(expectStatus.snapshotpolicy).flat(),
      }, {
        list: this.list,
        type: this.type,
        tab,
      })
    },
  },
}
</script>
