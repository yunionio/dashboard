<template>
  <div>
    <page-header :title="title" style="margin-bottom: 7px;" />
    <a-alert class="mb-2" type="warning" v-if="tips">
      <div slot="message">
        {{ tips }}
      </div>
    </a-alert>
    <a-card :bordered="false" size="small">
      <template #title>
        <dialog-selected-tips :name="$t('dictionary.server')" :count="dataList.length" :action="$t('compute.text_1100')" />
      </template>
      <dialog-table :data="dataList" :columns="columns" />
    </a-card>
    <page-body needMarginBottom>
      <div class="form-wrapper">
        <a-form
          v-bind="formItemLayout"
          :form="form.fc">
          <a-form-item v-if="isShowCpu" :label="$t('compute.text_1058')" class="mb-0">
            <cpu-radio
              :decorator="decorators.vcpu"
              :options="form.fi.cpuMem.cpus || []"
              :disable-options="disableCpus"
              :disabled="runningArm || runningOther"
              :extra="cpuExtra"
              :max="form.fd.vcpu < 32 ? 32 : 128"
              :form="form"
              :hypervisor="hypervisor"
              :showCpuSocketsInit="form.fi.showCpuSockets"
              :cpuSocketsInit="selectedItem.vcpu_count / selectedItem.cpu_sockets"
              :serverStatus="selectedItem.status"
              @change="cpuChange" />
          </a-form-item>
          <a-form-item :label="$t('compute.text_369')" class="mb-0">
            <mem-radio :decorator="decorators.vmem" :options="form.fi.cpuMem.mems_mb || []" :disable-options="disableMems" :disabled="runningArm || runningOther" :extra="cpuExtra" />
          </a-form-item>
          <a-form-item :label="$t('compute.text_109')">
            <sku
              v-decorator="decorators.sku"
              :type="type"
              :priceUnit="skuPriceUnit"
              :sku-params="skuParam"
              :sku-filter="skuFilter"
              :require-sys-disk-type="requireSysDiskType"
              :require-data-disk-types="requireDataDiskTypes"
              :instance-type="instanceType"
              :hypervisor="hypervisor"
              :canSkuShow="diskLoaded"
              :hasMeterService="hasMeterService"
              :skuDisabled="runningOther"
              :dataSku="dataSku"
              :dataList="dataList"
              isAdjustConfig />
          </a-form-item>
          <a-form-item :label="$t('compute.text_49')" v-show="selectedItems.length === 1 && form.fd.defaultType">
            <system-disk
              v-if="isRenderSystemDisk"
              :decorator="decorators.systemDisk"
              :type="type"
              :hypervisor="hypervisor"
              :sku="form.fd.sku"
              :form="form"
              :defaultSize="sysdisk.value"
              :defaultType="form.fd.defaultType"
              :defaultIops="sysdisk.iops"
              :defaultThroughput="sysdisk.throughput"
              :capability-data="form.fi.capability"
              :disabled="true"
              :ignoreStorageStatus="true"
              is-iops-show
              is-throughput-show />
          </a-form-item>
          <a-form-item :label="$t('compute.text_50')" v-show="selectedItems.length === 1 && selectedItems[0].hypervisor !== 'zettakit'">
            <data-disk
              v-if="isRenderDataDisk"
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
              :storageParams="dataDiskStorageParams"
              is-iops-show
              is-throughput-show />
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
import { SERVER_TYPE, EIP_TYPES_MAP, MEDIUM_MAP } from '@Compute/constants'
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
import { findPlatform, diskSupportTypeMedium, getOriginDiskKey } from '@/utils/common/hypervisor'
import { isRequired } from '@/utils/validate'
import { sizestr } from '@/utils/utils'
import { STORAGE_TYPES, HOST_CPU_ARCHS } from '@/constants/compute'
import DiscountPrice from '@/sections/DiscountPrice'

export default {
  name: 'VMInstanceAdjustConfig',
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
    const dataList = [...this.params.data]
    dataList.sort((a, b) => b.vcpu_count - a.vcpu_count)
    const itemData = dataList[0]
    const autoStart = dataList.some(val => val.status === 'running')
    return {
      loading: false,
      action: this.$t('compute.text_1100'),
      dataList,
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
          hypervisor: itemData.hypervisor,
        },
        fi: {
          cpuMem: {}, // cpu 和 内存 的关联关系
          capability: {},
          imageMsg: {}, // 当前选中的 image
          showCpuSockets: false,
          cpuSockets: 1,
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
          iops: [
            'systemDiskIops',
            {
              rules: [{
                required: true,
                message: this.$t('compute.iops_input_tip'),
              }],
            },
          ],
          throughput: [
            'systemDiskThroughput',
            {
              rules: [{
                required: true,
                message: this.$t('compute.throuthput_input_tip'),
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
          iops: i => [
            `dataDiskIops[${i}]`,
            {
              rules: [{
                required: true,
                message: this.$t('compute.iops_input_tip'),
              }],
            },
          ],
          throughput: i => [
            `dataDiskThroughputs[${i}]`,
            {
              rules: [{
                required: true,
                message: this.$t('compute.throughput_input_tip'),
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
      dataDiskInterval: null,
    }
  },
  computed: {
    ...mapGetters(['isAdminMode', 'scope', 'userInfo']),
    title () {
      return this.isOpenWorkflow ? `${this.$t('compute.text_1100')} ${this.$route.query.workflow ? `(${this.$t('common.modify_workflow')})` : ''}` : this.$t('compute.text_1100')
    },
    scopeParams () {
      if (this.$store.getters.isAdminMode) {
        return {
          project_domain: this.dataList[0].domain_id,
        }
      }
      return { scope: this.$store.getters.scope }
    },
    selectedItems () {
      return this.dataList
    },
    selectedItem () {
      return this.dataList[0]
    },
    dataSku () {
      const target = (this.selectedItem.disksInfo || []).filter(item => item.disk_type === 'sys')
      return {
        name: this.selectedItem?.instance_type,
        sys_disk_type: target.length ? target[0].storage_type : '',
      }
    },
    count () {
      return this.selectedItems.length || 1
    },
    isSomeRunning () {
      return this.dataList.some(val => val.status === 'running')
    },
    isSomeArm () {
      return this.selectedItem.os_arch === 'arm'
    },
    runningArm () {
      return this.isSomeArm && this.isSomeRunning
    },
    runningOther () {
      return this.dataList.some(val => {
        if (val.status === 'running' && [HYPERVISORS_MAP.aliyun.hypervisor, HYPERVISORS_MAP.aws.hypervisor, HYPERVISORS_MAP.google.hypervisor, HYPERVISORS_MAP.huawei.hypervisor, HYPERVISORS_MAP.ctyun.hypervisor, HYPERVISORS_MAP.volcengine.hypervisor, HYPERVISORS_MAP.ksyun.hypervisor].includes(val.hypervisor)) {
          return true
        }
        return false
      })
    },
    hotplug () { // 做热扩容校验，true 表示置灰 CPU 和 内存，不支持热扩容
      if (this.dataList.every(val => val.status === 'ready')) {
        return false
      } else {
        if (this.dataList.every(val => {
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
        memory_size_mb: this.form.fd.vmem || this.decorators.vmem[1].initialValue,
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
        // nutanix vmware incloudshpere proxmox sangfor
        if (this.selectedItem && (this.selectedItem.provider === HYPERVISORS_MAP.nutanix.provider || this.selectedItem.provider === HYPERVISORS_MAP.incloudsphere.provider || this.selectedItem.provider === HYPERVISORS_MAP.proxmox.provider || this.selectedItem.provider === HYPERVISORS_MAP.sangfor.provider || this.selectedItem.provider === HYPERVISORS_MAP.uis.provider)) {
          params['provider.0'] = HYPERVISORS_MAP.kvm.provider
        } else if (this.selectedItem.provider === HYPERVISORS_MAP.cnware.provider) {
          params.usable = false
        } else {
          params.cloudregion_id = this.selectedItem.cloudregion_id
        }
        params.postpaid_status = 'available'
        if (this.selectedItem.provider === HYPERVISORS_MAP.sangfor.provider) {
          delete params.usable
        }
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
      if (this.selectedItem.os_arch) {
        if (this.selectedItem.os_arch.includes('x86')) {
          params.cpu_arch = HOST_CPU_ARCHS.x86.key
        } else if (this.selectedItem.os_arch.includes('arm') || this.selectedItem.os_arch.includes('aarch64')) {
          params.cpu_arch = HOST_CPU_ARCHS.arm.key
        }
      }
      return params
    },
    disableCpus () {
      const runningList = this.dataList.filter(item => item.status === 'running')
      const cpu = runningList.length ? runningList[0].vcpu_count : this.selectedItem.vcpu_count
      const cpus = this.form.fi.cpuMem.cpus || []
      if (this.isSomeRunning && cpus.length > 0) {
        return cpus.filter((item) => { return item < cpu })
      }
      return []
    },
    disableMems () {
      const runningList = this.dataList.filter(item => item.status === 'running')
      runningList.sort((a, b) => b.vmem_size - a.vmem_size)
      const vmem = runningList.length ? runningList[0].vmem_size : this.selectedItem.vmem_size
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
      return this.selectedItem.billing_type === 'prepaid'
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
      return this.isOpenWorkflow ? (this.$route.query.workflow ? this.$t('common.modify_workflow') : this.$t('compute.text_288')) : this.$t('compute.text_907')
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
      return this.dataList[0].cloud_env === SERVER_TYPE.public
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
    dataDiskStorageParams () {
      const { systemDiskType = {}, hypervisor } = this.form.fd
      let key = systemDiskType.key || ''
      // 磁盘区分介质
      if (diskSupportTypeMedium(hypervisor)) {
        key = getOriginDiskKey(key)
      }
      const { prefer_manager, schedtag } = this.form.fd
      const params = {
        ...this.scopeParams,
        usable: true, // 包含了 enable:true, status为online的数据
        brand: this.selectedItem.brand, // kvm,vmware支持指定存储
        manager: prefer_manager,
        host_schedtag_id: schedtag,
        host_id: this.dataList[0].host_id,
      }
      if (key) {
        params.filter = [`storage_type.contains("${key}")`]
      }
      return params
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
    isRenderSystemDisk () {
      return this.hypervisor && this.form.fi.capability.storage_types3 && this.form.fd.defaultType
    },
    isRenderDataDisk () {
      if (this.hypervisor === HYPERVISORS_MAP.cnware.key) {
        return false
      }
      return this.hypervisor && this.form.fi.capability.storage_types3 && this.form.fd.sku
    },
    isShowCpu () {
      return (this.form.fi.cpuMem?.cpus || []).includes(this.form.fd.vcpu)
    },
    isShowMem () {
      return (this.form.fi.cpuMem?.cpus || []).includes(this.form.fd.vcpu) && ((this.form.fi.cpuMem?.cpu_mems_mb && this.form.fi.cpuMem?.cpu_mems_mb[this.form.fd.vcpu]) || []).includes(this.form.fd.vmem)
    },
  },
  watch: {
    priceTips: {
      handler (val) {
        let ret = `${this.currency} ${this.price && this.price.toFixed(2)}`
        ret += !this.isPackage ? this.$t('compute.text_296') : ''
        this.$bus.$emit('VMGetPrice', `${ret} ${val}`)
      },
      immediate: true,
    },
    dataDiskType (val, oldV) {
      if (val !== oldV) {
        this.getPriceList()
      }
    },
  },
  created () {
    this.serversManager = new Manager('servers', 'v2')
    this.zonesM2 = new Manager('zones', 'v2')
    this.serverskusM = new Manager('serverskus')
    this.loadData(this.dataList)
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
  beforeDestroy () {
    clearInterval(this.dataDiskInterval)
  },
  methods: {
    skuFilter (items) {
      if (!items) return []
      return items
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
      this.form.fd.vmem = conf[1] * 1024
      this.form.fd.datadisks = conf[2]
      this.form.fd.sysdisks = conf[3]
      this.beforeDataDisks = [...this.form.fd.datadisks]
      if (this.form.fd.sysdisks && this.form.fd.sysdisks.length === 1) {
        this.sysdisk = this.form.fd.sysdisks[0]
        const storageItem = STORAGE_TYPES[this.selectedItem.hypervisor]
        // 磁盘区分介质
        let diskKey = this.sysdisk.type
        let diskLabel = R.is(Object, storageItem) ? (storageItem[diskKey]?.label || diskKey) : diskKey
        const { disk_type, medium_type } = this.selectedItem.disks_info[0] || {}

        if (diskSupportTypeMedium(this.selectedItem.hypervisor) && disk_type === 'sys' && medium_type) {
          diskLabel = `${diskLabel}(${MEDIUM_MAP[medium_type]})`
          diskKey = `${diskKey}/${medium_type}`
        }
        this.form.fd.defaultType = {
          [this.decorators.systemDisk.type[0]]: { key: diskKey, label: diskLabel },
        }
      }

      const dataDisks = this.selectedItem.disks_info.filter(item => item.disk_type === 'data' || item.disk_type === 'swap')
      const { medium_type: dataDiskMedium } = dataDisks[0] || {}
      if ([HYPERVISORS_MAP.esxi.key].includes(this.hypervisor)) {
        if (this.selectedItem.cpu_sockets) {
          this.form.fi.showCpuSockets = true
          this.form.fi.cpuSockets = this.selectedItem.cpu_sockets
        }
      }
      this.$nextTick(() => {
        this.diskLoaded = true
        this.form.fc.setFieldsValue({ vcpu: this.form.fd.vcpu_count, vmem: this.form.fd.vmem })

        this.dataDiskInterval = setInterval(() => {
          if (this.isRenderDataDisk) {
            this.form.fd.datadisks.forEach((v, i) => {
              this.$refs.dataDiskRef.add({ size: v.value, min: v.value, diskType: v.type, disabled: true, sizeDisabled: true, medium: dataDiskMedium, ...v })
            })
            clearInterval(this.dataDiskInterval)
            this.dataDiskInterval = null
          }
        }, 500)
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
              datadisks.push({ value: item.size / 1024, type: item.storage_type, medium_type: item.medium_type, iops: item.iops, throughput: item.throughput })
            } else { // 系统盘
              sysdisks.push({ value: item.size / 1024, type: item.storage_type, medium_type: item.medium_type, iops: item.iops, throughput: item.throughput })
            }
          })
        }
      }
      return [cpu, mem / 1024, datadisks, sysdisks]
    },
    async doChangeSettingsByWorkflowSubmit (values) {
      const params = {
        auto_start: values.autoStart,
      }
      if (this.selectedItem.instance_type !== values.sku.name) {
        params.sku = values.sku.name
      }
      const ids = this.dataList.map(item => item.id)
      if (ids.length === 1) {
        params.disks = this.genDiskData(values)
      }
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
        const beforeSysDisks = (item.disks_info || []).filter(item => item.disk_type === 'sys').map(item => {
          return {
            medium_type: item.medium_type,
            size: item.size,
            type: item.storage_type,
          }
        })
        const beforeDataDisks = (item.disks_info || []).filter(item => item.disk_type === 'data').map(item => {
          return {
            medium_type: item.medium_type,
            size: item.size,
            type: item.storage_type,
          }
        })
        return {
          name: item.name,
          project: item.tenant,
          hypervisor: this.selectedItem.hypervisor,
          before: {
            cpu: item.vcpu_count,
            memory: item.vmem_size,
            disk: item.disk,
            dataDisks: beforeDataDisks,
            sysDisks: beforeSysDisks,
            sku: item.instance_type,
          },
          after: {
            cpu: this.form.fd.vcpu,
            memory: this.form.fd.vmem,
            disk: this.selectedItems.length === 1 ? (+item.disk + (+diskSize - beforeDiskSize) * 1024) : null,
            dataDisks: this.selectedItems.length === 1 ? params.disks : null,
            sysDisks: this.selectedItems.length === 1 ? beforeSysDisks : null,
            sku: values.sku.name,
          },
        }
      })
      params.project_id = this.userInfo.projectId
      params.domain = this.userInfo.projectDomainId
      const variables = {
        project: this.dataList[0].tenant_id,
        project_domain: this.dataList[0].domain_id,
        process_definition_key: this.WORKFLOW_TYPES.APPLY_SERVER_CHANGECONFIG,
        initiator: this.userInfo.id,
        paramter: JSON.stringify(params),
        ids: ids.join(','),
        serverConf: JSON.stringify(serverConf),
        description: values.reason,
      }
      if (this.$route.query.workflow) {
        await this.updateWorkflow(variables, this.$route.query.workflow)
      } else {
        await this.createWorkflow(variables)
      }
      this.$message.success(this.$t('compute.text_1109'))
      this.$router.push('/workflow')
    },
    async doChangeSettingsSubmit (values) {
      const params = {
        sku: values.sku.name,
        auto_start: values.autoStart,
      }
      const { showCpuSockets, cpuSockets } = this.form.fi
      const ids = this.dataList.map(item => item.id)
      if (ids.length === 1 && this.selectedItem.provider !== HYPERVISORS_MAP.cnware.provider) {
        params.disks = this.genDiskData(values)
      }
      if (showCpuSockets) {
        params.cpu_sockets = cpuSockets
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
        if (!this.form.fd.sku?.name) {
          // 修复套餐为空时，sku值为空对象导致非空校验失效问题
          this.form.fc.setFieldsValue({ sku: null })
        }
        const values = await this.form.fc.validateFields()
        if (this.isOpenWorkflow) {
          const projects = new Set(this.dataList.map(item => item.tenant_id))
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
            this.$store.commit('keepAlive/ADD_DELAY_EVENT', { name: 'ResourceListSingleRefresh', params: this.data.map(item => item.id) })
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
            vcpu: cpu,
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
        if (this.selectedItem && (this.selectedItem.provider === HYPERVISORS_MAP.hcso.provider || this.selectedItem.provider === HYPERVISORS_MAP.hcs.provider)) {
          params.cloudregion_id = this.selectedItem.cloudregion_id
        } else if (this.selectedItem.provider === HYPERVISORS_MAP.cnware.provider) {
          params.usable = false
          delete params.provider
          params['provider.0'] = HYPERVISORS_MAP.kvm.provider
          params['provider.1'] = this.selectedItem.provider
        } else {
          params.provider = HYPERVISORS_MAP.kvm.provider
        }
        if (this.selectedItem.provider === HYPERVISORS_MAP.sangfor.provider) {
          delete params.usable
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
      const len = this.form.fd.sysdisks?.length || -1
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
        if (values.dataDiskIops && values.dataDiskIops[key]) {
          diskObj.iops = values.dataDiskIops[key]
        }
        if (values.dataDiskThroughputs && values.dataDiskThroughputs[key]) {
          diskObj.throughput = values.dataDiskThroughputs[key]
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
      if (this.selectedItems.length === 1 && _.get(this.params, 'data[0].disks_info[0].disk_type') === 'data') {
        dataDisk.shift() // 因为第一块盘的disk_type是data，说明无系统盘，第一块盘是ISO启动的，需要去掉
      }
      return dataDisk
    },
    cancel () {
      this.$router.push({ name: 'VMInstanceIndex' })
    },
    baywatch (props, watcher) {
      const iterator = function (prop) {
        this.$watch(prop, watcher)
      }
      props.forEach(iterator, this)
    },
    async _getPriceList2 () {
      const f = this.form.fd
      if (!this.hasMeterService) return // 如果没有 meter 服务则取消调用
      if (R.isEmpty(f.sku) || R.isNil(f.sku)) return
      const isPublic = this.dataList[0].cloud_env === SERVER_TYPE.public
      if (isPublic && (R.isNil(f.sku.region_ext_id) || R.isEmpty(f.sku.region_ext_id))) return
      if (R.isNil(f.systemDiskSize)) return

      const pf = new PriceFetcher()
      pf.initialForm(this.$store.getters.scope, f.sku, f.duration || '1M', this.selectedItem?.billing_type, this.isPublic, this.cloudaccountId)
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
      // 磁盘区分介质
      if (diskSupportTypeMedium(this.selectedItem.hypervisor)) {
        systemDisk = getOriginDiskKey(systemDisk)
      }
      if (!isPublic) systemDisk = `${systemDiskMedium}::${systemDisk}`
      pf.addDisk(systemDisk, systemDiskSize)
      if (this.dataDiskType) {
        const datadisks = Object.values(this.form.fd.dataDiskSizes || {})
        let dataDisk = this.dataDiskType
        // 磁盘区分介质
        if (diskSupportTypeMedium(this.selectedItem.hypervisor)) {
          dataDisk = getOriginDiskKey(dataDisk)
        }
        if (!isPublic) dataDisk = `${dataDiskMedium}::${dataDisk}`
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
