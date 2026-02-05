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
      <a-form-item :label="$t('compute.text_177')" class="mb-0">
        <cloudregion-zone
          :zone-params="zoneParams"
          :cloudregion-params="cloudregionParams"
          :decorator="decorators.cloudregionZone"
          filterBrandResource="compute_engine" />
      </a-form-item>
      <a-form-item :label="$t('compute.text_15')" v-if="isHCSO || isHCS">
        <base-select
          resource="cloudproviders"
          v-decorator="decorators.cloudprovider"
          :params="policycloudproviderParams"
          :isDefaultSelect="true"
          :showSync="true"
          :select-props="{ placeholder: $t('compute.text_149') }" />
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
      <a-form-item v-show="!isServertemplate" :label="$t('compute.text_1132')">
        <duration useServerDuration :decorators="decorators.duration" />
      </a-form-item>
      <a-form-item :label="$t('compute.text_294')" v-show="!isServertemplate">
        <a-input-number v-decorator="decorators.count" @blur="countBlur" :min="1" :max="100" />
      </a-form-item>
      <a-form-item v-if="form.fd.hypervisor === 'zettakit' || form.fd.hypervisor === 'kvm'">
        <span slot="label">
          {{ $t('compute.text_1152') }}&nbsp;
          <a-tooltip :title="$t('compute.vgpu_check.tooltip')">
            <a-icon type="question-circle-o" />
          </a-tooltip>
        </span>
        <pci :decorators="decorators.pci" :pciDevTypeOptions="pciDevTypeOptions" :form="form" :pci-options="pciOptions" />
      </a-form-item>
      <a-form-item :label="$t('compute.text_1058')" class="mb-0">
        <cpu-radio :decorator="decorators.vcpu" :options="form.fi.cpuMem.cpus || []" :showUnlimited="true" @change="cpuChange" />
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
      <a-form-item :label="$t('compute.text_267')" :extra="$t('compute.text_302')">
        <os-select
          :type="type"
          :form="form"
          :hypervisor="form.fd.hypervisor"
          :decorator="decorators.imageOS"
          :os-arch="osArch"
          :image-params="imageParams"
          :cacheImageParams="cacheImageParams"
          :cloudproviderParamsExtra="cloudproviderParamsExtra"
          :ignoreOptions="ignoreImageOptions"
          @updateImageMsg="updateFi" />
      </a-form-item>
      <a-form-item :label="$t('compute.text_49')" class="mb-0">
        <system-disk
          ref="systemDiskRef"
          :decorator="decorators.systemDisk"
          :type="type"
          :form="form"
          :hypervisor="form.fd.hypervisor"
          :sku="form.fd.sku"
          :capability-data="form.fi.capability"
          :image="form.fi.imageMsg"
          :sizeDisabled="disabledSysDiskSize" />
      </a-form-item>
      <a-form-item :label="$t('compute.text_50')" v-if="form.fd.hypervisor && form.fd.hypervisor !== 'zettakit' && !isCNware">
        <data-disk
          :isInitForm="isInitForm"
          :decorator="decorators.dataDisk"
          :type="type"
          :form="form"
          :hypervisor="form.fd.hypervisor"
          :sku="form.fd.sku"
          :defaultType="form.fd.systemDiskType"
          :capability-data="form.fi.capability"
          ref="dataDiskRef" />
      </a-form-item>
      <a-form-item :label="$t('compute.text_1372')" v-if="showServerAccount">
        <server-account :form="form" :hypervisor="form.fd.hypervisor" :instance_capabilities="form.fi.capability.instance_capabilities" :osType="osType" />
      </a-form-item>
      <a-form-item :label="$t('compute.text_308')">
        <server-password :decorator="decorators.loginConfig" :login-types="loginTypes" :form="form" />
      </a-form-item>
      <a-form-item :label="$t('compute.text_104')" class="mb-0">
        <server-network
          ref="networkRef"
          :form="form"
          :decorator="decorators.network"
          :network-list-params="networkParam"
          :schedtag-params="schedtagParams"
          :networkVpcParams="networkVpcParams"
          :vpcResource="vpcResource"
          :cloudprovider="this.form.fd.cloudprovider"
          :serverCount="form.fd.count"
          :key="serverNetwork"
          :networkResourceMapper="networkResourceMapper"
          :showMacConfig="form.fd.hypervisor === 'kvm'" />
      </a-form-item>
      <a-form-item :label="$t('compute.text_1154')" class="mb-0">
        <tag
          v-decorator="decorators.tag" :default-checked="tagDefaultChecked" />
      </a-form-item>
      <!-- <a-divider orientation="left">{{$t('compute.text_309')}}</a-divider> -->
      <a-collapse :bordered="false" v-model="collapseActive">
        <a-collapse-panel :header="$t('compute.text_309')" key="1">
          <a-form-item v-if="!isServertemplate">
            <span slot="label">
              {{ $t('common_388') }}&nbsp;
              <a-tooltip :title="hostNameTips">
                <a-icon type="question-circle-o" />
              </a-tooltip>
            </span>
            <host-name v-decorator="decorators.hostName" :isWindows="isWindows" />
          </a-form-item>
          <a-form-item :label="$t('compute.text_105')" v-if="showSecgroup">
            <secgroup-config
              :decorators="decorators.secgroup"
              :secgroup-params="secgroupParams"
              :hypervisor="form.fd.hypervisor"
              :showSecgroupBind="showSecgroupBind" />
          </a-form-item>
          <a-form-item :label="$t('compute.text_311')" v-show="!isServertemplate" class="mb-0">
            <sched-policy
              ref="schedPolicyRef"
              :provider="cloudprovider"
              :server-type="form.fi.createType"
              :disabled-host="policyHostDisabled"
              :policy-host-params="policyHostParams"
              :decorators="decorators.schedPolicy"
              :policy-schedtag-params="policySchedtagParams" />
          </a-form-item>
          <custom-data v-if="showCustomData" ref="customData" :decorators="decorators" :form="form" />
          <bastion-host v-if="!isOpenSourceVersion && hasBastionService" :decorator="decorators.bastion_host" :form="form" />
        </a-collapse-panel>
      </a-collapse>
      <bottom-bar
        :loading="submiting"
        :form="form"
        :type="type"
        :dataDiskSizes="dataDiskSizes"
        :isOpenWorkflow="isOpenWorkflow"
        :errors.sync="errors"
        :isServertemplate="isServertemplate"
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
import { resolveValueChangeField } from '@/utils/common/ant'
import { HYPERVISORS_MAP } from '@/constants'
import { HOST_CPU_ARCHS } from '@/constants/compute'
import { uuid } from '@/utils/utils'
import mixin from './mixin'

export default {
  name: 'VMPrivateCreate',
  components: {
    SecgroupConfig,
  },
  mixins: [mixin],
  computed: {
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
    cloudregionParams () {
      return {
        cloud_env: 'private',
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
    imageParams () {
      const params = {
        ...this.scopeParams,
      }
      if (R.is(Object, this.form.fd.sku)) {
        if (this.cloudregionZoneParams.cloudregion) {
          params.cloudregion_id = this.cloudregionZoneParams.cloudregion
        }
        params.os_arch = HOST_CPU_ARCHS.x86.key
        if (this.isArm) params.os_arch = HOST_CPU_ARCHS.arm.key
        if (this.isLoongarch64) params.os_arch = HOST_CPU_ARCHS.loongarch64.key
      }
      return params
    },
    cacheImageParams () {
      const params = {
        manager_id: this.form.fd.cloudprovider,
      }
      if (this.form.fd.hypervisor !== HYPERVISORS_MAP.cloudpods.hypervisor) {
        params.project_domain = this.project_domain
      }
      if (R.is(Object, this.form.fd.sku)) {
        if (this.cloudregionZoneParams.cloudregion) {
          params.cloudregion_id = this.cloudregionZoneParams.cloudregion
        }
      }
      if (this.form.fd.imageType === 'private_iso') {
        params.filter = 'name.endswith(".iso")'
      }
      if (!params.cloudregion_id) return {}
      return params
    },
    showSku () {
      return true
    },
    skuParam () {
      const params = {
        limit: 0,
        postpaid_status: 'available',
        cpu_core_count: this.form.fd.vcpu,
        memory_size_mb: this.form.fd.vmem,
        usable: true,
        enabled: true,
        ...this.scopeParams,
      }
      if (this.form.fd.hypervisor === 'nutanix' || this.form.fd.hypervisor === 'incloudsphere' || this.form.fd.hypervisor === 'proxmox' || this.form.fd.hypervisor === 'sangfor' || this.form.fd.hypervisor === 'uis' || this.form.fd.hypervisor === 'cnware') {
        params.is_on_premise = true
        params.usable = false
      } else {
        params.private_cloud = true
        params.cloudregion_id = this.cloudregionZoneParams.cloudregion
      }
      return params
    },
    policyHostParams () {
      const zone = _.get(this.form.fd, 'zone.key')
      if (zone) {
        return {
          enabled: 1,
          usable: true,
          zone,
          hypervisor: this.form.fd.hypervisor,
          ...this.scopeParams,
        }
      }
      return {}
    },
    networkParam () {
      if (this.form.fd.hypervisor === HYPERVISORS_MAP.cnware.hypervisor) {
        return {
          filter: 'server_type.notin(ipmi, pxe)',
          usable: true,
          ...this.scopeParams,
        }
      }
      const params = {
        filter: 'server_type.notin(ipmi, pxe)',
        usable: true,
        zone: _.get(this.form, 'fd.zone.key'),
        ...this.scopeParams,
      }
      return params
    },
    instanceSpecParmas () {
      if (this.form.fd.hypervisor === HYPERVISORS_MAP.hcso.hypervisor || this.form.fd.hypervisor === HYPERVISORS_MAP.hcs.hypervisor) {
        const params = {
          usable: true,
          enabled: true,
          provider: HYPERVISORS_MAP.hcso.provider,
        }
        if (this.form.fd.hypervisor === HYPERVISORS_MAP.hcs.hypervisor) {
          params.provider = HYPERVISORS_MAP.hcs.provider
        }

        if (this.cloudregionZoneParams.cloudregion) {
          params.cloudregion_id = this.cloudregionZoneParams.cloudregion
        }
        return params
      } else {
        const ret = {
          usable: true,
          enabled: true,
          'provider.0': HYPERVISORS_MAP.kvm.provider,
          'provider.1': _.get(HYPERVISORS_MAP, `[${this.form.fd.hypervisor}].provider`),
        }
        if (this.form.fd.hypervisor === HYPERVISORS_MAP.sangfor.hypervisor || this.form.fd.hypervisor === HYPERVISORS_MAP.cnware.hypervisor) {
          delete ret.usable
        }
        return ret
      }
    },
    cloudprovider () {
      if (this.form.fd.hypervisor && this.form.fd.hypervisor) {
        return HYPERVISORS_MAP[this.form.fd.hypervisor].provider
      }
      return ''
    },
    cloudproviderParamsExtra () {
      const params = {
        manager_id: this.form.fd.cloudprovider,
        ...this.scopeParams,
      }
      if (this.cloudregionZoneParams.cloudregion) {
        params.cloudregion_id = this.cloudregionZoneParams.cloudregion
      }
      return params
    },
    disabledSysDiskSize () {
      if (this.form.fd.systemDiskType) {
        return this.form.fd.systemDiskType.key === 'nova'
      }
      return false
    },
    policycloudproviderParams () {
      const params = {
        limit: 0,
        brand: this.form.fd.provider,
        cloudregion_id: this.form.fd.cloudregion?.key || this.form.fd.cloudregion,
        enabled: true,
        filter: 'status.equals(\'connected\')',
        ...this.scopeParams,
      }
      if (this.form.fd.zone) {
        params.zone_id = this.form.fd.zone?.key || this.form.fd.zone
      }
      return params
    },
    showSecgroup () {
      const hiddenSecCloudprovider = ['Nutanix', 'SangFor', 'CNware']
      return !hiddenSecCloudprovider.includes(this.cloudprovider)
    },
    systemDiskTypeDisabled () {
      return this.form.fd.hypervisor === HYPERVISORS_MAP.nutanix.key
    },
    ignoreImageOptions () {
      if (this.isInCloudSphere || this.isCNware) {
        return ['standard', 'customize']
      }
      if (this.form.fd.hypervisor === HYPERVISORS_MAP.proxmox.key) {
        return ['private']
      }
      return []
    },
  },
  methods: {
    onValuesChange (vm, changedFields) {
      this.$nextTick(() => {
        const formValue = this.form.fc.getFieldsValue()
        const newField = resolveValueChangeField(changedFields)
        this._setNewFieldToFd(newField, formValue)
        const keys = Object.keys(newField)
        if (keys.includes('zone')) {
          this.fetchCapability()
        }
        if (keys.includes('project')) {
          this.fetchCapability()
        }
      })
    },
    fetchCapability () {
      const params = {
        show_emulated: true,
        resource_type: 'shared',
        ...this.scopeParams,
        $t: uuid(),
      }
      if (this.project) {
        params.tenant_id = this.project
      }
      let id = this.cloudregionZoneParams.cloudregion
      let resource = 'cloudregions'
      if (this.cloudregionZoneParams.zone) {
        id = this.cloudregionZoneParams.zone
        resource = 'zones'
      }
      const capabilityParams = { id, spec: 'capability', params, $t: uuid() }
      if (!id) return
      if (R.equals(this.capabilityParams, capabilityParams)) return // 和已有的参数一样则不发请求
      this.capabilityParams = capabilityParams
      new this.$Manager(resource).getSpecific(capabilityParams)
        .then(({ data }) => {
          const { cloudregion = {} } = this.form.fd
          if (resource === 'cloudregions' && cloudregion.key && id !== cloudregion.key) {
            return
          }
          this.form.fi.capability = {
            ...data,
            hypervisors: data.hypervisors.filter(val => val !== 'baremetal' && val !== 'pod'),
          }
          this.form.fc.getFieldDecorator('hypervisor', { preserve: true })
          this.form.fc.setFieldsValue({
            hypervisor: this.form.fi.capability.hypervisors[0], // 赋值默认第一个平台
          })
          this.$set(this.form.fd, 'hypervisor', this.form.fi.capability.hypervisors[0])
          this.$nextTick(this.fetchInstanceSpecs)
        })
    },
    fetchInstanceSpecs () {
      this.serverskusM.get({ id: 'instance-specs', params: this.instanceSpecParmas })
        .then(({ data }) => {
          this.form.fi.cpuMem = data
          const vcpuDecorator = this.decorators.vcpu
          const vcpuInit = vcpuDecorator[1].initialValue
          const cpu = this.form.fd.vcpu || vcpuInit
          this.cpuChange(cpu)
        })
    },
  },
}
</script>
