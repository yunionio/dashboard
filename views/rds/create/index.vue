<template>
  <div>
    <page-header title="新建" />
    <a-form :form="form.fc" class="mt-3">
      <a-divider orientation="left">基础配置</a-divider>
      <a-form-item :label="`指定${$t('dictionary.project')}`" v-bind="formItemLayout">
        <domain-project :decorators="decorators.projectDomain" :fc="form.fc" :labelInValue="false" />
      </a-form-item>
      <a-form-item label="名称" v-bind="formItemLayout">
        <a-input :placeholder="$t('validator.serverName')" v-decorator="decorators.name" />
        <name-repeated v-slot:extra res="dbinstances" :name="form.getFieldValue('name')" />
      </a-form-item>
      <!-- 计费方式 -->
      <clearing-radios v-bind="formItemLayout" />
      <!-- 区域 -->
      <item-area :isRequired="true" :values="form.fc.getFieldsValue()" :names="['city', 'provider', 'cloudregion']" />
      <!-- 套餐信息 -->
      <s-k-u ref="SKU" v-show="form.getFieldValue('cloudregion')" />
      <a-divider orientation="left">高级配置</a-divider>
       <a-form-item label="管理员密码" v-bind="formItemLayout">
         <server-password :loginTypes="loginTypes" :decorator="decorators.loginConfig" :form="form" />
        </a-form-item>
      <network-selects
        ref="NETWORK"
        v-show="form.getFieldValue('cloudregion')"
        label="VPC"
        :vpcParams="getVpcParams"
        :networkParams="getNetworkParams"
        v-bind="formItemLayout" />
      <!-- 选择安全组 -->
      <a-form-item v-if="form.getFieldValue('provider') === 'Huawei'" label="安全组" v-bind="formItemLayout">
        <secgroup-config
          :decorators="decorators.secgroup" />
      </a-form-item>
    </a-form>
    <bottom-bar :values="form.getFieldsValue()" />
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
      decorators: DECORATORS,
      formItemLayout: {
        wrapperCol: { span: CreateServerForm.wrapperCol },
        labelCol: { span: CreateServerForm.labelCol },
      },
      scopeParams: {
        scope: this.$store.getters.scope,
      },
    }
  },
  computed: {
    form () {
      const fc = this.$form.createForm(this, { onFieldsChange: (f, v) => this._fieldsChange(v) })
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
    providerFetchSuccess (list = []) {
      const needProvider = ['Aliyun', 'Huawei']
      return list.filter(({ name }) => needProvider.indexOf(name) > -1)
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
      if (values && values.cloudregion && values.cloudregion.value) {
        const { cloudregion } = values
        await this.fetchSku(cloudregion.value)
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
        if (values.domain && values.domain.key) {
          this.scopeParams['project_domain'] = values.domain.key
        }
        this.scopeParams['project_domain'] = this.form.getFieldValue('domain')
        delete this.scopeParams['scope']
      }
    },
    _fieldsChange (values) {
      this.domainChange(values)
      this.regionChange(values)
      this.zonesChange(values)
    },
  },
}
</script>
