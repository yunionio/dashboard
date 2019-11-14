<template>
  <div>
    <page-header title="新建" />
    {{form.values}}
    <a-form :form="form.fc" class="mt-3">
      <a-divider orientation="left">基础配置</a-divider>
      <a-form-item label="指定项目" v-bind="formItemLayout">
        <domain-project :decorators="decorators.projectDomain" :fc="form.fc" :labelInValue="false" />
      </a-form-item>
      <a-form-item label="名称" v-bind="formItemLayout">
        <a-input :placeholder="$t('validator.serverName')" v-decorator="decorators.name" />
      </a-form-item>
      <!-- 计费方式 -->
      <clearing-radios v-bind="formItemLayout" />
      <!-- 区域 -->
      <area-select
        :areas="['city', 'provider', 'region']"
        @change="handleAreaChange"
        v-bind="formItemLayout" />
      <!-- 套餐信息 -->
      <s-k-u ref="SKU" />
    </a-form>
  </div>
</template>
<script>
import { CreateServerForm } from '@Compute/constants'
import { DECORATORS } from './constants/index'
import SKU from './components/SKU'
import DomainProject from '@/sections/DomainProject'

export default {
  name: 'RDSCreate',
  components: {
    SKU,
    DomainProject,
  },
  data () {
    return {
      decorators: DECORATORS,
      formItemLayout: {
        wrapperCol: { span: CreateServerForm.wrapperCol },
        labelCol: { span: CreateServerForm.labelCol },
      },
    }
  },
  computed: {
    form () {
      const fc = this.$form.createForm(this, { onFieldsChange: this.onFieldsChange })
      const { getFieldValue, getFieldsValue, setFieldsValue } = fc
      return {
        fc,
        getFieldValue,
        getFieldsValue,
        setFieldsValue,
      }
    },
  },
  provide () {
    return {
      form: this.form,
      formItemLayout: this.formItemLayout,
    }
  },
  methods: {
    onFieldsChange (vm, values) {
      // console.log(values)
    },
    skuController (values) {
      const { fetchFilter } = this.$refs['SKU']
      if (values && values.region) {
        const { id } = values.region
        // 获取sku筛选项
        fetchFilter(id)
      }
    },
    handleAreaChange (values) {
      this.skuController(values)
    },
  },
}
</script>
