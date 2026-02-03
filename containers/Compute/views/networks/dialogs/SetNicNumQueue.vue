<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{ $t('compute.set_nic_num_queue') }}</div>
    <div slot="body">
      <dialog-selected-tips :name="$t('compute.text_193')" :count="params.data.length" :action="$t('compute.set_nic_num_queue')" />
      <dialog-table :data="params.data" :columns="params.columns.filter(item => ['index', 'ifname', 'mac_addr', 'num_queues'].includes(item.field))" />
      <a-form-model
        ref="form"
        class="mt-3"
        :model="form"
        :rules="rules"
        v-bind="formItemLayout">
        <a-form-model-item :label="$t('compute.num_queues')" prop="num_queues">
          <a-input-number
            v-model="form.num_queues"
            :min="1"
            style="width: 100%" />
        </a-form-model-item>
      </a-form-model>
    </div>
    <div slot="footer">
      <a-button type="primary" @click="handleConfirm" :loading="loading">{{ $t('dialog.ok') }}</a-button>
      <a-button @click="cancelDialog">{{ $t('dialog.cancel') }}</a-button>
    </div>
  </base-dialog>
</template>

<script>
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'VmSetNicNumQueueDialog',
  mixins: [DialogMixin, WindowsMixin],
  data () {
    const currentNic = this.params.data[0] || {}
    return {
      loading: false,
      form: {
        num_queues: currentNic.num_queues || 1,
      },
      formItemLayout: {
        wrapperCol: {
          span: 20,
        },
        labelCol: {
          span: 4,
        },
      },
    }
  },
  computed: {
    currentNic () {
      return this.params.data[0] || {}
    },
    rules () {
      const nic = this.currentNic
      return {
        num_queues: [
          { required: true, message: this.$t('compute.set_nic_num_queue.validate_error', ['']), trigger: 'blur' },
          {
            validator: (rule, value, callback) => {
              if (!value || value < 1 || !Number.isInteger(value)) {
                const nicName = nic.ifname || nic.name || String(nic.index)
                callback(new Error(this.$t('compute.set_nic_num_queue.validate_error', [nicName])))
              } else {
                callback()
              }
            },
            trigger: 'blur',
          },
        ],
      }
    },
  },
  methods: {
    async updateNicNumQueues (values) {
      const serverId = this.params.server.id
      const nic = this.currentNic
      const originalNumQueues = nic.num_queues || 1

      // 如果没有变化，直接返回
      if (values.num_queues === originalNumQueues) {
        return { success: true, message: this.$t('compute.set_nic_num_queue.no_changes') }
      }

      return new this.$Manager('servers').performAction({
        id: serverId,
        action: 'set-network-num-queues',
        data: {
          num_queues: values.num_queues,
          mac: nic.mac_addr || nic.mac,
        },
      })
    },
    async handleConfirm () {
      this.loading = true
      try {
        await this.$refs.form.validate()
        const values = this.form
        await this.updateNicNumQueues(values)
        this.params.refresh()
        this.cancelDialog()
        this.$message.success(this.$t('compute.text_423'))
      } catch (error) {
        if (error.errorFields) {
          // 表单验证错误
          return
        }
        this.$message.error(error.message || this.$t('compute.set_nic_num_queue.update_failed'))
      } finally {
        this.loading = false
      }
    },
  },
}
</script>
