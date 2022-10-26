<template>
  <div>
    <a-row :gutter="8">
      <a-col :span="12">
        <workflow-label field="contractor_name" />
        <a-form-model-item prop="contractorInfo.contractor_name">
          <a-input v-model="form.contractorInfo.contractor_name" :placeholder="getPlaceholder('contractor_name')" />
        </a-form-model-item>
      </a-col>
      <a-col :span="12">
        <workflow-label field="contractor_people" />
        <a-form-model-item prop="contractorInfo.contractor_people">
          <a-input v-model="form.contractorInfo.contractor_people" :placeholder="getPlaceholder('contractor_people')" />
        </a-form-model-item>
      </a-col>
      <a-col :span="12">
        <workflow-label field="contractor_phone" />
        <a-form-model-item prop="contractorInfo.contractor_phone">
          <a-input v-model="form.contractorInfo.contractor_phone" :placeholder="getPlaceholder('contractor_phone')" />
        </a-form-model-item>
      </a-col>
    </a-row>
  </div>
</template>

<script>
import WorkflowLabel from '../WorkflowLabel'
import { getPlaceholder } from '../../constants'

export default {
  name: 'WorkflowApplyInternalContractorInfo',
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
