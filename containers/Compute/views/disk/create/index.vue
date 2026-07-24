<template>
  <div>
    <page-header :title="$t('compute.text_709', [$t('compute.text_100')])" :tabs="cloudEnvOptions" :current-tab.sync="cloudEnv" />
    <a-form
      class="mt-3"
      :form="form.fc"
      hideRequiredMark>
      <a-form-item :label="$t('compute.text_297', [$t('dictionary.project')])" v-bind="formItemLayout">
        <domain-project :fc="form.fc" :decorators="{ project: decorators.project, domain: decorators.domain }" />
      </a-form-item>
      <a-form-item :label="$t('compute.text_228')" v-bind="formItemLayout">
        <a-input v-decorator="decorators.name" :placeholder="$t('validator.resourceCreateName')" />
      </a-form-item>
      <a-form-item :label="$t('common.description')" v-bind="formItemLayout">
        <a-textarea :auto-size="{ minRows: 1, maxRows: 3 }" v-decorator="decorators.description" :placeholder="$t('common_367')" />
      </a-form-item>
      <a-form-item v-if="isPublic" :label="$t('regionMap.enable_world_map')" v-bind="formItemLayout">
        <a-switch v-decorator="decorators.enableWorldMap" />
      </a-form-item>
      <a-form-item v-if="isPublic && form.fd.enableWorldMap" :label="$t('compute.region_map')" v-bind="formItemLayout">
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
        ref="areaSelects"
        :wrapperCol="formItemLayout.wrapperCol"
        :labelCol="formItemLayout.labelCol"
        :names="areaselectsName"
        :cloudregionParams="param.region"
        :zoneParams="param.zone"
        :providerParams="param.provider"
        :isRequired="true"
        :provider-multiple="isPublic"
        :cloudregion-multiple="isPublic"
        :cloudregion-mapper="filterCloudregionListByProvider"
        :defaultActiveFirstOption="areaDefaultActiveFirstOption"
        :region.sync="regionList"
        filterBrandResource="compute_engine"
        :zone.sync="zoneList"
        @change="handleAreaChange" />
      <!-- 无私有云订阅时仍用平台单选；公有云/HCSO/HCS 由云订阅决定平台 -->
      <a-form-item
        v-if="showHypervisorRadio"
        :label="$t('compute.text_176')"
        :extra="$t('compute.hypervisor_extra')"
        v-bind="formItemLayout">
        <hypervisor-radio
          :decorator="decorators.hypervisor"
          :type="form.fi.createType"
          :hypervisors="hypervisors"
          :disabledHypervisorMap="disabledHypervisorMap"
          @change="changeHandle" />
      </a-form-item>
      <a-form-item v-if="showCloudprovider" :label="$t('compute.text_15')" v-bind="formItemLayout">
        <base-select
          class="w-50"
          v-decorator="decorators.manager_id"
          resource="cloudproviders"
          :params="cloudproviderParams"
          :isDefaultSelect="true"
          :showSync="true"
          :select-props="{ placeholder: $t('compute.text_149') }"
          :resList.sync="cloudproviderData"
          @update:item="cloudproviderSelected" />
      </a-form-item>
      <a-form-item :label="$t('compute.text_100')" v-bind="formItemLayout">
        <a-row>
          <a-col :span="6" class="mr-2">
            <a-select v-decorator="decorators.backend" @change="__newStorageChange">
              <a-select-option v-for="item in storageOpts" :key="item.value">
                <div class="d-flex">
                  <span class="text-truncate flex-fill mr-2" :title="item.label">{{ item.label }}</span>
                </div>
              </a-select-option>
            </a-select>
          </a-col>
          <a-col :span="3">
            <a-form-item>
              <a-tooltip :title="tooltip" placement="top">
                <a-input-number :min="minDiskData" :max="maxDiskData" :step="step" v-decorator="decorators.size" /> GB
              </a-tooltip>
            </a-form-item>
          </a-col>
          <a-col v-if="isShowStorageSelect" :span="5">
            <div class="d-flex">
              <disk-storage-select
                v-if="showStorage"
                style="min-width: 480px; max-width: 500px;"
                :decorators="decorators"
                :form="form"
                :storageParams="storageParams" />
              <a-button class="mt-1" type="link" @click="showStorage = !showStorage">{{ showStorage ? $t('compute.text_135') : $t('compute.text_1350') }}</a-button>
            </div>
          </a-col>
          <a-col v-if="isShowIops" :span="5">
            <div class="d-flex">
              <a-tooltip :title="iopsTooltip" placement="top">
                <a-input-number
                  v-if="showIops"
                  v-decorator="decorators.iops"
                  placeholder="IOPS"
                  :min="iopsLimit.min"
                  :max="iopsLimit.max"
                  :precision="0" />
              </a-tooltip>
              <a-button class="mt-1" type="link" @click="() => showIops = !showIops">{{ showIops ? $t('compute.text_135') : $t('compute.set_iops') }}</a-button>
            </div>
          </a-col>
          <a-col v-if="isShowThroughput" :span="5">
            <div class="d-flex">
              <a-tooltip title="125 ~ 1000MiB/s" placement="top">
                <a-input-number
                  v-if="showThroughput"
                  v-decorator="decorators.throughput"
                  :placeholder="$t('compute.throughput')"
                  :min="125"
                  :max="1000"
                  :precision="0" />
              </a-tooltip>
              <a-button class="mt-1" type="link" @click="() => showThroughput = !showThroughput">{{ showThroughput ? $t('compute.text_135') : $t('compute.set_throughput') }}</a-button>
            </div>
          </a-col>
        </a-row>
      </a-form-item>
      <a-form-item v-if="enableEncryption && !isPublic" v-bind="formItemLayout" :label="$t('compute.disk.encryption')" :extra="$t('compute.disk.encryption.extra')">
        <encrypt-keys :decorators="decorators.encrypt_keys" />
      </a-form-item>
      <a-form-item :label="$t('compute.text_1154')" class="mb-0" v-bind="formItemLayout">
        <tag
          v-decorator="decorators.__meta__" :allowNoValue="false" />
      </a-form-item>
    </a-form>
    <bottom-bar
      :current-cloudregion="currentCloudregion"
      :current-cloudzone="currentCloudzone"
      :current-storage="storageItem"
      :storage-types="storageTypes"
      :provider="provider"
      :cloudprovider-item="cloudproviderItem"
      :size="form.fd.size" />
  </div>
</template>

<script>
import * as R from 'ramda'
import { mapGetters } from 'vuex'
import { MEDIUM_MAP, CUSTOM_STORAGE_TYPES, STORAGE_TYPES } from '@Compute/constants'
import EncryptKeys from '@Compute/sections/encryptkeys'
import DiskStorageSelect from '@Compute/sections/Disk/components/Storage'
import RegionMap from '@Compute/sections/RegionMap'
import { HYPERVISORS_MAP, CLOUD_ENVS, PROVIDER_MAP, BRAND_MAP, resolveHypervisorKey } from '@/constants'
import AreaSelects from '@/sections/AreaSelects'
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'
import validateForm, { isRequired } from '@/utils/validate'
import i18n from '@/locales'
import DomainProject from '@/sections/DomainProject'
import HypervisorRadio from '@/sections/HypervisorRadio'
import { getCloudEnvOptions } from '@/utils/common/hypervisor'
import { cloudregionFilterByCapability } from '@/utils/common/capability'
import Tag from '@/sections/Tag'
import BottomBar from './components/BottomBar'

export default {
  name: 'DiskCreate',
  components: {
    AreaSelects,
    RegionMap,
    DomainProject,
    BottomBar,
    Tag,
    EncryptKeys,
    DiskStorageSelect,
    HypervisorRadio,
  },
  mixins: [DialogMixin, WindowsMixin],
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
      cloudEnvOptions,
      cloudEnv,
      routerQuery,
      form: {
        fc: this.$form.createForm(this, {
          onValuesChange: (props, values) => {
            Object.keys(values).forEach((key) => {
              switch (key) {
                case 'domain':
                  this.$set(this.form.fd, key, values[key]?.key)
                  break
                case 'project':
                  this.$set(this.form.fd, key, values[key]?.key)
                  break
                default:
                  this.$set(this.form.fd, key, values[key])
              }
            })
            if (values.hasOwnProperty('zone')) {
              this.$set(this.form.fd, 'zone', values.zone)
              if (!this.pickSingleAreaValue(values.zone)) {
                this.form.fc.setFieldsValue({ manager_id: undefined })
                this.cloudproviderItem = null
                this.storageOpts = []
                this.form.fc.resetFields(['backend'])
              } else if (this.showCloudprovider) {
                // 等 zoneList / 云订阅自动选中同步后再拉，避免无订阅时抢先请求被后返回清空
                this.$nextTick(() => this.refreshStorageByCloudprovider())
              } else {
                this.fetchStorageList(this.resolveZoneForCapability())
              }
            }
            if (values.hasOwnProperty('size')) {
              this.form.fd.size = values.size
            }
          },
        }),
        fd: {
          size: 10,
        },
        fi: {
          createType: 'idc',
        },
      },
      decorators: {
        domain: [
          'domain',
          {
            rules: [
              { validator: isRequired(), message: i18n.t('rules.domain'), trigger: 'change' },
            ],
          },
        ],
        project: [
          'project',
          {
            rules: [
              { validator: isRequired(), message: i18n.t('rules.project'), trigger: 'change' },
            ],
          },
        ],
        name: [
          'name',
          {
            validateFirst: true,
            rules: [
              { required: true, message: this.$t('compute.text_210') },
              { validator: this.$validate('resourceCreateName') },
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
        backend: [
          'backend',
          {
            rules: [
              { required: true, message: this.$t('compute.text_411') },
            ],
          },
        ],
        storage_id: [
          'storage_id',
          {
            rules: [
              { required: true, message: this.$t('compute.text_411') },
            ],
          },
        ],
        size: [
          'size',
          {
            initialValue: 10,
            rules: [
              { required: true, type: 'number', message: this.$t('compute.disk.size.required_message') },
            ],
          },
        ],
        manager_id: [
          'manager_id',
          {
            rules: [
              {
                validator: (rule, value, cb) => {
                  if (this.showCloudprovider && !value) {
                    cb(new Error(this.$t('compute.text_149')))
                    return
                  }
                  cb()
                },
              },
            ],
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
        encrypt_keys: {
          encryptEnable: [
            'encryptEnable',
            {
              initialValue: '',
            },
          ],
          encrypt_key_alg: [
            'encrypt_key_alg',
            {
              initialValue: '',
            },
          ],
          encrypt_key_id: [
            'encrypt_key_id',
          ],
        },
        host: ['host'],
        server: ['server'],
        storage: [
          'storage',
          {
            rules: [{
              required: true,
              message: i18n.t('compute.text_1351'),
            }],
          },
        ],
        iops: [
          'iops',
          {
            rules: [{
              required: true,
              message: i18n.t('compute.iops_input_tip'),
            }],
          },
        ],
        throughput: [
          'throughput',
          {
            rules: [{
              required: true,
              message: i18n.t('compute.throughput_input_tip'),
            }],
          },
        ],
        hypervisor: [
          'hypervisor',
          {
            rules: [
              { required: true, message: i18n.t('compute.text_215') },
            ],
          },
        ],
      },
      formItemLayout: {
        wrapperCol: {
          md: { span: 18 },
          xl: { span: 20 },
          xxl: { span: 22 },
        },
        labelCol: {
          md: { span: 6 },
          xl: { span: 4 },
          xxl: { span: 2 },
        },
      },
      storageOpts: [],
      storageItem: {},
      storageTypes: [],
      maxDiskData: 2048,
      minDiskData: 1,
      step: 10,
      cloudproviderData: [],
      cloudproviderItem: null,
      storageFetchSeq: 0,
      regionList: {},
      zoneList: {},
      instance_capabilities: [],
      showStorage: false,
      showIops: false,
      showThroughput: false,
      hypervisors: [],
      capbilityData: {},
      disabledHypervisorMap: {
        esxi: this.$t('compute.hypervisor_disabled_tips', ['VMware']),
        pod: this.$t('compute.hypervisor_disabled_tips', [this.$t('compute.vminstance-container')]),
      },
    }
  },
  computed: {
    enableEncryption () {
      return this.$appConfig.isPrivate && !this.$store.getters.isSysCE
    },
    tooltip () {
      return this.$t('compute.text_137', [this.minDiskData, this.maxDiskData])
    },
    ...mapGetters(['isAdminMode', 'scope', 'userInfo', 'capability']),
    currentCloudzone () {
      const zoneId = this.resolveZoneForCapability()
      return zoneId ? this.zoneList[zoneId] : undefined
    },
    currentCloudregion () {
      // 优先可用区所属区域，避免多选 region 时与单选 zone 错配
      const zone = this.currentCloudzone
      const zoneRegionId = zone?.cloudregion_id || zone?.cloudregion
      if (zoneRegionId && this.regionList[zoneRegionId]) {
        return this.regionList[zoneRegionId]
      }
      if (this.cloudproviderItem?.cloudregion_id) {
        return this.regionList[this.cloudproviderItem.cloudregion_id] ||
          this.regionList[this.pickSingleAreaValue(this.form.fd.cloudregion)]
      }
      const regionId = this.pickSingleAreaValue(this.form.fd.cloudregion)
      return this.regionList[regionId]
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
    isZettaKit () {
      if (this.currentCloudregion) {
        return this.currentCloudregion.provider === HYPERVISORS_MAP.zettakit.provider
      }
      return false
    },
    isUIS () {
      if (this.currentCloudregion) {
        return this.currentCloudregion.provider === HYPERVISORS_MAP.uis.provider
      }
      return false
    },
    isCAS () {
      if (this.currentCloudregion) {
        return this.currentCloudregion.provider === HYPERVISORS_MAP.cas.provider
      }
      return false
    },
    isAws () {
      return this.currentCloudregion?.provider === HYPERVISORS_MAP.aws.provider
    },
    isKVM () {
      return true
    },
    provider () { // 向外提供的，通过 refs 获取
      if (this.currentCloudregion && this.currentCloudregion.provider) {
        return this.currentCloudregion.provider.toLowerCase()
      }
      return ['kvm', 'esxi'] // 没有 provider 肯定是 kvm 或者 esxi 的cloudregion
    },
    diskType () {
      return this.cloudEnv
    },
    storageLabel () {
      if (['idc', 'private'].includes(this.diskType)) {
        return this.$t('compute.text_380')
      }
      return this.$t('compute.text_396')
    },
    param () {
      const project_domain = { project_domain: this.form.fd.domain || this.userInfo.projectDomainId || this.userInfo.domain.id }
      if (this.diskType === 'private') {
        const params = {
          zone: {
            usable: true,
            show_emulated: true,
            order_by: 'created_at',
            order: 'asc',
            ...project_domain,
          },
          region: {
            usable: true,
            cloud_env: 'private',
            show_emulated: true,
            filter: `provider.notin(${HYPERVISORS_MAP.nutanix.provider}, ${HYPERVISORS_MAP.proxmox.provider})`,
            ...project_domain,
          },
          provider: {},
        }
        return params
      } else if (this.diskType === 'public') {
        return {
          zone: {
            usable: true,
            show_emulated: true,
            order_by: 'created_at',
            order: 'asc',
            ...project_domain,
          },
          region: {
            usable: true,
            cloud_env: 'public',
            ...project_domain,
          },
          provider: {
            cloud_env: 'public',
            ...project_domain,
          },
        }
      }
      if (this.isAdminMode) {
        return {
          zone: {
            ...project_domain,
          },
          region: {
            usable: true,
            cloud_env: 'onpremise',
            ...project_domain,
          },
        }
      }
      return {
        zone: {
          ...project_domain,
        },
        region: {
          usable: true,
          cloud_env: 'onpremise',
          scope: this.scope,
        },
      }
    },
    areaselectsName () {
      if (this.diskType === 'private' || this.diskType === 'onpremise') {
        return ['cloudregion', 'zone']
      }
      return ['provider', 'cloudregion', 'zone']
    },
    areaDefaultActiveFirstOption () {
      return this.isPublic ? [] : true
    },
    showCloudprovider () {
      return this.isPublic || this.isHCSO || this.isHCS
    },
    // 有云订阅时由订阅决定平台；本地/普通私有云仍展示平台单选
    showHypervisorRadio () {
      return !this.showCloudprovider
    },
    regionMapParams () {
      const project_domain = this.form.fd.domain || this.userInfo.projectDomainId || this.userInfo.domain.id
      const params = {
        cloud_env: 'public',
        usable: true,
        show_emulated: true,
        read_only: false,
        project_domain,
      }
      return params
    },
    cloudproviderParams () {
      const { domain: project_domain } = this.form.fd
      const zoneId = this.pickSingleAreaValue(this.form.fd.zone)
      const zone = zoneId ? this.zoneList[zoneId] : null
      // 可用区单选：region / brand 优先取自已选 zone，各只传一个
      const regionId = zone?.cloudregion_id || zone?.cloudregion ||
        this.pickSingleAreaValue(this.form.fd.cloudregion)
      const region = regionId
        ? (this.regionList[regionId] || Object.values(this.regionList || {}).find(r => r.id === regionId))
        : null
      const brand = this.mapAreaProviderToBrand(
        zone?.provider || zone?.brand || region?.provider || region?.brand ||
        this.pickSingleAreaValue(this.form.fd.provider),
      )
      const params = {
        limit: 0,
        enabled: true,
        read_only: false,
        'filter.0': 'status.equals("connected")',
        'filter.1': 'health_status.equals("normal")',
        project_domain,
      }
      if (regionId) {
        params.cloudregion = regionId
      }
      if (brand) {
        params.brand = brand
      }
      if (zoneId) {
        params.zone = zoneId
      }
      return params
    },
    project_domain () {
      return this.form.fd.domain ? this.form.fd.domain : this.userInfo.projectDomainId
    },
    instanceCapabilitieStorage () {
      if (R.isEmpty(this.instance_capabilities)) return {}
      return this.instance_capabilities?.[0]?.storages
    },
    instanceCapabilitieDataDisk () {
      if (R.isEmpty(this.instanceCapabilitieStorage)) return []
      return this.instanceCapabilitieStorage?.data_disk
    },
    isIDC () {
      return this.cloudEnv === 'onpremise'
    },
    isShowStorageSelect () {
      return this.isIDC || this.isZettaKit || this.isUIS || this.isCAS
    },
    isShowIops () {
      return this.isAws && (this.storageItem?.value?.startsWith('gp3') || this.storageItem?.value?.startsWith('io1') || this.storageItem?.value?.startsWith('io2'))
    },
    isShowThroughput () {
      return this.isAws && this.storageItem?.value?.startsWith('gp3')
    },
    iopsTooltip () {
      if (this.iopsLimit.min && this.iopsLimit.max) {
        return `${this.iopsLimit.min} ~ ${this.iopsLimit.max}`
      }
      return ''
    },
    isLocalDisk () {
      if (this.storageItem && this.storageItem.value && this.storageItem.value.toLowerCase().startsWith('local_')) {
        return true
      }
      return false
    },
    isPublic () {
      return this.cloudEnv === CLOUD_ENVS.public
    },
    storageParams () {
      const params = {
        project_domain: this.form.fd.domain,
        zone: this.resolveZoneForCapability(),
      }
      const storageVal = this.storageItem.value?.toLowerCase()
      if (storageVal) {
        // 磁盘区分介质
        const storage_type = storageVal?.split('__')[0]
        const medium_type = storageVal?.split('__')[1]
        params.filter = [
          `storage_type.contains("${storage_type}")`,
          `medium_type.contains("${medium_type}")`,
        ]
      }
      return params
    },
    dataStorageTypes () {
      return this.capbilityData.data_storage_types2
    },
    dataStorageProviderTypes () {
      return this.dataStorageTypes[(this.currentCloudregion?.provider || '').toLowerCase()]
    },
    iopsLimit () {
      let ret = { min: 0 }
      if (this.isAws) {
        const { size } = this.form.fd
        const storageVal = this.storageItem?.value || ''
        // gp3 iops 不能超过磁盘500倍，最大80000
        if (storageVal.startsWith('gp3')) {
          ret = { min: 3000, max: 80000 }
          if (size) {
            ret.max = Math.min(size * 500, ret.max)
          }
        }
        // io1 iops 不能超过磁盘50倍，最大64000
        if (storageVal.startsWith('io1')) {
          ret = { min: 100, max: 64000 }
          if (size) {
            ret.max = Math.min(size * 50, ret.max)
          }
        }
        // io2 iops 不能超过磁盘1000倍，最大256000
        if (storageVal.startsWith('io2')) {
          ret = { min: 100, max: 256000 }
          if (size) {
            ret.max = Math.min(size * 1000, ret.max)
          }
        }
      }
      return ret
    },
  },
  watch: {
    cloudEnv (val) {
      this.$nextTick(() => {
        const { query, path } = this.$router.history.current
        const newQuery = JSON.parse(JSON.stringify(query))
        newQuery.type = val === 'onpremise' ? 'idc' : val
        this.form.fi.createType = newQuery.type
        this.$router.push({ path, query: newQuery })
      })
      this.$refs.areaSelects.fetchs(['provider', 'cloudregion', 'zone'])
      this.storageItem = {}
    },
    'form.fd.domain' (newValue, oldValue) {
      if (newValue !== oldValue) {
        this.$refs.areaSelects.fetchs(this.areaselectsName)
      }
    },
    // 云订阅列表刷新并自动选中后，补拉磁盘类型
    cloudproviderData (list) {
      if (!this.showCloudprovider || !list || !list.length) return
      this.$nextTick(() => this.refreshStorageByCloudprovider())
    },
    'form.fd.manager_id' (id) {
      if (!this.showCloudprovider || !id) return
      this.$nextTick(() => this.refreshStorageByCloudprovider())
    },
  },
  provide () {
    return {
      form: this.form,
    }
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
    // area-selects 的平台值 → cloudproviders.brand（与虚机/文件系统一致）
    mapAreaProviderToBrand (value) {
      if (!value) return undefined
      if (PROVIDER_MAP[value]) {
        return PROVIDER_MAP[value].brand || PROVIDER_MAP[value].provider
      }
      if (BRAND_MAP[value]) {
        return BRAND_MAP[value].brand || BRAND_MAP[value].provider
      }
      const hv = HYPERVISORS_MAP[String(value).toLowerCase()]
      if (hv) {
        return hv.brand || hv.provider
      }
      return value
    },
    resolveZoneForCapability () {
      return this.pickSingleAreaValue(
        this.form.fd.zone || this.form.fc.getFieldValue('zone'),
      )
    },
    getSelectedProviderNames () {
      return this.normalizeAreaValues(this.form.fd.provider).map(p => String(p))
    },
    normalizeAreaProviderKey (val) {
      return resolveHypervisorKey(val)
    },
    isAreaProviderMatch (selected, itemProvider) {
      return this.normalizeAreaProviderKey(selected) === this.normalizeAreaProviderKey(itemProvider)
    },
    filterCloudregionListByProvider (list = []) {
      if (!this.isPublic) return list
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
        resource: 'compute_engine',
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
    handleAreaChange () {
      if (this.showCloudprovider) {
        this.$nextTick(() => this.refreshStorageByCloudprovider())
        return
      }
      const zoneId = this.resolveZoneForCapability()
      if (zoneId) {
        this.fetchStorageList(zoneId)
      }
    },
    clearPublicLocationFields () {
      this.form.fc.setFieldsValue({
        provider: [],
        cloudregion: [],
        zone: undefined,
        manager_id: undefined,
        hypervisor: undefined,
      })
      this.cloudproviderItem = null
      this.storageOpts = []
    },
    onRegionSelect (payload) {
      const regions = payload?.nearbyRegions || []
      if (!regions.length) {
        this.clearPublicLocationFields()
        this.$nextTick(() => {
          this.$refs.areaSelects && this.$refs.areaSelects.fetchs(this.areaselectsName)
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
        manager_id: undefined,
        zone: undefined,
        hypervisor: undefined,
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
    },
    resolveHypervisorFromCloudprovider (item) {
      if (!item) return undefined
      const raw = item.provider || item.brand || item.name
      if (!raw) return undefined
      const fromMap = PROVIDER_MAP[raw]?.hypervisor
      if (fromMap) return fromMap
      return resolveHypervisorKey(raw)
    },
    applyHypervisorStorage (hypervisor) {
      if (!hypervisor) {
        this.storageOpts = []
        return
      }
      const provider = Array.isArray(this.provider) ? this.provider[0] : this.provider
      const data_storage_types = this.dataStorageTypes?.[hypervisor] || []
      this.form.fc.setFieldsValue({ hypervisor })
      this.$set(this.form.fd, 'hypervisor', hypervisor)
      this.getStorageOpts(data_storage_types, provider)
    },
    cloudproviderSelected (item) {
      this.cloudproviderItem = item || null
      if (!this.showCloudprovider) return
      // nextTick：等 zoneList / manager_id 写完再匹配 zone
      this.$nextTick(() => this.refreshStorageByCloudprovider())
    },
    // 根据当前云订阅 + 已选 zone 拉磁盘类型（供自动选中与手动切换共用）
    refreshStorageByCloudprovider () {
      if (!this.showCloudprovider) return
      const managerId = this.form.fc.getFieldValue('manager_id') || this.form.fd.manager_id
      let item = this.cloudproviderItem
      if (managerId && (!item || item.id !== managerId) && this.cloudproviderData?.length) {
        item = this.cloudproviderData.find(i => i.id === managerId) || null
        this.cloudproviderItem = item
      }
      if (!item) {
        this.storageOpts = []
        return
      }
      const zoneId = this.resolveZoneForCapability()
      if (zoneId) {
        this.fetchStorageList(zoneId)
        return
      }
      this.storageOpts = []
      this.form.fc.resetFields(['backend'])
    },
    fetchStorageList (zoneId) {
      if (!zoneId) {
        this.storageOpts = []
        return
      }
      const params = { show_emulated: true }
      if (this.isAdminMode) {
        params.project_domain = this.project_domain
      } else {
        params.scope = this.scope
      }
      // 请求序号：忽略过期响应，避免 zone 变更抢先请求清空手动/自动选订阅后的结果
      const reqId = ++this.storageFetchSeq
      const expectedCpId = this.cloudproviderItem?.id
      this.storageOpts = []
      new this.$Manager('capability').list({ ctx: [['zones', zoneId]], params })
        .then(({ data }) => {
          if (reqId !== this.storageFetchSeq) return
          if (this.showCloudprovider && expectedCpId && this.cloudproviderItem?.id !== expectedCpId) return
          try {
            // 用云订阅/当前区域对应的 provider 做磁盘类型文案映射
            const providerFromCp = this.cloudproviderItem?.provider || this.cloudproviderItem?.brand
            const provider = (providerFromCp ||
              (Array.isArray(this.provider) ? this.provider[0] : this.provider) ||
              '').toLowerCase()
            this.capbilityData = data
            this.instance_capabilities = data.instance_capabilities
            const hypervisors = Object.keys(this.dataStorageTypes || {})
            this.hypervisors = hypervisors
            let data_storage_types = []
            if (hypervisors && hypervisors.length > 0) {
              if (this.showCloudprovider) {
                // 公有云等：平台由云订阅决定
                const hypervisor = this.resolveHypervisorFromCloudprovider(this.cloudproviderItem) ||
                  this.form.fd.hypervisor
                if (hypervisor && this.dataStorageTypes[hypervisor]) {
                  this.form.fc.setFieldsValue({ hypervisor })
                  data_storage_types = this.dataStorageTypes[hypervisor] || []
                } else {
                  this.storageOpts = []
                  return
                }
              } else {
                const supportHypervisors = hypervisors.filter(item => ![HYPERVISORS_MAP.esxi.key, HYPERVISORS_MAP.pod.key].includes(item))
                const firstHypervisor = supportHypervisors[0]
                this.$nextTick(() => {
                  this.form.fc.setFieldsValue({
                    hypervisor: firstHypervisor,
                  })
                })
                data_storage_types = this.dataStorageTypes[firstHypervisor] || []
              }
            }
            this.getStorageOpts(data_storage_types, provider)
          } catch (error) {
            throw new Error(this.$t('common_589') + error)
          }
        })
    },
    getStorageOpts (data_storage_types, provider) {
      const list = data_storage_types || []
      this.storageOpts = list.map((item) => {
        const types = item.split('/')
        const backend = types[0]
        const medium = types[1]
        let opt = STORAGE_TYPES[provider] && STORAGE_TYPES[provider][backend]
        if (!this.isPublic && opt) {
          opt = {
            ...opt,
            label: `${opt.label}(${MEDIUM_MAP[medium]})`,
          }
        }
        const getLabel = (backend) => { return backend.includes('rbd') ? `Ceph(${MEDIUM_MAP[medium]})` : `${backend}(${MEDIUM_MAP[medium]})` }
        const backends = list.filter(v => v.includes(backend))
        return {
          value: `${backend}__${medium}`,
          label: opt ? opt.label : getLabel(backend),
          medium: MEDIUM_MAP[medium] || medium,
          multiple: backends.length > 1,
        }
      })
      if (this.diskType === 'private') {
        this.storageOpts = this.storageOpts.filter((item) => {
          return !item.value.includes('nova')
        })
      } else if (this.diskType === 'public') {
        // 公有云隐藏带local关键字的硬盘类型
        this.storageOpts = this.storageOpts.filter(({ value }) => {
          if (value.includes('local')) return false
          return true
        })
      }
      if (provider === 'qcloud' || provider === 'ucloud' || provider === 'rockbase') {
        this.storageOpts = this.storageOpts.filter((item) => {
          return !(item.value && item.value.toLowerCase().startsWith('local_'))
        })
      }
      this.form.fc.setFieldsValue({ backend: '' })
      if (this.storageOpts.length > 0) {
        this.form.fc.setFieldsValue({ backend: this.storageOpts[0].value })
        this.__newStorageChange(this.storageOpts[0].value)
      }
    },
    _translateStorageOps (data) {
      const findStorageProvider = optItem => {
        const storageName = optItem.name ? `(${optItem.name})` : ''
        let storageType = optItem.storage_type
        let storageProvider = {}
        if (R.is(Array, this.provider)) {
          this.provider.forEach(hypervisor => { // 将 kvm 和 esxi 的存储类型合一
            Object.assign(storageProvider, STORAGE_TYPES[hypervisor])
          })
        } else {
          storageProvider = STORAGE_TYPES[this.provider]
        }
        if (storageProvider[storageType.toLowerCase()]) {
          storageType = storageType.toLowerCase()
        } else if (storageProvider[storageType.toUpperCase()]) {
          storageType = storageType.toUpperCase()
        }
        return {
          storageName,
          storageType,
          storageProvider,
        }
      }
      // 过滤掉不支持创建的云硬盘的存储类型
      const conCreateCloud = data.filter(v => {
        const { storageProvider, storageType } = findStorageProvider(v)
        if (storageType === 'nova') return false
        if (storageType && storageProvider && !R.isEmpty(storageProvider) && storageProvider[storageType]) {
          return !storageProvider[storageType].unCreateCloud
        }
        // 说明支持自定义
        if (CUSTOM_STORAGE_TYPES.includes(this.provider)) {
          return true
        }
        return false
      })
      return conCreateCloud.map(v => {
        const { storageName, storageType, storageProvider } = findStorageProvider(v)
        let label = v.name
        try {
          if (storageProvider[storageType]) {
            label = storageProvider[storageType].label
          } else {
            label = storageProvider[storageType.toLowerCase()].label
          }
        } catch (error) {
          console.warn(this.$t('compute.text_413', [this.provider, storageType]))
        }
        return {
          label: `${label}${storageName}`,
          value: v.id,
          ...v,
        }
      })
    },
    __newStorageChange (val) {
      const item = this.storageOpts.find(v => v.value === val)
      this.storageItem = item
      try {
        this.minDiskData = this.getDataDiskMin(val)
        this.maxDiskData = this.getDataDiskMax(val)
        this.step = this.getDataDiskStep(val)
      } catch (error) {
        console.warn(this.$t('compute.text_413', [STORAGE_TYPES[this.provider], item.storage_type]))
      }
      this.form.fc.setFieldsValue({ size: 10 })
      const size = this.form.fc.getFieldValue('size')
      if (size > this.maxDiskData) { // 如果当前容量大于当前集群的最大值，那么取最大值
        this.form.fc.setFieldsValue({ size: this.maxDiskData })
      } else if (size < this.minDiskData) { // 如果当前容量小于当前集群的最大值，那么取最小值
        this.form.fc.setFieldsValue({ size: this.minDiskData })
      }
    },
    getDataDiskMin (val) {
      const curDisk = this.instanceCapabilitieDataDisk.find(v => val.startsWith(v.storage_type))
      if (curDisk) {
        return curDisk.min_size_gb
      }
      return STORAGE_TYPES[this.provider][val].min
    },
    getDataDiskMax (val) {
      const curDisk = this.instanceCapabilitieDataDisk.find(v => val.startsWith(v.storage_type))
      if (curDisk) {
        return curDisk.max_size_gb
      }
      return STORAGE_TYPES[this.provider][val].max
    },
    getDataDiskStep (val) {
      const curDisk = this.instanceCapabilitieDataDisk.find(v => val.startsWith(v.storage_type))
      if (curDisk) {
        return curDisk.step_size_gb
      }
      return 10
    },
    changeHandle (v) {
      const data_storage_types = this.dataStorageTypes[v]
      const provider = Array.isArray(this.provider) ? this.provider[0] : this.provider
      this.getStorageOpts(data_storage_types, provider)
    },
  },
}
</script>
