<template>
  <page-list
    :list="list"
    :columns="columns" />
</template>

<script>
import * as R from 'ramda'
import {
  getNameDescriptionTableColumn,
  getStatusTableColumn,
  getCopyWithContentTableColumn,
  getBrandTableColumn,
  getAccountTableColumn,
  getTimeTableColumn,
} from '@/utils/common/tableColumn'
import { getBrandFilter } from '@/utils/common/tableFilter'
import WindowsMixin from '@/mixins/windows'

const NatSpec = {
  'small': '小型',
  'medium': '中型',
  'large': '大型',
  'x-large': '超大型',
}

const BillingType = {
  'postpaid': '后付费',
  'prepaid': '预付费',
}

export default {
  name: '',
  mixins: [WindowsMixin],
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
              return `name.contains(val)`
            },
          },
          brand: getBrandFilter('object_storage_brands'),
        },
      }),
      columns: [
        getNameDescriptionTableColumn({
          vm: this,
          hideField: true,
          addLock: true,
          slotCallback: row => {
            return (
              <side-page-trigger onTrigger={ () => this.sidePageTriggerHandle(row.id, 'NatSidePage') }>{ row.name }</side-page-trigger>
            )
          },
        }),
        {
          field: 'nat_spec',
          title: '型号',
          formatter: ({ cellValue }) => {
            const spec = cellValue && cellValue.toLowerCase()
            return NatSpec[spec] || spec
          },
        },
        getCopyWithContentTableColumn({ field: 'vpc', title: '所属专有网络' }),
        getBrandTableColumn(),
        {
          field: 'region',
          title: '区域',
          width: 150,
        },
        getStatusTableColumn({ statusModule: 'nat' }),
        getAccountTableColumn(),
        {
          field: 'billing_type',
          title: '付费类型',
          formatter: ({ cellValue }) => {
            return BillingType[cellValue]
          },
        },
        getTimeTableColumn(),
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
  },
}
</script>
