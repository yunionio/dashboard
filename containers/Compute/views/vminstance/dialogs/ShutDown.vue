<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{action}}</div>
    <div slot="body">
      <a-alert class="mb-2" type="warning">
        <template v-slot:message>
          <div>{{$t('compute.text_1234_1')}}</div>
        </template>
      </a-alert>
      <dialog-selected-tips :name="params.name || $t('dictionary.server')" :count="dataList.length" :action="action" />
      <dialog-table :data="dataList" :columns="columns" />
      <a-form
        :form="form.fc">
        <a-form-item :label="$t('compute.text_1041')" v-bind="formItemLayout" v-if="isOpenWorkflow">
          <a-input v-decorator="decorators.reason" :placeholder="$t('compute.text_1105')" />
        </a-form-item>
        <a-form-item class="mb-0" v-show="canStopPaying">
          <a-checkbox
          v-model="form.fd.stopPaying"
          @change="stopPayingChange">
            {{$t('compute.shutdown_stop_paying')}}
          </a-checkbox>
          <help-tooltip name="shutdownStopCharging" />
        </a-form-item>
        <a-form-item v-if="isSupportForce" :label="$t('compute.force_shutdown')" v-bind="formItemLayout">
          <a-switch v-model="form.fd.is_force" @change="isForceChange" />
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
import { HYPERVISORS_MAP } from '@/constants'
import { getNameDescriptionTableColumn, getStatusTableColumn } from '@/utils/common/tableColumn'

export default {
  name: 'VmShutDownDialog',
  mixins: [DialogMixin, WindowsMixin, WorkflowMixin],
  data () {
    const { type, formData = {} } = this.params
    return {
      loading: false,
      action: type === 'modifyWorkflow' ? this.$t('common.modify_workflow') + `(${this.$t('compute.text_273')})` : this.$t('compute.text_273'),
      form: {
        fc: this.$form.createForm(this),
        fd: {
          stopPaying: formData.stop_charging || false,
          is_force: formData.is_force || false,
        },
      },
      type,
      decorators: {
        reason: [
          'reason',
          {
            initialValue: formData.reason || '',
          },
        ],
        stopPaying: [
          'stopPaying',
          {
            valuePropName: 'checked',
            initialValue: formData.stop_charging || false,
          },
        ],
        is_force: [
          'is_force',
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
    // 腾讯云、阿里云、火山云、金山云的按量付费机器，关机可停止付费
    // 腾讯云、阿里云包年包月机器，关机停止付费会转为按量付费机器
    canStopPaying () {
      return this.dataList.length && this.dataList.every(item => {
        return ['qcloud', 'aliyun', 'ksyun'].includes(item.brand.toLocaleLowerCase()) || (['volcengine'].includes(item.brand.toLocaleLowerCase()) && item.billing_type === 'postpaid')
      })
    },
    isOpenWorkflow () {
      return this.checkWorkflowEnabled(this.WORKFLOW_TYPES.APPLY_SERVER_STOP)
    },
    isSupportForce () {
      return this.dataList.length && this.dataList.every(item => {
        return [
          HYPERVISORS_MAP.kvm.hypervisor,
          HYPERVISORS_MAP.pod.hypervisor,
          HYPERVISORS_MAP.esxi.hypervisor,
          HYPERVISORS_MAP.huawei.hypervisor,
          HYPERVISORS_MAP.aliyun.hypervisor,
          HYPERVISORS_MAP.nutanix.hypervisor,
          HYPERVISORS_MAP.volcengine.hypervisor,
          HYPERVISORS_MAP.ctyun.hypervisor,
          HYPERVISORS_MAP.hcso.hypervisor,
          HYPERVISORS_MAP.aws.hypervisor,
          HYPERVISORS_MAP.zstack.hypervisor,
          HYPERVISORS_MAP.qcloud.hypervisor,
          HYPERVISORS_MAP.sangfor?.hypervisor,
          HYPERVISORS_MAP.uis?.hypervisor,
          HYPERVISORS_MAP.ksyun?.hypervisor,
        ].includes(item.hypervisor)
      })
    },
  },
  async created () {
    if (this.type === 'modifyWorkflow' && this.params.ids) {
      const list = await new this.$Manager('servers', 'v2').batchGet({
        id: this.params.ids,
      })
      this.dataList = list.data?.data || []
      this.$nextTick(() => {
        this.form.fc.setFieldsValue(this.params.formData || {})
      })
    } else {
      this.dataList = this.params.data || []
    }
  },
  methods: {
    async doShutDownSubmit () {
      const data = {
        is_force: this.form.fd.is_force,
      }
      if (this.form.fd.stopPaying) {
        data.stop_charging = true
      }
      const ids = this.dataList.map(item => item.id)
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
    isForceChange (val) {
      this.form.fd.is_force = val
    },
    stopPayingChange (val) {
      const { checked } = val.target
      this.form.fd.stopPaying = checked
    },
    async handleShutDownByWorkflowSubmit () {
      const ids = this.dataList.map(item => item.id)
      const values = await this.form.fc.validateFields()
      const params = {
        stop_charging: this.form.fd.stopPaying,
        is_force: this.form.fd.is_force,
      }
      const variables = {
        project: this.dataList[0].tenant_id,
        project_domain: this.dataList[0].domain_id,
        process_definition_key: this.WORKFLOW_TYPES.APPLY_SERVER_STOP,
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
      this.$message.success(this.$t('common.worflow_tip', [this.$t('compute.text_273')]))
      this.$router.push('/workflow')
    },
  },
}
</script>
