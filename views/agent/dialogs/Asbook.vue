<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{params.title}}</div>
    <div slot="body">
      <a-descriptions bordered size="small">
        <a-descriptions-item label="名称">
          {{ansibleplaybookData.name}}
        </a-descriptions-item>
        <a-descriptions-item label="状态">
          <status :status="ansibleplaybookData.status" statusModule="ansiblePlaybook" />
        </a-descriptions-item>
      </a-descriptions>
      <div class="mt-3">
        <code-mirror :value="ansibleplaybookData.output " :options="cmOptions" />
      </div>
    </div>
    <div slot="footer">
      <a-button class="ml-2 mr-2" @click="handleRun" :disabled="this.isRunning">重新执行</a-button>
       <a-popconfirm
          class=""
          placement="topRight"
          title="提示：确认要终止执行？"
          ok-text="确定"
          cancel-text="取消"
          @confirm="handleStop">
        <a-button class="" :disabled="!this.isRunning">终止执行</a-button>
      </a-popconfirm>
      <a-button class="ml-2" @click="cancelDialog">关闭</a-button>
    </div>
  </base-dialog>
</template>

<script>
import Ansible from '../controls/ansible'
import WindowsMixin from '@/mixins/windows'
import DialogMixin from '@/mixins/dialog'

export default {
  name: 'AnsibleplaybookDialog',
  components: {
  },
  mixins: [WindowsMixin, DialogMixin],
  data () {
    return {
      T: null,
      isRunning: false,
      ansibleplaybookData: {},
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
    const { ansiblePlaybookId } = this.params
    this.ansibleEvents = new Ansible(ansiblePlaybookId)
    this.refresh()
  },
  methods: {
    refresh () {
      return this.ansibleEvents
        .get()
        .then(({ data }) => {
          this.ansibleplaybookData = data
          this.isRunning = data.status === 'running'
          if (!this.isRunning) {
            clearInterval(this.T)
          }
          this.$nextTick(() => {
            document.getElementsByClassName('CodeMirror-scroll')[0].scrollTop = 999999
          })
        })
    },
    async handleStop () {
      try {
        await this.ansibleEvents.stop()
        this.$message.success('中止成功')
        this.refresh()
      } catch (err) {
        throw err
      }
    },
    async handleRun () {
      try {
        this.ansibleplaybookData.output = ' '
        await this.ansibleEvents.run()
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

<style lang="scss" scoped>
.ansible-playbook {
  ::v-deep {
    .CodeMirror {
      height: 700px !important;
    }
  }
}
</style>
