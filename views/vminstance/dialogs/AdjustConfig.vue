<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{action}}</div>
    <div slot="body">
      <a-alert class="mb-2" type="warning" v-if="tips">
        <div slot="message">
          {{ tips }}
        </div>
      </a-alert>
      <dialog-selected-tips :count="params.data.length" :action="action" />
      <vxe-grid class="mb-2" :data="params.data" :columns="columns" />
      <a-form
        :form="form.fc">
        <a-form-item label="CPU核数" v-bind="formItemLayout" class="mb-0">
          <cpu-radio :decorator="decorators.vcpu" :options="form.fi.cpuMem.cpus || []" :disable-options="disableCpus" @change="cpuChange" />
        </a-form-item>
        <a-form-item label="内存" v-bind="formItemLayout" class="mb-0">
          <mem-radio :decorator="decorators.vmem" :options="form.fi.cpuMem.mems_mb || []" :disable-options="disableMems" />
        </a-form-item>
        <a-form-item label="套餐" v-bind="formItemLayout">
          <sku
            v-decorator="decorators.sku"
            :type="type"
            :sku-params="skuParam"
            :hypervisor="hypervisor" />
        </a-form-item>
        <a-form-item label="数据盘" v-bind="formItemLayout">
          <data-disk
            v-if="hypervisor && form.fi.capability.storage_types"
            ref="dataDiskRef"
            :decorator="decorators.dataDisk"
            :type="type"
            :hypervisor="hypervisor"
            :capability-data="form.fi.capability"
            :sku="form.fd.sku"
            :image="form.fi.imageMsg" />
        </a-form-item>
        <a-form-item label="申请原因" v-bind="formItemLayout" v-if="isOpenWorkflow">
          <a-input v-decorator="decorators.reason" placeholder="请输入申请原因" />
        </a-form-item>
        <a-form-item label="自动启动" v-bind="formItemLayout" extra="调整配置后是否自动启动">
          <a-switch v-decorator="decorators.autoStart" :disabled="isSomeRunning" />
        </a-form-item>
      </a-form>
    </div>
    <div slot="footer">
      <a-button type="primary" @click="handleConfirm" :loading="loading">{{ $t('dialog.ok') }}</a-button>
      <a-button @click="cancelDialog">{{ $t('dialog.cancel') }}</a-button>
    </div>
  </base-dialog>
</template>

<script>
import { mapGetters } from 'vuex'
import * as R from 'ramda'
import CpuRadio from '@Compute/sections/CpuRadio'
import MemRadio from '@Compute/sections/MemRadio'
import DataDisk from '@Compute/sections/DataDisk'
import sku from '@Compute/sections/SKU'
import { SERVER_TYPE } from '@Compute/constants'
import { Manager } from '@/utils/manager'
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'
import WorkflowMixin from '@/mixins/workflow'
import { HYPERVISORS_MAP } from '@/constants'
import { findPlatform } from '@/utils/common/hypervisor'
import { isRequired } from '@/utils/validate'

export default {
  name: 'VmAdjustConfigDialog',
  components: {
    CpuRadio,
    MemRadio,
    sku,
    DataDisk,
  },
  mixins: [DialogMixin, WindowsMixin, WorkflowMixin],
  provide () {
    return {
      form: this.form,
    }
  },
  data () {
    function diskValidator (rule, value, callback) {
      if (R.isNil(value) || R.isEmpty(value)) {
        return callback(new Error('请填写合法的路径'))
      }
      if (!value.startsWith('/')) {
        return callback(new Error('路径必须以 / 开头'))
      }
      if (value === '/') {
        return callback(new Error('不能挂载到 / 目录下'))
      }
      callback()
    }
    const itemData = this.params.data[0]
    return {
      loading: false,
      action: '调整配置',
      form: {
        fc: this.$form.createForm(this, {
          onValuesChange: this.onValuesChange,
        }),
        fd: {
          vcpu: 2,
          vmem: 2048,
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
              { required: true, message: '请选择套餐' },
            ],
          },
        ],
        dataDisk: {
          type: i => [
            `dataDiskTypes[${i}]`,
            {
              rules: [
                { validator: isRequired(), message: '请选择磁盘类型' },
              ],
            },
          ],
          size: i => [
            `dataDiskSizes[${i}]`,
            {
              rules: [
                { required: true, message: '请输入磁盘大小' },
              ],
            },
          ],
          schedtag: i => [
            `dataDiskSchedtags[${i}]`,
            {
              validateTrigger: ['change', 'blur'],
              rules: [{
                required: true,
                message: '请选择调度标签',
              }],
            },
          ],
          policy: i => [
            `dataDiskPolicys[${i}]`,
            {
              validateTrigger: ['blur', 'change'],
              rules: [{
                required: true,
                message: '请选择调度标签',
              }],
            },
          ],
          snapshot: i => [
            `dataDiskSnapshots[${i}]`,
            {
              validateTrigger: ['blur', 'change'],
              rules: [{
                required: true,
                message: '请选择快照',
              }],
            },
          ],
          filetype: i => [
            `dataDiskFiletypes[${i}]`,
            {
              validateTrigger: ['blur', 'change'],
              rules: [{
                required: true,
                message: '请选择文件系统',
              }],
            },
          ],
          mountPath: i => [
            `dataDiskMountPaths[${i}]`,
            {
              validateTrigger: ['blur', 'change'],
              rules: [{
                required: true,
                message: '请填写挂载点',
              }, {
                validator: diskValidator,
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
            initialValue: true,
          },
        ],
      },
      formItemLayout: {
        wrapperCol: {
          span: 21,
        },
        labelCol: {
          span: 3,
        },
      },
    }
  },
  computed: {
    ...mapGetters(['scope', 'userInfo']),
    selectedItems () {
      return this.params.data
    },
    selectedItem () {
      return this.params.data[0]
    },
    isSomeRunning () {
      return this.params.data.some(val => val.status === 'running')
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
        return '提示：所选云服务器中部分不支持在开机状态下调整CPU和内存'
      }
      if ([HYPERVISORS_MAP.kvm.hypervisor, HYPERVISORS_MAP.azure.hypervisor].includes(this.hypervisor)) {
        return '提示：开机调整配置时CPU和内存的大小只能往上调整'
      }
      return ''
    },
    type () {
      const brand = this.selectedItem.brand
      return findPlatform(brand)
    },
    skuParam () {
      let params = {
        limit: 0,
        usable: true,
        enable: true,
        cpu_core_count: this.form.fd.vcpu || this.decorators.vcpu[1].initialValue,
        memory_size_mb: this.form.fd.vmem,
      }
      if (this.type === SERVER_TYPE.private) {
        params.provider = HYPERVISORS_MAP.kvm.provider
        params.public_cloud = false
        params['postpaid_status'] = 'available'
      }
      if (this.type === SERVER_TYPE.public) {
        params.public_cloud = true
        params.zone_id = this.selectedItem.zone_id
        if (this.selectedItem.billingMethods === 'quantity') {
          params['postpaid_status'] = 'available'
        } else if (this.selectedItem.billingMethods === 'package') {
          params['prepaid_status'] = 'available'
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
      const showFields = ['name', 'ip', 'instance_type', 'status']
      return this.params.columns.filter((item) => { return showFields.includes(item.field) })
    },
  },
  created () {
    this.serversManager = new Manager('servers', 'v2')
    this.zonesM2 = new Manager('zones', 'v2')
    this.serverskusM = new Manager('serverskus')
    this.fetchData()
    this.fetchInstanceSpecs()
  },
  methods: {
    fetchData () {
      let ids = []
      this.selectedItems.forEach((item) => {
        ids.push(item.id)
      })
      this.serversManager.batchGet({ id: ids })
        .then((res) => {
          this.loadData(res.data.data)
        })
    },
    async loadData (data) {
      this.data = data
      if (this.data.length === 1) {
        this.diskShow = true
        try {
          const { data } = await this.capability(this.data[0].zone_id)
          this.form.fi.capability = data
        } catch (error) {}
      } else {
        this.diskShow = false
      }
      let conf = this.maxConfig()
      this.form.fd.vcpu_count = conf[0]
      this.form.fd.vmem = Math.ceil(conf[1]) * 1024
      this.form.fd.datadisks = conf[2]
      this.beforeDataDisks = [ ...this.form.fd.datadisks ]

      this.$nextTick(() => {
        setTimeout(() => {
          this.form.fd.datadisks.forEach((v) => {
            this.$refs.dataDiskRef.add({ size: v.value, diskType: v.type, disabled: true, ...v })
          })
        }, 3000)
        this.form.fc.setFieldsValue({ vcpu: this.form.fd.vcpu_count, vmem: this.form.fd.vmem })
      })
    },
    maxConfig () {
      let cpu = 0
      let mem = 0
      let datadisks = []
      for (let i = 0; i < this.data.length; i++) {
        if (cpu < this.data[i].vcpu_count) {
          cpu = this.data[i].vcpu_count
        }
        if (mem < this.data[i].vmem_size) {
          mem = this.data[i].vmem_size
        }
        this.data[i].disks_info.forEach((item) => {
          if (item.disk_type !== 'sys' && item.index !== 0) {
            datadisks.push({ value: item.size / 1024, type: item.storage_type })
          }
        })
      }
      return [cpu, mem / 1024, datadisks]
    },
    async doChangeSettingsByWorkflowSubmit (values) {
      const params = {
        sku: values.sku.name,
        auto_start: values.autoStart,
      }
      const ids = this.params.data.map(item => item.id)
      params.disks = this.genDiskData(values)
      const datadisks = this.form.fd.datadisks.map((item) => { return item.value })
      let diskSize = 0
      if (datadisks && datadisks.length > 0) {
        diskSize = datadisks.reduce((sum, size) => { return sum + size })
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
            cpu: this.form.fd.vcpu_count,
            memory: this.form.fd.vmem,
            disk: +item.disk + (+diskSize - beforeDiskSize) * 1024,
          },
        }
      })
      params.project_id = this.userInfo.projectId
      params.domain = this.userInfo.projectDomainId
      let variables = {
        process_definition_key: this.WORKFLOW_TYPES.APPLY_SERVER_CHANGECONFIG,
        initiator: this.userInfo.id,
        paramter: JSON.stringify(params),
        ids: ids.join(','),
        serverConf: JSON.stringify(serverConf),
        description: values.reason,
      }
      await this.createWorkflow(variables)
      this.$message.success('主机调整配置请求流程已提交')
      this.$router.push('/workflow?type=me-process')
    },
    async doChangeSettingsSubmit (values) {
      const params = {
        sku: values.sku.name,
        auto_start: values.autoStart,
      }
      params.disks = this.genDiskData(values)
      const ids = this.params.data.map(item => item.id)
      return this.params.list.onManager('batchPerformAction', {
        id: ids,
        steadyStatus: ['running', 'ready'],
        managerArgs: {
          action: 'change-config',
          data: params,
        },
      })
    },
    async handleConfirm () {
      this.loading = true
      try {
        const values = await this.form.fc.validateFields()
        if (this.isOpenWorkflow) {
          await this.doChangeSettingsByWorkflowSubmit(values)
        } else {
          await this.doChangeSettingsSubmit(values)
        }
        this.loading = false
        this.cancelDialog()
      } catch (error) {
        this.loading = false
      }
    },
    cpuChange (cpu) {
      const memOpts = this.form.fi.cpuMem.cpu_mems_mb[cpu]
      this.form.fi.cpuMem.mems_mb = memOpts
      this.form.fc.setFieldsValue({
        vmem: memOpts[0],
      })
    },
    fetchInstanceSpecs () {
      const params = {
        usable: true,
        zone: this.selectedItem.zone_id,
        provider: this.selectedItem.provider === HYPERVISORS_MAP.esxi.provider ? HYPERVISORS_MAP.kvm.provider : this.selectedItem.provider,
      }
      if (this.type === SERVER_TYPE.private) {
        params.provider = HYPERVISORS_MAP.kvm.provider
        delete params.zone
      }
      if (this.type === SERVER_TYPE.public) {
        if (this.selectedItem.billingMethods === 'quantity') {
          params['postpaid_status'] = 'available'
        } else if (this.selectedItem.billingMethods === 'package') {
          params['prepaid_status'] = 'available'
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
        this.form.fd[key] = values[key]
      })
    },
    async capability (v) { // 可用区查询
      let params = {
        show_emulated: true,
      }
      if (this.isAdminMode) {
        params.scope = this.scope
      }
      return this.zonesM2.get({ id: `${v}/capability`, params })
    },
    genDiskData (values) {
      const dataDisk = []
      let index = 0
      R.forEachObjIndexed((value, key) => {
        const diskObj = {
          disk_type: 'data',
          index: ++index,
        }
        if (values.dataDiskSizes && values.dataDiskSizes[key]) {
          diskObj.size = values.dataDiskSizes[key] * 1024
        }
        if (values.dataDiskTypes && values.dataDiskTypes[key]) {
          diskObj.backend = values.dataDiskTypes[key].key
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
        dataDisk.push(diskObj)
      }, values.dataDiskSizes)
      return dataDisk
    },
  },
}
</script>
