<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">更新报警</div>
    <div slot="body">
      <vxe-grid class="mb-2" v-if="params.data && params.columns" :data="params.data" :columns="params.columns.slice(0)" />
      <node-alert-form
        ref="nodeAlertFormRef"
        :metric-opts="metricOpts"
        :hypervisor="hypervisor"
        :alertType="params.alertType"
        :fd-initail-value="fdInitailValue" />
    </div>
    <div slot="footer">
      <a-button type="primary" @click="handleConfirm" :loading="loading">{{ $t('dialog.ok') }}</a-button>
      <a-button @click="cancelDialog">{{ $t('dialog.cancel') }}</a-button>
    </div>
  </base-dialog>
</template>

<script>
import NodeAlertForm from '../components/Form'
import { metricItems } from '../constants'
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'
import { HYPERVISORS_MAP } from '@/constants'

export default {
  name: 'UpdateNodeAlert',
  components: {
    NodeAlertForm,
  },
  mixins: [DialogMixin, WindowsMixin],
  data () {
    return {
      loading: false,
      fdInitailValue: {
        ...this.params.data[0],
        recipients: this.params.data[0].recipients.split(','),
        window: +this.params.data[0].window.replace('m', ''),
      },
    }
  },
  computed: {
    hypervisor () {
      let hyper = ''
      if (this.params.data && this.params.data.hypervisor) {
        hyper = this.params.data.hypervisor
      }
      return hyper
    },
    hasMemMetric () {
      if (this.params.alertType === 'guest') {
        return this.hypervisor === HYPERVISORS_MAP.esxi.key
      }
      return true // 宿主机报警有内存指标
    },
    metricOpts () {
      let opts = [metricItems['vm_cpu.usage_active'], metricItems['vm_netio.bps_recv'], metricItems['vm_netio.bps_sent'], metricItems['vm_diskio.read_bps'], metricItems['vm_diskio.write_bps']]
      if (this.hasMemMetric) {
        opts.splice(1, 0, metricItems['vm_mem.used_percent'])
      }
      return opts
    },
  },
  methods: {
    async handleConfirm () {
      this.loading = true
      try {
        const values = await this.$refs.nodeAlertFormRef.validateForm()
        this.loading = false
        const recipients = values.recipients.join(',')
        const data = {
          metric: values.metric,
          window: `${values.window}m`,
          comparator: values.comparator,
          threshold: values.threshold + '',
          level: values.level,
          channel: values.channel,
          node_id: this.params.nodeId,
          type: this.params.alertType,
          recipients,
        }
        const id = this.params.data[0].id
        if (this.params.list) {
          await this.params.list.onManager('patch', { id, managerArgs: { data } })
        } else {
          await this.params.alertManager.patch({
            id,
            data,
          })
        }
        this.cancelDialog()
        this.$message.success('操作成功')
      } catch (error) {
        this.loading = false
        throw error
      }
    },
  },
}
</script>
