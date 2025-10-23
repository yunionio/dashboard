<template>
  <div>
    <a-form
      class="mt-3"
      :form="form.fc"
      v-bind="formItemLayout"
      @submit="submit"
      hideRequiredMark>
      <container-title :title="$t('compute.eci.container_group_config')" />
      <a-form-item :label="$t('compute.text_297', [$t('dictionary.project')])">
        <domain-project
          :fc="form.fc"
          :fd="form.fd"
          :decorators="{ project: decorators.project, domain: decorators.domain }"
          @fetchDomainCallback="fetchDomainCallback"
          @fetchProjectCallback="fetchProjectCallback" />
      </a-form-item>
      <a-form-item :label="$t('compute.text_177')" class="mb-0">
        <cloudregion-zone
          :zone-params="zoneParams"
          :cloudregion-params="cloudregionParams"
          :decorator="decorators.cloudregionZone"
          filterBrandResource="compute_engine" />
      </a-form-item>
      <a-form-item :label="$t('compute.text_228')">
        <a-input v-decorator="decorators.name" />
        <template v-slot:extra>
          <name-repeated res="servers" :name="form.fd.name" :default-text="$t('compute.text_893')" />
        </template>
      </a-form-item>
      <a-form-item :label="$t('common.description')">
        <a-textarea :auto-size="{ minRows: 1, maxRows: 3 }" v-decorator="decorators.description" :placeholder="$t('common_367')" />
      </a-form-item>
      <a-form-item :label="$t('compute.text_1041')" v-if="isOpenWorkflow">
        <a-input v-decorator="decorators.reason" :placeholder="$t('compute.text_1042')" />
      </a-form-item>
      <a-form-item :label="$t('compute.text_1132')">
        <duration :decorators="decorators.duration" :form="form" />
      </a-form-item>
      <a-form-item :label="$t('compute.text_294')">
        <a-input-number v-decorator="decorators.count" @blur="countBlur" :min="1" :max="100" />
      </a-form-item>
      <a-form-item
        :label="$t('compute.text_1365')" v-show="form.fi.capability.host_cpu_archs && form.fi.capability.host_cpu_archs.length > 1">
        <os-arch
          v-decorator="decorators.os_arch"
          :form="form"
          :options="archOptions" />
      </a-form-item>
      <a-form-item>
        <span slot="label">
          {{ $t('compute.text_1152') }}&nbsp;
          <a-tooltip :title="$t('compute.vgpu_check.tooltip')">
            <a-icon type="question-circle-o" />
          </a-tooltip>
        </span>
        <pci :decorators="decorators.pci" :pciDevTypeOptions="pciDevTypeOptions" :form="form" :pci-options="pciOptions" />
      </a-form-item>
      <a-form-item :label="$t('compute.text_1058')" class="mb-0">
        <cpu-radio :decorator="decorators.vcpu" :options="form.fi.cpuMem.cpus || []" :showUnlimited="true" :form="form" :hypervisor="form.fd.hypervisor" @change="cpuChange" />
      </a-form-item>
      <a-form-item :label="$t('compute.text_369')" class="mb-0">
        <mem-radio :decorator="decorators.vmem" :options="form.fi.cpuMem.mems_mb || []" :showUnlimited="true" />
      </a-form-item>
      <a-form-item :label="$t('compute.text_109')" v-if="showSku">
        <sku
          v-decorator="decorators.sku"
          :type="type"
          :sku-params="skuParam"
          :hypervisor="form.fd.hypervisor" />
      </a-form-item>
      <a-form-item :label="$t('compute.text_50')">
        <data-disk
          v-if="form.fd.hypervisor"
          ref="dataDiskRef"
          :decorator="decorators.dataDisk"
          :form="form"
          :type="type"
          :hypervisor="form.fd.hypervisor"
          :sku="form.fd.sku"
          :capability-data="form.fi.capability"
          :disabled="form.fi.dataDiskDisabled"
          :defaultType="form.fd.systemDiskType"
          :domain="project_domain"
          :isVminstanceContainer="true"
          :storageParams="dataDiskStorageParams"
          :storageHostParams="storageHostParams"
          @storageHostChange="storageHostChange" />
      </a-form-item>
      <a-form-item :label="$t('compute.text_104')" class="mb-0">
        <server-network
          hiddenAdd
          :form="form"
          :decorator="decorators.network"
          :network-list-params="networkParam"
          :schedtag-params="schedtagParams"
          :networkVpcParams="networkVpcParams"
          :vpcResource="vpcResource"
          :hypervisor="form.fd.hypervisor"
          :serverCount="form.fd.count"
          :vpcResourceMapper="vpcResourceMapper"
          :networkResourceMapper="networkResourceMapper"
          :showMacConfig="true"
          :showDeviceConfig="true" />
      </a-form-item>
      <a-form-item :label="$t('compute.text_1154')" class="mb-0">
        <tag
          v-decorator="decorators.tag" />
      </a-form-item>
      <a-collapse :bordered="false" v-model="collapseActive">
        <a-collapse-panel :header="$t('compute.text_309')" key="1">
          <eip-config
            v-if="showEip"
            :decorators="decorators.eip"
            :eip-params="eipParams"
            :hypervisor="form.fd.hypervisor"
            :showBind="false"
            :showNew="false"
            :cloud-env="type"
            :form="form"
            :formItemLayout="formItemLayout" />
          <a-form-item
            :validate-status="hostNameValidate.validateStatus"
            :help="hostNameValidate.errorMsg">
            <span slot="label">
              {{ $t('common_388') }}&nbsp;
              <a-tooltip :title="hostNameTips">
                <a-icon type="question-circle-o" />
              </a-tooltip>
            </span>
            <host-name v-decorator="decorators.hostName" :isWindows="isWindows" @change="handleHostNameChange" />
          </a-form-item>
          <a-form-item :label="$t('compute.text_105')">
            <secgroup-config
              :form="form"
              :isSnapshotImageType="isSnapshotImageType"
              :decorators="decorators.secgroup"
              :secgroup-params="secgroupParams"
              :hypervisor="form.fd.hypervisor"
              :showSecgroupBind="showSecgroupBind" />
          </a-form-item>
          <a-form-item :label="$t('compute.text_311')" class="mb-0">
            <sched-policy
              :form="form"
              :server-type="form.fi.createType"
              :disabled-host="policyHostDisabled"
              :policy-host-params="policyHostParams"
              :decorators="decorators.schedPolicy"
              :policy-schedtag-params="policySchedtagParams"
              :showSchedCloudprovider="showSchedCloudprovider"
              :cloudproviderParamsExtra="cloudproviderParamsExtra" />
          </a-form-item>
          <a-form-item :label="$t('dictionary.instancegroup')" :extra="$t('compute.text_1158')">
            <instance-groups :decorators="decorators.groups" :params="instanceGroupsParams" />
          </a-form-item>
          <a-form-item :label="$t('compute.repo.port_mapping')">
            <labels
              ref="labelRef"
              :decorators="decorators.portMapping"
              :disableConf="portMappingDisableConf"
              :title="$t('compute.repo.port_mapping')"
              :keyLabel="$t('compute.repo.container_port')"
              :valueLabel="$t('compute.repo.host_port')"
              :keyPlaceholder="$t('compute.repo.example', ['443'])"
              :valuePlaceholder="$t('compute.repo.example', ['443'])" />
          </a-form-item>
        </a-collapse-panel>
      </a-collapse>
      <container-title :title="$t('compute.eci.container_config')" />
      <spec-container
        :form="form"
        :panes.sync="form.fi.containerPanes"
        :errPanes="form.fi.errPanes"
        :decorators="decorators.containers" />
      <bottom-bar
        :loading="submiting"
        :form="form"
        :type="type"
        :dataDiskSizes="dataDiskSizes"
        :isOpenWorkflow="isOpenWorkflow"
        :errors.sync="errors"
        :hasMeterService="hasMeterService"
        @add-cart="addShopCart"
        @cancel="handleCancel" />
    </a-form>
  </div>
</template>
<script>
import _ from 'lodash'
import * as R from 'ramda'
import SecgroupConfig from '@Compute/sections/SecgroupConfig'
import EipConfig from '@Compute/sections/EipConfig'
import Labels from '@Compute/sections/Labels'
import SpecContainer from '@Compute/sections/SpecContainer'
import { NETWORK_OPTIONS_MAP } from '@Compute/constants'
import OsArch from '@/sections/OsArch'
import { IMAGES_TYPE_MAP, STORAGE_TYPES, HOST_CPU_ARCHS } from '@/constants/compute'
import { resolveValueChangeField } from '@/utils/common/ant'
import { HYPERVISORS_MAP } from '@/constants'
import { diskSupportTypeMedium, getOriginDiskKey } from '@/utils/common/hypervisor'
import mixin from './mixin'
import ContainerTitle from '../components/ContainerTitle'

export default {
  name: 'VMContainer_IDCCreate',
  components: {
    SecgroupConfig,
    EipConfig,
    OsArch,
    ContainerTitle,
    SpecContainer,
    Labels,
  },
  mixins: [mixin],
  data () {
    return {
      isLocalDisk: true,
      timer: null,
      isFirstInit: true,
      storageHosts: {}, // 所有磁盘的storage-host
      storageHostParams: {}, // 第一个选择的块存储
    }
  },
  computed: {
    isKvm () {
      return this.form.fd.hypervisor === HYPERVISORS_MAP.kvm.key
    },
    isIso () {
      return this.form.fd.imageType === IMAGES_TYPE_MAP.iso.key
    },
    isArm () {
      return this.form.fd.os_arch === HOST_CPU_ARCHS.arm.key
    },
    isLoongarch64 () {
      return this.form.fd.os_arch === HOST_CPU_ARCHS.loongarch64.key
    },
    vdi () {
      return this.form.fd.vdi
    },
    hypervisors () {
      const { hypervisors = [] } = this.form.fi.capability
      return hypervisors
    },
    cloudregionParams () {
      return {
        cloud_env: 'onpremise',
        usable: true,
        show_emulated: true,
        ...this.scopeParams,
      }
    },
    zoneParams () {
      return {
        usable: true,
        show_emulated: true,
        order_by: 'created_at',
        order: 'asc',
        ...this.scopeParams,
      }
    },
    instanceGroupsParams () {
      return {
        ...this.scopeParams,
        enabled: true,
      }
    },
    cacheImageParams () {
      const params = {
        cloudregion_id: _.get(this.form.fd, 'cloudregion.key'),
        os_arch: HOST_CPU_ARCHS.x86.key,
      }
      if (!params.cloudregion_id) return {}
      if (this.form.fd.imageType === 'vmware') {
        params.image_type = 'system'
      }
      return params
    },
    showSku () {
      if (this.form.fd.hypervisor) {
        return true
      }
      return false
    },
    skuParam () {
      return {
        limit: 0,
        public_cloud: false,
        postpaid_status: 'available',
        cpu_core_count: this.form.fd.vcpu,
        memory_size_mb: this.form.fd.vmem,
        cloudregion: _.get(this.form, 'fd.cloudregion.key'),
        provider: 'OneCloud',
        ...this.scopeParams,
      }
    },
    policyHostParams () {
      const zone = _.get(this.form.fd, 'zone.key')
      if (zone) {
        const params = {
          enabled: 1,
          usable: true,
          zone,
          host_type: 'container',
          os_arch: HOST_CPU_ARCHS.x86.key,
          ...this.scopeParams,
        }
        if ([HYPERVISORS_MAP.esxi.key, HYPERVISORS_MAP.kvm.key].includes(params.hypervisor)) {
          if (this.form.fd[this.decorators.systemDisk.storage[0]]) {
            params.storage_id = this.form.fd[this.decorators.systemDisk.storage[0]]
          }
          if (this.storageHostParams.disk &&
            this.storageHostParams.disk !== 'system' &&
            this.storageHostParams.storageHosts &&
            this.storageHostParams.storageHosts.length &&
            !params.storage_id) {
            if (this.form.fd[`dataDiskStorages[${this.storageHostParams.disk}]`]) {
              params.storage_id = this.form.fd[`dataDiskStorages[${this.storageHostParams.disk}]`]
            }
          }
          params.cloudprovider = this.form.fd.prefer_manager
        }
        if (this.isArm) params.os_arch = HOST_CPU_ARCHS.arm.key
        if (this.isLoongarch64) params.os_arch = HOST_CPU_ARCHS.loongarch64.key
        return params
      }
      return {}
    },
    networkParam () {
      if (!this.cloudregionZoneParams.cloudregion) return {}
      const params = {
        filter: 'server_type.notin(ipmi, pxe, eip, baremetal)',
        usable: true,
        ...this.cloudregionZoneParams,
        ...this.scopeParams,
      }
      if ([HYPERVISORS_MAP.kvm.key].includes(this.form.fd.hypervisor)) {
        if (this.storageHostParams.disk &&
          this.storageHostParams.disk !== 'system' &&
          this.storageHostParams.storageHosts &&
          this.storageHostParams.storageHosts.length &&
          !params.storage_id) {
          if (this.form.fd[`dataDiskStorages[${this.storageHostParams.disk}]`]) {
            params.storage_id = this.form.fd[`dataDiskStorages[${this.storageHostParams.disk}]`]
          }
        }
      }
      return params
    },
    instanceSpecParmas () {
      return {
        usable: true,
        enabled: true,
        cloudregion: _.get(this.form.fd, 'cloudregion.key'),
      }
    },
    cloudproviderParamsExtra () {
      const params = {
        ...this.scopeParams,
      }
      if (this.form.fd.hypervisor && this.form.fd.hypervisor) {
        params.provider = HYPERVISORS_MAP[this.form.fd.hypervisor].provider
      }
      return params
    },
    showSchedCloudprovider () { // 创建VMware机器时，镜像类型不是 VMware 平台镜像时调度策略可以选择指定云账号
      return false
    },
    availableHostCount () { // 可用的宿主机数量
      if (R.is(Object, this.form.fi.capability)) {
        return this.form.fi.capability.available_host_count || 0
      }
      return 0
    },
    eipParams () {
      if (!this.cloudregionZoneParams.cloudregion) return {}
      return {
        project: this.project,
        region: this.cloudregionZoneParams.cloudregion,
      }
    },
    showEip () {
      const { vpcs, networkType } = this.form.fd
      if (networkType === NETWORK_OPTIONS_MAP.default.key) {
        return false
      }
      if (R.is(Object, vpcs)) {
        const vpcList = Object.values(vpcs)
        if (vpcList.length && !~vpcList.indexOf('default')) {
          return this.enableEip
        }
      }
      return false
    },
    storageParams () {
      const { systemDiskType = {}, hypervisor } = this.form.fd
      let key = systemDiskType.key || ''
      const params = {
        ...this.scopeParams,
        // usable: true, // 包含了 enable:true, status为online的数据
        brand: HYPERVISORS_MAP[this.form.fd.hypervisor]?.brand, // kvm,vmware支持指定存储
        manager: this.form.fd.prefer_manager,
      }

      // 磁盘区分介质
      if (diskSupportTypeMedium(hypervisor)) {
        const medium = getOriginDiskKey(key, true)
        key = getOriginDiskKey(key)
        params.filter = [
          `storage_type.contains("${key}")`,
          `medium_type.contains("${medium}")`,
        ]
      } else {
        params.filter = [
          `storage_type.contains("${key}")`,
        ]
      }
      return params
    },
    dataDiskStorageParams () {
      const { dataDiskSizes = {}, hypervisor } = this.form.fd
      let dataDiskType = ''
      let medium = ''
      for (const key in dataDiskSizes) {
        if (this.form.fd[`dataDiskTypes[${key}]`]) {
          dataDiskType = this.form.fd[`dataDiskTypes[${key}]`].key
          // 磁盘区分介质
          if (diskSupportTypeMedium(hypervisor)) {
            medium = getOriginDiskKey(dataDiskType, true)
            dataDiskType = getOriginDiskKey(dataDiskType)
          } else {
            dataDiskType = getOriginDiskKey(dataDiskType)
          }
        }
      }
      const params = {
        ...this.scopeParams,
        // usable: true, // 包含了 host status online 和 account 正常
        brand: HYPERVISORS_MAP[this.form.fd.hypervisor]?.brand, // kvm,vmware支持指定存储
        manager: this.form.fd.prefer_manager,
      }
      if (dataDiskType) {
        if (medium) {
          params.filter = [
            `storage_type.contains("${dataDiskType}")`,
            `medium_type.contains("${medium}")`,
          ]
        } else {
          params.filter = [`storage_type.contains("${dataDiskType}")`]
        }
      }
      return params
    },
    isStorageShow () { // 是否开启了指定存储
      if ([HYPERVISORS_MAP.esxi.key, HYPERVISORS_MAP.kvm.key].includes(this.form.fd.hypervisor)) {
        if (this.form.fd[this.decorators.systemDisk.storage[0]]) {
          return true
        }
        if (this.storageHostParams.disk &&
          this.storageHostParams.disk !== 'system' &&
          this.storageHostParams.storageHosts &&
          this.storageHostParams.storageHosts.length) {
          if (this.form.fd[`dataDiskStorages[${this.storageHostParams.disk}]`]) {
            return true
          }
        }
      }
      return false
    },
    imageParams () {
      const params = {
        ...this.scopeParams,
        os_arch: HOST_CPU_ARCHS.x86.key,
      }
      if (this.isArm) params.os_arch = HOST_CPU_ARCHS.arm.key
      if (this.isLoongarch64) params.os_arch = HOST_CPU_ARCHS.loongarch64.key
      return params
    },
    archOptions () {
      let opts = []
      if (this.form.fi.capability.host_cpu_archs && this.form.fi.capability.host_cpu_archs.length) {
        opts = this.form.fi.capability.host_cpu_archs.map(item => {
          if (item === HOST_CPU_ARCHS.arm.capabilityKey) return HOST_CPU_ARCHS.arm
          if (item === HOST_CPU_ARCHS.x86.capabilityKey) return HOST_CPU_ARCHS.x86
          if (item === HOST_CPU_ARCHS.loongarch64.capabilityKey) return HOST_CPU_ARCHS.loongarch64
          return item
        })
      }
      return opts.sort((a, b) => a.order - b.order)
    },
    extra () {
      if (this.isIso && this.isWindows) {
        return this.$t('compute.iso_windows_help')
      }
      return this.$t('compute.text_302')
    },
    enableEncryption () {
      return this.$appConfig.isPrivate
    },
    isMultiServer () {
      return this.form.fd.count > 1
    },
    portMappingDisableConf () {
      return {
        tooltip: this.isMultiServer ? this.$t('compute.container.port_mapping.tooltip') : '',
        disabled: this.isMultiServer,
      }
    },
  },
  watch: {
    'form.fi.imageMsg': {
      deep: true,
      handler (val, oldVal) {
        if (R.equals(val, oldVal)) return
        this.$nextTick(() => {
          this.form.fi.dataDiskDisabled = false
          this.form.fi.sysDiskDisabled = false
          if (this.form.fd.imageType === IMAGES_TYPE_MAP.host.key) {
            const { root_image: rootImage, data_images: dataImages } = this.form.fi.imageMsg
            const systemDiskSize = rootImage.min_disk_mb / 1024
            const { hypervisor } = this.form.fd
            const { data_storage_types2 } = this.form.fi.capability
            const medium = data_storage_types2[hypervisor][0].split('/')[1]
            const systemDiskType = {
              key: data_storage_types2[hypervisor][0],
              label: STORAGE_TYPES[HYPERVISORS_MAP.kvm.key].local.label,
            }
            this.form.fc.setFieldsValue({
              systemDiskSize,
              systemDiskType,
            })
            // 重置数据盘数据
            this._resetDataDisk()
            if (dataImages) {
              dataImages.forEach(val => {
                this.$refs.dataDiskRef.add({ size: val.min_disk_mb / 1024, min: val.min_disk_mb / 1024, minusDisabled: true, medium })
              })
            }
          }
          if (this.form.fd.imageType === IMAGES_TYPE_MAP.snapshot.key || this.form.fd.imageType === IMAGES_TYPE_MAP.backup.key) {
            // 镜像类型为主机快照或主机备份的话要回填数据并禁用
            const snapshots = _.cloneDeep(this.form.fi.imageMsg.server_config.disks)
            if (!snapshots) return
            let sysDisk = snapshots.find(val => val.disk_type === 'sys')
            if (!sysDisk) {
              sysDisk = snapshots.shift()
            }
            const dataDisks = snapshots.filter(val => val.disk_type !== 'sys')
            const data = {
              systemDiskType: {
                key: `${sysDisk.backend}/${sysDisk.medium}`,
                label: STORAGE_TYPES[HYPERVISORS_MAP.kvm.key][sysDisk.backend].label,
              },
              systemDiskSize: sysDisk.size / 1024,
            }
            if (val && R.is(Object, val.server_config)) {
              if (val.server_config.vcpu_count) {
                const cpuValue = val.server_config.vcpu_count
                data[this.decorators.vcpu[0]] = cpuValue
                this.cpuChange(cpuValue)
                if (val.server_config.vmem_size) data[this.decorators.vmem[0]] = val.server_config.vmem_size
              }
            }
            this.form.fc.setFieldsValue(data)
            // 重置数据盘数据
            this._resetDataDisk()
            dataDisks.forEach(val => {
              this.$refs.dataDiskRef.add({ diskType: val.backend, size: val.size / 1024, sizeDisabled: true, medium: val.medium })
            })
            this.form.fi.dataDiskDisabled = true
            this.form.fi.sysDiskDisabled = true
          } else {
            if (oldVal && R.is(Object, oldVal.server_config)) { // 说明是从主机快照切换过去的
              const vcpuDecorator = this.decorators.vcpu
              const vcpuInit = vcpuDecorator[1].initialValue
              this.form.fc.setFieldsValue({
                [vcpuDecorator[0]]: vcpuInit,
              })
              this.cpuChange(vcpuInit)
            }
          }
        })
      },
    },
    isMultiServer (val) {
      if (val && this.$refs.labelRef) {
        this.$refs.labelRef.reset()
        this.form.fd.containerPorts = {}
        this.form.fd.hostPorts = {}
      }
    },
  },
  destroyed () {
    this.timer = null
  },
  methods: {
    vpcResourceMapper (list) {
      return list
    },
    onValuesChange (vm, changedFields) {
      this.$nextTick(() => {
        const formValue = this.form.fc.getFieldsValue()
        const newField = resolveValueChangeField(changedFields)
        this._setNewFieldToFd(newField, formValue)
        const keys = Object.keys(newField)
        if (keys.includes('zone') || keys.includes('cloudregion')) {
          this.fetchCapability()
        }
        if (keys.includes('cloudregion')) {
          this.$nextTick(this.fetchInstanceSpecs)
        }
        if (changedFields.schedPolicyType === 'host') {
          this.$set(this.form.fd, 'schedPolicyHost', undefined)
        }
        this.setIsLocalDisk()
      })
    },
    storageHostChange (val) {
      const { disk } = this.storageHostParams
      if (val.disk) {
        this.storageHosts[val.disk] = val
      }
      // 由第一块选择块存储的盘来确定块存储所在的host
      if (!disk || disk === val.disk) { // 第一块盘选
        if (val.storageHosts && val.storageHosts.length) {
          this.storageHostParams = val
        } else { // 清空操作
          let changeNew = false
          for (const key in this.storageHosts) {
            if (this.storageHosts[key].storageHosts && this.storageHosts[key].storageHosts.length) {
              this.storageHostParams = this.storageHosts[key] // 选其他已选的hosts作为新的范围
              changeNew = true
              break
            }
          }
          if (!changeNew) this.storageHostParams = {}
        }
      }
    },
    setIsLocalDisk () {
      const isLocal = (v = '') => { return v.startsWith('local') }
      const fd = this.form.fc.getFieldsValue()
      let isDiskLocal = true
      const { dataDiskTypes } = fd
      if (!R.is(Object, dataDiskTypes)) return
      const diskTypeItem = dataDiskTypes[Object.keys(dataDiskTypes)[0]]
      if (diskTypeItem && diskTypeItem.key) {
        isDiskLocal = isLocal(diskTypeItem.key)
      }
      this.isLocalDisk = isDiskLocal
    },
    fetchCapability () {
      const params = {
        show_emulated: true,
        resource_type: 'shared',
        ...this.scopeParams,
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
      new this.$Manager(resource).getSpecific(this.capabilityParams)
        .then(({ data }) => {
          let hypervisors = R.is(Object, data) ? (data.hypervisors || []) : []
          if (hypervisors.includes(HYPERVISORS_MAP.kvm.key)) { // kvm 排序为第一个
            hypervisors = [HYPERVISORS_MAP.kvm.key].concat(hypervisors).filter(val => val !== 'baremetal')
          }
          hypervisors = Array.from(new Set(hypervisors))
          this.form.fi.capability = {
            ...data,
            hypervisors,
          }
          this.form.fc.setFieldsValue({
            hypervisor: hypervisors[0], // 赋值默认第一个平台
          })
          this.init()
        })
    },
    fetchInstanceSpecs () {
      if (!this.instanceSpecParmas.cloudregion) return
      this.serverskusM.get({ id: 'instance-specs', params: this.instanceSpecParmas })
        .then(({ data }) => {
          this.form.fi.cpuMem = data
          const vcpuDecorator = this.decorators.vcpu
          const vcpuInit = vcpuDecorator[1].initialValue
          const cpu = this.form.fd.vcpu || vcpuInit
          this.cpuChange(cpu)
        })
    },
    gpuChange (val) {
      if (!val) {
        this.form.fc.setFieldsValue({ gpu: '' })
      }
    },
    init () {
      if (this.isFirstInit) {
        this.initOsArch()
        this.isFirstInit = false
      }
    },
    initOsArch () {
      this.timer = setTimeout(() => {
        const { os_arch } = this.$route.query
        // 数据延迟回填
        if (os_arch) {
          let canUseOsArch = ''
          if (os_arch.indexOf('x86') !== -1) {
            canUseOsArch = HOST_CPU_ARCHS.x86.key
          } else if (os_arch.indexOf('aarch') !== -1) {
            canUseOsArch = HOST_CPU_ARCHS.arm.key
          }
          if (!canUseOsArch) return
          this.form.fc.setFieldsValue({ os_arch: canUseOsArch })
        }
      }, 3000)
    },
    getMachineDecorator () {
      let initValue = 'pc'
      if (this.isArm) {
        initValue = 'virt'
      }
      return [
        'machine',
        {
          initialValue: initValue,
        },
      ]
    },
  },
}
</script>
