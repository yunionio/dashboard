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
import { getStatusFilter, getDomainFilter, getTenantFilter } from '@/utils/common/tableFilter'
import WindowsMixin from '@/mixins/windows'
import ListMixin from '@/mixins/list'

export default {
  name: 'InstanceGroupList',
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
        resource: 'instancegroups',
        getParams: this.getParam,
        filterOptions: {
          name: {
            label: this.$t('compute.text_228'),
            filter: true,
            formatter: val => {
              return `name.contains(${val})`
            },
          },
          status: getStatusFilter('instanceGroup'),
          force_dispersion: {
            label: this.$t('compute.text_694'),
            dropdown: true,
            items: [
              { label: this.$t('compute.text_695'), key: true },
              { label: this.$t('compute.text_696'), key: false },
            ],
          },
          enabled: {
            label: this.$t('compute.text_241'),
            dropdown: true,
            items: [
              { label: this.$t('compute.text_656'), key: true },
              { label: this.$t('compute.text_569'), key: false },
            ],
          },
          projects: getTenantFilter(),
          project_domains: getDomainFilter(),
        },
      }),
      exportDataOptions: {
        items: [
          { label: 'ID', key: 'id' },
          { label: this.$t('compute.text_241'), key: 'enabled' },
          { label: this.$t('compute.text_228'), key: 'name' },
          { label: this.$t('compute.text_694'), key: 'force_dispersion' },
          { label: this.$t('compute.text_697'), key: 'granularity' },
          { label: this.$t('compute.text_698', [this.$t('dictionary.server')]), key: 'guest_count' },
          { label: this.$t('dictionary.project'), key: 'tenant' },
          { label: this.$t('compute.text_243'), key: 'created_at' },
        ],
      },
      groupActions: [
        {
          label: this.$t('compute.text_18'),
          permission: 'instancegroups_create',
          action: () => {
            this.createDialog('InstanceGroupCreateDialog', {
              onManager: this.onManager,
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
          action: () => {
            this.createDialog('DeleteResDialog', {
              vm: this,
              data: this.list.selectedItems,
              columns: this.columns,
              title: this.$t('compute.text_700', [this.$t('dictionary.instancegroup')]),
              name: this.$t('dictionary.instancegroup'),
              onManager: this.onManager,
            })
          },
          meta: () => this.$getDeleteResult(this.list.selectedItems),
        },
      ],
    }
  },
  created () {
    this.initSidePageTab('instance-group-detail')
    this.list.fetchData()
    this.$bus.$on('InstanceGroupListRefresh', () => {
      this.list.refresh()
    }, this)
  },
  methods: {
    getParam () {
      const ret = {
        details: true,
        ...this.getParams,
      }
      return ret
    },
    handleOpenSidepage (row) {
      this.sidePageTriggerHandle(this, 'InstanceGroupSidePage', {
        id: row.id,
        resource: 'instancegroups',
        getParams: this.getParam,
      }, {
        list: this.list,
      })
    },
  },
}
</script>
