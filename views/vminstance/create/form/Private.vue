<template>
  <div>
    <page-header title="新建私有云服务器" />
    <a-form
      class="mt-3"
      :form="form.fc"
      @submit="submit">
      <a-divider orientation="left">基础配置</a-divider>
      <a-form-item label="指定项目" class="mb-0" v-bind="formItemLayout">
        <domain-project :fc="form.fc" :decorators="{ project: decorators.project, domain: decorators.domain }" />
      </a-form-item>
      <a-form-item label="区域" class="mb-0" v-bind="formItemLayout">
        <cloudregion-zone
          :zone-params="zoneParams"
          :cloudregion-params="cloudregionParams"
          :decorator="decorators.cloudregionZone" />
      </a-form-item>
      <a-form-item label="名称" v-bind="formItemLayout" extra="名称支持序号占位符‘#’，用法如下。 名称：host## 数量：2、实例为：host01、host02">
        <a-input v-decorator="decorators.name" :placeholder="$t('validator.serverName')" />
      </a-form-item>
      <a-form-item label="数量" v-bind="formItemLayout">
        <a-input-number v-decorator="decorators.count" :min="1" :max="10" />
      </a-form-item>
      <a-form-item v-bind="formItemLayout" label="操作系统" extra="操作系统会根据选择的虚拟化平台和可用区域的变化而变化，公共镜像的维护请联系管理员">
        <os-select
          :type="type"
          :hypervisor="form.fd.hypervisor"
          :image-params="imageParams"
          :decorator="decorators.imageOS"
          :cacheImageParams="cacheImageParams" />
      </a-form-item>
      <a-form-item label="CPU核数" v-bind="formItemLayout" class="mb-0">
        <cpu-radio :decorator="decorators.vcpu" :options="form.fi.cpuMem.cpus || []" @change="cpuChange" />
      </a-form-item>
      <a-form-item label="内存" v-bind="formItemLayout" class="mb-0">
        <mem-radio :decorator="decorators.vmem" :options="form.fi.cpuMem.mems_mb || []" />
      </a-form-item>
      <a-form-item label="套餐" v-bind="formItemLayout" v-if="showSku">
        <sku
          v-decorator="decorators.sku"
          :type="type"
          :sku-params="skuParam"
          :hypervisor="form.fd.hypervisor" />
      </a-form-item>
      <a-form-item label="系统磁盘" v-bind="formItemLayout" class="mb-0">
        <system-disk
          :decorator="decorators.systemDisk"
          :type="type"
          :hypervisor="form.fd.hypervisor"
          :sku="form.fd.sku"
          :capability-data="form.fi.capability"
          :image="form.fi.imageMsg" />
      </a-form-item>
      <a-form-item label="数据盘" v-bind="formItemLayout">
        <data-disk
          v-if="form.fd.hypervisor"
          :decorator="decorators.dataDisk"
          :type="type"
          :hypervisor="form.fd.hypervisor"
          :sku="form.fd.sku"
          :capability-data="form.fi.capability"
          ref="dataDiskRef" />
      </a-form-item>
      <a-form-item label="管理员密码" v-bind="formItemLayout">
        <server-password :decorator="decorators.loginConfig" />
      </a-form-item>
      <a-form-item label="网络" v-bind="formItemLayout">
        <server-network
          :decorator="decorators.network"
          :network-list-params="networkParam"
          :schedtag-params="params.schedtag" />
      </a-form-item>
      <a-divider orientation="left">高级配置</a-divider>
      <a-form-item label="安全组" v-bind="formItemLayout">
        <secgroup-config
          :decorators="decorators.secgroup"
          :secgroup-params="secgroupParams"
          :hypervisor="form.fd.hypervisor" />
      </a-form-item>
      <a-form-item label="调度策略" v-bind="formItemLayout" class="mb-0">
        <sched-policy
          :server-type="form.fi.createType"
          :disabled-host="policyHostDisabled"
          :policy-host-params="policyHostParams"
          :decorators="decorators.schedPolicy"
          :schedtag-params="params.schedtag"
          :policy-schedtag-params="params.policySchedtag" />
      </a-form-item>
      <a-form-item v-bind="formItemLayout" label="到期释放">
        <duration :decorators="decorators.duration" />
      </a-form-item>
      <bottom-bar :loading="submiting" :form="form" :type="type" :errors.sync="errors" />
    </a-form>
  </div>
</template>
<script>
import _ from 'lodash'
import * as R from 'ramda'
import SecgroupConfig from '@Compute/sections/SecgroupConfig'
import mixin from './mixin'
import { resolveValueChangeField } from '@/utils/common/ant'

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
        project_domain: this.project_domain,
      }
    },
    zoneParams () {
      return {
        usable: true,
        show_emulated: true,
        order_by: 'created_at',
        order: 'asc',
        project_domain: this.project_domain,
      }
    },
    instanceGroupsParams () {
      if (this.project_domain) {
        return {
          project_domain: this.project_domain,
          enabled: true,
        }
      }
      return {}
    },
    imageParams () {
      return {
        limit: 0,
        scope: this.$store.getters.scope,
        details: true,
        status: 'active',
      }
    },
    cacheImageParams () {
      const params = {
        details: false,
        order_by: 'ref_count',
        order: 'desc',
        image_type: 'customized',
        zone: _.get(this.form.fd, 'zone.key'),
      }
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
        cloudregion: _.get(this.form.fd, 'cloudregion.key'),
        project_domain: this.project_domain,
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
      }
      if (this.$isAdminMode) {
        params.project_domain = this.project_domain
      }
      return params
    },
  },
  methods: {
    onValuesChange (vm, changedFields) {
      this.$nextTick(() => {
        const formValue = this.form.fc.getFieldsValue()
        const newField = resolveValueChangeField(changedFields)
        const keys = Object.keys(newField)
        const { zone, cloudregion } = newField
        if (keys.includes('cloudregion')) {
          if (!R.equals(cloudregion, this.form.fd.cloudregion)) { // 区域变化
            this.fetchInstanceSpeces()
          }
        }
        if (keys.includes('zone')) {
          if (!R.equals(zone, this.form.fd.zone)) { // 可用区变化
            this.fetchCapability()
          }
        }
        this._setNewFieldToFd(newField, formValue)
      })
    },
    fetchCapability () {
      const params = {
        show_emulated: true,
        resource_type: 'shared',
        project_domain: this.project_domain,
      }
      const { key } = this.form.fc.getFieldValue('zone')
      this.zoneM.getSpecific({ id: key, spec: 'capability', params })
        .then(({ data }) => {
          this.form.fi.capability = {
            ...data,
            hypervisors: data.hypervisors.filter(val => val !== 'baremetal'),
          }
          this.form.fc.getFieldDecorator('hypervisor', { preserve: true })
          this.form.fc.setFieldsValue({
            hypervisor: this.form.fi.capability.hypervisors[0], // 赋值默认第一个平台
          })
        })
    },
    fetchInstanceSpeces () {
      const { key } = this.form.fc.getFieldValue('cloudregion')
      this.serverskusM.get({ id: 'instance-specs', params: { cloudregion: key } })
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
