<template>
  <page-list
    :list="list"
    :columns="columns"
    :export-data-options="exportDataOptions"
    :group-actions="groupActions"
    :showSearchbox="showSearchbox"
    :showGroupActions="showGroupActions"
    :single-actions="singleActions" />
</template>

<script>
import * as R from 'ramda'
import ColumnsMixin from '../mixins/columns'
import SingleActionsMixin from '../mixins/singleActions'
import ListMixin from '@/mixins/list'
import expectStatus from '@/constants/expectStatus'
import { getFilter, getStatusFilter, getBrandFilter, getAccountFilter, getProjectDomainFilter } from '@/utils/common/tableFilter'
import { disableDeleteAction } from '@/utils/common/tableActions'
import WindowsMixin from '@/mixins/windows'
import GlobalSearchMixin from '@/mixins/globalSearch'

export default {
  name: 'FileSystemList',
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
        resource: 'file_systems',
        getParams: this.getParam,
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
          project_domains: getProjectDomainFilter(),
        },
        responseData: this.responseData,
        hiddenColumns: ['created_at'],
      }),
      exportDataOptions: {
        items: [
          { label: 'ID', key: 'id' },
          { label: this.$t('storage.text_40'), key: 'name' },
          { label: this.$t('storage.text_41'), key: 'status' },
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
            })
          },
          meta: () => {
            return {
              buttonType: 'primary',
              validate: true,
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
                label: this.$t('storage.text_100'),
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
              disableDeleteAction(this, {
                name: this.$t('dictionary.nas'),
              }),
              {
                label: this.$t('storage.text_36'),
                permission: 'file_system_delete',
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
        },
      ],
    }
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
      return ret
    },
    handleOpenSidepage (row) {
      this.sidePageTriggerHandle(this, 'FileSystemSidePage', {
        id: row.id,
        resource: 'file_systems',
        getParams: this.getParam,
      }, {
        list: this.list,
      })
    },
  },
}
</script>
