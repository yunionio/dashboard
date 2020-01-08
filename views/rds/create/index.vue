<template>
  <div>
    <page-header title="新建" />
    <a-form :form="form.fc" class="mt-3">
      <a-divider orientation="left">基础配置</a-divider>
      <a-form-item label="指定项目" v-bind="formItemLayout">
        <domain-project :decorators="decorators.projectDomain" :fc="form.fc" :labelInValue="false" />
      </a-form-item>
      <a-form-item label="名称" v-bind="formItemLayout">
        <a-input :placeholder="$t('validator.serverName')" v-decorator="decorators.name" />
        <name-repeated v-slot:extra res="dbinstances" :name="form.getFieldValue('name')" />
      </a-form-item>
      <!-- 计费方式 -->
      <clearing-radios v-bind="formItemLayout" />
      <!-- 区域 -->
      <area-selects
        :cityParams="{cloud_env: 'public'}"
        :names="['city', 'provider', 'cloudregion']"
        v-bind="formItemLayout"
        @providerFetchSuccess="providerFetchSuccess" />
      <!-- 套餐信息 -->
      <s-k-u ref="SKU" />
      <a-divider orientation="left">高级配置</a-divider>
       <a-form-item label="管理员密码" v-bind="formItemLayout">
         <server-password :loginTypes="loginTypes" :decorator="decorators.loginConfig" :form="form" />
        </a-form-item>
      <network-selects lable="VPC" ref="NETWORK" :vpcParams="getVpcParams" :networkParams="getNetworkParams" v-bind="formItemLayout" />
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
import { debounce } from 'lodash'
import { CreateServerForm } from '@Compute/constants'
import ServerPassword from '@Compute/sections/ServerPassword'
import SecgroupConfig from '@Compute/sections/SecgroupConfig'
// import ServerNetwork from '@Compute/sections/ServerNetwork'
import { DECORATORS } from './constants/index'
import SKU from './components/SKU'
import BottomBar from './components/BottomBar'
import NameRepeated from '@/sections/NameRepeated'
import DomainProject from '@/sections/DomainProject'
import NetworkSelects from '@/sections/NetworkSelects'
import AreaSelects from '@/sections/AreaSelects'

export default {
  name: 'RDSCreate',
  components: {
    SKU,
    DomainProject,
    BottomBar,
    ServerPassword,
    AreaSelects,
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
              { required: true, message: '请选择项目' },
            ],
          },
        ],
        domain: [
          'domain',
          {
            initialValue: projectDomainId,
            rules: [
              { required: true, message: '请选择域' },
            ],
          },
        ],
      },
      decorators: DECORATORS,
      formItemLayout: {
        wrapperCol: { span: CreateServerForm.wrapperCol },
        labelCol: { span: CreateServerForm.labelCol },
      },
    }
  },
  computed: {
    form () {
      const fc = this.$form.createForm(this, { onFieldsChange: debounce((f, v) => this._debounceFieldsChange(v), 1) })
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
      if (values && values.cloudregion) {
        const { cloudregion } = values
        // 获取sku筛选项
        // console.log(values.cloudregion)
        await this.fetchSku(cloudregion.value)
        await this.fetchVpc()
      }
    },
    zonesChange (values) {
      if (values && values.zones) {
        this.fetchNetwork()
      }
    },
    _debounceFieldsChange (values) {
      this.regionChange(values)
      this.zonesChange(values)
    },
  },
}
</script>
