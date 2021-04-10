<template>
  <page-list
    :list="list"
    :columns="columns"
    :group-actions="groupActions"
    :single-actions="singleActions"
    :export-data-options="exportDataOptions" />
</template>

<script>
import ColumnsMixin from '../mixins/columns'
import SingleActionsMixin from '../mixins/singleActions'
import { getNameFilter, getTenantFilter, getStatusFilter, getDomainFilter } from '@/utils/common/tableFilter'
import expectStatus from '@/constants/expectStatus'
import WindowsMixin from '@/mixins/windows'
import ListMixin from '@/mixins/list'

export default {
  name: 'SnapshotPolicyList',
  mixins: [WindowsMixin, ListMixin, ColumnsMixin, SingleActionsMixin],
  props: {
    id: String,
    getParams: {
      type: Object,
      default: () => ({}),
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
          name: getNameFilter(),
          status: getStatusFilter('snapshotpolicy'),
          projects: getTenantFilter(),
          project_domains: getDomainFilter(),
        },
      }),
      exportDataOptions: {
        items: [
          { label: 'ID', key: 'id' },
          { label: this.$t('table.title.name'), key: 'name' },
          { label: this.$t('table.title.bind_disk_count'), key: 'binding_disk_count' },
          { label: this.$t('table.title.strategy'), key: 'repeat_weekdays' },
          { label: this.$t('common.status'), key: 'status' },
          { label: this.$t('res.project'), key: 'tenant' },
        ],
      },
      groupActions: [
        {
          label: this.$t('compute.text_18'),
          permission: 'snapshotpolicy_create',
          action: () => {
            this.createDialog('CreateSnapshotPolicyDialog', {
              data: this.list.selectedItems,
              columns: this.columns,
              title: this.$t('compute.text_18'),
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
          label: this.$t('compute.text_261'),
          permission: 'snapshotpolicies_delete',
          action: () => {
            this.createDialog('DeleteResDialog', {
              vm: this,
              data: this.list.selectedItems,
              columns: this.columns,
              title: this.$t('compute.text_261'),
              name: this.$t('dictionary.snapshotpolicy'),
              onManager: this.onManager,
            })
          },
          meta: () => this.$getDeleteResult(this.list.selectedItems),
        },
      ],
    }
  },
  created () {
    this.initSidePageTab('snapshot-policy-detail')
    this.list.fetchData()
  },
  methods: {
    getParam () {
      const ret = {
        details: true,
      }
      if (this.cloudEnv) ret.cloud_env = this.cloudEnv
      return ret
    },
    handleOpenSidepage (row) {
      this.sidePageTriggerHandle(this, 'SnapshotPolicySidePage', {
        id: row.id,
        resource: 'snapshotpolicies',
        getParams: this.getParam,
        steadyStatus: Object.values(expectStatus.snapshotpolicy).flat(),
      }, {
        list: this.list,
        type: this.type,
      })
    },
  },
}
</script>
