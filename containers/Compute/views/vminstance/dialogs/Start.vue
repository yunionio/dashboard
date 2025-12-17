<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{action}}</div>
    <div slot="body">
      <dialog-selected-tips :name="params.name || $t('dictionary.server')" :count="dataList.length" :action="action" />
      <dialog-table :data="dataList" :columns="columns" />
      <a-form
        :form="form.fc">
        <a-form-item :label="$t('compute.text_1041')" v-bind="formItemLayout" v-if="isOpenWorkflow">
          <a-input v-decorator="decorators.reason" :placeholder="$t('compute.text_1105')" />
        </a-form-item>
        <a-form-item class="mb-0" v-show="canAutoPrepaid">
          <a-checkbox
          v-model="form.fd.auto_prepaid"
          @change="autoPrepaidChange">
            {{$t('compute.change_to_prepaid')}}
          </a-checkbox>
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
  name: 'VmStartDialog',
  mixins: [DialogMixin, WindowsMixin, WorkflowMixin],
  data () {
    const { type, formData = {} } = this.params
    return {
      loading: false,
      type,
      action: type === 'modifyWorkflow' ? this.$t('common.modify_workflow') + `(${this.$t('compute.text_272')})` : this.$t('compute.text_272'),
      form: {
        fc: this.$form.createForm(this),
        fd: {
          auto_prepaid: formData.auto_prepaid || false,
        },
      },
      decorators: {
        reason: [
          'reason',
          {
            initialValue: formData.reason || '',
          },
        ],
        auto_prepaid: [
          'stopPaying',
          {
            valuePropName: 'checked',
            initialValue: formData.auto_prepaid || false,
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
    // 腾讯云、阿里云、火山云、金山云的按量付费机器，关机可停止付费
    // 腾讯云、阿里云包年包月机器，关机停止付费会转为按量付费机器
    canAutoPrepaid () {
      return this.dataList.every(item => {
        return ['qcloud', 'aliyun', 'ksyun'].includes(item.brand.toLocaleLowerCase())
      }) && this.dataList.some(item => {
        return item.billing_type === 'postpaid'
      })
    },
    isOpenWorkflow () {
      return this.checkWorkflowEnabled(this.WORKFLOW_TYPES.APPLY_SERVER_START)
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
    async doShutDownSubmit () {
      const data = {}
      if (this.form.fd.auto_prepaid) {
        data.auto_prepaid = true
      }
      const ids = this.dataList.map(item => item.id)
      return this.params.onManager('batchPerformAction', {
        id: ids,
        steadyStatus: 'running',
        managerArgs: {
          action: 'start',
          data,
        },
      })
    },
    async handleConfirm () {
      this.loading = true
      try {
        if (this.isOpenWorkflow) {
          if (this.dataList.length > BATCH_OPERATE_SERVERS_MAX) {
            this.$message.error(this.$t('compute.workflow.operate_servers_check.message', [this.$t('compute.text_273'), BATCH_OPERATE_SERVERS_MAX]))
            this.loading = false
            return
          }
          const projects = new Set(this.dataList.map(item => item.tenant_id))
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
    autoPrepaidChange (val) {
      const { checked } = val.target
      this.form.fd.auto_prepaid = checked
    },
    async handleShutDownByWorkflowSubmit () {
      const ids = this.dataList.map(item => item.id)
      const values = await this.form.fc.validateFields()
      const params = {}
      if (this.form.fd.auto_prepaid) params.auto_prepaid = true
      const variables = {
        project: this.dataList[0].tenant_id,
        project_domain: this.dataList[0].domain_id,
        process_definition_key: this.WORKFLOW_TYPES.APPLY_SERVER_START,
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
      this.$message.success(this.$t('common.worflow_tip', [this.$t('compute.text_272')]))
      this.$router.push('/workflow')
    },
  },
}
</script>
