<template>
  <page-list
    :list="list"
    :columns="columns"
    :group-actions="groupActions"
    :single-actions="singleActions"
    :export-data-options="exportDataOptions" />
</template>

<script>
import { mapGetters } from 'vuex'
import { STRATEGY_OPT, STRATEGY_CN } from '@Cloudenv/constants/sched'
import WindowsMixin from '@/mixins/windows'
import { getNameDescriptionTableColumn } from '@/utils/common/tableColumn'
const RES_TYPES = { hosts: '宿主机、物理机', storages: '存储', networks: '网络' }

export default {
  name: 'SchedtagList',
  mixins: [WindowsMixin],
  props: {
    id: String,
  },
  data () {
    return {
      list: this.$list.createList(this, {
        id: this.id,
        resource: 'schedtags',
        getParams: { details: true },
        filterOptions: {
          name: {
            label: '名称',
            filter: true,
            formatter: val => {
              return `name.contains("${val}")`
            },
          },
          'default_strategy': {
            label: '偏好',
            dropdown: true,
            multiple: true,
            items: STRATEGY_OPT,
          },
          resource_type: {
            label: '资源类型',
            dropdown: true,
            multiple: true,
            items: Object.keys(RES_TYPES).map(key => {
              return { label: RES_TYPES[key], key }
            }),
          },
        },
      }),
      exportDataOptions: {
        items: [
          { label: 'ID', key: 'id' },
          { label: '名称', key: 'name' },
          { label: '偏好', key: 'default_strategy' },
          { label: '资源类型', key: 'resource_type' },
          { label: '资源数量', key: 'resource_count' },
          { label: '关联动态调度标签', key: 'dynamic_schedtag_count' },
          { label: '关联调度策略', key: 'schedpolicy_count' },
        ],
      },
      columns: [
        getNameDescriptionTableColumn({
          vm: this,
          hideField: true,
          slotCallback: row => {
            return (
              <side-page-trigger onTrigger={ () => this.sidePageTriggerHandle(row.id, 'SchedtagSidePage') }>{ row.name }</side-page-trigger>
            )
          },
        }),
        {
          field: 'default_strategy',
          title: '偏好',
          width: 80,
          formatter: ({ row }) => {
            return STRATEGY_CN[row.default_strategy] || '无'
          },
        },
        {
          field: 'resource_type',
          title: '资源类型',
          width: 120,
          formatter: ({ row }) => {
            return RES_TYPES[row.resource_type] || '无'
          },
        },

        {
          field: 'resource_count',
          title: '资源数量',
          width: 80,
          formatter: ({ row }) => {
            return row.host_count || row.storage_count || row.network_count || '0'
          },
        },
        {
          field: 'dynamic_schedtag_count',
          title: '关联动态调度标签',
          width: 120,
          formatter: ({ row }) => {
            return row.dynamic_schedtag_count || '0'
          },
        },
        {
          field: 'schedpolicy_count',
          title: '关联调度策略',
          width: 120,
          formatter: ({ row }) => {
            return row.schedpolicy_count || '0'
          },
        },
      ],
      groupActions: [
        {
          label: '新建',
          action: () => {
            this.createDialog('CreateSchedtagDialog', {
              title: '创建调度标签',
              list: this.list,
            })
          },
          meta: () => {
            const ret = {
              validate: true,
              tooltip: null,
              buttonType: 'primary',
            }
            if (!this.isAdminMode) {
              ret.validate = false
            }
            return ret
          },
        },
        {
          label: '删除',
          action: () => {
            this.createDialog('DeleteResDialog', {
              data: this.list.selectedItems,
              columns: this.columns,
              title: '删除调度标签',
              list: this.list,
            })
          },
          meta: () => {
            const ret = {
              validate: this.list.allowDelete(),
              tooltip: null,
            }
            if (!this.isAdminMode) {
              ret.validate = false
            }
            return ret
          },
        },
      ],
      singleActions: [
        {
          label: '更改所属',
          action: obj => {
            this.createDialog('SetOwnerDialog', {
              data: [obj],
              columns: this.columns,
              title: '更改所属',
              list: this.list,
              tipName: '调度标签',
            })
          },
          meta: () => {
            const ret = {
              validate: true,
              tooltip: null,
            }
            if (!this.isAdminMode) {
              ret.validate = false
            }
            return ret
          },
        },
        {
          label: '偏好设置',
          action: obj => {
            this.createDialog('SetStrategyDialog', {
              data: [obj],
              columns: this.columns,
              title: '偏好设置',
              list: this.list,
            })
          },
          meta: () => {
            const ret = {
              validate: true,
              tooltip: null,
            }
            if (!this.isAdminMode) {
              ret.validate = false
            }
            return ret
          },
        },
        {
          label: '删除',
          action: obj => {
            this.createDialog('DeleteResDialog', {
              data: [obj],
              columns: this.columns,
              title: '删除调度标签',
              list: this.list,
            })
          },
          meta: obj => {
            const ret = {
              validate: obj.can_delete,
              tooltip: null,
            }
            if (!this.isAdminMode) {
              ret.validate = false
            }
            return ret
          },
        },
      ],
    }
  },
  computed: mapGetters(['isAdminMode']),
  created () {
    this.initSidePageTab('schedtag-detail')
    this.list.fetchData()
  },
}
</script>
