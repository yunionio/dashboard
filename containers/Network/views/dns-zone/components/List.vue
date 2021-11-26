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
import ColumnsMixin from '../mixins/columns'
import SingleActionsMixin from '../mixins/singleActions'
import ListMixin from '@/mixins/list'
import WindowsMixin from '@/mixins/windows'
import expectStatus from '@/constants/expectStatus'
import {
  getDomainFilter,
  getStatusFilter,
  getDescriptionFilter,
} from '@/utils/common/tableFilter'
import GlobalSearchMixin from '@/mixins/globalSearch'

export default {
  name: 'DnsZoneList',
  mixins: [WindowsMixin, ListMixin, GlobalSearchMixin, ColumnsMixin, SingleActionsMixin],
  props: {
    id: String,
  },
  data () {
    return {
      list: this.$list.createList(this, {
        id: this.id,
        resource: 'dns_zones',
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
        },
        responseData: this.responseData,
      }),
      exportDataOptions: {
        items: [
          { label: 'ID', key: 'id' },
          { label: this.$t('network.text_21'), key: 'name' },
          { label: this.$t('network.text_717'), key: 'zone_type' },
          { label: this.$t('network.text_718'), key: 'dns_recordset_count' },
          { label: this.$t('network.text_719'), key: 'vpc_count' },
          { label: this.$t('network.text_27'), key: 'status' },
          {
            label: this.$t('common_101'),
            key: 'public_scope',
            hidden: () => {
              return !this.$store.getters.l3PermissionEnable && (this.$store.getters.scopeResource && this.$store.getters.scopeResource.domain.includes('vpcs'))
            },
          },
          { label: this.$t('network.text_233', [this.$t('dictionary.domain')]), key: 'project_domain' },
        ],
      },
      groupActions: [
        {
          label: this.$t('network.text_26'),
          permission: 'dns_zones_create',
          action: () => {
            // this.createDialog('DnsZoneCreateDialog', {
            //   title: this.$t('common_661'),
            //   onManager: this.onManager,
            //   refresh: this.refresh,
            // })
            this.$router.push({
              path: `${this.$route.path}/create`,
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
  created () {
    this.initSidePageTab('dns-zone-detail')
    this.list.fetchData()
    this.$bus.$on('DnsZoneListSingleRefresh', (...arg) => {
      this.list.refresh(...arg)
    }, false)
  },
  methods: {
    handleOpenSidepage (row) {
      this.sidePageTriggerHandle(this, 'DnsZoneSidePage', {
        id: row.id,
        resource: 'dns_zones',
      }, {
        list: this.list,
      })
    },
  },
}
</script>
