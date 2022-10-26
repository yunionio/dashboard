<template>
  <div>
    <page-header>
      <div slot="title" class="d-flex align-items-center justify-content-center">
        <h3 style="text-align:center;line-height: 50px">{{$t('wz_workflow_form.titles.form_title')}}</h3>
      </div>
    </page-header>
    <page-body need-margin-bottom class="w-100 d-flex justify-content-center">
      <a-form-model
        ref="resourceForm"
        class="w-100 mt-3"
        :model="form"
        :rules="rules"
        style="max-width:1400px;">
        <a-card>
          <workflow-tips resourceType="whole" />
        </a-card>
        <a-card class="mt-4" :title="$t('wz_workflow_form.titles.unit_info')">
          <unit-info :form="form" />
        </a-card>
        <a-card class="mt-4" :title="$t('wz_workflow_form.titles.project_info')">
          <project-info :form="form" />
        </a-card>
        <a-card class="mt-4" :title="$t('wz_workflow_form.titles.contractor_info')">
          <contractor-info :form="form" />
        </a-card>
        <a-card class="mt-4" :title="$t('wz_workflow_form.titles.cloud_resource_info')">
          <a-card class="mt-4" :title="$t('wz_workflow_form.titles.ecs')">
            <ecs :form="form.cloudResourceInfo" />
          </a-card>
          <a-card class="mt-4" :title="$t('wz_workflow_form.titles.rds')">
            <rds :form="form.cloudResourceInfo" />
          </a-card>
          <a-card class="mt-4" :title="$t('wz_workflow_form.titles.server')">
            <server :form="form.cloudResourceInfo" />
          </a-card>
          <workflow-tips resourceType="cloudResource" />
        </a-card>
        <a-card class="mt-4" :title="$t('wz_workflow_form.titles.cloud_security_info')">
          <a-card class="mt-4" :title="$t('wz_workflow_form.titles.basic_security_services')">
            <basic-security-services :form="form.cloudSecurityInfo" />
          </a-card>
          <a-card class="mt-4" :title="$t('wz_workflow_form.titles.cloud_security_table')">
            <cloud-security-table :form="form.cloudSecurityInfo" />
          </a-card>
        </a-card>
      </a-form-model>
    </page-body>
    <div class="page-footer">
      <a-button class="mr-3" type="primary" :loading="loading" @click="handleConfirm">{{ $t('dialog.ok') }}</a-button>
      <a-button class="mr-2" @click="skipStep">{{this.$t('dialog.cancel')}}</a-button>
    </div>
  </div>
</template>

<script>
import * as R from 'ramda'
import { mapGetters } from 'vuex'
import { WORKFLOW_TYPES } from '@/constants/workflow'
import workflowMixin from '@/mixins/workflow'
import UnitInfo from './components/form/unitInfo'
import ProjectInfo from './components/form/ProjectInfo'
import ContractorInfo from './components/form/ContractorInfo'
import Ecs from './components/form/Ecs'
import Rds from './components/form/Rds'
import Server from './components/form/Server'
import BasicSecurityServices from './components/form/BasicSecurityServices'
import CloudSecurityTable from './components/form/CloudSecurityTable'
import WorkflowTips from './components/WorkflowTips'
import { getWorkflowFormRules, INIT_APPLY_INTERNAL_RESOURCE_DATA } from './constants'
export default {
  name: 'WorkflowApplyInternalResource',
  components: {
    UnitInfo,
    ProjectInfo,
    ContractorInfo,
    Ecs,
    Rds,
    Server,
    BasicSecurityServices,
    CloudSecurityTable,
    WorkflowTips,
  },
  mixins: [workflowMixin],
  data () {
    return {
      form: R.clone(INIT_APPLY_INTERNAL_RESOURCE_DATA),
      rules: getWorkflowFormRules(this),
    }
  },
  computed: {
    ...mapGetters(['isAdminMode', 'userInfo', 'isDomainMode']),
    isOpenWorkflow () {
      return this.checkWorkflowEnabled(WORKFLOW_TYPES.APPLY_INTERNAL_RESOURCE)
    },
  },
  methods: {
    async handleConfirm () {
      this.loading = true
      const validate = await this.$refs.resourceForm.validate()
      if (!validate) return
      try {
        if (this.isOpenWorkflow) {
          await this.handleApplyInternalResourceSubmit(this.form)
        }
      } finally {
        this.loading = false
      }
    },
    async handleApplyInternalResourceSubmit (data) {
      const params = { ...data, tenant: this.userInfo.projectId }
      const variables = {
        project_domain: this.userInfo.projectDomainId,
        project: this.userInfo.projectId,
        process_definition_key: WORKFLOW_TYPES.APPLY_INTERNAL_RESOURCE,
        initiator: this.userInfo.id,
        paramter: JSON.stringify(params),
      }
      await this.createWorkflow(variables)
      this.$router.push('/workflow')
    },
  },
}
</script>

<style lang="less" scoped>
.section-title {
  font-size: 18px;
  font-weight: bold;
}
.section-title2 {
  font-size: 16px;
  font-weight: bold;
}
.page-footer {
  z-index: 10;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 74px;
  box-shadow: 0 -2px 4px 0 rgba(237, 237, 237, 0.5), 0 -2px 4px 0 rgba(237, 237, 237, 0.5);
  background: #fff;
  display: flex;
  justify-content: flex-end;
  align-items: center;
}
</style>
