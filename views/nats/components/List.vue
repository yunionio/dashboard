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

const BillingType = {
  'postpaid': '后付费',
  'prepaid': '预付费',
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
            label: '名称',
            filter: true,
            formatter: val => {
              return `name.contains("${val}")`
            },
          },
          status: getStatusFilter('nat'),
          account: getAccountFilter(),
          brand: getBrandFilter('network_manage_brands'),
          vpc: {
            label: '所属VPC',
          },
          region: {
            label: '区域',
          },
          nat_spec: {
            label: '型号',
          },
          billing_type: {
            label: '付费类型',
            dropdown: true,
            multiple: true,
            items: Object.keys(BillingType).map((k) => {
              return {
                label: BillingType[k],
                key: k,
              }
            }),
          },
          project_domain: getProjectDomainFilter(),
        },
      }),
      exportDataOptions: {
        items: [
          { label: 'ID', key: 'id' },
          { label: '名称', key: 'name' },
          { label: '状态', key: 'status' },
          { label: '型号', key: 'nat_spec' },
          { label: '所属VPC', key: 'vpc' },
          { label: '平台', key: 'provider' },
          { label: '区域', key: 'region' },
          { label: '云账号', key: 'manager' },
          { label: '付费类型', key: 'billing_type' },
          { label: '创建时间', key: 'created_at' },
          { label: '共享范围', key: 'public_scope' },
          { label: `所属${this.$t('dictionary.domain')}`, key: 'project_domain' },
        ],
      },
      groupActions: [
        {
          label: '同步状态',
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
