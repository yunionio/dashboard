<template>
  <div>
    <a-row :gutter="8">
      <a-col :span="8">
        <workflow-label field="country" />
        <a-form-model-item prop="unitInfo.country">
          <base-select v-model="form.unitInfo.country" :options="countryOpts" :placeholder="getPlaceholder('country')" />
        </a-form-model-item>
      </a-col>
      <a-col :span="8">
        <workflow-label field="group_name" />
        <a-form-model-item prop="unitInfo.group_name">
          <a-input v-model="form.unitInfo.group_name" :placeholder="getPlaceholder('group_name')" />
        </a-form-model-item>
      </a-col>
      <a-col :span="8">
        <workflow-label field="group_code" />
        <a-form-model-item prop="unitInfo.group_code">
          <a-input v-model="form.unitInfo.group_code" :placeholder="getPlaceholder('group_code')" />
        </a-form-model-item>
      </a-col>
    </a-row>
    <a-row :gutter="8">
      <a-col :span="12">
        <workflow-label field="contact_name" />
        <a-form-model-item prop="unitInfo.contact_name">
          <a-input v-model="form.unitInfo.contact_name" :placeholder="getPlaceholder('contact_name')" />
        </a-form-model-item>
      </a-col>
      <a-col :span="12">
        <workflow-label field="contact_phone" />
        <a-form-model-item prop="unitInfo.contact_phone">
          <a-input v-model="form.unitInfo.contact_phone" :placeholder="getPlaceholder('contact_phone')" />
        </a-form-model-item>
      </a-col>
    </a-row>
    <a-row :gutter="8">
      <a-col :span="12">
        <workflow-label field="email" />
        <a-form-model-item prop="unitInfo.email">
          <a-input v-model="form.unitInfo.email" :placeholder="getPlaceholder('email')" />
        </a-form-model-item>
      </a-col>
      <a-col :span="12">
        <workflow-label field="fill_form_date" />
        <a-form-model-item prop="unitInfo.fill_form_date">
          <a-date-picker class="w-100" v-model="form.unitInfo.fill_form_date" format="YYYY-MM-DD" value-format="YYYY-MM-DD" :placeholder="getPlaceholder('fill_form_date')"  />
        </a-form-model-item>
      </a-col>
    </a-row>
    <a-row :gutter="8">
      <a-col :span="12">
        <workflow-label field="customer_name" />
        <a-form-model-item prop="unitInfo.customer_name">
          <a-input v-model="form.unitInfo.customer_name" :placeholder="getPlaceholder('customer_name')" />
        </a-form-model-item>
      </a-col>
      <a-col :span="12">
        <workflow-label field="customer_phone" />
        <a-form-model-item prop="unitInfo.customer_phone">
          <a-input v-model="form.unitInfo.customer_phone" :placeholder="getPlaceholder('customer_phone')" />
        </a-form-model-item>
      </a-col>
    </a-row>
  </div>
</template>

<script>
// country: '区县',
//           group_name: '集团名称',
//           group_code: '集团编号',
//           contact_name: '联系人',
//           contact_phone: '联系方式',
//           email: '电子邮件',
//           fill_form_date: '填表日期',
//           customer_name: '客户/项目经理',
//           customer_phone: '客户/项目经理联系方式',
import WorkflowLabel from '../WorkflowLabel'
import { COUNTRYS, getPlaceholder } from '../../constants'

export default {
  name: 'WorkflowApplyInternalUnitinfo',
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
      countryOpts: COUNTRYS,
      getPlaceholder,
    }
  },
}
</script>
