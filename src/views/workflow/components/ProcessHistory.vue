<template>
  <vxe-grid
    class="mb-2 process-history"
    :data="processInstanceInfo.log"
    :columns="processHistoryColumns" />
</template>

<script>
import { approveStatusMap } from '../utils'
import { WORKFLOW_TYPES } from '@/constants/workflow'
import {
  getTimeTableColumn,
} from '@/utils/common/tableColumn'
import WindowsMixin from '@/mixins/windows'
const R = require('ramda')

export default {
  name: 'ProcessHistory',
  mixins: [WindowsMixin],
  props: {
    processInstanceInfo: {
      type: Object,
    },
  },
  data () {
    return {
      content: '',
      errorLogs: '',
      processHistoryColumns: [],
    }
  },
  created () {
    this.processHistoryColumns = [
      {
        field: 'activity_name',
        title: this.$t('common_391'),
        minWidth: 80,
        showOverflow: 'title',
      },
      {
        field: 'task_assignee_name',
        title: this.$t('common_392'),
        minWidth: 80,
        showOverflow: 'title',
      },
      {
        field: 'task_approved',
        title: this.$t('common_364'),
        minWidth: 80,
        showOverflow: 'title',
        slots: {
          default: ({ row }, h) => {
            if (R.isNil(row.task) || R.isNil(row.task.local_variables)) {
              return '-'
            } else {
              return this.getApproveHandle(row)
            }
          },
        },
      },
      {
        field: 'comment',
        title: this.$t('common_157'),
        minWidth: 80,
        showOverflow: 'title',
        formatter: ({ cellValue, row }) => {
          if (R.isNil(row.task.local_variables) || R.isNil(row.task.local_variables.comment)) return '-'
          return row.task.local_variables.comment
        },
      },
      getTimeTableColumn({ field: 'end_time', title: this.$t('common_393') }),
    ]
  },
  methods: {
    getApproveHandle (row) {
      const statusObj = approveStatusMap[`${row.activity_id}`]
      const approved = row.task.local_variables.approved
      const pdk = this.processInstanceInfo.process_definition_key
      let isLatest = false
      if (this.processInstanceInfo && this.processInstanceInfo.log) {
        isLatest = this.processInstanceInfo.log.indexOf(row) === this.processInstanceInfo.log.length - 1
      }
      if (pdk === WORKFLOW_TYPES.CUSTOMER_SERVICE) {
        const state = row.task.local_variables.state
        return [
          <span class="error-approved">{state}</span>,
        ]
      }
      if (!statusObj) {
        if (approved === undefined) return '-'
        if (approved) {
          return [
            <span class="pass">{this.$t('common.pass')}</span>,
          ]
        }
        return [
          <span class="error-approved">{this.$t('common.reject')}</span>,
        ]
      } else {
        const txt = statusObj[`${row.task.local_variables.approved}`]
        if (approved) {
          return [
            <span class="pass">{txt}</span>,
          ]
        }
        if (isLatest) {
          this.errorLogs = row.task.local_variables.biz_message || this.processInstanceInfo.variables.biz_message
          return [
            <span class="error-approved">{txt}</span>,
            <span class="error-link">({this.$t('common_394')}<span class="error-log" onClick={ this.showErrorLog.bind(this) }>{this.$t('common_458')}</span>)</span>,
          ]
        }
        return [
          <span class="error-approved">{txt}</span>,
        ]
      }
    },
    showErrorLog () {
      const serverIds = this.processInstanceInfo.variables.idArray
      if (serverIds && serverIds.length > 0) {
        this.loadMessage(serverIds)
      }
      const data = this.content || JSON.stringify(JSON.parse(this.errorLogs), null, 4)
      this.createDialog('EventLogDialog', {
        data,
      })
    },
    async loadMessage (serverIds) {
      this.content = ''
      const manager = new this.$Manager('actions', 'v1')
      const params = { obj_id: serverIds[0], obj_type: 'server', success: false, limit: 20 }
      const actionLogs = await manager.list({ params })
      const log = actionLogs.data.data
      if (log) {
        try {
          const notes = log.map((item) => { return JSON.stringify(JSON.parse(item.notes), null, 4) }).join(',')
          this.content = notes
        } catch (e) {
          this.content = log.map((item) => { return item.notes }).join(' ')
        }
      }
    },
  },
}
</script>

<style lang="less" scoped>
.process-history {
  .error-approved{
    color: rgba(240, 61, 61, 1);
  }
  .pass {
    color: #7ed321;
  }
  .error-log {
    color: #4DA1FF;
  }
  .error-link {
    display: block;
    font-size: 12px;
    color: #999;
    margin-left: '3px';
    cursor: pointer;
  }
}
</style>
