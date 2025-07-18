<template>
  <base-dialog class="v2vtransfer-dialog" @cancel="cancelDialog" :width="1300">
    <div slot="header">{{$t('compute.v2vtransfer.label')}}</div>
    <div slot="body">
      <dialog-selected-tips :name="$t('dictionary.server')" :count="params.data.length" :action="$t('compute.v2vtransfer.label')" />
      <dialog-table :data="params.data" :columns="columns" />
      <a-form :form="form.fc" hideRequiredMark v-bind="formItemLayout">
        <a-form-item :label="$t('compute.v2vtransfer.type')">
          <a-radio v-decorator="decorators.type">{{ $t('compute.v2vtransfer.kvm') }} <help-tooltip name="v2vTransferType" /></a-radio>
        </a-form-item>
        <a-form-item :label="$t('dictionary.project')">
          <domain-project
            :decorators="decorators.projectDomain"
            :fc="form.fc"
            :labelInValue="false" />
        </a-form-item>
        <a-form-item :label="$t('compute.text_177')" class="mb-0">
          <cloudregion-zone
            :zone-params="zoneParams"
            :cloudregion-params="cloudregionParams"
            :decorator="decorators.cloudregionZone"
            :disabledRegion="true"
            filterBrandResource="compute_engine" />
        </a-form-item>
        <a-form-item :label="$t('compute.text_49')" v-show="selectedItems.length === 1 && isRenderSystemDisk">
          <system-disk
            v-if="isRenderSystemDisk"
            :decorator="decorators.systemDisk"
            :type="type"
            :hypervisor="hypervisor"
            :form="form"
            :defaultSize="sysdisk.value"
            :defaultType="form.fd.defaultType"
            :capability-data="form.fi.capability"
            :ignoreStorageStatus="true"
            :storageParams="systemDiskStorageParams"
            :forceElements="['storage']"
            sizeDisabled />
        </a-form-item>
        <a-form-item :label="$t('compute.text_50')" v-show="selectedItems.length === 1 && isRenderDataDisk">
          <data-disk
            v-if="isRenderDataDisk"
            ref="dataDiskRef"
            :decorator="decorators.dataDisk"
            :type="type"
            :form="form"
            :hypervisor="hypervisor"
            :capability-data="form.fi.capability"
            :domain="domain"
            :storageParams="dataDiskStorageParams"
            :forceElements="['storage']"
            :isAddDiskShow="false"
            forceSizeDisabled
            sizeDisabled />
        </a-form-item>
        <a-form-item :label="$t('compute.network_mode')">
          <a-radio-group v-decorator="decorators.network_mode" @change="networkModeHandle">
            <a-radio-button value="old">{{$t('compute.network_mode.old')}}<help-tooltip class="ml-1" :text="$t('compute.network_mode.old_tips')" /></a-radio-button>
            <a-tooltip :title="networkModeTooltips">
              <a-radio-button value="new" :disabled="networkModeTooltips">{{$t('compute.network_mode.new')}}</a-radio-button>
            </a-tooltip>
          </a-radio-group>
        </a-form-item>
        <a-form-item v-if="!isNetworkModeNew" :label="$t('compute.network_check_result')">
          <a-spin v-if="networkCheckLoading">
            <a-icon slot="indicator" type="loading" spin />
          </a-spin>
          <span v-else>
            <span v-if="checkNetworkResultSuccess" class="success">{{$t('compute.network_check_result.success')}}</span>
            <span v-else class="error">
              {{$t('compute.network_check_result.error')}}
              <a-icon type="sync" class="mr-2 pointer" :spin="spinLoading" @click="networkCheckHandle" />
              <help-link :href="href">{{$t('compute.network_check_result.new_create')}}</help-link>
            </span>
          </span>
        </a-form-item>
        <a-form-item v-if="isNetworkModeNew" :label="$t('compute.text_104')" class="mb-0">
          <server-network
            :form="form"
            :decorator="decorators.network"
            :network-resource-mapper="networkResourceMapper"
            :network-list-params="networkParams"
            :schedtag-params="resourcesParams.schedtag"
            :vpcResource="vpcResource"
            :networkVpcParams="resourcesParams.vpcParams"
            :showMacConfig="firstData.hypervisor === 'kvm'"
            :showDeviceConfig="firstData.hypervisor === 'kvm'"
            :isDialog="true"
            :hiddenNetworkOptions="['default', 'schedtag']"
            defaultNetworkType="manual"
            :hiddenAdd="true" />
        </a-form-item>
        <a-form-item
          :label="$t('compute.text_111')"
          :validate-status="message ? 'warning' : hostValidateStatus"
          :help="message || hostValidateMsg">
          <list-select
            v-decorator="decorators.host"
            :list-props="resourceProps"
            :formatter="v => v.name"
            :multiple="false"
            :placeholder="$t('compute.text_314')"
            :dialog-params="{ title: $t('compute.text_111'), width: 1060 }"
            @change="hostChangeHandle" />
        </a-form-item>
      </a-form>
    </div>
    <div slot="footer">
      <a-tooltip :title="handleConfirmDisabledTooltip">
        <a-button type="primary" @click="handleConfirm" :loading="loading" :disabled="handleConfirmDisabled">{{ $t('dialog.ok') }}</a-button>
      </a-tooltip>
      <a-button class="ml-2" @click="cancelDialog">{{ $t('dialog.cancel') }}</a-button>
    </div>
  </base-dialog>
</template>

<script>
import _ from 'lodash'
import * as R from 'ramda'
import { mapGetters } from 'vuex'
import { typeClouds, diskSupportTypeMedium, findPlatform, getOriginDiskKey } from '@/utils/common/hypervisor'
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'
import ListSelect from '@/sections/ListSelect'
import DomainProject from '@/sections/DomainProject'
import CloudregionZone from '@/sections/CloudregionZone'
import validateForm, { isRequired, isWithinRange } from '@/utils/validate'
import { STORAGE_TYPES } from '@/constants/compute'
// import { HYPERVISORS_MAP } from '@/constants'
import { checkIpV6, getIpv6Start } from '@Compute/utils/createServer'
import DataDisk from '@Compute/sections/DataDisk'
import SystemDisk from '@Compute/views/vminstance/create/components/SystemDisk'
import { NETWORK_OPTIONS_MAP, MEDIUM_MAP } from '@Compute/constants'
import ServerNetwork from '@Compute/sections/ServerNetwork'
import ResourceProps from '../mixins/resourceProps'

export default {
  name: 'VmV2vTransferDialog',
  provide () {
    return {
      form: this.form,
    }
  },
  components: {
    ListSelect,
    DomainProject,
    ServerNetwork,
    CloudregionZone,
    DataDisk,
    SystemDisk,
  },
  mixins: [DialogMixin, WindowsMixin, ResourceProps],
  data () {
    const firstData = this.params.data[0]

    const checkIpInSegment = (i, networkData) => {
      return (rule, value, cb) => {
        const isIn = isWithinRange(value, networkData.guest_ip_start, networkData.guest_ip_end)
        if (isIn) {
          cb()
        } else {
          cb(new Error(this.$t('compute.text_205')))
        }
      }
    }

    function diskValidator (rule, value, callback) {
      if (R.isNil(value) || R.isEmpty(value)) {
        return callback(new Error(this.$t('compute.text_206')))
      }
      if (!value.startsWith('/')) {
        return callback(new Error(this.$t('compute.text_207')))
      }
      if (value === '/') {
        return callback(new Error(this.$t('compute.text_208')))
      }
      callback()
    }

    return {
      loading: false,
      networkCheckLoading: false,
      spinLoading: false,
      form: {
        fc: this.$form.createForm(this, {
          onValuesChange: (props, values) => {
            Object.keys(values).forEach((key) => {
              this.$set(this.form.fd, key, values[key])
            })
          },
        }),
        fd: {
          defaultType: null,
        },
        fi: {
          capability: {},
        },
      },
      hosts: [],
      message: '',
      decorators: {
        type: [
          'type',
          {
            initialValue: true,
            valuePropName: 'checked',
          },
        ],
        projectDomain: {
          domain: [
            'domain',
            {
              initialValue: firstData.domain_id,
            },
          ],
          project: [
            'project',
            {
              initialValue: firstData.tenant_id,
            },
          ],
        },
        cloudregionZone: {
          cloudregion: [
            'cloudregion',
            {
              initialValue: { key: '', label: '' },
              rules: [
                { validator: isRequired(), message: this.$t('compute.text_212') },
              ],
            },
          ],
          zone: [
            'zone',
            {
              initialValue: { key: '', label: '' },
              rules: [
                { validator: isRequired(), message: this.$t('compute.text_213') },
              ],
            },
          ],
        },
        host: [
          'host',
          {
            rules: [
              { required: false, message: this.$t('compute.text_314'), trigger: 'change' },
            ],
          },
        ],
        systemDisk: {
          type: [
            'systemDiskType',
            {
              rules: [
                { validator: isRequired(), message: this.$t('compute.text_121') },
              ],
            },
          ],
          size: [
            'systemDiskSize',
            {
              rules: [
                { required: true, message: this.$t('compute.text_122') },
              ],
            },
          ],
          schedtag: [
            'systemDiskSchedtag',
            {
              validateTrigger: ['change', 'blur'],
              rules: [{
                required: true,
                message: this.$t('compute.text_123'),
              }],
            },
          ],
          policy: [
            'systemDiskPolicy',
            {
              validateTrigger: ['blur', 'change'],
              rules: [{
                required: true,
                message: this.$t('compute.text_123'),
              }],
            },
          ],
          storage: [
            'systemDiskStorage',
            {
              rules: [{
                required: true,
                message: this.$t('compute.text_1351'),
              }],
            },
          ],
        },
        dataDisk: {
          type: i => [
            `dataDiskTypes[${i}]`,
            {
              rules: [
                { validator: isRequired(), message: this.$t('compute.text_121') },
              ],
            },
          ],
          size: i => [
            `dataDiskSizes[${i}]`,
            {
              rules: [
                { required: true, message: this.$t('compute.text_122') },
              ],
            },
          ],
          schedtag: i => [
            `dataDiskSchedtags[${i}]`,
            {
              validateTrigger: ['change', 'blur'],
              rules: [{
                required: true,
                message: this.$t('compute.text_123'),
              }],
            },
          ],
          policy: i => [
            `dataDiskPolicys[${i}]`,
            {
              validateTrigger: ['blur', 'change'],
              rules: [{
                required: true,
                message: this.$t('compute.text_123'),
              }],
            },
          ],
          snapshot: i => [
            `dataDiskSnapshots[${i}]`,
            {
              validateTrigger: ['blur', 'change'],
              rules: [{
                required: true,
                message: this.$t('compute.text_124'),
              }],
            },
          ],
          filetype: i => [
            `dataDiskFiletypes[${i}]`,
            {
              validateTrigger: ['blur', 'change'],
              rules: [{
                required: true,
                message: this.$t('compute.text_125'),
              }],
            },
          ],
          mountPath: i => [
            `dataDiskMountPaths[${i}]`,
            {
              validateTrigger: ['blur', 'change'],
              rules: [{
                required: true,
                message: this.$t('compute.text_126'),
              }, {
                validator: diskValidator,
              }],
            },
          ],
          storage: i => [
            `dataDiskStorages[${i}]`,
            {
              rules: [{
                required: true,
                message: this.$t('compute.text_1351'),
              }],
            },
          ],
          preallocation: i => [
            `dataDiskPreallocation[${i}]`,
          ],
        },
        network: {
          networkType: [
            'networkType',
            {
              initialValue: NETWORK_OPTIONS_MAP.default.key,
            },
          ],
          networkConfig: {
            vpcs: i => [
              `vpcs[${i}]`,
              {
                validateTrigger: ['change', 'blur'],
                rules: [{
                  required: true,
                  message: this.$t('compute.text_194'),
                }],
              },
            ],
            networks: i => [
              `networks[${i}]`,
              {
                validateTrigger: ['change', 'blur'],
                rules: [{
                  required: true,
                  message: this.$t('compute.text_217'),
                }],
              },
            ],
            ips: (i, networkData) => [
              `networkIps[${i}]`,
              {
                validateFirst: true,
                validateTrigger: ['blur', 'change'],
                rules: [
                  {
                    required: true,
                    message: this.$t('compute.text_218'),
                  },
                  {
                    validator: validateForm('IPv4'),
                  },
                  {
                    validator: checkIpInSegment(i, networkData),
                  },
                ],
              },
            ],
            ips6: (i, networkData) => [
              `networkIpsAddress6[${i}]`,
              {
                validateFirst: true,
                validateTrigger: ['blur', 'change'],
                rules: [
                  {
                    required: true,
                    message: this.$t('compute.complete_ipv6_address'),
                  },
                  {
                    validator: checkIpV6(i, networkData),
                  },
                ],
              },
            ],
            macs: (i, networkData) => [
              `networkMacs[${i}]`,
              {
                validateFirst: true,
                validateTrigger: ['blur', 'change'],
                rules: [
                  {
                    required: true,
                    message: this.$t('compute.text_806'),
                  },
                  {
                    validator: validateForm('mac'),
                  },
                ],
              },
            ],
            ipv6s: (i, networkData) => [
              `networkIPv6s[${i}]`,
              {
                validateFirst: true,
                validateTrigger: ['blur', 'change'],
              },
            ],
            ipv6_mode: (i, networkData) => [
              `networkIPv6Modes[${i}]`,
              {
                validateTrigger: ['change', 'blur'],
              },
            ],
            devices: i => [
              `networkDevices[${i}]`,
              {
                validateTrigger: ['change', 'blur'],
                rules: [{
                  required: true,
                  message: this.$t('compute.sriov_device_tips'),
                }],
              },
            ],
          },
          networkSchedtag: {
            schedtags: i => [
              `networkSchedtags[${i}]`,
              {
                validateTrigger: ['change', 'blur'],
                rules: [{
                  required: true,
                  message: this.$t('compute.text_123'),
                }],
              },
            ],
            policys: (i, networkData) => [
              `networkPolicys[${i}]`,
              {
                validateTrigger: ['blur', 'change'],
                rules: [{
                  required: true,
                  message: this.$t('common_256'),
                }],
              },
            ],
            devices: i => [
              `networkDevices[${i}]`,
              {
                validateTrigger: ['change', 'blur'],
                rules: [{
                  required: true,
                  message: this.$t('compute.sriov_device_tips'),
                }],
              },
            ],
          },
        },
        schedPolicy: {
          schedPolicyType: [
            'schedPolicyType',
            {
              initialValue: 'default',
            },
          ],
          schedPolicyHost: [
            'schedPolicyHost',
            {
              rules: [
                { required: true, message: this.$t('compute.text_219') },
              ],
            },
          ],
          policySchedtag: {
            schedtags: i => [
              `policySchedtagSchedtags[${i}]`,
              {
                validateTrigger: ['change', 'blur'],
                rules: [{
                  required: true,
                  message: this.$t('compute.text_123'),
                }],
              },
            ],
            policys: (i, networkData) => [
              `policySchedtagPolicys[${i}]`,
              {
                validateTrigger: ['blur', 'change'],
                rules: [{
                  required: true,
                  message: this.$t('common_256'),
                }],
              },
            ],
          },
        },
        network_mode: [
          'network_mode',
          {
            initialValue: 'old',
          },
        ],
      },
      formItemLayout: {
        wrapperCol: {
          span: 20,
        },
        labelCol: {
          span: 4,
        },
      },
      checkNetworkResultSuccess: false,
      dataDiskInterval: null,
      sysdisk: {},
    }
  },
  computed: {
    ...mapGetters(['scope', 'isAdminMode']),
    firstData () {
      return this.params.data[0]
    },
    isSingle () {
      return this.params.data.length === 1
    },
    hostsParams () {
      const hostIds = this.forcastData?.filtered_candidates?.map(v => v.id) || []
      const { domain, zone } = this.form.fd
      const ret = {
        scope: this.scope,
        limit: 10,
        enabled: 1,
        host_status: 'online',
        brand: typeClouds.brandMap.OneCloud.brand,
        os_arch: this.firstData.os_arch,
        project_domain: domain,
      }
      if (hostIds && hostIds.length > 0) {
        ret.filter = `id.notin(${hostIds.join(',')})`
      }
      if (zone) {
        ret.zone = zone.key
      }
      return ret
    },
    hostsOptions () {
      const hostIds = this.forcastData?.filtered_candidates?.map(v => v.id) || []
      if (this.forcastData?.can_create === false) {
        return []
      }
      return this.hosts.filter(v => {
        return !hostIds.includes(v.id) && v.id !== this.firstData.host_id
      }).map(v => {
        return {
          key: v.id,
          label: v.name,
        }
      })
    },
    hostValidateStatus () {
      if (this.forcastData && this.hostsOptions?.length === 0) {
        return 'error'
      }
      return 'success'
    },
    hostValidateMsg () {
      if (this.forcastData && this.hostsOptions?.length === 0) {
        return this.$t('compute.transfer_host')
      }
      return this.$t('compute.v2v_transfer.host_tooltip')
    },
    columns () {
      const fields = ['name', 'status', 'host', 'ips', 'region', 'tenant']
      const columnsMap = {}
      this.params.columns.forEach(item => {
        const { field } = item
        if (fields.indexOf(field) > -1) {
          columnsMap[field] = item
        }
      })
      return fields.map(field => {
        return columnsMap[field]
      })
    },
    networkParams () {
      const ret = {
        scope: this.scope,
        usable: true,
        brand: typeClouds.brandMap.OneCloud.brand,
      }
      const { domain, zone } = this.form.fd
      if (domain) {
        ret.project_domain = domain
      }
      if (zone) {
        ret.zone = zone.key
      }
      return ret
    },
    vpcResource () {
      const { cloudregion } = this.form.fd
      if (!cloudregion) return ''
      return `cloudregions/${cloudregion.key}/vpcs`
    },
    resourcesParams () {
      const schedtag = {
        limit: 1024,
        'filter.0': 'resource_type.equals(networks)',
      }
      const vpcParams = {
        limit: 0,
        usable: true,
        brand: typeClouds.brandMap.OneCloud.brand,
      }
      const { domain, zone } = this.form.fd
      if (domain) {
        vpcParams.project_domain = domain
      }
      if (zone) {
        vpcParams.zone_id = zone.key
      }
      return {
        schedtag,
        vpcParams,
      }
    },
    cloudregionParams () {
      return {
        cloud_env: 'onpremise',
        usable: true,
        show_emulated: true,
        scope: this.scope,
      }
    },
    zoneParams () {
      return {
        usable: true,
        show_emulated: true,
        order_by: 'created_at',
        order: 'asc',
        scope: this.scope,
      }
    },
    isNetworkModeNew () {
      return this.form.fd.network_mode === 'new'
    },
    href () {
      const url = this.$router.resolve('/network2')
      return url.href
    },
    networkModeTooltips () {
      if (!this.isSingle) {
        return this.$t('compute.network_mode.new_tips')
      }
      return undefined
    },
    isDisabledCreate () {
      if (this.isNetworkModeNew) return false
      return !this.checkNetworkResultSuccess
    },
    handleConfirmDisabled () {
      if (this.isDisabledCreate) return this.isDisabledCreate
      return this.forcastData && this.hostsOptions?.length === 0
    },
    handleConfirmDisabledTooltip () {
      if (this.isDisabledCreate) {
        return this.$t('compute.network_check_result.error')
      }
      return ''
    },
    selectedItems () {
      return this.params.data
    },
    selectedItem () {
      return this.params.data[0]
    },
    type () {
      const brand = typeClouds.brandMap.OneCloud.brand
      return findPlatform(brand)
    },
    hypervisor () {
      return 'kvm'
    },
    isRenderSystemDisk () {
      return this.hypervisor && this.form.fi.capability.storage_types3 && this.form.fd.defaultType
    },
    isRenderDataDisk () {
      if (!(this.hypervisor && this.form.fi.capability.storage_types3)) return false
      if (this.selectedItems.length > 1) return false
      if (!(this.selectedItems[0].disks_info || []).some(item => item.disk_type === 'data')) return false
      return true
    },
    systemDiskStorageParams () {
      const params = {
        scope: this.$store.getters.scope,
        usable: true,
        brand: typeClouds.brandMap.OneCloud.brand,
      }
      const { systemDiskType = {} } = this.form.fd
      const hypervisor = this.hypervisor
      let key = systemDiskType.key || ''
      // 磁盘区分介质
      if (diskSupportTypeMedium(hypervisor)) {
        key = getOriginDiskKey(key)
      }
      if (key) {
        params.filter = [`storage_type.contains("${key}")`]
      }
      return params
    },
    dataDiskStorageParams () {
      const { systemDiskType = {}, dataDiskTypes = {} } = this.form.fd
      const hypervisor = this.hypervisor
      let key = systemDiskType.key || ''
      const datadisks = Object.values(dataDiskTypes)
      datadisks.forEach(item => {
        if (item.key) key = item.key
      })
      // 磁盘区分介质
      if (diskSupportTypeMedium(hypervisor)) {
        key = getOriginDiskKey(key)
      }
      const params = {
        scope: this.$store.getters.scope,
        usable: true, // 包含了 enable:true, status为online的数据
        brand: typeClouds.brandMap.OneCloud.brand, // kvm,vmware支持指定存储
      }
      if (key) {
        params.filter = [`storage_type.contains("${key}")`]
      }
      return params
    },
  },
  watch: {
    'form.fd.zone' (newV, oldV) {
      if (newV?.key && (newV.key !== oldV.key)) {
        this.capability(newV.key)
      }
    },
  },
  created () {
    this.capability = _.debounce(this._capability, 1000)
    this.queryData()
  },
  methods: {
    networkModeHandle (e) {
      if (e.target.value === 'new') {
        this.$nextTick(() => {
          this.form.fc.setFieldsValue({
            networkType: NETWORK_OPTIONS_MAP.manual.key,
          })
        })
      }
    },
    networkCheckHandle () {
      this.spinLoading = true
      this.batchConvertPrecheck()
      setTimeout(() => {
        this.spinLoading = false
      }, 2000)
    },
    queryData () {
      this.queryHosts()
      this.batchConvertPrecheck()
    },
    getDiskTypeObj (type, medium) {
      const storageItem = STORAGE_TYPES[this.hypervisor]
      const diskKey = `${type}/${medium}`
      if (this.form.fi.capability.storage_types3[this.hypervisor]) {
        const keys = Object.keys(this.form.fi.capability.storage_types3[this.hypervisor])
        if (keys.includes(diskKey)) {
          return { type, medium, label: R.is(Object, storageItem) ? (storageItem[type]?.label || type) : type }
        } else {
          let target = ''
          const index = keys.findIndex(key => key.startsWith('local'))
          if (index > -1) {
            target = keys[index]
          } else {
            target = keys.length ? keys[0] : ''
          }
          return { type: target.split('/')[0], medium: target.split('/')[1], label: R.is(Object, storageItem) ? (storageItem[type]?.label || type) : type }
        }
      }
      return { type: '', medium: '', label: '' }
    },
    // v2v 不支持 rdb 存储
    filterDiskType (data) {
      const d = R.clone(data)
      const keys = Object.keys(d)
      keys.forEach(key => {
        if (key.includes('storage_types')) {
          const v = d[key]
          if (R.is(Array, v)) {
            d[key] = v.filter(str => !str.startsWith('rbd/'))
          }
          if (R.is(Object, v)) {
            const ks = Object.keys(v)
            ks.forEach(k => {
              if (R.is(Array, d[key][k])) {
                d[key][k] = d[key][k].filter(str => !str.startsWith('rbd/'))
              }
              if (R.is(Object, d[key][k])) {
                const kss = Object.keys(d[key][k])
                kss.forEach(kk => {
                  if (kk.startsWith('rbd/')) {
                    delete d[key][k][kk]
                  }
                })
              }
            })
          }
        }
      })
      return d
    },
    _capability (zoneId) { // 可用区查询
      const data = { show_emulated: true, scope: this.scope }
      const m = new this.$Manager('zones')
      m.get({
        id: `${zoneId}/capability`,
        params: data,
      }).then(({ data = {} }) => {
        this.form.fi.capability = this.filterDiskType(data)
        const conf = this.maxConfig()
        this.form.fd.datadisks = conf[2]
        this.form.fd.sysdisks = conf[3]
        this.beforeDataDisks = [...this.form.fd.datadisks]
        if (this.form.fd.sysdisks && this.form.fd.sysdisks.length === 1) {
          this.sysdisk = this.form.fd.sysdisks[0]
          const storageItem = STORAGE_TYPES[this.selectedItem.hypervisor]
          // 磁盘区分介质
          let diskKey = ''
          let diskLabel = R.is(Object, storageItem) ? (storageItem[diskKey]?.label || diskKey) : diskKey
          const { medium_type } = this.selectedItem.disks_info[0] || {}
          const diskTypeObj = this.getDiskTypeObj(this.sysdisk.type, medium_type)
          if (diskTypeObj.type && diskTypeObj.medium) {
            diskKey = `${diskTypeObj.type}/${diskTypeObj.medium}`
            diskLabel = `${diskTypeObj.label}(${MEDIUM_MAP[diskTypeObj.medium]})`
          }

          this.form.fd.defaultType = {
            [this.decorators.systemDisk.type[0]]: { key: diskKey, label: diskLabel },
          }
        }

        const dataDisks = this.selectedItem.disks_info.filter(item => item.disk_type === 'data' || item.disk_type === 'swap')
        const { type: dataDiskType, medium_type: dataDiskMedium } = dataDisks[0] || {}
        const diskTypeObj = this.getDiskTypeObj(dataDiskType, dataDiskMedium)
        this.$nextTick(() => {
          this.diskLoaded = true

          this.dataDiskInterval = setInterval(() => {
            if (this.isRenderDataDisk && this.$refs.dataDiskRef) {
              this.form.fd.datadisks.forEach((v, i) => {
                this.$refs.dataDiskRef.add({ size: v.value, min: v.value, diskType: diskTypeObj.type, disabled: false, sizeDisabled: true, medium: diskTypeObj.medium, ...v })
              })
              clearInterval(this.dataDiskInterval)
              this.dataDiskInterval = null
            }
          }, 500)
        })
      })
    },
    networkResourceMapper (list) {
      return list
        .map(val => {
          const remain = val.ports - val.ports_used
          if (remain <= 0) {
            return {
              ...val,
              __disabled: true,
            }
          }
          return val
        })
        .sort((a, b) => (b.ports - b.ports_used) - (a.ports - a.ports_used))
    },
    /**
   * 组装网络数据
   *
   * @returns { Array }
   * @memberof GenCreateData
   */
    async genNetworks (values) {
      let ret = [{ exit: false }]
      // 指定 IP 子网
      if (this.form.fd.networkType === NETWORK_OPTIONS_MAP.manual.key) {
        ret = []
        const { networkIPv6s, networkIpsAddress6, networkIPv6Modes } = await this.form.fc.validateFields()
        R.forEachObjIndexed((value, key) => {
          const obj = {
            network: value,
          }
          if (this.form.fd.networkIps) {
            const address = this.form.fd.networkIps[key]
            if (address) {
              obj.address = address
            }
          }
          if (this.form.fd.networkMacs) {
            const mac = this.form.fd.networkMacs[key]
            if (mac) {
              obj.mac = mac
            }
          }
          if (networkIPv6s && networkIPv6s[key]) {
            obj.require_ipv6 = true
          }
          const target = this.form.fi.networkList.filter(item => item.key === key)
          if (networkIpsAddress6 && networkIpsAddress6[key]) {
            const ipv6Last = networkIpsAddress6[key]
            const ipv6First = getIpv6Start(target[0]?.network?.guest_ip6_start)
            obj.address6 = ipv6First + ipv6Last
          }
          if (obj.require_ipv6) {
            if (networkIPv6Modes && networkIPv6Modes[key] === 'only') {
              obj.strict_ipv6 = true
            }
          }
          if (!target[0]?.network?.guest_ip_start && !target[0]?.network?.guest_ip_end && target[0]?.network?.guest_ip6_start) {
            obj.strict_ipv6 = true
          }
          if (this.form.fd.networkExits) {
            const exit = this.form.fd.networkExits[key]
            if (exit) {
              obj.exit = true
            }
          }
          if (this.form.fd.networkDevices) {
            const device = this.form.fd.networkDevices[key]
            if (device) {
              obj.sriov_device = { model: device }
            }
          }
          ret.push(obj)
        }, values.networks)
      }
      // 指定 调度标签
      if (this.form.fd.networkType === NETWORK_OPTIONS_MAP.schedtag.key) {
        ret = []
        R.forEachObjIndexed((value, key) => {
          const obj = {
            id: value,
          }
          const strategy = this.form.fd.networkPolicys[key]
          if (strategy) {
            obj.strategy = strategy
          }
          if (this.form.fd.networkDevices) {
            const device = this.form.fd.networkDevices[key]
            if (device) {
              obj.sriov_device = { model: device }
            }
          }
          ret.push({
            schedtags: [obj],
          })
        }, values.networkSchedtags)
      }
      return ret
    },
    async doTransfer (ids, values) {
      const data = {
        prefer_host: values.host,
        target_hypervisor: this.firstData.hypervisor,
      }
      if (this.isNetworkModeNew) {
        data.networks = await this.genNetworks(values)
      }
      if (this.selectedItems.length === 1) {
        data.disks = this.genDiskData(values)
      }
      return this.params.onManager('batchPerformAction', {
        id: ids,
        steadyStatus: ['running', 'ready'],
        managerArgs: {
          action: 'convert-to-kvm',
          data,
        },
      })
    },
    async handleConfirm () {
      this.loading = true
      try {
        const values = await this.form.fc.validateFields()
        const ids = this.params.data.map(item => item.id)
        await this.doTransfer(ids, values)
        this.$message.success(this.$t('common.success'))
        this.params.successCallback && this.params.successCallback()
        this.cancelDialog()
      } finally {
        this.loading = false
      }
    },
    queryHosts () {
      const hostsManager = new this.$Manager('hosts')
      hostsManager.list({ params: this.hostsParams }).then((res) => {
        this.hosts = res.data.data || []
      }).catch((err) => {
        console.log(err)
        throw err
      })
    },
    hostChangeHandle (hostId) {
      const hostArr = this.params.data.filter(v => v.host_id === hostId)
      if (hostArr.length > 0) {
        this.message = this.$t('compute.transfer_mutiple_dialog_alert', [hostArr.length])
      } else {
        this.message = ''
      }
    },
    async batchConvertPrecheck () {
      try {
        this.checkNetworkResultSuccess = false
        this.networkCheckLoading = true
        const ids = this.params.data.map(item => item.id)
        const m = new this.$Manager('servers')
        const res = await m.performClassAction({ action: 'batch-convert-precheck', data: { guest_ids: ids } })

        if (!res.data?.network_failed) {
          this.checkNetworkResultSuccess = true
        }
      } catch (error) {
        throw error
      } finally {
        this.networkCheckLoading = false
      }
    },
    genDiskData (values) {
      const sysDisk = []
      const dataDisk = []
      const len = this.form.fd.sysdisks?.length || -1
      if (len) {
        const sysDiskType = this.form.fd.systemDiskType?.key
        const systemDisk = {
          index: 0,
          disk_type: 'sys',
          backend: getOriginDiskKey(sysDiskType),
          size: this.form.fd.systemDiskSize * 1024,
        }
        // 磁盘介质
        if (this.form.fi.systemDiskMedium) {
          systemDisk.medium = this.form.fi.systemDiskMedium
        }
        if (this.form.fd.systemDiskSchedtag) {
          systemDisk.schedtags = [
            { id: this.form.fd.systemDiskSchedtag },
          ]
          if (this.form.fd.systemDiskPolicy && this.form.fd.systemDiskPolicy) {
            systemDisk.schedtags[0].strategy = this.form.fd.systemDiskPolicy
          }
        }
        if (this.form.fd.systemDiskStorage) {
          systemDisk.storage_id = this.form.fd.systemDiskStorage
        }
        if (this.form.fd.systemDiskIops) {
          systemDisk.iops = this.form.fd.systemDiskIops
        }
        if (this.form.fd.systemDiskThroughput) {
          systemDisk.throughput = this.form.fd.systemDiskThroughput
        }
        if (this.form.fd.systemDiskPreallocation) {
          systemDisk.preallocation = this.form.fd.systemDiskPreallocation
        }
        if (this.form.fd.systemDiskAutoReset) {
          systemDisk.auto_reset = this.form.fd.systemDiskAutoReset
        }
        sysDisk.push(systemDisk)
      }
      if (this.$refs.dataDiskRef) {
        let index = len >= 1 ? len - 1 : len
        const dataDisks = this.$refs.dataDiskRef.dataDisks
        R.forEachObjIndexed((value, key) => {
          const diskObj = {
            disk_type: 'data',
            index: ++index,
          }
          if (values.dataDiskSizes && values.dataDiskSizes[key]) {
            diskObj.size = values.dataDiskSizes[key] * 1024
          }
          if (values.dataDiskTypes) {
            if (values.dataDiskTypes[key]) {
              // 磁盘区分介质
              let diskKey = values.dataDiskTypes[key].key
              if (diskSupportTypeMedium(this.selectedItem.hypervisor)) {
                diskKey = getOriginDiskKey(diskKey)
              }
              diskObj.backend = diskKey
            } else {
              if (_.get(dataDisks, '[0].diskType.key')) {
                // 磁盘区分介质
                let diskKey = _.get(dataDisks, '[0].diskType.key') // 默认添加的盘和第一块保持一致
                if (diskSupportTypeMedium(this.selectedItem.hypervisor)) {
                  diskKey = getOriginDiskKey(diskKey)
                }
                diskObj.backend = diskKey
              }
            }
          }
          if (values.dataDiskFiletypes && values.dataDiskFiletypes[key]) {
            diskObj.filetype = values.dataDiskFiletypes[key]
          }
          if (values.dataDiskMountPaths && values.dataDiskMountPaths[key]) {
            diskObj.mountpoint = values.dataDiskMountPaths[key]
          }
          if (values.dataDiskSnapshots && values.dataDiskSnapshots[key]) {
            diskObj.snapshot_id = values.dataDiskSnapshots[key]
          }
          if (values.dataDiskSchedtags && values.dataDiskSchedtags[key]) {
            diskObj.schedtags = [
              { id: values.dataDiskSchedtags[key] },
            ]
            if (values.dataDiskPolicys && values.dataDiskPolicys[key]) {
              diskObj.schedtags[0].strategy = values.dataDiskPolicys[key]
            }
          }
          if (values.dataDiskStorages && values.dataDiskStorages[key]) {
            diskObj.storage_id = values.dataDiskStorages[key]
          }
          if (values.dataDiskPreallocation && values.dataDiskPreallocation[key]) {
            diskObj.preallocation = values.dataDiskPreallocation[key]
          }
          // 磁盘区分介质
          if (values.dataDiskTypes && values.dataDiskTypes[key]) {
            const { key: dataDiskKey = '' } = values.dataDiskTypes[key] || {}
            const medium = dataDiskKey.split('/')[1]
            if (diskSupportTypeMedium(this.selectedItem.hypervisor) && medium) {
              diskObj.medium = medium
            }
          }
          dataDisk.push(diskObj)
        }, values.dataDiskSizes)
        if (_.get(this.params, 'data[0].disks_info[0].disk_type') === 'data') {
          dataDisk.shift() // 因为第一块盘的disk_type是data，说明无系统盘，第一块盘是ISO启动的，需要去掉
        }
      }
      return [...sysDisk, ...dataDisk]
    },
    maxConfig () {
      let cpu = 0
      let mem = 0
      const datadisks = []
      const sysdisks = []
      for (let i = 0; i < this.params.data.length; i++) {
        if (cpu < this.params.data[i].vcpu_count) {
          cpu = this.params.data[i].vcpu_count
        }
        if (mem < this.params.data[i].vmem_size) {
          mem = this.params.data[i].vmem_size
        }
        if (this.params.data[i].disks_info) {
          this.params.data[i].disks_info.forEach((item) => {
            if (item.disk_type !== 'sys') { // 数据盘
              datadisks.push({ value: item.size / 1024, type: item.storage_type, medium_type: item.medium_type })
            } else { // 系统盘
              sysdisks.push({ value: item.size / 1024, type: item.storage_type, medium_type: item.medium_type })
            }
          })
        }
      }
      return [cpu, mem / 1024, datadisks, sysdisks]
    },
  },
}
</script>

<style lang="scss">
.v2vtransfer-dialog .ant-col-20 {
  width: 83%;
  .success {
    color: #0cbd09;
  }
  .error {
    color: #f00b0b;
  }
  .pointer {
    cursor: pointer;
  }
}
</style>
