<template>
  <div>
    <page-header title="新建公有云服务器" />
    <a-form
      class="mt-3"
      :form="form.fc"
      @submit="submit">
      <servertemplate v-if="isServertemplate" :decorators="decorators.servertemplate" :formItemLayout="formItemLayout" />
      <a-divider orientation="left">基础配置</a-divider>
      <a-form-item v-show="!isServertemplate" label="指定项目" v-bind="formItemLayout">
        <domain-project :fc="form.fc" :decorators="{ project: decorators.project, domain: decorators.domain }" />
      </a-form-item>
      <a-form-item label="名称" v-if="!isServertemplate" v-bind="formItemLayout" extra="名称支持有序后缀占位符‘#’，用法举例，名称host##，数量2，创建后实例的名称依次为host01、host02，已有同名实例，序号顺延">
        <a-input v-decorator="decorators.name" :placeholder="$t('validator.serverName')" />
      </a-form-item>
      <a-form-item label="申请原因" v-bind="formItemLayout" v-if="isOpenWorkflow">
        <a-input v-decorator="decorators.reason" placeholder="请输入主机申请原因" />
      </a-form-item>
      <a-form-item class="mb-0" label="计费方式" v-bind="formItemLayout">
        <bill :decorators="decorators.bill" />
      </a-form-item>
      <a-form-item label="数量" v-show="!isServertemplate" v-bind="formItemLayout">
        <a-input-number v-decorator="decorators.count" :min="1" :max="10" />
      </a-form-item>
      <!-- <a-form-item class="mb-0" label="资源池" v-bind="formItemLayout">
        <resource :decorator="decorators.resourceType" />
      </a-form-item> -->
      <a-form-item v-if="hypervisor === 'kvm'" v-bind="formItemLayout" label="是否配置GPU" extra="目前只有KVM支持GPU云服务器">
        <gpu :decorators="decorators.gpu" :gpu-options="gpuOptions" />
      </a-form-item>
      <a-form-item label="CPU核数" v-bind="formItemLayout" class="mb-0">
        <cpu-radio :decorator="decorators.vcpu" :options="form.fi.cpuMem.cpus || []" @change="cpuChange" />
      </a-form-item>
      <a-form-item label="内存" v-bind="formItemLayout" class="mb-0">
        <mem-radio :decorator="decorators.vmem" :options="form.fi.cpuMem.mems_mb || []" />
      </a-form-item>
      <area-selects
        v-if="showAreaSelect"
        v-bind="formItemLayout"
        :cityParams="cityParams"
        :providerParams="providerParams"
        :cloudregionParams="cloudregionParams"
        :zoneParams="zoneParams"
        :defaultActiveFirstOption="['city']"
        @providerFetchSuccess="providerFetchSuccess" />
      <a-form-item label="套餐" v-bind="formItemLayout">
        <sku
          v-decorator="decorators.sku"
          :type="type"
          :sku-params="skuParam"
          :hypervisor="hypervisor" />
      </a-form-item>
      <a-form-item v-bind="formItemLayout" label="操作系统" extra="操作系统会根据选择的虚拟化平台和可用区域的变化而变化，公共镜像的维护请联系管理员">
        <os-select
          :type="type"
          :hypervisor="hypervisor"
          :image-params="imageParams"
          :decorator="decorators.imageOS"
          :cacheImageParams="cacheImageParams" />
      </a-form-item>
      <a-form-item label="系统磁盘" v-bind="formItemLayout" class="mb-0">
        <system-disk
          v-if="form.fd.sku"
          :decorator="decorators.systemDisk"
          :type="type"
          :hypervisor="hypervisor"
          :sku="form.fd.sku"
          :capability-data="form.fi.capability"
          :image="form.fi.imageMsg" />
      </a-form-item>
      <a-form-item label="数据盘" v-bind="formItemLayout">
        <data-disk
          v-if="form.fd.sku"
          :decorator="decorators.dataDisk"
          :type="type"
          :hypervisor="hypervisor"
          :sku="form.fd.sku"
          :capability-data="form.fi.capability"
          ref="dataDiskRef" />
      </a-form-item>
      <a-form-item label="管理员密码" v-bind="formItemLayout">
        <server-password :decorator="decorators.loginConfig" :loginTypes="loginTypes" />
      </a-form-item>
      <a-form-item label="网络" v-bind="formItemLayout" class="mb-0">
        <server-network
          :decorator="decorators.network"
          :network-list-params="networkParam"
          :schedtag-params="params.schedtag" />
      </a-form-item>
      <a-form-item label="标签" v-bind="formItemLayout" class="mb-0">
        <tag
          v-decorator="decorators.tag" />
      </a-form-item>
      <a-divider orientation="left">高级配置</a-divider>
      <a-form-item label="弹性公网IP" v-bind="formItemLayout">
        <eip-config
          :decorators="decorators.eip"
          :eip-params="eipParams"
          :hypervisor="hypervisor" />
      </a-form-item>
      <a-form-item label="安全组" v-bind="formItemLayout">
        <secgroup-config
          :decorators="decorators.secgroup"
          :secgroup-params="secgroupParams"
          :hypervisor="hypervisor" />
      </a-form-item>
      <a-form-item label="调度策略" v-show="!isServertemplate" v-bind="formItemLayout" class="mb-0">
        <sched-policy
          :server-type="form.fi.createType"
          :disabled-host="policyHostDisabled"
          :policy-host-params="policyHostParams"
          :decorators="decorators.schedPolicy"
          :policy-schedtag-params="params.policySchedtag" />
      </a-form-item>
      <bottom-bar
        :loading="submiting"
        :form="form"
        :errors.sync="errors"
        :type="type"
        :resourceType="form.fd.resourceType"
        :dataDiskSizes="dataDiskSizes"
        :isOpenWorkflow="isOpenWorkflow"
        :isServertemplate="isServertemplate" />
    </a-form>
  </div>
</template>
<script>
import * as R from 'ramda'
import Bill from '@Compute/sections/Bill'
import { RESOURCE_TYPES_MAP, LOGIN_TYPES_MAP } from '@Compute/constants'
import EipConfig from '@Compute/sections/EipConfig'
import SecgroupConfig from '@Compute/sections/SecgroupConfig'
import mixin from './mixin'
import { resolveValueChangeField } from '@/utils/common/ant'
import { PROVIDER_MAP, HYPERVISORS_MAP } from '@/constants'
import { IMAGES_TYPE_MAP } from '@/constants/compute'
import AreaSelects from '@/sections/AreaSelects'

export default {
  name: 'VMPublicCreate',
  components: {
    Bill,
    AreaSelects,
    EipConfig,
    SecgroupConfig,
  },
  mixins: [mixin],
  data () {
    return {
      instanceSpecParams: {
        public_cloud: true,
        usable: true,
        enabled: true,
      },
    }
  },
  computed: {
    showAreaSelect () {
      if (this.$store.getters.isAdminMode && this.$store.getters.l3PermissionEnable) {
        if (this.form.fd.domain && this.form.fd.domain.key) {
          return true
        } else {
          return false
        }
      }
      return true
    },
    networkParam () {
      return {
        filter: 'server_type.notin(ipmi, pxe)',
        usable: true,
        ...this.skuCloudregionZone,
        ...this.scopeParams,
      }
    },
    cityParams () {
      return {
        usable: true,
        public_cloud: true,
        ...this.scopeParams,
      }
    },
    providerParams () {
      return {
        usable: true,
        ...this.scopeParams,
      }
    },
    cloudregionParams () {
      return {
        cloud_env: 'public',
        usable: true,
        show_emulated: true,
        ...this.scopeParams,
      }
    },
    zoneParams () {
      return {
        cloud_env: 'public',
        usable: true,
        show_emulated: true,
        order_by: 'created_at',
        order: 'asc',
        ...this.scopeParams,
      }
    },
    imageParams () {
      const params = {}
      if (this.form.fd.imageType === IMAGES_TYPE_MAP.public_customize.key) {
        if (R.is(Object, this.form.fd.sku)) {
          if (this.skuCloudregionZone.zone) {
            params.zone = this.skuCloudregionZone.zone
          } else if (this.skuCloudregionZone.cloudregion) {
            params.cloudregion = this.skuCloudregionZone.cloudregion
          }
        }
        if (!params.zone && !params.region) {
          return {}
        }
      }
      return params
    },
    cacheImageParams () {
      const params = {}
      if (R.is(Object, this.form.fd.sku)) {
        if (this.skuCloudregionZone.zone) {
          params.zone = this.skuCloudregionZone.zone
        } else if (this.skuCloudregionZone.cloudregion) {
          params.cloudregion = this.skuCloudregionZone.cloudregion
        }
      }
      return params
    },
    eipParams () {
      return {
        project: this.project,
        region: this.skuCloudregionZone.cloudregion,
      }
    },
    skuParam () {
      const params = {
        public_cloud: true,
        limit: 0,
        cpu_core_count: this.form.fd.vcpu || this.decorators.vcpu[1].initialValue,
        memory_size_mb: this.form.fd.vmem,
        usable: true,
        enabled: true,
        ...this.scopeParams,
        city: this.form.fd.city,
      }
      if (this.form.fd.cloudregion) params.cloudregion = this.form.fd.cloudregion
      if (this.form.fd.zone) params.zone_id = this.form.fd.zone
      const { provider } = this.form.fd
      if (provider) {
        params.provider = PROVIDER_MAP[provider] ? PROVIDER_MAP[provider].hypervisor : provider
      } else {
        const { providerList } = this.form.fi
        if (providerList && providerList.length) {
          const providers = providerList.map(item => item.name)
          params.filter = `provider.in(${providers.join(',')})`
        }
      }
      if (this.form.fd.billType === 'quantity') {
        params['postpaid_status'] = 'available'
      } else if (this.form.fd.billType === 'package') {
        params['prepaid_status'] = 'available'
      }
      return params
    },
    policyHostParams () {
      const params = {
        show_emulated: true,
        resource_type: 'shared',
        enabled: 1,
        usable: true,
        limit: 0,
      }
      if (this.skuCloudregionZone.zone) {
        params.zone = this.skuCloudregionZone.zone
        if (this.form.fd.resourceType !== RESOURCE_TYPES_MAP.prepaid.key) {
          if (!params.zone) {
            params.cloudregion = this.skuCloudregionZone.cloudregion
          }
        }
      }
      if (!params.zone && !params.cloudregion) {
        return // 此时将不请求接口
      }
      return params
    },
    hypervisor () {
      if (R.is(Object, this.form.fd.sku)) {
        const { provider } = this.form.fd.sku
        if (provider) {
          return PROVIDER_MAP[provider].hypervisor
        }
      }
      return ''
    },
    loginTypes () {
      const loginTypes = { ...LOGIN_TYPES_MAP }
      const hypervisor = this.hypervisor
      if (HYPERVISORS_MAP.ucloud.key === hypervisor) {
        delete loginTypes[LOGIN_TYPES_MAP.image.key]
        delete loginTypes[LOGIN_TYPES_MAP.keypair.key]
      }
      if (HYPERVISORS_MAP.aws.key === hypervisor) {
        delete loginTypes[LOGIN_TYPES_MAP.random.key]
        delete loginTypes[LOGIN_TYPES_MAP.password.key]
      }
      if (HYPERVISORS_MAP.azure.key === hypervisor) {
        delete loginTypes[LOGIN_TYPES_MAP.image.key]
      }
      if (this.form.fi.imageMsg.os_type === 'Windows') {
        // 以下平台在选择 windows 镜像时禁用关联密钥
        const disableKeypairHyper = [
          HYPERVISORS_MAP.azure.key,
          HYPERVISORS_MAP.aliyun.key,
          HYPERVISORS_MAP.qcloud.key,
          HYPERVISORS_MAP.esxi.key,
        ]
        if (disableKeypairHyper.includes(hypervisor)) {
          delete loginTypes[LOGIN_TYPES_MAP.keypair.value]
        }
      }
      if (this.isServertemplate) {
        delete loginTypes[LOGIN_TYPES_MAP.password.key]
      }
      return Object.keys(loginTypes)
    },
    instanceSpecParmas () {
      return {
        usable: true,
        enabled: true,
        public_cloud: true,
      }
    },
  },
  created () {
    this.$bus.$on('VMInstanceCreateUpdateFi', this.updateFi, this)
    this.fetchInstanceSpecs()
    this.baywatch(['form.fd.resourceType', 'form.fd.sku'], (val, oldVal) => {
      if (val && !R.equals(val, oldVal)) {
        this.fetchCapability()
      }
    })
  },
  methods: {
    providerFetchSuccess (providerList) {
      this.form.fi.providerList = providerList
    },
    onValuesChange (vm, changedFields) {
      this.$nextTick(() => {
        const formValue = this.form.fc.getFieldsValue()
        const newField = resolveValueChangeField(changedFields)
        this._setNewFieldToFd(newField, formValue)
      })
    },
    fetchCapability () {
      const params = {
        show_emulated: true,
        ...this.scopeParams,
        resource_type: this.form.fc.getFieldValue('resourceType'),
      }
      const { sku } = this.form.fd
      if (!R.is(Object, sku)) return
      const { zone_id: zoneId, cloudregion_id: cloudregionId } = sku
      let id = ''
      if (this.form.fd.resourceType === RESOURCE_TYPES_MAP.shared.value && !zoneId) {
        id = cloudregionId
      } else {
        id = zoneId
      }
      if (!id) return
      this.zoneM.getSpecific({ id, spec: 'capability', params })
        .then(({ data }) => {
          this.form.fi.capability = data
        })
    },
    fetchInstanceSpecs () {
      this.serverskusM.get({ id: 'instance-specs', params: this.instanceSpecParams })
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
