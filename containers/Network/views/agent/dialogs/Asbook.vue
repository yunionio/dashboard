<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{params.title}}</div>
    <div slot="body">
      <a-descriptions bordered size="small">
        <a-descriptions-item :label="$t('network.text_21')">
          {{ansibleplaybookData.name}}
        </a-descriptions-item>
        <a-descriptions-item :label="$t('network.text_27')">
          <status :status="ansibleplaybookData.status" statusModule="ansiblePlaybook" />
        </a-descriptions-item>
      </a-descriptions>
      <div class="mt-3">
        <code-mirror :value="ansibleplaybookData.output " :options="cmOptions" />
      </div>
    </div>
    <div slot="footer">
      <a-button class="ml-2 mr-2" @click="handleRun" :disabled="this.isRunning">{{$t('network.text_28')}}</a-button>
       <a-popconfirm
          class=""
          placement="topRight"
          :title="$t('network.text_29')"
          :ok-text="$t('scope.text_856')"
          :cancel-text="$t('network.text_31')"
          @confirm="handleStop">
        <a-button class="" :disabled="!this.isRunning">{{$t('network.text_32')}}</a-button>
      </a-popconfirm>
      <a-button class="ml-2" @click="cancelDialog">{{$t('network.text_33')}}</a-button>
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
          title: this.$t('network.text_34'),
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
          title: this.$t('network.text_35'),
          formatter: ({ cellValue }) => {
            return this.$moment(cellValue).format(this.$t('network.text_36'))
          },
        },
        {
          field: 'end_time',
          title: this.$t('network.text_37'),
          formatter: ({ cellValue }) => {
            return this.$moment(cellValue).format(this.$t('network.text_36'))
          },
        },
      ],
      extraInfo: [
        {
          title: this.$t('network.text_38'),
          items: [
            {
              field: 'output',
              title: this.$t('network.text_39'),
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
        this.$message.success(this.$t('network.text_40'))
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

<style lang="less" scoped>
.ansible-playbook {
  ::v-deep {
    .CodeMirror {
      height: 700px !important;
    }
  }
}
</style>
