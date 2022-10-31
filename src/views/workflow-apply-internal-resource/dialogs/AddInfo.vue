<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{$t(`wz_workflow_form.resourceTypes.${params.resourceType}`)}}</div>
    <div slot="body" style="max-height:calc(100vh - 320px);overflow-y:auto">
      <a-form-model
        ref="addForm"
        class="mt-3"
        :model="form"
        :rules="rules">
        <template v-if="params.resourceType === 'ecs'">
          <a-row>
            <workflow-label field="server_name" />
            <a-form-model-item prop="server_name">
              <a-input v-model="form.server_name" :placeholder="getPlaceholder('server_name')" />
            </a-form-model-item>
          </a-row>
          <a-row>
            <workflow-label field="cpu" />
            <a-form-model-item prop="cpu">
              <base-select v-model="form.cpu" :options="ecsOptions.cpu" :placeholder="getPlaceholder('cpu')" />
            </a-form-model-item>
          </a-row>
          <a-row>
            <workflow-label field="mem" />
            <a-form-model-item prop="mem">
              <base-select v-model="form.mem" :options="ecsOptions.mem" :placeholder="getPlaceholder('mem')" />
            </a-form-model-item>
          </a-row>
          <a-row>
            <workflow-label field="data_disk" />
            <a-form-model-item prop="data_disk">
              <base-select v-model="form.data_disk" :options="ecsOptions.data_disk" :placeholder="getPlaceholder('data_disk')" />
            </a-form-model-item>
          </a-row>
          <a-row>
            <workflow-label field="os" />
            <a-form-model-item prop="os">
              <base-select v-model="form.os" :options="ecsOptions.os" :placeholder="getPlaceholder('os')" />
            </a-form-model-item>
          </a-row>
          <a-row>
            <workflow-label field="count" />
            <a-form-model-item prop="count">
              <a-input-number :min="1" class="w-100" v-model="form.count" :placeholder="getPlaceholder('count')" />
            </a-form-model-item>
          </a-row>
          <a-row>
            <workflow-label field="bandwidth" />
            <a-form-model-item prop="bandwidth">
              <base-select v-model="form.bandwidth" :options="ecsOptions.bandwidth" :placeholder="getPlaceholder('bandwidth')" />
            </a-form-model-item>
          </a-row>
          <a-row>
            <workflow-label field="use_to" />
            <a-form-model-item prop="use_to">
              <a-input v-model="form.use_to" :placeholder="getPlaceholder('use_to')" />
            </a-form-model-item>
          </a-row>
          <a-row>
            <workflow-label field="comment" />
            <a-form-model-item prop="comment">
              <a-input v-model="form.comment" :placeholder="getPlaceholder('comment')" />
            </a-form-model-item>
          </a-row>
        </template>
        <template v-if="params.resourceType === 'rds'">
          <a-row>
            <workflow-label field="db_name" />
            <a-form-model-item prop="db_name">
              <a-input v-model="form.db_name" :placeholder="getPlaceholder('db_name')" />
            </a-form-model-item>
          </a-row>
          <a-row>
            <workflow-label field="db_type" />
            <a-form-model-item prop="db_type">
              <base-select v-model="form.db_type" :options="rdsOptions.db_type" :placeholder="getPlaceholder('db_type')" />
            </a-form-model-item>
          </a-row>
          <a-row>
            <workflow-label field="max_connects" />
            <a-form-model-item prop="max_connects">
              <base-select v-model="form.max_connects" :options="rdsOptions.max_connects" :placeholder="getPlaceholder('max_connects')" />
            </a-form-model-item>
          </a-row>
          <a-row>
            <workflow-label field="data_disk" />
            <a-form-model-item prop="data_disk">
              <a-input v-model="form.data_disk" :placeholder="getPlaceholder('data_disk')" />
            </a-form-model-item>
          </a-row>
          <a-row>
            <workflow-label field="count" />
            <a-form-model-item prop="count">
              <a-input-number :min="1" class="w-100" v-model="form.count" :placeholder="getPlaceholder('count')" />
            </a-form-model-item>
          </a-row>
          <a-row>
            <workflow-label field="comment" />
            <a-form-model-item prop="comment">
              <a-input v-model="form.comment" :placeholder="getPlaceholder('comment')" />
            </a-form-model-item>
          </a-row>
        </template>
        <template v-if="params.resourceType === 'server'">
          <a-row>
            <workflow-label field="oss_storage_count" />
            <a-form-model-item prop="oss_storage_count">
              <a-input-number :min="1" class="w-100" v-model="form.oss_storage_count" :placeholder="getPlaceholder('oss_storage_count')" />
            </a-form-model-item>
          </a-row>
          <a-row>
            <workflow-label field="oss_storage_comment" />
            <a-form-model-item prop="oss_storage_comment">
              <a-input v-model="form.oss_storage_comment" :placeholder="getPlaceholder('oss_storage_comment')" />
            </a-form-model-item>
          </a-row>
          <a-row>
            <workflow-label field="nas_storage_count" />
            <a-form-model-item prop="nas_storage_count">
              <a-input-number :min="1" class="w-100" v-model="form.nas_storage_count" :placeholder="getPlaceholder('nas_storage_count')" />
            </a-form-model-item>
          </a-row>
          <a-row>
            <workflow-label field="nas_storage_comment" />
            <a-form-model-item prop="nas_storage_comment">
              <a-input v-model="form.nas_storage_comment" :placeholder="getPlaceholder('nas_storage_comment')" />
            </a-form-model-item>
          </a-row>
          <a-row>
            <workflow-label field="lb_count" />
            <a-form-model-item prop="lb_count">
              <a-input-number :min="1" class="w-100" v-model="form.lb_count" :placeholder="getPlaceholder('lb_count')" />
            </a-form-model-item>
          </a-row>
          <a-row>
            <workflow-label field="backup_count" />
            <a-form-model-item prop="backup_count">
              <a-input-number :min="1" class="w-100" v-model="form.backup_count" :placeholder="getPlaceholder('backup_count')" />
            </a-form-model-item>
          </a-row>
          <a-row>
            <workflow-label field="backup_comment" />
            <a-form-model-item prop="backup_comment">
              <a-input v-model="form.backup_comment" :placeholder="getPlaceholder('backup_comment')" />
            </a-form-model-item>
          </a-row>
          <a-row>
            <workflow-label field="data_exchange_service_client" />
            <a-form-model-item prop="data_exchange_service_client">
              <a-input v-model="form.data_exchange_service_client" :placeholder="getPlaceholder('data_exchange_service_client')" />
            </a-form-model-item>
          </a-row>
          <a-row>
            <workflow-label field="data_exchange_service_comment" />
            <a-form-model-item prop="data_exchange_service_comment">
              <a-input v-model="form.data_exchange_service_comment" :placeholder="getPlaceholder('data_exchange_service_comment')" />
            </a-form-model-item>
          </a-row>
        </template>
        <template v-if="params.resourceType === 'basicSecurityServices'">
          <a-row>
            <workflow-label field="active_vulnerability_scanning" />
            <a-form-model-item prop="active_vulnerability_scanning">
              <a-input-number :min="1" class="w-100" v-model="form.active_vulnerability_scanning" :placeholder="getPlaceholder('active_vulnerability_scanning')" />
            </a-form-model-item>
          </a-row>
          <a-row>
            <workflow-label field="intrusion_prevention" />
            <a-form-model-item prop="intrusion_prevention">
              <a-input-number :min="1" class="w-100" v-model="form.intrusion_prevention" :placeholder="getPlaceholder('intrusion_prevention')" />
            </a-form-model-item>
          </a-row>
          <a-row>
            <workflow-label field="anti_ddos" />
            <a-form-model-item prop="anti_ddos">
              <a-input-number :min="1" class="w-100" v-model="form.anti_ddos" :placeholder="getPlaceholder('anti_ddos')" />
            </a-form-model-item>
          </a-row>
        </template>
        <template v-if="params.resourceType === 'cloudSecurityTable'">
          <a-row>
            <workflow-label field="host_protection" />
            <a-form-model-item prop="host_protection">
              <a-input-number :min="1" class="w-100" v-model="form.host_protection" :placeholder="getPlaceholder('host_protection')" />
            </a-form-model-item>
          </a-row>
          <a-row>
            <workflow-label field="website_monitoring" />
            <a-form-model-item prop="website_monitoring">
              <a-input-number :min="1" class="w-100" v-model="form.website_monitoring" :placeholder="getPlaceholder('website_monitoring')" />
            </a-form-model-item>
          </a-row>
          <a-row>
            <workflow-label field="website_vulnerability_scanning" />
            <a-form-model-item prop="website_vulnerability_scanning">
              <a-input-number :min="1" class="w-100" v-model="form.website_vulnerability_scanning" :placeholder="getPlaceholder('website_vulnerability_scanning')" />
            </a-form-model-item>
          </a-row>
          <a-row>
            <workflow-label field="webpage_tamper_proof" />
            <a-form-model-item prop="webpage_tamper_proof">
              <a-input-number :min="1" class="w-100" v-model="form.webpage_tamper_proof" :placeholder="getPlaceholder('webpage_tamper_proof')" />
            </a-form-model-item>
          </a-row>
          <a-row>
            <workflow-label field="web_application_firewall" />
            <a-form-model-item prop="web_application_firewall">
              <a-input v-model="form.web_application_firewall" :placeholder="getPlaceholder('web_application_firewall')" />
            </a-form-model-item>
          </a-row>
          <a-row>
            <workflow-label field="virus_protection" />
            <a-form-model-item prop="virus_protection">
              <a-input v-model="form.virus_protection" :placeholder="getPlaceholder('virus_protection')" />
            </a-form-model-item>
          </a-row>
          <a-row>
            <workflow-label field="terminal_decection_res_system" />
            <a-form-model-item prop="terminal_decection_res_system">
              <a-input v-model="form.terminal_decection_res_system" :placeholder="getPlaceholder('terminal_decection_res_system')" />
            </a-form-model-item>
          </a-row>
          <a-row>
            <workflow-label field="host_risk_scanning" />
            <a-form-model-item prop="host_risk_scanning">
              <a-input v-model="form.host_risk_scanning" :placeholder="getPlaceholder('host_risk_scanning')" />
            </a-form-model-item>
          </a-row>
          <a-row>
            <workflow-label field="firewall" />
            <a-form-model-item prop="firewall">
              <a-input v-model="form.firewall" :placeholder="getPlaceholder('firewall')" />
            </a-form-model-item>
          </a-row>
          <a-row>
            <workflow-label field="intrusion_prevention" />
            <a-form-model-item prop="intrusion_prevention">
              <a-input v-model="form.intrusion_prevention" :placeholder="getPlaceholder('intrusion_prevention')" />
            </a-form-model-item>
          </a-row>
          <a-row>
            <workflow-label field="intrusion_cetection" />
            <a-form-model-item prop="intrusion_cetection">
              <a-input v-model="form.intrusion_cetection" :placeholder="getPlaceholder('intrusion_cetection')" />
            </a-form-model-item>
          </a-row>
          <a-row>
            <workflow-label field="network_audit" />
            <a-form-model-item prop="network_audit">
              <a-input v-model="form.network_audit" :placeholder="getPlaceholder('network_audit')" />
            </a-form-model-item>
          </a-row>
          <a-row>
            <workflow-label field="fortress_machine" />
            <a-form-model-item prop="fortress_machine">
              <a-input v-model="form.fortress_machine" :placeholder="getPlaceholder('fortress_machine')" />
            </a-form-model-item>
          </a-row>
          <a-row>
            <workflow-label field="db_audit" />
            <a-form-model-item prop="db_audit">
              <a-input v-model="form.db_audit" :placeholder="getPlaceholder('db_audit')" />
            </a-form-model-item>
          </a-row>
          <a-row>
            <workflow-label field="log_audit" />
            <a-form-model-item prop="log_audit">
              <a-input v-model="form.log_audit" :placeholder="getPlaceholder('log_audit')" />
            </a-form-model-item>
          </a-row>
        </template>
      </a-form-model>
    </div>
    <div slot="footer">
      <a-button type="primary" @click="handleConfirm">{{ $t('dialog.ok') }}</a-button>
    </div>
  </base-dialog>
</template>

<script>
import * as R from 'ramda'
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'
import { getWorkflowFormRules, getPlaceholder, INIT_ECS, INIT_RDS, INIT_SERVER, INIT_BASIC_SECURITY_SERVICES, INIT_CLOUD_SECURITY_TABLE, ECS_SELECT_OPTIONS, RDS_SELECT_OPTIONS } from '../constants'
import WorkflowLabel from '../components/WorkflowLabel'

const addFormMap = {
  ecs: INIT_ECS,
  rds: INIT_RDS,
  server: INIT_SERVER,
  basicSecurityServices: INIT_BASIC_SECURITY_SERVICES,
  cloudSecurityTable: INIT_CLOUD_SECURITY_TABLE,
}

export default {
  name: 'WorkflowAddInfoDialog',
  components: {
    WorkflowLabel,
  },
  mixins: [DialogMixin, WindowsMixin],
  data () {
    return {
      rules: getWorkflowFormRules(this).others,
      getPlaceholder,
      form: {},
      ecsOptions: ECS_SELECT_OPTIONS,
      rdsOptions: RDS_SELECT_OPTIONS,
    }
  },
  created () {
    this.initFormData()
  },
  methods: {
    initFormData () {
      const { resourceType } = this.params
      this.form = R.clone(addFormMap[resourceType])
    },
    async handleConfirm () {
      const validate = await this.$refs.addForm.validate()
      if (validate) {
        this.params.ok(this.form)
        this.cancelDialog()
      }
    },
  },
}
</script>
