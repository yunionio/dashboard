<template>
  <div>
    <a-form
      class="mt-3"
      :form="form.fc"
      v-bind="formItemLayout"
      @submit="submit"
      hideRequiredMark>
      <servertemplate v-if="isServertemplate" :decorators="decorators.servertemplate">
        <a-form-item :label="$t('compute.text_297', [$t('dictionary.project')])">
          <domain-project :fc="form.fc" :decorators="{ project: decorators.project, domain: decorators.domain }" />
        </a-form-item>
      </servertemplate>
      <!-- <a-divider orientation="left">{{$t('compute.text_300')}}</a-divider> -->
      <a-form-item v-if="!isServertemplate" :label="$t('compute.text_297', [$t('dictionary.project')])">
        <domain-project
          :fc="form.fc"
          :fd="form.fd"
          :decorators="{ project: decorators.project, domain: decorators.domain }"
          :ignoreStorage="isInitForm"
          @fetchDomainCallback="fetchDomainCallback"
          @fetchProjectCallback="fetchProjectCallback" />
      </a-form-item>
      <a-form-item :label="$t('compute.text_228')" v-if="!isServertemplate">
        <a-input v-decorator="decorators.name" />
        <template v-slot:extra>
          <name-repeated
            res="servers"
            :name="form.fd.name"
            :default-text="$t('compute.text_893')" />
        </template>
      </a-form-item>
      <a-form-item :label="$t('common.description')" v-if="!isServertemplate">
        <a-textarea :auto-size="{ minRows: 1, maxRows: 3 }" v-decorator="decorators.description" :placeholder="$t('common_367')" />
      </a-form-item>
      <a-form-item :label="$t('compute.text_1041')" v-if="isOpenWorkflow">
        <a-input v-decorator="decorators.reason" :placeholder="$t('compute.text_1042')" />
      </a-form-item>
      <a-form-item class="mb-0" :label="$t('compute.text_498')">
        <bill :decorators="decorators.bill" :form="form" :provider-list="form.fi.providerList" />
      </a-form-item>
      <a-form-item v-if="form.fd.billType === 'quantity' && !isServertemplate" :label="$t('compute.text_1132')">
        <duration useServerDuration :decorators="decorators.duration" :form="form" />
      </a-form-item>
      <a-form-item :label="$t('compute.text_294')" v-show="!isServertemplate">
        <a-input-number v-decorator="decorators.count" @blur="countBlur" :min="1" :max="100" />
      </a-form-item>
      <a-form-item :label="$t('regionMap.enable_world_map')">
        <a-switch v-decorator="decorators.enableWorldMap" @change="onWorldMapModeChange" />
      </a-form-item>
      <a-form-item v-if="form.fd.enableWorldMap" :label="$t('compute.text_177')">
        <region-map
          :region-filter-params="regionMapParams"
          filter-brand-resource="compute_engine"
          :region-mapper="filterMapCloudregionList"
          split-key="provider"
          @select="onRegionSelect"
          @params-change="onRegionMapParamsChange" />
      </a-form-item>
      <area-selects
        class="mb-0"
        v-if="showAreaSelect"
        :wrapperCol="formItemLayout.wrapperCol"
        :labelCol="formItemLayout.labelCol"
        ref="areaSelectRef"
        :providerParams="providerParams"
        :cloudregionParams="areaCloudregionParams"
        :zoneParams="zoneParams"
        :provider-mapper="mapProviderMapper"
        :provider-multiple="true"
        :cloudregion-multiple="true"
        :zone-multiple="true"
        :cloudregion-mapper="mapCloudregionMapper"
        :cloudregion-params-mapper="mapCloudregionParamsMapper"
        :zone-mapper="mapZoneMapper"
        :defaultActiveFirstOption="areaDefaultActiveFirstOption"
        filterBrandResource="compute_engine"
        @providerFetchSuccess="providerFetchSuccess" />
      <!-- <a-form-item class="mb-0" :label="$t('compute.text_1159')">
        <resource :decorator="decorators.resourceType" />
      </a-form-item> -->
      <a-form-item :label="$t('compute.text_1058')" class="mb-0">
        <cpu-radio :decorator="decorators.vcpu" :options="form.fi.cpuMem.cpus || []" :showUnlimited="true" @change="cpuChange" />
      </a-form-item>
      <a-form-item :label="$t('compute.text_369')" class="mb-0">
        <mem-radio :decorator="decorators.vmem" :options="form.fi.cpuMem.mems_mb || []" :showUnlimited="true" />
      </a-form-item>
      <a-form-item :label="$t('compute.text_109')">
        <sku
          ref="skuRef"
          v-decorator="decorators.sku"
          :priceUnit="skuPriceUnit"
          :type="type"
          :sku-params="skuParam"
          :hypervisor="hypervisor"
          :hasMeterService="hasMeterService"
          :init-sku-data="initSkuData" />
      </a-form-item>
      <a-form-item :label="$t('compute.text_15')">
        <base-select
          resource="cloudproviders"
          v-decorator="decorators.cloudprovider"
          :params="policycloudproviderParams"
          :isDefaultSelect="true"
          :showSync="true"
          :select-props="{ placeholder: $t('compute.text_149') }"
          @update:item="cloudproviderSelected" />
      </a-form-item>
      <a-form-item :label="$t('compute.text_267')" :extra="$t('compute.text_302')">
        <os-select
          :type="type"
          :form="form"
          :types="osSelectTypes"
          :hypervisor="hypervisor"
          :decorator="decorators.imageOS"
          :os-arch="osArch"
          :imageParams="imageParams"
          :cacheImageParams="cacheImageParams"
          :cloudproviderParamsExtra="cloudproviderParamsExtra"
          @updateImageMsg="updateFi" />
      </a-form-item>
      <a-form-item :label="$t('compute.text_49')" class="mb-0">
        <system-disk
          ref="systemDiskRef"
          v-if="form.fd.sku"
          :decorator="decorators.systemDisk"
          :type="type"
          :form="form"
          :hypervisor="hypervisor"
          :sku="form.fd.sku"
          :capability-data="form.fi.capability"
          :image="form.fi.imageMsg"
          :isServertemplate="isServertemplate"
          is-iops-show
          is-throughput-show />
      </a-form-item>
      <a-form-item :label="$t('compute.text_50')">
        <data-disk
          v-if="form.fd.sku"
          :isInitForm="isInitForm"
          :decorator="decorators.dataDisk"
          :type="type"
          :form="form"
          :hypervisor="hypervisor"
          :sku="form.fd.sku"
          :defaultType="form.fd.systemDiskType"
          :capability-data="form.fi.capability"
          :isServertemplate="isServertemplate"
          ref="dataDiskRef"
          is-iops-show
          is-throughput-show />
      </a-form-item>
      <a-form-item :label="$t('compute.text_1372')" v-if="showServerAccount">
        <server-account :form="form" :hypervisor="hypervisor" :instance_capabilities="form.fi.capability.instance_capabilities" :osType="osType" />
      </a-form-item>
      <a-form-item :label="$t('compute.text_308')">
        <server-password :decorator="decorators.loginConfig" :loginTypes="loginTypes" :form="form" />
      </a-form-item>
      <a-alert
        v-if="needsSkuForAreaDownstream"
        type="info"
        show-icon
        :message="$t('regionMap.select_sku_first_tip')"
        class="mb-2" />
      <a-form-item :label="$t('compute.text_104')" class="mb-0">
        <server-network
          ref="networkRef"
          :form="form"
          :decorator="decorators.network"
          :network-list-params="networkParam"
          :schedtag-params="schedtagParams"
          :networkVpcParams="networkVpcParams"
          :vpcResource="vpcResource"
          :serverCount="form.fd.count"
          :networkResourceMapper="networkResourceMapper"
          :cloudprovider="form.fd.cloudprovider" />
      </a-form-item>
      <a-form-item :label="$t('compute.text_1154')" class="mb-0">
        <tag
          v-decorator="decorators.tag" :default-checked="tagDefaultChecked" />
      </a-form-item>
      <!-- <a-divider orientation="left">{{$t('compute.text_309')}}</a-divider> -->
      <a-collapse :bordered="false" v-model="collapseActive">
        <a-collapse-panel :header="$t('compute.text_309')" key="1">
          <eip-config
            v-if="enableEip"
            ref="eipConfigRef"
            :decorators="decorators.eip"
            :eip-params="eipParams"
            :hypervisor="hypervisor"
            :showBind="false"
            :isServertemplate="isServertemplate"
            :cloud-env="type"
            :form="form"
            :hasPublicIp="hypervisor === 'qcloud' || hypervisor === 'aliyun'"
            :formItemLayout="formItemLayout" />
          <a-form-item v-if="!isServertemplate">
            <span slot="label">
              {{ $t('common_388') }}&nbsp;
              <a-tooltip :title="hostNameTips">
                <a-icon type="question-circle-o" />
              </a-tooltip>
            </span>
            <host-name v-decorator="decorators.hostName" :isWindows="isWindows" />
          </a-form-item>
          <a-form-item :label="$t('compute.text_105')">
            <secgroup-config
              :provider="hypervisor"
              :form="form"
              :decorators="decorators.secgroup"
              :secgroup-params="secgroupParams"
              :hypervisor="hypervisor"
              :showSecgroupBind="showSecgroupBind" />
          </a-form-item>
          <a-form-item :label="$t('compute.text_311')" v-show="!isServertemplate" class="mb-0">
            <sched-policy
              ref="schedPolicyRef"
              :form="form"
              :provider="hypervisor"
              :server-type="form.fi.createType"
              :disabled-host="policyHostDisabled"
              :policy-host-params="policyHostParams"
              :decorators="decorators.schedPolicy"
              :hideCloudaccountSched="hideCloudaccountSched"
              :policy-schedtag-params="policySchedtagParams" />
          </a-form-item>
          <custom-data v-if="showCustomData" ref="customData" :decorators="decorators" :form="form" />
          <bastion-host v-if="!isOpenSourceVersion && hasBastionService" :decorator="decorators.bastion_host" :form="form" />
        </a-collapse-panel>
      </a-collapse>
      <bottom-bar
        :loading="submiting"
        :form="form"
        :errors.sync="errors"
        :type="type"
        :resourceType="form.fd.resourceType"
        :dataDiskSizes="dataDiskSizes"
        :isOpenWorkflow="isOpenWorkflow"
        :isServertemplate="isServertemplate"
        :hasMeterService="hasMeterService"
        :cloudaccountId="cloudaccountId"
        @add-cart="addShopCart"
        @cancel="handleCancel" />
    </a-form>
  </div>
</template>
<script>
/* eslint-disable */
import * as R from 'ramda'
import Bill from '@Compute/sections/Bill'
import { LOGIN_TYPES_MAP, BILL_TYPES_MAP } from '@Compute/constants'
import EipConfig from '@Compute/sections/EipConfig'
import SecgroupConfig from '@Compute/sections/SecgroupConfig'
import RegionMap from '@Compute/sections/RegionMap'
import { resolveValueChangeField } from '@/utils/common/ant'
import { PROVIDER_MAP, HYPERVISORS_MAP, isUcloudLikeHypervisor } from '@/constants'
import { HOST_CPU_ARCHS } from '@/constants/compute'
import AreaSelects from '@/sections/AreaSelects'
import { cloudregionFilterByCapability } from '@/utils/common/capability'
import { IMAGES_TYPE_MAP } from '@/constants/compute'
import mixin from './mixin'
export default {
  name: 'VMPublicCreate',
  components: {
    Bill,
    AreaSelects,
    EipConfig,
    SecgroupConfig,
    RegionMap,
  },
  mixins: [mixin],
  data () {
    return {
      cloudaccountId: '',
    }
  },
  computed: {
    // 是否为包年包月
    isPackage () {
      return this.form.fd.billType === BILL_TYPES_MAP.package.key
    },
    isArm () {
      return this.form.fd.sku && this.form.fd.sku.cpu_arch === HOST_CPU_ARCHS.arm.capabilityKey
    },
    isLoongarch64 () {
      return this.form.fd.sku && this.form.fd.sku.cpu_arch === HOST_CPU_ARCHS.loongarch64.capabilityKey
    },
    osArch () {
      if (this.form.fd.sku && this.form.fd.sku.cpu_arch) {
        return this.form.fd.sku.cpu_arch
      } else {
        return ''
      }
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
    hasMapRegionFilter () {
      return this.form.fd.enableWorldMap && this.nearbyRegions.length > 0
    },
    isWorldMapMode () {
      return !!this.form.fd.enableWorldMap
    },
    areaDefaultActiveFirstOption () {
      if (this.isInitForm) return false
      return []
    },
    mapFilterRegionIds () {
      return this.nearbyRegions.map(item => item.id).filter(Boolean)
    },
    mapFilterProviderKeys () {
      const keys = new Set()
      this.nearbyRegions.forEach((item) => {
        const raw = item.provider
        if (!raw) return
        keys.add(raw)
      })
      return [...keys]
    },
    selectedCloudregionIds () {
      const { cloudregion } = this.form.fd
      if (Array.isArray(cloudregion)) return cloudregion.filter(Boolean)
      return cloudregion ? [cloudregion] : []
    },
    // 任一区域字段存在多个选中值
    hasMultipleAreaSelection () {
      const { provider, cloudregion, zone } = this.form.fd
      const isMultiValue = val => Array.isArray(val) && val.length > 1
      return isMultiValue(provider) || isMultiValue(cloudregion) || isMultiValue(zone)
    },
    // 未选 SKU 时，网络等下游暂不可用
    needsSkuForAreaDownstream () {
      return this.hasMultipleAreaSelection && !R.is(Object, this.form.fd.sku)
    },
    resolvedAreaFilterParams () {
      const { provider, cloudregion, zone, sku } = this.form.fd
      const fromForm = {
        provider: this.pickSingleAreaValue(provider),
        cloudregion: this.pickSingleAreaValue(cloudregion),
        zone: this.pickSingleAreaValue(zone),
      }
      if (R.is(Object, sku)) {
        return {
          provider: sku.provider || fromForm.provider,
          cloudregion: sku.cloudregion_id || fromForm.cloudregion,
          zone: sku.zone_id || fromForm.zone,
        }
      }
      if (this.hasMultipleAreaSelection) {
        return {}
      }
      return fromForm
    },
    cloudregionZoneParams () {
      const { cloudregion, zone } = this.resolvedAreaFilterParams
      const params = {}
      if (cloudregion) params.cloudregion = cloudregion
      if (zone) params.zone = zone
      return params
    },
    networkParam () {
      if (!this.cloudregionZoneParams.cloudregion) return {}
      const params = {
        filter: 'server_type.notin(ipmi, pxe)',
        usable: true,
        ...this.cloudregionZoneParams,
        ...this.scopeParams,
      }
      if (this.isGoogle) {
        params.show_emulated = true
      }
      return params
    },
    // 地图范围 + 平台选择范围 交集，统一返回数组
    providers () {
      const selected = this.normalizeAreaValues(this.form.fd.provider)
      const mapScope = this.hasMapRegionFilter
        ? this.mapFilterProviderKeys.map(key => String(key).toLowerCase())
        : []
      const intersected = this.intersectAreaValues(selected, mapScope, { caseInsensitive: true })
      if (intersected.length) return intersected
      if (!this.hasMapRegionFilter && !selected.length) {
        const providerList = this.form.fi.providerList || []
        return providerList.map(item => item.name).filter(Boolean)
      }
      return []
    },
    // 地图范围 + 区域选择范围 交集，统一返回数组
    cloudregions () {
      const selected = this.selectedCloudregionIds
      const mapScope = this.hasMapRegionFilter ? this.mapFilterRegionIds : []
      return this.intersectAreaValues(selected, mapScope)
    },
    providerParams () {
      return {
        usable: true,
        public_cloud: true,
        ...this.scopeParams,
      }
    },
    regionMapParams () {
      return {
        cloud_env: 'public',
        usable: true,
        show_emulated: true,
        read_only: false,
        capability: 'compute',
        public_cloud: true,
        // 触发 RegionMap 在计费方式变化时重新过滤点位
        billType: this.form.fd.billType,
        duration: this.form.fd.duration,
        ...this.scopeParams,
      }
    },
    areaCloudregionParams () {
      const params = {
        cloud_env: 'public',
        usable: true,
        show_emulated: true,
        ...this.scopeParams,
      }
      if (this.hasMapRegionFilter && this.mapFilterRegionIds.length) {
        params.filter = `id.in(${this.mapFilterRegionIds.join(',')})`
      }
      return params
    },
    zoneParams () {
      const params = {
        cloud_env: 'public',
        usable: true,
        show_emulated: true,
        order_by: 'created_at',
        order: 'asc',
        ...this.scopeParams,
      }
      const regionIds = this.cloudregions
      if (regionIds.length) {
        params.filter = `cloudregion_id.in(${regionIds.join(',')})`
      }
      return params
    },
    imageParams () {
      const params = {}
      if (R.is(Object, this.form.fd.sku)) {
        params.os_arch = HOST_CPU_ARCHS.x86.key
        if (this.isArm) params.os_arch = HOST_CPU_ARCHS.arm.key
        if (this.isLoongarch64) params.os_arch = HOST_CPU_ARCHS.loongarch64.key
      }
      return params
    },
    cacheImageParams () {
      const { imageType } = this.form.fd
      const params = {}
      if (imageType !== IMAGES_TYPE_MAP.public.key) {
        params.manager_id = this.form.fd.cloudprovider
      }
      const { cloudregion } = this.cloudregionZoneParams
      if (cloudregion) {
        params.cloudregion_id = cloudregion
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
        cpu_core_count: this.form.fd.vcpu,
        memory_size_mb: this.form.fd.vmem,
        usable: true,
        enabled: true,
        // manager: this.form.fd.cloudprovider,
        ...this.scopeParams,
      }
      const regionIds = this.cloudregions
      this.applySkuRegionFilter(params, regionIds)
      const zoneValues = this.normalizeAreaValues(this.form.fd.zone)
      if (zoneValues.length === 1) {
        params.zone_id = zoneValues[0]
      } else if (zoneValues.length > 1) {
        this.appendSkuFilter(params, `zone_id.in(${zoneValues.join(',')})`)
      }
      const providerValues = this.providers
      if (providerValues.length === 1) {
        params.provider = PROVIDER_MAP[providerValues[0]] ? PROVIDER_MAP[providerValues[0]].hypervisor : providerValues[0]
      } else if (providerValues.length > 1) {
        const providers = providerValues.map(p => (PROVIDER_MAP[p] ? PROVIDER_MAP[p].provider :  (HYPERVISORS_MAP[String(p).toLowerCase()]?.provider || p)))
        this.appendSkuFilter(params, `provider.in(${providers.join(',')})`)
      } else {
        return {} // 公有云条件下没有 provider 不用请求接口
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
      if (isUcloudLikeHypervisor(hypervisor)) {
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
          HYPERVISORS_MAP.rockbase.key,
          HYPERVISORS_MAP.esxi.key,
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
      this.applyInstanceSpecRegionFilter(params, this.cloudregions)
      this.applyInstanceSpecZoneFilter(params, this.normalizeAreaValues(this.form.fd.zone))
      this.applyInstanceSpecProviderFilter(params, this.providers)
      return params
    },
    cloudproviderParamsExtra () {
      const params = {
        ...this.scopeParams,
      }
      const { cloudregion } = this.resolvedAreaFilterParams
      if (this.form.fd.sku && this.form.fd.sku.provider) {
        params.provider = this.form.fd.sku.provider
      }
      if (cloudregion) params.cloudregion = cloudregion
      return params
    },
    hideCloudaccountSched () {
      return !!this.form.fd.prefer_manager
    },
    policycloudproviderParams () {
      const params = {
        limit: 0,
        enabled: true,
        read_only: false,
        filter: 'status.equals(\'connected\')',
        ...this.scopeParams,
      }
      const { provider, cloudregion, zone } = this.resolvedAreaFilterParams
      if (provider) params.brand = provider
      if (cloudregion) params.cloudregion = cloudregion
      if (zone) params.zone = zone
      return params
    },
  },
  watch: {
    hasMapRegionFilter () {
      this.$nextTick(() => {
        if (this.$refs.areaSelectRef) {
          this.$refs.areaSelectRef.fetchs(['provider'])
        }
        this.refreshSkuByMapRegion()
      })
    },
    mapFilterRegionIds (val, oldVal) {
      if (R.equals(val, oldVal)) return
      this.$nextTick(() => {
        this.refreshSkuByMapRegion()
        this.fetchInstanceSpecs()
      })
    },
    'form.fd.billType' (val) {
      // 计费方式为包年包月平台不含 azure、aws，这里统一做清空处理
      if (val === BILL_TYPES_MAP.package.key) {
        this.form.fc.setFieldsValue({
          provider: [],
          cloudregion: [],
          zone: [],
        })
      }
      this.$refs.areaSelectRef.fetchs(['provider'])
    },
    'form.fd.duration' (val, oldVal) {
      if (this.form.fd.billType === BILL_TYPES_MAP.package.key) {
        if (val === '1W' || oldVal === '1W') {
          this.form.fc.setFieldsValue({
            provider: [],
            cloudregion: [],
            zone: [],
          })
          this.$refs.areaSelectRef.fetchs(['provider', 'cloudregion', 'zone'])
        }
      }
    },
  },
  created () {
    this.baywatch(['form.fd.provider', 'form.fd.cloudregion', 'form.fd.zone'], this.fetchInstanceSpecs)
    this.baywatch(['form.fd.sku', 'form.fd.zone'], this.withFetchCapbilites)
    this.baywatch(['form.fd.sku'], this.onResolvedSkuChange)
  },
  methods: {
    onResolvedSkuChange (val) {
      if (this.hasMultipleAreaSelection && R.is(Object, val)) {
        this.fetchInstanceSpecs()
      }
    },
    pickSingleAreaValue (value) {
      if (Array.isArray(value)) return value[0] || undefined
      return value || undefined
    },
    normalizeAreaValues (value) {
      if (Array.isArray(value)) return value.filter(Boolean)
      return value ? [value] : []
    },
    intersectAreaValues (selected = [], scope = [], { caseInsensitive = false } = {}) {
      const normalizedSelected = selected.filter(Boolean)
      const normalizedScope = scope.filter(Boolean)
      if (normalizedSelected.length && normalizedScope.length) {
        const scopeSet = new Set(
          caseInsensitive
            ? normalizedScope.map(v => String(v).toLowerCase())
            : normalizedScope.map(v => String(v)),
        )
        return normalizedSelected.filter(v => {
          const key = caseInsensitive ? String(v).toLowerCase() : String(v)
          return scopeSet.has(key)
        })
      }
      if (normalizedSelected.length) return normalizedSelected
      return normalizedScope
    },
    applySkuRegionFilter (params, regionIds = []) {
      if (!regionIds.length) return
      if (regionIds.length === 1) {
        params.cloudregion = regionIds[0]
        return
      }
      this.appendSkuFilter(params, `cloudregion_id.in(${regionIds.join(',')})`)
    },
    applyInstanceSpecProviderFilter (params, providerValues = []) {
      if (!providerValues.length) return
      if (providerValues.length === 1) {
        params.provider = PROVIDER_MAP[providerValues[0]] ? PROVIDER_MAP[providerValues[0]].hypervisor : providerValues[0]
        return
      }
      const providers = providerValues.map(p => (PROVIDER_MAP[p] ? PROVIDER_MAP[p].provider : p))
      this.appendSkuFilter(params, `provider.in(${providers.join(',')})`)
    },
    applyInstanceSpecRegionFilter (params, regionIds = []) {
      if (!regionIds.length) return
      if (regionIds.length === 1) {
        params.cloudregion = regionIds[0]
        return
      }
      this.appendSkuFilter(params, `cloudregion.in(${regionIds.join(',')})`)
    },
    applyInstanceSpecZoneFilter (params, zoneValues = []) {
      if (!zoneValues.length) return
      if (zoneValues.length === 1) {
        params.zone = zoneValues[0]
        return
      }
      this.appendSkuFilter(params, `zone.in(${zoneValues.join(',')})`)
    },
    refreshSkuByMapRegion () {
      this.form.fc.setFieldsValue({ sku: undefined })
      this.$nextTick(() => {
        if (this.$refs.skuRef && typeof this.$refs.skuRef.fetchData === 'function') {
          this.$refs.skuRef.fetchData()
        }
        this.fetchInstanceSpecs()
      })
    },
    appendSkuFilter (params, filter) {
      if (!params.filter) {
        params.filter = [filter]
        return
      }
      if (!Array.isArray(params.filter)) {
        params.filter = [params.filter]
      }
      params.filter.push(filter)
    },
    filterProviderListByMap (list = []) {
      if (!this.hasMapRegionFilter || !this.mapFilterProviderKeys.length) return list
      const allowed = new Set(
        this.mapFilterProviderKeys.map(raw => {
          return PROVIDER_MAP[raw] ? PROVIDER_MAP[raw].key : raw
        }),
      )
      return list.filter(item => allowed.has(String(item.name)))
    },
    mapProviderMapper (list) {
      return this.filterProviderListByMap(list)
    },
    getSelectedProviderNames () {
      const { provider } = this.form.fc.getFieldsValue(['provider'])
      if (!provider) return []
      const list = Array.isArray(provider) ? provider : [provider]
      return list.filter(Boolean).map(p => String(p))
    },
    filterCloudregionListByProvider (list = []) {
      const providers = this.getSelectedProviderNames()
      if (!providers.length) return list
      const providerSet = new Set(providers.map(p => String(p)))
      return list.filter(item => {
        const raw = item.provider || item.brand || ''
        return providerSet.has(String(raw))
      })
    },
    mapCloudregionParamsMapper (params) {
      if (!this.hasMapRegionFilter) return params
      if (this.getSelectedProviderNames().length) return params
      const next = { ...params }
      delete next.provider
      return next
    },
    mapCloudregionMapper (list) {
      let result = list
      if (this.hasMapRegionFilter) {
        const idSet = new Set(this.mapFilterRegionIds)
        result = result.filter(item => idSet.has(item.id))
        const existingIds = new Set(result.map(item => item.id))
        this.nearbyRegions.forEach((item) => {
          if (item.id && idSet.has(item.id) && !existingIds.has(item.id)) {
            result.push(item)
          }
        })
      }
      return this.filterCloudregionListByProvider(result)
    },
    filterMapCloudregionList (list = []) {
      let result = cloudregionFilterByCapability({
        dataList: list,
        capability: this.$store.getters.capability,
        resource: 'compute_engine',
      })
      result = result.filter(item => {
        const provider = String(item.provider || item.brand || '').toLowerCase()
        return ![HYPERVISORS_MAP.jdcloud.key, HYPERVISORS_MAP.ecloud.key].includes(provider)
      })
      if (this.form.fd.billType === BILL_TYPES_MAP.package.key) {
        if (this.form.fd.duration === '1W') {
          result = result.filter(item => HYPERVISORS_MAP.aliyun.key === String(item.provider || '').toLowerCase())
        } else {
          result = result.filter(item => {
            const provider = String(item.provider || '').toLowerCase()
            return ![HYPERVISORS_MAP.azure.key, HYPERVISORS_MAP.aws.key, HYPERVISORS_MAP.google.key].includes(provider)
          })
        }
      }
      return result
    },
    mapZoneMapper (list) {
      if (!this.hasMapRegionFilter) return list
      const regionIds = this.cloudregions
      if (!regionIds.length) return []
      const regionFilter = new Set(regionIds)
      return list.filter(item => {
        const regionId = item.cloudregion_id || item.region_id || item.cloudregion
        return regionFilter.has(regionId)
      })
    },
    providerFetchSuccess (list) {
      const toAreaValue = (value) => {
        if (value === undefined || value === null) return []
        return Array.isArray(value) ? value : [value]
      }
      // 计费方式为包年包月平台不含 azure、aws、google
      if (this.form.fd.billType === BILL_TYPES_MAP.package.key) {
        if (this.form.fd.duration === '1W') {
          list = list.filter(item => HYPERVISORS_MAP.aliyun.key === item.name)
          this.form.fc.setFieldsValue({
            provider: toAreaValue(HYPERVISORS_MAP.aliyun.kkkey),
          })
        } else {
          list = list.filter(item => {
            return ![HYPERVISORS_MAP.azure.key, HYPERVISORS_MAP.aws.key, HYPERVISORS_MAP.google.key].includes(item.name)
          })
        }
      }
      // 过滤京东云和移动云等只读的云
      list = list.filter(item => {
        return ![HYPERVISORS_MAP.jdcloud.key, HYPERVISORS_MAP.ecloud.key].includes(item.name)
      })
      if (this.hasMapRegionFilter) {
        list = this.filterProviderListByMap(list)
      }
      // 回填
      const hvKey = String(this.initFormData.hypervisor || '').toLowerCase()
      const hvObj = HYPERVISORS_MAP[hvKey]
      const matched = hvObj ? list.find(item => item.name === hvObj.key) : null
      if (this.isInitForm && matched) {
        this.form.fc.setFieldsValue({
          provider: toAreaValue(matched.name),
          cloudregion: toAreaValue(this.initFormData.prefer_region),
          zone: toAreaValue(this.initFormData.prefer_zone),
          cloudprovider: this.initFormData.prefer_manager_id,
        })
        this.$nextTick(() => {
          this.$refs.areaSelectRef?.fetchs(['cloudregion', 'zone'])
        })
      }
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
        ...this.scopeParams,
        resource_type: this.form.fc.getFieldValue('resourceType'),
      }
      let id = this.cloudregionZoneParams.cloudregion
      let resource = 'cloudregions'
      if (this.cloudregionZoneParams.zone) {
        id = this.cloudregionZoneParams.zone
        resource = 'zones'
      }
      const capabilityParams = { id, spec: 'capability', params }
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
    cloudproviderLabel (item) {
      let label = item.name
      if (!this.usableCloudproviderMaps[item.id]) {
        if (item.status !== 'connected') {
          label += this.$t('compute.text_184')
        } else if (item.health_status !== 'normal') {
          label += this.$t('compute.text_185')
        } else if (item.enabled === false) {
          label += this.$t('compute.text_186')
        } else {
          label += this.$t('compute.text_187')
        }
      }
      return label
    },
    labelFormat (item) {
      if (this.form.fi.createType === SERVER_TYPE.public) {
        return `${item.account} / ${item.manager} / ${item.zone}`
      }
      return item.name
    },
    cloudproviderSelected (item) {
      this.cloudaccountId = item.cloudaccount_id || ''
    },
    cloudproviderUpdate (item) {
      this.cloudaccountId = item.cloudaccount_id || ''
    }
  },
}
</script>
