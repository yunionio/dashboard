import * as R from 'ramda'
import _ from 'lodash'
import BottomBar from '../components/BottomBar'
import Servertemplate from '../components/Servertemplate'
import SystemDisk from '../components/SystemDisk'
import Tag from '../components/Tag'
import { SCHED_POLICY_OPTIONS_MAP, SERVER_TYPE, SELECT_IMAGE_KEY_SUFFIX, LOGIN_TYPES_MAP } from '@Compute/constants'
import OsSelect from '@Compute/sections/OsSelect'
import ServerPassword from '@Compute/sections/ServerPassword'
import CpuRadio from '@Compute/sections/CpuRadio'
import MemRadio from '@Compute/sections/MemRadio'
import sku from '@Compute/sections/SKU'
import gpu from '@Compute/sections/GPU/index'
import { Decorator, GenCreateData } from '@Compute/utils/createServer'
import ServerNetwork from '@Compute/sections/ServerNetwork'
import ServerAccount from '@Compute/sections/ServerAccount'
import SchedPolicy from '@Compute/sections/SchedPolicy'
import Bios from '@Compute/sections/BIOS'
import Backup from '@Compute/sections/Backup'
import Duration from '@Compute/sections/Duration'
import InstanceGroups from '@Compute/sections/InstanceGroups'
import DataDisk from '@Compute/sections/DataDisk'
import storage from '@/utils/storage'
import { WORKFLOW_TYPES } from '@/constants/workflow'
import workflowMixin from '@/mixins/workflow'
import { Manager } from '@/utils/manager'
import { isSuccess } from '@/utils/http'
import NameRepeated from '@/sections/NameRepeated'
import CloudregionZone from '@/sections/CloudregionZone'
import HypervisorRadio from '@/sections/HypervisorRadio'
import DomainProject from '@/sections/DomainProject'
import { getInitialValue } from '@/utils/common/ant'
import { IMAGES_TYPE_MAP } from '@/constants/compute'
import i18n from '@/locales'

const CreateServerForm = {
  wrapperCol: {
    md: { span: 18 },
    xl: { span: 20 },
    xxl: { span: 22 },
  },
  labelCol: {
    md: { span: 6 },
    xl: { span: 4 },
    xxl: { span: 2 },
  },
}

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
    Tag,
    Servertemplate,
    NameRepeated,
    ServerAccount,
  },
  mixins: [workflowMixin],
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
      errors: {},
      formItemLayout: {
        wrapperCol: CreateServerForm.wrapperCol,
        labelCol: CreateServerForm.labelCol,
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
          cpuDisabled: false,
          memDisabled: false,
        },
        fd: { ...initFd, os: '' },
      },
      decorators,
      capabilityParams: {}, // 防止 capability 反复调用，这里对当前的接口参数做记录
      price: null,
      collapseActive: [],
    }
  },
  provide () {
    return {
      form: this.form,
    }
  },
  computed: {
    isServertemplate () { // 主机模板
      return this.$route.query.source === 'servertemplate'
    },
    loginTypes () { // 主机模板隐藏手工输入密码
      const maps = R.clone(LOGIN_TYPES_MAP)
      if (this.isWindows) {
        delete maps.keypair
      }
      const loginTypes = Object.keys(maps)
      // if (this.isServertemplate) {
      //   return loginTypes.filter(val => (val !== LOGIN_TYPES_MAP.password.key && val !== LOGIN_TYPES_MAP.keypair.key))
      // }
      return loginTypes
    },
    project_domain () {
      return this.form.fd.domain ? this.form.fd.domain.key : this.$store.getters.userInfo.projectDomainId
    },
    project () {
      return this.form.fd.project ? this.form.fd.project.key : this.$store.getters.userInfo.projectId
    },
    scopeParams () {
      if (this.$store.getters.isAdminMode) {
        return {
          project_domain: this.project_domain,
        }
      }
      return { scope: this.$store.getters.scope }
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
      return this.scopeParams
    },
    isOpenWorkflow () {
      if (this.isServertemplate) return false
      return this.checkWorkflowEnabled(WORKFLOW_TYPES.APPLY_MACHINE)
    },
    isHostImageType () { // 镜像类型为主机镜像
      return this.form.fd.imageType === IMAGES_TYPE_MAP.host.key
    },
    isSnapshotImageType () { // 镜像类型为主机快照
      return this.form.fd.imageType === IMAGES_TYPE_MAP.snapshot.key
    },
    isDomainMode () {
      return this.$store.getters.isDomainMode
    },
    hasMeterService () { // 是否有计费的服务
      const { services } = this.$store.getters.userInfo
      const meterService = services.find(val => val.type === 'meter')
      if (meterService && meterService.status === true) {
        return true
      }
      return false
    },
    cloudregionZoneParams () {
      const params = {}
      if (this.type === 'public') { // 公有云
        if (R.is(Object, this.form.fd.sku)) {
          const cloudregion = this.form.fd.sku.cloudregion_id // 取 sku
          const zone = this.form.fd.zone // 取 areaSelect 组件
          if (cloudregion) params.cloudregion = cloudregion
          if (zone) params.zone = zone
        }
      } else { // 私有云和IDC取 CloudregionZone 组件
        const cloudregion = _.get(this.form.fd, 'cloudregion.key')
        const zone = _.get(this.form.fd, 'zone.key')
        if (cloudregion) params.cloudregion = cloudregion
        if (zone) params.zone = zone
      }
      return params
    },
    networkVpcParams () {
      const params = {
        // usable: true,
        limit: 0,
        // show_emulated: true,
        ...this.scopeParams,
      }
      return params
    },
    vpcResource () {
      if (R.is(String, this.cloudregionZoneParams.cloudregion)) return `cloudregions/${this.cloudregionZoneParams.cloudregion}/vpcs`
      return ''
    },
    schedtagParams () { // 网络里指定调度标签
      return {
        limit: 0,
        resource_type: 'networks',
        ...this.scopeParams,
      }
    },
    policySchedtagParams () { // 高级配置里面调度策略选择 指定调度标签
      return {
        limit: 0,
        'filter.0': 'resource_type.equals(hosts)',
        ...this.scopeParams,
      }
    },
    isWindows () {
      let isWindows = false
      const osType = (_.get(this.form.fi, 'imageMsg.info.properties.os_type') || '').toLowerCase()
      const os = (_.get(this.form.fd, 'os') || '').toLowerCase()
      if (~[osType, os].indexOf('windows')) {
        isWindows = true
      }
      return isWindows
    },
    osType () {
      return this.isWindows ? 'windows' : 'linux'
    },
    enableEip () {
      const externalAccessMode = _.get(this.form.fi, 'networkVpcObj.external_access_mode')
      if (externalAccessMode === 'none') return false // "eip-distgw" "eip" 是正常可以使用EIP的，"none"不可以
      return true
    },
  },
  created () {
    this.zoneM = new Manager('zones')
    this.serverM = new Manager('servers')
    this.servertemplateM = new Manager('servertemplates', 'v2')
    this.serverskusM = new Manager('serverskus')
    this.schedulerM = new Manager('schedulers', 'v1')
    this.$bus.$on('VMGetPrice', (price) => {
      this.price = price
    })
    this.$store.dispatch('app/fetchWorkflowEnabledKeys')
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
        .then(async formData => {
          this.submiting = true
          const genCreteData = new GenCreateData(formData, this.form.fi)
          if (this.isServertemplate) { // 创建主机模板
            this.doCreateServertemplate(genCreteData)
          } else if (this.isOpenWorkflow) { // 提交工单
            await this.checkCreateData(genCreteData)
            this.doForecast(genCreteData)
              .then(() => {
                this.doCreateWorkflow(genCreteData)
              })
          } else { // 创建主机
            await this.checkCreateData(genCreteData)
            this.doForecast(genCreteData)
              .then((data) => {
                this.createServer(data)
              })
          }
        })
        .catch(error => {
          this.submiting = false
          throw error
        })
    },
    doCreateServertemplate (genCreateData) {
      const data = genCreateData.all()
      const { project_id, ...rest } = data
      const templateData = {
        name: this.form.fc.getFieldValue('servertemplate_name'),
        project: project_id,
        content: {
          ...rest,
        },
      }
      this.submiting = true
      this.servertemplateM.create({ data: templateData })
        .then(() => {
          this.$message.success(i18n.t('compute.text_423'))
          this.$router.push('/servertemplate')
        })
        .catch((error) => {
          this.submiting = false
          throw error
        })
    },
    doCreateWorkflow (genCreateData) {
      const data = genCreateData.all()
      const variables = {
        process_definition_key: WORKFLOW_TYPES.APPLY_MACHINE,
        initiator: this.$store.getters.userInfo.id,
        description: this.form.fd.reason,
        'server-create-paramter': JSON.stringify(data),
        price: this.price,
      }
      this._getProjectDomainInfo(variables)
      this.submiting = true
      new this.$Manager('process-instances', 'v1')
        .create({ data: { variables } })
        .then(() => {
          this.$message.success(i18n.t('compute.text_1045', [data.generate_name]))
          this.$router.push('/workflow')
        })
        .catch((error) => {
          this.submiting = false
          throw error
        })
    },
    async checkCreateData (genCreateData) {
      try {
        const data = genCreateData.all()
        const res = new this.$Manager('servers').performAction({ id: 'check-create-data', action: '', data })
        return res
      } catch (error) {
        this.submiting = false
        throw error
      }
    },
    doForecast (genCreateData) {
      const data = genCreateData.all()
      this.submiting = true
      return new Promise((resolve, reject) => {
        this.schedulerM.rpc({ methodname: 'DoForecast', params: data })
          .then(res => {
            if (res.data.can_create) {
              resolve(data)
            } else {
              this.errors = genCreateData.getForecastErrors(res.data)
              this.submiting = false
              reject(this.errors)
            }
          })
          .catch(err => {
            this.$message.error(i18n.t('compute.text_321', [err]))
            this.submiting = false
            reject(err)
          })
      })
    },
    createServer (data) {
      delete data.vcpu_count
      delete data.vmem_size
      return this.serverM.create({ data })
        .then(res => {
          if (R.is(Array, data.disks)) {
            const imageObj = data.disks.find(val => val.disk_type === 'sys')
            if (R.is(Object, imageObj)) {
              const image = imageObj.image_id
              storage.set(`${this.form.fi.createType}${SELECT_IMAGE_KEY_SUFFIX}`, `${this.form.fd.os}:${image}`)
            }
          }
          if (isSuccess(res)) {
            this.$message.success(i18n.t('compute.text_322'))
          }
          this.$router.push('/vminstance')
        })
        .catch(error => {
          this.submiting = false
          throw error
        })
    },
    validateForm () {
      return new Promise((resolve, reject) => {
        this.form.fc.validateFieldsAndScroll({ scroll: { alignWithTop: true, offsetTop: 100 } }, (err, values) => {
          if (!err) {
            resolve(values)
          } else {
            this.collapseActive = ['1'] // 仅仅在报错的时候展开高级配置
            reject(err)
          }
        })
      })
    },
    cpuChange (cpu) {
      const memOpts = this.form.fi.cpuMem.cpu_mems_mb[cpu]
      if (!memOpts || !memOpts.length) { // 没有内存Opts，则内存为0
        let vcpu = cpu
        if (!this.form.fi.cpuMem.cpus.includes(cpu)) { // CPU的Opts不包括cpu的话
          if (this.form.fi.cpuMem.cpus && this.form.fi.cpuMem.cpus.length) { // 如果CPU的Opts有值
            vcpu = this.form.fi.cpuMem.cpus[0]
          } else { // 否则为0
            vcpu = 0
          }
        }
        this.form.fc.setFieldsValue({
          vcpu,
          vmem: 0,
        })
        return
      }
      this.form.fi.cpuMem.mems_mb = memOpts
      let defaultMem = 2048
      if (!this.form.fi.cpuMem.mems_mb.includes(2048)) { // 如果返回值不包括默认内存2G，选择第一项
        defaultMem = memOpts[0]
      }
      this.form.fc.setFieldsValue({
        vmem: defaultMem,
      })
    },
    _getProjectDomainInfo (variables) {
      variables.project = this.form.fd.project.key
      if (!variables.project) {
        variables.project = this.$store.getters.userInfo.projectName
      }
      variables.project_domain = _.get(this.form.fd, 'domain.label')
      if (!variables.project_domain) {
        variables.project_domain = this.$store.getters.userInfo.projectDomain
      }
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
    networkResourceMapper (list) {
      return list
        .map(val => {
          const remain = val.ports - val.ports_used
          if (remain <= 0) {
            return {
              ...val,
              __disabled: true,
            }
          }
          return val
        })
        .sort((a, b) => (b.ports - b.ports_used) - (a.ports - a.ports_used))
    },
    countBlur () {
      const count = this.form.fc.getFieldValue(this.decorators.count[0])
      if (!count) {
        this.form.fc.setFieldsValue({
          [this.decorators.count[0]]: 1,
        })
      }
    },
  },
}
