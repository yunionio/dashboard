<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{action}}</div>
    <div slot="body">
      <detect-ssh-table :params="params" @radio-change="handleRadioChange" :remote="true" />
    </div>
    <div slot="footer">
      <a-button type="primary" @click="cancelDialog" :loading="loading">{{ $t('dialog.ok') }}</a-button>
      <a-button @click="cancelDialog">{{ $t('dialog.cancel') }}</a-button>
    </div>
  </base-dialog>
</template>

<script>
import {
  getStatusTableColumn,
} from '@/utils/common/tableColumn'
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'

export const DetectSshTable = {
  name: 'DetectSshTable',
  props: {
    params: {
      type: Object,
      required: true,
    },
    /* 显示单选框 */
    showRadioSelect: {
      type: Boolean,
      default: false,
    },
    /* 主动从服务器端发起探测 */
    remote: {
      type: Boolean,
      default: false,
    },
    ansibleTasks: {
      /* item {  'server_uuid': 'ansible_playbook_id' } */
      type: Object,
      default: () => ({}),
    },
    /**/
    maxColumns: {
      type: Number,
      default: 2,
    },
  },
  mixins: [DialogMixin, WindowsMixin],
  render (h, context) {
    const vxeGridEvents = {}
    if (this.showRadioSelect) {
      vxeGridEvents['radio-change'] = ({ row }) => { this.$emit('radio-change', row) }
    }
    return h('dialog-table', {
      props: {
        data: this.rows,
        columns: this.columns,
        vxeGridProps: {
          'radio-config': {
            showHeaderOverflow: false,
            resizable: false,
            highlight: true,
            trigger: 'row',
            checkMethod: ({ row }) => { return row.status === 'running' },
          },
          'tooltip-config': {
            enabled: this.showRadioSelect,
            contentMethod: ({ type, column, row, items, _columnIndex }) => {
              return row.status !== 'running' ? this.$t('compute.text_1282') : ''
            },
          },
        },
        vxeGridEvents: vxeGridEvents,
      },
      key: this.updated,
    })
  },
  data () {
    const columns = []
    if (this.showRadioSelect) {
      columns.push({
        type: 'radio',
        width: '40',
      })
    }
    columns.push(...this.params.columns.slice(0, this.maxColumns))
    columns.push(
      getStatusTableColumn({
        field: 'sshable_status',
        title: this.$t('compute.vminstance.detect_ssh_authentication.status'),
        minWidth: 130,
        statusModule: 'serversshable',
        slotCallback: row => {
          return [
            <div class='d-flex align-items-center text-truncate'>
              <status status={ row.sshable_status } statusModule='serversshable' />
            </div>,
          ]
        },
      }))

    const rows = Object.assign([], this.params.data)
    if (this.remote) {
      columns.push({
        field: 'details',
        title: this.$t('table.title.operation'),
        width: 70,
        slots: {
          default: ({ row, column }) => {
            let text = ''
            row.details.map((detail) => {
              try {
                if (typeof detail === 'string') {
                  text += detail
                } else {
                  text += JSON.stringify(detail, null, 4)
                }
              } catch (e) {
                text += detail
              }
              text += '\n=============================\n'
            })

            return [<a-button size='small' type='link'
              onClick={() => this.clickHandler(text)}>{this.$t('common.view')}</a-button>]
          },
        },
      })

      rows.map((r) => { r.sshable_status = ''; r.details = [] })
    } else {
      rows.map((r) => { r.sshable_status = r.sshable_last_state ? 'available' : 'unavailable'; r.details = [] })
    }
    return {
      updated: 0,
      rows: rows,
      columns: columns,
      manager: new this.$Manager('servers'),
    }
  },
  watch: {
    updated () {
      const stableStatus = ['available', 'unavailable', 'detect_failed']
      const detecting = !this.rows.every((row) => {
        return row.sshable_status && stableStatus.indexOf(row.sshable_status) >= 0
      })
      if (!detecting) {
        this.$emit('onDetecting', false)
      }
    },
  },
  created () {
    if (this.remote) {
      this.doDetectSshStatus()
    }
  },
  methods: {
    clickHandler (val) {
      this.createDialog('EventLogDialog', {
        data: val,
      })
    },
    async _waitAnsibleTaskFinished (server, taskId, maxTry) {
      try {
        while (maxTry > 0) {
          const { data = {} } = await new this.$Manager('ansibleplaybooks').get({ id: taskId })
          if (data.status === 'running') {
            await new Promise(resolve => setTimeout(resolve, 6000))
            maxTry -= 1
          } else {
            if (data.output) {
              server.details.push(data.output)
            }
            break
          }
        }
      } catch (e) {
        server.sshable_status = 'detect_failed'
        throw e
      }
    },
    async _checkServerSshable (server) {
      try {
        const { data = {} } = await this.manager.getSpecific({ id: server.id, spec: 'sshable' })
        server.details.push(data)
        server.sshable_status = data.method_tried && !data.method_tried.every((m) => { return m.sshable === false }) ? 'available' : 'unavailable'
      } catch (e) {
        server.sshable_status = 'detect_failed'
        throw e
      } finally {
        this.updated += 1
      }
    },
    checkServerSshable (server) {
      this.updated += 1
      server.sshable_status = 'detecting'
      this._checkServerSshable(server)
    },
    waitAnsibleTaskFinished (server, taskId, maxTry) {
      const self = this
      server.sshable_status = 'ansible_deploying'
      this._waitAnsibleTaskFinished(server, taskId, maxTry).then((ret) => {
        this.$nextTick(() => {
          self.checkServerSshable(server)
        })
      })
    },
    doDetectSshStatus () {
      if (this.rows && this.rows.length > 0) {
        this.$emit('onDetecting', true)
      }

      for (const r of this.rows) {
        if (this.ansibleTasks[r.id]) {
          this.waitAnsibleTaskFinished(r, this.ansibleTasks[r.id], 10)
        } else {
          this.checkServerSshable(r)
        }
      }
    },
    handleRadioChange (row) {
      this.$emit('radio-change', row)
    },
  },
}

export default {
  name: 'DetectSSHDialog',
  components: { DetectSshTable },
  mixins: [DialogMixin, WindowsMixin],
  data () {
    return {
      loading: false,
      action: this.$t('compute.vminstance.actions.detect_ssh_authentication'),
    }
  },
}
</script>
