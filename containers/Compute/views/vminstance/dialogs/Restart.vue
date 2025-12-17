<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{action}}</div>
    <div slot="body">
      <a-alert class="mb-2" type="warning">
        <template v-slot:message>
          <div>{{$t('compute.text_1234')}}</div>
        </template>
      </a-alert>
      <dialog-selected-tips :name="params.name || $t('dictionary.server')" :count="dataList.length" :action="action" />
      <vxe-grid class="mb-2" :data="dataList" :columns="columns" />
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
import { getNameDescriptionTableColumn, getStatusTableColumn } from '@/utils/common/tableColumn'

export default {
  name: 'VmRestartDialog',
  mixins: [DialogMixin, WindowsMixin, WorkflowMixin],
  data () {
    const { type, formData = {} } = this.params
    return {
      loading: false,
      action: type === 'modifyWorkflow' ? this.$t('common.modify_workflow') + `(${this.$t('compute.text_274')})` : this.$t('compute.text_274'),
      type,
      form: {
        fc: this.$form.createForm(this),
      },
      decorators: {
        reason: [
          'reason',
          {
            initialValue: formData.reason || '',
          },
        ],
        autoStart: [
          'autoStart',
          {
            initialValue: formData.is_force || false,
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
      dataList: [],
    }
  },
  computed: {
    ...mapGetters(['userInfo']),
    columns () {
      if (this.type === 'modifyWorkflow') {
        return [getNameDescriptionTableColumn(), getStatusTableColumn({ statusModule: 'server' })]
      }
      const showFields = ['name', 'ip', 'instance_type']
      return this.params.columns.filter((item) => { return showFields.includes(item.field) })
    },
    isOpenWorkflow () {
      return this.checkWorkflowEnabled(this.WORKFLOW_TYPES.APPLY_SERVER_RESTART)
    },
  },
  created () {
    this.initData()
  },
  methods: {
    async initData () {
      if (this.type === 'modifyWorkflow' && this.params.ids) {
        const list = await new this.$Manager('servers', 'v2').batchGet({
          id: this.params.ids,
        })
        this.dataList = list.data?.data || []
      } else {
        this.dataList = this.params.data || []
      }
    },
    async doRestartSubmit (values) {
      const ids = this.dataList.map(item => item.id)
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
          if (this.dataList.length > BATCH_OPERATE_SERVERS_MAX) {
            this.$message.error(this.$t('compute.workflow.operate_servers_check.message', [this.$t('compute.text_274'), BATCH_OPERATE_SERVERS_MAX]))
            this.loading = false
            return
          }
          const projects = new Set(this.dataList.map(item => item.tenant_id))
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
      const ids = this.dataList.map(item => item.id)
      const params = {
        is_force: values.autoStart,
      }
      const variables = {
        project: this.dataList[0].tenant_id,
        project_domain: this.dataList[0].domain_id,
        process_definition_key: this.WORKFLOW_TYPES.APPLY_SERVER_RESTART,
        initiator: this.userInfo.id,
        ids: ids.join(','),
        description: values.reason,
        paramter: JSON.stringify(params),
      }
      if (this.type === 'modifyWorkflow') {
        await this.updateWorkflow(variables, this.params.workflow)
        this.params.success && this.params.success()
      } else {
        await this.createWorkflow(variables)
      }
      this.$message.success(this.$t('common.worflow_tip', [this.$t('compute.text_274')]))
      this.$router.push('/workflow')
    },
  },
}
</script>
