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
import { mapGetters } from 'vuex'
import ListMixin from '@/mixins/list'
import ResTemplateListMixin from '@/mixins/resTemplateList'
import expectStatus from '@/constants/expectStatus'
import { getFilter, getStatusFilter, getBrandFilter, getAccountFilter, getProjectDomainFilter, getDescriptionFilter, getCreatedAtFilter } from '@/utils/common/tableFilter'
import { disableDeleteAction } from '@/utils/common/tableActions'
import WindowsMixin from '@/mixins/windows'
import i18n from '@/locales'
import GlobalSearchMixin from '@/mixins/globalSearch'
import SingleActionsMixin from '../mixins/singleActions'
import ColumnsMixin from '../mixins/columns'
import { checkReadOnly } from '../utils'

export default {
  name: 'NatList',
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
        ctx: this,
        id: this.id,
        resource: 'natgateways',
        getParams: this.getParam,
        isTemplate: this.isTemplate,
        templateLimit: this.templateLimit,
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
          description: getDescriptionFilter(),
          status: getStatusFilter('nat'),
          network_type: {
            label: this.$t('network.text_249'),
            dropdown: true,
            filter: true,
            items: [
              { key: 'internet', label: this.$t('network.text_270') },
              { key: 'intranet', label: this.$t('network.text_271') },
            ],
            formatter: (val) => {
              return `network_type.equals(${val})`
            },
          },
          cloudaccount: getAccountFilter(),
          brand: getBrandFilter('nat_brands'),
          vpc: {
            label: this.$t('network.text_535'),
          },
          region: {
            label: this.$t('network.text_199'),
          },
          nat_spec: {
            label: this.$t('network.text_536'),
          },
          billing_type: getFilter({
            field: 'billing_type',
            title: this.$t('network.text_192'),
            items: [
              { label: this.$t('network.text_256'), key: 'postpaid' },
              { label: this.$t('network.text_257'), key: 'prepaid' },
            ],
          }),
          project_domains: getProjectDomainFilter(),
          created_at: getCreatedAtFilter(),
        },
        responseData: this.responseData,
        hiddenColumns: ['created_at'],
      }),
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
            const isOwner = this.list.selectedItems.every(item => this.isOwner(item))
            return [
              {
                label: this.$t('compute.text_283'),
                permission: 'natgateways_set_user_metadata',
                action: () => {
                  this.createDialog('SetTagDialog', {
                    data: this.list.selectedItems,
                    columns: this.columns,
                    onManager: this.onManager,
                    params: {
                      resources: 'natgateways',
                    },
                    mode: 'add',
                  })
                },
                meta: () => {
                  return checkReadOnly(this.list.selectedItems, this.$t('compute.text_283'))
                },
              },
              {
                label: this.$t('network.text_201'),
                permission: 'natgateways_perform_syncstatus',
                action: () => {
                  this.onManager('batchPerformAction', {
                    steadyStatus: ['available'],
                    managerArgs: {
                      action: 'syncstatus',
                    },
                  })
                },
                meta: () => {
                  // const ret = checkReadOnly(this.list.selectedItems, this.$t('network.text_201'))
                  // if (!ret.validate) return ret
                  if (!isOwner) {
                    return {
                      validate: false,
                      tooltip: i18n.t('network.text_627'),
                    }
                  }
                  return {
                    validate: selectedLength,
                    tooltip: notSelectedTooltip,
                  }
                },
              },
              {
                label: i18n.t('network.expired_release'),
                permission: 'natgateways_perform_postpaid_expire',
                action: () => {
                  this.createDialog('SetDurationDialog', {
                    data: this.list.selectedItems,
                    alert: this.$t('network.text_764'),
                    columns: this.columns,
                    onManager: this.onManager,
                    name: this.$t('dictionary.nat'),
                    refresh: this.refresh,
                  })
                },
                meta: () => {
                  const ret = checkReadOnly(this.list.selectedItems, this.$t('network.expired_release'))
                  if (!ret.validate) return ret
                  if (!isOwner) {
                    return {
                      validate: false,
                      tooltip: i18n.t('network.text_627'),
                    }
                  }
                  if (isPrepaid) {
                    ret.validate = false
                    ret.tooltip = i18n.t('network.nat.prepaid.unsupported')
                    return ret
                  }
                  if (selectedLength === 0) {
                    ret.validate = false
                    ret.tooltip = notSelectedTooltip
                    return ret
                  }
                  return ret
                },
              },
              {
                label: i18n.t('network.renew'),
                permission: 'natgateways_perform_renew',
                action: () => {
                  this.createDialog('RenewDialog', {
                    name: this.$t('dictionary.nat'),
                    data: this.list.selectedItems,
                    alert: this.$t('network.text_765'),
                    columns: this.columns,
                    onManager: this.onManager,
                    refresh: this.refresh,
                  })
                },
                meta: () => {
                  const ret = checkReadOnly(this.list.selectedItems, this.$t('network.renew'))
                  if (!ret.validate) return ret
                  if (!isOwner) {
                    return {
                      validate: false,
                      tooltip: i18n.t('network.text_627'),
                    }
                  }
                  if (!isAvailable) {
                    ret.validate = false
                    ret.tooltip = notAvailableTip
                    return ret
                  }
                  if (!isPrepaid) {
                    ret.validate = false
                    ret.tooltip = i18n.t('network.nat.postpaid.unsupported')
                    return ret
                  }
                  if (selectedLength === 0) {
                    ret.validate = false
                    ret.tooltip = notSelectedTooltip
                    return ret
                  }
                  return ret
                },
              },
              {
                label: i18n.t('network.auto.renew'),
                permission: 'natgateways_perform_set_auto_renew',
                action: () => {
                  this.createDialog('AutoRenewDialog', {
                    name: i18n.t('dictionary.nat'),
                    data: this.list.selectedItems,
                    alert: this.$t('network.text_766'),
                    columns: this.columns,
                    onManager: this.onManager,
                    refresh: this.refresh,
                  })
                },
                meta: () => {
                  const ret = checkReadOnly(this.list.selectedItems, this.$t('network.auto.renew'))
                  if (!ret.validate) return ret
                  if (!isOwner) {
                    return {
                      validate: false,
                      tooltip: i18n.t('network.text_627'),
                    }
                  }
                  if (!isAvailable) {
                    ret.validate = false
                    ret.tooltip = notAvailableTip
                    return ret
                  }
                  if (!isPrepaid) {
                    ret.validate = false
                    ret.tooltip = i18n.t('network.nat.postpaid.unsupported')
                    return ret
                  }
                  if (selectedLength === 0) {
                    ret.validate = false
                    ret.tooltip = notSelectedTooltip
                    return ret
                  }
                },
              },
              disableDeleteAction(this, {
                name: this.$t('dictionary.nat'),
                permission: 'natgateways_update',
                hidden: () => {
                  if (!isOwner) {
                    return {
                      validate: false,
                      tooltip: i18n.t('network.text_627'),
                    }
                  }
                },
                meta: () => {
                  const ret = checkReadOnly(this.list.selectedItems, this.$t('common_277'))
                  if (!ret.validate) return ret
                },
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
                  const ret = checkReadOnly(this.list.selectedItems, this.$t('network.text_131'))
                  if (!ret.validate) return ret
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
        title: this.$t('dictionary.nat'),
        downloadType: 'local',
        items: [
          { field: 'id', title: 'ID' },
          ...this.columns,
        ],
      }
    },
  },
  created () {
    this.initSidePageTab('nat-detail')
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
      this.sidePageTriggerHandle(this, 'NatSidePage', {
        id: row.id,
        resource: 'natgateways',
        getParams: this.getParam,
      }, {
        list: this.list,
        tab,
      })
    },
  },
}
</script>
