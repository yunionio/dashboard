<template>
  <page-list
    :list="list"
    show-tag-columns
    show-tag-filter
    :columns="columns"
    :single-actions="singleActions"
    :group-actions="groupActions"
    :showSearchbox="showSearchbox"
    :showGroupActions="showGroupActions"
    :export-data-options="exportDataOptions" />
</template>

<script>
import * as R from 'ramda'
import ListMixin from '@/mixins/list'
import WindowsMixin from '@/mixins/windows'
import expectStatus from '@/constants/expectStatus'
import {
  getDomainFilter,
  getStatusFilter,
  getDescriptionFilter,
  getCreatedAtFilter,
  getBrandFilter,
  getTenantFilter,
  getAccountFilter,
  getCloudProviderFilter,
} from '@/utils/common/tableFilter'
import GlobalSearchMixin from '@/mixins/globalSearch'
import SingleActionsMixin from '../mixins/singleActions'
import ColumnsMixin from '../mixins/columns'

export default {
  name: 'DnsZoneList',
  mixins: [WindowsMixin, ListMixin, GlobalSearchMixin, ColumnsMixin, SingleActionsMixin],
  props: {
    id: String,
    getParams: {
      type: [Function, Object],
    },
    cloudEnv: String,
  },
  data () {
    return {
      list: this.$list.createList(this, {
        id: this.id,
        resource: 'dns_zones',
        getParams: this.getParam,
        steadyStatus: {
          status: Object.values(expectStatus.dnszone).flat(),
        },
        filterOptions: {
          id: {
            label: this.$t('table.title.id'),
          },
          name: {
            label: this.$t('network.text_21'),
            filter: true,
            formatter: val => {
              return `name.contains("${val}")`
            },
          },
          description: getDescriptionFilter(),
          status: getStatusFilter('dnszone'),
          brand: getBrandFilter(),
          account: getAccountFilter(),
          manager: getCloudProviderFilter(),
          zone_type: {
            label: this.$t('network.text_717'),
            dropdown: true,
            multiple: true,
            items: [
              { label: 'PublicZone', key: 'PublicZone' },
              { label: 'PrivateZone', key: 'PrivateZone' },
            ],
            filter: true,
            formatter: val => {
              return `zone_type.contains("${val}")`
            },
          },
          project_domains: getDomainFilter(),
          tenant: getTenantFilter(),
          created_at: getCreatedAtFilter(),
        },
        responseData: this.responseData,
        hiddenColumns: ['created_at'],
      }),
      groupActions: [
        {
          label: this.$t('network.text_26'),
          permission: 'dns_zones_create',
          action: () => {
            this.$router.push({
              name: 'DnsZoneCreate',
              params: {
                cloudEnv: this.cloudEnv,
              },
            })
          },
          meta: () => {
            return {
              buttonType: 'primary',
            }
          },
        },
        {
          label: this.$t('compute.text_275'),
          actions: () => {
            return [
              {
                label: this.$t('compute.text_283'),
                permission: 'dns_zones_perform_set_user_metadata',
                action: () => {
                  this.createDialog('SetTagDialog', {
                    data: this.list.selectedItems,
                    columns: this.columns,
                    onManager: this.onManager,
                    params: {
                      resources: 'dns_zones',
                    },
                    mode: 'add',
                  })
                },
              },
              {
                label: this.$t('network.text_131'),
                permission: 'dns_zones_delete',
                action: () => {
                  this.createDialog('DeleteResDialog', {
                    vm: this,
                    title: this.$t('network.text_131'),
                    name: this.$t('dictionary.dns_zone'),
                    data: this.list.selectedItems,
                    columns: this.columns,
                    onManager: this.onManager,
                    alert: this.$t('network.text_762'),
                  })
                },
                meta: () => {
                  return {
                    validate: this.list.allowDelete(),
                  }
                },
              },
            ]
          },
          meta: () => {
            const ret = {
              validate: true,
              tooltip: null,
            }
            ret.validate = this.list.selectedItems.length > 0
            if (!ret.validate) return ret
            return ret
          },
        },
      ],
    }
  },
  computed: {
    exportDataOptions () {
      return {
        downloadType: 'local',
        title: this.$t('dictionary.dns_zone'),
        items: [
          ...this.columns,
          { field: 'manager', title: this.$t('dictionary.cloudprovider') },
        ],
      }
    },
  },
  watch: {
    cloudEnv (val) {
      this.$nextTick(() => {
        this.list.fetchData(0)
      })
    },
  },
  created () {
    this.initSidePageTab('dns-zone-detail')
    this.list.fetchData()
    this.$bus.$on('DnsZoneListSingleRefresh', (...arg) => {
      this.list.refresh(...arg)
    }, false)
  },
  methods: {
    getParam () {
      const ret = {
        ...(R.is(Function, this.getParams) ? this.getParams() : this.getParams),
        detail: true,
      }
      if (this.cloudEnv) ret.cloud_env = this.cloudEnv
      return ret
    },
    handleOpenSidepage (row, tab) {
      this.sidePageTriggerHandle(this, 'DnsZoneSidePage', {
        id: row.id,
        resource: 'dns_zones',
      }, {
        list: this.list,
        tab,
      })
    },
  },
}
</script>
