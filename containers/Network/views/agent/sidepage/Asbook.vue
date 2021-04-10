<template>
  <div class="ansible-playbook">
    <refresh-button class="flex-shrink-0" :loading="isRunning" @refresh="refresh" />
    <a-button class="flex-shrink-0 ml-2" @click="handleRun" :disabled="this.isRunning">{{$t('network.text_28')}}</a-button>
    <a-button class="flex-shrink-0 ml-2" @click="handleStop" :disabled="!this.isRunning">{{$t('network.text_32')}}</a-button>
    <detail
      :data="resourceData"
      :base-info="baseInfo"
      :extra-info="extraInfo"
      :onManager="()=> {}"
      status-module="ansiblePlaybook" />
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
  props: {
    data: {
      type: Object,
      required: true,
    },
  },
  data () {
    return {
      T: null,
      isRunning: false,
      resourceData: {},
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
          title: this.$t('network.text_133'),
          items: [
            {
              field: 'output',
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
    const { ansible_playbook } = this.data.deployment
    this.ansibleEvents = new Ansible(ansible_playbook)
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
          this.$nextTick(() => {
            document.getElementsByClassName('CodeMirror-scroll')[0].scrollTop = 999999
          })
        })
    },
    handleStop () {
      this.createDialog('DisableDialog', {
        title: this.$t('network.text_134'),
        name: this.$t('network.text_20'),
        columns: this.columns,
        data: [this.ansibleplaybookData],
        alert: this.$t('network.text_29'),
        ok: async () => {
          try {
            await this.ansibleEvents.stop()
            this.$message.success(this.$t('network.text_40'))
            this.refresh()
          } catch (error) {
            throw error
          }
        },
      })
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
