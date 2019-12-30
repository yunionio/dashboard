<template>
  <div>
    <page-header title="新建" />
    <a-form
      class="mt-3"
      :form="form.fc">
      <a-divider orientation="left">基础配置</a-divider>
      <a-form-item label="指定项目" class="mb-0" v-bind="formItemLayout">
        <domain-project :fc="form.fc" :form-layout="formLayout"
        :decorators="{ project: project, domain: domain }" />

      </a-form-item>
      <a-form-item label="名称" v-bind="formItemLayout">
        <a-input v-decorator="decorators.name" :placeholder="$t('validator.serverName')" />
      </a-form-item>
      <item-billing-opts />
      <a-form-item label="数量" v-bind="formItemLayout">
        <a-input-number v-decorator="decorators.count" :min="1" :max="10" @blur="handleBlurCount" />
      </a-form-item>
      <!-- 区域 -->
      <item-area />
      <s-k-u ref="REF_SKU" />
      <a-divider orientation="left">高级配置</a-divider>
      <a-form-item label="管理员密码" v-bind="formItemLayout">
        <server-password :loginTypes="['random', 'password']" :decorator="decorators.loginConfig" />
      </a-form-item>
      <a-form-item label="VPC" v-bind="formItemLayout">
        <item-vpc-opts ref="REF_VPC" :decorators="decorators.vpcNetwork" />
      </a-form-item>
    </a-form>
    <bottom-bar :values="form.fc.getFieldsValue()" />
  </div>
</template>
<script>
// import * as R from 'ramda'
import { CreateServerForm } from '@Compute/constants'
import { decorators } from '@DB/views/utils/createElasticcache'
import { debounce } from 'lodash'
import ServerPassword from '@Compute/sections/ServerPassword'
import ItemBillingOpts from './components/ItemBillingOpts'
import ItemVpcOpts from './components/ItemVpcOpts'
import ItemArea from './components/ItemArea'
import SKU from './components/SKU'
import BottomBar from './components/BottomBar'
import DomainProject from '@/sections/DomainProject'
import { isRequired } from '@/utils/validate'

export default {
  name: 'IDCCreate',
  components: {
    // 区域
    ItemArea,
    // SKU
    SKU,
    // 指定项目
    DomainProject,
    // 计费方式
    ItemBillingOpts,
    // 管理员密码
    ServerPassword,
    // Vpc
    ItemVpcOpts,
    // 表单提交
    BottomBar,
  },
  data () {
    return {
      formItemLayout: {
        wrapperCol: { span: CreateServerForm.wrapperCol },
        labelCol: { span: CreateServerForm.labelCol },
      },
      decorators,
      domain: [
        'domain',
        {
          initialValue: this.$store.getters.userInfo.projectDomainId,
          rules: [
            { validator: isRequired(), message: '请选择域', trigger: 'change' },
          ],
        },
      ],
      project: [
        'project',
        {
          initialValue: this.$store.getters.userInfo.projectId,
          rules: [
            { validator: isRequired(), message: '请选择项目', trigger: 'change' },
          ],
        },
      ],
    }
  },
  computed: {
    form () {
      const fc = this.$form.createForm(this, { onFieldsChange: debounce((vm, values) => this._debounceFieldsChange(vm, values)) })
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
  created () {
    this.form.fc.getFieldDecorator('manager', { preserve: true })
  },
  methods: {
    _debounceFieldsChange (vm, changedFields) {
      this.$refs['REF_SKU'].skuFetchs(changedFields)
      this._queryNetworks(changedFields)
    },
    _queryNetworks (changedFields) {
      if (changedFields['sku'] && changedFields['sku'].value) {
        this.$refs['REF_VPC'].fetchQueryVpcs()
      }
    },
    handleBlurCount (count, d) {
      if (!this.form.fc.getFieldValue('count')) {
        this.form.fc.setFieldsValue({
          count: 1,
        })
      }
    },
  },
}
</script>
