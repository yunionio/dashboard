<template>
  <div>
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
        class="mb-0"
        :isRequired="true"
        :values="form.fc.getFieldsValue()"
        :providers="providers"
        :names="['city', 'provider', 'cloudregion']" />
      <!-- 套餐信息 -->
      <div v-show="form.getFieldValue('cloudregion')">
        <s-k-u ref="SKU" />
        <a-divider orientation="left">高级配置</a-divider>
        <a-form-item label="管理员密码" v-bind="formItemLayout">
          <server-password :loginTypes="loginTypes" :decorator="decorators.loginConfig" :form="form" />
          </a-form-item>
        <network-selects
          ref="NETWORK"
          label="VPC"
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
// import { debounce } from 'lodash'
import { CreateServerForm } from '@Compute/constants'
import ServerPassword from '@Compute/sections/ServerPassword'
import SecgroupConfig from '@Compute/sections/SecgroupConfig'
// import ServerNetwork from '@Compute/sections/ServerNetwork'
import ItemArea from '@DB/sections/ItemArea'
import { DECORATORS } from './constants/index'
import SKU from './components/SKU'
import BottomBar from './components/BottomBar'
import NameRepeated from '@/sections/NameRepeated'
import DomainProject from '@/sections/DomainProject'
import NetworkSelects from '@/sections/NetworkSelects'

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
    // ServerNetwork,
    NameRepeated,
  },
  data () {
    const { projectId, projectDomainId } = this.$store.getters.userInfo
    return {
      loginTypes: ['random', 'password'],
      decorators: DECORATORS,
      formData: {},
      formItemLayout: {
        wrapperCol: { span: CreateServerForm.wrapperCol },
        labelCol: { span: CreateServerForm.labelCol },
      },
      scopeParams: {
        scope: this.$store.getters.scope,
        project_domain: '',
      },
      defaultProjectDomain: {
        project: [
          'project',
          {
            initialValue: projectId,
            rules: [
              { required: true, message: this.$t('rules.project') },
            ],
          },
        ],
        domain: [
          'domain',
          {
            initialValue: projectDomainId,
            rules: [
              { required: true, message: this.$t('rules.domain') },
            ],
          },
        ],
      },
    }
  },
  computed: {
    form () {
      const fc = this.$form.createForm(this, { onValuesChange: (f, v) => this._valuesChange(v) })
      const { getFieldDecorator, getFieldValue, getFieldsValue, setFieldsValue } = fc
      return {
        fc,
        getFieldDecorator,
        getFieldValue,
        getFieldsValue,
        setFieldsValue,
      }
    },
    providers () {
      if (this.formData.billing_type === 'prepaid') {
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
  mounted () {
    const { fetchs } = this.$refs['SKU']
    this.fetchSku = fetchs
    const { fetchVpc, fetchNetwork } = this.$refs['NETWORK']
    this.fetchVpc = fetchVpc
    this.fetchNetwork = fetchNetwork
  },
  methods: {
    handleNameRepeatedChange (is) {
      console.log(is)
    },
    getVpcParams () {
      return new Promise((resolve, reject) => {
        this.$nextTick(() => {
          resolve({
            cloudregion_id: this.form.getFieldValue('cloudregion'),
            ...this.scopeParams,
          })
        })
      })
    },
    getNetworkParams () {
      return new Promise((resolve, reject) => {
        this.$nextTick(() => {
          const zoneStr = this.form.getFieldValue('zones')
          const params = {
            cloudregion_id: this.form.getFieldValue('region'),
            ...this.scopeParams,
          }
          if (zoneStr) {
            const zoneArr = zoneStr.split('+')
            if (zoneArr && zoneArr.length > 0) {
              for (let i = 0; i < zoneArr.length; i++) {
                params[`zones.${i}`] = zoneArr[i]
              }
            }
          }
          resolve(params)
        })
      })
    },
    async regionChange (values) {
      if (values && values.cloudregion && values.cloudregion) {
        const { cloudregion } = values
        await this.fetchSku(cloudregion)
        await this.fetchVpc()
      }
    },
    zonesChange (values) {
      if (values && values.zones) {
        this.fetchNetwork()
      }
    },
    domainChange (values) {
      if (this.$store.getters.isAdminMode) {
        this.scopeParams['project_domain'] = values.domain || this.form.getFieldValue('domain')
        delete this.scopeParams['scope']
      } else {
        delete this.scopeParams['project_domain']
      }
    },
    _valuesChange (values) {
      this.domainChange(values)
      if (this.form.getFieldValue('cloudregion')) {
        this.regionChange(values)
        this.zonesChange(values)
      }
      this.$nextTick(() => {
        this.formData = this.form.getFieldsValue()
      })
    },
  },
}
</script>
