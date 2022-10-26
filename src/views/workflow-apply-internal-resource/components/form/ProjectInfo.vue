<template>
  <div>
    <a-row>
      <workflow-label field="project_name" />
      <a-form-model-item prop="projectInfo.project_name">
        <a-input v-model="form.projectInfo.project_name" :placeholder="getPlaceholder('project_name')" />
      </a-form-model-item>
    </a-row>
    <a-row>
      <workflow-label field="business_description" />
      <a-form-model-item prop="projectInfo.business_description">
        <a-input v-model="form.projectInfo.business_description" :placeholder="getPlaceholder('business_description')" />
      </a-form-model-item>
    </a-row>
    <a-row :gutter="8">
      <a-col :span="12">
        <workflow-label field="network_type" />
        <a-form-model-item prop="projectInfo.network_type">
          <a-radio-group v-model="form.projectInfo.network_type">
            <a-radio-button value="network">{{$t('wz_workflow_form.networkTypes.network')}}</a-radio-button>
            <a-radio-button value="government_extranet">{{$t('wz_workflow_form.networkTypes.government_extranet')}}</a-radio-button>
            <a-radio-button value="private_business_network">{{$t('wz_workflow_form.networkTypes.private_business_network')}}</a-radio-button>
          </a-radio-group>
        </a-form-model-item>
      </a-col>
      <a-col :span="12">
        <workflow-label field="level" />
        <a-form-model-item prop="projectInfo.level">
          <a-radio-group v-model="form.projectInfo.level">
            <a-radio-button value="level_three">{{$t('wz_workflow_form.levels.level_three')}}</a-radio-button>
            <a-radio-button value="level_two">{{$t('wz_workflow_form.levels.level_two')}}</a-radio-button>
            <a-radio-button value="none">{{$t('wz_workflow_form.levels.none')}}</a-radio-button>
          </a-radio-group>
        </a-form-model-item>
      </a-col>
    </a-row>
    <a-row :gutter="8">
      <a-col :span="12">
        <workflow-label field="start_date" />
        <a-form-model-item prop="projectInfo.start_date">
          <a-date-picker class="w-100" v-model="form.projectInfo.start_date" format="YYYY-MM-DD" value-format="YYYY-MM-DD" :placeholder="getPlaceholder('start_date')"  />
        </a-form-model-item>
      </a-col>
      <a-col :span="12">
        <workflow-label field="end_date" />
        <a-form-model-item prop="projectInfo.end_date">
          <a-date-picker class="w-100" v-model="form.projectInfo.end_date" format="YYYY-MM-DD" value-format="YYYY-MM-DD" :placeholder="getPlaceholder('end_date')"  />
        </a-form-model-item>
      </a-col>
    </a-row>
  </div>
</template>

<script>
import WorkflowLabel from '../WorkflowLabel'
import { getPlaceholder } from '../../constants'

export default {
  name: 'WorkflowApplyInternalProjectinfo',
  components: {
    WorkflowLabel,
  },
  props: {
    form: {
      require: true,
      type: Object,
    },
  },
  data () {
    return {
      getPlaceholder,
    }
  },
}
</script>
