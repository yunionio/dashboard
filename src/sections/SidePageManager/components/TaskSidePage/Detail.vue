<template>
  <detail
    :onManager="onManager"
    :data="data"
    :base-info="baseInfo"
    :extra-info="extraInfo"
    :showName="false"
    status-module="parentTaskStatus"
    :resource="resource" />
</template>

<script>
import WindowsMixin from '@/mixins/windows'
import {
  getStatusTableColumn,
  getObjnameTableColumn,
  getTaskNameTableColumn,
  getSubtaskCountTableColumn,
} from '@/utils/common/tableColumn'
const yaml = require('js-yaml')

export default {
  name: 'TaskDetail',
  mixins: [WindowsMixin],
  props: {
    data: {
      type: Object,
      required: true,
    },
    onManager: {
      type: Function,
      required: true,
    },
    resource: {
      type: String,
      default: 'cloud-phone-tasks',
    },
  },
  data () {
    return {
      baseInfo: [
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
        getSubtaskCountTableColumn(),
      ],
      cmOptions: {
        tabSize: 2,
        styleActiveLine: true,
        lineNumbers: true,
        line: true,
        theme: 'material',
        mode: 'text/x-yaml',
      },
      stageColumns: [
        {
          field: 'name',
          title: this.$t('task.stages.title.name'),
          width: 300,
        },
        {
          field: 'start_at',
          title: this.$t('task.stages.title.start_at'),
          width: 180,
          formatter: ({ cellValue, row }) => {
            return cellValue.format()
          },
        },
        {
          field: 'complete_at',
          title: this.$t('task.stages.title.complete_at'),
          width: 180,
          formatter: ({ cellValue, row }) => {
            if (cellValue) {
              return cellValue.format()
            }
            return '-'
          },
        },
        {
          field: 'duration',
          title: this.$t('task.stages.title.duration'),
          width: 80,
        },
      ],
    }
  },
  computed: {
    taskStages () {
      const stages = []
      console.log(this.data)
      if (this.data.params) {
        if (this.data.params.__stages) {
          // stages
          for (let i = 0; i < this.data.params.__stages.length; i++) {
            let startAt = this.$moment(this.data.created_at)
            if (i > 0) {
              startAt = this.$moment(this.data.params.__stages[i - 1].complete_at)
            }
            const completeAt = this.$moment(this.data.params.__stages[i].complete_at)
            const duration = (completeAt - startAt) / 1000
            stages.push({
              name: this.data.params.__stages[i].name,
              start_at: startAt,
              complete_at: completeAt,
              duration: duration,
            })
          }
        }
      }
      const endAt = this.$moment(this.data.end_at)
      stages.push({
        name: this.data.stage,
        start_at: endAt,
      })
      return stages
    },
    taskParams () {
      const params = {}
      let keyCnt = 0
      if (this.data.params) {
        for (const key in this.data.params) {
          if (key !== '__stages' && key !== '__request_context' && key !== 'parent_task_id' && key !== '__failed_reason') {
            params[key] = this.data.params[key]
            keyCnt += 1
          }
        }
      }
      if (keyCnt) {
        return yaml.dump(params)
      }
      return null
    },
    failedReasons () {
      if (this.data.params && this.data.params.__failed_reason) {
        const failed = {}
        failed.stage = this.data.params.__failed_reason.stage
        try {
          failed.reason = JSON.parse(this.data.params.__failed_reason.reason)
        } catch (e) {
          console.log('failedReasons json parse error', e)
          failed.reason = this.data.params.__failed_reason.reason
        }
        return yaml.dump(failed)
      }
      return null
    },
    extraInfo () {
      const items = [
        {
          field: '__stages',
          title: this.$t('task.title.stages'),
          slots: {
            default: ({ row }, h) => {
              return [
                <vxe-grid class="mb-2" data={ this.taskStages } columns={ this.stageColumns } />,
              ]
            },
          },
        },
      ]
      if (this.failedReasons) {
        items.splice(0, 0, {
          field: 'faiiled_reason',
          title: this.$t('task.title.failed_reason'),
          slots: {
            default: ({ row }, h) => {
              return [
                <code-mirror value={ this.failedReasons } options={ this.cmOptions } />]
            },
          },
        })
      }
      if (this.taskParams) {
        items.push({
          field: 'params',
          title: this.$t('task.title.parameters'),
          slots: {
            default: ({ row }, h) => {
              return [
                <code-mirror value={ this.taskParams } options={ this.cmOptions } />]
            },
          },
        })
      }
      const infos = [
        {
          title: this.$t('task.title.parameters'),
          items: items,
        },
      ]
      return infos
    },
  },
}
</script>
