<template>
  <page-list
    :list="list"
    :columns="columns"
    :show-tag-columns="true"
    :show-tag-filter="true"
    :export-data-options="exportDataOptions"
    :group-actions="groupActions"
    :showSearchbox="showSearchbox"
    :showGroupActions="showGroupActions"
    :single-actions="singleActions" />
</template>

<script>
import * as R from 'ramda'
import { mapGetters } from 'vuex'
import ColumnsMixin from '../mixins/columns'
import SingleActionsMixin from '../mixins/singleActions'
import ListMixin from '@/mixins/list'
import expectStatus from '@/constants/expectStatus'
import { getStatusFilter, getBrandFilter, getAccountFilter, getProjectDomainFilter, getCloudProviderFilter, getDescriptionFilter } from '@/utils/common/tableFilter'
import { disableDeleteAction } from '@/utils/common/tableActions'
import WindowsMixin from '@/mixins/windows'
import i18n from '@/locales'
import GlobalSearchMixin from '@/mixins/globalSearch'

export default {
  name: 'DomainList',
  mixins: [WindowsMixin, ListMixin, GlobalSearchMixin, ColumnsMixin, SingleActionsMixin],
  props: {
    id: String,
    getParams: {
      type: [Function, Object],
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
        resource: 'cdn_domains',
        getParams: this.getParam,
        steadyStatus: Object.values(expectStatus.cdnDomain).flat(),
        filterOptions: {
          external_id: {
            label: this.$t('table.title.external_id'),
          },
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
          status: getStatusFilter('cdnDomain'),
          cloudaccount: getAccountFilter(),
          manager: getCloudProviderFilter(),
          brand: getBrandFilter('cdn_brands'),
          project_domains: getProjectDomainFilter(),
        },
        responseData: this.responseData,
        hiddenColumns: ['created_at'],
      }),
      exportDataOptions: {
        items: [
          { label: 'ID', key: 'id' },
          { label: this.$t('network.text_21'), key: 'name' },
          { label: this.$t('network.text_27'), key: 'status' },
          { label: this.$t('network.text_198'), key: 'provider' },
          { label: this.$t('network.text_196'), key: 'manager' },
          { label: this.$t('network.text_313'), key: 'created_at' },
          { label: this.$t('network.cdn.service_type'), key: 'service_type' },
          { label: this.$t('network.cdn.area'), key: 'area' },
          {
            label: this.$t('network.text_232'),
            key: 'public_scope',
            hidden: () => {
              return !this.$store.getters.l3PermissionEnable && (this.$store.getters.scopeResource && this.$store.getters.scopeResource.domain.includes('cdn_domains'))
            },
          },
          { label: this.$t('network.text_233', [this.$t('dictionary.domain')]), key: 'project_domain' },
        ],
      },
      groupActions: [
        {
          label: this.$t('network.text_201'),
          permission: 'cdn_domains_perform_syncstatus',
          action: () => {
            this.onManager('batchPerformAction', {
              steadyStatus: ['online', 'offline'],
              managerArgs: {
                action: 'syncstatus',
              },
            })
          },
          meta: () => {
            if (this.list.selectedItems.some(item => !this.isOwner(item))) {
              return {
                validate: false,
                tooltip: this.$t('network.text_627'),
              }
            }
            return {
              validate: this.list.selectedItems.length,
            }
          },
        },
        {
          label: this.$t('network.text_200'),
          actions: (obj) => {
            const isOwner = this.list.selectedItems.every(item => this.isOwner(item))
            return [
              {
                label: this.$t('compute.text_283'),
                permission: 'cdn_domains_set_user_metadata',
                action: () => {
                  this.createDialog('SetTagDialog', {
                    data: this.list.selectedItems,
                    columns: this.columns,
                    onManager: this.onManager,
                    params: {
                      resources: 'cdn_domains',
                    },
                    mode: 'add',
                  })
                },
              },
              disableDeleteAction(this, {
                name: this.$t('dictionary.cdn_domain'),
                meta: () => {
                  if (!isOwner) {
                    return {
                      validate: false,
                      tooltip: i18n.t('network.text_627'),
                    }
                  }
                },
              }),
              {
                label: this.$t('network.text_131'),
                permission: 'cdn_domains_delete',
                action: () => {
                  this.createDialog('DeleteResDialog', {
                    vm: this,
                    data: this.list.selectedItems,
                    columns: this.columns,
                    title: this.$t('network.text_131'),
                    name: this.$t('dictionary.cdn_domain'),
                    requestData: { force: true },
                    onManager: this.onManager,
                  })
                },
                meta: () => {
                  if (!isOwner) {
                    return {
                      validate: false,
                      tooltip: i18n.t('network.text_627'),
                    }
                  }
                  return {
                    validate: this.list.allowDelete(),
                  }
                },
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
    ...mapGetters(['isAdminMode', 'isDomainMode', 'userInfo']),
  },
  created () {
    this.initSidePageTab('cdn-detail')
    this.list.fetchData()
  },
  methods: {
    isOwner (obj) {
      if (this.isAdminMode) return true
      if (this.isDomainMode) return obj.domain_id === this.userInfo.projectDomainId
      return false
    },
    getParam () {
      const ret = {
        ...(R.is(Function, this.getParams) ? this.getParams() : this.getParams),
        detail: true,
      }
      return ret
    },
    handleOpenSidepage (row) {
      this.sidePageTriggerHandle(this, 'CDNSidePage', {
        id: row.id,
        resource: 'cdn_domains',
        getParams: this.getParam,
      }, {
        list: this.list,
      })
    },
  },
}
</script>
