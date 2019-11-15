<template>
  <div>
    <page-header title="新建" />
    {{form.getFieldsValue()}}
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
      <a-divider orientation="left">高级配置</a-divider>
      <network-select v-bind="formItemLayout" />
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
      const { getFieldDecorator, getFieldValue, getFieldsValue, setFieldsValue } = fc
      return {
        fc,
        getFieldDecorator,
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
  mounted () {
    const { fetchs } = this.$refs['SKU']
    fetchs('462f113c-976b-406c-8b58-00ceede5b322')
  },
  methods: {
    onFieldsChange (vm, values) {
      // console.log(values)
    },
    skuController (values) {
      const { fetchs } = this.$refs['SKU']
      if (values && values.region) {
        const { id } = values.region
        // 获取sku筛选项
        fetchs(id)
      }
    },
    handleAreaChange (values) {
      this.skuController(values)
    },
  },
}
</script>
