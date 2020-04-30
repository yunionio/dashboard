<template>
  <div>
    <page-header title="节点" />
    <page-body>
      <refresh-button class="flex-shrink-0" :loading="isRunning" @refresh="refresh" />
      <a-tooltip title="返回列表">
        <a-button class="flex-shrink-0 ml-2" @click="$router.push('/lbagent')" :disabled="this.isRunning"><a-icon type="arrow-left" /></a-button>
      </a-tooltip>
      <a-button class="flex-shrink-0 ml-2" @click="handleRun" :disabled="this.isRunning">重新执行</a-button>
      <a-button class="flex-shrink-0 ml-2" @click="handleStop" :disabled="!this.isRunning">终止执行</a-button>
      <detail
        :data="resourceData"
        :base-info="baseInfo"
        :extra-info="extraInfo"
        status-module="ansiblePlaybook" />
    </page-body>
    <page-footer>
      <template v-slot:right>
        <a-button class="ml-2" size="large" @click="handleCancel">返回</a-button>
      </template>
    </page-footer>
  </div>
</template>

<script>
import Ansible from '../controls/ansible'
import RefreshButton from '@/components/PageList/RefreshButton'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'Ansibleplaybook',
  components: {
    RefreshButton,
  },
  mixins: [WindowsMixin],
  data () {
    return {
      T: null,
      isRunning: false,
      resourceData: {},
      columns: [
        {
          field: 'name',
          title: '任务名称',
        },
      ],
      cmOptions: {
        tabSize: 2,
        styleActiveLine: true,
        lineNumbers: true,
        line: true,
        name: 'javascript',
        json: true,
        theme: 'material',
      },
      baseInfo: [
        {
          field: 'start_time',
          title: '开始时间',
          formatter: ({ cellValue }) => {
            return this.$moment(cellValue).format('YYYY年MM月DD日 HH:mm:ss')
          },
        },
        {
          field: 'end_time',
          title: '结束时间',
          formatter: ({ cellValue }) => {
            return this.$moment(cellValue).format('YYYY年MM月DD日 HH:mm:ss')
          },
        },
      ],
      extraInfo: [
        {
          title: '其他信息',
          items: [
            {
              field: 'output',
              title: '日志',
              slots: {
                default: ({ row }, h) => {
                  return [
                    <code-mirror value={ row.output } options={ this.cmOptions } />,
                  ]
                },
              },
            },
          ],
        },
      ],
    }
  },
  watch: {
    isRunning (nextVal) {
      clearInterval(this.T)
      if (nextVal) {
        this.T = setInterval(() => {
          this.refresh()
        }, 10000)
      }
    },
  },
  created () {
    const { ansiblePlaybookId } = this.$route.query
    this.ansibleEvents = new Ansible(ansiblePlaybookId)
    this.refresh()
  },
  methods: {
    refresh () {
      return this.ansibleEvents
        .get()
        .then(({ data }) => {
          this.resourceData = data
          this.isRunning = data.status === 'running'
          if (!this.isRunning) {
            clearInterval(this.T)
          }
          this.ansibleplaybookData = data
        })
    },
    handleStop () {
      this.createDialog('DisableDialog', {
        title: '中止',
        name: '节点',
        columns: this.columns,
        data: [this.ansibleplaybookData],
        alert: '提示：确认要中止执行？',
        ok: async () => {
          try {
            await this.ansibleEvents.stop()
            this.$message.success('中止成功')
            this.refresh()
          } catch (error) {
            throw error
          }
        },
      })
    },
    async handleRun () {
      const { loadbalanceragentId } = this.$route.query
      try {
        if (loadbalanceragentId) {
          await new this.$Manager('loadbalanceragents').performAction({
            id: loadbalanceragentId,
            action: 'undeploy',
            data: {
              'state': 'suspend',
              // 'process-key': key,
            },
          })
        } else {
          await this.ansibleEvents.run()
        }
        this.refresh()
      } catch (err) {
        throw err
      }
    },
    handleCancel () {
      this.$router.push('/lbagent')
    },
  },
}
</script>
