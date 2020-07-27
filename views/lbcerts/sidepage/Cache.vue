<template>
  <page-list
    :list="list"
    :columns="columns" />
</template>

<script>
import * as R from 'ramda'
import {
  getCopyWithContentTableColumn,
  getBrandTableColumn,
  getRegionTableColumn,
  getAccountTableColumn,
} from '@/utils/common/tableColumn'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'LbcertCacheList',
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
        resource: 'cachedloadbalancercertificates',
        getParams: this.getParam,
        filterOptions: {
          name: {
            label: this.$t('network.text_317'),
            filter: true,
            formatter: val => {
              return `name.contains(${val})`
            },
          },
        },
      }),
      columns: [
        getCopyWithContentTableColumn({ title: this.$t('network.text_317') }),
        {
          field: 'common_name',
          title: this.$t('network.text_318'),
          width: 70,
        },
        {
          field: 'not_after',
          title: this.$t('network.text_319'),
          width: 150,
          formatter: ({ cellValue }) => {
            return this.$moment(cellValue).format()
          },
        },
        {
          field: 'subject_alternative_names',
          title: this.$t('network.text_320'),
          width: 100,
        },
        getBrandTableColumn(),
        getRegionTableColumn(),
        getAccountTableColumn(),
      ],
    }
  },
  created () {
    this.list.fetchData()
  },
  methods: {
    getParam () {
      const ret = {
        ...(R.is(Function, this.getParams) ? this.getParams() : this.getParams),
      }
      return ret
    },
  },
}
</script>
