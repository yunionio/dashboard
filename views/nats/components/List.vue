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
import { getStatusFilter, getBrandFilter, getAccountFilter, getProjectDomainFilter } from '@/utils/common/tableFilter'
import { disableDeleteAction } from '@/utils/common/tableActions'
import WindowsMixin from '@/mixins/windows'
import i18n from '@/locales'
import GlobalSearchMixin from '@/mixins/globalSearch'

const BillingType = {
  postpaid: i18n.t('network.text_533'),
  prepaid: i18n.t('network.text_534'),
}

export default {
  name: 'NatList',
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
        resource: 'natgateways',
        getParams: this.getParam,
        steadyStatus: Object.values(expectStatus.nat).flat(),
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
          status: getStatusFilter('nat'),
          cloudaccount: getAccountFilter(),
          brand: getBrandFilter('network_manage_brands'),
          vpc: {
            label: this.$t('network.text_535'),
          },
          region: {
            label: this.$t('network.text_199'),
          },
          nat_spec: {
            label: this.$t('network.text_536'),
          },
          billing_type: {
            label: this.$t('network.text_537'),
            dropdown: true,
            multiple: true,
            items: Object.keys(BillingType).map((k) => {
              return {
                label: BillingType[k],
                key: k,
              }
            }),
          },
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
          { label: this.$t('network.text_536'), key: 'nat_spec' },
          { label: this.$t('network.text_535'), key: 'vpc' },
          { label: this.$t('network.text_198'), key: 'provider' },
          { label: this.$t('network.text_199'), key: 'region' },
          { label: this.$t('network.text_196'), key: 'manager' },
          { label: this.$t('network.text_537'), key: 'billing_type' },
          { label: this.$t('network.text_313'), key: 'created_at' },
          {
            label: this.$t('network.text_232'),
            key: 'public_scope',
            hidden: () => {
              return !this.$store.getters.l3PermissionEnable && (this.$store.getters.scopeResource && this.$store.getters.scopeResource.domain.includes('natgateways'))
            },
          },
          { label: this.$t('network.text_233', [this.$t('dictionary.domain')]), key: 'project_domain' },
        ],
      },
      groupActions: [
        {
          label: this.$t('network.text_26'),
          permission: 'natgateways_create',
          action: () => {
            this.$router.push({
              name: 'NatCreate',
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
          label: this.$t('network.text_200'),
          actions: (obj) => {
            const selectedLength = this.list.selectedItems.length
            const notSelectedTooltip = selectedLength <= 0 ? this.$t('network.instance.select.at.least.one') : ''
            const isAvailable = this.list.selectedItems.every(item => item.status.toLowerCase() === 'available')
            const notAvailableTip = !isAvailable ? i18n.t('network.not.available.tooltip') : null
            const isPrepaid = this.list.selectedItems.every(item => item.billing_type.toLowerCase() === 'prpaid')
            return [
              {
                label: this.$t('network.text_201'),
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
                label: i18n.t('network.expired_release'),
                permission: 'natgateway_perform_postpaid_expire',
                action: () => {
                  this.createDialog('SetDurationDialog', {
                    data: this.list.selectedItems,
                    columns: this.columns,
                    onManager: this.onManager,
                    name: this.$t('dictionary.nat'),
                    refresh: this.refresh,
                  })
                },
                meta: () => {
                  const ret = {
                    validate: false,
                    tooltip: null,
                  }
                  if (isPrepaid) {
                    ret.tooltip = i18n.t('network.nat.prepaid.unsupported')
                    return ret
                  }
                  if (selectedLength === 0) {
                    ret.tooltip = notSelectedTooltip
                    return ret
                  }
                  ret.validate = true
                  return ret
                },
              },
              {
                label: i18n.t('network.renew'),
                action: () => {
                  this.createDialog('RenewDialog', {
                    name: this.$t('dictionary.nat'),
                    data: this.list.selectedItems,
                    columns: this.columns,
                    onManager: this.onManager,
                    refresh: this.refresh,
                  })
                },
                meta: () => {
                  const ret = {
                    validate: false,
                    tooltip: null,
                  }
                  if (!isAvailable) {
                    ret.tooltip = notAvailableTip
                    return ret
                  }
                  if (!isPrepaid) {
                    ret.tooltip = i18n.t('network.nat.postpaid.unsupported')
                    return ret
                  }
                  if (selectedLength === 0) {
                    ret.tooltip = notSelectedTooltip
                    return ret
                  }
                  return ret
                },
              },
              {
                label: i18n.t('network.auto.renew'),
                action: () => {
                  this.createDialog('AutoRenewDialog', {
                    name: i18n.t('dictionary.nat'),
                    data: this.list.selectedItems,
                    columns: this.columns,
                    onManager: this.onManager,
                    refresh: this.refresh,
                  })
                },
                meta: () => {
                  const ret = {
                    validate: false,
                    tooltip: null,
                  }
                  if (!isAvailable) {
                    ret.tooltip = notAvailableTip
                    return ret
                  }
                  if (!isPrepaid) {
                    ret.tooltip = i18n.t('network.nat.postpaid.unsupported')
                    return ret
                  }
                  if (selectedLength === 0) {
                    ret.tooltip = notSelectedTooltip
                    return ret
                  }
                },
              },
              disableDeleteAction(this, {
                name: this.$t('dictionary.nat'),
              }),
              {
                label: this.$t('network.text_131'),
                permission: 'natgateways_delete',
                action: () => {
                  this.createDialog('DeleteResDialog', {
                    vm: this,
                    data: this.list.selectedItems,
                    columns: this.columns,
                    title: this.$t('network.text_131'),
                    name: this.$t('dictionary.nat'),
                    requestData: { force: true },
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
    this.initSidePageTab('nat-detail')
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
      this.sidePageTriggerHandle(this, 'NatSidePage', {
        id: row.id,
        resource: 'natgateways',
        getParams: this.getParam,
      }, {
        list: this.list,
      })
    },
  },
}
</script>
