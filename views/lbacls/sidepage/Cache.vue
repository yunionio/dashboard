<template>
  <page-list
    :list="list"
    :columns="columns"
    :singleActions="singleActions" />
</template>

<script>
import * as R from 'ramda'
import {
  getCopyWithContentTableColumn,
  getTimeTableColumn,
  getProjectTableColumn,
  getBrandTableColumn,
  getRegionTableColumn,
  getAccountTableColumn,
} from '@/utils/common/tableColumn'
import { getNameFilter } from '@/utils/common/tableFilter'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'LbaclCacheList',
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
        resource: 'cachedloadbalanceracls',
        getParams: this.getParam,
        filterOptions: {
          name: getNameFilter(),
        },
      }),
      columns: [
        getCopyWithContentTableColumn(),
        getTimeTableColumn(),
        {
          field: 'updated_at',
          title: this.$t('network.text_314'),
          width: 150,
          formatter: ({ cellValue }) => {
            return this.$moment(cellValue).format()
          },
        },
        getProjectTableColumn(),
        getBrandTableColumn(),
        getRegionTableColumn(),
        getAccountTableColumn(),
      ],
      singleActions: [
        {
          label: this.$t('network.text_131'),
          permission: 'lb_loadbalancerlisteners_delete',
          action: (obj) => {
            this.createDialog('DeleteResDialog', {
              vm: this,
              title: this.$t('network.text_131'),
              name: this.$t('network.text_142'),
              data: [obj],
              columns: this.columns,
              onManager: this.onManager,
              alert: this.$t('network.text_752_1'),
            })
          },
          meta: (obj) => this.$getDeleteResult(obj),
        },
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
