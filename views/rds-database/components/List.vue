<template>
  <page-list
    :columns="columns"
    :group-actions="groupActions"
    :list="list"
    :single-actions="singleActions" />
</template>

<script>
import ColumnsMixin from '../mixins/columns'
import SingleActionsMixin from '../mixins/singleActions'
import ListMixin from '@/mixins/list'
import WindowsMixin from '@/mixins/windows'
import expectStatus from '@/constants/expectStatus'
import { getNameFilter, getStatusFilter } from '@/utils/common/tableFilter'

export default {
  name: 'RDSDatabaseList',
  mixins: [WindowsMixin, ListMixin, ColumnsMixin, SingleActionsMixin],
  props: {
    params: {
      type: Object,
    },
    data: {
      type: Object,
    },
  },
  data () {
    return {
      list: this.$list.createList(this, {
        resource: 'dbinstancedatabases',
        getParams: this.params,
        steadyStatus: Object.values(expectStatus.redisAccount).flat(),
        filterOptions: {
          name: getNameFilter(),
          status: getStatusFilter('rdsDatabase'),
        },
      }),
      groupActions: [
        {
          label: '新建',
          action: () => {
            this.createDialog('RDSDatabaseCreateDialog', {
              title: '新建数据库',
              rdsItem: this.data,
              onManager: this.onManager,
              refresh: this.refresh,
            })
          },
          meta: () => {
            return {
              buttonType: 'primary',
              ...this.commonMeta,
            }
          },
        },
      ],
    }
  },
  computed: {
    commonMeta () {
      const isRun = this.data.status === 'running'
      let tooltip = ''
      if (!isRun) {
        tooltip = '仅在运行中状态下支持新建操作'
      }
      return {
        validate: isRun,
        tooltip: tooltip,
      }
    },
  },
  created () {
    this.list.fetchData()
    this.initSidePageTab('detail')
  },
  methods: {
    handleOpenSidepage (row) {
      this.sidePageTriggerHandle(this, 'RDSDatabaseSidePage', {
        id: row.id,
        resource: 'dbinstancedatabases',
        getParams: this.params,
        steadyStatus: Object.values(expectStatus.rdsDatabase).flat(),
      }, {
        list: this.list,
      })
    },
  },
}
</script>
