<template>
  <div>
    <page-header title="新建本地IDC服务器" />
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
          :zone-params="params.zone"
          :cloudregion-params="params.cloudregion"
          :decorator="decorators.cloudregionZone" />
      </a-form-item>
      <a-form-item label="名称" v-bind="formItemLayout">
        <a-input v-decorator="decorators.name" :placeholder="$t('validator.serverName')" />
      </a-form-item>
      <a-form-item label="数量" v-bind="formItemLayout">
        <a-input-number v-decorator="decorators.count" :min="1" :max="10" />
      </a-form-item>
      <a-form-item label="平台" v-bind="formItemLayout" class="mb-0">
        <hypervisor-radio :decorator="decorators.hypervisor" :type="form.fi.createType" :hypervisors="form.fi.capability.hypervisors || []" />
      </a-form-item>
      <a-form-item v-bind="formItemLayout" class="mb-0">
        <span slot="label">
          是否配置GPU
          <a-tooltip class="item" title="目前只有KVM支持GPU云服务器">
            <a-icon type="question-circle" color="grey" />
          </a-tooltip>
        </span>
        <gpu :decorators="decorators.gpu" :gpu-options="gpuOptions" />
      </a-form-item>
      <a-form-item v-bind="formItemLayout" label="操作系统" class="mb-0">
        <os-select :type="type" :hypervisor="form.fd.hypervisor" :image-params="params.image" :decorator="decorators.imageOS" />
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
          v-if="form.fd.hypervisor"
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
          :image="form.fi.imageMsg" />
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
      <a-form-item label="调度策略" v-bind="formItemLayout" class="mb-0">
        <sched-policy
          :server-type="form.fi.createType"
          :disabled-host="policyHostDisabled"
          :policy-host-params="policyHostParams"
          :decorators="decorators.schedPolicy"
          :schedtag-params="params.schedtag"
          :policy-schedtag-params="params.policySchedtag" />
      </a-form-item>
      <a-form-item label="引导方式" v-bind="formItemLayout" class="mb-0">
        <bios :decorator="decorators.bios" />
      </a-form-item>
      <a-form-item v-bind="formItemLayout" class="mb-0">
        <span slot="label">
          高可用
          <a-tooltip class="item" title="只有宿主机数量不少于2台时才可以使用该功能">
            <a-icon type="question-circle" color="grey" />
          </a-tooltip>
        </span>
        <backup
          :decorator="decorators.backup"
          :disabled="form.fd.systemDiskType === 'gpfs'"
          :disabled-items="backupDisableds" />
      </a-form-item>
      <bottom-bar :loading="submiting" :fd="form.fd" :errors.sync="errors" />
    </a-form>
  </div>
</template>
<script>
import mixin from './mixin'

export default {
  name: 'IDCCreate',
  mixins: [mixin],
}
</script>
