<template>
  <div class="task-list">
    <page-list
      :list="list"
      :columns="columns"
      :export-data-options="exportDataOptions" />
  </div>
</template>

<script>
import * as R from 'ramda'
import moment from 'moment'
import {
  getStatusFilter,
  getTimeRangeFilter,
} from '@/utils/common/tableFilter'
import {
  getNameDescriptionTableColumn,
  getTimeTableColumn,
  getProjectTableColumn,
  getStatusTableColumn,
  getObjnameTableColumn,
  getTaskNameTableColumn,
  // getSubtaskCountTableColumn,
} from '@/utils/common/tableColumn'
import expectStatus from '@/constants/expectStatus'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'TaskList',
  mixins: [WindowsMixin],
  props: {
    resource: {
      type: String,
    },
    objId: {
      type: String,
    },
    listId: {
      type: String,
    },
    root: {
      type: Boolean,
    },
    taskStage: {
      type: String,
    },
    getParams: [Object, Function],
  },
  data () {
    const filterOptions = {
      id: {
        label: this.$t('table.title.id'),
      },
      status: getStatusFilter('task'),
      stage: {
        label: this.$t('table.title.stage'),
        dropdown: true,
        multiple: true,
        distinctField: {
          type: 'field',
          key: 'stage',
        },
      },
      task_name: {
        label: this.$t('table.title.task_name'),
        dropdown: true,
        multiple: true,
        distinctField: {
          type: 'field',
          key: 'task_name',
        },
      },
      created_at: getTimeRangeFilter({ label: this.$t('table.title.create_time'), field: 'created_at' }),
    }
    return {
      list: this.$list.createList(this, {
        id: this.listId,
        resource: this.resource,
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
          minWidth: 200,
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
        getObjnameTableColumn(),
        getTaskNameTableColumn(),
        // getSubtaskCountTableColumn(),
        getProjectTableColumn({
          title: this.$t('table.title.owner_project'),
        }),
        getTimeTableColumn({
          field: 'start_at',
          title: this.$t('task.stages.title.start_at'),
        }),
        getTimeTableColumn({
          field: 'end_at',
          title: this.$t('task.stages.title.complete_at'),
        }),
        {
          field: 'duration',
          title: this.$t('task.stages.title.duration'),
          width: 80,
          formatter ({ row }) {
            return (moment(row.end_at) - moment(row.start_at)) / 1000
          },
        },
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
    taskStage (val) {
      this.$nextTick(() => {
        this.list.fetchData(0)
      })
    },
  },
  created () {
    this.list.fetchData()
  },
  methods: {
    handleOpenSidepage (row) {
      this.sidePageTriggerHandle(this, 'TaskSidePage', {
        id: row.id,
        resource: this.resource,
        getParams: this.getParamDetail,
      }, {
        list: this.list,
      })
    },
    getParamDetail () {
      const params = this.getParam()
      params.sub_task = true
      return params
    },
    getParam () {
      const param = {
        details: true,
      }
      const filter = []
      if (this.objId) {
        param.obj_id = this.objId
      }
      if (this.root) {
        param.is_root = true
      }
      if (this.taskStage === 'in_progress') {
        param.not_stage = ['failed', 'complete']
      } else if (this.taskStage === 'complete') {
        param.stage = ['failed', 'complete']
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
