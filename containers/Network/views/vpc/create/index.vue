<template>
  <div>
    <page-header :title="$t('network.text_723')" :tabs="cloudEnvOptions" :current-tab.sync="cloudEnv" />
    <page-body needMarginBottom>
      <a-form
        class="mt-3"
        :form="form.fc">
        <a-form-item v-bind="formItemLayout" :label="$t('network.text_205', [$t('dictionary.domain')])" v-if="$store.getters.isAdminMode">
          <domain-select v-decorator="decorators.project_domain" @change="handleDomainChange" />
        </a-form-item>
        <area-selects
          class="mb-0"
          ref="areaSelects"
          :wrapperCol="formItemLayout.wrapperCol"
          :labelCol="formItemLayout.labelCol"
          :names="areaselectsName"
          :cloudregionParams="regionParams"
          :providerParams="providerParams"
          :isRequired="true"
          :cloudregionMapper="cloudregionMapper"
          :region.sync="regionList"
          filterBrandResource="network_manage"
          @change="handleRegionChange" />
        <a-form-item :label="$t('network.text_21')" v-bind="formItemLayout">
          <a-input v-decorator="decorators.name" :placeholder="$t('network.text_684')" />
        </a-form-item>
        <a-form-item :label="$t('common.description')" v-bind="formItemLayout">
          <a-textarea :auto-size="{ minRows: 1, maxRows: 3 }" v-decorator="decorators.description" :placeholder="$t('common_367')" />
        </a-form-item>
        <a-form-item v-if="isShowIp" :label="$t('network.vpc.cidr_block.ipv4.label')" v-bind="formItemLayout" :extra="$t('network.text_686')">
          <a-input v-decorator="decorators.cidr_block" :placeholder="$t('network.text_687')" v-if="cloudEnv !== 'onpremise'" />
          <a-select v-decorator="decorators.cidr_block" allowClear v-else>
            <a-select-option value="192.168.0.0/16">192.168.0.0/16</a-select-option>
            <a-select-option value="172.16.0.0/12">172.16.0.0/12</a-select-option>
            <a-select-option value="10.0.0.0/8">10.0.0.0/8</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item v-if="isShowIp" :label="$t('network.vpc.cidr_block.ipv6.label')" v-bind="formItemLayout" :extra="$t('network.text_686')">
          <a-input v-decorator="decorators.cidr_block6" :placeholder="$t('network.vpc.prefix6.prompt')" />
        </a-form-item>
        <a-form-item :label="$t('network.external_access_mode_label')" v-if="cloudEnv === 'public' || cloudEnv === 'onpremise'" v-bind="formItemLayout">
          <a-switch v-decorator="decorators.external_access_mode" :disabled="!isAws && cloudEnv !== 'onpremise'" />
          <template v-slot:extra>{{ $t('network.external_access_mode_extra') }}</template>
        </a-form-item>
        <template v-if="cloudEnv === 'public' || cloudEnv === 'private'">
          <a-form-item :label="$t('compute.text_15')" required v-bind="formItemLayout" v-show="cloudEnv === 'public' || cloudEnv === 'private'">
            <base-select
              class="w-50"
              v-decorator="decorators.cloudprovider"
              resource="cloudproviders"
              :params="cloudproviderParams"
              :isDefaultSelect="true"
              :needParams="true"
              :showSync="true"
              :select-props="{ placeholder: $t('compute.text_149') }"
              :resList.sync="cloudproviderData"
              @change="handleProviderChange" />
          </a-form-item>
        </template>
        <a-form-item v-if="isGoogle" :label="$t('network.text_242')" v-bind="formItemLayout">
          <base-select
              class="w-50"
              v-decorator="decorators.globalvpc_id"
              resource="globalvpcs"
              :params="globalvpcParams"
              :isDefaultSelect="true"
              :needParams="true"
              :showSync="true"
              :select-props="{ placeholder: $t('compute.text_149') }" />
        </a-form-item>
        <a-form-item :label="$t('common.text00012')" class="mb-0" v-bind="formItemLayout">
          <tag
            v-decorator="decorators.__meta__" />
        </a-form-item>
      </a-form>
    </page-body>
    <page-footer>
      <div slot="right">
        <a-button class="ml-3 float-right" @click="() => $router.back()">{{$t('common.cancel')}}</a-button>
        <a-button class="float-right" type="primary" @click="handleConfirm" :loading="loading">{{ $t('common_258') }}</a-button>
      </div>
    </page-footer>
  </div>
</template>

<script>
import * as R from 'ramda'
import { mapGetters } from 'vuex'
import validateForm, { REGEXP } from '@/utils/validate'
import AreaSelects from '@/sections/AreaSelects'
import DomainSelect from '@/sections/DomainSelect'
import { getCloudEnvOptions } from '@/utils/common/hypervisor'
import Tag from '@/sections/Tag'
import { HYPERVISORS_MAP } from '@/constants'

const { networkSegment, networkSegment6 } = REGEXP

export default {
  name: 'VPCCreate',
  components: {
    AreaSelects,
    DomainSelect,
    Tag,
  },
  data () {
    const cloudEnvOptions = getCloudEnvOptions('network_manage_brands', true)
    const queryType = this.$route.query.type
    let cloudEnv = queryType === 'idc' ? 'onpremise' : this.$route.query.type
    let routerQuery = this.$route.query.type
    if (!cloudEnvOptions.find(val => val.key === cloudEnv)) {
      cloudEnv = cloudEnvOptions[0].key
      routerQuery = cloudEnv === 'onpremise' ? 'idc' : cloudEnv
    }
    return {
      loading: false,
      isGoogle: false,
      isAws: false,
      cloudEnvOptions,
      cloudEnv,
      routerQuery,
      form: {
        fc: this.$form.createForm(this, {
          onValuesChange: (props, values) => {
            if (values.cloudregion) {
              this.cloudregion = values.cloudregion
            }
          },
        }),
      },
      decorators: {
        name: [
          'name',
          {
            validateFirst: true,
            validateTrigger: ['blur'],
            rules: [
              { required: true, message: this.$t('network.text_688') },
              { validator: this.$validate('broadName') },
            ],
          },
        ],
        description: ['description'],
        cloudprovider: [
          'cloudprovider',
          {
            rules: [
              { required: true, message: this.$t('network.text_689') },
            ],
          },
        ],
        globalvpc_id: [
          'globalvpc_id',
          {
            rules: [{ required: true }],
          },
        ],
        cidr_block: [
          'cidr_block',
          {
            validateFirst: true,
            validateTrigger: ['blur'],
            rules: [
              { validator: this.validatePublicIpPrefix4 },
            ],
          },
        ],
        cidr_block6: [
          'cidr_block6',
          {
            validateFirst: true,
            validateTrigger: ['blur'],
            rules: [
              { validator: this.validatePublicIpPrefix6 },
            ],
          },
        ],
        project_domain: [
          'project_domain',
          {
            initialValue: this.$store.getters.userInfo.projectDomainId,
          },
        ],
        external_access_mode: [
          'external_access_mode',
          {
            valuePropName: 'checked',
            initialValue: true,
          },
        ],
        __meta__: [
          '__meta__',
          {
            rules: [
              { validator: validateForm('tagName') },
            ],
          },
        ],
      },
      formItemLayout: {
        wrapperCol: {
          md: { span: 17 },
          xl: { span: 19 },
          xxl: { span: 21 },
        },
        labelCol: {
          md: { span: 7 },
          xl: { span: 5 },
          xxl: { span: 3 },
        },
      },
      project_domain: this.$store.getters.userInfo.projectDomainId,
      cloudproviderData: [],
      cloudregion: '',
      regionList: {},
      cloudprovider: '',
    }
  },
  computed: {
    ...mapGetters(['isAdminMode', 'scope', 'userInfo']),
    cloudproviderParams () {
      if (this.cloudregion.length === 0) {
        return {}
      }
      const params = {
        limit: 0,
        enabled: 1,
        details: true,
        scope: this.scope,
        read_only: false,
        cloudregion: this.cloudregion,
      }
      if (this.isAdminMode) {
        params.admin = true
        params.project_domain = this.project_domain
        delete params.scope
        delete params.domain_id
      }
      return params
    },
    globalvpcParams () {
      const params = {
        scope: this.scope,
        limit: 0,
        details: true,
      }
      if (this.cloudprovider) {
        params.manager_id = this.cloudprovider
      }
      return params
    },
    providerParams () {
      const ret = {
        usable: false,
        cloud_env: this.cloudEnv,
      }
      if (this.isAdminMode) {
        ret.project_domain = this.project_domain
      }
      return ret
    },
    regionParams () {
      const res = {
        cloud_env: this.cloudEnv,
        usable: false,
        status: 'inservice',
      }
      if (this.cloudEnv === 'idc') {
        if (this.isAdminMode) {
          return {
            show_emulated: true,
            project_domain: this.project_domain,
          }
        }
        return {
          show_emulated: true,
        }
      } else if (this.cloudEnv === 'public') {
        if (this.isAdminMode) {
          res.project_domain = this.project_domain
        }
      }
      return res
    },
    areaselectsName () {
      if (this.cloudEnv === 'private' || this.cloudEnv === 'onpremise') {
        return ['cloudregion']
      }
      return ['provider', 'cloudregion']
    },
    currentCloudregion () {
      return this.regionList[this.cloudregion]
    },
    isHCSO () {
      if (this.currentCloudregion) {
        return this.currentCloudregion.provider === HYPERVISORS_MAP.hcso.provider
      }
      return false
    },
    isHCS () {
      if (this.currentCloudregion) {
        return this.currentCloudregion.provider === HYPERVISORS_MAP.hcs.provider
      }
      return false
    },
    isShowIp () {
      if (this.currentCloudregion && this.currentCloudregion.provider === HYPERVISORS_MAP.zettakit.provider) {
        return false
      }
      return true
    },
  },
  watch: {
    cloudEnv () {
      this.cloudregion = ''
      this.$refs.areaSelects.fetchs(['provider', 'cloudregion'])
    },
  },
  provide () {
    return {
      form: this.form,
    }
  },
  methods: {
    validatePublicIpPrefix4 (rule, value, callback) {
      if (value) {
        if (!networkSegment.regexp.test(value)) {
          callback(new Error(networkSegment.message))
          return
        }
        const maskNum = (value && value.split('/').length > 1) ? value.split('/')[1] : null
        const min = 8
        const max = 24
        if (maskNum < min || maskNum > max) {
          callback(new Error(this.$t('network.ipaddr.mask.error', [min, max])))
          return
        }
      } else if (!this.form.fc.getFieldValue('cidr_block6')) {
        callback(new Error(this.$t('network.cidr_block.empty.error')))
        return
      }
      callback()
    },
    validatePublicIpPrefix6 (rule, value, callback) {
      if (value) {
        if (!networkSegment6.regexp.test(value)) {
          callback(new Error(networkSegment6.message))
          return
        }
        const maskNum = (value && value.split('/').length > 1) ? value.split('/')[1] : null
        const min = 48
        const max = 64
        if (maskNum < min || maskNum > max) {
          callback(new Error(this.$t('network.ipaddr.mask.error', [min, max])))
          return
        }
        if (!value.toLowerCase().startsWith('fd')) {
          callback(new Error(this.$t('network.ipv6.private_prefix.error')))
          return
        }
      } else if (!this.form.fc.getFieldValue('cidr_block')) {
        callback(new Error(this.$t('network.cidr_block.empty.error')))
        return
      }
      callback()
    },
    handleRegionChange (data) {
      if (!R.isEmpty(data.cloudregion) && !R.isNil(data.cloudregion)) {
        const { provider } = data.cloudregion.value
        this.isGoogle = provider.toLowerCase() === 'google'
        this.isAws = provider.toLowerCase() === 'aws'
      }
    },
    handleProviderChange (data) {
      this.cloudprovider = data
    },
    cloudregionMapper (data) {
      if (this.cloudEnv === 'private') {
        return data.filter(item => item.provider !== 'ZStack')
      }
      return data
    },
    async checkIp (rule, value, callback) {
      const params = {
        search: value,
      }
      const data = await new this.$Manager('reservedips').list({ params })
      if (data.data.data.length >= 1) {
        callback(new Error(this.$t('network.text_645')))
      } else {
        const ips = Object.values(this.form.fc.getFieldValue('networkIps'))
        const ipsRepreat = Array.from(new Set(ips))
        if (ipsRepreat.length === ips.length) {
          callback()
        } else {
          callback(new Error(this.$t('network.text_644')))
        }
      }
    },
    doCreate (data) {
      return new this.$Manager('vpcs').create({ data })
    },
    handleDomainChange (val) {
      this.project_domain = val
      this.$refs.areaSelects.fetchs(this.areaselectsName)
    },
    async handleConfirm () {
      this.loading = true
      try {
        const values = await this.form.fc.validateFields()
        let params = {}
        if (values.cloudregion) {
          params = {
            cloudregion_id: values.cloudregion,
            manager: values.cloudprovider,
            name: values.name,
            description: values.description,
          }
        } else {
          params = {
            cloudregion_id: values.cloudregion,
            name: values.name,
            description: values.description,
          }
        }
        if (values.cidr_block) {
          params.cidr_block = values.cidr_block
        }
        if (values.cidr_block6) {
          params.cidr_block6 = values.cidr_block6.toLowerCase()
        }
        if (this.isGoogle) {
          params.globalvpc_id = values.globalvpc_id
        }
        if (values.project_domain) {
          params.project_domain = values.project_domain
        }
        params.__meta__ = values.__meta__
        if (this.cloudEnv === 'public') {
          params.external_access_mode = values.external_access_mode ? 'eip' : 'none'
        } else if (this.cloudEnv === 'onpremise') {
          params.external_access_mode = values.external_access_mode ? 'eip-distgw' : 'none'
        }
        await this.doCreate(params)
        this.loading = false
        this.$message.success(this.$t('k8s.text_184'))
        this.$router.push('/vpc')
      } catch (error) {
        this.loading = false
      }
    },
  },
}
</script>
