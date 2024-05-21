<template>
  <div class="task-list">
    <page-list
      :list="list"
      :columns="columns"
      :export-data-options="exportDataOptions"
      default-search-key="task_name" />
  </div>
</template>

<script>
import * as R from 'ramda'
import { getTimeRangeFilter } from '@/utils/common/tableFilter'
import {
  getNameDescriptionTableColumn,
  getCopyWithContentTableColumn,
  getTimeTableColumn,
  getProjectTableColumn,
  getStatusTableColumn,
} from '@/utils/common/tableColumn'
import expectStatus from '@/constants/expectStatus'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'TaskList',
  mixins: [WindowsMixin],
  props: {
    objId: {
      type: String,
    },
    listId: {
      type: String,
    },
    getParams: [Object, Function],
  },
  data () {
    const filterOptions = {
      task_name: {
        label: this.$t('table.title.task_name'),
      },
      created_at: getTimeRangeFilter({ label: this.$t('table.title.create_time'), field: 'created_at' }),
    }
    return {
      list: this.$list.createList(this, {
        id: this.listId,
        resource: 'cloud-phone-tasks',
        apiVersion: 'v1',
        getParams: this.getParam,
        filterOptions,
        steadyStatus: {
          status: Object.values(expectStatus.parentTaskStatus).flat(),
        },
      }),
      columns: [
        getNameDescriptionTableColumn({
          title: '#ID',
          field: 'id',
          showDesc: false,
          edit: false,
          onManager: this.onManager,
          hideField: true,
          slotCallback: row => {
            return (
              <side-page-trigger onTrigger={() => this.handleOpenSidepage(row)}>{row.id}</side-page-trigger>
            )
          },
        }),
        getStatusTableColumn({
          minWidth: 80,
          statusModule: 'parentTaskStatus',
        }),
        {
          title: this.$t('table.title.progress'),
          field: 'progress',
          formatter ({ row }) {
            return row.progress + '%'
          },
        },
        getStatusTableColumn({
          title: this.$t('table.title.stage'),
          minWidth: 80,
          field: 'stage',
          statusModule: 'parentTaskStage',
        }),
        getCopyWithContentTableColumn({
          title: this.$t('table.title.obj_type'),
          field: 'obj_name',
          formatter ({ row }) {
            return row.obj_name
          },
        }),
        getCopyWithContentTableColumn({
          title: this.$t('table.title.task_name'),
          field: 'task_name',
          formatter ({ row }) {
            return row.task_name
          },
        }),
        getProjectTableColumn({
          title: this.$t('table.title.owner_project'),
        }),
        getTimeTableColumn({
          field: 'created_at',
          title: this.$t('table.title.create_time'),
        }),
      ],
    }
  },
  computed: {
    exportDataOptions () {
      const items = this.columns.map(item => {
        return {
          key: item.field,
          label: item.title,
          formatter: item.formatter,
        }
      })
      return {
        title: this.$t('table.title.task'),
        downloadType: 'local',
        items,
      }
    },
  },
  watch: {
    getParams (val) {
      if (!R.is(Function, this.getParams)) {
        this.list.reset()
        this.list.fetchData()
      }
    },
  },
  created () {
    this.list.fetchData()
  },
  methods: {
    handleOpenSidepage (row) {
      this.sidePageTriggerHandle(this, 'TaskSidePage', {
        id: row.id,
        resource: 'cloud-phone-tasks',
        getParams: this.getParam,
      }, {
        list: this.list,
      })
    },
    getParam () {
      const param = {
        is_root: true,
      }
      const filter = []
      if (this.objId) {
        param.obj_id = this.objId
      }
      param.filter = filter
      const params = R.is(Function, this.getParams) ? this.getParams() : this.getParams || {}
      return { ...param, ...params }
    },
  },
}
</script>
<style lang="less" scoped>
.task-list {
  position: relative;
  padding-bottom: 20px;
}
</style>
