import * as R from 'ramda'
import _ from 'lodash'
import { SCHED_POLICY_OPTIONS_MAP, SERVER_TYPE, LOGIN_TYPES_MAP, NETWORK_OPTIONS_MAP } from '@Compute/constants'
import OsSelect from '@Compute/sections/OsSelect'
import ServerPassword from '@Compute/sections/ServerPassword'
import CpuRadio from '@Compute/sections/CpuRadio'
import MemRadio from '@Compute/sections/MemRadio'
import sku from '@Compute/sections/SKU'
import gpu from '@Compute/sections/GPU/index'
import pci from '@Compute/sections/PCI'
import { Decorator, GenCreateData, resolveInitPreferZone } from '@Compute/utils/createServer'
import {
  buildServerCreateDraftPayloadWithAdvanceGate,
  mergeServerCreateDraftToInitFormData,
  isMeaningfulServerCreateDraft,
  resolveDraftNetworkType,
  resolveDraftLoginType,
  normalizeDraftUserData,
  isAdvanceConfigOpenFromDraft,
  needOpenAdvanceConfig,
  resolveAdvanceConfigCollapseActive,
} from '@Compute/utils/vminstanceCreateDraft'
import ServerNetwork from '@Compute/sections/ServerNetwork'
import ServerAccount from '@Compute/sections/ServerAccount'
import SchedPolicy from '@Compute/sections/SchedPolicy'
import Bios from '@Compute/sections/BIOS'
import Backup from '@Compute/sections/Backup'
import Duration from '@Compute/sections/Duration'
import InstanceGroups from '@Compute/sections/InstanceGroups'
import DataDisk from '@Compute/sections/DataDisk'
import HostName from '@Compute/sections/HostName'
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
import { HYPERVISORS_MAP, resolveHypervisorKey } from '@/constants'
import i18n from '@/locales'
import { deleteInvalid, uuid } from '@/utils/utils'
import { diskSupportTypeMedium } from '@/utils/common/hypervisor'
import { hasSetupKey, isLicense2 } from '@/utils/auth'
import createFormDraftMixin from '@/mixins/createFormDraft'
import { getDraft, shouldUseCreateDraft } from '@/utils/createFormDraft'
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

/**
 * data() 阶段尽早解析草稿，供 Decorator 当 initialValue 种子（与工单 initFormData 同形）。
 * 必须在工单回填（isInitForm）与路由预填场景下返回 inactive，避免抢填。
 * @param {Vue} vm 创建表单实例（此时 props/route 已可用）
 * @returns {{ active: boolean, data: object|null }}
 */
function resolveServerCreateDraftSeed (vm) {
  // 修改工单：只用 params.data，不用 localStorage 草稿
  if (vm.isInitForm) return { active: false, data: null }
  const isServertemplate = vm.$route.query.source === 'servertemplate'
  const formScope = isServertemplate
    ? `compute.servertemplate.${vm.type}`
    : `compute.server.${vm.type}`
  if (!shouldUseCreateDraft(vm.$route, {})) {
    return { active: false, data: null }
  }
  const data = getDraft(formScope)
  const initData = mergeServerCreateDraftToInitFormData(data)
  // 无有效配置（收紧 meaningful）则不当草稿种子，保留域/项目/镜像局部记忆
  if (!initData?.extraData || !isMeaningfulServerCreateDraft(initData)) {
    return { active: false, data: null }
  }
  return { active: true, data: initData }
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
  mixins: [workflowMixin, createFormDraftMixin],
  props: {
    type: {
      type: String,
      required: true,
      validator: val => ['idc', 'private', 'public'].includes(val),
    },
    initFormData: {
      type: Object,
      default: () => ({}),
    },
    isInitForm: {
      type: Boolean,
      default: false,
    },
  },
  data () {
    // 普通新建：用上次成功/进行中草稿种 Decorator，复用工单回填那套 initialValue 链路
    const draftSeed = resolveServerCreateDraftSeed(this)
    const seedFormData = draftSeed.active ? draftSeed.data : this.initFormData
    const decorators = new Decorator(SERVER_TYPE[this.type]).createDecorators(seedFormData)
    const initFd = getInitialValue(decorators)
    return {
      // 与 createFormDraftMixin 对齐：有草稿种子时视为正在恢复
      isDraftRestore: draftSeed.active,
      draftRestored: draftSeed.active,
      // data() 已种过 Decorator：applyDraft 勿再 initForm
      _serverCreateDraftSeeded: draftSeed.active,
      _draftInitFormData: draftSeed.active ? draftSeed.data : null,
      _initFormPromise: null,
      // 磁盘回填进行中：挡住 imageMsg / typesMap 的清盘逻辑
      _diskBackfillPending: false,
      // initForm 只允许成功进入一次（mounted + applyDraft 都会调）
      _initFormDone: false,
      // 公有云磁盘依赖 sku 挂载，单独标记避免重复回填
      _diskBackfillCompleted: false,
      initSkuData: { name: seedFormData?.sku },
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
          imageType: '',
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
        fd: { hypervisor: '', ...initFd, project: {}, os: '' },
      },
      decorators,
      capabilityParams: {}, // 防止 capability 反复调用，这里对当前的接口参数做记录
      price: null,
      // 高级配置展开状态：优先用草稿记录的开关，避免用户关掉后又被强制打开
      collapseActive: resolveAdvanceConfigCollapseActive(seedFormData),
      hostNameValidate: {
        validateStatus: '',
        errorMsg: '',
      },
      custom_data: [],
      dataDiskInterval: null,
      tagDefaultChecked: {},
    }
  },
  provide () {
    return {
      form: this.form,
    }
  },
  computed: {
    /**
     * createFormDraftMixin 配置：按云环境隔离 scope；
     * 防抖落盘带「有意义」校验，避免进页空表覆盖；
     * data() 已种 Decorator 时 applyDraft 只同步数据，initForm 只由 mounted 调一次（对齐工单）
     */
    createFormDraftOptions () {
      const isServertemplate = this.isServertemplate
      return {
        formScope: isServertemplate
          ? `compute.servertemplate.${this.type}`
          : `compute.server.${this.type}`,
        // 主机模板名每次新建应重填，不落盘
        omitKeys: isServertemplate ? ['servertemplate_name'] : [],
        disableWhen: () => this.isInitForm,
        serialize: () => this.serializeCreateFormDraft(),
        applyDraft: async (draftData) => {
          const initData = mergeServerCreateDraftToInitFormData(draftData)
          this._draftInitFormData = initData
          this.isDraftRestore = true
          this.draftRestored = true
          // 单飞 initForm：与 mounted 共用，保证一定会跑到磁盘回填
          if (typeof this.initForm === 'function') {
            await this.initForm()
          }
        },
        isMeaningfulDraft: (data) => isMeaningfulServerCreateDraft(data),
      }
    },
    /**
     * 有草稿或工单回填时，关闭 DomainProject / OsSelect 局部 storage，避免双源抢填；
     * 草稿不存在或不可用时，保留原先域、项目、镜像本地记忆
     */
    ignoreLocalFormStorage () {
      if (this.isInitForm) return true
      return !!(this._serverCreateDraftSeeded || this._draftInitFormData)
    },
    /**
     * 是否处于「表单回填」态（工单 / 草稿恢复中 / 已恢复但用户尚未操作）
     * 不靠固定秒数：级联请求未完时，只要用户没动手，就仍视为回填保护期
     */
    isFormBackfill () {
      // 有草稿数据且用户未操作：一律当回填（不依赖 hydrating 时序，避免 initForm 直接 return）
      if (this.isInitForm) return true
      if (this._diskBackfillPending) return true
      if (this._draftInitFormData && !this.createFormDraftUserInteracted) return true
      return this.isCreateFormDraftHydrating
    },
    /**
     * initForm / 域项目回调统一取数入口：工单优先 params，否则用草稿
     */
    effectiveInitFormData () {
      if (this.isInitForm) return this.initFormData
      if (this._draftInitFormData && !this.createFormDraftUserInteracted) return this._draftInitFormData
      if (this.isCreateFormDraftHydrating && this._draftInitFormData) return this._draftInitFormData
      return this.initFormData || {}
    },
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
      // 回填指定安全组时，即使网络类型尚未切到 manual，也要保留 bind 选项
      if (this.isFormBackfill && this.isDraftAdvanceConfigOpen) {
        const init = this.effectiveInitFormData || this._draftInitFormData || this.initFormData
        if (init?.secgroups?.length) return true
      }
      return this.form.fd.networkType === 'manual'
    },
    /** 草稿是否展开高级配置（关闭则不回填其中字段） */
    isDraftAdvanceConfigOpen () {
      if (!this.isFormBackfill) {
        return Array.isArray(this.collapseActive) && this.collapseActive.includes('1')
      }
      return isAdvanceConfigOpenFromDraft(this.effectiveInitFormData || this._draftInitFormData)
    },
    draftInitSecgroups () {
      if (!this.isFormBackfill || !this.isDraftAdvanceConfigOpen) return []
      const secgroups = this.effectiveInitFormData?.secgroups || this._draftInitFormData?.secgroups || []
      if (!Array.isArray(secgroups)) return []
      return secgroups.map((item) => {
        if (item == null) return null
        if (typeof item === 'string' || typeof item === 'number') return String(item)
        return item.id || item.key || item.value || null
      }).filter(Boolean)
    },
    draftInitPreferHost () {
      if (!this.isFormBackfill || !this.isDraftAdvanceConfigOpen) return ''
      const init = this.effectiveInitFormData || this._draftInitFormData || {}
      return init.prefer_host || init.extraData?.prefer_host || ''
    },
    isOpenWorkflow () {
      if (this.isServertemplate) return false
      return this.checkWorkflowEnabled(WORKFLOW_TYPES.APPLY_MACHINE)
    },
    isOpenOrderSetWorkflow () {
      if (this.isServertemplate) return false
      return this.checkWorkflowEnabled(WORKFLOW_TYPES.EXECUTE_RESOURCE_ORDER_SET)
    },
    isModifyShopCartOrder () {
      const { workflow, order_set_id } = this.$route.query
      return !!(workflow && order_set_id)
    },
    isWorkflowSubmit () {
      return this.isOpenWorkflow || this.isOpenOrderSetWorkflow || this.isModifyWorkflow
    },
    isModifyWorkflow () {
      return !!this.$route.query.workflow
    },
    showReason () {
      return this.isOpenWorkflow || this.isOpenOrderSetWorkflow || this.isModifyWorkflow
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
    hasBastionService () {
      if (isLicense2() && !hasSetupKey(['bastionhost'])) return false
      const { services } = this.$store.getters.userInfo
      const bastionService = services.find(val => val.type === 'bastionhost')
      if (bastionService && bastionService.status === true) {
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
      if (this.isZStack || this.isInCloudSphere || this.isPve || this.isGoogle || this.isCNware) {
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
      const ret = {
        limit: 0,
        'filter.0': 'resource_type.equals(hosts)',
        ...this.scopeParams,
      }
      const zone = _.get(this.form.fd, 'zone.key')
      if (zone) {
        ret.zone_id = zone
      }
      return ret
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
    isGoogle () {
      return this.form.fd.hypervisor === HYPERVISORS_MAP.google.key || this.hypervisor === HYPERVISORS_MAP.google.key
    },
    isCNware () {
      return this.form.fd.hypervisor === HYPERVISORS_MAP.cnware.key
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
        HYPERVISORS_MAP.ksyun.key,
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
    this.zonesM2 = new Manager('zones', 'v2')
    this.$bus.$on('VMGetPrice', (price) => {
      this.price = price
    })
    this.$store.dispatch('app/fetchWorkflowEnabledKeys')
  },
  mounted () {
    // 等子组件（hypervisor v-if 的盘/网）挂上再回填，与工单同一套 initForm
    this.$nextTick(() => {
      this.initForm()
    })
  },
  watch: {
    collapseActive (val) {
      // 用户展开/收起高级配置时落盘开关
      if (this.isFormBackfill && !this.createFormDraftUserInteracted) return
      this.scheduleSaveCreateFormDraft()
    },
    'form.fi.imageMsg': {
      deep: true,
      handler (val, oldVal) {
        if (R.equals(val, oldVal)) return
        this.$nextTick(() => {
          // 回填期间镜像变化不要清空数据盘，否则工单/草稿里的盘会被冲掉
          if (!this.isFormBackfill) {
            this._resetDataDisk() // 重置数据盘数据
          }
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
    'form.fd.sku' (val) {
      // 公有云盘组件 v-if="sku"：sku 就绪后再回填磁盘类型/大小，并随后回填网络
      if (this.type !== 'public') return
      if (!this.isFormBackfill && !this.isInitForm) return
      if (!R.is(Object, val) || this._diskBackfillCompleted || this._diskBackfilling) return
      const initData = this.isInitForm
        ? this.initFormData
        : (this._draftInitFormData || this.effectiveInitFormData)
      if (!initData?.extraData) {
        this._diskBackfillCompleted = true
        return
      }
      this.$nextTick(async () => {
        try {
          if (initData.disks && initData.disks.length) {
            await this.backfillDisksFromInitData(initData)
          }
          await this.backfillNetworksFromInitData(initData)
          await this.backfillAdvanceConfigFromInitData(initData)
        } finally {
          this._diskBackfillCompleted = true
        }
      })
    },
  },
  methods: {
    async capability (v, data) { // 可用区查询
      const params = {
        show_emulated: true,
      }
      if (this.$store.getters.isAdminMode) {
        params.project_domain = data?.extraData?.domain_id
      }
      return this.zonesM2.get({ id: `${v}/capability`, params })
    },
    async capability2 (v, data) { // 可用区查询
      const params = {
        show_emulated: true,
      }
      if (this.$store.getters.isAdminMode) {
        params.project_domain = data?.extraData?.domain_id
      }
      return new this.$Manager('cloudregions').get({ id: `${v}/capability`, params })
    },
    /**
     * 规范化 extraData.nets，供 NetworkConfig.initData 使用（与工单 params 同形）
     */
    normalizeExtraNetsForInit (nets) {
      if (!Array.isArray(nets)) return []
      return nets.map(item => {
        if (!item || typeof item !== 'object') return item
        const network = typeof item.network === 'object'
          ? (item.network.id || item.network.key)
          : (item.network || item.network_id)
        const vpc = typeof item.vpc === 'object'
          ? (item.vpc.id || item.vpc.key)
          : item.vpc
        return { ...item, network, vpc, network_id: item.network_id || network }
      }).filter(item => item && item.network)
    },
    /**
     * 工单 / 草稿共用回填：磁盘/网络逻辑与历史工单 initForm 保持同构
     */
    async initForm () {
      if (this._initFormPromise) return this._initFormPromise
      this._initFormPromise = this._runInitForm()
      try {
        await this._initFormPromise
      } finally {
        this._initFormPromise = null
      }
    },
    async _runInitForm () {
      // 工单用 props；草稿用 _draftInitFormData（勿只依赖 isFormBackfill，时序不稳会直接 return）
      const initData = this.isInitForm
        ? this.initFormData
        : (this._draftInitFormData || this.effectiveInitFormData)
      if (!((this.isInitForm || this._draftInitFormData) && initData && initData.extraData && this.form && this.form.fc)) {
        return
      }
      if (this._initFormDone) return
      this._initFormDone = true
      this._diskBackfillPending = true

      if (initData.hypervisor) {
        this.form.fd.hypervisor = initData.hypervisor
        this.form.fc.setFieldsValue({ hypervisor: initData.hypervisor })
      }

      try {
        const initPreferZone = resolveInitPreferZone(initData, this.type === 'public')
        const preferZoneId = Array.isArray(initPreferZone) ? (initPreferZone[0] || '') : initPreferZone
        if (preferZoneId) {
          const { data: capabilityData } = await this.capability(preferZoneId, initData)
          this.form.fi.capability = capabilityData
        } else if (initData.prefer_region) {
          const { data: capabilityData } = await this.capability2(initData.prefer_region, initData)
          this.form.fi.capability = capabilityData
        }
      } catch (error) { }

      const systemDisk = ((initData.disks || []).filter(item => item.disk_type === 'sys')[0]) || null

      if (systemDisk && systemDisk.backend) {
        const hyper = initData.hypervisor || this.form.fd.hypervisor || (this.form.fd.sku && this.form.fd.sku.provider)
        const hyperKey = hyper ? String(hyper).toLowerCase() : ''
        const typeKey = diskSupportTypeMedium(hyperKey)
          ? `${systemDisk.backend}/${systemDisk.medium || 'ssd'}`
          : systemDisk.backend
        const systemDiskType = { key: typeKey, label: '' }
        const systemDiskSize = systemDisk.size / 1024
        this.$set(this.form.fd, 'systemDiskType', systemDiskType)
        this.$set(this.form.fd, 'systemDiskSize', systemDiskSize)
        this.form.fc.setFieldsValue({ systemDiskType, systemDiskSize })
        if (systemDisk.medium) this.$set(this.form.fi, 'systemDiskMedium', systemDisk.medium)
      }

      // 等子组件挂载（草稿比工单更容易在首屏 nextTick 时还没有 ref）
      const waitRef = (getter, timeout = 10000) => new Promise(resolve => {
        const startAt = Date.now()
        const tick = () => {
          const val = typeof getter === 'function' ? getter() : null
          if (val) {
            resolve(val)
            return
          }
          if (Date.now() - startAt >= timeout) {
            resolve(null)
            return
          }
          setTimeout(tick, 100)
        }
        this.$nextTick(tick)
      })

      if (initData.isolated_devices && initData.isolated_devices.length) {
        const pciRef = await waitRef(() => this.$refs.pciRef, 3000)
        if (pciRef && pciRef.initData) pciRef.initData(initData.isolated_devices)
      }

      // 公有云盘组件依赖 sku 挂载：磁盘回填改由 watch form.fd.sku 触发
      // IDC/私有云：此处直接回填
      if (this.type !== 'public') {
        await this.backfillDisksFromInitData(initData, { waitRef })
        this._diskBackfillCompleted = true
      } else if (R.is(Object, this.form.fd.sku) && !this._diskBackfillCompleted) {
        await this.backfillDisksFromInitData(initData, { waitRef })
        this._diskBackfillCompleted = true
      }

      // —— 管理员密码方式回填（草稿不回填明文密码；工单仍可用 initData.password）——
      const loginType = resolveDraftLoginType(initData)
      if (loginType) {
        this.$set(this.form.fd, 'loginType', loginType)
        this.form.fc.setFieldsValue({ loginType })
      }
      // 仅工单/购物车修改回填明文密码；草稿只记 loginType
      const loginPassword = this.isInitForm
        ? ((initData.extraData && initData.extraData.loginPassword) || initData.password || '')
        : ''
      if (loginType === 'password' && loginPassword) {
        this.$set(this.form.fd, 'loginPassword', loginPassword)
        // 密码输入框随 loginType 才挂载，延迟再写一次
        this.$nextTick(() => {
          this.form.fc.setFieldsValue({ loginPassword })
        })
        setTimeout(() => {
          if (this.form && this.form.fc) {
            this.form.fc.setFieldsValue({ loginPassword })
            this.$set(this.form.fd, 'loginPassword', loginPassword)
          }
        }, 500)
      }

      // —— 网络 ——
      // 公有云网络依赖区域/sku，改由 watch form.fd.sku 在磁盘回填后执行
      if (this.type !== 'public') {
        await this.backfillNetworksFromInitData(initData, { waitRef })
      } else if (R.is(Object, this.form.fd.sku) && this._diskBackfillCompleted) {
        await this.backfillNetworksFromInitData(initData, { waitRef })
      }

      // —— 高级配置（公网 IP / 自定义数据等）——
      // 公有云 EIP、自定义数据依赖 hypervisor/sku 才挂载，延后到 sku watch
      if (this.type !== 'public') {
        await this.backfillAdvanceConfigFromInitData(initData, { waitRef })
      } else if (R.is(Object, this.form.fd.sku) && this._diskBackfillCompleted) {
        await this.backfillAdvanceConfigFromInitData(initData, { waitRef })
      }

      if (initData.__meta__) {
        const ret = {}
        R.forEachObjIndexed((value, key) => {
          ret[key] = R.is(Array, value) ? value : [value]
        }, initData.__meta__)
        this.tagDefaultChecked = ret
      }

      // 延迟结束保护：公有云磁盘/网络可能更晚回填，勿过早放开
      if (this.type !== 'public' || this._diskBackfillCompleted) {
        setTimeout(() => {
          this._diskBackfillPending = false
        }, 3500)
      }
    },
    /**
     * 回填高级配置：公网 IP、自定义数据、主机名、安全组、调度策略、堡垒机等
     * 仅当草稿记录「高级配置开启」时展开并回填；未开启则略过
     */
    async backfillAdvanceConfigFromInitData (initData, { waitRef } = {}) {
      if (!initData || !this.form?.fc) return
      // 按草稿开关决定是否展开/回填；关闭则保持折叠并跳过字段
      this.collapseActive = resolveAdvanceConfigCollapseActive(initData)
      if (!isAdvanceConfigOpenFromDraft(initData)) return
      if (!needOpenAdvanceConfig(initData)) return

      const doWaitRef = waitRef || ((getter, timeout = 10000) => new Promise(resolve => {
        const startAt = Date.now()
        const tick = () => {
          const val = typeof getter === 'function' ? getter() : null
          if (val) {
            resolve(val)
            return
          }
          if (Date.now() - startAt >= timeout) {
            resolve(null)
            return
          }
          setTimeout(tick, 100)
        }
        this.$nextTick(tick)
      }))

      await this.$nextTick()
      // 等 collapse / v-if(enableEip|showCustomData) 挂载
      await new Promise(resolve => setTimeout(resolve, 400))

      this.form.fc.setFieldsValue({ hostName: initData.hostname })

      if (initData.eip_charge_type || initData.public_ip_charge_type) {
        const eipRef = await doWaitRef(() => this.$refs.eipConfigRef, 8000)
        if (eipRef && eipRef.initData) {
          eipRef.initData(initData)
          // EIP 子项（计费/带宽）自身还有延迟，再补一次
          setTimeout(() => {
            if (this.$refs.eipConfigRef && this.$refs.eipConfigRef.initData) {
              this.$refs.eipConfigRef.initData(initData)
            }
          }, 2500)
        }
      }

      if (initData.network_tags && initData.network_tags.length) {
        setTimeout(() => {
          this.form.fc.setFieldsValue({ secgroup_type: 'networkTag', network_tags: initData.network_tags })
        }, 2000)
      } else if (initData.secgroups && initData.secgroups.length) {
        const secgroupIds = initData.secgroups.map((item) => {
          if (item == null) return null
          if (typeof item === 'string' || typeof item === 'number') return String(item)
          return item.id || item.key || item.value || null
        }).filter(Boolean)
        if (this.$refs.secgroupConfigRef?.initData) {
          this.$refs.secgroupConfigRef.initData(secgroupIds)
        } else {
          this.form.fc.setFieldsValue({ secgroup_type: 'bind', secgroup: secgroupIds })
        }
      }

      if (this.$refs.schedPolicyRef) {
        if (initData.prefer_host) {
          if (this.$refs.schedPolicyRef.initPreferHostData) {
            this.$refs.schedPolicyRef.initPreferHostData(initData.prefer_host)
          } else {
            this.$refs.schedPolicyRef.change({ target: { value: 'host' }, name: 'default' })
            this.form.fc.setFieldsValue({
              schedPolicyType: 'host',
              schedPolicyHost: initData.prefer_host,
            })
          }
        }
        if (initData.schedtags && initData.schedtags.length) {
          this.$refs.schedPolicyRef.change({ target: { value: 'schedtag' }, name: 'default' })
          setTimeout(() => {
            if (this.$refs.schedPolicyRef && this.$refs.schedPolicyRef.$refs.policySchedtagRef) {
              this.$refs.schedPolicyRef.$refs.policySchedtagRef.initData(initData.schedtags)
            }
          }, 1000)
        }
      }

      // 草稿不读写 file；仅回填文本 input
      if (initData.custom_data_type !== 'file' && (initData.user_data || initData.custom_data_type === 'input')) {
        const customType = initData.custom_data_type || (initData.user_data ? 'input' : '')
        const userDataText = customType === 'input'
          ? (normalizeDraftUserData(initData.user_data) ||
            normalizeDraftUserData(initData.extraData && initData.extraData.user_data))
          : undefined
        await this.$nextTick()
        const customRef = await doWaitRef(() => this.$refs.customData, 8000)
        if (customRef) {
          if (customRef.restoreFromDraft) {
            customRef.restoreFromDraft(customType, userDataText)
          } else if (userDataText && customRef.handleMirrorDataChange) {
            this.$set(this.form.fd, 'custom_data_type', customType)
            this.form.fc.setFieldsValue({ custom_data_type: customType })
            customRef.handleMirrorDataChange(userDataText)
          }
          if (userDataText) {
            setTimeout(() => {
              const ref = this.$refs.customData
              if (!ref) return
              if (ref.restoreFromDraft) {
                ref.restoreFromDraft(customType, userDataText)
              } else if (ref.handleMirrorDataChange) {
                ref.handleMirrorDataChange(userDataText)
              }
            }, 800)
          }
        }
      }

      if (initData.bastion_server && this.$refs.bastionHostRef) {
        this.$refs.bastionHostRef.initData(initData.bastion_server)
      }
    },
    /**
     * 回填指定 IP 子网 / 调度标签网络
     */
    async backfillNetworksFromInitData (initData, { waitRef } = {}) {
      if (!initData || !initData.nets || !this.form?.fc) return
      const doWaitRef = waitRef || ((getter, timeout = 10000) => new Promise(resolve => {
        const startAt = Date.now()
        const tick = () => {
          const val = typeof getter === 'function' ? getter() : null
          if (val) {
            resolve(val)
            return
          }
          if (Date.now() - startAt >= timeout) {
            resolve(null)
            return
          }
          setTimeout(tick, 100)
        }
        this.$nextTick(tick)
      }))
      const networkRef = await doWaitRef(() => this.$refs.networkRef, 8000)
      if (!networkRef) return
      const initNetworkType = resolveDraftNetworkType(initData)
      this.form.fc.setFieldsValue({ networkType: initNetworkType })
      if (this.form.fd) this.$set(this.form.fd, 'networkType', initNetworkType)
      networkRef.change({ target: { value: initNetworkType }, name: 'default' })
      await this.$nextTick()
      if (initNetworkType === NETWORK_OPTIONS_MAP.manual.key) {
        const nets = this.normalizeExtraNetsForInit(initData.extraData && initData.extraData.nets)
        let configRef = networkRef.$refs && networkRef.$refs.networkConfigRef
        if (!configRef) {
          await new Promise(resolve => setTimeout(resolve, 400))
          configRef = this.$refs.networkRef && this.$refs.networkRef.$refs && this.$refs.networkRef.$refs.networkConfigRef
        }
        if (configRef && configRef.initData && nets.length) {
          configRef.initData(nets)
          // 区域/sku 刚就绪时子网列表可能仍在飞，再补一次
          setTimeout(() => {
            const ref = this.$refs.networkRef && this.$refs.networkRef.$refs && this.$refs.networkRef.$refs.networkConfigRef
            if (ref && ref.initData && nets.length) ref.initData(nets)
          }, 2500)
        }
      } else if (initNetworkType === NETWORK_OPTIONS_MAP.schedtag.key) {
        await this.$nextTick()
        const schedRef = networkRef.$refs && networkRef.$refs.networkSchedtagRef
        if (schedRef && schedRef.initData) schedRef.initData(initData.nets)
      }
    },
    /**
     * 回填系统盘/数据盘。公有云需等 sku 挂载且 typesMap 就绪后再写，否则类型/大小会被默认值盖掉。
     */
    async backfillDisksFromInitData (initData, { waitRef } = {}) {
      if (!initData || !this.form?.fc) return
      if (this._diskBackfilling) return
      this._diskBackfilling = true
      this._diskBackfillPending = true
      try {
        const doWaitRef = waitRef || ((getter, timeout = 10000) => new Promise(resolve => {
          const startAt = Date.now()
          const tick = () => {
            const val = typeof getter === 'function' ? getter() : null
            if (val) {
              resolve(val)
              return
            }
            if (Date.now() - startAt >= timeout) {
              resolve(null)
              return
            }
            setTimeout(tick, 100)
          }
          this.$nextTick(tick)
        }))
        const waitTypesMap = (getter, timeout = 15000) => new Promise(resolve => {
          const startAt = Date.now()
          const tick = () => {
            const map = typeof getter === 'function' ? getter() : null
            if (map && typeof map === 'object' && Object.keys(map).length) {
              resolve(map)
              return
            }
            if (Date.now() - startAt >= timeout) {
              resolve(null)
              return
            }
            setTimeout(tick, 200)
          }
          this.$nextTick(tick)
        })

        const systemDisk = ((initData.disks || []).filter(item => item.disk_type === 'sys')[0]) || null
        const dataDisks = (initData.disks || []).filter(item => item.disk_type === 'data' || item.disk_type === 'swap')
        const hyperRaw = initData.hypervisor || this.form.fd.hypervisor ||
          (R.is(Object, this.form.fd.sku) && this.form.fd.sku.provider)
        const hyper = hyperRaw ? String(hyperRaw).toLowerCase() : ''

        if (systemDisk && systemDisk.backend) {
          const typeKey = diskSupportTypeMedium(hyper)
            ? `${systemDisk.backend}/${systemDisk.medium || 'ssd'}`
            : systemDisk.backend
          const systemDiskType = { key: typeKey, label: '' }
          const systemDiskSize = systemDisk.size / 1024
          this.$set(this.form.fd, 'systemDiskType', systemDiskType)
          this.$set(this.form.fd, 'systemDiskSize', systemDiskSize)
          this.form.fc.setFieldsValue({ systemDiskType, systemDiskSize })
          if (systemDisk.medium) this.$set(this.form.fi, 'systemDiskMedium', systemDisk.medium)

          const sysRef = await doWaitRef(() => this.$refs.systemDiskRef)
          if (sysRef) {
            await waitTypesMap(() => sysRef.typesMap)
          }
          const diskComp = await doWaitRef(() => this.$refs.systemDiskRef && this.$refs.systemDiskRef.$refs && this.$refs.systemDiskRef.$refs.disk)
          if (diskComp && diskComp.initData) {
            diskComp.initData(systemDisk, hyper)
          }
          const reapplySys = () => {
            if (!this.form || !this.form.fc) return
            this.$set(this.form.fd, 'systemDiskType', systemDiskType)
            this.$set(this.form.fd, 'systemDiskSize', systemDiskSize)
            this.form.fc.setFieldsValue({ systemDiskType, systemDiskSize })
          }
          setTimeout(reapplySys, 1500)
          setTimeout(reapplySys, 2800)
        }

        if (dataDisks.length) {
          const dataDiskRef = await doWaitRef(() => this.$refs.dataDiskRef)
          if (dataDiskRef && dataDiskRef.add) {
            await waitTypesMap(() => dataDiskRef.typesMap)
            const { medium: dataDiskMedium } = dataDisks[0] || {}
            if (dataDiskMedium) this.$set(this.form.fi, 'dataDiskMedium', dataDiskMedium)
            await new Promise(resolve => setTimeout(resolve, 300))
            const ref = this.$refs.dataDiskRef
            if (ref && ref.add) {
              const existing = [...(ref.dataDisks || [])]
              existing.forEach(d => { if (d && d.key) ref.decrease(d.key) })
              await this.$nextTick()
              // 逐块添加并等待装饰器挂载，避免最后一块 size/type 写入丢失
              for (let i = 0; i < dataDisks.length; i++) {
                const v = dataDisks[i]
                const { schedtags = [] } = v
                ref.add({
                  size: v.size / 1024,
                  diskType: v.backend,
                  disabled: false,
                  sizeDisabled: false,
                  medium: dataDiskMedium || v.medium,
                  filetype: v.fs,
                  mountPath: v.mountpoint,
                  schedtag: schedtags[0] && schedtags[0].id,
                  policy: schedtags[0] && schedtags[0].strategy,
                  snapshot: v.snapshot_id,
                  preallocation: v.preallocation,
                  autoReset: v.auto_reset,
                })
                await this.$nextTick()
                await new Promise(resolve => setTimeout(resolve, 80))
              }
              const reapplyDataDisks = () => {
                const cur = this.$refs.dataDiskRef
                if (!cur || !cur.dataDisks || !this.form || !this.form.fc) return
                const typesMap = cur.typesMap || {}
                const hyperKey = (cur.getHypervisor && cur.getHypervisor()) || hyper
                const isAliyun = hyperKey === HYPERVISORS_MAP.aliyun.key
                const values = {}
                cur.dataDisks.forEach((disk, idx) => {
                  const src = dataDisks[idx]
                  if (!src || !disk || !disk.key) return
                  values[`dataDiskSizes[${disk.key}]`] = src.size / 1024
                  // 非阿里云多块盘共用第一块类型；阿里云按块恢复
                  const backend = (!isAliyun && dataDisks[0] && dataDisks[0].backend)
                    ? dataDisks[0].backend
                    : src.backend
                  if (!backend) return
                  let typeObj = typesMap[backend]
                  if (!typeObj) {
                    const matched = Object.keys(typesMap).find(k => k === backend || k.startsWith(`${backend}/`))
                    if (matched) typeObj = typesMap[matched]
                  }
                  const diskType = typeObj
                    ? { key: typeObj.key, label: typeObj.label, index: idx }
                    : { key: backend, label: backend, index: idx }
                  this.$set(disk, 'diskType', diskType)
                  values[`dataDiskTypes[${disk.key}]`] = diskType
                })
                if (Object.keys(values).length) {
                  this.form.fc.setFieldsValue(values)
                }
              }
              setTimeout(reapplyDataDisks, 500)
              setTimeout(reapplyDataDisks, 1500)
              setTimeout(reapplyDataDisks, 3000)
            }
          }
        }
      } finally {
        this._diskBackfilling = false
        setTimeout(() => {
          this._diskBackfillPending = false
        }, 3500)
      }
    },
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
    onWorldMapModeChange (checked) {
      if (this.type !== 'public') return
      this.$nextTick(() => {
        if (!checked && this.fetchInstanceSpecs) {
          this.fetchInstanceSpecs()
        }
      })
    },
    refreshAreaSelects () {
      if (this.type !== 'public' || !this.$refs.areaSelectRef) return
      // 完整 fetchs；回填场景由 Public @fetchsDone → applyInitPublicAreaFields 接手
      this.$refs.areaSelectRef.fetchs(['provider', 'cloudregion', 'zone'])
    },
    clearPublicLocationFields () {
      const areaFields = {
        provider: [],
        cloudregion: [],
        zone: [],
        cloudprovider: undefined,
        sku: undefined,
      }
      this.form.fc.setFieldsValue(areaFields)
      this._setNewFieldToFd(areaFields, this.form.fc.getFieldsValue())
      if (Object.prototype.hasOwnProperty.call(this.$data, 'cloudaccountId')) {
        this.cloudaccountId = ''
      }
    },
    onRegionSelect (payload) {
      if (this.type !== 'public') return
      const regions = payload?.nearbyRegions || []
      if (!regions.length) {
        this.clearPublicLocationFields()
        this.$nextTick(() => {
          this.refreshAreaSelects()
        })
        return
      }
      if (typeof this.applyMapSelectionToAreaSelects === 'function') {
        this.applyMapSelectionToAreaSelects(regions)
      }
    },
    onRegionMapParamsChange () {
      if (this.type !== 'public' || !this.form.fd.enableWorldMap) return
      this.onRegionSelect({ nearbyRegions: [] })
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
          data.extraData.reason = this.form.fd?.reason
          data.extraData.formType = this.type
          data.extraData.__resource_type__ = this.isServertemplate ? 'servertemplate' : 'server'
          if (this.isServertemplate) { // 创建主机模板
            this.doCreateServertemplate(data)
          } else if (this.isModifyShopCartOrder || this.isOpenWorkflow || this.isModifyWorkflow) {
            // 修改购物车订单项 / 主机申请工单（含修改历史工单）
            await this.checkCreateData(data)
            await this.doForecast(genCreteData, data)
            await this.doCreateWorkflow(data)
            // 成功后记住配置（fromSubmit：受 saveOnSubmitSuccess 开关控制；修改工单 canUse=false 会 no-op）
            this.saveCreateFormDraft(this.buildCreateFormDraftPayload(data), { fromSubmit: true })
          } else if (this.isOpenOrderSetWorkflow) { // 购物车工单
            await this.checkCreateData(data)
            await this.doForecast(genCreteData, data)
            await this.doCreateOrderSetWorkflow(data)
            this.saveCreateFormDraft(this.buildCreateFormDraftPayload(data), { fromSubmit: true })
          } else { // 创建主机
            await this.checkCreateData(data)
            await this.doForecast(genCreteData, data)
            await this.createServer(data)
            this.saveCreateFormDraft(this.buildCreateFormDraftPayload(data), { fromSubmit: true })
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
      // 成功落盘用的草稿体（不含模板名）
      const draftPayload = this.buildCreateFormDraftPayload(data)
      this.servertemplateM.create({ data: templateData })
        .then(() => {
          this.$message.success(i18n.t('compute.text_423'))
          this.saveCreateFormDraft(draftPayload, { fromSubmit: true })
          this.$router.push('/servertemplate')
        })
        .catch((error) => {
          throw error
        })
    },
    async doCreateWorkflow (data) {
      const { workflow = '', order_set_id = '', order_set_idx = '' } = this.$route.query
      if (order_set_id && workflow) {
        const idx = Number(order_set_idx)
        const res = await new this.$Manager('resource_order_sets').get({ id: order_set_id })
        const existing = res.data?.parameters?.[idx]
        if (!existing) {
          this.$message.error(this.$t('common.failed'))
          throw new Error('resource order set item not found')
        }
        const parameters = [...res.data.parameters]
        parameters[idx] = {
          ...existing,
          count: data.__count__,
          parameter: { ...data, price: this.price },
        }
        await new this.$Manager('resource_order_sets').update({ id: order_set_id, data: { parameters } })
        this.$message.success(this.$t('common.success'))
        this.$router.push('/workflow')
        return
      }
      const variables = {
        process_definition_key: WORKFLOW_TYPES.APPLY_MACHINE,
        initiator: this.$store.getters.userInfo.id,
        description: this.form.fd.reason,
        'server-create-paramter': JSON.stringify(data),
        price: this.price,
      }
      this._getProjectDomainInfo(variables)
      if (workflow) {
        await new this.$Manager('historic-process-instances', 'v1')
          .update({ id: `${workflow}/variables`, data: { variables } })
        this.$message.success(i18n.t('compute.text_1045', [data.generate_name]))
        this.$router.push('/workflow')
        return
      }
      await new this.$Manager('process-instances', 'v1')
        .create({ data: { variables } })
      this.$message.success(i18n.t('compute.text_1045', [data.generate_name]))
      this.$router.push('/workflow')
    },
    buildShopCartParameter (data) {
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
      return shopCart
    },
    async doCreateOrderSetWorkflow (data) {
      const { displayname, name } = this.$store.getters.userInfo
      const shopCart = this.buildShopCartParameter(data)
      const orderSetRes = await new this.$Manager('resource_order_sets').create({
        data: {
          auto_execute: false,
          name: this.$t('common.shopcart_workflow_name', [displayname || name, this.$moment().format('YYYY-MM-DD'), uuid()]),
          parameters: [shopCart],
        },
      })
      const variables = {
        process_definition_key: WORKFLOW_TYPES.EXECUTE_RESOURCE_ORDER_SET,
        initiator: this.$store.getters.userInfo.id,
        ids: orderSetRes.data.id,
        parameter: '{}',
        project: shopCart.project,
        project_domain: shopCart.project_domain,
      }
      await new this.$Manager('process-instances', 'v1').create({ data: { variables } })
      this.$message.success(i18n.t('compute.text_1045', [data.generate_name]))
      this.$router.push('/workflow')
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
      // 表单变更防抖写入进行中草稿（受 saveOnChange 开关控制）
      this.scheduleSaveCreateFormDraft()
    },
    /**
     * 草稿附加选项：登录方式 / 手工密码 / 自定义数据
     */
    getCreateFormDraftExtraOptions () {
      const loginType = this.form.fd.loginType
      // 明文密码不落盘
      let user_data
      // 仅文本 input；file 不写入草稿
      if (this.form.fd.custom_data_type === 'input' && this.$refs.customData) {
        user_data = normalizeDraftUserData(this.$refs.customData.customData)
      }
      return { loginType, user_data }
    },
    /**
     * 按高级配置折叠开关组装草稿（关闭则不落盘高级配置字段）
     */
    buildCreateFormDraftPayload (apiPayload) {
      return buildServerCreateDraftPayloadWithAdvanceGate(
        apiPayload,
        this.collapseActive,
        this.getCreateFormDraftExtraOptions(),
      )
    },
    /**
     * 序列化草稿：与工单 server-create-paramter 同形（GenCreateData.all()）
     * @returns {object|null}
     */
    serializeCreateFormDraft () {
      try {
        const fcValues = this.form.fc.getFieldsValue() || {}
        const formData = { ...this.form.fd, ...fcValues }
        const genCreateData = new GenCreateData(formData, this.form.fi)
        const api = genCreateData.all()
        if (!api.extraData) api.extraData = {}
        api.extraData.formType = this.type
        api.extraData.__resource_type__ = this.isServertemplate ? 'servertemplate' : 'server'
        // 提交路径会删 custom_data_type 并写 user_data；防抖序列化仅补文本 input
        if (api.custom_data_type === 'input' && this.$refs.customData) {
          const userData = normalizeDraftUserData(this.$refs.customData.customData)
          if (userData) {
            api.user_data = userData
          }
        } else if (api.custom_data_type === 'file') {
          delete api.custom_data_type
          delete api.user_data
        }
        const payload = this.buildCreateFormDraftPayload(api)
        // 公有云多选：完整落盘平台/区域数组（API 的 prefer_region/hypervisor 仍保持单项兼容）
        if (this.type === 'public' && payload) {
          if (!payload.extraData) payload.extraData = {}
          const toIds = (val) => {
            if (val == null || val === '') return []
            if (Array.isArray(val)) {
              return val.map(v => (v && v.key) || v).filter(Boolean)
            }
            if (typeof val === 'object' && val.key) return [val.key]
            return [val]
          }
          const providers = toIds(formData.provider).map(p => resolveHypervisorKey(p) || String(p).toLowerCase())
          const regions = toIds(formData.cloudregion)
          if (providers.length) {
            payload.extraData.providers = providers
            payload.extraData.provider = providers[0]
            if (!payload.hypervisor) payload.hypervisor = providers[0]
          }
          if (regions.length) {
            payload.extraData.prefer_regions = regions
            if (!payload.prefer_region) payload.prefer_region = regions[0]
          }
        }
        return payload
      } catch (e) {
        return null
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
      let domain = this.$route.query.domain_id
      // 工单或草稿恢复：从 effectiveInitFormData 取域（有草稿时 DomainProject ignoreStorage）
      if ((R.isNil(domain) || R.isEmpty(domain)) && this.isFormBackfill) {
        domain = this.effectiveInitFormData?.extraData?.domain_id
      }
      if (!R.isNil(domain) && !R.isEmpty(domain)) {
        this.form.fc.setFieldsValue({
          domain: { key: domain },
        })
        if (this.type === 'public') {
          this.$nextTick(() => {
            this.refreshAreaSelects()
          })
        }
      }
    },
    fetchProjectCallback () {
      let project = this.$route.query.tenant_id
      // 工单或草稿恢复：从 effectiveInitFormData 取项目
      if ((R.isNil(project) || R.isEmpty(project)) && this.isFormBackfill) {
        project = this.effectiveInitFormData?.project_id
      }
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
          try {
            const genCreateData = new GenCreateData(formData, this.form.fi)
            const data = genCreateData.all()
            if (this.form.fd.bastion_host_enable) {
              const bastionServer = this.getBationServerData()
              data.bastion_server = bastionServer
            }
            if (data.custom_data_type) {
              delete data.custom_data_type
              const { customData } = this.$refs.customData
              if (customData.length) {
                data.user_data = customData
              }
            }
            data.extraData.reason = this.form.fd?.reason
            data.extraData.formType = this.type
            data.extraData.__resource_type__ = 'server'
            await this.checkCreateData(data)
            await this.doForecast(genCreateData, data)
            const shopCart = this.buildShopCartParameter(data)
            this.$message.success(this.$t('common.success'))
            this.$store.commit('shopcart/ADD_SHOP_CART', shopCart)
            this.saveCreateFormDraft(this.buildCreateFormDraftPayload(data), { fromSubmit: true })
          } catch (error) {
            throw error
          } finally {
            this.submiting = false
          }
        })
        .catch(error => {
          throw error
        })
    },
    handleCancel () {
      this.$router.push({
        name: this.isServertemplate ? 'Servertemplate' : 'VMInstanceIndex',
      })
    },
  },
}
