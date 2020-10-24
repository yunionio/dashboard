<template>
  <div class="server-create-index">
    <page-header :title="$t('db.text_140')" />
    <a-form hideRequiredMark :form="form.fc" class="mt-3"  v-bind="formItemLayout">
      <a-form-item class="mb-0" :label="$t('db.text_139', [$t('dictionary.project')])" v-bind="formItemLayout">
        <domain-project :decorators="decorators.projectDomain" :fc="form.fc" :labelInValue="false" />
      </a-form-item>
      <a-form-item :label="$t('db.text_60')" v-bind="formItemLayout">
        <a-input :placeholder="$t('validator.resourceCreateName')" v-decorator="decorators.generate_name" />
        <template #extra>
          <name-repeated
            res="dbinstances"
            :name="form.getFieldValue('generate_name')"
            :default-text="$t('db.text_142')"  />
        </template>
      </a-form-item>
      <!-- 计费方式 -->
      <clearing-radios v-bind="formItemLayout" />
      <a-form-item :label="$t('db.text_71')" v-if="form.fd.billing_type !== 'prepaid'">
        <duration :decorators="decorators.duration" :form="form" />
      </a-form-item>
      <a-form-item :label="$t('db.text_265')">
        <a-input-number v-decorator="decorators.__count__" />
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
      <a-form-item v-if="form.fd.provider !== 'Aliyun'" :label="$t('db.text_143')">
        <server-password :loginTypes="loginTypes" :decorator="decorators.loginConfig" :form="form" />
      </a-form-item>
      <!-- 网络 -->
      <item-network ref="NETWORK" />
      <!-- 选择安全组 -->
      <a-form-item v-if="form.getFieldValue('provider') === 'Huawei' || form.getFieldValue('provider') === 'Qcloud'" :label="$t('db.text_144')">
        <secgroup-config :max="form.getFieldValue('provider') === 'Huawei' ? 1 : 5" :decorators="decorators.secgroup" />
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
        wrapperCol: {
          lg: { span: 18 },
          xl: { span: 20 },
          xxl: { span: 21 },
        },
        labelCol: {
          lg: { span: 6 },
          xl: { span: 4 },
          xxl: { span: 3 },
        },
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
