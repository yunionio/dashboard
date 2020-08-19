<template>
  <div>
    <a-form
      class="mt-3"
      :form="form.fc"
      v-bind="formItemLayout"
      @submit="submit"
      hideRequiredMark>
      <servertemplate v-if="isServertemplate" :decorators="decorators.servertemplate">
        <a-form-item :label="`指定${$t('dictionary.project')}`">
          <domain-project :fc="form.fc" :decorators="{ project: decorators.project, domain: decorators.domain }" />
        </a-form-item>
      </servertemplate>
      <!-- <a-divider orientation="left">基础配置</a-divider> -->
      <a-form-item v-if="!isServertemplate" :label="`指定${$t('dictionary.project')}`">
        <domain-project :fc="form.fc" :decorators="{ project: decorators.project, domain: decorators.domain }" />
      </a-form-item>
      <a-form-item label="区域" class="mb-0">
        <cloudregion-zone
          :zone-params="zoneParams"
          :cloudregion-params="cloudregionParams"
          :decorator="decorators.cloudregionZone" />
      </a-form-item>
      <a-form-item label="名称" v-if="!isServertemplate">
        <a-input v-decorator="decorators.name" :placeholder="$t('validator.resourceCreateName')" />
        <name-repeated
          v-slot:extra
          res="servers"
          :name="form.fd.name"
          default-text="名称支持有序后缀占位符‘#’，用法举例，名称host##，数量2，创建后实例的名称依次为host01、host02，已有同名实例，序号顺延" />
      </a-form-item>
      <a-form-item label="申请原因" v-if="isOpenWorkflow">
        <a-input v-decorator="decorators.reason" placeholder="请输入主机申请原因" />
      </a-form-item>
      <a-form-item v-show="!isServertemplate" label="到期释放">
        <duration :decorators="decorators.duration" />
      </a-form-item>
      <a-form-item label="数量" v-show="!isServertemplate">
        <a-input-number v-decorator="decorators.count" @blur="countBlur" :min="1" :max="100" />
      </a-form-item>
      <a-form-item label="CPU核数" class="mb-0">
        <cpu-radio :decorator="decorators.vcpu" :options="form.fi.cpuMem.cpus || []" @change="cpuChange" />
      </a-form-item>
      <a-form-item label="内存" class="mb-0">
        <mem-radio :decorator="decorators.vmem" :options="form.fi.cpuMem.mems_mb || []" />
      </a-form-item>
      <a-form-item label="套餐" v-if="showSku">
        <sku
          v-decorator="decorators.sku"
          :type="type"
          :sku-params="skuParam"
          :hypervisor="form.fd.hypervisor" />
      </a-form-item>
      <a-form-item label="操作系统" extra="操作系统会根据选择的虚拟化平台和可用区域的变化而变化，公共镜像的维护请联系管理员">
        <os-select
          :type="type"
          :form="form"
          :hypervisor="form.fd.hypervisor"
          :decorator="decorators.imageOS"
          :image-params="scopeParams"
          :cacheImageParams="cacheImageParams"
          :cloudproviderParamsExtra="cloudproviderParamsExtra"
          @updateImageMsg="updateFi" />
      </a-form-item>
      <a-form-item label="系统盘" class="mb-0">
        <system-disk
          :decorator="decorators.systemDisk"
          :type="type"
          :form="form"
          :hypervisor="form.fd.hypervisor"
          :sku="form.fd.sku"
          :capability-data="form.fi.capability"
          :image="form.fi.imageMsg"
          :sizeDisabled="disabledSysDiskSize" />
      </a-form-item>
      <a-form-item label="数据盘">
        <data-disk
          v-if="form.fd.hypervisor"
          :decorator="decorators.dataDisk"
          :type="type"
          :form="form"
          :hypervisor="form.fd.hypervisor"
          :sku="form.fd.sku"
          :defaultType="form.fd.systemDiskType"
          :capability-data="form.fi.capability"
          ref="dataDiskRef" />
      </a-form-item>
      <a-form-item label="管理员密码">
        <server-password :decorator="decorators.loginConfig" :login-types="loginTypes" :form="form" />
      </a-form-item>
      <a-form-item label="网络" class="mb-0">
        <server-network
          :form="form"
          :decorator="decorators.network"
          :network-list-params="networkParam"
          :schedtag-params="schedtagParams"
          :networkVpcParams="networkVpcParams"
          :vpcResource="vpcResource"
          :serverCount="form.fd.count"
          :networkResourceMapper="networkResourceMapper" />
      </a-form-item>
      <a-form-item label="标签" class="mb-0">
        <tag
          v-decorator="decorators.tag" />
      </a-form-item>
      <!-- <a-divider orientation="left">高级配置</a-divider> -->
      <a-collapse :bordered="false" v-model="collapseActive">
        <a-collapse-panel header="高级配置" key="1">
          <a-form-item label="安全组">
            <secgroup-config
              :decorators="decorators.secgroup"
              :secgroup-params="secgroupParams"
              :hypervisor="form.fd.hypervisor" />
          </a-form-item>
          <a-form-item label="调度策略" v-show="!isServertemplate" class="mb-0">
            <sched-policy
              :server-type="form.fi.createType"
              :disabled-host="policyHostDisabled"
              :policy-host-params="policyHostParams"
              :decorators="decorators.schedPolicy"
              :policy-schedtag-params="policySchedtagParams" />
          </a-form-item>
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
        :hasMeterService="hasMeterService" />
    </a-form>
  </div>
</template>
<script>
import _ from 'lodash'
import * as R from 'ramda'
import mixin from './mixin'
import SecgroupConfig from '@Compute/sections/SecgroupConfig'
import { resolveValueChangeField } from '@/utils/common/ant'
import { HYPERVISORS_MAP } from '@/constants'

export default {
  name: 'VMPrivateCreate',
  components: {
    SecgroupConfig,
  },
  mixins: [mixin],
  computed: {
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
    showSku () {
      if (this.form.fd.vcpu && this.form.fd.vmem) {
        return true
      }
      return false
    },
    skuParam () {
      return {
        limit: 0,
        public_cloud: false,
        postpaid_status: 'available',
        cpu_core_count: this.form.fd.vcpu || this.decorators.vcpu[1].initialValue,
        memory_size_mb: this.form.fd.vmem,
        usable: true,
        enabled: true,
        provider: 'OneCloud',
        ...this.scopeParams,
      }
    },
    policyHostParams () {
      const zone = _.get(this.form.fd, 'zone.key')
      if (zone) {
        return {
          enabled: 1,
          usable: true,
          zone,
          hypervisor: this.form.fd.hypervisor,
        }
      }
      return {}
    },
    networkParam () {
      const params = {
        filter: 'server_type.notin(ipmi, pxe)',
        usable: true,
        zone: _.get(this.form, 'fd.zone.key'),
        ...this.scopeParams,
      }
      return params
    },
    instanceSpecParmas () {
      return {
        usable: true,
        enabled: true,
        'provider.0': HYPERVISORS_MAP.kvm.provider,
        'provider.1': this.form.fd.hypervisor,
      }
    },
    cloudproviderParamsExtra () {
      const params = {
        cloud_env: 'private',
        ...this.scopeParams,
      }
      if (this.form.fd.hypervisor && this.form.fd.hypervisor) {
        params.provider = HYPERVISORS_MAP[this.form.fd.hypervisor].provider
      }
      return params
    },
    disabledSysDiskSize () {
      if (this.form.fd.systemDiskType) {
        return this.form.fd.systemDiskType.key === 'nova'
      }
      return false
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
      })
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
          this.form.fi.capability = {
            ...data,
            hypervisors: data.hypervisors.filter(val => val !== 'baremetal'),
          }
          this.form.fc.getFieldDecorator('hypervisor', { preserve: true })
          this.form.fc.setFieldsValue({
            hypervisor: this.form.fi.capability.hypervisors[0], // 赋值默认第一个平台
          })
          this.$nextTick(this.fetchInstanceSpecs)
        })
    },
    fetchInstanceSpecs () {
      this.serverskusM.get({ id: 'instance-specs', params: this.instanceSpecParmas })
        .then(({ data }) => {
          this.form.fi.cpuMem = data
          const vcpuDecorator = this.decorators.vcpu
          const vcpuInit = vcpuDecorator[1].initialValue
          this.cpuChange(vcpuInit)
        })
    },
  },
}
</script>
