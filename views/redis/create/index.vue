<template>
  <div>
    <page-header title="新建" />
    {{form.fc.getFieldsValue()}}
    <a-form
      class="mt-3"
      :form="form.fc">
      <a-divider orientation="left">基础配置</a-divider>
      <a-form-item label="指定项目" class="mb-0" v-bind="formItemLayout">
        <domain-project :fc="form.fc"
          :labelInValue= "false"
          :decorators="defaultProjectDomain" />
      </a-form-item>
      <a-form-item label="名称" v-bind="formItemLayout">
        <a-input v-decorator="decorators.name" :placeholder="$t('validator.serverName')" />
      </a-form-item>
      <item-billing-opts />
      <a-form-item label="数量" v-bind="formItemLayout">
        <a-input-number v-decorator="decorators.count" :min="1" :max="10" />
      </a-form-item>
      <a-form-item label="区域" v-bind="formItemLayout">
        <item-city-provider-region-selects :selectProviders="['Huawei', 'Aliyun']" :decorators="decorators.cityProviderRegion" />
       </a-form-item>
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
import { CreateServerForm, SERVER_TYPE } from '@Compute/constants'
import { ControlParams, decorators } from '@DB/views/utils/createElasticcache'
import ServerPassword from '@Compute/sections/ServerPassword'
import ItemCityProviderRegionSelects from '../components/CityProviderRegionSelects'
import ItemBillingOpts from './components/ItemBillingOpts'
import ItemVpcOpts from './components/ItemVpcOpts'
import SKU from './components/SKU'
import BottomBar from './components/BottomBar'
import DomainProject from '@/sections/DomainProject'

export default {
  name: 'IDCCreate',
  components: {
    // SKU
    SKU,
    // 指定项目
    DomainProject,
    // 计费方式
    ItemBillingOpts,
    // 平台及区域
    ItemCityProviderRegionSelects,
    // 管理员密码
    ServerPassword,
    // Vpc
    ItemVpcOpts,
    // 表单提交
    BottomBar,
  },
  data () {
    this.initParams = new ControlParams(SERVER_TYPE.idc)
    const { projectId, projectDomainId } = this.$store.getters.userInfo
    return {
      defaultProjectDomain: {
        project: [
          'project',
          {
            initialValue: projectId,
          },
        ],
        domain: [
          'domain',
          {
            initialValue: projectDomainId,
          },
        ],
      },
      formItemLayout: {
        wrapperCol: { span: CreateServerForm.wrapperCol },
        labelCol: { span: CreateServerForm.labelCol },
      },
      form: {
        fc: this.$form.createForm(this, { onFieldsChange: this.onFieldsChange }),
      },
      decorators,
      params: {
        cloudregion: this.initParams.params.cloudregion,
        image: this.initParams.params.image,
        schedtag: this.initParams.params.schedtag,
        policySchedtag: this.initParams.params.policySchedtag,
      },
    }
  },
  provide () {
    return {
      form: this.form,
    }
  },
  methods: {
    _querySkus (changedFields) {
      const skuParamKeys = ['city', 'provider', 'region', 'zone']
      for (let i = 0; i < skuParamKeys.length; i++) {
        let key = skuParamKeys[i]
        if (changedFields[key]) {
          this.$refs['REF_SKU'].fetchQuerySkus()
          break
        }
      }
    },
    _queryNetworks (changedFields) {
      if (changedFields['sku']) {
        this.$refs['REF_VPC'].fetchQueryVpcs()
      }
    },
    onFieldsChange (vm, changedFields) {
      this._querySkus(changedFields)
      this._queryNetworks(changedFields)
    },
  },
}
</script>
