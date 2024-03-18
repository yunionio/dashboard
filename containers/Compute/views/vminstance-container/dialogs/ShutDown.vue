<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{action}}</div>
    <div slot="body">
      <dialog-selected-tips :name="$t('dictionary.server')" :count="params.data.length" :action="action" />
      <dialog-table :data="params.data" :columns="columns" />
      <a-form
        :form="form.fc">
        <a-form-item :label="$t('compute.text_1041')" v-bind="formItemLayout" v-if="isOpenWorkflow">
          <a-input v-decorator="decorators.reason" :placeholder="$t('compute.text_1105')" />
        </a-form-item>
        <a-form-item class="mb-0" v-show="canStopPaying">
          <a-checkbox
          :checked="form.fd.stopPaying"
          @change="stopPayingChange">
            {{$t('compute.shutdown_stop_paying')}}
          </a-checkbox>
          <help-tooltip name="shutdownStopCharging" />
        </a-form-item>
      </a-form>
    </div>
    <div slot="footer">
      <a-button type="primary" @click="handleConfirm" :loading="loading">{{ $t('dialog.ok') }}</a-button>
      <a-button @click="cancelDialog">{{ $t('dialog.cancel') }}</a-button>
    </div>
  </base-dialog>
</template>

<script>
import { mapGetters } from 'vuex'
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'
import WorkflowMixin from '@/mixins/workflow'
import { BATCH_OPERATE_SERVERS_MAX } from '@/constants/workflow'

export default {
  name: 'VmShutDownDialog',
  mixins: [DialogMixin, WindowsMixin, WorkflowMixin],
  data () {
    return {
      loading: false,
      action: this.$t('compute.text_273'),
      form: {
        fc: this.$form.createForm(this),
        fd: {
          stopPaying: false,
        },
      },
      decorators: {
        reason: [
          'reason',
          {
            initialValue: '',
          },
        ],
        stopPaying: [
          'stopPaying',
          {
            valuePropName: 'checked',
            initialValue: false,
          },
        ],
      },
      formItemLayout: {
        wrapperCol: {
          span: 21,
        },
        labelCol: {
          span: 3,
        },
      },
    }
  },
  computed: {
    ...mapGetters(['userInfo']),
    columns () {
      const showFields = ['name', 'ip', 'instance_type']
      return this.params.columns.filter((item) => { return showFields.includes(item.field) })
    },
    // 腾讯云、阿里云的按量付费机器，关机可停止付费
    canStopPaying () {
      const canStopPayingBrands = ['qcloud', 'aliyun']
      return this.params.data.every(item => {
        return canStopPayingBrands.includes(item.brand.toLocaleLowerCase()) && item.billing_type === 'postpaid'
      })
    },
    isOpenWorkflow () {
      return this.checkWorkflowEnabled(this.WORKFLOW_TYPES.APPLY_SERVER_STOP)
    },
  },
  methods: {
    async doShutDownSubmit () {
      const data = {}
      if (this.form.fd.stopPaying) {
        data.stop_charging = true
      }
      const ids = this.params.data.map(item => item.id)
      return this.params.onManager('batchPerformAction', {
        id: ids,
        steadyStatus: 'ready',
        managerArgs: {
          action: 'stop',
          data,
        },
      })
    },
    async handleConfirm () {
      this.loading = true
      try {
        if (this.isOpenWorkflow) {
          if (this.params.data.length > BATCH_OPERATE_SERVERS_MAX) {
            this.$message.error(this.$t('compute.workflow.operate_servers_check.message', [this.$t('compute.text_273'), BATCH_OPERATE_SERVERS_MAX]))
            this.loading = false
            return
          }
          const projects = new Set(this.params.data.map(item => item.tenant_id))
          if (projects.size > 1) {
            this.$message.error(this.$t('compute.text_1348'))
            this.loading = false
            return
          }
          await this.handleShutDownByWorkflowSubmit()
        } else {
          await this.doShutDownSubmit()
        }
        this.loading = false
        this.cancelDialog()
      } catch (error) {
        this.loading = false
        throw error
      }
    },
    stopPayingChange (val) {
      const { checked } = val.target
      this.form.fd.stopPaying = checked
    },
    async handleShutDownByWorkflowSubmit () {
      const ids = this.params.data.map(item => item.id)
      const values = await this.form.fc.validateFields()
      const params = {
        stop_charging: values.stopPaying,
      }
      const variables = {
        project: this.params.data[0].tenant_id,
        project_domain: this.params.data[0].domain_id,
        process_definition_key: this.WORKFLOW_TYPES.APPLY_SERVER_STOP,
        initiator: this.userInfo.id,
        ids: ids.join(','),
        description: values.reason,
        paramter: JSON.stringify(params),
      }
      await this.createWorkflow(variables)
      this.$message.success(this.$t('compute.text_1214'))
      this.$router.push('/workflow')
    },
  },
}
</script>
