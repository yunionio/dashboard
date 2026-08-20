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
  resolveDraftNetworkType,
  resolveDraftLoginType,
  normalizeDraftUserData,
  isAdvanceConfigOpenFromDraft,
  needOpenAdvanceConfig,
  resolveAdvanceConfigCollapseActive,
} from '@Compute/utils/vminstanceCreateDraft'
import {
  VM_CREATE_FORM_DRAFT_FIELD,
  VM_CREATE_FORM_DRAFT_FIELDS,
  VM_CREATE_FORM_DRAFT_FC_BINDINGS,
  getVmCreateFormDraftScope,
} from '@Compute/utils/vminstanceCreateFormDraft'
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
import { HYPERVISORS_MAP } from '@/constants'
import i18n from '@/locales'
import { deleteInvalid, uuid } from '@/utils/utils'
import { diskSupportTypeMedium } from '@/utils/common/hypervisor'
import { hasSetupKey, isLicense2 } from '@/utils/auth'
import createFormDraftMixin from '@/mixins/createFormDraft'
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
    // 组件级草稿：不再整表种 Decorator；工单仍用 initFormData
    const seedFormData = this.initFormData
    const decorators = new Decorator(SERVER_TYPE[this.type]).createDecorators(seedFormData)
    // 兜底：部分类型/覆盖包可能缺 groups，反亲和组仍需可渲染
    if (!decorators.groups) {
      decorators.groups = {
        groupsEnable: ['groupsEnable', { valuePropName: 'checked', initialValue: false }],
        groups: ['groups', { initialValue: [] }],
      }
    }
    const initFd = getInitialValue(decorators)
    return {
      _initFormPromise: null,
      // 磁盘回填进行中：挡住 imageMsg / typesMap 的清盘逻辑
      _diskBackfillPending: false,
      // initForm 只允许成功进入一次
      _initFormDone: false,
      // 公有云磁盘依赖 sku 挂载，单独标记避免重复回填
      _diskBackfillCompleted: false,
      initSkuData: {},
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
    // 组件 provide 会覆盖 mixin，需带上草稿 inject
    return {
      form: this.form,
      getCreateFormDraftScope: () => this.getCreateFormDraftScope(),
      canUseCreateFormFieldDraft: () => this.canUseCreateFormDraft,
      registerCreateFormFieldDraftFlush: (fn) => this.registerCreateFormFieldDraftFlush(fn),
      readCreateFormFieldDraft: (key) => this.readCreateFormFieldDraft(key),
      writeCreateFormFieldDraft: (key, data, options) => this.writeCreateFormFieldDraft(key, data, options),
      bindCreateFormFieldDraft: (spec) => this.bindCreateFormFieldDraft(spec),
    }
  },
  computed: {
    /**
     * formScope + fieldKey：唯一约定见 vminstanceCreateFormDraft.js
     */
    createFormDraftOptions () {
      return {
        formScope: getVmCreateFormDraftScope({
          type: this.type,
          isServertemplate: this.isServertemplate,
        }),
        // 工单回填 / 工单表单（含修改）：禁用控件级草稿，避免与工单数据打架
        disableWhen: () => this.shouldDisableCreateFormDraft,
      }
    },
    /** 模板传 :form-draft-key="vmDraftFields.sku" */
    vmDraftFields () {
      return VM_CREATE_FORM_DRAFT_FIELDS
    },
    /**
     * 工单回填、带 workflow 的表单（新建/修改工单、改购物车订单）期间禁用草稿
     */
    shouldDisableCreateFormDraft () {
      if (this.isInitForm) return true
      if (this.isModifyWorkflow) return true
      if (this.isModifyShopCartOrder) return true
      return false
    },
    /** 工单回填时关闭局部 storage；普通新建交给组件级草稿 */
    ignoreLocalFormStorage () {
      return this.shouldDisableCreateFormDraft
    },
    isFormBackfill () {
      if (this.isInitForm) return true
      if (this._diskBackfillPending) return true
      return false
    },
    effectiveInitFormData () {
      if (this.isInitForm) return this.initFormData
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
      if (this.isDraftAdvanceConfigOpen) {
        if (this.isFormBackfill) {
          const init = this.effectiveInitFormData || this.initFormData
          if (init?.secgroups?.length) return true
        }
        const draft = this.canUseCreateFormDraft
          ? this.readCreateFormFieldDraft(VM_CREATE_FORM_DRAFT_FIELD.SECGROUP)
          : null
        if (draft?.secgroup_type === 'bind') return true
        if (Array.isArray(draft?.secgroup) && draft.secgroup.length) return true
      }
      return this.form.fd.networkType === 'manual'
    },
    /** 草稿是否展开高级配置（关闭则不回填其中字段） */
    isDraftAdvanceConfigOpen () {
      if (!this.isFormBackfill) {
        // AdvanceConfigBlock 常展开：不再依赖 collapseActive，避免旧「折叠关闭」草稿挡住回填
        return true
      }
      return isAdvanceConfigOpenFromDraft(this.effectiveInitFormData)
    },
    /** 高级区内安全组/调度等 init 保护：工单回填或控件草稿展开时开启 */
    preserveAdvanceInitProps () {
      return this.isFormBackfill || (this.canUseCreateFormDraft && this.isDraftAdvanceConfigOpen)
    },
    draftInitSchedtags () {
      if (!this.isDraftAdvanceConfigOpen) return []
      if (this.isFormBackfill) {
        const init = this.effectiveInitFormData || {}
        if (init.schedtags?.length) return init.schedtags
        if (init.extraData?.schedtags?.length) return init.extraData.schedtags
        return []
      }
      if (!this.canUseCreateFormDraft) return []
      const draft = this.readCreateFormFieldDraft(VM_CREATE_FORM_DRAFT_FIELD.SCHED_POLICY)
      return Array.isArray(draft?.schedtags) ? draft.schedtags : []
    },
    /** 有网络控件草稿时禁止 capability 刷新拆掉 NetworkConfig */
    ignoreAutoNetworkTypeForDraft () {
      if (this.isFormBackfill) return true
      if (!this.canUseCreateFormDraft) return false
      const draft = this.readCreateFormFieldDraft(VM_CREATE_FORM_DRAFT_FIELD.SERVER_NETWORK)
      if (!draft) return false
      if (Array.isArray(draft.nets) && draft.nets.length) return true
      return draft.networkType === NETWORK_OPTIONS_MAP.manual.key ||
        draft.networkType === NETWORK_OPTIONS_MAP.schedtag.key
    },
    draftInitSecgroups () {
      if (!this.isDraftAdvanceConfigOpen) return []
      let secgroups = []
      if (this.isFormBackfill) {
        secgroups = this.effectiveInitFormData?.secgroups || []
      } else if (this.canUseCreateFormDraft) {
        const draft = this.readCreateFormFieldDraft(VM_CREATE_FORM_DRAFT_FIELD.SECGROUP)
        secgroups = draft?.secgroup || []
      }
      if (!Array.isArray(secgroups)) return []
      return secgroups.map((item) => {
        if (item == null) return null
        if (typeof item === 'string' || typeof item === 'number') return String(item)
        return item.id || item.key || item.value || null
      }).filter(Boolean)
    },
    draftInitPreferHost () {
      if (!this.isDraftAdvanceConfigOpen) return ''
      if (this.isFormBackfill) {
        const init = this.effectiveInitFormData || {}
        return init.prefer_host || init.extraData?.prefer_host || ''
      }
      if (!this.canUseCreateFormDraft) return ''
      const draft = this.readCreateFormFieldDraft(VM_CREATE_FORM_DRAFT_FIELD.SCHED_POLICY)
      return draft?.prefer_host || ''
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
    // 页面级：高级配置开关（UI 已常展开，草稿固定为 true，兼容旧字段）
    this.bindCreateFormFieldDraft({
      key: VM_CREATE_FORM_DRAFT_FIELD.ADVANCE_CONFIG_OPEN,
      get: () => true,
      set: (open) => {
        this.collapseActive = open ? ['1'] : []
      },
    })
    // 简单 form.fc 字段（数量 / 开关 / bios 等）批量绑定
    this.bindVmCreateFormFcDrafts()
    // 内部状态仍置为展开，保证 initPreferHost / 延迟重试等门闩通过
    this.ensureAdvanceConfigOpenForDraft()
  },
  mounted () {
    // 工单走 initForm；普通新建控件草稿走各组件 + restoreAdvance*
    this.$nextTick(() => {
      this.initForm()
      this.restoreAdvanceFormFieldDrafts()
    })
  },
  watch: {
    collapseActive (val) {
      if (!this.canUseCreateFormDraft) return
      if (this.isFormBackfill) return
      if (this._advanceDraftRestoring) return
      // UI 常展开：始终记为打开，避免旧 false 残留导致不回填
      this.writeCreateFormFieldDraft(VM_CREATE_FORM_DRAFT_FIELD.ADVANCE_CONFIG_OPEN, true)
      if (!this._advanceDraftRestoreScheduled) {
        this._advanceDraftRestoreScheduled = true
        this.$nextTick(() => {
          this._advanceDraftRestoreScheduled = false
          this.restoreAdvanceFormFieldDrafts()
        })
      }
    },
    'form.fi.imageMsg': {
      deep: true,
      handler (val, oldVal) {
        if (R.equals(val, oldVal)) return
        this.$nextTick(() => {
          // 回填期间镜像变化不要清空数据盘，否则工单/草稿里的盘会被冲掉
          if (this.isFormBackfill || this.form?.fi?.diskDraftRestoring) return
          // 首屏：有数据盘草稿时，镜像异步到位不要立刻清空（仅跳过一次）
          if (this.canUseCreateFormDraft && !this._diskDraftSkipImageResetOnce) {
            const diskDraft = this.readCreateFormFieldDraft(VM_CREATE_FORM_DRAFT_FIELD.DATA_DISK)
            if (diskDraft?.__dataDiskKeys?.length) {
              this._diskDraftSkipImageResetOnce = true
              return
            }
          }
          this._resetDataDisk() // 重置数据盘数据
        })
      },
    },
    'form.fi.capability': {
      deep: true,
      handler (val) {
        if (!val || R.isEmpty(val)) return
        if (!this.canUseCreateFormDraft) return
        if (this.createFormDraftUserInteracted) return
        this.$nextTick(() => this.restoreVmDiskFormFieldDrafts())
      },
    },
    'form.fd.hypervisor' (val, oldVal) {
      if (!this.canUseCreateFormDraft) return
      if (this.createFormDraftUserInteracted) return
      if (val === oldVal) return
      this.$nextTick(() => {
        this.restoreVmDiskFormFieldDrafts()
        this.restoreAdvanceFormFieldDrafts()
      })
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
      if (this.type === 'public' && this.canUseCreateFormDraft) {
        this.$nextTick(() => this.restoreVmDiskFormFieldDrafts())
      }
      if (this.type !== 'public') return
      if (!this.isFormBackfill && !this.isInitForm) return
      if (!R.is(Object, val) || this._diskBackfillCompleted || this._diskBackfilling) return
      const initData = this.initFormData
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
    /**
     * 高级配置 UI 已常展开：内部 collapseActive 始终打开，保证草稿回填门闩通过。
     * 不再尊重旧草稿 advanceConfigOpen === false（否则会出现「区块可见但不回填」）。
     */
    ensureAdvanceConfigOpenForDraft () {
      if (!this.canUseCreateFormDraft) return
      const alreadyOpen = Array.isArray(this.collapseActive) && this.collapseActive.includes('1')
      if (!alreadyOpen) {
        this._advanceDraftRestoring = true
        this.collapseActive = ['1']
        this.$nextTick(() => {
          this._advanceDraftRestoring = false
        })
      }
      const openDraft = this.readCreateFormFieldDraft(VM_CREATE_FORM_DRAFT_FIELD.ADVANCE_CONFIG_OPEN)
      if (openDraft !== true) {
        this.writeCreateFormFieldDraft(VM_CREATE_FORM_DRAFT_FIELD.ADVANCE_CONFIG_OPEN, true)
      }
    },
    hasAdvanceFieldDrafts () {
      if (!this.canUseCreateFormDraft) return false
      const keys = [
        VM_CREATE_FORM_DRAFT_FIELD.EIP,
        VM_CREATE_FORM_DRAFT_FIELD.SECGROUP,
        VM_CREATE_FORM_DRAFT_FIELD.SCHED_POLICY,
        VM_CREATE_FORM_DRAFT_FIELD.BACKUP,
        VM_CREATE_FORM_DRAFT_FIELD.CUSTOM_DATA,
        VM_CREATE_FORM_DRAFT_FIELD.BASTION_HOST,
        VM_CREATE_FORM_DRAFT_FIELD.INSTANCE_GROUPS,
        VM_CREATE_FORM_DRAFT_FIELD.ENCRYPT_KEYS,
        VM_CREATE_FORM_DRAFT_FIELD.BIOS,
        VM_CREATE_FORM_DRAFT_FIELD.VDI,
        VM_CREATE_FORM_DRAFT_FIELD.VGA,
        VM_CREATE_FORM_DRAFT_FIELD.MACHINE,
        VM_CREATE_FORM_DRAFT_FIELD.IS_DAEMON,
      ]
      return keys.some((key) => {
        const draft = this.readCreateFormFieldDraft(key)
        if (draft === null || draft === undefined) return false
        if (typeof draft === 'object' && !Array.isArray(draft) && !Object.keys(draft).length) return false
        return true
      })
    },
    /**
     * 高级配置区：FC 字段 + 折叠内子组件二次回填（hypervisor / collapse 晚就绪）
     * 用户已操作后不再延迟回填，且尽快放下 advanceDraftRestoring，避免挡清空/改值
     */
    restoreAdvanceFormFieldDrafts () {
      if (!this.canUseCreateFormDraft) return
      if (this.isInitForm) return
      if (this.createFormDraftUserInteracted) return
      if (this._advanceDraftRestoreRunning) return
      this._advanceDraftRestoreRunning = true
      if (this.form?.fi) this.$set(this.form.fi, 'advanceDraftRestoring', true)
      try {
        this.ensureAdvanceConfigOpenForDraft()
        if (!this.isDraftAdvanceConfigOpen) {
          this.clearAdvanceDraftRestoring()
          return
        }
        // bios/vdi/vga/machine 等：v-if=isKvm 晚挂载，需重试 FC restore
        ;[
          VM_CREATE_FORM_DRAFT_FIELD.BIOS,
          VM_CREATE_FORM_DRAFT_FIELD.VDI,
          VM_CREATE_FORM_DRAFT_FIELD.VGA,
          VM_CREATE_FORM_DRAFT_FIELD.MACHINE,
          VM_CREATE_FORM_DRAFT_FIELD.IS_DAEMON,
          VM_CREATE_FORM_DRAFT_FIELD.DEPLOY_TELEGRAF,
        ].forEach((key) => {
          try { this.restoreCreateFormFieldDraft(key) } catch (e) { /* ignore */ }
        })
        this.$nextTick(() => {
          this.invokeAdvanceDraftComponentRestores()
          // 保护窗口尽量短：仅挡住回填同帧/紧随其后的清空
          setTimeout(() => this.clearAdvanceDraftRestoring(), 400)
        })
        if (!this._advanceDraftRetryTimers) {
          this._advanceDraftRetryTimers = true
          // 晚挂载组件（showEip / isLocalDisk）再补一次；用户已点过页面则停
          ;[800, 2000].forEach((ms) => {
            setTimeout(() => {
              if (!this.canRunAdvanceDraftRetry()) return
              this.invokeAdvanceDraftComponentRestores()
            }, ms)
          })
        }
      } finally {
        this.$nextTick(() => {
          this._advanceDraftRestoreRunning = false
        })
      }
    },
    canRunAdvanceDraftRetry () {
      return this.canUseCreateFormDraft &&
        !this.isInitForm &&
        !this.createFormDraftUserInteracted &&
        this.isDraftAdvanceConfigOpen
    },
    invokeAdvanceDraftComponentRestores () {
      ;[
        this.$refs.eipConfigRef,
        this.$refs.secgroupConfigRef,
        this.$refs.schedPolicyRef,
        this.$refs.backupRef,
        this.$refs.customData,
        this.$refs.bastionHostRef,
        this.$refs.instanceGroupsRef,
        this.$refs.encryptKeysRef,
      ].forEach((ref) => {
        if (ref && typeof ref.restoreFormFieldDraftFields === 'function') {
          try { ref.restoreFormFieldDraftFields() } catch (e) { /* ignore */ }
        }
      })
    },
    clearAdvanceDraftRestoring () {
      if (this.form?.fi && this.form.fi.advanceDraftRestoring) {
        this.$set(this.form.fi, 'advanceDraftRestoring', false)
      }
    },
    markCreateFormDraftUserInteracted () {
      const was = this.createFormDraftUserInteracted
      // 调用宿主 mixin 原逻辑
      if (!was) {
        this.createFormDraftUserInteracted = true
        this._unbindCreateFormDraftUserInteraction()
      }
      this.clearAdvanceDraftRestoring()
    },
    /**
     * 控件草稿：capability/sku 就绪后回填系统盘/数据盘（对齐工单 backfillDisksFromInitData）
     */
    async restoreVmDiskFormFieldDrafts () {
      if (!this.canUseCreateFormDraft) return
      if (this.isInitForm) return
      if (this._diskDraftRestoreDone || this._diskDraftRestoreRunning) return
      if (this._diskBackfilling) return
      const sysDraft = this.readCreateFormFieldDraft(VM_CREATE_FORM_DRAFT_FIELD.SYSTEM_DISK)
      const dataDraft = this.readCreateFormFieldDraft(VM_CREATE_FORM_DRAFT_FIELD.DATA_DISK)
      if (!sysDraft && !dataDraft) return
      // 公有云需 sku 后盘组件才挂载
      if (this.type === 'public' && !this.form?.fd?.sku) return
      if (this.type !== 'public' && !this.form?.fd?.hypervisor) return

      this._diskDraftRestoreRunning = true
      this._diskBackfillPending = true
      if (this.form.fi) this.$set(this.form.fi, 'diskDraftRestoring', true)

      const waitRef = (getter, timeout = 12000) => new Promise(resolve => {
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

      try {
        if (sysDraft) {
          await this.restoreSystemDiskFromFieldDraft(sysDraft, { waitRef, waitTypesMap })
        }
        if (dataDraft) {
          await this.restoreDataDiskFromFieldDraft(dataDraft, { waitRef, waitTypesMap })
        }
        this._diskDraftRestoreDone = true
        this.$nextTick(() => this.reconcileDiskFormStateBeforeSubmit())
        setTimeout(() => this.reconcileDiskFormStateBeforeSubmit(), 4600)
      } finally {
        this._diskDraftRestoreRunning = false
        setTimeout(() => {
          this._diskBackfillPending = false
          if (this.form?.fi) this.$set(this.form.fi, 'diskDraftRestoring', false)
        }, 5000)
      }
    },
    async restoreSystemDiskFromFieldDraft (draft, { waitRef, waitTypesMap }) {
      if (!draft || !this.form?.fc) return
      const sysRef = await waitRef(() => this.$refs.systemDiskRef)
      if (sysRef) await waitTypesMap(() => sysRef.typesMap)
      const typeVal = draft.systemDiskType || draft[sysRef?.decorator?.type?.[0]]
      const sizeVal = draft.systemDiskSize ?? draft[sysRef?.decorator?.size?.[0]]
      if (!typeVal?.key && sizeVal == null) {
        if (sysRef?.applyCreateFormFieldDraft) sysRef.applyCreateFormFieldDraft(draft)
        return
      }
      const hyper = (this.form.fd.hypervisor || '').toLowerCase()
      if (typeVal?.key) {
        const medium = String(typeVal.key).split('/')[1] || 'ssd'
        if (medium) this.$set(this.form.fi, 'systemDiskMedium', medium)
      }
      if (sysRef?.applyCreateFormFieldDraft) {
        sysRef.applyCreateFormFieldDraft(draft)
      } else if (sysRef?.applySysDiskDraftToForm) {
        sysRef.applySysDiskDraftToForm(draft)
      }
      const diskComp = sysRef?.$refs?.disk
      if (diskComp?.initData && typeVal?.key) {
        const parts = String(typeVal.key).split('/')
        const clampedSize = sysRef.clampSysDiskDraftSize(sizeVal, typeVal.key)
        const initPayload = {
          backend: parts[0],
          medium: parts[1] || 'ssd',
          size: (clampedSize || 0) * 1024,
        }
        if (draft.systemDiskStorage) initPayload.storage_id = draft.systemDiskStorage
        if (draft.systemDiskAutoReset) initPayload.auto_reset = draft.systemDiskAutoReset
        if (draft.systemDiskIops) initPayload.iops = draft.systemDiskIops
        if (draft.systemDiskThroughput) initPayload.throughput = draft.systemDiskThroughput
        if (draft.systemDiskPreallocation) initPayload.preallocation = draft.systemDiskPreallocation
        if (draft.systemDiskSchedtag) {
          initPayload.schedtags = [{
            id: draft.systemDiskSchedtag,
            strategy: draft.systemDiskPolicy || '',
          }]
        }
        diskComp.initData(initPayload, hyper)
      }
    },
    async restoreDataDiskFromFieldDraft (draft, { waitRef, waitTypesMap }) {
      if (!draft || !this.form?.fc) return
      // 显式空 keys：用户已删光数据盘，不再回填（也不走其它字段 fallback）
      if (Array.isArray(draft.__dataDiskKeys) && draft.__dataDiskKeys.length === 0) {
        const dataRef = await waitRef(() => this.$refs.dataDiskRef)
        if (dataRef) dataRef.dataDisks = []
        return
      }
      const keys = Array.isArray(draft.__dataDiskKeys) ? draft.__dataDiskKeys.filter(Boolean) : []
      const nestedSizes = draft.dataDiskSizes && typeof draft.dataDiskSizes === 'object' ? draft.dataDiskSizes : null
      const resolvedKeys = keys.length
        ? keys
        : (nestedSizes ? Object.keys(nestedSizes) : Object.keys(draft)
          .map((k) => {
            const m = k.match(/^dataDiskSizes\[(.+)\]$/)
            return m && m[1]
          }).filter(Boolean))
      if (!resolvedKeys.length) {
        const dataRef = await waitRef(() => this.$refs.dataDiskRef)
        if (dataRef && dataRef.applyCreateFormFieldDraft) dataRef.applyCreateFormFieldDraft(draft)
        return
      }
      const dataDiskRef = await waitRef(() => this.$refs.dataDiskRef)
      if (!dataDiskRef || !dataDiskRef.add) return
      await waitTypesMap(() => dataDiskRef.typesMap)
      await new Promise(resolve => setTimeout(resolve, 200))
      const ref = this.$refs.dataDiskRef
      if (!ref || !ref.add) return
      ;[...(ref.dataDisks || [])].forEach((d) => {
        if (d && d.key) ref.decrease(d.key)
      })
      await this.$nextTick()
      const sources = resolvedKeys.map((key) => {
        const typeVal = draft[`dataDiskTypes[${key}]`] || (draft.dataDiskTypes && draft.dataDiskTypes[key])
        const sizeVal = draft[`dataDiskSizes[${key}]`] != null
          ? draft[`dataDiskSizes[${key}]`]
          : (draft.dataDiskSizes && draft.dataDiskSizes[key])
        const typeKey = (typeVal && typeVal.key) || ''
        const parts = String(typeKey).split('/')
        return {
          backend: parts[0] || typeKey,
          medium: parts[1],
          size: sizeVal != null ? Number(sizeVal) : undefined,
          schedtag: draft[`dataDiskSchedtags[${key}]`] || (draft.dataDiskSchedtags && draft.dataDiskSchedtags[key]),
          policy: draft[`dataDiskPolicys[${key}]`] || (draft.dataDiskPolicys && draft.dataDiskPolicys[key]),
          snapshot: draft[`dataDiskSnapshots[${key}]`] || (draft.dataDiskSnapshots && draft.dataDiskSnapshots[key]),
          storage: draft[`dataDiskStorages[${key}]`] || (draft.dataDiskStorages && draft.dataDiskStorages[key]),
          iops: draft[`dataDiskIops[${key}]`] != null ? draft[`dataDiskIops[${key}]`] : (draft.dataDiskIops && draft.dataDiskIops[key]),
          throughput: draft[`dataDiskThroughputs[${key}]`] != null ? draft[`dataDiskThroughputs[${key}]`] : (draft.dataDiskThroughputs && draft.dataDiskThroughputs[key]),
          filetype: draft[`dataDiskFiletypes[${key}]`] || (draft.dataDiskFiletypes && draft.dataDiskFiletypes[key]),
          mountPath: draft[`dataDiskMountPaths[${key}]`] || (draft.dataDiskMountPaths && draft.dataDiskMountPaths[key]),
          autoReset: draft[`dataDiskAutoReset[${key}]`] != null ? draft[`dataDiskAutoReset[${key}]`] : (draft.dataDiskAutoReset && draft.dataDiskAutoReset[key]),
          preallocation: draft[`dataDiskPreallocation[${key}]`] || (draft.dataDiskPreallocation && draft.dataDiskPreallocation[key]),
        }
      })
      for (let i = 0; i < sources.length; i++) {
        const v = sources[i]
        ref.add({
          size: v.size,
          diskType: v.backend,
          medium: v.medium,
          schedtag: v.schedtag,
          policy: v.policy,
          snapshot: v.snapshot,
          filetype: v.filetype,
          mountPath: v.mountPath,
          preallocation: v.preallocation,
          autoReset: v.autoReset,
        })
        await this.$nextTick()
        await new Promise(resolve => setTimeout(resolve, 80))
      }
      const reapplyDataDisks = () => {
        const cur = this.$refs.dataDiskRef
        if (!cur || !cur.dataDisks || !this.form || !this.form.fc) return
        const typesMap = cur.typesMap || {}
        const values = {}
        cur.dataDisks.forEach((disk, idx) => {
          const src = sources[idx]
          if (!src || !disk || !disk.key) return
          if (src.size != null) {
            values[`dataDiskSizes[${disk.key}]`] = cur.clampDataDiskDraftSize(src.size, cur.min(idx), cur.max(idx))
          }
          if (src.backend) {
            let typeObj = typesMap[src.backend] || typesMap[`${src.backend}/${src.medium}`]
            if (!typeObj) {
              const matched = Object.keys(typesMap).find(k => k === src.backend || k.startsWith(`${src.backend}/`))
              if (matched) typeObj = typesMap[matched]
            }
            const diskType = typeObj
              ? { key: typeObj.key, label: typeObj.label, index: idx }
              : { key: src.medium ? `${src.backend}/${src.medium}` : src.backend, label: src.backend, index: idx }
            this.$set(disk, 'diskType', diskType)
            values[`dataDiskTypes[${disk.key}]`] = diskType
          }
          if (src.schedtag) values[`dataDiskSchedtags[${disk.key}]`] = src.schedtag
          if (src.policy) values[`dataDiskPolicys[${disk.key}]`] = src.policy
          if (src.snapshot) values[`dataDiskSnapshots[${disk.key}]`] = src.snapshot
          if (src.storage) values[`dataDiskStorages[${disk.key}]`] = src.storage
          if (src.iops != null) values[`dataDiskIops[${disk.key}]`] = src.iops
          if (src.throughput != null) values[`dataDiskThroughputs[${disk.key}]`] = src.throughput
          if (src.filetype) values[`dataDiskFiletypes[${disk.key}]`] = src.filetype
          if (src.mountPath) values[`dataDiskMountPaths[${disk.key}]`] = src.mountPath
          if (src.autoReset != null) values[`dataDiskAutoReset[${disk.key}]`] = src.autoReset
          if (src.preallocation) values[`dataDiskPreallocation[${disk.key}]`] = src.preallocation
        })
        if (Object.keys(values).length) this.setFormFieldsAndSyncFd(values)
      }
      setTimeout(reapplyDataDisks, 500)
      setTimeout(reapplyDataDisks, 1500)
      setTimeout(reapplyDataDisks, 3000)
    },
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
     * 仅工单回填（isInitForm）。普通新建的控件草稿由各组件 / restoreAdvance* 自行恢复，不走此路径。
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
      const initData = this.initFormData
      if (!(this.isInitForm && initData && initData.extraData && this.form && this.form.fc)) {
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

      // 等子组件挂载（公有云 v-if 晚挂载）
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

      // —— 管理员密码方式回填（本方法仅工单；明文密码可回填）——
      const loginType = resolveDraftLoginType(initData)
      if (loginType) {
        this.$set(this.form.fd, 'loginType', loginType)
        this.form.fc.setFieldsValue({ loginType })
      }
      const loginPassword = (initData.extraData && initData.extraData.loginPassword) || initData.password || ''
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

      // 工单不回填 file 型自定义数据；仅文本 input
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
      this.writeCreateFormFieldDraft(VM_CREATE_FORM_DRAFT_FIELD.ENABLE_WORLD_MAP, !!checked)
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
      this.reconcileDiskFormStateBeforeSubmit()
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
            this.flushCreateFormFieldDrafts()
          } else if (this.isOpenOrderSetWorkflow) { // 购物车工单
            await this.checkCreateData(data)
            await this.doForecast(genCreteData, data)
            await this.doCreateOrderSetWorkflow(data)
            this.flushCreateFormFieldDrafts()
          } else { // 创建主机
            await this.checkCreateData(data)
            await this.doForecast(genCreteData, data)
            await this.createServer(data)
            this.flushCreateFormFieldDrafts()
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
      // 成功后各组件 flush 自己的草稿
      this.servertemplateM.create({ data: templateData })
        .then(() => {
          this.$message.success(i18n.t('compute.text_423'))
          this.flushCreateFormFieldDrafts()
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
      // 不限：只设 CPU，不改内存（用户未动内存应保留原值）
      if (Number(cpu) === 0) {
        this.form.fc.setFieldsValue({ vcpu: 0 })
        return
      }
      const memOpts = this.form.fi.cpuMem.cpu_mems_mb[cpu] || this.form.fi.cpuMem.cpu_mems_mb[String(cpu)]
      if (!memOpts || !memOpts.length) { // 没有内存Opts，则内存为0
        let vcpu = cpu
        if (!this.form.fi.cpuMem.cpus.includes(cpu) && !this.form.fi.cpuMem.cpus.some(c => String(c) === String(cpu))) { // CPU的Opts不包括cpu的话
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
      } else if (this.form.fc.getFieldValue('vcpu') !== cpu && String(this.form.fc.getFieldValue('vcpu')) !== String(cpu)) { // 因之前未获取cpu设置为0，这一步设置回来
        this.form.fc.setFieldsValue({
          vcpu: cpu,
        })
      }
      this.form.fi.cpuMem.mems_mb = memOpts
      const currentMem = this.form.fc.getFieldValue('vmem')
      if (currentMem != null && currentMem !== '' && Number(currentMem) !== 0 && memOpts.some(m => Number(m) === Number(currentMem))) {
        return
      }
      // 内存 options 变化：优先草稿，否则 2G / 第一项（不写草稿）；草稿 0=不限
      const draftMem = this.canUseCreateFormDraft
        ? this.readCreateFormFieldDraft(VM_CREATE_FORM_DRAFT_FIELD.VMEM)
        : null
      if (draftMem === 0 || draftMem === '0') {
        this.form.fc.setFieldsValue({ vmem: 0 })
        return
      }
      let defaultMem = 2048
      if (draftMem != null && draftMem !== '' && memOpts.some(m => Number(m) === Number(draftMem))) {
        defaultMem = Number(draftMem)
      } else if (!memOpts.some(m => Number(m) === 2048)) {
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
      this.syncVmCreateFormFcDrafts(newField)
      this.syncVmDiskFormFieldDrafts(newField)
    },
    /** setFieldsValue 后同步 fd（程序化赋值不走 onValuesChange） */
    setFormFieldsAndSyncFd (values) {
      if (!this.form?.fc || !values || typeof values !== 'object') return
      this.form.fc.setFieldsValue(values)
      const formValue = this.form.fc.getFieldsValue()
      this._setNewFieldToFd(values, formValue)
    },
    /**
     * 提交/草稿回填完成后：系统盘与数据盘 fc/fd 对齐，值经 clamp 保证合法
     */
    reconcileDiskFormStateBeforeSubmit () {
      if (!this.form?.fc) return
      const sysRef = this.$refs.systemDiskRef
      if (sysRef) {
        const typeKey = sysRef.decorator?.type?.[0] || 'systemDiskType'
        const sizeKey = sysRef.decorator?.size?.[0] || 'systemDiskSize'
        let typeVal = this.form.fc.getFieldValue(typeKey) || this.form.fd?.[typeKey] || this.form.fd?.systemDiskType
        const fcSize = this.form.fc.getFieldValue(sizeKey)
        const fdSize = this.form.fd?.[sizeKey] ?? this.form.fd?.systemDiskSize
        typeVal = sysRef.resolveSysDiskTypeFromDraft(typeVal)
        const typeKeyForClamp = typeVal?.key
        let sizeVal = fcSize
        if (sizeVal == null || sizeVal === '') sizeVal = fdSize
        if (fdSize != null && fcSize != null && Number(fdSize) !== Number(fcSize)) {
          const clampedFc = sysRef.clampSysDiskDraftSize(fcSize, typeKeyForClamp)
          const clampedFd = sysRef.clampSysDiskDraftSize(fdSize, typeKeyForClamp)
          const diskMsg = (typeKeyForClamp && sysRef.typesMap?.[typeKeyForClamp]) || {}
          const minDefault = Math.max(sysRef.imageMinDisk || 0, diskMsg.sysMin || 10, 0)
          if (Number(clampedFd) > Number(clampedFc) && Number(clampedFc) <= minDefault) {
            sizeVal = clampedFd
          } else {
            sizeVal = clampedFc
          }
        } else {
          sizeVal = sysRef.clampSysDiskDraftSize(sizeVal, typeKeyForClamp)
        }
        const values = {}
        if (typeVal) values[typeKey] = typeVal
        if (sizeVal != null && sizeVal !== '') values[sizeKey] = sizeVal
        if (Object.keys(values).length) this.setFormFieldsAndSyncFd(values)
      }
      const dataRef = this.$refs.dataDiskRef
      if (dataRef?.dataDisks?.length) {
        const flat = {}
        dataRef.dataDisks.forEach((disk, index) => {
          if (!disk?.key) return
          const typeField = dataRef._fp('Types', disk.key)
          const sizeField = dataRef._fp('Sizes', disk.key)
          const typeVal = this.form.fc.getFieldValue(typeField) || disk.diskType
          const sizeVal = this.form.fc.getFieldValue(sizeField)
          const resolvedType = dataRef.resolveDataDiskTypeFromDraft(typeVal, index)
          const nextSize = dataRef.clampDataDiskDraftSize(sizeVal, dataRef.min(index), dataRef.max(index))
          if (resolvedType) flat[typeField] = resolvedType
          if (nextSize != null) flat[sizeField] = nextSize
        })
        if (Object.keys(flat).length) this.setFormFieldsAndSyncFd(flat)
      }
    },
    /**
     * 系统盘/数据盘字段变更时落盘（setFieldsValue 不会走此路径）
     */
    syncVmDiskFormFieldDrafts (newField) {
      if (!this.canUseCreateFormDraft || !newField || typeof newField !== 'object') return
      if (this.isFormBackfill || this.form?.fi?.diskDraftRestoring) return
      // 仅用户交互后落盘
      if (!this.createFormDraftUserInteracted) return
      const keys = Object.keys(newField)
      const touchedSys = keys.some(k => /systemdisk/i.test(k))
      const touchedData = keys.some(k => /datadisk/i.test(k))
      if (touchedSys && this.$refs.systemDiskRef && typeof this.$refs.systemDiskRef.persistFormFieldDraftSnapshot === 'function') {
        this.$nextTick(() => this.$refs.systemDiskRef.persistFormFieldDraftSnapshot())
      }
      if (touchedData && this.$refs.dataDiskRef && typeof this.$refs.dataDiskRef.persistFormFieldDraftSnapshot === 'function') {
        this.$nextTick(() => this.$refs.dataDiskRef.persistFormFieldDraftSnapshot())
      }
    },
    /**
     * 批量绑定 VM_CREATE_FORM_DRAFT_FC_BINDINGS（进页回填 + flush）
     */
    bindVmCreateFormFcDrafts () {
      this._vmCreateFormFcDraftMap = Object.create(null)
      ;(VM_CREATE_FORM_DRAFT_FC_BINDINGS || []).forEach((item) => {
        if (!item?.key || !item.formField) return
        if (item.types && !item.types.includes(this.type)) return
        this._vmCreateFormFcDraftMap[item.formField] = item.key
        this.bindFormFcFieldDraft(item.key, { formField: item.formField })
      })
    },
    /**
     * form.fc 字段变更时同步对应控件草稿
     * @param {object} newField
     */
    syncVmCreateFormFcDrafts (newField) {
      if (!this.canUseCreateFormDraft || !newField || typeof newField !== 'object') return
      // 仅用户交互后落盘，避免程序化 setFieldsValue 污染草稿
      if (!this.createFormDraftUserInteracted) return
      const map = this._vmCreateFormFcDraftMap || {}
      Object.keys(newField).forEach((formField) => {
        const draftKey = map[formField]
        if (!draftKey) return
        this.writeCreateFormFieldDraft(draftKey, newField[formField])
      })
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
      this.reconcileDiskFormStateBeforeSubmit()
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
            this.flushCreateFormFieldDrafts()
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
