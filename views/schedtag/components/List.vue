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
import { STRATEGY_OPT } from '@Cloudenv/constants/sched'
import ColumnsMixin from '../mixins/columns'
import SingleActionsMixin from '../mixins/singleActions'
import WindowsMixin from '@/mixins/windows'
import ListMixin from '@/mixins/list'

const RES_TYPES = { hosts: '宿主机、物理机', storages: '存储', networks: '网络' }

const getParams = { details: true }

export default {
  name: 'SchedtagList',
  mixins: [WindowsMixin, ListMixin, ColumnsMixin, SingleActionsMixin],
  props: {
    id: String,
  },
  data () {
    return {
      list: this.$list.createList(this, {
        id: this.id,
        resource: 'schedtags',
        getParams,
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
      groupActions: [
        {
          label: '新建',
          action: () => {
            this.createDialog('CreateSchedtagDialog', {
              title: '创建调度标签',
              onManager: this.onManager,
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
              vm: this,
              data: this.list.selectedItems,
              columns: this.columns,
              title: '删除调度标签',
              name: this.$t('dictionary.schedtag'),
              onManager: this.onManager,
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
    }
  },
  computed: mapGetters(['isAdminMode']),
  created () {
    this.initSidePageTab('schedtag-detail')
    this.list.fetchData()
  },
  methods: {
    handleOpenSidepage (row) {
      this.sidePageTriggerHandle(this, 'SchedtagSidePage', {
        id: row.id,
        resource: 'schedtags',
        getParams,
      }, {
        list: this.list,
      })
    },
  },
}
</script>
