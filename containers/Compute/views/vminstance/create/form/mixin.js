import * as R from 'ramda'
import { CreateServerForm, SCHED_POLICY_OPTIONS_MAP, SERVER_TYPE } from '@Compute/constants'
import OsSelect from '@Compute/sections/OsSelect'
import ServerPassword from '@Compute/sections/ServerPassword'
import CpuRadio from '@Compute/sections/CpuRadio'
import MemRadio from '@Compute/sections/MemRadio'
import sku from '@Compute/sections/SKU'
import gpu from '@Compute/sections/GPU/index'
import { Decorator, GenCreateData } from '@Compute/utils/createServer'
import ServerNetwork from '@Compute/sections/ServerNetwork'
import SchedPolicy from '@Compute/sections/SchedPolicy'
import Bios from '@Compute/sections/BIOS'
import Backup from '@Compute/sections/Backup'
import Duration from '@Compute/sections/Duration'
import InstanceGroups from '@Compute/sections/InstanceGroups'
import DataDisk from '@Compute/sections/DataDisk'
import BottomBar from '../components/BottomBar'
import SystemDisk from '../components/SystemDisk'
import { Manager } from '@/utils/manager'
import CloudregionZone from '@/sections/CloudregionZone'
import HypervisorRadio from '@/sections/HypervisorRadio'
import DomainProject from '@/sections/DomainProject'
import { getInitialValue } from '@/utils/common/ant'

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
    InstanceGroups,
  },
  props: {
    type: {
      type: String,
      required: true,
      validator: val => ['idc', 'private', 'public'].includes(val),
    },
  },
  data () {
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
        fc: this.$form.createForm(this, { onValuesChange: this.onValuesChange }),
        fi: { // formInfo 存储着和表单相关的数据
          capability: {}, // 可用区下的可用资源
          imageMsg: {}, // 当前选中的 image
          cpuMem: {}, // cpu 和 内存 的关联关系
          createType: SERVER_TYPE[this.type],
          dataDiskDisabled: false, // 数据盘是否禁用
          sysDiskDisabled: false, // 系统盘是否禁用
        },
        fd: initFd,
      },
      decorators,
      params: {
        schedtag: { resource_type: 'networks' },
        policySchedtag: { limit: 0, 'filter.0': 'resource_type.equals(hosts)' },
      },
    }
  },
  provide () {
    return {
      form: this.form,
    }
  },
  computed: {
    project_domain () {
      return this.form.fd.domain ? this.form.fd.domain.key : this.$store.getters.userInfo.projectDomainId
    },
    project () {
      return this.form.fd.project ? this.form.fd.project.key : this.$store.getters.userInfo.projectId
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
    dataDiskSizes () {
      const disk = this.form.fd.dataDiskSizes
      return R.is(Object, disk) ? Object.values(disk) : []
    },
    secgroupParams () {
      return {
        tenant: this.project,
      }
    },
  },
  created () {
    this.$bus.$on('VMInstanceCreateUpdateFi', this.updateFi, this)
    this.zoneM = new Manager('zones')
    this.serverM = new Manager('servers')
    this.serverskusM = new Manager('serverskus')
    this.schedulerM = new Manager('schedulers', 'v1')
  },
  watch: {
    'form.fi.imageMsg': {
      deep: true,
      handler (val, oldVal) {
        if (R.equals(val, oldVal)) return
        this.$nextTick(() => {
          this._resetDataDisk() // 重置数据盘数据
        })
      },
    },
  },
  methods: {
    baywatch (props, watcher) {
      const iterator = function (prop) {
        this.$watch(prop, watcher)
      }
      props.forEach(iterator, this)
    },
    updateFi (fiItems) { // 子组件更新fi
      if (R.is(Object, fiItems)) {
        R.forEachObjIndexed((item, key) => {
          this.$set(this.form.fi, key, item)
        }, fiItems)
      }
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
    cpuChange (cpu) {
      const memOpts = this.form.fi.cpuMem.cpu_mems_mb[cpu]
      this.form.fi.cpuMem.mems_mb = memOpts
      this.form.fc.setFieldsValue({
        vmem: memOpts[0],
      })
    },
    _resetDataDisk () { // 重置数据盘
      const formValue = this.form.fc.getFieldsValue()
      if (formValue.dataDiskSizes) {
        const dataDiskKeys = Object.keys(formValue.dataDiskSizes)
        dataDiskKeys.forEach(key => this.$refs.dataDiskRef.decrease(key))
      }
    },
    _setNewFieldToFd (newField, formValue) { // vue-ant-form change 后赋值 fd
      const changeKeys = Object.keys(newField)
      R.forEachObjIndexed((item, key) => {
        this.$set(this.form.fd, key, item)
      }, newField)
      if (changeKeys.some(val => val.includes('dataDiskSizes'))) { // 动态赋值默认值的表单需要单独处理
        this.$set(this.form.fd, 'dataDiskSizes', formValue.dataDiskSizes)
      }
    },
  },
}
