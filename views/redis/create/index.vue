<template>
  <div class="redis-create-index">
    <page-header title="新建" />
    <a-divider orientation="left">基础配置</a-divider>
    <a-form
      class="mt-3"
      :form="form.fc">
      <a-form-item label="指定项目" class="mb-0" v-bind="formItemLayout">
        <domain-project @update:domain="handleDomainChange" :labelInValue="false" :fc="form.fc" :form-layout="formItemLayout"
        :decorators="{ project: project, domain: domain }" />
      </a-form-item>
      <a-form-item label="名称" v-bind="formItemLayout">
        <a-input v-decorator="decorators.generate_name" :placeholder="$t('validator.serverName')" />
        <name-repeated v-slot:extra res="elasticcaches" :name="form.getFieldValue('generate_name')" />
      </a-form-item>
      <item-billing-opts />
      <a-form-item label="数量" v-bind="formItemLayout">
        <a-input-number v-decorator="decorators.count" :min="1" :max="10" @blur="handleBlurCount" />
      </a-form-item>
      <!-- 区域 -->
      <item-area :defaultActiveFirstOption="['city']" :values="form.fc.getFieldsValue()" />
      <div v-show="!form.fc.getFieldError('provider')">
        <s-k-u ref="REF_SKU" />
        <a-form-item label="管理员密码" v-bind="formItemLayout">
          <server-password :loginTypes="loginTypes" :decorator="decorators.loginConfig" :form="form" />
        </a-form-item>
        <a-form-item label="网络" v-bind="formItemLayout">
          <item-vpc-opts ref="REF_VPC" :decorators="decorators.vpcNetwork" />
        </a-form-item>
        <bottom-bar :values="form.fc.getFieldsValue()" />
       </div>
    </a-form>
  </div>
</template>
<script>
// import * as R from 'ramda'
import { CreateServerForm } from '@Compute/constants'
import { decorators } from '@DB/views/utils/createElasticcache'
// import { debounce } from 'lodash'
import ServerPassword from '@Compute/sections/ServerPassword'
import ItemArea from '@DB/sections/ItemArea'
import ItemBillingOpts from './components/ItemBillingOpts'
import ItemVpcOpts from './components/ItemVpcOpts'
import SKU from './components/SKU'
import BottomBar from './components/BottomBar'
import DomainProject from '@/sections/DomainProject'
import NameRepeated from '@/sections/NameRepeated'

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
    NameRepeated,
  },
  data () {
    return {
      loginTypes: ['random', 'password'],
      formItemLayout: {
        wrapperCol: { span: CreateServerForm.wrapperCol },
        labelCol: { span: CreateServerForm.labelCol },
      },
      decorators,
      domain: [
        'domain',
        {
          rules: [
            { required: true, message: this.$t('rules.domain'), trigger: 'change' },
          ],
        },
      ],
      project: [
        'project',
        {
          rules: [
            { required: true, message: this.$t('rules.project'), trigger: 'change' },
          ],
        },
      ],
      scopeParams: {
        scope: this.$store.getters.scope,
        project_domain: '',
      },
    }
  },
  computed: {
    form () {
      const fc = this.$form.createForm(this, { onValuesChange: (vm, values) => this._valuesChange(vm, values) })
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
      scopeParams: this.scopeParams,
      formItemLayout: this.formItemLayout,
    }
  },
  created () {
    this.form.fc.getFieldDecorator('manager', { preserve: true })
  },
  methods: {
    _domainChange (values) {
      if (this.$store.getters.isAdminMode) {
        this.scopeParams['project_domain'] = values.domain || this.form.getFieldValue('domain')
        delete this.scopeParams['scope']
      } else {
        delete this.scopeParams['project_domain']
      }
    },
    _queryNetworks (changedFields) {
      if (changedFields && changedFields['sku']) {
        this.$refs['REF_VPC'].fetchQueryVpcs()
      }
    },
    _valuesChange (vm, changedFields) {
      // 选中平台的select出现报错信息则不请求sku信息和网络信息
      if (!this.form.fc.getFieldError('provider')) {
        if (this.$refs['REF_SKU']) {
          this.$refs['REF_SKU'].skuFetchs(changedFields)
        }
        this._queryNetworks(changedFields)
      }
      this._domainChange(changedFields)
    },
    handleDomainChange () {
      this.$refs['REF_VPC'].fetchQueryVpcs(true)
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

<style lang="scss" scoped>
.redis-create-index {
  ::v-deep .ant-form{
    padding-left: 20px;
  }
}
</style>
