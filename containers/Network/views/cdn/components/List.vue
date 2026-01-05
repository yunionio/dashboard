<template>
  <page-list
    :list="list"
    :columns="templateListColumns || columns"
    :show-tag-columns="true"
    :show-tag-columns2="true"
    :show-tag-filter="true"
    :export-data-options="exportDataOptions"
    :group-actions="groupActions"
    :showSearchbox="showSearchbox"
    :showGroupActions="showGroupActions"
    :single-actions="singleActions"
    :show-single-actions="!isTemplate"
    :show-page="!isTemplate" />
</template>

<script>
import * as R from 'ramda'
import { mapGetters } from 'vuex'
import ListMixin from '@/mixins/list'
import ResTemplateListMixin from '@/mixins/resTemplateList'
import expectStatus from '@/constants/expectStatus'
import {
  getStatusFilter,
  getBrandFilter,
  getAccountFilter,
  getDomainFilter,
  getCloudProviderFilter,
  getDescriptionFilter,
  getCreatedAtFilter,
  getTenantFilter,
} from '@/utils/common/tableFilter'
import { disableDeleteAction } from '@/utils/common/tableActions'
import WindowsMixin from '@/mixins/windows'
import i18n from '@/locales'
import GlobalSearchMixin from '@/mixins/globalSearch'
import SingleActionsMixin from '../mixins/singleActions'
import ColumnsMixin from '../mixins/columns'

export default {
  name: 'DomainList',
  mixins: [WindowsMixin, ListMixin, GlobalSearchMixin, ColumnsMixin, SingleActionsMixin, ResTemplateListMixin],
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
        isTemplate: this.isTemplate,
        templateLimit: this.templateLimit,
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
          projects: getTenantFilter(),
          project_domains: getDomainFilter(),
          created_at: getCreatedAtFilter(),
        },
        responseData: this.responseData,
        hiddenColumns: ['created_at'],
      }),
      groupActions: [
        {
          label: this.$t('common.create'),
          action: () => {
            this.$router.push({
              path: '/cdn/create',
            })
          },
          meta: () => {
            return {
              buttonType: 'primary',
              validate: true,
            }
          },
        },
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
                label: this.$t('network.text_225', [this.$t('dictionary.project')]),
                action: () => {
                  this.createDialog('ChangeOwenrDialog', {
                    data: this.list.selectedItems,
                    columns: this.columns,
                    onManager: this.onManager,
                    name: this.$t('dictionary.cdn_domain'),
                    resource: 'cdn_domains',
                  })
                },
                meta: () => {
                  return {
                    validate: this.list.selectedItems.length,
                  }
                },
              },
              {
                label: this.$t('compute.text_283'),
                permission: 'cdn_domains_perform_set_user_metadata',
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
              disableDeleteAction(Object.assign(this, {
                permission: 'cdn_domains_update',
              }), {
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
    exportDataOptions () {
      return {
        items: [
          { label: 'ID', key: 'id' },
          ...this.columns,
        ],
        downloadType: 'local',
        title: this.$t('dictionary.cdn_domain'),
      }
    },
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
    handleOpenSidepage (row, tab) {
      this.sidePageTriggerHandle(this, 'CDNSidePage', {
        id: row.id,
        resource: 'cdn_domains',
        getParams: this.getParam,
      }, {
        list: this.list,
        tab,
      })
    },
  },
}
</script>
