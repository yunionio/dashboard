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
import Duration from '@Compute/sections/Duration'
import BottomBar from '../components/BottomBar'
import SystemDisk from '../components/SystemDisk'
import DataDisk from '../components/DataDisk'
import { Manager } from '@/utils/manager'
import CloudregionZone from '@/sections/CloudregionZone'
import HypervisorRadio from '@/sections/HypervisorRadio'
import DomainProject from '@/sections/DomainProject'
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
    DomainProject,
    Duration,
  },
  props: {
    type: {
      type: String,
      required: true,
      validator: val => ['idc', 'private', 'public'].includes(val),
    },
  },
  data () {
    this.initParams = new ControlParams(SERVER_TYPE[this.type])
    const decorators = new Decorator(SERVER_TYPE[this.type]).createDecorators()
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
          createType: SERVER_TYPE[this.type],
        },
        fd: initFd,
      },
      decorators,
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
    this.$bus.$on('VMInstanceCreateUpdateFi', this.updateFi, this)
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
        scope: this.$store.getters.scope,
        host_type: 'baremetal',
      }
      const { key } = this.form.fc.getFieldValue('zone')
      this.zoneM.getSpecific({ id: key, spec: 'capability', params })
        .then(({ data }) => {
          this.form.fi.capability = {
            ...data,
            hypervisors: data.hypervisors.filter(val => val !== 'baremetal'),
          }
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
