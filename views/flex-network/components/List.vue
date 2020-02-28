<template>
  <page-list
    :list="list"
    :columns="columns"
    :export-data-options="exportDataOptions"
    :showSearchbox="showSearchbox"
    :showGroupActions="showGroupActions" />
</template>

<script>
import ColumnsMixin from '../mixins/columns'
import ListMixin from '@/mixins/list'
import { getStatusFilter, getBrandFilter } from '@/utils/common/tableFilter'
import WindowsMixin from '@/mixins/windows'
import GlobalSearchMixin from '@/mixins/globalSearch'

export default {
  name: 'FlexNetworkList',
  mixins: [WindowsMixin, ListMixin, GlobalSearchMixin, ColumnsMixin],
  props: {
    id: String,
    getParams: {
      type: Object,
    },
    cloudEnv: String,
  },
  data () {
    return {
      list: this.$list.createList(this, {
        id: this.id,
        resource: 'networkinterfaces',
        getParams: this.getParam,
        filterOptions: {
          name: {
            label: '名称',
            filter: true,
            formatter: val => {
              return `name.contains("${val}")`
            },
          },
          mac: {
            label: 'MAC地址',
            filter: true,
            // jointFilter: true,
            formatter: val => {
              return `mac.contains("${val}")`
            },
          },
          status: getStatusFilter('network'),
          brand: getBrandFilter(),
          associate_type: {
            label: '绑定设备类型',
            filter: true,
            formatter: val => {
              return `associate_type.contains("${val}")`
            },
          },
        },
        responseData: this.responseData,
      }),
      exportDataOptions: {
        items: [
          { label: 'ID', key: 'id' },
          { label: '名称', key: 'name' },
          { label: 'MAC地址', key: 'mac' },
          { label: '状态', key: 'status' },
          { label: '平台', key: 'brand' },
          { label: '绑定设备类型(VPC)', key: 'associate_type' },
          { label: 'CPU绑定设备', key: 'associate_id' },
          { label: '云账号', key: 'account' },
          { label: this.$t('dictionary.project'), key: 'tenant' },
          { label: '区域', key: 'region' },
          { label: '可用区', key: 'zone' },
        ],
      },
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
    this.initSidePageTab('flex-network-detail')
    this.list.fetchData()
  },
  methods: {
    getParam () {
      const ret = {
        ...this.getParams,
        details: true,
      }
      if (this.cloudEnv) ret.cloud_env = this.cloudEnv
      return ret
    },
    handleOpenSidepage (row) {
      this.sidePageTriggerHandle(this, 'FlexNetworkSidePage', {
        id: row.id,
        resource: 'networkinterfaces',
        getParams: this.getParam,
      }, {
        list: this.list,
      })
    },
  },
}
</script>
