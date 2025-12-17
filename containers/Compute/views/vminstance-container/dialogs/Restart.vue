<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{action}}</div>
    <div slot="body">
      <a-alert class="mb-2" type="warning">
        <template v-slot:message>
          <div>{{$t('compute.text_1234')}}</div>
        </template>
      </a-alert>
      <dialog-selected-tips :name="$t('compute.vminstance-container')" :count="params.data.length" :action="action" />
      <vxe-grid class="mb-2" :data="params.data" :columns="columns" />
      <a-form :form="form.fc" hideRequiredMark>
        <a-form-item :label="$t('compute.text_1041')" v-bind="formItemLayout" v-if="isOpenWorkflow">
          <a-input v-decorator="decorators.reason" :placeholder="$t('compute.text_1105')" />
        </a-form-item>
        <a-form-item :label="$t('compute.text_1235')" v-bind="formItemLayout">
          <a-switch v-decorator="decorators.autoStart" />
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
  name: 'VmContainerRestartDialog',
  mixins: [DialogMixin, WindowsMixin, WorkflowMixin],
  data () {
    return {
      loading: false,
      action: this.$t('compute.text_274'),
      form: {
        fc: this.$form.createForm(this),
      },
      decorators: {
        reason: [
          'reason',
          {
            initialValue: '',
          },
        ],
        autoStart: [
          'autoStart',
          {
            initialValue: false,
            valuePropName: 'checked',
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
    isOpenWorkflow () {
      return this.checkWorkflowEnabled(this.WORKFLOW_TYPES.APPLY_SERVER_RESTART)
    },
  },
  methods: {
    async doRestartSubmit (values) {
      const ids = this.params.data.map(item => item.id)
      return this.params.onManager('batchPerformAction', {
        id: ids,
        steadyStatus: 'ready',
        managerArgs: {
          action: 'restart',
          data: {
            is_force: values.autoStart,
          },
        },
      })
    },
    async handleConfirm () {
      this.loading = true
      try {
        const values = await this.form.fc.validateFields()
        if (this.isOpenWorkflow) {
          if (this.params.data.length > BATCH_OPERATE_SERVERS_MAX) {
            this.$message.error(this.$t('compute.workflow.operate_servers_check.message', [this.$t('compute.text_274'), BATCH_OPERATE_SERVERS_MAX]))
            this.loading = false
            return
          }
          const projects = new Set(this.params.data.map(item => item.tenant_id))
          if (projects.size > 1) {
            this.$message.error(this.$t('compute.text_1348'))
            this.loading = false
            return
          }
          await this.handleRestartByWorkflowSubmit(values)
        } else {
          await this.doRestartSubmit(values)
        }
        this.loading = false
        this.cancelDialog()
      } catch (error) {
        this.loading = false
      }
    },
    async handleRestartByWorkflowSubmit (values) {
      const ids = this.params.data.map(item => item.id)
      const params = {
        is_force: values.autoStart,
      }
      const variables = {
        project: this.params.data[0].tenant_id,
        project_domain: this.params.data[0].domain_id,
        process_definition_key: this.WORKFLOW_TYPES.APPLY_SERVER_RESTART,
        initiator: this.userInfo.id,
        ids: ids.join(','),
        description: values.reason,
        paramter: JSON.stringify(params),
      }
      await this.createWorkflow(variables)
      this.$message.success(this.$t('common.worflow_tip', [this.$t('compute.text_274')]))
      this.$router.push('/workflow')
    },
  },
}
</script>
