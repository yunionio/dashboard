<template>
  <div class="server-create-index">
    <page-header title="新建" />
    <a-form :form="form.fc" class="mt-3">
      <a-divider orientation="left">基础配置</a-divider>
      <a-form-item class="mb-0" :label="`指定${$t('dictionary.project')}`" v-bind="formItemLayout">
        <domain-project :decorators="decorators.projectDomain" :fc="form.fc" :labelInValue="false" />
      </a-form-item>
      <a-form-item label="名称" v-bind="formItemLayout">
        <a-input :placeholder="$t('validator.serverCreateName')" v-decorator="decorators.generate_name" />
        <name-repeated
          v-slot:extra
          res="dbinstances"
          :name="form.getFieldValue('generate_name')"
          default-text="名称支持有序后缀占位符‘#’，用法举例，名称host##，数量2，创建后实例的名称依次为host01、host02，已有同名实例，序号顺延"  />
      </a-form-item>
      <!-- 计费方式 -->
      <clearing-radios v-bind="formItemLayout" />
      <!-- 区域 -->
      <item-area
        :billingType="form.fd.billing_type"
        v-if="form.fd.project"
        class="mb-0"
        :isRequired="true"
        :names="['city', 'provider', 'cloudregion']" />
      <!-- 套餐信息 -->
      <div>
        <s-k-u ref="SKU" />
        <a-form-item label="管理员密码" v-bind="formItemLayout">
          <server-password :loginTypes="loginTypes" :decorator="decorators.loginConfig" :form="form" />
        </a-form-item>
        <network-selects
          ref="NETWORK"
          label="网络"
          :isDefaultFetch="false"
          :vpcFormat="vpcFormat"
          :vpcParams="getVpcParams"
          :networkParams="getNetworkParams"
          v-bind="formItemLayout" />
        <!-- 选择安全组 -->
        <a-form-item v-if="form.getFieldValue('provider') === 'Huawei'" label="安全组" v-bind="formItemLayout">
          <secgroup-config :decorators="decorators.secgroup" />
        </a-form-item>
        <bottom-bar :values="form.getFieldsValue()" />
      </div>
    </a-form>
  </div>
</template>
<script>
import { CreateServerForm } from '@Compute/constants'
import ServerPassword from '@Compute/sections/ServerPassword'
import SecgroupConfig from '@Compute/sections/SecgroupConfig'
import ItemArea from '@DB/sections/ItemArea'
import { DECORATORS } from './constants/index'
import SKU from './components/SKU'
import BottomBar from './components/BottomBar'
import changeMinxin from './changeMinxin'
import NameRepeated from '@/sections/NameRepeated'
import DomainProject from '@/sections/DomainProject'
import NetworkSelects from '@/sections/NetworkSelects'
import { getInitialValue } from '@/utils/common/ant'

export default {
  name: 'RDSCreate',
  components: {
    SKU,
    DomainProject,
    BottomBar,
    ServerPassword,
    ItemArea,
    NetworkSelects,
    SecgroupConfig,
    NameRepeated,
  },
  mixins: [changeMinxin],
  data () {
    return {
      loginTypes: ['random', 'password'],
      decorators: DECORATORS,
      formItemLayout: {
        wrapperCol: { span: CreateServerForm.wrapperCol },
        labelCol: { span: CreateServerForm.labelCol },
      },
      scopeParams: {
        scope: this.$store.getters.scope,
        project_domain: '',
      },
    }
  },
  computed: {
    form () {
      const fc = this.$form.createForm(this, { onValuesChange: this.handleValuesChange })
      const initFd = getInitialValue(DECORATORS)
      const { getFieldDecorator, getFieldValue, getFieldsValue, setFieldsValue } = fc
      return {
        fc,
        fd: initFd,
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
      scopeParams: this.scopeParams,
    }
  },
  methods: {
    vpcFormat (vpc) {
      const { name, account } = vpc
      return (
        <div class='d-flex'>
          <span class='text-truncate flex-fill mr-2' title={ name }>{ name }</span>
          <span style="color: #8492a6; font-size: 13px">云账号: { account }</span>
        </div>
      )
    },
    getVpcParams () {
      return {
        cloudregion_id: this.form.getFieldValue('cloudregion'),
        ...this.scopeParams,
      }
    },
    getNetworkParams () {
      const params = {
        cloudregion_id: this.form.getFieldValue('cloudregion'),
        ...this.scopeParams,
      }
      const zoneStr = this.form.getFieldValue('zones')
      if (zoneStr) {
        const zoneArr = zoneStr.split('+')
        if (zoneArr && zoneArr.length > 0) {
          for (let i = 0; i < zoneArr.length; i++) {
            params[`zones.${i}`] = zoneArr[i]
          }
        }
      }
      return params
    },
  },
}
</script>

<style lang="scss" scoped>
.server-create-index {
  ::v-deep .ant-form{
    padding-left: 20px;
  }
}
</style>
