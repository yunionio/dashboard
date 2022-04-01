<template>
  <div>
    <page-header :title="$t('compute.text_1100')" style="margin-bottom: 7px;" />
    <a-alert class="mb-2" type="warning" v-if="tips">
      <div slot="message">
        {{ tips }}
      </div>
    </a-alert>
    <a-card :bordered="false" size="small">
      <template #title>
        <dialog-selected-tips :name="$t('dictionary.server')" :count="params.data.length" :action="$t('compute.text_1100')" />
      </template>
      <dialog-table :data="params.data" :columns="columns" />
    </a-card>
    <page-body>
      <div class="form-wrapper">
        <a-form
          v-bind="formItemLayout"
          :form="form.fc">
          <a-form-item :label="$t('compute.text_1058')" class="mb-0">
            <cpu-radio
              :decorator="decorators.vcpu"
              :options="form.fi.cpuMem.cpus || []"
              :disable-options="disableCpus"
              @change="cpuChange"
              :disabled="runningArm"
              :extra="cpuExtra"
              :max="form.fd.vcpu < 32 ? 32 : 128" />
          </a-form-item>
          <a-form-item :label="$t('compute.text_369')" class="mb-0">
            <mem-radio :decorator="decorators.vmem" :options="form.fi.cpuMem.mems_mb || []" :disable-options="disableMems" :disabled="runningArm" :extra="cpuExtra" />
          </a-form-item>
          <a-form-item :label="$t('compute.text_109')">
            <sku
              v-decorator="decorators.sku"
              :type="type"
              :sku-params="skuParam"
              :sku-filter="skuFilter"
              :require-sys-disk-type="requireSysDiskType"
              :require-data-disk-types="requireDataDiskTypes"
              :instance-type="instanceType"
              :hypervisor="hypervisor"
              :canSkuShow="diskLoaded" />
          </a-form-item>
          <a-form-item :label="$t('compute.text_49')" v-show="selectedItems.length === 1 && form.fd.defaultType">
            <system-disk
              v-if="hypervisor && form.fi.capability.storage_types && form.fd.defaultType"
              :decorator="decorators.systemDisk"
              :type="type"
              :hypervisor="hypervisor"
              :sku="form.fd.sku"
              :form="form"
              :defaultSize="sysdisk.value"
              :defaultType="form.fd.defaultType"
              :capability-data="form.fi.capability"
              :disabled="true"
              :ignoreStorageStatus="true" />
          </a-form-item>
          <a-form-item :label="$t('compute.text_50')" v-show="selectedItems.length === 1">
            <data-disk
              v-if="hypervisor && form.fi.capability.storage_types"
              ref="dataDiskRef"
              :decorator="decorators.dataDisk"
              :type="type"
              :form="form"
              :hypervisor="hypervisor"
              :capability-data="form.fi.capability"
              :defaultType="form.fd.systemDiskType"
              :sku="form.fd.sku"
              :image="form.fi.imageMsg"
              :domain="domain"
              :storageParams="dataDiskStorageParams" />
          </a-form-item>
          <a-form-item :label="$t('compute.text_1041')" v-if="isOpenWorkflow">
            <a-input v-decorator="decorators.reason" :placeholder="$t('compute.text_1105')" />
          </a-form-item>
          <a-form-item :label="$t('compute.text_494')" :extra="$t('compute.text_1106')">
            <a-switch :checkedChildren="$t('compute.text_115')" :unCheckedChildren="$t('compute.text_116')" v-decorator="decorators.autoStart" :disabled="isSomeRunning" />
          </a-form-item>
        </a-form>
      </div>
    </page-body>
    <page-footer>
      <div slot="right">
        <div class="d-flex align-items-center">
          <div v-if="hasMeterService" class="mr-4 d-flex align-items-center">
            <div class="text-truncate">{{$t('compute.text_286')}}</div>
            <div class="ml-2 prices">
              <div class="hour error-color d-flex">
                <template v-if="price">
                  <m-animated-number :value="price" :formatValue="priceFormat" />
                  <discount-price class="ml-2 mini-text" :discount="discount" :origin="originPrice" />
                </template>
                <template v-else>---</template>
              </div>
              <div class="tips text-truncate">
                <span v-html="priceTips" />
              </div>
            </div>
          </div>
          <a-button class="mr-3" type="primary" @click="handleConfirm" :loading="loading">{{confirmText}}</a-button>
          <a-button @click="cancel">{{$t('compute.text_908')}}</a-button>
        </div>
      </div>
    </page-footer>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import * as R from 'ramda'
import _ from 'lodash'
import CpuRadio from '@Compute/sections/CpuRadio'
import MemRadio from '@Compute/sections/MemRadio'
import DataDisk from '@Compute/sections/DataDisk'
import SystemDisk from '@Compute/views/vminstance/create/components/SystemDisk'
import sku from '@Compute/sections/SKU'
import { SERVER_TYPE, BILL_TYPES_MAP, EIP_TYPES_MAP } from '@Compute/constants'
import SystemIcon from '@/sections/SystemIcon'
import { Manager } from '@/utils/manager'
import WindowsMixin from '@/mixins/windows'
import WorkflowMixin from '@/mixins/workflow'
import { HYPERVISORS_MAP } from '@/constants'
import { PriceFetcher } from '@/utils/common/price'
import {
  getNameDescriptionTableColumn,
  getIpsTableColumn,
  getProjectTableColumn,
  getStatusTableColumn,
  getRegionTableColumn,
} from '@/utils/common/tableColumn'
import { findPlatform } from '@/utils/common/hypervisor'
import { isRequired } from '@/utils/validate'
import { sizestr } from '@/utils/utils'
import { STORAGE_TYPES } from '@/constants/compute'
import DiscountPrice from '@/sections/DiscountPrice'

export default {
  name: 'AdjustConfig',
  components: {
    CpuRadio,
    MemRadio,
    sku,
    DataDisk,
    SystemDisk,
    DiscountPrice,
  },
  mixins: [WindowsMixin, WorkflowMixin],
  props: {
    params: {
      type: Object,
    },
  },
  data () {
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
    const itemData = this.params.data[0]
    const autoStart = this.params.data.some(val => val.status === 'running')
    return {
      loading: false,
      action: this.$t('compute.text_1100'),
      form: {
        fc: this.$form.createForm(this, {
          onValuesChange: this.onValuesChange,
        }),
        fd: {
          vcpu: 2,
          vmem: 2048,
          diskType: null,
          dataDiskSizes: {},
          dataDiskTypes: [],
        },
        fi: {
          cpuMem: {}, // cpu 和 内存 的关联关系
          capability: {},
          imageMsg: {}, // 当前选中的 image
        },
      },
      beforeDataDisks: [],
      decorators: {
        vcpu: [
          'vcpu',
          {
            initialValue: itemData.vcpu_count,
          },
        ],
        vmem: [
          'vmem',
          {
            initialValue: itemData.vmem_size,
          },
        ],
        sku: [
          'sku',
          {
            rules: [
              { required: true, message: this.$t('compute.text_216') },
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
        },
        reason: [
          'reason',
          {
            initialValue: '',
          },
        ],
        autoStart: [
          'autoStart',
          {
            valuePropName: 'checked',
            initialValue: autoStart,
          },
        ],
      },
      formItemLayout: {
        wrapperCol: {
          span: 20,
          xxl: {
            span: 22,
          },
        },
        labelCol: {
          span: 4,
          xxl: {
            span: 2,
          },
        },
      },
      diskLoaded: false,
      domain: itemData.domain_id,
      cloudaccountId: itemData.account_id,
      sysdisk: {},
      origin_price: null,
      price: null,
      priceFormat: null,
      currency: '',
      priceTips: '--',
      discount: 0,
      dataDiskType: '',
    }
  },
  computed: {
    ...mapGetters(['isAdminMode', 'scope', 'userInfo']),
    selectedItems () {
      return this.params.data
    },
    selectedItem () {
      return this.params.data[0]
    },
    count () {
      return this.selectedItems.length || 1
    },
    isSomeRunning () {
      return this.params.data.some(val => val.status === 'running')
    },
    isSomeArm () {
      return this.selectedItem.os_arch === 'arm'
    },
    runningArm () {
      return this.isSomeArm && this.isSomeRunning
    },
    hotplug () { // 做热扩容校验，true 表示置灰 CPU 和 内存，不支持热扩容
      if (this.params.data.every(val => val.statue === 'ready')) {
        return false
      } else {
        if (this.params.data.every(val => {
          if ([HYPERVISORS_MAP.kvm.hypervisor, HYPERVISORS_MAP.zstack.hypervisor].includes(val.hypervisor)) {
            if (val.status === 'ready') {
              return true
            } else {
              return val.metadata && val.metadata.hotplug_cpu_mem === 'enable'
            }
          }
          return true
        })) {
          return false
        } else {
          return true
        }
      }
    },
    hypervisor () {
      return this.selectedItem.hypervisor
    },
    tips () {
      if (this.hotplug) {
        return this.$t('compute.text_1107')
      }
      if ([HYPERVISORS_MAP.kvm.hypervisor, HYPERVISORS_MAP.azure.hypervisor].includes(this.hypervisor)) {
        return this.$t('compute.text_1108')
      }
      return ''
    },
    type () {
      const brand = this.selectedItem.brand
      return findPlatform(brand)
    },
    skuParam () {
      const params = {
        limit: 0,
        usable: true,
        enabled: true,
        cpu_core_count: this.form.fd.vcpu || this.decorators.vcpu[1].initialValue,
        memory_size_mb: this.form.fd.vmem,
      }
      if (this.type === SERVER_TYPE.idc) {
        params.provider = HYPERVISORS_MAP.kvm.provider
        params.public_cloud = false
        params.postpaid_status = 'available'
        if (this.selectedItem) {
          params.cloudregion = this.selectedItem.cloudregion_id
        }
      }
      if (this.type === SERVER_TYPE.private) {
        // nutanix vmware
        if (this.selectedItem && this.selectedItem.provider === HYPERVISORS_MAP.nutanix.provider) {
          params['provider.0'] = HYPERVISORS_MAP.kvm.provider
        } else {
          params.cloudregion_id = this.selectedItem.cloudregion_id
        }
        params.postpaid_status = 'available'
      }
      if (this.type === SERVER_TYPE.public) {
        params.public_cloud = true
        params.zone_id = this.selectedItem.zone_id
        if (this.selectedItem.billing_type === 'postpaid') {
          params.postpaid_status = 'available'
        } else if (this.selectedItem.billing_type === 'prepaid') {
          params.prepaid_status = 'available'
        }
      }
      return params
    },
    disableCpus () {
      const cpu = this.selectedItem.vcpu_count
      const cpus = this.form.fi.cpuMem.cpus || []
      if (this.isSomeRunning && cpus.length > 0) {
        return cpus.filter((item) => { return item < cpu })
      }
      return []
    },
    disableMems () {
      const vmem = this.selectedItem.vmem_size
      const mems = this.form.fi.cpuMem.mems_mb || []
      if (this.isSomeRunning && mems.length > 0) {
        return mems.filter((item) => { return item < vmem })
      }
      return []
    },
    isOpenWorkflow () {
      return this.checkWorkflowEnabled(this.WORKFLOW_TYPES.APPLY_SERVER_CHANGECONFIG)
    },
    columns () {
      return [
        getNameDescriptionTableColumn({
          hideField: true,
          addLock: true,
          addBackup: true,
          edit: false,
          editDesc: false,
          slotCallback: row => {
            return (
              <side-page-trigger>{ row.name }</side-page-trigger>
            )
          },
        }),
        getIpsTableColumn({ field: 'ip', title: 'IP' }),
        {
          field: 'instance_type',
          title: this.$t('compute.text_295'),
          showOverflow: 'ellipsis',
          minWidth: 120,
          sortable: true,
          slots: {
            default: ({ row }) => {
              const ret = []
              if (row.instance_type) {
                ret.push(<div class='text-truncate' style={{ color: '#0A1F44' }}>{ row.instance_type }</div>)
              }
              const config = row.vcpu_count + 'C' + sizestr(row.vmem_size, 'M', 1024) + (row.disk ? sizestr(row.disk, 'M', 1024) : '')
              return ret.concat(<div class='text-truncate' style={{ color: '#53627C' }}>{ config }</div>)
            },
          },
        },
        {
          field: 'os_type',
          title: this.$t('table.title.os'),
          width: 50,
          slots: {
            default: ({ row }) => {
              let name = (row.metadata && row.metadata.os_distribution) ? row.metadata.os_distribution : row.os_type || ''
              if (name.includes('Windows') || name.includes('windows')) {
                name = 'Windows'
              }
              const version = (row.metadata && row.metadata.os_version) ? `${row.metadata.os_version}` : ''
              const tooltip = (version.includes(name) ? version : `${name} ${version}`) || this.$t('compute.text_339') // 去重
              return [
                <SystemIcon tooltip={ tooltip } name={ name } />,
              ]
            },
          },
        },
        getStatusTableColumn({ statusModule: 'server' }),
        getProjectTableColumn(),
        getRegionTableColumn(),
      ]
    },
    instanceType () {
      return this.selectedItem.instance_type
    },
    hasMeterService () { // 是否有计费的服务
      const { services } = this.$store.getters.userInfo
      const meterService = services.find(val => val.type === 'meter')
      if (meterService && meterService.status === true) {
        return true
      }
      return false
    },
    // 是否为包年包月
    isPackage () {
      return this.form.fd.billType === BILL_TYPES_MAP.package.key
    },
    durationNum () {
      if (this.isPackage) {
        const { duration } = this.form.fd
        let num = parseInt(duration)
        if (num && duration.endsWith('Y')) {
          num *= 12 // 1年=12月
        } else if (num && duration.endsWith('W')) {
          num *= 0.25 // 1周=0.25月
        }
        return num
      }
      return 0
    },
    disk () {
      const diskValueArr = [this.form.fd.systemDiskSize]
      R.forEachObjIndexed(value => {
        diskValueArr.push(value)
      }, this.form.fd.dataDiskSizes)
      return diskValueArr.reduce((prevDisk, diskValue) => prevDisk + diskValue, 0)
    },
    confirmText () {
      return this.isOpenWorkflow ? this.$t('compute.text_288') : this.$t('compute.text_907')
    },
    cpuExtra () {
      if (this.runningArm) {
        return this.$t('compute.text_1366')
      }
      return null
    },
    memExtra () {
      if (this.runningArm) {
        return this.$t('compute.text_1367')
      }
      return null
    },
    isPublic () {
      return this.params.data[0].cloud_env === SERVER_TYPE.public
    },
    originPrice () {
      if (this.origin_price) {
        this.$emit('getOriginPrice', this.origin_price)
      }
      return this.origin_price
    },
    requireSysDiskType () {
      if (this.sysdisk && this.sysdisk.type) {
        return [this.sysdisk.type]
      }
      return []
    },
    requireDataDiskTypes () {
      const types = []
      if (this.form && this.form.fd && this.form.fd.datadisks) {
        for (let i = 0; i < this.form.fd.datadisks.length; i++) {
          if (this.form.fd.datadisks[i].type && !types.includes(this.form.fd.datadisks[i].type)) {
            types.push(this.form.fd.datadisks[i].type)
          }
        }
      }
      return types
    },
    needLocalMedium () {
      return (this.selectedItem.hypervisor === HYPERVISORS_MAP.kvm.hypervisor || this.selectedItem.hypervisor === HYPERVISORS_MAP.cloudpods.hypervisor)
    },
    dataDiskStorageParams () {
      const systemDiskType = _.get(this.form.fd, 'systemDiskType.key')
      const { prefer_manager, schedtag, prefer_host } = this.form.fd
      const params = {
        ...this.scopeParams,
        usable: true, // 包含了 enable:true, status为online的数据
        brand: HYPERVISORS_MAP.esxi.brand, // 这里暂时写死，因为目前只是有vmware的系统盘会指定存储
        manager: prefer_manager,
        host_schedtag_id: schedtag,
      }
      if (systemDiskType) {
        params.filter = [`storage_type.contains("${systemDiskType}")`]
      }
      if (prefer_host) {
        params.host_id = prefer_host
      }
      return params
    },
  },
  created () {
    this.serversManager = new Manager('servers', 'v2')
    this.zonesM2 = new Manager('zones', 'v2')
    this.serverskusM = new Manager('serverskus')
    this.loadData(this.params.data)
    this.fetchInstanceSpecs()
    this.getPriceList = _.debounce(this._getPriceList2, 500)
    this.baywatch([
      'form.fd.sku.id',
      'form.fd.dataDiskSizes',
    ], (val) => {
      if (val) {
        this.getPriceList()
      }
    })
  },
  methods: {
    skuFilter (items) {
      if (!items) return []
      let os_arch = R.path(['metadata', 'sys:os_arch'], this.selectedItem)
      return items.filter(item => {
        if (os_arch) {
          os_arch = os_arch.toLowerCase()
          if (os_arch === 'aarch64') {
            return item.cpu_arch === 'aarch64'
          } else if (os_arch.indexOf('x86') >= 0) {
            return item.cpu_arch && item.cpu_arch.indexOf('x86') >= 0
          }
        }
        return true
      })
    },
    async loadData (data) {
      this.data = data
      if (this.data.length > 0) {
        try {
          const { data } = await this.capability(this.data[0].zone_id)
          this.form.fi.capability = data
        } catch (error) {}
      }
      const conf = this.maxConfig()
      this.form.fd.vcpu_count = conf[0]
      this.form.fd.vmem = Math.ceil(conf[1]) * 1024
      this.form.fd.datadisks = conf[2]
      this.form.fd.sysdisks = conf[3]
      this.beforeDataDisks = [...this.form.fd.datadisks]
      if (this.form.fd.sysdisks && this.form.fd.sysdisks.length === 1) {
        this.sysdisk = this.form.fd.sysdisks[0]
        const storageItem = STORAGE_TYPES[this.selectedItem.hypervisor]
        // 针对kvm-local盘特殊处理
        let diskKey = this.sysdisk.type
        const { disk_type, medium_type } = this.selectedItem.disks_info[0] || {}
        if ((this.selectedItem.hypervisor === HYPERVISORS_MAP.kvm.hypervisor || this.selectedItem.hypervisor === HYPERVISORS_MAP.cloudpods.hypervisor) && diskKey === 'local' && disk_type === 'sys' && medium_type && this.isSomeLocal()) {
          diskKey = `${diskKey}-${medium_type}`
        }
        this.form.fd.defaultType = {
          [this.decorators.systemDisk.type[0]]: { key: diskKey, label: R.is(Object, storageItem) ? (_.get(storageItem, '[diskKey].key') || diskKey) : diskKey },
        }
      }
      const { medium_type: dataDiskMedium } = this.selectedItem.disks_info[1] || {}
      this.$nextTick(() => {
        setTimeout(() => {
          this.form.fd.datadisks.forEach((v, i) => {
            this.$refs.dataDiskRef.add({ size: v.value, min: v.value, diskType: v.type, disabled: true, sizeDisabled: true, medium: dataDiskMedium, ...v })
          })
          this.diskLoaded = true
        }, 1000)
        this.form.fc.setFieldsValue({ vcpu: this.form.fd.vcpu_count, vmem: this.form.fd.vmem })
      })
    },
    maxConfig () {
      let cpu = 0
      let mem = 0
      const datadisks = []
      const sysdisks = []
      for (let i = 0; i < this.data.length; i++) {
        if (cpu < this.data[i].vcpu_count) {
          cpu = this.data[i].vcpu_count
        }
        if (mem < this.data[i].vmem_size) {
          mem = this.data[i].vmem_size
        }
        if (this.data[i].disks_info) {
          this.data[i].disks_info.forEach((item) => {
            if (item.disk_type !== 'sys') { // 数据盘
              datadisks.push({ value: item.size / 1024, type: item.storage_type })
            } else { // 系统盘
              sysdisks.push({ value: item.size / 1024, type: item.storage_type })
            }
          })
        }
      }
      return [cpu, mem / 1024, datadisks, sysdisks]
    },
    async doChangeSettingsByWorkflowSubmit (values) {
      const params = {
        sku: values.sku.name,
        auto_start: values.autoStart,
      }
      const ids = this.params.data.map(item => item.id)
      params.disks = this.genDiskData(values)
      const datadisks = this.form.fc.getFieldValue('dataDiskSizes')
      let diskSize = 0
      if (datadisks) {
        R.forEachObjIndexed((value, key) => {
          diskSize += value
        }, datadisks)
      }
      const beforeDataDisks = this.beforeDataDisks.map((item) => { return item.value })
      let beforeDiskSize = 0
      if (beforeDataDisks && beforeDataDisks.length > 0) {
        beforeDiskSize = beforeDataDisks.reduce((sum, size) => { return sum + size })
      }
      const serverConf = this.selectedItems.map((item) => {
        return {
          name: item.name,
          project: item.tenant,
          before: {
            cpu: item.vcpu_count,
            memory: item.vmem_size,
            disk: item.disk,
          },
          after: {
            cpu: this.form.fd.vcpu,
            memory: this.form.fd.vmem,
            disk: +item.disk + (+diskSize - beforeDiskSize) * 1024,
          },
        }
      })
      params.project_id = this.userInfo.projectId
      params.domain = this.userInfo.projectDomainId
      const variables = {
        project: this.params.data[0].tenant_id,
        project_domain: this.params.data[0].domain_id,
        process_definition_key: this.WORKFLOW_TYPES.APPLY_SERVER_CHANGECONFIG,
        initiator: this.userInfo.id,
        paramter: JSON.stringify(params),
        ids: ids.join(','),
        serverConf: JSON.stringify(serverConf),
        description: values.reason,
      }
      await this.createWorkflow(variables)
      this.$message.success(this.$t('compute.text_1109'))
      this.$router.push('/workflow')
    },
    async doChangeSettingsSubmit (values) {
      const params = {
        sku: values.sku.name,
        auto_start: values.autoStart,
      }
      const ids = this.params.data.map(item => item.id)
      if (ids.length === 1) {
        params.disks = this.genDiskData(values)
      }
      return this.serversManager.batchPerformAction({
        ids,
        steadyStatus: ['running', 'ready'],
        action: 'change-config',
        data: params,
      })
    },
    async handleConfirm () {
      this.loading = true
      try {
        const values = await this.form.fc.validateFields()
        if (this.isOpenWorkflow) {
          const projects = new Set(this.params.data.map(item => item.tenant_id))
          if (projects.size > 1) {
            this.$message.error(this.$t('compute.text_1348'))
            this.loading = false
            return
          }
          await this.doChangeSettingsByWorkflowSubmit(values)
        } else {
          const res = await this.doChangeSettingsSubmit(values)
          const isOk = res.data.data.every(item => item.status === 200)
          if (isOk) {
            this.$message.success(this.$t('compute.text_423'))
            this.cancel()
          }
        }
      } catch (error) {
        throw error
      } finally {
        this.loading = false
      }
    },
    cpuChange (cpu) {
      if (cpu) {
        if (R.is(Object, this.form.fi.cpuMem)) {
          const memOpts = _.get(this.form.fi, `cpuMem.cpu_mems_mb[${cpu}]`) || []
          this.form.fi.cpuMem.mems_mb = memOpts
          this.form.fc.setFieldsValue({
            vmem: Math.max(this.selectedItem.vmem_size, memOpts[0]),
          })
        }
      }
    },
    fetchInstanceSpecs () {
      const params = {
        usable: true,
        zone: this.selectedItem.zone_id,
        provider: this.selectedItem.provider === HYPERVISORS_MAP.esxi.provider ? HYPERVISORS_MAP.kvm.provider : this.selectedItem.provider,
      }
      if (this.type === SERVER_TYPE.private) {
        if (this.selectedItem && this.selectedItem.provider === HYPERVISORS_MAP.hcso.provider) {
          params.cloudregion_id = this.selectedItem.cloudregion_id
        } else {
          params.provider = HYPERVISORS_MAP.kvm.provider
        }

        delete params.zone
      }
      if (this.type === SERVER_TYPE.public) {
        if (this.selectedItem.billing_type === 'postpaid') {
          params.postpaid_status = 'available'
        } else if (this.selectedItem.billing_type === 'prepaid') {
          params.prepaid_status = 'available'
        }
      }
      this.serverskusM.get({ id: 'instance-specs', params })
        .then(({ data }) => {
          this.form.fi.cpuMem = data
          const vcpuDecorator = this.decorators.vcpu
          const vcpuInit = vcpuDecorator[1].initialValue
          this.cpuChange(vcpuInit)
        })
    },
    onValuesChange (props, values) {
      Object.keys(values).forEach((key) => {
        let value = values[key]
        if (key === 'dataDiskSizes' && R.is(Object, values[key]) && R.is(Object, this.form.fd.dataDiskSizes)) {
          value = { ...this.form.fd.dataDiskSizes, ...values[key] }
        }
        this.$set(this.form.fd, key, value)
        if (~key.indexOf('dataDiskTypes') && R.is(Object, values)) {
          this.dataDiskType = values[key].key
        }
        if (~key.indexOf('dataDiskSizes[')) {
          const uid = key.replace(/dataDiskSizes\[(.+)\]/, '$1')
          this.$set(this.form.fd.dataDiskSizes, uid, values[key])
        }
      })
    },
    async capability (v) { // 可用区查询
      const params = {
        show_emulated: true,
      }
      if (this.isAdminMode) {
        params.project_domain = this.selectedItem.domain_id
      }
      return this.zonesM2.get({ id: `${v}/capability`, params })
    },
    genDiskData (values) {
      const dataDisk = []
      let index = 0
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
            // 针对kvm-local盘特殊处理
            let diskKey = values.dataDiskTypes[key].key
            if (diskKey.indexOf('local') !== -1 && this.needLocalMedium) {
              diskKey = diskKey.split('-')[0]
            }
            diskObj.backend = diskKey
          } else {
            if (_.get(dataDisks, '[0].diskType.key')) {
              // 针对kvm-local盘特殊处理
              let diskKey = _.get(dataDisks, '[0].diskType.key') // 默认添加的盘和第一块保持一致
              if (diskKey.indexOf('local') !== -1 && this.needLocalMedium) {
                diskKey = diskKey.split('-')[0]
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
        // 磁盘介质
        if (values.dataDiskTypes && values.dataDiskTypes[key]) {
          const { key: dataDiskKey = '' } = values.dataDiskTypes[key] || {}
          if (this.needLocalMedium && dataDiskKey.split('-')[1]) {
            diskObj.medium = dataDiskKey.split('-')[1]
          }
        }
        dataDisk.push(diskObj)
      }, values.dataDiskSizes)
      if (this.selectedItems.length === 1 && _.get(this.params, 'data[0].disks_info[0].disk_type') === 'data') {
        dataDisk.shift() // 因为第一块盘的disk_type是data，说明无系统盘，第一块盘是ISO启动的，需要去掉
      }
      return dataDisk
    },
    cancel () {
      this.$router.push({ name: 'VMInstance' })
    },
    baywatch (props, watcher) {
      const iterator = function (prop) {
        this.$watch(prop, watcher)
      }
      props.forEach(iterator, this)
    },
    // // 获取总价格
    // async _getPriceList () {
    //   if (!this.hasMeterService) return // 如果没有 meter 服务则取消调用
    //   if (R.isEmpty(this.form.fd.sku) || R.isNil(this.form.fd.sku)) return
    //   let skuProvider = this.form.fd.sku.provider || PROVIDER_MAP.OneCloud.key
    //   const brand = PROVIDER_MAP[skuProvider].brand
    //   const params = {
    //     scope: this.$store.getters.scope,
    //     quantity: this.count,
    //     brand,
    //   }
    //   if (this.isPublic) {
    //     if (this.form.fd.sku && this.form.fd.sku.cloud_env) {
    //       params.brand = this.form.fd.sku.cloud_env
    //       skuProvider = this.form.fd.sku.cloud_env
    //     }
    //   }
    //   const { systemDiskSize = 0, systemDiskType = {}, sysdisks = [] } = this.form.fd
    //   if (this.params.data[0].cloud_env !== SERVER_TYPE.public) {
    //     let diskSize = this.disk || 0
    //     if (!this.disk && sysdisks) {
    //       diskSize = sysdisks.reduce((sum, disk) => { return sum + disk.value }, 0) / this.count
    //     }
    //     params.spec = `cpu=${this.form.fd.vcpu}core;mem=${sizestrWithUnit(this.form.fd.vmem, 'M', 1024)};disk=${diskSize}GB`
    //   } else {
    //     const { sku } = this.form.fd
    //     const { region_ext_id: regionExtId, name, zone_ext_id: zoneExtId } = sku
    //     const image = this.form.fi.imageMsg || {}
    //     const osType = image.os_type ? image.os_type.toLowerCase() : ''
    //     params.region_id = regionExtId
    //     let provider = skuProvider.toLowerCase()
    //     if (provider === HYPERVISORS_MAP.ucloud.key || provider === HYPERVISORS_MAP.azure.key) {
    //       if (provider === HYPERVISORS_MAP.azure.key) {
    //         const cloud_env = this.form.fd.sku.cloud_env
    //         params.brand = cloud_env
    //         provider = cloud_env
    //       }
    //       params.price_key = `${provider}::${regionExtId}::::instance::`
    //       if (sku.name) {
    //         params.price_key += `${sku.name}`
    //       }
    //     } else {
    //       params.price_key = `${regionExtId}::${name}::${osType}::${zoneExtId}`
    //     }
    //     // spec
    //     params.spec = `${systemDiskSize}:${systemDiskType.key}`
    //     if (provider === HYPERVISORS_MAP.ucloud.key || provider === HYPERVISORS_MAP.azure.key) {
    //       params.spec = `${systemDiskSize}:${provider}::${regionExtId}::::disk::${systemDiskType.key}`
    //     }
    //     const dataDiskSpec = []
    //     const isUcloudAzure = (provider === HYPERVISORS_MAP.ucloud.key || provider === HYPERVISORS_MAP.azure.key)
    //     R.forEach((value) => {
    //       if (isUcloudAzure) {
    //         dataDiskSpec.push(`${value}:${provider}::${regionExtId}::::disk::${this.dataDiskType}`)
    //       } else {
    //         dataDiskSpec.push(`${value}:${this.dataDiskType}`)
    //       }
    //     }, Object.values(this.form.fd.dataDiskSizes))
    //     if (dataDiskSpec && dataDiskSpec.length > 0) {
    //       params.spec += `;${dataDiskSpec.join(';')}`
    //     }
    //     if (this.form.fd.billType === BILL_TYPES_MAP.package.key) {
    //       params.period = this.form.fd.duration
    //     }
    //     params.version = 'v2'
    //     if (R.isNil(params.region_id) || R.isEmpty(params.region_id)) return
    //   }
    //   const { data: { data = [] } } = await new this.$Manager('price_infos', 'v1').get({ id: '', params })
    //   this.pricesList = data
    // },
    async _getPriceList2 () {
      const f = this.form.fd
      if (!this.hasMeterService) return // 如果没有 meter 服务则取消调用
      if (R.isEmpty(f.sku) || R.isNil(f.sku)) return
      const isPublic = this.params.data[0].cloud_env === SERVER_TYPE.public
      if (isPublic && (R.isNil(f.sku.region_ext_id) || R.isEmpty(f.sku.region_ext_id))) return
      if (R.isNil(f.systemDiskSize)) return

      const pf = new PriceFetcher()
      pf.initialForm(this.$store.getters.scope, f.sku, f.duration, f.billType, this.isPublic, this.cloudaccountId)
      // add price items
      if (!isPublic) {
        // server instance
        pf.addCpu(f.vcpu)
        pf.addMem(f.vmem / 1024)

        // gpu
        if (f.gpuEnable && f.gpu && f.gpu.indexOf('=') >= 0) {
          const tmps = f.gpu.split('=')[1].split(':')
          if (tmps.length >= 2) {
            pf.addGpu(`${tmps[0]}.${tmps[1]}`, f.gpuCount || 0)
          }
        }
      } else {
        // server instance
        pf.addServer(f.sku.name, 1)
        // others
      }

      // disks
      const { systemDiskSize, systemDiskType } = f
      const { systemDiskMedium, dataDiskMedium } = this.form.fi
      let systemDisk = systemDiskType.key
      if (!isPublic) systemDisk = `${systemDiskMedium}::${systemDiskType.key}`
      pf.addDisk(systemDisk, systemDiskSize)
      if (this.dataDiskType) {
        const datadisks = Object.values(this.form.fd.dataDiskSizes || {})
        let dataDisk = this.dataDiskType
        if (!isPublic) dataDisk = `${dataDiskMedium}::${this.dataDiskType}`
        pf.addDisks(dataDisk, datadisks)
      }

      // eip
      if (f.eip_bw && f.eip_type === EIP_TYPES_MAP.new.key) {
        pf.addEipBandwidth(f.eip_bgp_type || '', f.eip_bw)
      }

      const price = await pf.getPriceObj()
      price.setOptions({ count: this.count || 0 })
      this.currency = price.currency
      this.price = price.price
      this.priceFormat = price.priceFormat
      this.origin_price = price.originPrice
      this.priceTips = price.priceTips
      this.discount = price.discount
    },
    isSomeLocal () {
      const { capability = {} } = this.form.fi
      const { storage_types2 = {} } = capability
      const types = storage_types2[this.hypervisor] || []
      const localTypes = types.filter(item => item.indexOf('local') !== -1)
      return localTypes.length > 1
    },
  },
}
</script>

<style lang="less" scoped>
.form-wrapper {
  padding-left: 22px;
}
.prices {
  .hour {
    font-size: 24px;
  }
  .tips {
    color: #999;
    font-size: 12px;
  }
}
</style>
