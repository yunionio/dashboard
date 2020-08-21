<template>
  <div>
    <page-header :title="$t('network.text_26')" :tabs="cloudEnvOptions" :current-tab.sync="cloudEnv" />
    <page-body>
      <a-form
        :form="form.fc">
        <a-form-item :label="$t('network.text_205', [$t('dictionary.project')])" v-bind="formItemLayout" class="mb-0">
          <domain-project :fc="form.fc" :form-layout="formItemLayout" :decorators="{ project: decorators.project, domain: decorators.domain }" @update:domain="domainChange" />
        </a-form-item>
        <area-selects
          class="mb-0"
          ref="areaSelects"
          :wrapperCol="formItemLayout.wrapperCol"
          :labelCol="formItemLayout.labelCol"
          :names="areaselectsName"
          :cloudregionParams="regionParams"
          :isRequired="true"
          :region.sync="regionList"
          @change="cloudregionChange" />
        <a-form-item :label="$t('network.text_21')" v-bind="formItemLayout">
          <a-input v-decorator="decorators.name" :placeholder="$t('network.text_44')" />
        </a-form-item>
        <template v-if="showIpSubnet">
          <ip-subnet
            :label="$t('network.text_211')"
            :isRequired="true"
            :labelCol="formItemLayout.labelCol"
            :wrapperCol="formItemLayout.wrapperCol"
            :decorator="decorators"
            :vpcParams="vpcParams"
            :networkParams="networkParams"
            :vpcResourceMapper="vpcResourceMapper" />
        </template>
        <template v-if="cloudEnv !== 'private'">
          <a-form-item :label="$t('network.text_192')" v-bind="formItemLayout" v-if="cloudEnv !== 'onpremise' ">
            <a-radio-group v-decorator="decorators.charge_type" @change="chargeTypeChange">
              <a-radio-button v-for="item in chargeTypeOptions" :value="item.value" :key="item.value">
                {{item.label}}
              </a-radio-button>
            </a-radio-group>
          </a-form-item>
          <a-form-item :label="$t('network.text_484')" v-bind="formItemLayout">
            <div class="d-flex align-items-center">
              <a-input-number v-if="cloudEnv === 'onpremise'" style="width: 120px" :precision="0" :min="1" :max="200" v-decorator="decorators.bandwidth" />
              <a-tooltip v-else placement="top" :title="$t('monitor.text_8', maxBandwidth)">
              <a-input-number
                style="width: 120px"
                :min="1"
                :max="maxBandwidth"
                :step="50"
                :formatter="format"
                :parse="format"
                v-decorator="decorators.bandwidth" />
              </a-tooltip>
              <span class="ml-2">Mbps</span>
            </div>
          </a-form-item>
        </template>
        <a-form-item :label="$t('compute.text_15')" v-bind="formItemLayout" v-if="cloudEnv === 'public'" key="manager">
          <base-select
            :remote="true"
            v-decorator="decorators.manager"
            resource="cloudproviders"
            :params="providerParams"
            :mapper="providerMapper"
            :label-format="labelFormat"
            :remote-fn="q => ({ filter: `name.contains(${q})` })"
            @update:item="providerChange"
            :isDefaultSelect="true"
            :select-props="{ placeholder: $t('compute.text_149') }"
            style="width: 320px" />
        </a-form-item>
      </a-form>
    </page-body>
    <page-footer>
      <div slot="right">
        <a-button class="float-right" type="primary" @click="handleConfirm" :loading="loading">{{ $t('common_258') }}</a-button>
      </div>
    </page-footer>
  </div>
</template>

<script>
import * as R from 'ramda'
import { mapGetters } from 'vuex'
import IpSubnet from '../../../sections/IpSubnet'
import AreaSelects from '@/sections/AreaSelects'
import DomainProject from '@/sections/DomainProject'
import { isRequired } from '@/utils/validate'
import { getCloudEnvOptions } from '@/utils/common/hypervisor'

export default {
  name: 'EipCreate',
  components: {
    AreaSelects,
    DomainProject,
    IpSubnet,
  },
  data () {
    const cloudEnvOptions = getCloudEnvOptions('compute_engine_brands', true)
    const queryType = this.$route.query.type
    let cloudEnv = queryType === 'idc' ? 'onpremise' : this.$route.query.type
    let routerQuery = this.$route.query.type
    if (!cloudEnvOptions.find(val => val.key === cloudEnv)) {
      cloudEnv = cloudEnvOptions[0].key
      routerQuery = cloudEnv === 'onpremise' ? 'idc' : cloudEnv
    }
    return {
      loading: false,
      inputIpType: 'random',
      cloudEnvOptions,
      cloudEnv,
      routerQuery,
      form: {
        fc: this.$form.createForm(this, {
          onValuesChange: (props, values) => {
            if (values.cloudregion) {
              this.selectedRegionItem = this.regionList[values.cloudregion]
            }
          },
        }),
      },
      decorators: {
        domain: [
          'domain',
          {
            rules: [
              { validator: isRequired(), message: this.$t('rules.domain'), trigger: 'change' },
            ],
          },
        ],
        project: [
          'project',
          {
            rules: [
              { validator: isRequired(), message: this.$t('dictionary.project'), trigger: 'change' },
            ],
          },
        ],
        manager: [
          'manager',
          {
            rules: [
              { required: true, message: this.$t('network.text_215') },
            ],
          },
        ],
        vpc: [
          'vpc',
          {
            rules: [
              { required: true, message: this.$t('network.text_212') },
            ],
          },
        ],
        network: [
          'network',
          {
            rules: [
              { required: true, message: this.$t('network.text_212') },
            ],
          },
        ],
        ip_addr: [
          'ip_addr',
          {
            validateFirst: true,
            rules: [
              { required: true, message: this.$t('network.text_217') },
              { validator: this.$validate('IPv4') },
            ],
          },
        ],
        bandwidth: [
          'bandwidth',
          {
            initialValue: 30,
          },
        ],
        name: [
          'name',
          {
            validateFirst: true,
            rules: [
              { required: true, message: this.$t('network.text_218') },
              { validator: this.$validate('serverName') },
            ],
          },
        ],
        charge_type: [
          'charge_type',
          {
            initialValue: 'traffic',
          },
        ],
      },
      formItemLayout: {
        wrapperCol: {
          span: 21,
        },
        labelCol: {
          span: 3,
        },
      },
      manager: '',
      selectedRegionItem: {},
      showBandwidth: true,
      charge_type: 'traffic',
      providerC: '',
      domain_id: 'default',
      providerParams: {
        enabled: 1,
        details: true,
        public_cloud: true,
        scope: this.$store.getters.scope,
        usable: true,
      },
      regionList: {},
    }
  },
  computed: {
    ...mapGetters(['isAdminMode', 'scope', 'userInfo']),
    sliderMarks () {
      let ret = { [this.maxBandwidth / 2]: `${this.maxBandwidth / 2}Mbps` }
      ret = { ...ret, ...{ 1: '1Mbps', [this.maxBandwidth]: `${this.maxBandwidth}Mbps` } }
      return ret
    },
    regionParams () {
      let params = {}
      if (this.manager) {
        params = {
          manager: this.manager,
          usable: true,
          scope: this.$store.getters.scope,
          show_emulated: true,
          capability: 'compute',
        }
      }
      if (this.cloudEnv === 'onpremise') {
        params = {
          cloud_env: 'onpremise',
          usable: true,
          show_emulated: true,
          scope: this.$store.getters.scope,
        }
      }
      if (this.isAdminMode) {
        params.project_domain = this.domain_id
        delete params.scope
      }
      return params
    },
    networkParams () {
      if (this.manager) {
        return {
          manager: this.manager,
          limit: 0,
          scope: this.scope,
        }
      }
      if (this.cloudEnv === 'onpremise' && !R.isEmpty(this.selectedRegionItem)) {
        return {
          limit: 0,
          scope: this.scope,
          server_type: 'eip',
          cloudregion_id: this.selectedRegionItem.id,
        }
      }
      return {}
    },
    vpcParams () {
      const params = {
        scope: this.scope,
        cloudregion_id: this.selectedRegionItem.id,
      }
      if (this.isAdminMode) {
        params.project_domain = this.domain_id
        delete params.scope
      }
      return params
    },
    chargeTypeOptions () {
      if (this.showBandwidth) {
        return [
          { label: this.$t('network.text_193'), value: 'traffic' },
          { label: this.$t('network.text_194'), value: 'bandwidth' },
        ]
      } else {
        return [
          { label: this.$t('network.text_193'), value: 'traffic' },
        ]
      }
    },
    maxBandwidth () {
      if (this.cloudEnv === 'idc') {
        return 999999
      }
      let maxBandwidth = 200
      if (!R.isEmpty(this.selectedRegionItem)) {
        if (this.charge_type === 'bandwidth') {
          if (this.selectedRegionItem.provider === 'Huawei') {
            maxBandwidth = 2000
          } else if (this.selectedRegionItem.provider === 'Aliyun') {
            maxBandwidth = 500
          }
        } else {
          if (this.selectedRegionItem.provider === 'Huawei') {
            maxBandwidth = 300
          } else {
            maxBandwidth = 200
          }
        }
      }
      return maxBandwidth
    },
    updateProviderParams: {
      get () {
        return this.providerParams
      },
      set (newValue) {
        this.providerParams = newValue
      },
    },
    areaselectsName () {
      if (this.cloudEnv === 'private' || this.cloudEnv === 'onpremise') {
        return ['cloudregion']
      }
      return ['city', 'provider', 'cloudregion']
    },
    showIpSubnet () {
      if (this.providerC === 'zstack' || this.providerC === 'openstack') return true
      if (this.cloudEnv === 'onpremise' && this.selectedRegionItem && this.selectedRegionItem.id) return true
      if (this.cloudEnv === 'private' && this.selectedRegionItem && this.selectedRegionItem.id) return true
      return false
    },
  },
  watch: {
    cloudEnv (newValue) {
      if (R.has('public_cloud', this.updateProviderParams)) {
        Reflect.deleteProperty(this.updateProviderParams, 'public_cloud')
      } else {
        Reflect.deleteProperty(this.updateProviderParams, 'private_cloud')
      }
      const platform = newValue + '_cloud'
      this.updateProviderParams = {
        ...this.updateProviderParams,
        [platform]: true,
      }
      this.$refs.areaSelects.fetchs(this.areaselectsName)
      this.form.fc.resetFields(['manager'])
      this.manager = ''
      this.providerC = ''
    },
  },
  provide () {
    return {
      form: this.form,
    }
  },
  methods: {
    format (val) {
      return +val || 1
    },
    vpcResourceMapper (data) {
      if (this.cloudEnv === 'onpremise') {
        data = data.filter(item => item.id === 'default')
        return data
      }
      return data
    },
    domainChange (item) {
      if (R.type(item) === 'Object') {
        this.domain_id = item.key
      } else {
        this.domain_id = item
      }
      if (this.isAdminMode) {
        this.updateProviderParams = {
          ...this.updateProviderParams,
          project_domain: this.domain_id,
        }
        delete this.updateProviderParams.scope
      } else {
        this.updateProviderParams = {
          ...this.updateProviderParams,
          scope: this.$store.getters.scope,
        }
      }
    },
    cloudregionChange (data) {
      if (!R.isNil(data.cloudregion) && !R.isEmpty(data.cloudregion)) {
        this.updateProviderParams = {
          ...this.updateProviderParams,
          cloudregion_id: data.cloudregion.id,
        }
      }
    },
    providerMapper (data) {
      data = data.filter(item => item.status === 'connected' && item.enabled)
      return data
    },
    providerChange (e) {
      if (e) {
        this.manager = e.id
        if (e.provider.toLowerCase() === 'azure') {
          this.form.fc.setFieldsValue({ bandwidth: 0 })
        } else {
          this.form.fc.setFieldsValue({ bandwidth: 30 })
        }
        this.hiddenBrandwidthHandle(e.provider)
        this.providerC = e.provider.toLowerCase()
      }
    },
    chargeTypeChange (e) {
      this.charge_type = e.target.value
    },
    labelFormat (item) {
      return `${item.provider}/${item.cloudaccount}/${item.name}`
    },
    hiddenBrandwidthHandle (selectedProvider) {
      const providers = ['Azure', 'Aws', 'Qcloud', 'Google']
      if (providers.some(v => v === selectedProvider)) {
        this.form.fc.setFieldsValue({ bandwidth: 1 })
        this.showBandwidth = false
      } else {
        this.form.fc.setFieldsValue({ bandwidth: 30 })
        this.showBandwidth = true
      }
    },
    doCreate (data) {
      return new this.$Manager('eips').create({ data })
    },
    async handleConfirm () {
      this.loading = true
      try {
        const values = await this.form.fc.validateFields()
        values.tenant = values.project.key
        values.domain = values.domain.key
        Reflect.deleteProperty(values, 'project')
        if (this.cloudEnv === 'private') {
          delete values.charge_type
          values.bandwidth = 0
          if (values.ip_addr) {
            values.ip = values.ip_addr
            delete values.ip_addr
          }
        }
        await this.doCreate(values)
        this.loading = false
        this.$message.success(this.$t('k8s.text_184'))
        this.$router.push('/eip')
      } catch (error) {
        this.loading = false
        throw error
      }
    },
  },
}
</script>
