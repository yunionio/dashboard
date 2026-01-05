<template>
  <page-list
    :list="list"
    :columns="templateListColumns || columns"
    :show-tag-columns="true"
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
import ListMixin from '@/mixins/list'
import ResTemplateListMixin from '@/mixins/resTemplateList'
import expectStatus from '@/constants/expectStatus'
import {
  getFilter,
  getStatusFilter,
  getBrandFilter,
  getAccountFilter,
  getTenantFilter,
  getDomainFilter,
  getDescriptionFilter,
  getCreatedAtFilter,
} from '@/utils/common/tableFilter'
import { disableDeleteAction } from '@/utils/common/tableActions'
import WindowsMixin from '@/mixins/windows'
import GlobalSearchMixin from '@/mixins/globalSearch'
import ColumnsMixin from '../mixins/columns'
import SingleActionsMixin from '../mixins/singleActions'

export default {
  name: 'FileSystemList',
  mixins: [WindowsMixin, ListMixin, GlobalSearchMixin, ColumnsMixin, SingleActionsMixin, ResTemplateListMixin],
  props: {
    id: String,
    cloudEnv: String,
    cloudEnvOptions: {
      type: Array,
    },
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
        resource: 'file_systems',
        getParams: this.getParam,
        isTemplate: this.isTemplate,
        templateLimit: this.templateLimit,
        steadyStatus: Object.values(expectStatus.nas).flat(),
        filterOptions: {
          id: {
            label: this.$t('table.title.id'),
          },
          name: {
            label: this.$t('storage.text_40'),
            filter: true,
            formatter: val => {
              return `name.contains("${val}")`
            },
          },
          description: getDescriptionFilter(),
          status: getStatusFilter('nas'),
          cloudaccount: getAccountFilter(),
          brand: getBrandFilter('nas_brands'),
          billing_type: getFilter({
            field: 'billing_type',
            title: this.$t('storage.billing_type'),
            items: [
              { label: this.$t('billingType.postpaid'), key: 'postpaid' },
              { label: this.$t('billingType.prepaid'), key: 'prepaid' },
            ],
          }),
          projects: getTenantFilter(),
          project_domains: getDomainFilter(),
          created_at: getCreatedAtFilter(),
        },
        responseData: this.responseData,
        hiddenColumns: ['created_at'],
      }),
      exportDataOptions: {
        items: [
          { label: 'ID', key: 'id' },
          { label: this.$t('storage.text_40'), key: 'name' },
          { label: this.$t('storage.text_41'), key: 'status' },
          { label: this.$t('storage.capacity'), key: 'capacity' },
          { label: this.$t('storage.text_46'), key: 'provider' },
          { label: this.$t('storage.filesystem.storage.type'), key: 'storage_type' },
          { label: this.$t('storage.filesystem.type'), key: 'file_system_type' },
          { label: this.$t('storage.filesystem.protocol'), key: 'protocol' },
          { label: this.$t('storage.text_47'), key: 'region' },
          { label: this.$t('storage.text_94'), key: 'manager' },
          { label: this.$t('storage.billing_type'), key: 'billing_type' },
          { label: this.$t('storage.created_at'), key: 'created_at' },
          {
            label: this.$t('storage.text_48'),
            key: 'public_scope',
            hidden: () => {
              return !this.$store.getters.l3PermissionEnable && (this.$store.getters.scopeResource && this.$store.getters.scopeResource.domain.includes('file_systems'))
            },
          },
          { label: this.$t('storage.text_49', [this.$t('dictionary.domain')]), key: 'project_domain' },
        ],
      },
      groupActions: [
        {
          label: this.$t('storage.text_31'),
          permission: 'file_systems_create',
          action: () => {
            this.$router.push({
              path: '/nas/create',
              query: {
                type: this.cloudEnv,
              },
            })
          },
          meta: () => {
            return {
              buttonType: 'primary',
              validate: !this.cloudEnvEmpty,
              tooltip: this.cloudEnvEmpty ? this.$t('common.no_platform_available') : '',
            }
          },
          hidden: () => this.hiddenActions.includes('create'),
        },
        {
          label: this.$t('storage.text_33'),
          actions: (obj) => {
            const selectedLength = this.list.selectedItems.length
            const notSelectedTooltip = selectedLength <= 0 ? this.$t('storage.filesystem.select.at.least.one') : ''
            return [
              {
                label: this.$t('compute.text_283'),
                permission: 'file_systems_perform_set_user_metadata',
                action: () => {
                  this.createDialog('SetTagDialog', {
                    data: this.list.selectedItems,
                    columns: this.columns,
                    onManager: this.onManager,
                    params: {
                      resources: 'file_systems',
                    },
                    mode: 'add',
                  })
                },
              },
              {
                label: this.$t('storage.text_100'),
                permission: 'file_systems_perform_syncstatus',
                action: () => {
                  this.onManager('batchPerformAction', {
                    steadyStatus: ['available'],
                    managerArgs: {
                      action: 'syncstatus',
                    },
                  })
                },
                meta: () => ({
                  validate: selectedLength,
                  tooltip: notSelectedTooltip,
                }),
              },
              {
                label: this.$t('common_641', [this.$t('dictionary.project')]),
                action: () => {
                  this.createDialog('ChangeOwenrDialog', {
                    data: this.list.selectedItems,
                    columns: this.columns,
                    name: this.$t('dictionary.filesystem'),
                    onManager: this.onManager,
                    resource: 'file_systems',
                  })
                },
                meta: () => {
                  const ret = {
                    validate: false,
                    tooltip: '',
                  }
                  if (this.isProjectMode) {
                    ret.tooltip = this.$t('storage.check_sys_permission', [this.$t('dictionary.domain')])
                    return ret
                  }
                  return {
                    validate: true,
                  }
                },
              },
              disableDeleteAction(Object.assign(this, {
                permission: 'file_systems_update',
              }), {
                name: this.$t('dictionary.nas'),
              }),
              {
                label: this.$t('storage.text_36'),
                permission: 'file_systems_delete',
                action: () => {
                  this.createDialog('DeleteResDialog', {
                    vm: this,
                    data: this.list.selectedItems,
                    columns: this.columns,
                    title: this.$t('storage.text_36'),
                    name: this.$t('dictionary.nas'),
                    onManager: this.onManager,
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
  watch: {
    cloudEnv (val) {
      this.$nextTick(() => {
        this.list.fetchData(0)
      })
    },
  },
  created () {
    this.initSidePageTab('file-system-detail')
    this.list.fetchData()
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
      this.sidePageTriggerHandle(this, 'FileSystemSidePage', {
        id: row.id,
        resource: 'file_systems',
        getParams: this.getParam,
      }, {
        list: this.list,
        tab,
      })
    },
  },
}
</script>
