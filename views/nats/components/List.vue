<template>
  <page-list
    :list="list"
    :columns="columns" />
</template>

<script>
import * as R from 'ramda'
import ColumnsMixin from '../mixins/columns'
import ListMixin from '@/mixins/list'
import { getStatusFilter, getBrandFilter, getAccountFilter } from '@/utils/common/tableFilter'
import WindowsMixin from '@/mixins/windows'

const BillingType = {
  'postpaid': '后付费',
  'prepaid': '预付费',
}

export default {
  name: 'NatList',
  mixins: [WindowsMixin, ListMixin, ColumnsMixin],
  props: {
    id: String,
    getParams: {
      type: [Function, Object],
    },
    cloudEnv: String,
  },
  data () {
    return {
      list: this.$list.createList(this, {
        id: this.id,
        resource: 'natgateways',
        getParams: this.getParam,
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
            label: '所属专有网络',
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
        },
      }),
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
    this.initSidePageTab('nat-detail')
    this.list.fetchData()
  },
  methods: {
    getParam () {
      const ret = {
        ...(R.is(Function, this.getParams) ? this.getParams() : this.getParams),
        detail: true,
      }
      if (this.cloudEnv) ret[this.cloudEnv] = true
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
