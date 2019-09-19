<template>
  <div class="baremetal-create-form">
    <page-header title="新建本地IDC服务器" />
    <a-form
      class="mt-3"
      :form="form.fc"
      @submit="submit">
      <a-divider orientation="left">基础配置</a-divider>
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
        <os-select :image-params="params.image" :decorator="decorators.imageOS" />
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
          :is-public="isPublic"
          :sku-params="skuParam"
          :hypervisor="form.fd.hypervisor" />
      </a-form-item>
      <a-form-item label="系统磁盘" v-bind="formItemLayout" class="mb-0">
        <system-disk
          v-if="form.fd.hypervisor"
          :decorator="decorators.systemDisk"
          :is-public="false"
          :isIDC="true"
          :hypervisor="form.fd.hypervisor"
          :sku="form.fd.sku"
          :capability-data="form.fi.capability"
          :image="form.fi.imageMsg" />
      </a-form-item>
      <a-form-item label="数据盘" v-bind="formItemLayout">
        <data-disk
          v-if="form.fd.hypervisor"
          :decorator="decorators.dataDisk"
          :is-public="false"
          :isIDC="true"
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
import _ from 'lodash'
import * as R from 'ramda'
import { CreateServerForm, SCHED_POLICY_OPTIONS_MAP, SERVER_TYPE } from '@Compute/constants'
import OsSelect from '@Compute/sections/OsSelect'
import ServerPassword from '@Compute/sections/ServerPassword'
import CpuRadio from '@Compute/sections/CpuRadio'
import MemRadio from '@Compute/sections/MemRadio'
import sku from '@Compute/sections/SKU'
import gpu from '@Compute/sections/GPU/index'
import { ControlParams, Decorator, GenCreateData } from '@Compute/utils/createServer'
import ServerNetwork from '@Compute/sections/ServerNetwork'
import SchedPolicy from '@Compute/sections/SchedPolicy'
import Bios from '@Compute/sections/BIOS'
import Backup from '@Compute/sections/Backup'
import BottomBar from './components/BottomBar'
import SystemDisk from './components/SystemDisk'
import DataDisk from './components/DataDisk'
import { Manager } from '@/utils/manager'
import CloudregionZone from '@/sections/CloudregionZone'
import HypervisorRadio from '@/sections/HypervisorRadio'
import { resolveChangeField, getInitialValue } from '@/utils/common/ant'

export default {
  name: 'IDCCreate',
  components: {
    OsSelect,
    CloudregionZone,
    BottomBar,
    ServerPassword,
    HypervisorRadio,
    CpuRadio,
    MemRadio,
    sku,
    ServerNetwork,
    SystemDisk,
    DataDisk,
    gpu,
    SchedPolicy,
    Bios,
    Backup,
  },
  data () {
    this.initParams = new ControlParams(SERVER_TYPE.idc)
    const decorators = new Decorator(SERVER_TYPE.idc).createDecorators()
    const initFd = getInitialValue(decorators)
    return {
      submiting: false,
      errors: [],
      formItemLayout: {
        wrapperCol: { span: CreateServerForm.wrapperCol },
        labelCol: { span: CreateServerForm.labelCol },
      },
      form: {
        fc: this.$form.createForm(this, { onFieldsChange: this.onFieldsChange }),
        fi: { // formInfo 存储着和表单相关的数据
          capability: {}, // 可用区下的可用资源
          imageMsg: {}, // 当前选中的 image
          cpuMem: {}, // cpu 和 内存 的关联关系
          createType: SERVER_TYPE.idc,
        },
        fd: initFd,
      },
      decorators,
      isPublic: false, // !!! 暂时写死
      params: {
        cloudregion: this.initParams.params.cloudregion,
        image: this.initParams.params.image,
        schedtag: this.initParams.params.schedtag,
        policySchedtag: this.initParams.params.policySchedtag,
      },
    }
  },
  provide () {
    return {
      form: this.form,
    }
  },
  computed: {
    policyHostParams () {
      return {
        enabled: 1,
        usable: true,
        zone: this.form.fd.zone.key,
        hypervisor: this.form.fd.hypervisor,
      }
    },
    showSku () {
      return this.form.fd.hypervisor && this.form.fd.vcpu && this.form.fd.vmem
    },
    skuParam () {
      return {
        ...this.initParams.params.sku,
        cpu_core_count: this.form.fd.vcpu || this.decorators.vcpu[1].initialValue,
        memory_size_mb: this.form.fd.vmem,
        cloudregion: _.get(this.form, 'fd.cloudregion.key'),
        // project_domain: 暂不支持
      }
    },
    networkParam () {
      return {
        ...this.initParams.params.network,
        zone: _.get(this.form, 'fd.zone.key'),
      }
    },
    gpuOptions () {
      const specs = this.form.fi.capability.specs || {}
      const data = specs.isolated_devices || {}
      const ret = []
      for (const key in data) {
        if (data.hasOwnProperty(key)) {
          const item = data[key]
          ret.push({
            ...item,
            key: `vendor=${item.vendor}:${item.model}`,
            label: `${item.vendor}/${item.model}`,
          })
        }
      }
      return ret
    },
    backupDisableds () { // 高可用判断哪些宿主机可用
      if (this.form.fd.schedPolicyType === SCHED_POLICY_OPTIONS_MAP.host.key) {
        return [this.form.fd.schedPolicyHost]
      }
      return []
    },
    policyHostDisabled () {
      if (this.form.fd.backupEnable) {
        return [this.form.fd.backup]
      }
      return []
    },
  },
  created () {
    this.$bus.$on('updateFi', this.updateFi, this)
    this.zoneM = new Manager('zones')
    this.serverM = new Manager('servers')
    this.serverskusM = new Manager('serverskus')
    this.schedulerM = new Manager('schedulers', 'v1')
  },
  methods: {
    updateFi (fiItems) { // 子组件更新fi
      if (R.is(Object, fiItems)) {
        R.forEachObjIndexed((item, key) => {
          this.$set(this.form.fi, key, item)
        }, fiItems)
      }
    },
    onFieldsChange (vm, changedFields) {
      const newField = resolveChangeField(changedFields)
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
      R.forEachObjIndexed((item, key) => {
        this.$set(this.form.fd, key, item)
      }, newField)
    },
    submit (e) {
      e.preventDefault()
      this.validateForm()
        .then(formData => {
          const genCreateData = new GenCreateData(formData, this.form.fi)
          const data = genCreateData.all()
          this.submiting = true
          this.schedulerM.rpc({ methodname: 'DoForecast', params: data })
            .then(res => {
              if (res.data.can_create) {
                this.createServer(data)
              } else {
                this.errors = genCreateData.getForecastErrors(res.data)
              }
              this.submiting = false
            })
            .catch(err => {
              this.$message.error(`创建失败: ${err}`)
              this.submiting = false
            })
        })
    },
    createServer (data) {
      delete data['vcpu_count']
      delete data['vmem_size']
      this.serverM.create({ data })
        .then(res => {
          // storage.set(`${state.fi.createType}${SELECT_IMAGE_KEY_SUFFIX}`, state.fd.image)
          this.submiting = false
          this.$message.success('操作成功，开始创建')
          this.$router.push('/vminstance')
        })
        .catch(() => {
          this.submiting = false
        })
    },
    validateForm () {
      return new Promise((resolve, reject) => {
        this.form.fc.validateFields((err, values) => {
          if (!err) {
            resolve(values)
          } else {
            reject(err)
          }
        })
      })
    },
    fetchCapability () {
      const params = {
        show_emulated: true,
        resource_type: 'shared',
        scope: this.$store.getters.$scope,
        host_type: 'baremetal',
      }
      const { key } = this.form.fc.getFieldValue('zone')
      this.zoneM.getSpecific({ id: key, spec: 'capability', params })
        .then(({ data }) => {
          this.form.fi.capability = data
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
    cpuChange (cpu) {
      const memOpts = this.form.fi.cpuMem.cpu_mems_mb[cpu]
      this.form.fi.cpuMem.mems_mb = memOpts
      this.form.fc.setFieldsValue({
        vmem: memOpts[0],
      })
    },
  },
}
</script>

<style lang="scss" scoped>
.baremetal-create-form {
  padding-bottom: 50px;
}
</style>
