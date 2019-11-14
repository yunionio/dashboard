<template>
  <div>
    <page-header title="新建" />
    {{form.fc.getFieldsValue()}}
    <a-form :form="form.fc" class="mt-3">
      <a-divider orientation="left">基础配置</a-divider>
      <a-form-item label="指定项目" v-bind="formItemLayout">
        <domain-project :fc="form.fc"
          :labelInValue= "false"
          :decorators="decorators.projectDomain" />
      </a-form-item>
      <a-form-item label="名称" v-bind="formItemLayout">
        <a-input v-decorator="decorators.name" :placeholder="$t('validator.serverName')" />
      </a-form-item>
      <!-- 计费方式 -->
      <clearing-radios v-bind="formItemLayout" />
      <!-- 区域 -->
      <area-select v-bind="formItemLayout"  @change="handleAreaChange" />
    </a-form>
  </div>
</template>
<script>
import { CreateServerForm } from '@Compute/constants'
import { DECORATORS } from './constants/index'
import DomainProject from '@/sections/DomainProject'
export default {
  name: 'RDSCreate',
  components: {
    DomainProject,
  },
  data () {
    return {
      decorators: DECORATORS,
      form: {
        fc: this.$form.createForm(this, { onFieldsChange: this.onFieldsChange }),
      },
      formItemLayout: {
        wrapperCol: { span: CreateServerForm.wrapperCol },
        labelCol: { span: CreateServerForm.labelCol },
      },
    }
  },
  provide () {
    return {
      form: this.form,
    }
  },
  methods: {
    handleAreaChange (obj) {
      console.log(obj)
    },
  },
}
</script>
