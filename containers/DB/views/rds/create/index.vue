<template>
  <div class="rds-create-index pb-5">
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
      <a-form-item :label="$t('common.description')" v-bind="formItemLayout">
        <a-textarea :auto-size="{ minRows: 1, maxRows: 3 }" v-decorator="decorators.description" :placeholder="$t('common_367')" />
      </a-form-item>
      <!-- 计费方式 -->
      <clearing-radios v-bind="formItemLayout" :auto_renew="false" />
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
        :names="['provider', 'cloudregion']" />
      <!-- 套餐信息 -->
      <s-k-u ref="SKU" />
      <a-form-item v-if="form.fd.provider !== 'Aliyun'" :label="$t('db.text_143')">
        <server-password :loginTypes="loginTypes" :decorator="decorators.loginConfig" :form="form" />
      </a-form-item>
      <!-- 网络 -->
      <item-network ref="NETWORK" />
      <!-- 选择安全组 -->
      <a-form-item v-if="showSecgroup(form)" :label="$t('db.text_144')">
        <secgroup-config :max="getSecgroupMax(form)" :decorators="decorators.secgroup" />
      </a-form-item>
      <!-- 标签 -->
      <a-form-item :label="$t('table.title.tag')" class="mb-3">
        <tag v-decorator="decorators.__meta__" />
      </a-form-item>
      <bottom-bar :values="form.getFieldsValue()" />
    </a-form>
  </div>
</template>
<script>
import ServerPassword from '@Compute/sections/ServerPassword'
import SecgroupConfig from '@Compute/sections/SecgroupConfig'
import Duration from '@Compute/sections/Duration'
import ItemArea from '@DB/sections/ItemArea'
import ItemNetwork from '@DB/sections/ItemNetwork'
import NameRepeated from '@/sections/NameRepeated'
import DomainProject from '@/sections/DomainProject'
import Tag from '@/sections/Tag'
import { getInitialValue } from '@/utils/common/ant'
import changeMinxin from './changeMinxin'
import BottomBar from './components/BottomBar'
import SKU from './components/SKU'
import { DECORATORS } from './constants/index'

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
    Tag,
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
      tailFormItemLayout: {
        wrapperCol: {
          lg: { span: 18, offset: 6 },
          xl: { span: 20, offset: 4 },
          xxl: { span: 21, offset: 3 },
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
      tailFormItemLayout: this.tailFormItemLayout,
    }
  },
  methods: {
    showSecgroup (form) {
      const provider = form.getFieldValue('provider')
      if (provider === 'Qcloud') {
        return form.getFieldValue('category') !== 'basic'
      }

      return ['Huawei', 'Aliyun'].includes(provider)
    },
    getSecgroupMax (form) {
      const secgroupMaxMap = {
        Huawei: 1,
        Qcloud: 5,
        Aliyun: 3,
      }
      return secgroupMaxMap[form.getFieldValue('provider')] || 5
    },
  },
}
</script>
