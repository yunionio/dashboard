<template>
  <div>
    <a-form
      class="mt-3"
      v-bind="formItemLayout"
      :form="form.fc"
      hideRequiredMark>
      <a-form-item :label="$t('storage.text_55', [$t('dictionary.project')])" v-bind="formItemLayout">
        <domain-project :fc="form.fc" :decorators="{ project: decorators.project, domain: decorators.domain }" @update:domain="handleDomainChange" />
      </a-form-item>
      <a-form-item :label="$t('storage.text_40')">
        <a-input v-decorator="decorators.name" />
        <template v-slot:extra>
          <name-repeated res="file_systems" :name="form.fd.name" :default-text="$t('compute.text_893')" />
        </template>
      </a-form-item>
      <a-form-item :label="$t('common.description')">
        <a-textarea :auto-size="{ minRows: 1, maxRows: 3 }" v-decorator="decorators.description" :placeholder="$t('common_367')" />
      </a-form-item>
      <!-- 计费方式 -->
      <clearing-radios v-bind="formItemLayout" :auto_renew="false" />
      <a-form-item :label="$t('network.expired_release')" v-if="form.fd.billing_type !== 'prepaid'">
        <duration :decorators="decorators.duration" :form="form" />
      </a-form-item>
      <a-form-item :label="$t('regionMap.enable_world_map')">
        <a-switch v-decorator="decorators.enableWorldMap" @change="onWorldMapModeChange" />
      </a-form-item>
      <a-form-item v-if="form.fd.enableWorldMap" :label="$t('compute.region_map')">
        <region-map
          :region-filter-params="regionMapParams"
          filter-brand-resource="nas"
          :region-mapper="filterMapCloudregionList"
          split-key="provider"
          @select="onRegionSelect"
          @params-change="onRegionMapParamsChange" />
      </a-form-item>
      <area-selects
        class="mb-0"
        v-if="showAreaSelect"
        ref="areaSelects"
        :wrapperCol="formItemLayout.wrapperCol"
        :labelCol="formItemLayout.labelCol"
        :names="areaselectsName"
        :providerParams="providerParams"
        :cloudregionParams="regionParams"
        :provider-multiple="true"
        :cloudregion-multiple="true"
        :cloudregion-mapper="filterCloudregionListByProvider"
        :defaultActiveFirstOption="areaDefaultActiveFirstOption"
        filterBrandResource="nas"
        @change="handleRegionChange" />
      <!-- 套餐 -->
      <file-system-sku
        @update:options="skuChanged"
        ref="REF_SKU" />
      <a-form-item :label="$t('storage.capacity')" v-bind="formItemLayout" v-if="isShowCapacity">
        <a-col :span="12">
          <a-tooltip>
            <template slot="title" v-if="capacityTooltip">
              {{ capacityTooltip }}
            </template>
            <a-input-number v-model="capacity" v-bind="skuOptions" /> GB
          </a-tooltip>
        </a-col>
      </a-form-item>
      <a-alert
        v-if="needsSkuForAreaDownstream"
        type="info"
        show-icon
        :message="$t('regionMap.select_sku_first_tip')"
        class="mb-2" />
      <a-form-item :label="$t('compute.text_15')" required v-bind="formItemLayout">
        <base-select
          class="w-50"
          v-decorator="decorators.cloudprovider"
          resource="cloudproviders"
          :params="cloudproviderParams"
          :mapper="providerMapper"
          :isDefaultSelect="true"
          :showSync="true"
          :select-props="{ placeholder: $t('common.tips.select', [$t('compute.text_653')]) }"
          @update:item="cloudproviderSelected" />
      </a-form-item>
      <network-selects
        ref="REF_NETWORK"
        :label="$t('network.text_16')"
        :isDefaultFetch="false"
        :vpcFormat="vpcFormat"
        :vpcParams="vpcParams"
        :networkParams="netParams"
        v-bind="formItemLayout"
        class="mb-0" />
      <a-form-item :label="$t('compute.text_1154')" class="mb-0">
        <tag
          v-decorator="decorators.tag" :allowNoValue="false" />
      </a-form-item>
    </a-form>
    <bottom-bar
      :values="form.fc.getFieldsValue()"
      :cloudAccountId="cloudAccountId"
      @submit="handleConfirm"
      @cancel="handleCancel" />
  </div>
</template>

<script>
import * as R from 'ramda'
import Duration from '@Compute/sections/Duration'
import RegionMap from '@Compute/sections/RegionMap'
import DomainProject from '@/sections/DomainProject'
import NetworkSelects from '@/sections/NetworkSelects'
import validateForm, { isRequired } from '@/utils/validate'
import Tag from '@/sections/Tag'
import AreaSelects from '@/sections/AreaSelects'
import { getCloudEnvOptions } from '@/utils/common/hypervisor'
import { HYPERVISORS_MAP, PROVIDER_MAP, resolveHypervisorKey } from '@/constants'
import { cloudregionFilterByCapability } from '@/utils/common/capability'
import i18n from '@/locales'
import fsCreateMixin from './mixin'
import BottomBar from '../components/BottomBar'
import FileSystemSku from '../components/SKU'
function validateTag (rule, value, callback) {
  if (R.is(Object, value) && Object.keys(value).length > 20) {
    return callback(new Error(i18n.t('compute.text_209')))
  }
  callback()
}

export default {
  name: 'FileSystemPublicCreate',
  components: {
    DomainProject,
    Duration,
    AreaSelects,
    RegionMap,
    FileSystemSku,
    NetworkSelects,
    BottomBar,
    Tag,
  },
  mixins: [fsCreateMixin],
  data () {
    const cloudEnvOptions = getCloudEnvOptions('object_storage_brands', true)
    const decorators = {
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
            { validator: isRequired(), message: this.$t('rules.project'), trigger: 'change' },
          ],
        },
      ],
      name: [
        'name',
        {
          validateFirst: true,
          rules: [
            { required: true, message: this.$t('network.text_218') },
            { validator: validateForm('serverName') },
          ],
        },
      ],
      description: ['description'],
      enableWorldMap: [
        'enableWorldMap',
        {
          valuePropName: 'checked',
          initialValue: false,
        },
      ],
      cloudprovider: [
        'cloudprovider',
        {
          rules: [
            { required: true, message: this.$t('common.tips.select', [this.$t('compute.text_653')]) },
          ],
        },
      ],
      duration: {
        durationStandard: [
          'durationStandard',
          {
            initialValue: 'none',
          },
        ],
        duration: [
          'duration',
          {
            initialValue: '1h',
          },
        ],
      },
      billing_type: [
        'billing_type',
        {
          initialValue: 'postpaid',
        },
      ],
      tag: [
        'tag',
        {
          rules: [
            { validator: validateTag },
          ],
        },
      ],
    }
    return {
      loading: false,
      decorators,
      skuOptions: {},
      capacity: 0,
      cloudproviderItem: null,
      tailFormItemLayout: {
        wrapperCol: {
          lg: { span: 18, offset: 6 },
          xl: { span: 20, offset: 4 },
          xxl: { span: 21, offset: 3 },
        },
      },
      vpcList: [],
      cloudEnvOptions,
      routerQuery: this.$route.query.type,
      cloudEnv: this.$route.query.type ? this.$route.query.type : cloudEnvOptions[0].key,
    }
  },
  computed: {
    areaselectsName () {
      return ['provider', 'cloudregion']
    },
    showAreaSelect () {
      if (this.$store.getters.isAdminMode && this.$store.getters.l3PermissionEnable) {
        return !!(this.form.fd.domain && this.form.fd.domain.key)
      }
      return true
    },
    areaDefaultActiveFirstOption () {
      return []
    },
    cloudAccountId () {
      const values = this.form.fc.getFieldsValue()
      const currentVpc = this.vpcList.filter(item => item.id === values.vpc)
      if (currentVpc[0]) {
        return currentVpc[0].account_id
      }
      return ''
    },
    providers () {
      return this.normalizeAreaValues(this.form.fd.provider)
    },
    selectedCloudregionIds () {
      return this.normalizeAreaValues(this.form.fd.cloudregion)
    },
    hasMultipleAreaSelection () {
      const { provider, cloudregion } = this.form.fd
      const isMultiValue = val => Array.isArray(val) && val.length > 1
      return isMultiValue(provider) || isMultiValue(cloudregion)
    },
    needsSkuForAreaDownstream () {
      return this.hasMultipleAreaSelection && !R.is(Object, this.form.fd.sku)
    },
    // 下游/提交用：优先套餐，其次云订阅，再次单选区域
    resolvedAreaFilterParams () {
      const fromForm = {
        provider: this.pickSingleAreaValue(this.form.fd.provider),
        cloudregion: this.pickSingleAreaValue(this.form.fd.cloudregion),
      }
      const sku = this.form.fd.sku
      if (R.is(Object, sku)) {
        const skuZones = this.parseSkuZoneIds(sku)
        return {
          provider: sku.provider || fromForm.provider,
          cloudregion: sku.cloudregion_id || fromForm.cloudregion,
          zone: skuZones[0],
          zones: skuZones,
        }
      }
      if (this.cloudproviderItem) {
        return {
          provider: this.cloudproviderItem.provider || this.cloudproviderItem.brand || fromForm.provider,
          cloudregion: this.cloudproviderItem.cloudregion_id || fromForm.cloudregion,
        }
      }
      if (this.hasMultipleAreaSelection) {
        return {}
      }
      return fromForm
    },
    cloudproviderParams () {
      const { cloudregion, provider } = this.resolvedAreaFilterParams
      if (!cloudregion) {
        return {}
      }
      const params = {
        limit: 0,
        enabled: 1,
        details: true,
        scope: this.scope,
        read_only: false,
        cloudregion,
      }
      if (provider) {
        params.brand = PROVIDER_MAP[provider]
          ? PROVIDER_MAP[provider].provider
          : provider
      }
      if (this.isAdminMode) {
        params.admin = true
        params.project_domain = this.form.fd.domain?.key
        delete params.scope
        delete params.domain_id
      }
      return params
    },
    providerParams () {
      const params = {
        limit: 0,
        enabled: 1,
        cloud_env: 'public',
        scope: this.scope,
        provider: this.capability.nas_brands,
      }
      if (!this.capability.nas_brands || this.capability.nas_brands.length === 0) {
        params.provider = 'Other'
      }
      if (this.isAdminMode) {
        params.admin = true
        params.project_domain = this.form.fd.domain?.key
        delete params.scope
      }
      return params
    },
    regionMapParams () {
      const params = {
        cloud_env: 'public',
        usable: true,
        show_emulated: true,
        read_only: false,
        ...this.scopeParams,
      }
      if (this.isAdminMode) {
        params.admin = true
        params.project_domain = this.form.fd.domain?.key
        delete params.scope
      }
      return params
    },
    regionParams () {
      const params = {
        cloud_env: 'public',
        usable: true,
        show_emulated: true,
        ...this.scopeParams,
      }
      if (this.isAdminMode) {
        params.admin = true
        params.project_domain = this.form.fd.domain?.key
        delete params.scope
      }
      return params
    },
    scopeParams () {
      if (this.isAdminMode) {
        return {
          project_domain: this.form.fd.domain?.key || this.userInfo.projectDomainId,
        }
      }
      return { scope: this.scope }
    },
    vpcParams () {
      const { cloudregion } = this.resolvedAreaFilterParams
      if (!cloudregion || !this.form.fd.cloudprovider) {
        return {}
      }
      const params = {
        cloudregion_id: cloudregion,
        scope: this.scope,
        manager_id: this.form.fd.cloudprovider,
      }
      if (this.isAdminMode) {
        params.project_domain = this.form.fd.domain?.key
      }
      return params
    },
    netParams () {
      const { cloudregion, zones } = this.resolvedAreaFilterParams
      if (!cloudregion) {
        return {}
      }
      const params = {
        cloudregion_id: cloudregion,
        scope: this.scope,
      }
      if (zones && zones.length) {
        params.zones = zones
      }
      return params
    },
    isShowCapacity () {
      return this.form.fd.sku?.min_disk_size_gb !== -1
    },
    capacityConf () {
      const capacityConf = {}
      const { min_disk_size_gb, max_disk_size_gb } = this.form.fd.sku || {}
      if (this.isShowCapacity) {
        capacityConf.min = min_disk_size_gb
        capacityConf.max = max_disk_size_gb
      }
      return capacityConf
    },
    capacityTooltip () {
      const { min, max } = this.capacityConf
      if (min) {
        return this.$t('compute.text_137', [min, max])
      }
      return null
    },
  },
  provide () {
    return {
      form: this.form,
      scopeParams: this.scopeParams,
      formItemLayout: this.formItemLayout,
      tailFormItemLayout: this.tailFormItemLayout,
    }
  },
  watch: {
    capacity: {
      handler (val) {
        this.form.fc.setFieldsValue({
          capacity: val,
        })
      },
    },
    'form.fd.provider': {
      handler () {
        this.refreshSkuByAreaSelection()
      },
    },
    'form.fd.cloudregion': {
      handler () {
        this.syncAreaHiddenFields()
        this.refreshSkuByAreaSelection()
      },
    },
    'form.fd.sku': {
      handler (val) {
        this.syncResolvedLocationFields()
        if (R.is(Object, val)) {
          this.fetchVpc()
        }
      },
    },
    'form.fd.billing_type': {
      handler () {
        this.refreshSkuByAreaSelection()
      },
    },
  },
  created () {
    this.form.fc.getFieldDecorator('cloudregion_id', { preserve: true })
    this.form.fc.getFieldDecorator('zone_id', { preserve: true })
    this.form.fc.getFieldDecorator('capacity', { preserve: true })
  },
  methods: {
    pickSingleAreaValue (value) {
      if (Array.isArray(value)) return value[0] || undefined
      return value || undefined
    },
    normalizeAreaValues (value) {
      if (Array.isArray(value)) return value.filter(Boolean)
      return value ? [value] : []
    },
    toAreaValue (value) {
      if (value === undefined || value === null) return []
      return Array.isArray(value) ? value : [value]
    },
    parseSkuZoneIds (sku) {
      if (!sku) return []
      if (Array.isArray(sku.zone_ids)) return sku.zone_ids.filter(Boolean)
      if (typeof sku.zone_ids === 'string' && sku.zone_ids) {
        return sku.zone_ids.split(',').filter(Boolean)
      }
      if (sku.zone_id) return [sku.zone_id]
      return []
    },
    mapAreaProviderFilterValues (providerValues = []) {
      return providerValues.map(p => (
        PROVIDER_MAP[p]
          ? PROVIDER_MAP[p].provider
          : (HYPERVISORS_MAP[String(p).toLowerCase()]?.provider || p)
      ))
    },
    getSelectedProviderNames () {
      return this.providers.map(p => String(p))
    },
    normalizeAreaProviderKey (val) {
      return resolveHypervisorKey(val)
    },
    isAreaProviderMatch (selected, itemProvider) {
      return this.normalizeAreaProviderKey(selected) === this.normalizeAreaProviderKey(itemProvider)
    },
    filterCloudregionListByProvider (list = []) {
      return this.filterAreaListByProvider(list)
    },
    filterAreaListByProvider (list = []) {
      const providers = this.getSelectedProviderNames()
      if (!providers.length) return list
      return list.filter(item => {
        const raw = item.provider || item.brand || ''
        return providers.some(p => this.isAreaProviderMatch(p, raw))
      })
    },
    filterMapCloudregionList (list = []) {
      return cloudregionFilterByCapability({
        dataList: list,
        capability: this.capability,
        resource: 'nas',
      })
    },
    matchProviderFromList (list, hypervisor) {
      const hvKey = String(hypervisor || '').toLowerCase()
      const hvObj = HYPERVISORS_MAP[hvKey]
      if (!hvObj || !list?.length) return null
      const hvProvider = String(hvObj.provider || '').toLowerCase()
      return list.find(item => {
        const name = String(item.name || '').toLowerCase()
        const provider = String(item.provider || '').toLowerCase()
        return name === hvKey || name === hvProvider || provider === hvKey || provider === hvProvider
      }) || null
    },
    syncAreaHiddenFields () {
      const cloudregionIds = this.selectedCloudregionIds
      this.form.fc.setFieldsValue({
        cloudregion_id: cloudregionIds.length === 1 ? cloudregionIds[0] : undefined,
      })
    },
    syncResolvedLocationFields () {
      const { cloudregion, zone } = this.resolvedAreaFilterParams
      const fields = {}
      if (cloudregion) fields.cloudregion_id = cloudregion
      if (zone) fields.zone_id = zone
      if (Object.keys(fields).length) {
        this.form.fc.setFieldsValue(fields)
      }
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
    buildSkuFetchParams () {
      const regionIds = this.selectedCloudregionIds
      if (!regionIds.length) return null
      const params = {
        scope: 'domain',
      }
      // 单区域用 cloudregion_id；多区域用 filter: cloudregion_id.in(...)
      if (regionIds.length === 1) {
        params.cloudregion_id = regionIds[0]
      } else {
        this.appendSkuFilter(params, `cloudregion_id.in(${regionIds.join(',')})`)
      }
      if (this.form.fc.getFieldValue('billing_type') === 'postpaid') {
        params.postpaid_status = 'available'
      } else {
        params.prepaid_status = 'available'
      }
      const providerValues = this.providers
      if (providerValues.length === 1) {
        params.provider = PROVIDER_MAP[providerValues[0]]
          ? PROVIDER_MAP[providerValues[0]].hypervisor
          : providerValues[0]
      } else if (providerValues.length > 1) {
        const providers = this.mapAreaProviderFilterValues(providerValues)
        this.appendSkuFilter(params, `provider.in(${providers.join(',')})`)
      }
      return params
    },
    refreshSkuByAreaSelection () {
      this.form.fc.setFieldsValue({
        sku: undefined,
        cloudprovider: undefined,
        zone_id: undefined,
      })
      this.cloudproviderItem = null
      this.$nextTick(() => {
        const params = this.buildSkuFetchParams()
        if (params && this.$refs.REF_SKU) {
          this.$refs.REF_SKU.fetchSkus(params)
        }
      })
    },
    onWorldMapModeChange () {
      // 关闭地图模式时保持当前 area-selects 即可
    },
    refreshAreaSelects () {
      if (!this.$refs.areaSelects) return
      this.$refs.areaSelects.fetchs(this.areaselectsName)
    },
    clearPublicLocationFields () {
      this.form.fc.setFieldsValue({
        provider: [],
        cloudregion: [],
        cloudprovider: undefined,
        sku: undefined,
        cloudregion_id: undefined,
        zone_id: undefined,
      })
      this.cloudproviderItem = null
    },
    onRegionSelect (payload) {
      const regions = payload?.nearbyRegions || []
      if (!regions.length) {
        this.clearPublicLocationFields()
        this.$nextTick(() => {
          this.refreshAreaSelects()
        })
        return
      }
      this.applyMapSelectionToAreaSelects(regions)
    },
    onRegionMapParamsChange () {
      if (!this.form.fd.enableWorldMap) return
      this.onRegionSelect({ nearbyRegions: [] })
    },
    async applyMapSelectionToAreaSelects (regions = []) {
      const providerList = this.$refs.areaSelects?.providerList || []
      const providerKeys = [...new Set(regions.map(item => {
        const raw = item.provider || item.brand
        if (!raw) return null
        const hvKey = resolveHypervisorKey(raw)
        const matched = this.matchProviderFromList(providerList, hvKey)
        return matched ? matched.name : hvKey
      }).filter(Boolean))]
      const cloudregionIds = regions.map(item => item.id).filter(Boolean)
      this.form.fc.setFieldsValue({
        cloudprovider: undefined,
        sku: undefined,
        zone_id: undefined,
      })
      this.cloudproviderItem = null
      await this.$nextTick()
      const areaRef = this.$refs.areaSelects
      if (areaRef) {
        await areaRef.applyMultipleSelection({
          provider: this.toAreaValue(providerKeys),
          cloudregion: this.toAreaValue(cloudregionIds),
        })
      }
      this.refreshSkuByAreaSelection()
    },
    skuChanged (options) {
      this.skuOptions = options
      this.form.fc.setFieldsValue({
        capacity: this.skuOptions.min,
      })
      this.capacity = this.skuOptions.min
      this.syncResolvedLocationFields()
      this.fetchVpc()
    },
    cloudproviderSelected (item) {
      this.cloudproviderItem = item || null
      this.syncResolvedLocationFields()
      this.fetchVpc()
    },
    providerMapper (data) {
      return data
    },
    billing_type_change () {
      this.refreshSkuByAreaSelection()
    },
    vpcFormat (vpc) {
      const { name, manager } = vpc
      return (
        <div class='d-flex'>
          <span class='text-truncate flex-fill mr-2' title={name}>{name}</span>
          <span style="color: #8492a6; font-size: 13px">{this.$t('network.manager', [manager])}</span>
        </div>
      )
    },
    fetchVpc () {
      if (!this.vpcParams.cloudregion_id || !this.vpcParams.manager_id) return
      this.$refs.REF_NETWORK && this.$refs.REF_NETWORK.fetchVpc(this.vpcListChange)
    },
    vpcListChange ({ vpcList }) {
      this.vpcList = vpcList
    },
    fetchNetwork () {
      if (!this.netParams.cloudregion_id) return
      this.$refs.REF_NETWORK && this.$refs.REF_NETWORK.fetchNetwork()
    },
    handleDomainChange () {
      this.$refs.areaSelects && this.$refs.areaSelects.fetchs(this.areaselectsName)
    },
    handleRegionChange () {
      this.syncAreaHiddenFields()
    },
    async handleValuesChange (fc, changedFields) {
      this.form.fd = {
        ...this.form.fd,
        ...changedFields,
      }
      await this.$nextTick()
      const changedFieldsKey = Object.keys(changedFields)
      changedFieldsKey.forEach(field => {
        const handleChange = this[`${field}_change`]
        if (this[`${field}_change`]) {
          return handleChange()
        }
      })
    },
    doCreate (data) {
      return new this.$Manager('file_systems').create({ data })
    },
    async handleConfirm () {
      this.loading = true
      try {
        const values = await this.form.fc.validateFields()
        const { zone } = this.resolvedAreaFilterParams
        const params = {
          billing_type: values.billing_type,
          generate_name: values.name,
          description: values.description,
          network_id: values.network,
          project_domain: (values.domain && values.domain.key) || this.userInfo.projectDomainId,
          project_id: (values.project && values.project.key) || this.userInfo.projectId,
        }
        // zone_id 来自所选套餐，不再由用户选择可用区
        if (zone || values.zone_id) {
          params.zone_id = zone || values.zone_id
        }
        if (values.tag) {
          params.__meta__ = values.tag
        }
        if (values.sku) {
          params.file_system_type = values.sku.file_system_type
          params.protocol = values.sku.protocol
          params.storage_type = values.sku.storage_type
        }
        if (values.capacity > 0) {
          params.capacity = values.capacity
        }
        if (values.billing_type === 'postpaid') {
          if (values.durationStandard !== 'none') {
            params.duration = values.durationStandard
            if (values.durationStandard === 'custom') {
              params.duration = values.duration
            }
          }
          if (values.auto_renew) {
            params.auto_renew = values.auto_renew
          }
        } else {
          params.duration = values.duration
        }

        await this.doCreate(params)
        this.$message.success(this.$t('network.nat.create.success'))
        this.$router.push('/nas')
      } catch (error) {
        throw error
      } finally {
        this.loading = false
      }
    },
  },
}
</script>
