import * as R from 'ramda'
import _ from 'lodash'
import { SCHED_POLICY_OPTIONS_MAP, SERVER_TYPE, SELECT_IMAGE_KEY_SUFFIX, NETWORK_OPTIONS_MAP } from '@Compute/constants'
import OsSelect from '@Compute/sections/OsSelect'
import CpuRadio from '@Compute/sections/CpuRadio'
import MemRadio from '@Compute/sections/MemRadio'
import sku from '@Compute/sections/SKU'
import gpu from '@Compute/sections/GPU/index'
import pci from '@Compute/sections/PCI'
import {
  hasAdvanceConfigInitFields,
  resolveDraftNetworkType,
  resolveDraftPortMappings,
} from '@Compute/utils/vminstanceContainerCreateDraft'
import {
  CONTAINER_CREATE_FORM_DRAFT_FIELD,
  CONTAINER_CREATE_FORM_DRAFT_FIELDS,
  getContainerCreateFormDraftScope,
} from '@Compute/utils/vminstanceContainerCreateFormDraft'
import ServerNetwork from '@Compute/sections/ServerNetwork'
import SchedPolicy from '@Compute/sections/SchedPolicy'
import Duration from '@Compute/sections/Duration'
import InstanceGroups from '@Compute/sections/InstanceGroups'
import DataDisk from '@Compute/sections/DataDisk'
import HostName from '@Compute/sections/HostName'
import storage from '@/utils/storage'
import workflowMixin from '@/mixins/workflow'
import { Manager } from '@/utils/manager'
import { isSuccess } from '@/utils/http'
import NameRepeated from '@/sections/NameRepeated'
import CloudregionZone from '@/sections/CloudregionZone'
import DomainProject from '@/sections/DomainProject'
import { getInitialValue } from '@/utils/common/ant'
import { IMAGES_TYPE_MAP } from '@/constants/compute'
import { HYPERVISORS_MAP } from '@/constants'
import { WORKFLOW_TYPES } from '@/constants/workflow'
import i18n from '@/locales'
import { deleteInvalid, uuid } from '@/utils/utils'
import createFormDraftMixin from '@/mixins/createFormDraft'
import Tag from '../components/Tag'
import { Decorator, GenCreateData } from '../../utils/createServer'
import BottomBar from '../components/BottomBar'

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
    CpuRadio,
    MemRadio,
    sku,
    ServerNetwork,
    DataDisk,
    gpu,
    SchedPolicy,
    DomainProject,
    Duration,
    InstanceGroups,
    Tag,
    NameRepeated,
    HostName,
    pci,
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
    const routeInitData = this.$route.params?.data || {}
    const workflowInitData = (this.isInitForm || this.$route.query.workflow)
      ? (this.initFormData && !R.isEmpty(this.initFormData) ? this.initFormData : routeInitData)
      : {}
    const seedFormData = workflowInitData
    const decorators = new Decorator(SERVER_TYPE[this.type]).createDecorators(seedFormData)
    if (!decorators.groups) {
      decorators.groups = {
        groupsEnable: ['groupsEnable', { valuePropName: 'checked', initialValue: false }],
        groups: ['groups', { initialValue: [] }],
      }
    }
    const initFd = getInitialValue(decorators)
    return {
      _initFormPromise: null,
      _initFormDone: false,
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
          errPanes: [], // 表单校验错误的tabs
          containerPanes: [], // 子组件同步的tabs
        },
        fd: { ...initFd, os: '' },
      },
      decorators,
      capabilityParams: {}, // 防止 capability 反复调用，这里对当前的接口参数做记录
      price: null,
      tagDefaultChecked: {},
      hostNameValidate: {
        validateStatus: '',
        errorMsg: '',
      },
      dataDiskInterval: null,
    }
  },
  provide () {
    return {
      form: this.form,
      getCreateFormDraftScope: () => this.getCreateFormDraftScope(),
      canUseCreateFormFieldDraft: () => this.canRestoreCreateFormDraft,
      canRestoreCreateFormFieldDraft: () => this.canRestoreCreateFormDraft,
      canBackupCreateFormFieldDraft: () => this.canBackupCreateFormDraft,
      canBackupCreateFormFieldDraftOnSubmit: () => this.canBackupCreateFormDraftOnSubmit,
      registerCreateFormFieldDraftFlush: (fn) => this.registerCreateFormFieldDraftFlush(fn),
      readCreateFormFieldDraft: (key) => this.readCreateFormFieldDraft(key),
      writeCreateFormFieldDraft: (key, data, options) => this.writeCreateFormFieldDraft(key, data, options),
      bindCreateFormFieldDraft: (spec) => this.bindCreateFormFieldDraft(spec),
      isCreateFormFieldTouched: (key) => this.isCreateFormFieldTouched(key),
      markCreateFormFieldTouched: (key) => this.markCreateFormFieldTouched(key),
      isCreateFormFieldDraftFromLocal: (key) => this.isCreateFormFieldDraftFromLocal(key),
    }
  },
  computed: {
    createFormDraftOptions () {
      return {
        formScope: getContainerCreateFormDraftScope({ type: this.type }),
        disableWhen: () => this.shouldDisableCreateFormDraft,
      }
    },
    containerDraftFields () {
      return CONTAINER_CREATE_FORM_DRAFT_FIELDS
    },
    shouldDisableCreateFormDraft () {
      if (this.isInitForm) return true
      if (this.isModifyWorkflow) return true
      if (this.isModifyShopCartOrder) return true
      return false
    },
    ignoreLocalFormStorage () {
      return this.shouldDisableCreateFormDraft
    },
    isFormBackfill () {
      return this.isInitForm
    },
    effectiveInitFormData () {
      return this.isInitForm ? this.initFormData : {}
    },
    initSkuData () {
      const data = this.effectiveInitFormData && !R.isEmpty(this.effectiveInitFormData)
        ? this.effectiveInitFormData
        : ((!R.isEmpty(this.initFormData) && this.initFormData) || this.$route.params?.data || {})
      return { name: data.sku }
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
      return (this.form.fi?.capability?.pci_model_types || []).filter(item => item.hypervisor === 'pod')
    },
    pciOptions () {
      const specs = this.form.fi.capability.specs || {}
      const data = specs.isolated_devices || {}
      const ret = []
      for (const key in data) {
        if (data.hasOwnProperty(key)) {
          const item = data[key]
          if (!item.dev_type.startsWith('USB') && item.hypervisor === 'pod') {
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
    isOpenWorkflow () {
      return this.checkWorkflowEnabled(WORKFLOW_TYPES.APPLY_MACHINE)
    },
    isOpenOrderSetWorkflow () {
      return this.checkWorkflowEnabled(WORKFLOW_TYPES.EXECUTE_RESOURCE_ORDER_SET)
    },
    isModifyShopCartOrder () {
      const { workflow, order_set_id } = this.$route.query
      return !!(workflow && order_set_id)
    },
    isModifyWorkflow () {
      return !!this.$route.query.workflow
    },
    showReason () {
      return this.isOpenWorkflow || this.isOpenOrderSetWorkflow || this.isModifyWorkflow
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
      // 工单回填指定安全组时，即使网络类型尚未切到 manual，也要保留 bind 选项
      if (this.isFormBackfill) {
        const init = this.effectiveInitFormData
        if (init?.secgroups?.length) return true
      }
      return this.form.fd.networkType === 'manual'
    },
    /** 仅工单：安全组 init */
    workflowInitSecgroups () {
      if (!this.isFormBackfill) return []
      return this.normalizeDraftSecgroups(this.effectiveInitFormData?.secgroups)
    },
    /** 仅工单：调度宿主机 */
    workflowInitPreferHost () {
      if (!this.isFormBackfill) return ''
      return this.effectiveInitFormData?.prefer_host || this.effectiveInitFormData?.extraData?.prefer_host || ''
    },
    /** 仅工单：调度标签 */
    workflowInitSchedtags () {
      if (!this.isFormBackfill) return []
      const init = this.effectiveInitFormData || {}
      if (init.schedtags?.length) return init.schedtags
      if (init.extraData?.schedtags?.length) return init.extraData.schedtags
      return []
    },
    /** 仅工单：端口映射 */
    workflowInitPortMappings () {
      if (!this.isFormBackfill) return []
      return resolveDraftPortMappings(this.effectiveInitFormData)
    },
    /** 高级区内调度等 init 保护：工单回填或控件草稿开启时 */
    preserveAdvanceInitProps () {
      return this.isFormBackfill || this.canUseCreateFormDraft
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
        limit: 0,
        manager_id: this.form.fd.cloudprovider,
        ...this.scopeParams,
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
    hostNameTips () {
      if (this.isWindows) {
        return `${this.$t('compute.host_name_tips')} ${this.$t('compute.validate.windows')}`
      } else {
        return `${this.$t('compute.host_name_tips')} ${this.$t('compute.validate.others')}`
      }
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
    this.rememberAllCreateFormFieldDraftLocalOrigins()
  },
  mounted () {
    // 工单走 initForm；普通新建控件草稿走各组件 + restoreAdvance*
    this.$nextTick(() => {
      this.initForm()
      this.restoreAdvanceFormFieldDrafts()
      this.restoreContainerDiskFormFieldDrafts()
    })
  },
  watch: {
    'form.fi.imageMsg': {
      deep: true,
      handler (val, oldVal) {
        if (R.equals(val, oldVal)) return
        this.$nextTick(() => {
          if (this.isFormBackfill || this.form?.fi?.diskDraftRestoring) return
          // 首屏：有数据盘草稿时，镜像异步到位不要立刻清空（仅跳过一次）
          if (this.canUseCreateFormDraft && !this._diskDraftSkipImageResetOnce) {
            if (!this.isCreateFormFieldDraftFromLocal(CONTAINER_CREATE_FORM_DRAFT_FIELD.DATA_DISK)) {
              const diskDraft = this.readCreateFormFieldDraft(CONTAINER_CREATE_FORM_DRAFT_FIELD.DATA_DISK)
              if (diskDraft?.__dataDiskKeys?.length) {
                this._diskDraftSkipImageResetOnce = true
                return
              }
            }
          }
          this._resetDataDisk()
        })
      },
    },
    'form.fi.capability': {
      deep: true,
      handler (val) {
        if (!val || R.isEmpty(val)) return
        if (!this.canUseCreateFormDraft) return
        if (this.createFormDraftUserInteracted) return
        this.$nextTick(() => this.restoreContainerDiskFormFieldDrafts())
      },
    },
    'form.fd.hypervisor' (val, oldVal) {
      if (!this.canUseCreateFormDraft) return
      if (this.createFormDraftUserInteracted) return
      if (val === oldVal) return
      this.$nextTick(() => {
        this.restoreContainerDiskFormFieldDrafts()
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
  },
  methods: {
    hasAdvanceFieldDrafts () {
      if (!this.canUseCreateFormDraft) return false
      const keys = [
        CONTAINER_CREATE_FORM_DRAFT_FIELD.EIP,
        CONTAINER_CREATE_FORM_DRAFT_FIELD.SCHED_POLICY,
      ]
      return keys.some((key) => {
        const draft = this.readCreateFormFieldDraft(key)
        if (draft === null || draft === undefined) return false
        if (typeof draft === 'object' && !Array.isArray(draft) && !Object.keys(draft).length) return false
        return true
      })
    },
    restoreAdvanceFormFieldDrafts () {
      if (!this.canUseCreateFormDraft) return
      if (this.isInitForm) return
      if (this._advanceDraftRestoreRunning) return
      this._advanceDraftRestoreRunning = true
      try {
        this.$nextTick(() => {
          this.invokeAdvanceDraftComponentRestores()
        })
      } finally {
        this.$nextTick(() => {
          this._advanceDraftRestoreRunning = false
        })
      }
    },
    invokeAdvanceDraftComponentRestores () {
      ;[
        this.$refs.eipConfigRef,
        this.$refs.schedPolicyRef,
      ].forEach((ref) => {
        if (ref && typeof ref.restoreFormFieldDraftFields === 'function') {
          try { ref.restoreFormFieldDraftFields() } catch (e) { /* ignore */ }
        }
      })
    },
    /**
     * 数据盘草稿：hypervisor/capability 就绪后回填（DataDisk 自身 restore 为空实现）
     */
    async restoreContainerDiskFormFieldDrafts () {
      if (!this.canUseCreateFormDraft) return
      if (this.isInitForm) return
      if (this._diskDraftRestoreDone || this._diskDraftRestoreRunning) return
      this.rememberCreateFormFieldDraftLocalOrigin(CONTAINER_CREATE_FORM_DRAFT_FIELD.DATA_DISK)
      const dataFromLocal = this.isCreateFormFieldDraftFromLocal(CONTAINER_CREATE_FORM_DRAFT_FIELD.DATA_DISK)
      // 跨 tab（仅 local）：不回填数据盘；同 session 仍全量回填
      if (dataFromLocal) return
      let dataDraft = this.readCreateFormFieldDraftForRestore(CONTAINER_CREATE_FORM_DRAFT_FIELD.DATA_DISK)
      if (!dataDraft) return
      if (!this.form?.fd?.hypervisor) return

      this._diskDraftRestoreRunning = true
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

      try {
        const dataRef = await waitRef(() => this.$refs.dataDiskRef)
        if (dataRef) {
          // 输入子字段（大小/iops/吞吐/挂载路径 等）不回填，由组件白名单过滤
          if (typeof dataRef.sanitizeDraftForRestore === 'function') {
            dataDraft = dataRef.sanitizeDraftForRestore(dataDraft)
          }
          if (dataDraft && typeof dataRef.applyCreateFormFieldDraft === 'function') {
            dataRef.applyCreateFormFieldDraft(dataDraft, { fromLocal: false })
            this._diskDraftRestoreDone = true
          }
        }
      } finally {
        this._diskDraftRestoreRunning = false
        this.$nextTick(() => {
          if (this.form?.fi) this.$set(this.form.fi, 'diskDraftRestoring', false)
        })
      }
    },
    markCreateFormDraftUserInteracted () {
      if (!this.createFormDraftUserInteracted) {
        this.createFormDraftUserInteracted = true
        this._unbindCreateFormDraftUserInteraction()
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
      const initData = this.isInitForm
        ? ((!R.isEmpty(this.initFormData) && this.initFormData) || this.$route.params?.data || {})
        : null
      const canInit = !!((this.isInitForm || this.$route.query.workflow) && initData?.extraData)
      if (!canInit || !this.form?.fc) return
      if (this._initFormDone) return
      this._initFormDone = true
      const preferZone = (Array.isArray(initData.prefer_zones) && initData.prefer_zones[0]) ||
        initData.prefer_zone ||
        initData.prefer_zone_id
      try {
        if (preferZone) {
          const params = {
            show_emulated: true,
            resource_type: 'shared',
            ...this.scopeParams,
          }
          if (this.$store.getters.isAdminMode) {
            params.project_domain = initData.extraData?.domain_id
          }
          const { data } = await new this.$Manager('zones').getSpecific({ id: preferZone, spec: 'capability', params })
          let hypervisors = R.is(Object, data) ? (data.hypervisors || []) : []
          hypervisors = Array.from(new Set(hypervisors))
          this.form.fi.capability = { ...data, hypervisors }
          this.form.fc.setFieldsValue({ hypervisor: 'pod' })
        }
      } catch (e) { /* ignore */ }
      this.$nextTick(() => {
        // 数据盘
        if (this.$refs.dataDiskRef && initData.disks?.length) {
          const dataDisks = initData.disks.filter(item => item.disk_type === 'data' || item.disk_type === 'swap')
          const rootfsIndexes = (initData.pod?.containers || [])
            .map(c => c.rootfs?.disk?.index)
            .filter(idx => idx !== undefined && idx !== null)
          const normalDisks = dataDisks.filter((_, i) => {
            // disks 里 index 可能与数组下标不同，按磁盘 index 排除 overlay
            const disk = dataDisks[i]
            return !rootfsIndexes.includes(disk.index) && !rootfsIndexes.includes(i)
          })
          this.dataDiskInterval = setInterval(() => {
            if (!this.$refs.dataDiskRef) return
            normalDisks.forEach((v) => {
              const { schedtags = [] } = v
              this.$refs.dataDiskRef.add({
                diskType: v.backend,
                disabled: false,
                sizeDisabled: false,
                medium: v.medium,
                filetype: v.fs,
                mountPath: v.mountpoint,
                schedtag: schedtags[0]?.id,
                policy: schedtags[0]?.strategy,
                snapshot: v.snapshot_id,
                preallocation: v.preallocation,
                autoReset: v.auto_reset,
                ...v,
                size: v.size / 1024,
              })
            })
            clearInterval(this.dataDiskInterval)
            this.dataDiskInterval = null
          }, 500)
        }
        // 网络（等 NetworkConfig 挂载后再 initData，避免竞态）
        if (this.$refs.networkRef && initData.nets) {
          const initNetworkType = resolveDraftNetworkType(initData)
          this.form.fc.setFieldsValue({ networkType: initNetworkType })
          if (this.form.fd) this.$set(this.form.fd, 'networkType', initNetworkType)
          this.$refs.networkRef.change({ target: { value: initNetworkType }, name: 'default' })
          if (initNetworkType === NETWORK_OPTIONS_MAP.manual.key) {
            const nets = initData.extraData?.nets || []
            const applyManualNets = () => {
              const ref = this.$refs.networkRef?.$refs?.networkConfigRef
              if (ref?.initData && nets.length) ref.initData(nets)
            }
            this.$nextTick(() => {
              applyManualNets()
              // NetworkConfig 可能尚未挂出，短轮询再补一次
              let tries = 0
              const timer = setInterval(() => {
                tries += 1
                const ref = this.$refs.networkRef?.$refs?.networkConfigRef
                if (ref?.initData && nets.length) {
                  ref.initData(nets)
                  clearInterval(timer)
                  return
                }
                if (tries >= 20) clearInterval(timer)
              }, 100)
              // 区域/子网列表异步就绪后再补一次
              setTimeout(applyManualNets, 2500)
            })
          }
          if (initNetworkType === NETWORK_OPTIONS_MAP.schedtag.key) {
            this.$nextTick(() => {
              const networkSchedtagRef = this.$refs.networkRef?.$refs?.networkSchedtagRef
              if (networkSchedtagRef && networkSchedtagRef.initData) {
                networkSchedtagRef.initData(initData.nets)
              }
            })
          }
        }
        // 高级配置：有字段才回填（UI 已常展开）
        if (hasAdvanceConfigInitFields(initData)) {
          this.$nextTick(() => {
            if (initData.hostname) {
              this.form.fc.setFieldsValue({ hostName: initData.hostname })
            }
            // 安全组 / 指定宿主机：由组件 initSecgroups / initPreferHost + initLoaded 补写
            const secgroupIds = this.normalizeDraftSecgroups(initData.secgroups)
            if (secgroupIds.length && this.$refs.secgroupConfigRef?.initData) {
              this.$refs.secgroupConfigRef.initData(secgroupIds)
            }
            if (initData.prefer_host && this.$refs.schedPolicyRef?.initPreferHostData) {
              this.$refs.schedPolicyRef.initPreferHostData(initData.prefer_host)
            }
            const schedtags = (initData.schedtags?.length && initData.schedtags) ||
              (initData.extraData?.schedtags?.length && initData.extraData.schedtags) ||
              null
            if (schedtags && this.$refs.schedPolicyRef) {
              this.$refs.schedPolicyRef.change({ target: { value: 'schedtag' }, name: 'default' })
              this.$nextTick(() => {
                const policySchedtagRef = this.$refs.schedPolicyRef?.$refs?.policySchedtagRef
                if (policySchedtagRef?.initData) {
                  policySchedtagRef.initData(schedtags)
                }
              })
            }
            if (initData.groups?.length) {
              this.form.fc.setFieldsValue({
                groupsEnable: true,
                groups: initData.groups,
              })
            }
            // 端口映射（Labels）：优先靠 init-pairs；再兜底调 initData
            const portMappings = resolveDraftPortMappings(initData)
            if (portMappings.length) {
              const applyPortMappings = () => {
                const ref = this.$refs.labelRef
                if (ref?.initData) ref.initData(portMappings)
              }
              applyPortMappings()
              setTimeout(applyPortMappings, 500)
              setTimeout(applyPortMappings, 1500)
            }
          })
        }
        // 标签
        if (initData.__meta__) {
          const ret = {}
          R.forEachObjIndexed((value, key) => {
            ret[key] = R.is(Array, value) ? value : [value]
          }, initData.__meta__)
          this.tagDefaultChecked = ret
        }
        // 容器配置
        const containers = initData.pod?.containers || []
        if (this.$refs.specContainerRef && containers.length) {
          // 复用已挂载 pane，在表单字段注册后回填
          this.$refs.specContainerRef.fillContainers(containers)
        }
      })
    },
    submit (e) {
      e.preventDefault()
      this.validateForm()
        .then(async formData => {
          this.submiting = true
          const genCreteData = new GenCreateData(formData, this.form.fi)
          const data = genCreteData.all()
          if (!data.extraData) data.extraData = {}
          data.extraData.reason = this.form.fd?.reason
          data.extraData.formType = this.type
          data.extraData.__resource_type__ = 'server_container'
          if (this.isModifyShopCartOrder || this.isOpenWorkflow || this.isModifyWorkflow) {
            await this.checkCreateData(data)
            await this.doForecast(genCreteData, data)
            await this.doCreateWorkflow(data)
            this.flushCreateFormFieldDrafts()
          } else if (this.isOpenOrderSetWorkflow) {
            await this.checkCreateData(data)
            await this.doForecast(genCreteData, data)
            await this.doCreateOrderSetWorkflow(data)
            this.flushCreateFormFieldDrafts()
          } else {
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
          this.$router.push('/vminstance-container')
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
            reject(err)
          }
        })
      })
    },
    cpuChange (cpu) {
      const cpuMem = this.form.fi.cpuMem || {}
      const cpuNum = Number(cpu)
      // 不限：只设 CPU，不改内存（用户未动内存应保留原值）
      if (cpuNum === 0) {
        this.form.fc.setFieldsValue({ vcpu: 0 })
        return
      }
      const memOpts = (cpuMem.cpu_mems_mb && (cpuMem.cpu_mems_mb[cpuNum] || cpuMem.cpu_mems_mb[cpu])) || []
      const cpus = cpuMem.cpus || []
      if (!memOpts.length) { // 没有内存Opts，则内存为0
        let vcpu = cpuNum || cpu
        if (!cpus.includes(cpuNum) && !cpus.includes(cpu)) {
          vcpu = cpus.length ? cpus[0] : 0
        }
        this.form.fc.setFieldsValue({
          vcpu,
          vmem: 0,
        })
        return
      } else if (Number(this.form.fc.getFieldValue('vcpu')) !== cpuNum) {
        this.form.fc.setFieldsValue({
          vcpu: cpuNum,
        })
      }
      this.form.fi.cpuMem.mems_mb = memOpts
      const currentMem = Number(this.form.fc.getFieldValue('vmem'))
      if (currentMem && memOpts.some(m => Number(m) === currentMem)) {
        // 保持工单回填的内存，避免被默认 2G 覆盖导致套餐错选
        this.form.fc.setFieldsValue({ vmem: currentMem })
        return
      }
      // 内存 options 变化：优先草稿，否则 2G / 第一项（不写草稿）；草稿 0=不限
      const draftMem = this.canUseCreateFormDraft
        ? this.readCreateFormFieldDraft(CONTAINER_CREATE_FORM_DRAFT_FIELD.VMEM)
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
      // 端口映射：字段名是 containerPorts[uuid]，需从 getFieldsValue 取嵌套对象写入 fd
      if (changeKeys.some(val => val.includes('containerPorts') || val.includes('hostPorts'))) {
        if (formValue.containerPorts) {
          this.$set(this.form.fd, 'containerPorts', formValue.containerPorts)
        }
        if (formValue.hostPorts) {
          this.$set(this.form.fd, 'hostPorts', formValue.hostPorts)
        }
      }
      this.syncContainerCreateFormFcDrafts(newField)
    },
    bindContainerCreateFormFcDrafts () {
      this._containerCreateFormFcDraftMap = Object.create(null)
    },
    syncContainerCreateFormFcDrafts (newField) {
      if (!this.canUseCreateFormDraft || !newField || typeof newField !== 'object') return
      // 仅用户交互后落盘；vcpu/vmem 由 CpuRadio/MemRadio 点选落盘
      if (!this.createFormDraftUserInteracted) return
      const skip = { vcpu: true, vmem: true }
      const map = this._containerCreateFormFcDraftMap || {}
      Object.keys(newField).forEach((formField) => {
        if (skip[formField]) return
        const draftKey = map[formField]
        if (!draftKey) return
        this.writeCreateFormFieldDraft(draftKey, newField[formField])
      })
    },
    normalizeDraftSecgroups (secgroups) {
      if (!Array.isArray(secgroups) || !secgroups.length) return []
      return secgroups.map((item) => {
        if (item == null) return null
        if (typeof item === 'string' || typeof item === 'number') return String(item)
        return item.id || item.key || item.value || null
      }).filter(Boolean)
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
      // 工单回填：从 effectiveInitFormData 取域
      if ((R.isNil(domain) || R.isEmpty(domain)) && this.isFormBackfill) {
        domain = this.effectiveInitFormData?.extraData?.domain_id
      }
      if (!R.isNil(domain) && !R.isEmpty(domain)) {
        this.form.fc.setFieldsValue({
          domain: { key: domain },
        })
      }
    },
    fetchProjectCallback () {
      let project = this.$route.query.tenant_id
      // 工单回填：从 effectiveInitFormData 取项目
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
        nodes,
        port,
        privileged_accounts,
        accounts,
      } = this.form.fd
      return {
        bastion_host_id,
        nodes,
        port,
        accounts: [privileged_accounts].concat(accounts),
      }
    },
    addShopCart () {
      this.validateForm()
        .then(async formData => {
          this.submiting = true
          try {
            const genCreateData = new GenCreateData(formData, this.form.fi)
            const data = genCreateData.all()
            if (!data.extraData) data.extraData = {}
            data.extraData.reason = this.form.fd?.reason
            data.extraData.formType = this.type
            data.extraData.__resource_type__ = 'server_container'
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
        name: 'VMContainerInstance',
      })
    },
  },
}
