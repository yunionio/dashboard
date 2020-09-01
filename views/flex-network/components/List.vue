<template>
  <page-list
    show-tag-columns
    show-tag-filter
    :list="list"
    :columns="columns"
    :export-data-options="exportDataOptions"
    :showSearchbox="showSearchbox"
    :showGroupActions="showGroupActions"
    :group-actions="groupActions"
    :single-actions="singleActions" />
</template>

<script>
import ColumnsMixin from '../mixins/columns'
import SingleActionsMixin from '../mixins/singleActions'
import ListMixin from '@/mixins/list'
import { getNameFilter, getStatusFilter, getBrandFilter, getProjectDomainFilter } from '@/utils/common/tableFilter'
import WindowsMixin from '@/mixins/windows'
import GlobalSearchMixin from '@/mixins/globalSearch'
import expectStatus from '@/constants/expectStatus'
import { getDomainChangeOwnerAction } from '@/utils/common/tableActions'
// import { getDomainChangeOwnerAction, getSetPublicAction } from '@/utils/common/tableActions'

export default {
  name: 'FlexNetworkList',
  mixins: [WindowsMixin, ListMixin, GlobalSearchMixin, ColumnsMixin, SingleActionsMixin],
  props: {
    id: String,
    getParams: {
      type: Object,
    },
  },
  data () {
    return {
      list: this.$list.createList(this, {
        id: this.id,
        resource: 'networkinterfaces',
        getParams: this.getParam,
        steadyStatus: Object.values(expectStatus.network).flat(),
        filterOptions: {
          name: getNameFilter(),
          mac: {
            label: this.$t('network.text_228'),
            filter: true,
            // jointFilter: true,
            formatter: val => {
              return `mac.contains("${val}")`
            },
          },
          status: getStatusFilter('network'),
          brand: getBrandFilter(),
          associate_type: {
            label: this.$t('network.text_229'),
            filter: true,
            formatter: val => {
              return `associate_type.contains("${val}")`
            },
          },
          project_domains: getProjectDomainFilter(),
        },
        responseData: this.responseData,
      }),
      exportDataOptions: {
        items: [
          { label: 'ID', key: 'id' },
          { label: this.$t('network.text_21'), key: 'name' },
          { label: this.$t('network.text_228'), key: 'mac' },
          { label: this.$t('network.text_27'), key: 'status' },
          { label: this.$t('network.text_198'), key: 'brand' },
          { label: this.$t('network.text_230'), key: 'associate_type' },
          { label: this.$t('network.text_231'), key: 'associate_id' },
          { label: this.$t('network.text_196'), key: 'account' },
          { label: this.$t('dictionary.project'), key: 'tenant' },
          { label: this.$t('network.text_199'), key: 'region' },
          { label: this.$t('network.text_24'), key: 'zone' },
          { label: this.$t('network.text_232'), key: 'public_scope' },
          {
            label: this.$t('network.text_232'),
            key: 'public_scope',
            hidden: () => {
              return !this.$store.getters.l3PermissionEnable && (this.$store.getters.scopeResource && this.$store.getters.scopeResource.domain.includes('networkinterfaces'))
            },
          },
          { label: this.$t('network.text_233', [this.$t('dictionary.domain')]), key: 'project_domain' },
        ],
      },
      groupActions: [
        // {
        //   label: '同步状态',
        //   action: () => {
        //     this.onManager('batchPerformAction', {
        //       steadyStatus: ['running', 'ready'],
        //       managerArgs: {
        //         action: 'syncstatus',
        //       },
        //     })
        //   },
        //   meta: () => ({
        //     validate: this.list.selected.length,
        //   }),
        // },
        getDomainChangeOwnerAction(this, {
          name: this.$t('dictionary.networkinterface'),
          resource: 'networkinterfaces',
        }),
        // getSetPublicAction(this, {
        //   name: this.$t('dictionary.networkinterface'),
        //   scope: 'domain',
        //   resource: 'networkinterfaces',
        // }, {
        //   meta: () => {
        //     return {
        //       validate: this.list.selectedItems.length,
        //     }
        //   },
        // }),
      ],
    }
  },
  created () {
    this.initSidePageTab('flex-network-detail')
    this.list.fetchData()
  },
  methods: {
    getParam () {
      const ret = {
        ...this.getParams,
        details: true,
      }
      return ret
    },
    handleOpenSidepage (row) {
      this.sidePageTriggerHandle(this, 'FlexNetworkSidePage', {
        id: row.id,
        resource: 'networkinterfaces',
        getParams: this.getParam,
      }, {
        list: this.list,
      })
    },
  },
}
</script>
