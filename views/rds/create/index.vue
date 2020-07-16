<template>
  <div class="server-create-index">
    <page-header title="新建RDS" />
    <a-divider orientation="left">基础配置</a-divider>
    <a-form hideRequiredMark :form="form.fc" class="mt-3"  v-bind="formItemLayout">
      <a-form-item class="mb-0" :label="`指定${$t('dictionary.project')}`" v-bind="formItemLayout">
        <domain-project :decorators="decorators.projectDomain" :fc="form.fc" :labelInValue="false" />
      </a-form-item>
      <a-form-item label="名称" v-bind="formItemLayout">
        <a-input :placeholder="$t('validator.resourceCreateName')" v-decorator="decorators.generate_name" />
        <name-repeated
          v-slot:extra
          res="dbinstances"
          :name="form.getFieldValue('generate_name')"
          default-text="名称支持有序后缀占位符‘#’，用法举例，名称host##，数量2，创建后实例的名称依次为host01、host02，已有同名实例，序号顺延"  />
      </a-form-item>
      <!-- 计费方式 -->
      <clearing-radios v-bind="formItemLayout" />
      <a-form-item label="到期释放" v-if="form.fd.billing_type !== 'prepaid'">
        <duration :decorators="decorators.duration" :form="form" />
      </a-form-item>
      <!-- 区域 -->
      <item-area
        :billingType="form.fd.billing_type"
        v-if="form.fd.project"
        class="mb-0"
        :isRequired="true"
        :names="['city', 'provider', 'cloudregion']" />
      <!-- 套餐信息 -->
      <s-k-u ref="SKU" />
      <a-form-item v-if="form.fd.provider !== 'Aliyun'" label="管理员密码">
        <server-password :loginTypes="loginTypes" :decorator="decorators.loginConfig" :form="form" />
      </a-form-item>
      <!-- 网络 -->
      <item-network ref="NETWORK" />
      <!-- 选择安全组 -->
      <a-form-item v-if="form.getFieldValue('provider') === 'Huawei'" label="安全组">
        <secgroup-config :max="1" :decorators="decorators.secgroup" />
      </a-form-item>
      <bottom-bar :values="form.getFieldsValue()" />
    </a-form>
  </div>
</template>
<script>
import { DECORATORS } from './constants/index'
import SKU from './components/SKU'
import BottomBar from './components/BottomBar'
import changeMinxin from './changeMinxin'
import { CreateServerForm } from '@Compute/constants'
import ServerPassword from '@Compute/sections/ServerPassword'
import SecgroupConfig from '@Compute/sections/SecgroupConfig'
import Duration from '@Compute/sections/Duration'
import ItemArea from '@DB/sections/ItemArea'
import ItemNetwork from '@DB/sections/ItemNetwork'
import NameRepeated from '@/sections/NameRepeated'
import DomainProject from '@/sections/DomainProject'
import { getInitialValue } from '@/utils/common/ant'

export default {
  name: 'RDSCreate',
  components: {
    SKU,
    DomainProject,
    BottomBar,
    ServerPassword,
    ItemArea,
    ItemNetwork,
    SecgroupConfig,
    NameRepeated,
    Duration,
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
    providers () {
      if (this.form.fd.billing_type === 'prepaid') {
        return ['Aliyun', 'Huawei']
      }
      return ['Aliyun', 'Huawei', 'Google']
    },
  },
  provide () {
    return {
      form: this.form,
      formItemLayout: this.formItemLayout,
      scopeParams: this.scopeParams,
    }
  },
}
</script>

<style lang="less" scoped>
.server-create-index {
  ::v-deep .ant-form{
    padding-left: 20px;
  }
}
</style>
