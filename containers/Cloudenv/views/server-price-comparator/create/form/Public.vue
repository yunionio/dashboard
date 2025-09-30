<template>
  <div>
    <a-form
      class="mt-3"
      :form="form.fc"
      v-bind="formItemLayout"
      @submit="submit"
      hideRequiredMark>
      <a-form-item :label="$t('compute.text_297', [$t('dictionary.project')])" v-show="false">
        <domain-project
          :fc="form.fc"
          :fd="form.fd"
          :decorators="{ project: decorators.project, domain: decorators.domain }"
          @fetchDomainCallback="fetchDomainCallback"
          @fetchProjectCallback="fetchProjectCallback" />
      </a-form-item>
      <a-form-item class="mb-0" :label="$t('compute.text_498')">
        <bill :decorators="decorators.bill" :form="form" :provider-list="form.fi.providerList" :disabledBillType="disabledBillType" />
      </a-form-item>
      <a-form-item :label="$t('compute.text_294')">
        <a-input-number v-decorator="decorators.count" @blur="countBlur" :min="1" :max="100" />
      </a-form-item>
      <area-selects
        class="mb-0"
        v-if="showAreaSelect"
        :wrapperCol="formItemLayout.wrapperCol"
        :labelCol="formItemLayout.labelCol"
        ref="areaSelectRef"
        :providerParams="providerParams"
        :cloudregionParams="cloudregionParams"
        :zoneParams="zoneParams"
        :defaultActiveFirstOption="['provider']"
        filterBrandResource="compute_engine"
        @providerFetchSuccess="providerFetchSuccess" />
      <a-form-item :label="$t('compute.text_1058')" class="mb-0">
        <cpu-radio :decorator="decorators.vcpu" :options="form.fi.cpuMem.cpus || []" @change="cpuChange" />
      </a-form-item>
      <a-form-item :label="$t('compute.text_369')" class="mb-0">
        <mem-radio :decorator="decorators.vmem" :options="form.fi.cpuMem.mems_mb || []" />
      </a-form-item>
      <a-form-item :label="$t('compute.text_109')">
        <sku
          v-decorator="decorators.sku"
          :priceUnit="skuPriceUnit"
          :type="type"
          :sku-params="skuParam"
          :hypervisor="hypervisor"
          :hasMeterService="hasMeterService" />
      </a-form-item>
      <a-form-item :label="$t('compute.text_49')" class="mb-0">
        <system-disk
          v-if="form.fd.sku"
          :decorator="decorators.systemDisk"
          :type="type"
          :form="form"
          :hypervisor="hypervisor"
          :sku="form.fd.sku"
          :capability-data="form.fi.capability"
          :image="form.fi.imageMsg" />
      </a-form-item>
      <a-form-item :label="$t('compute.text_50')">
        <data-disk
          v-if="form.fd.sku"
          :decorator="decorators.dataDisk"
          :type="type"
          :form="form"
          :hypervisor="hypervisor"
          :sku="form.fd.sku"
          :defaultType="form.fd.systemDiskType"
          :capability-data="form.fi.capability"
          :simplify="true"
          ref="dataDiskRef" />
      </a-form-item>
      <bottom-bar
        ref="bottomBarRef"
        :loading="submiting"
        :form="form"
        :errors.sync="errors"
        :type="type"
        :resourceType="form.fd.resourceType"
        :dataDiskSizes="dataDiskSizes"
        :isOpenWorkflow="isOpenWorkflow"
        :isServertemplate="isServertemplate"
        :hasMeterService="hasMeterService" />
    </a-form>
  </div>
</template>
<script>
import * as R from 'ramda'
import Bill from '../components/Bill'
import mixin from './mixin'
import { LOGIN_TYPES_MAP, BILL_TYPES_MAP } from '@Compute/constants'
import { resolveValueChangeField } from '@/utils/common/ant'
import { PROVIDER_MAP, HYPERVISORS_MAP } from '@/constants'
import AreaSelects from '@/sections/AreaSelects'

export default {
  name: 'VMPublicCreate',
  components: {
    Bill,
    AreaSelects,
  },
  mixins: [mixin],
  computed: {
    // 是否为包年包月
    isPackage () {
      return this.form.fd.billType === BILL_TYPES_MAP.package.key
    },
    showAreaSelect () {
      if (this.$store.getters.isAdminMode && this.$store.getters.l3PermissionEnable) {
        if (this.form.fd.domain && this.form.fd.domain.key) {
          return true
        } else {
          return false
        }
      }
      return true
    },
    networkParam () {
      if (!this.cloudregionZoneParams.cloudregion) return {}
      const params = {
        filter: 'server_type.notin(ipmi, pxe)',
        usable: true,
        ...this.cloudregionZoneParams,
        ...this.scopeParams,
      }
      return params
    },
    providerParams () {
      return {
        usable: true,
        public_cloud: true,
        scope: this.$store.getters.scope,
      }
    },
    cloudregionParams () {
      return {
        cloud_env: 'public',
        usable: true,
        show_emulated: true,
        scope: this.$store.getters.scope,
      }
    },
    zoneParams () {
      return {
        cloud_env: 'public',
        usable: true,
        show_emulated: true,
        order_by: 'created_at',
        order: 'asc',
        scope: this.$store.getters.scope,
      }
    },
    cacheImageParams () {
      const params = {}
      if (R.is(Object, this.form.fd.sku)) {
        if (this.cloudregionZoneParams.cloudregion) {
          params.cloudregion_id = this.cloudregionZoneParams.cloudregion
        }
      }
      if (!params.cloudregion_id) return {}
      return params
    },
    eipParams () {
      if (!this.cloudregionZoneParams.cloudregion) return {}
      return {
        project: this.project,
        region: this.cloudregionZoneParams.cloudregion,
      }
    },
    skuPriceUnit () {
      if (this.isPackage) {
        return {
          key: 'month_price',
          unit: this.$t('compute.text_173'),
        }
      }
      return {
        key: 'hour_price',
        unit: this.$t('compute.text_172'),
      }
    },
    skuParam () {
      const params = {
        public_cloud: true,
        limit: 0,
        cpu_core_count: this.form.fd.vcpu || this.decorators.vcpu[1].initialValue,
        memory_size_mb: this.form.fd.vmem,
        usable: true,
        enabled: true,
        ...this.scopeParams,
      }
      if (this.$store.getters.isAdminMode) {
        delete params.project_domain
      }
      if (this.form.fd.cloudregion) params.cloudregion = this.form.fd.cloudregion
      if (this.form.fd.zone) params.zone_id = this.form.fd.zone
      const { provider } = this.form.fd
      if (provider) {
        params.provider = PROVIDER_MAP[provider] ? PROVIDER_MAP[provider].hypervisor : provider
      } else {
        const providerList = this.form.fi.providerList
        if (providerList && providerList.length) {
          const providers = providerList.map(item => item.name)
          params.filter = `provider.in(${providers.join(',')})`
        } else { // 公有云条件下没有 provider 不用请求接口
          return {} // sku 组件没有参数不会请求数据
        }
      }
      if (this.form.fd.billType === 'quantity') {
        params.postpaid_status = 'available'
      } else if (this.form.fd.billType === 'package') {
        params.prepaid_status = 'available'
      }
      return params
    },
    policyHostParams () {
      const params = {
        show_emulated: true,
        resource_type: 'shared',
        enabled: 1,
        usable: true,
        limit: 0,
      }
      if (this.cloudregionZoneParams) {
        params.zone = this.cloudregionZoneParams.zone
        if (!params.zone) {
          params.cloudregion = this.cloudregionZoneParams.cloudregion
        }
      }
      if (!params.zone && !params.cloudregion) {
        return // 此时将不请求接口
      }
      return params
    },
    hypervisor () {
      if (R.is(Object, this.form.fd.sku)) {
        const { provider } = this.form.fd.sku
        if (provider) {
          return PROVIDER_MAP[provider].hypervisor
        }
      }
      return ''
    },
    loginTypes () {
      const loginTypes = { ...LOGIN_TYPES_MAP }
      const hypervisor = this.hypervisor
      if (HYPERVISORS_MAP.ucloud.key === hypervisor) {
        delete loginTypes[LOGIN_TYPES_MAP.image.key]
        delete loginTypes[LOGIN_TYPES_MAP.keypair.key]
      }
      if (HYPERVISORS_MAP.aws.key === hypervisor) {
        delete loginTypes[LOGIN_TYPES_MAP.random.key]
        delete loginTypes[LOGIN_TYPES_MAP.password.key]
      }
      if (HYPERVISORS_MAP.azure.key === hypervisor) {
        delete loginTypes[LOGIN_TYPES_MAP.image.key]
      }
      if (HYPERVISORS_MAP.ctyun.key === hypervisor) {
        delete loginTypes[LOGIN_TYPES_MAP.keypair.key]
        delete loginTypes[LOGIN_TYPES_MAP.image.key]
      }
      if (HYPERVISORS_MAP.google.key === hypervisor) {
        delete loginTypes[LOGIN_TYPES_MAP.image.key]
      }
      if (HYPERVISORS_MAP.qcloud.key === hypervisor) {
        delete loginTypes[LOGIN_TYPES_MAP.image.key]
      }
      if (this.form.fd.os === 'Windows') {
        // 以下平台在选择 windows 镜像时禁用关联密钥
        const disableKeypairHyper = [
          HYPERVISORS_MAP.azure.key,
          HYPERVISORS_MAP.aliyun.key,
          HYPERVISORS_MAP.qcloud.key,
          HYPERVISORS_MAP.ucloud.key,
          HYPERVISORS_MAP.esxi.key,
          HYPERVISORS_MAP.ksyun.key,
        ]
        if (disableKeypairHyper.includes(hypervisor)) {
          delete loginTypes[LOGIN_TYPES_MAP.keypair.key]
        }
        if (HYPERVISORS_MAP.google.key === hypervisor) {
          delete loginTypes[LOGIN_TYPES_MAP.keypair.key]
        }
      }
      if (this.isServertemplate) {
        delete loginTypes[LOGIN_TYPES_MAP.keypair.key]
        delete loginTypes[LOGIN_TYPES_MAP.password.key]
      }
      return Object.keys(loginTypes)
    },
    osSelectTypes () {
      if (HYPERVISORS_MAP.ctyun.key === this.hypervisor) {
        return ['public', 'public_customize']
      }
      return []
    },
    instanceSpecParams () {
      const params = {
        public_cloud: true,
        usable: true,
        enabled: true,
      }
      const { provider, cloudregion, zone } = this.form.fd
      if (provider) params.provider = provider
      if (cloudregion) params.cloudregion = cloudregion
      if (zone) params.zone = zone
      return params
    },
    cloudproviderParamsExtra () {
      const params = {
        ...this.scopeParams,
      }
      const { cloudregion } = this.form.fd
      if (this.form.fd.sku && this.form.fd.sku.provider) {
        params.provider = this.form.fd.sku.provider
      }
      if (cloudregion) params.cloudregion = cloudregion
      return params
    },
    hideCloudaccountSched () {
      return !!this.form.fd.prefer_manager
    },
    disabledBillType () {
      if (this.form.fd.sku && this.form.fd.sku.provider) {
        if (this.form.fd.sku.provider === PROVIDER_MAP.Google.key) { // 谷歌云不支持包年包月
          return 'package'
        }
      }
      return ''
    },
    policycloudproviderParams () {
      const params = {
        limit: 0,
        cloudregion: this.cloudregionZoneParams.cloudregion,
        ...this.scopeParams,
      }
      if (this.form.fd.zone) {
        params.zone = this.form.fd.zone
      }
      if (this.form.fi.networkVpcObj && this.form.fi.networkVpcObj.manager_id) {
        params.search = this.form.fi.networkVpcObj.manager_id
      }
      return params
    },
  },
  watch: {
    'form.fd.billType' (val) {
      // 计费方式为包年包月平台不含 azure、aws，这里统一做清空处理
      if (val === BILL_TYPES_MAP.package.key) {
        this.form.fc.setFieldsValue({
          provider: undefined,
          cloudregion: undefined,
          zone: undefined,
        })
      }
      this.$refs.areaSelectRef.fetchs(['provider'])
    },
    'form.fd.duration' (val, oldVal) {
      if (this.form.fd.billType === BILL_TYPES_MAP.package.key) {
        if (val === '1W' || oldVal === '1W') {
          this.form.fc.setFieldsValue({
            provider: undefined,
            cloudregion: undefined,
            zone: undefined,
          })
          this.$refs.areaSelectRef.fetchs(['provider', 'cloudregion', 'zone'])
        }
      }
    },
  },
  created () {
    this.baywatch(['form.fd.provider', 'form.fd.cloudregion', 'form.fd.zone'], this.fetchInstanceSpecs)
    this.baywatch(['form.fd.sku', 'form.fd.zone'], this.withFetchCapbilites)
  },
  methods: {
    providerFetchSuccess (list) {
      // 计费方式为包年包月平台不含 azure、aws、google
      if (this.form.fd.billType === BILL_TYPES_MAP.package.key) {
        if (this.form.fd.duration === '1W') {
          list = list.filter(item => HYPERVISORS_MAP.aliyun.key === item.name.toLowerCase())
          this.form.fc.setFieldsValue({
            provider: HYPERVISORS_MAP.aliyun.provider,
          })
        } else {
          list = list.filter(item => {
            return ![HYPERVISORS_MAP.azure.key, HYPERVISORS_MAP.aws.key, HYPERVISORS_MAP.google.key].includes(item.name.toLowerCase())
          })
        }
      }
      // 过滤京东云和移动云等只读的云
      list = list.filter(item => {
        return ![HYPERVISORS_MAP.jdcloud.key, HYPERVISORS_MAP.ecloud.key].includes(item.name.toLowerCase())
      })
      this.$set(this.form.fi, 'providerList', list)
      return list
    },
    onValuesChange (vm, changedFields) {
      this.$nextTick(() => {
        const formValue = this.form.fc.getFieldsValue()
        const newField = resolveValueChangeField(changedFields)
        this._setNewFieldToFd(newField, formValue)
      })
    },
    async fetchCapability () {
      const params = {
        show_emulated: true,
        scope: 'system',
        resource_type: this.form.fc.getFieldValue('resourceType'),
      }
      let id = this.cloudregionZoneParams.cloudregion
      let resource = 'cloudregions'
      if (this.cloudregionZoneParams.zone) {
        id = this.cloudregionZoneParams.zone
        resource = 'zones'
      }
      const capabilityParams = { id, spec: 'disk-capability', params }
      if (!id) return
      if (R.equals(this.capabilityParams, capabilityParams)) return // 和已有的参数一样则不发请求
      this.capabilityParams = capabilityParams
      try {
        const { data } = await new this.$Manager(resource).getSpecific(this.capabilityParams)
        this.form.fi.capability = data
      } catch (error) {
        throw error
      }
    },
    async fetchInstanceSpecs () {
      try {
        const { data } = await this.serverskusM.get({ id: 'instance-specs', params: this.instanceSpecParams })
        this.form.fi.cpuMem = data
        const vcpuDecorator = this.decorators.vcpu
        const vcpuInit = vcpuDecorator[1].initialValue
        const cpu = this.form.fd.vcpu || vcpuInit
        this.cpuChange(cpu)
      } catch (error) {
        throw error
      }
    },
    withFetchCapbilites (val, oldVal) {
      if (val && !R.equals(val, oldVal)) {
        this.fetchCapability()
      }
    },
  },
}
</script>
