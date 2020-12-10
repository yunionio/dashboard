<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{$t('compute.text_1185')}}</div>
    <div slot="body">
      <dialog-selected-tips :name="$t('dictionary.server')" :count="params.data.length" :action="$t('compute.text_1185')" />
      <dialog-table :data="params.data" :columns="params.columns.slice(0, 3)" />
      <a-form :form="form.fc" hideRequiredMark v-bind="formItemLayout">
        <a-form-item :label="$t('compute.text_1186')">
          <a-tooltip placement="top" :title="$t('compute.text_1338', [[10000]])">
            <a-input-number
              v-decorator="decorators.bandwidth"
              :parser="getParser"
              :min="0"
              :max="10000" />
            Mbps
          </a-tooltip>
        </a-form-item>
        <a-form-item :label="$t('compute.text_1041')" v-if="isOpenWorkflow">
          <a-input v-decorator="decorators.reason" :placeholder="$t('compute.text_1105')" />
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

export default {
  name: 'VmChangeBandwidthDialog',
  mixins: [DialogMixin, WindowsMixin, WorkflowMixin],
  data () {
    return {
      loading: false,
      form: {
        fc: this.$form.createForm(this),
      },
      decorators: {
        bandwidth: [
          'bandwidth',
          {
            initialValue: this.params.data[0].bw_limit || 0,
            rules: [
              { required: true, message: this.$t('compute.text_1188') },
            ],
          },
        ],
        reason: [
          'reason',
          {
            initialValue: '',
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
    ...mapGetters(['isAdminMode', 'scope', 'userInfo']),
    selectedItems () {
      return this.params.data
    },
    isOpenWorkflow () {
      return this.checkWorkflowEnabled(this.WORKFLOW_TYPES.APPLY_SERVER_CHANGECONFIG)
    },
  },
  methods: {
    async doChangeBandwidth (values) {
      const manager = new this.$Manager('servers')
      const ids = this.params.data.map(item => item.guest_id)
      const data = {
        bandwidth: values.bandwidth,
        index: this.params.data[0].index,
      }
      return manager.batchPerformAction({
        ids,
        action: 'change-bandwidth',
        data,
      })
    },
    async doChangeBandwidthByWorkflow (values) {
      const params = {
        bandwidth: values.bandwidth,
        index: this.params.data[0].index,
      }
      const resData = this.params.resData
      const serverConf = resData.map((item) => {
        return {
          name: item.name,
          project: item.tenant,
          before: {
            bw_limit: this.params.data[0].bw_limit,
          },
          after: {
            bw_limit: values.bandwidth,
          },
        }
      })
      params.project_id = this.userInfo.projectId
      params.domain = this.userInfo.projectDomainId
      const variables = {
        change_type: 'change-bandwidth',
        project: resData[0].tenant_id,
        project_domain: resData[0].domain_id,
        process_definition_key: this.WORKFLOW_TYPES.APPLY_SERVER_CHANGECONFIG,
        initiator: this.userInfo.id,
        'change-bandwidth-paramter': JSON.stringify(params),
        ids: resData[0].id,
        serverConf: JSON.stringify(serverConf),
        description: values.reason,
      }
      await this.createWorkflow(variables)
      this.$message.success(this.$t('compute.text_1109'))
      this.$router.push('/workflow')
    },
    async handleConfirm () {
      this.loading = true
      try {
        const values = await this.form.fc.validateFields()
        if (this.isOpenWorkflow) {
          await this.doChangeBandwidthByWorkflow(values)
        } else {
          await this.doChangeBandwidth(values)
        }
        this.params.refresh()
        this.cancelDialog()
        this.$message.success(this.$t('compute.text_423'))
      } finally {
        this.loading = false
      }
    },
    getParser (val) {
      if (isNaN(val)) {
        return 0
      }
      return Math.round(val)
    },
  },
}
</script>
