<template>
  <page-list
    :list="list"
    :columns="columns"
    :show-tag-columns="true"
    :show-tag-columns2="true"
    :show-tag-filter="true"
    :export-data-options="exportDataOptions"
    :group-actions="groupActions"
    :showSearchbox="showSearchbox"
    :showGroupActions="showGroupActions"
    :single-actions="singleActions" />
</template>

<script>
import * as R from 'ramda'
import GlobalSearchMixin from '@/mixins/globalSearch'
import expectStatus from '@/constants/expectStatus'
import WindowsMixin from '@/mixins/windows'
import { getStatusFilter, getNameFilter, getDescriptionFilter, getTenantFilter, getCloudProviderFilter, getAccountFilter } from '@/utils/common/tableFilter'
import { disableDeleteAction } from '@/utils/common/tableActions'
import ListMixin from '@/mixins/list'
import ColumnsMixin from '../mixins/columns'
import SingleActionsMixin from '../mixins/singleActions'

export default {
  name: 'KafkaList',
  mixins: [WindowsMixin, ListMixin, GlobalSearchMixin, ColumnsMixin, SingleActionsMixin],
  props: {
    id: String,
    getParams: {
      type: [Function, Object],
    },
    data: {
      type: Object,
    },
    hiddenActions: {
      type: Array,
      default: () => ([]),
    },
  },
  data () {
    return {
      list: this.$list.createList(this, {
        id: this.id,
        resource: 'kafkas',
        getParams: this.getParam,
        steadyStatus: Object.values(expectStatus.kafka).flat(),
        filterOptions: {
          id: {
            label: this.$t('table.title.id'),
          },
          external_id: {
            label: this.$t('table.title.external_id'),
          },
          name: getNameFilter(),
          description: getDescriptionFilter(),
          status: getStatusFilter('kafka'),
          account: getAccountFilter(),
          manager: getCloudProviderFilter(),
          projects: getTenantFilter(),
          region: {
            label: this.$t('middleware.cloudregion'),
          },
        },
        responseData: this.responseData,
      }),
      groupActions: [
        {
          label: this.$t('middleware.syncstatus'),
          permission: 'kafkas_perform_syncstatus',
          action: () => {
            this.onManager('batchPerformAction', {
              steadyStatus: ['available', 'unknown'],
              managerArgs: {
                action: 'syncstatus',
              },
            })
          },
          meta: () => ({
            validate: this.list.selected.length,
          }),
        },
        {
          label: this.$t('common.batchAction'),
          actions: (obj) => {
            return [
              {
                label: this.$t('compute.text_283'),
                permission: 'kafkas_perform_set_user_metadata',
                action: () => {
                  this.createDialog('SetTagDialog', {
                    data: this.list.selectedItems,
                    columns: this.columns,
                    onManager: this.onManager,
                    params: {
                      resources: 'kafkas',
                    },
                    mode: 'add',
                  })
                },
              },
              disableDeleteAction(Object.assign(this, {
                permission: 'kafkas_update',
              }), {
                name: this.$t('dictionary.kafka'),
              }),
              {
                label: this.$t('middleware.delete'),
                permission: 'kafkas_delete',
                action: () => {
                  this.createDialog('DeleteResDialog', {
                    vm: this,
                    title: this.$t('middleware.delete'),
                    data: this.list.selectedItems,
                    columns: this.columns,
                    onManager: this.onManager,
                    refresh: this.refresh,
                    name: this.$t('dictionary.kafka'),
                  })
                },
                meta: () => this.$getDeleteResult(this.list.selectedItems),
              },
            ]
          },
          meta: () => {
            const selectedLength = this.list.selectedItems.length
            return {
              validate: selectedLength,
              tooltip: '',
            }
          },
        },
      ],
    }
  },
  computed: {
    exportDataOptions () {
      return {
        items: [
          { label: 'ID', key: 'id' },
          ...this.columns,
        ],
        title: this.$t('middleware.kafka'),
        downloadType: 'local',
        fixedItems: [
          { key: 'disk_size_gb', label: this.$t('table.title.disk') + '(G)' },
        ],
      }
    },
  },
  created () {
    this.initSidePageTab('kafka-detail')
    this.list.fetchData()
  },
  methods: {
    getParam () {
      const ret = {
        ...(R.is(Function, this.getParams) ? this.getParams() : this.getParams),
        detail: true,
      }
      return ret
    },
    handleOpenSidepage (row) {
      this.sidePageTriggerHandle(this, 'KafkaSidePage', {
        id: row.id,
        resource: 'kafkas',
        getParams: this.getParam,
      }, {
        list: this.list,
      })
    },
  },
}
</script>
