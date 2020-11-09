<template>
  <page-list
    :list="list"
    :columns="columns"
    :export-data-options="exportDataOptions"
    :group-actions="groupActions"
    :single-actions="singleActions" />
</template>

<script>
import * as R from 'ramda'
import ColumnsMixin from '../mixins/columns'
import SingleActionsMixin from '../mixins/singleActions'
import ListMixin from '@/mixins/list'
import expectStatus from '@/constants/expectStatus'
import { getStatusFilter, getBrandFilter, getAccountFilter, getProjectDomainFilter } from '@/utils/common/tableFilter'
import WindowsMixin from '@/mixins/windows'
import { getDomainChangeOwnerAction, getSetPublicAction } from '@/utils/common/tableActions'
import i18n from '@/locales'

const BillingType = {
  postpaid: i18n.t('network.text_533'),
  prepaid: i18n.t('network.text_534'),
}

export default {
  name: 'NatList',
  mixins: [WindowsMixin, ListMixin, ColumnsMixin, SingleActionsMixin],
  props: {
    id: String,
    getParams: {
      type: [Function, Object],
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
          { label: this.$t('network.text_232'), key: 'public_scope' },
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
          label: this.$t('network.text_201'),
          action: () => {
            this.onManager('batchPerformAction', {
              steadyStatus: ['running', 'ready'],
              managerArgs: {
                action: 'syncstatus',
              },
            })
          },
          meta: () => ({
            validate: this.list.selected.length,
          }),
        },
        getDomainChangeOwnerAction(this, {
          name: this.$t('dictionary.nat'),
          resource: 'natgateways',
        }),
        getSetPublicAction(this, {
          name: this.$t('dictionary.nat'),
          scope: 'domain',
          resource: 'natgateways',
        }),
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
