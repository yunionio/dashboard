
<template>
  <page-list
    :list="list"
    :columns="columns"
    :group-actions="groupActions"
    :single-actions="singleActions"
    :export-data-options="exportDataOptions" />
</template>

<script>
import * as R from 'ramda'
import ColumnsMixin from '../mixins/columns'
import SingleActionsMixin from '../mixins/singleActions'
import WindowsMixin from '@/mixins/windows'
import ListMixin from '@/mixins/list'
import { getNameFilter, getTenantFilter, getStatusFilter, getEnabledFilter, getDescriptionFilter } from '@/utils/common/tableFilter'
import expectStatus from '@/constants/expectStatus'
import { getEnabledSwitchActions } from '@/utils/common/tableActions'
import { levelMaps } from '@Monitor/constants'

export default {
  name: 'CommonalertList',
  mixins: [WindowsMixin, ListMixin, ColumnsMixin, SingleActionsMixin],
  props: {
    listId: String,
    getParams: {
      type: Object,
      default: () => ({
        details: true,
      }),
    },
    alertType: {
      type: String,
      default: 'all',
    },
  },
  data () {
    return {
      list: this.$list.createList(this, {
        id: this.listId,
        resource: 'commonalerts',
        apiVersion: 'v1',
        getParams: this.getParam,
        steadyStatus: Object.values(expectStatus.commonalert).flat(),
        filterOptions: {
          name: getNameFilter(),
          description: getDescriptionFilter(),
          status: getStatusFilter('commonalert'),
          enabled: getEnabledFilter(),
          tenant: getTenantFilter(),
          res_type: {
            label: this.$t('monitor.text_97'),
            dropdown: true,
            distinctField: {
              type: 'extra_field',
              key: 'res_type',
            },
            mapper: data => {
              return data.map(val => {
                let label = val.label
                if (this.$te(`dictionary.${val.key}`)) label = this.$t(`dictionary.${val.key}`)
                return {
                  key: val.key,
                  label,
                }
              })
            },
          },
          level: {
            label: this.$t('monitor.level'),
            dropdown: true,
            items: Object.values(levelMaps),
          },
        },
        hiddenColumns: ['created_at'],
      }),
      groupActions: [
        {
          label: this.$t('common.create'),
          permission: 'commonalerts_create',
          action: () => {
            this.$router.push({
              path: '/commonalerts/create',
            })
          },
          meta: () => ({
            buttonType: 'primary',
          }),
        },
        {
          label: this.$t('common.batchAction'),
          actions: obj => {
            return [
              ...getEnabledSwitchActions(this, obj, ['commonalerts_perform_enable', 'commonalerts_perform_disable']),
              {
                label: this.$t('common.delete'),
                permission: 'commonalerts_delete',
                action: () => {
                  const data = this.list.selectedItems
                  this.createDialog('DeleteResDialog', {
                    vm: this,
                    data,
                    columns: this.columns,
                    title: this.$t('common.delete'),
                    name: this.$t('dictionary.commonalert'),
                    onManager: this.onManager,
                  })
                },
                meta: () => this.$getDeleteResult(this.list.selectedItems),
              },
            ]
          },
        },
      ],
      exportDataOptions: {
        items: [
          { key: 'name', label: this.$t('common.name') },
          { key: 'status', label: this.$t('common.status') },
          { key: 'enabled', label: this.$t('table.title.enable_status') },
          { key: 'common_alert_metric_details', label: this.$t('monitor.strategy_detail') },
          { key: 'level', label: this.$t('monitor.level') },
          { key: 'tenant', label: this.$t('monitor.text00015') },
          { label: this.$t('common.createdAt'), key: 'created_at' },
        ],
      },
    }
  },
  watch: {
    alertType (val) {
      this.$nextTick(() => {
        this.list.fetchData(0)
      })
    },
  },
  created () {
    this.initSidePageTab('commonalert-detail')
    this.fetchData()
  },
  methods: {
    getParam () {
      const ret = {
        ...(R.is(Function, this.getParams) ? this.getParams() : this.getParams),
      }
      if (this.alertType && this.alertType !== 'all') ret.alert_type = this.alertType
      return ret
    },
    fetchData () {
      this.list.fetchData()
    },
    handleOpenSidepage (row) {
      this.sidePageTriggerHandle(this, 'CommonalertsSidePage', {
        id: row.id,
        resource: 'commonalerts',
        getParams: this.getParam,
        apiVersion: 'v1',
      }, {
        list: this.list,
      })
    },
  },
}
</script>
