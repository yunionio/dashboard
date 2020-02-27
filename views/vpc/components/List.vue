<template>
  <page-list
    :list="list"
    :columns="columns"
    :single-actions="singleActions"
    :group-actions="groupActions" />
</template>

<script>
import * as R from 'ramda'
import {
  getNameDescriptionTableColumn,
  getStatusTableColumn,
  getCopyWithContentTableColumn,
  getRegionTableColumn,
  getBrandTableColumn,
  getAccountTableColumn,
} from '@/utils/common/tableColumn'
import { getStatusFilter, getBrandFilter, getAccountFilter } from '@/utils/common/tableFilter'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'VPCList',
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
        resource: 'vpcs',
        getParams: this.getParam,
        filterOptions: {
          name: {
            label: '名称',
            filter: true,
            formatter: val => {
              return `name.contains("${val}")`
            },
          },
          status: getStatusFilter('vpc'),
          account: getAccountFilter(),
          brand: getBrandFilter(),
          cidr_block: {
            label: '目标网段',
          },
        },
      }),
      columns: [
        getNameDescriptionTableColumn({
          vm: this,
          hideField: true,
          slotCallback: row => {
            return (
              <side-page-trigger onTrigger={ () => this.sidePageTriggerHandle(row.id, 'VpcSidePage') }>{ row.name }</side-page-trigger>
            )
          },
        }),
        getCopyWithContentTableColumn({
          field: 'cidr_block',
          title: '目标网段',
          sortable: true,
        }),
        getRegionTableColumn(),
        getBrandTableColumn(),
        getAccountTableColumn(),
        getStatusTableColumn({ statusModule: 'vpc' }),
        {
          field: 'wire_count',
          title: '二层网络',
          width: 70,
          sortable: true,
        },
        {
          field: 'network_count',
          title: 'IP子网数量',
          width: 80,
          sortable: true,
        },
      ],
      groupActions: [
        {
          label: '新建',
          action: () => {
            this.createDialog('VpcCreateDialog', {
              title: '新建',
              data: this.list.selectedItems,
              list: this.list,
            })
          },
          meta: () => {
            return {
              buttonType: 'primary',
            }
          },
        },
        {
          label: '删除',
          permission: 'vpcs_delete',
          action: () => {
            this.createDialog('DeleteResDialog', {
              title: '删除',
              data: this.list.selectedItems,
              columns: this.columns,
              list: this.list,
            })
          },
          meta: () => {
            return {
              validate: this.list.allowDelete(),
            }
          },
        },
      ],
      singleActions: [
        {
          label: '删除',
          permission: 'vpcs_delete',
          action: (obj) => {
            this.createDialog('DeleteResDialog', {
              title: '删除',
              data: [obj],
              columns: this.columns,
              list: this.list,
              success: () => {
                this.destroySidePages()
              },
            })
          },
          meta: (obj) => this.$getDeleteResult(obj),
        },
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
    this.initSidePageTab('vpc-detail')
    this.list.fetchData()
  },
  methods: {
    getParam () {
      const ret = {
        ...(R.is(Function, this.getParams) ? this.getParams() : this.getParams),
      }
      if (this.cloudEnv) ret.cloud_env = this.cloudEnv
      return ret
    },
  },
}
</script>
