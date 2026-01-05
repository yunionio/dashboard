<template>
  <page-list
    show-tag-columns
    show-tag-filter
    :list="list"
    :columns="templateListColumns || columns"
    :single-actions="singleActions"
    :group-actions="groupActions"
    :export-data-options="exportDataOptions"
    :showSearchbox="showSearchbox"
    :defaultSearchKey="defaultSearchKey"
    :showSingleActions="isTemplate ? false : showActions"
    :showGroupActions="showActions && showGroupActions"
    :show-page="!isTemplate" />
</template>

<script>
import * as R from 'ramda'
import ListMixin from '@/mixins/list'
import ResTemplateListMixin from '@/mixins/resTemplateList'
import expectStatus from '@/constants/expectStatus'
import { getDisabledProvidersActionMeta } from '@/utils/common/hypervisor'
import {
  getStatusFilter,
  getBrandFilter,
  getAccountFilter,
  getProjectDomainFilter,
  getRegionFilter,
  getDescriptionFilter,
  getCreatedAtFilter,
} from '@/utils/common/tableFilter'
import WindowsMixin from '@/mixins/windows'
import { getDomainChangeOwnerAction, getSetPublicAction } from '@/utils/common/tableActions'
import regexp from '@/utils/regexp'
import GlobalSearchMixin from '@/mixins/globalSearch'
import SingleActionsMixin from '../mixins/singleActions'
import ColumnsMixin from '../mixins/columns'

export default {
  name: 'VPCList',
  mixins: [WindowsMixin, ListMixin, GlobalSearchMixin, ColumnsMixin, SingleActionsMixin, ResTemplateListMixin],
  props: {
    id: String,
    getParams: {
      type: [Function, Object],
    },
    cloudEnv: String,
    showGroupActions: {
      type: Boolean,
      default: true,
    },
    hiddenActions: {
      type: Array,
      default: () => ([]),
    },
    hiddenColumns: {
      type: Array,
      default: () => ([]),
    },
    hiddenFilterOptions: {
      type: Array,
      default: () => ([]),
    },
    cloudEnvOptions: {
      type: Array,
    },
  },
  data () {
    const filterOptions = {
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
      status: getStatusFilter('vpc'),
      cloudaccount: getAccountFilter(),
      brand: getBrandFilter('brands', ['VMware']),
      cidr_block: {
        label: this.$t('network.vpc.cidr_block.ipv4.label'),
      },
      project_domains: getProjectDomainFilter(),
      region: getRegionFilter(),
      created_at: getCreatedAtFilter(),
    }
    this.hiddenFilterOptions.forEach(key => {
      delete filterOptions[key]
    })
    return {
      list: this.$list.createList(this, {
        ctx: this,
        id: this.id,
        resource: 'vpcs',
        getParams: this.getParam,
        isTemplate: this.isTemplate,
        templateLimit: this.templateLimit,
        steadyStatus: Object.values(expectStatus.vpc).flat(),
        filterOptions,
        responseData: this.responseData,
        hiddenColumns: ['metadata', 'wire_count', 'created_at'],
        autoHiddenFilterKey: 'vpc_hidden_columns',
      }),
      exportDataOptions: {
        items: [
          { label: 'ID', key: 'id' },
          { label: this.$t('network.text_21'), key: 'name' },
          { label: this.$t('network.text_27'), key: 'status' },
          { label: this.$t('network.vpc.cidr_block.ipv4.label'), key: 'cidr_block' },
          { label: this.$t('network.text_199'), key: 'region' },
          { label: this.$t('network.text_198'), key: 'provider' },
          { label: this.$t('network.text_196'), key: 'manager' },
          { label: this.$t('network.text_571'), key: 'wire_count' },
          { label: this.$t('network.text_682'), key: 'network_count' },
          {
            label: this.$t('common_101'),
            key: 'public_scope',
            hidden: () => {
              return !this.$store.getters.l3PermissionEnable && (this.$store.getters.scopeResource && this.$store.getters.scopeResource.domain.includes('vpcs'))
            },
          },
          { label: this.$t('network.text_233', [this.$t('dictionary.domain')]), key: 'project_domain' },
          { label: this.$t('common_715'), key: 'user_tags' },
          { label: this.$t('common.createdAt'), key: 'created_at' },
        ],
      },
      groupActions: [
        {
          label: this.$t('network.text_26'),
          permission: 'vpcs_create',
          action: () => {
            this.$router.push({
              path: '/vpc/create',
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
          actions: () => {
            return [
              {
                label: this.$t('network.text_201'),
                permission: 'vpcs_perform_syncstatus',
                action: () => {
                  this.onManager('batchPerformAction', {
                    steadyStatus: ['running', 'ready'],
                    managerArgs: {
                      action: 'syncstatus',
                    },
                  })
                },
                meta: () => {
                  if (this.list.selectedItems.some(item => !this.isPower(item))) {
                    return {
                      validate: false,
                      tooltip: this.$t('network.text_627'),
                    }
                  }
                  if (this.list.selectedItems.some(v => v.brand.toLowerCase() === 'onecloud')) {
                    return {
                      validate: false,
                      tooltip: this.$t('network.text_628'),
                    }
                  }
                  return {
                    validate: true,
                  }
                },
              },
              getDomainChangeOwnerAction(this, {
                name: this.$t('dictionary.vpc'),
                resource: 'vpcs',
              }, {
                permission: 'vpcs_perform_change_owner',
                extraMeta: obj => {
                  return getDisabledProvidersActionMeta({
                    rows: this.list.selectedItems,
                    disabledProviders: ['BingoCloud'],
                  })
                },
              }),
              getSetPublicAction(this, {
                name: this.$t('dictionary.vpc'),
                scope: 'domain',
                resource: 'vpcs',
              }, {
                permission: 'vpcs_perform_public',
                extraMeta: obj => {
                  return getDisabledProvidersActionMeta({
                    rows: this.list.selectedItems,
                    disabledProviders: ['BingoCloud'],
                  })
                },
              }),
              {
                label: this.$t('table.action.set_tag'),
                permission: 'vpcs_perform_set_user_metadata',
                action: () => {
                  this.createDialog('SetTagDialog', {
                    data: this.list.selectedItems,
                    columns: this.columns,
                    onManager: this.onManager,
                    mode: 'add',
                    params: {
                      resources: 'vpc',
                    },
                    tipName: this.$t('dictionary.vpc'),
                  })
                },
                meta: () => {
                  if (this.list.selectedItems.some(item => !this.isPower(item))) {
                    return {
                      validate: false,
                      tooltip: this.$t('network.text_627'),
                    }
                  }
                  return {
                    validate: true,
                  }
                },
                extraMeta: obj => {
                  return getDisabledProvidersActionMeta({
                    rows: this.list.selectedItems,
                    disabledProviders: ['BingoCloud'],
                  })
                },
              },
              {
                label: this.$t('network.text_131'),
                permission: 'vpcs_delete',
                action: () => {
                  let alert = null
                  if (this.list.selectedItems.some(item => item.provider === 'Aws')) {
                    alert = this.$t('network.vpc_aws_delete_alert')
                  }
                  this.createDialog('DeleteResDialog', {
                    vm: this,
                    title: this.$t('network.text_131'),
                    name: this.$t('dictionary.vpc'),
                    data: this.list.selectedItems,
                    columns: this.columns,
                    onManager: this.onManager,
                    alert,
                  })
                },
                meta: () => {
                  return {
                    validate: this.list.allowDelete(),
                  }
                },
                extraMeta: obj => {
                  return getDisabledProvidersActionMeta({
                    rows: this.list.selectedItems,
                    disabledProviders: ['BingoCloud', 'SangFor'],
                  })
                },
              },
            ]
          },
          meta: () => {
            return {
              validate: this.list.selected.length,
            }
          },
        },
      ],
    }
  },
  computed: {
    showActions () {
      return !this.$isScopedPolicyMenuHidden('vpc_hidden_columns.perform_action')
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
    this.initSidePageTab('vpc-detail')
    this.list.fetchData()
  },
  methods: {
    isPower (obj) {
      if (this.isAdminMode) return true
      if (this.isDomainMode) return obj.domain_id === this.userInfo.projectDomainId
      return obj.tenant_id === this.userInfo.projectId
    },
    getParam () {
      const ret = {
        ...(R.is(Function, this.getParams) ? this.getParams() : this.getParams),
      }
      if (this.cloudEnv) ret.cloud_env = this.cloudEnv
      return ret
    },
    handleOpenSidepage (row, tab) {
      this.sidePageTriggerHandle(this, 'VpcSidePage', {
        id: row.id,
        resource: 'vpcs',
        getParams: this.getParam,
      }, {
        list: this.list,
        hiddenActions: this.hiddenActions,
        hiddenColumns: this.hiddenColumns,
        tab,
      })
    },
    defaultSearchKey (search) {
      if (regexp.isPrefixStr(search)) {
        return 'cidr_block'
      }
    },
  },
}
</script>
