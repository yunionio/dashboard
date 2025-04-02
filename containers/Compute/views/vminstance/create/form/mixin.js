import * as R from 'ramda'
import _ from 'lodash'
import { SCHED_POLICY_OPTIONS_MAP, SERVER_TYPE, SELECT_IMAGE_KEY_SUFFIX, LOGIN_TYPES_MAP } from '@Compute/constants'
import OsSelect from '@Compute/sections/OsSelect'
import ServerPassword from '@Compute/sections/ServerPassword'
import CpuRadio from '@Compute/sections/CpuRadio'
import MemRadio from '@Compute/sections/MemRadio'
import sku from '@Compute/sections/SKU'
import gpu from '@Compute/sections/GPU/index'
import pci from '@Compute/sections/PCI'
import { Decorator, GenCreateData } from '@Compute/utils/createServer'
import ServerNetwork from '@Compute/sections/ServerNetwork'
import ServerAccount from '@Compute/sections/ServerAccount'
import SchedPolicy from '@Compute/sections/SchedPolicy'
import Bios from '@Compute/sections/BIOS'
import Backup from '@Compute/sections/Backup'
import Duration from '@Compute/sections/Duration'
import InstanceGroups from '@Compute/sections/InstanceGroups'
import DataDisk from '@Compute/sections/DataDisk'
import HostName from '@Compute/sections/HostName'
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
import { HYPERVISORS_MAP } from '@/constants'
import i18n from '@/locales'
import { deleteInvalid } from '@/utils/utils'
import Tag from '../components/Tag'
import SystemDisk from '../components/SystemDisk'
import Servertemplate from '../components/Servertemplate'
import BottomBar from '../components/BottomBar'
import CustomData from '../components/CustomData'
import BastionHost from '../components/BastionHost'

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
    HostName,
    pci,
    CustomData,
    BastionHost,
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
          dataDiskMedium: '',
          networkVpcObj: {},
          showCpuSockets: false,
          cpuSockets: 1,
        },
        fd: { ...initFd, project: {}, os: '' },
      },
      decorators,
      capabilityParams: {}, // 防止 capability 反复调用，这里对当前的接口参数做记录
      price: null,
      collapseActive: [],
      hostNameValidate: {
        validateStatus: '',
        errorMsg: '',
      },
      custom_data: [],
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
      let maps = R.clone(LOGIN_TYPES_MAP)
      if (this.isWindows) {
        delete maps.keypair
      }
      if (this.isInCloudSphere || this.isSangFor) {
        maps = {
          image: LOGIN_TYPES_MAP.image,
        }
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
          if (item.dev_type.startsWith('GPU')) {
            ret.push({
              ...item,
              key: `vendor=${item.vendor}:${item.model}`,
              label: `${item.vendor}/${item.model}`,
            })
          }
        }
      }
      return ret
    },
    pciDevTypeOptions () {
      const specs = this.form.fi.capability.specs || {}
      const data = specs.isolated_devices || {}
      const values = Object.values(data)
      return (this.form.fi?.capability?.pci_model_types || []).filter(item => {
        return (item.hypervisor === 'kvm' || item.hypervisor === 'zettakit') && values.some(l => item.dev_type === l.dev_type)
      })
    },
    pciOptions () {
      const specs = this.form.fi.capability.specs || {}
      const data = specs.isolated_devices || {}
      const ret = []
      for (const key in data) {
        if (data.hasOwnProperty(key)) {
          const item = data[key]
          if (!item.dev_type.startsWith('USB') && (item.hypervisor === 'kvm' || item.hypervisor === 'zettakit')) {
            ret.push({
              ...item,
              key: `vendor=${item.vendor}:${item.model}`,
              label: `${item.vendor}/${item.model}`,
            })
          }
        }
      }
      return ret
    },
    backupDisableds () { // 高可用判断哪些宿主机可用
      const ret = []
      if (this.form.fd.schedPolicyType === SCHED_POLICY_OPTIONS_MAP.host.key) {
        ret.push(this.form.fd.schedPolicyHost)
      }
      if (this.storageHostParams && this.storageHostParams.storageHosts && this.storageHostParams.storageHosts.length) {
        this.storageHostParams.storageHosts.map(item => {
          ret.push(item.id)
        })
      }
      return ret
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
      const params = {
        ...this.scopeParams,
      }
      if (this.type === 'public') { // 公有云
        if (R.is(Object, this.form.fd.sku)) {
          const cloudregion = this.form.fd.sku.cloudregion_id // 取 sku
          if (cloudregion) params.cloudregion_id = cloudregion
        }
      } else { // 私有云和IDC取 CloudregionZone 组件
        const cloudregion = _.get(this.form.fd, 'cloudregion.key')
        if (cloudregion) params.cloudregion_id = cloudregion
      }
      if (this.form.fi.networkVpcObj && this.form.fi.networkVpcObj.id) {
        params.vpc_id = this.form.fi.networkVpcObj.id
        delete params.cloudregion_id
      }
      return params
    },
    showSecgroupBind () {
      return this.form.fd.networkType === 'manual'
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
      const zone = _.get(this.form.fd, 'zone.key')
      const params = {
        // usable: true,
        limit: 0,
        // show_emulated: true,
        manager_id: this.form.fd.cloudprovider,
        ...this.scopeParams,
      }
      if (this.isZStack || this.isInCloudSphere || this.isPve) {
        params.show_emulated = true
      }
      if (zone) {
        params.usable = true
        params.zone_id = zone
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
      const osType = (_.get(this.form.fi, 'imageMsg.info.properties.os_type') || _.get(this.form.fi, 'imageMsg.properties.os_type') || '').toLowerCase()
      const os = (_.get(this.form.fd, 'os') || '').toLowerCase()
      if (~[osType, os].indexOf('windows')) {
        isWindows = true
      }
      return isWindows
    },
    osType () {
      let os_type = this.form.fi.imageMsg.info ? this.form.fi.imageMsg.info.properties?.os_type : this.form.fi.imageMsg.properties?.os_type
      if (!os_type && this.form.fi.imageMsg.os_type) {
        os_type = this.form.fi.imageMsg.os_type
      }
      return this.isWindows ? 'windows' : os_type?.toLowerCase()
    },
    enableEip () {
      const externalAccessMode = _.get(this.form.fi, 'networkVpcObj.external_access_mode')
      if (externalAccessMode === 'none') return false // "eip-distgw" "eip" 是正常可以使用EIP的，"none"不可以
      return true
    },
    isZStack () {
      return this.form.fd.hypervisor === HYPERVISORS_MAP.zstack.key
    },
    isInCloudSphere () {
      return this.form.fd.hypervisor === HYPERVISORS_MAP.incloudsphere.key
    },
    isSangFor () {
      return this.form.fd.hypervisor === HYPERVISORS_MAP.sangfor.key
    },
    isHCSO () {
      return this.form.fd.hypervisor === HYPERVISORS_MAP.hcso.key
    },
    isHCS () {
      return this.form.fd.hypervisor === HYPERVISORS_MAP.hcs.key
    },
    isPve () {
      return this.form.fd.hypervisor === HYPERVISORS_MAP.proxmox.key
    },
    showServerAccount () {
      return this.form.fd.loginType !== LOGIN_TYPES_MAP.image.key
    },
    hostNameTips () {
      if (this.isWindows) {
        return `${this.$t('compute.host_name_tips')} ${this.$t('compute.validate.windows')}`
      } else {
        return `${this.$t('compute.host_name_tips')} ${this.$t('compute.validate.others')}`
      }
    },
    showCustomData () {
      const showCustomDataHypervisors = [
        HYPERVISORS_MAP.kvm.key,
        HYPERVISORS_MAP.esxi.key,
        HYPERVISORS_MAP.aliyun.key,
        HYPERVISORS_MAP.google.key,
        HYPERVISORS_MAP.aws.key,
        HYPERVISORS_MAP.huawei.key,
        HYPERVISORS_MAP.azure.key,
        HYPERVISORS_MAP.qcloud.key,
      ]
      return showCustomDataHypervisors.includes(this.form.fd.hypervisor || this.hypervisor)
    },
    isOpenSourceVersion () {
      return !this.$appConfig.isPrivate
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
    isWindows (val) {
      const hostName = this.form.fd.hostName

      if (hostName) {
        this.hostNameValidate = {
          ...this.validateHostNameChange(hostName),
        }
      }
    },
    isKvm () {
      return this.form.fd.hypervisor === 'kvm'
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
          const data = genCreteData.all()
          if (data.custom_data_type) {
            delete data.custom_data_type
            const { customData } = this.$refs.customData
            if (customData.length) {
              data.user_data = customData
            }
          }
          if (this.form.fd.bastion_host_enable) {
            const bastionServer = this.getBationServerData()
            data.bastion_server = bastionServer
          }
          if (this.isServertemplate) { // 创建主机模板
            this.doCreateServertemplate(data)
          } else if (this.isOpenWorkflow) { // 提交工单
            await this.checkCreateData(data)
            await this.doForecast(genCreteData, data)
            await this.doCreateWorkflow(data)
          } else { // 创建主机
            await this.checkCreateData(data)
            await this.doForecast(genCreteData, data)
            await this.createServer(data)
          }
        })
        .catch(error => {
          throw error
        })
        .finally(() => {
          this.submiting = false
        })
    },
    doCreateServertemplate (data) {
      const { project_id, description, ...rest } = data
      const templateData = {
        name: this.form.fc.getFieldValue('servertemplate_name'),
        project: project_id,
        description,
        content: {
          ...rest,
        },
      }
      this.servertemplateM.create({ data: templateData })
        .then(() => {
          this.$message.success(i18n.t('compute.text_423'))
          this.$router.push('/servertemplate')
        })
        .catch((error) => {
          throw error
        })
    },
    doCreateWorkflow (data) {
      const variables = {
        process_definition_key: WORKFLOW_TYPES.APPLY_MACHINE,
        initiator: this.$store.getters.userInfo.id,
        description: this.form.fd.reason,
        'server-create-paramter': JSON.stringify(data),
        price: this.price,
      }
      this._getProjectDomainInfo(variables)
      new this.$Manager('process-instances', 'v1')
        .create({ data: { variables } })
        .then(() => {
          this.$message.success(i18n.t('compute.text_1045', [data.generate_name]))
          this.$router.push('/workflow')
        })
        .catch((error) => {
          throw error
        })
    },
    async checkCreateData (data) {
      return new this.$Manager('servers').create({ data: { ...data, dry_run: true } })
    },
    doForecast (genCreateData, data) {
      return new Promise((resolve, reject) => {
        this.schedulerM.rpc({ methodname: 'DoForecast', params: data })
          .then(res => {
            if (res.data.can_create) {
              resolve(data)
            } else {
              this.errors = genCreateData.getForecastErrors(res.data)
              reject(this.errors)
            }
          })
          .catch(err => {
            this.$message.error(i18n.t('compute.text_321', [err]))
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
          this.$store.commit('keepAlive/ADD_DELAY_EVENT', { name: 'VMInstanceListRefresh' })
          this.$router.push('/vminstance')
        })
        .catch(error => {
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
      } else if (this.form.fc.getFieldValue('vcpu') !== cpu) { // 因之前未获取cpu设置为0，这一步设置回来
        this.form.fc.setFieldsValue({
          vcpu: cpu,
        })
      }
      this.form.fi.cpuMem.mems_mb = memOpts
      let defaultMem = 2048
      const currentMem = this.form.fc.getFieldValue('vmem')
      if (currentMem && this.form.fi.cpuMem.mems_mb.includes(currentMem)) {
        return
      }
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
    fetchDomainCallback () {
      const domain = this.$route.query.domain_id
      if (!R.isNil(domain) && !R.isEmpty(domain)) {
        this.form.fc.setFieldsValue({
          domain: { key: domain },
        })
      }
    },
    fetchProjectCallback () {
      const project = this.$route.query.tenant_id
      if (!R.isNil(project) && !R.isEmpty(project)) {
        this.form.fc.setFieldsValue({
          project: { key: project },
        })
      }
    },
    validateHostNameChange (v) {
      const error = {
        validateStatus: 'success',
        errorMsg: null,
      }
      if (!v) return error
      if (this.isWindows) {
        if (v.length < 2 || v.length > 15) {
          error.validateStatus = 'error'
          error.errorMsg = this.$t('compute.validate.windows')
          return error
        }
        if (!/^[a-z0-9A-Z-]+$/.test(v)) {
          error.validateStatus = 'error'
          error.errorMsg = this.$t('compute.validate.windows')
          return error
        }
        if (/^[0-9]+$/.test(v)) { // 不能仅仅使用数字
          error.validateStatus = 'error'
          error.errorMsg = this.$t('compute.validate.others')
          return error
        }
        if (/(-)\1+/.test(v)) { // 不能连续使用连字符
          error.validateStatus = 'error'
          error.errorMsg = this.$t('compute.validate.others')
          return error
        }
        if (/^(?=(-)).*/.test(v)) { // 不能以连字符开头
          error.validateStatus = 'error'
          error.errorMsg = this.$t('compute.validate.others')
          return error
        }
        if (/.*?(-)$/.test(v)) { // 不能以连字符结尾
          error.validateStatus = 'error'
          error.errorMsg = this.$t('compute.validate.others')
          return error
        }
      } else {
        if (v.length < 2 || v.length > 60) {
          error.validateStatus = 'error'
          error.errorMsg = this.$t('compute.validate.others')
        }
        if (!/^[a-z0-9A-Z.-]+$/.test(v)) {
          error.validateStatus = 'error'
          error.errorMsg = this.$t('compute.validate.others')
          return error
        }
        if (/(\.|-)\1+/.test(v)) { // 不能连续使用点号或连字符
          error.validateStatus = 'error'
          error.errorMsg = this.$t('compute.validate.others')
          return error
        }
        if (/^(?=(\.|-)).*/.test(v)) { // 不能以点号或连字符开头
          error.validateStatus = 'error'
          error.errorMsg = this.$t('compute.validate.others')
          return error
        }
        if (/.*?(\.|-)$/.test(v)) { // 不能以点号或连字符结尾
          error.validateStatus = 'error'
          error.errorMsg = this.$t('compute.validate.others')
          return error
        }
      }
      return error
    },
    handleHostNameChange (v) {
      this.hostNameValidate = {
        ...this.validateHostNameChange(v),
      }
    },
    getBationServerData () {
      const {
        bastion_host_id,
        bastion_org_id,
        nodes,
        port,
        privileged_accounts,
        accounts,
        bastion_domain_id,
        reason,
      } = this.form.fd
      return {
        bastion_host_id,
        bastion_org_id,
        nodes,
        port,
        description: reason,
        accounts: [privileged_accounts].concat(accounts),
        bastion_domain_id,
      }
    },
    addShopCart () {
      this.validateForm()
        .then(async formData => {
          this.submiting = true
          const genCreateData = new GenCreateData(formData, this.form.fi)
          const data = genCreateData.all()
          if (this.form.fd.bastion_host_enable) {
            const bastionServer = this.getBationServerData()
            data.bastion_server = bastionServer
          }
          const { __count__, ...parameter } = deleteInvalid(data)
          const shopCart = {
            action: 'create',
            auto_execute: true,
            count: __count__,
            resource: 'servers',
            user_id: this.$store.getters.userInfo.id,
            parameter: {
              ...parameter,
              price: this.price,
            },
          }
          this._getProjectDomainInfo(shopCart)
          this.$message.success(this.$t('common.success'))
          this.$store.commit('shopcart/ADD_SHOP_CART', shopCart)
        })
    },
    handleCancel () {
      this.$router.push({
        name: this.isServertemplate ? 'Servertemplate' : 'VMInstanceIndex',
      })
    },
  },
}
