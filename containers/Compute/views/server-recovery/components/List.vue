<template>
  <page-list
    :list="list"
    :columns="templateListColumns || columns"
    :group-actions="groupActions"
    :single-actions="singleActions"
    :export-data-options="exportDataOptions"
    :showSearchbox="showSearchbox"
    :showGroupActions="showGroupActions"
    :show-single-actions="!isTemplate"
    :show-page="!isTemplate" />
</template>

<script>
import expectStatus from '@/constants/expectStatus'
import WindowsMixin from '@/mixins/windows'
import { getNameFilter, getIpFilter, getOsTypeFilter, getBrandFilter, getHostFilter } from '@/utils/common/tableFilter'
import ListMixin from '@/mixins/list'
import ResTemplateListMixin from '@/mixins/resTemplateList'
import GlobalSearchMixin from '@/mixins/globalSearch'
import SingleActionsMixin from '../mixins/singleActions'
import ColumnsMixin from '../mixins/columns'

export default {
  name: 'ServerRecoveryList',
  mixins: [WindowsMixin, ListMixin, GlobalSearchMixin, ColumnsMixin, SingleActionsMixin, ResTemplateListMixin],
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
        ctx: this,
        id: this.id,
        resource: 'servers',
        getParams: this.getParam,
        isTemplate: this.isTemplate,
        templateLimit: this.templateLimit,
        steadyStatus: Object.values(expectStatus.server).flat(),
        filterOptions: {
          name: getNameFilter(),
          id: getNameFilter({ field: 'id', label: 'ID' }),
          external_id: getNameFilter({ field: 'external_id', label: this.$t('table.title.external_id') }),
          ip: getIpFilter(),
          status: {
            label: this.$t('compute.text_268'),
            dropdown: true,
            multiple: true,
            items: [
              { label: this.$t('compute.text_574'), key: 'running' },
              { label: this.$t('compute.text_273'), key: 'ready' },
              { label: this.$t('compute.text_339'), key: 'unknown' },
              { label: this.$t('compute.text_720'), key: 'sched_fail' },
            ],
            filter: true,
            formatter: val => {
              return `status.in(${val.join(',')})`
            },
          },
          brand: getBrandFilter(),
          os_type: getOsTypeFilter(),
          host: getHostFilter(),
        },
        responseData: this.responseData,
      }),
      exportDataOptions: {
        items: [
          { label: 'ID', key: 'id' },
          { label: this.$t('table.title.external_id'), key: 'external_id' },
          { label: this.$t('compute.text_228'), key: 'name' },
          { label: this.$t('compute.text_263'), key: 'ips' },
          { label: this.$t('compute.text_1036'), key: 'eip' },
          { label: 'CPU', key: 'vcpu_count' },
          { label: this.$t('compute.text_264'), key: 'vmem_size' },
          { label: this.$t('compute.text_265'), key: 'disk' },
          { label: this.$t('compute.text_266'), key: 'instance_type' },
          { label: this.$t('compute.text_267'), key: 'os_distribution' },
          { label: this.$t('compute.text_268'), key: 'status' },
          { label: this.$t('dictionary.project'), key: 'tenant' },
          { label: this.$t('compute.text_176'), key: 'hypervisor' },
          { label: this.$t('compute.text_111'), key: 'host' },
          { label: this.$t('compute.text_269'), key: 'manager' },
          { label: this.$t('compute.text_177'), key: 'region' },
          { label: this.$t('compute.text_270'), key: 'zone' },
          { label: this.$t('compute.text_498'), key: 'billing_type' },
          { label: this.$t('compute.text_271'), key: 'user_tags' },
        ],
      },
      groupActions: [
        {
          label: this.$t('compute.text_477'),
          permission: 'server_delete',
          action: () => {
            this.createDialog('ServerRecoveryDeleteDialog', {
              vm: this,
              data: this.list.selectedItems,
              columns: this.columns,
              title: this.$t('compute.text_477'),
              name: this.$t('dictionary.server'),
              requestParams: { override_pending_delete: true },
              onManager: this.onManager,
              success: () => {
                this.list.selectedItems.map(obj => {
                  this.list.singleRefresh(obj.id, ['deleting'])
                })
              },
            })
          },
          meta: () => {
            return {
              validate: this.list.allowDelete(),
            }
          },
        },
        {
          label: this.$t('compute.text_478'),
          permission: 'server_perform_cancel_delete',
          action: () => {
            this.createDialog('ServerRestoreDialog', {
              title: this.$t('compute.text_478'),
              data: this.list.selectedItems,
              columns: this.columns,
              refresh: this.refresh,
            })
          },
          meta: () => {
            if (this.list.selectedItems.length > 0 && this.list.selectedItems.find(v => v.status === 'deleting') === undefined) {
              return {
                validate: true,
              }
            }
            return {
              validate: false,
            }
          },
        },
      ],
    }
  },
  created () {
    this.list.fetchData()
  },
  methods: {
    getParam () {
      return {
        details: true,
        with_meta: true,
        pending_delete: true,
        ...this.getParams,
      }
    },
    handleOpenSidepage (row) {
      this.sidePageTriggerHandle(this, 'VminstanceRecoverySidePage', {
        id: row.id,
        resource: 'servers',
        getParams: this.getParam,
      }, {
        list: this.list,
      })
    },
  },
}
</script>
