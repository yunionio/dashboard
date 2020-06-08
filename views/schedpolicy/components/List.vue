<template>
  <page-list
    :list="list"
    :columns="columns"
    :group-actions="groupActions"
    :single-actions="singleActions"
    :export-data-options="exportDataOptions" />
</template>

<script>
import ColumnsMixin from '../mixins/columns'
import SingleActionsMixin from '../mixins/singleActions'
import { STRATEGY_OPT } from '@Cloudenv/constants/sched'
import ListMixin from '@/mixins/list'
import WindowsMixin from '@/mixins/windows'
import { getNameFilter, getEnabledFilter, getFilter } from '@/utils/common/tableFilter'

const getParams = { details: true }

export default {
  name: 'SchedpolicyList',
  mixins: [WindowsMixin, ListMixin, ColumnsMixin, SingleActionsMixin],
  props: {
    id: String,
  },
  data () {
    return {
      list: this.$list.createList(this, {
        id: this.id,
        resource: 'schedpolicies',
        getParams,
        filterOptions: {
          name: getNameFilter(),
          enabled: getEnabledFilter(),
          strategy: {
            label: '偏好',
            dropdown: true,
            multiple: true,
            items: STRATEGY_OPT,
          },
          schedtag: getFilter({
            field: 'schedtag',
            title: '调度标签',
          }),
        },
      }),
      exportDataOptions: {
        items: [
          { label: 'ID', key: 'id' },
          { label: '名称', key: 'name' },
          { label: '启用状态', key: 'enabled' },
          { label: '偏好', key: 'strategy' },
          { label: '调度标签', key: 'schedtag' },
          { label: '条件', key: 'condition' },
        ],
      },
      groupActions: [
        {
          label: '新建',
          action: () => {
            this.createDialog('CreateSchedpolicyDialog', {
              title: '创建调度策略',
              onManager: this.onManager,
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
          action: () => {
            this.createDialog('DeleteResDialog', {
              vm: this,
              data: this.list.selectedItems,
              columns: this.columns,
              title: '删除调度策略',
              name: this.$t('dictionary.schedpolicie'),
              onManager: this.onManager,
            })
          },
          meta: () => {
            return {
              validate: this.list.allowDelete(),
            }
          },
        },
      ],
    }
  },
  created () {
    this.initSidePageTab('schedpolicy-detail')
    this.list.fetchData()
  },
  methods: {
    handleOpenSidepage (row) {
      this.sidePageTriggerHandle(this, 'SchedpolicySidePage', {
        id: row.id,
        resource: 'schedpolicies',
        getParams,
      }, {
        list: this.list,
      })
    },
  },
}
</script>
