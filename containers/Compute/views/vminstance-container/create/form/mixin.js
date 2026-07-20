import * as R from 'ramda'
import _ from 'lodash'
import { SCHED_POLICY_OPTIONS_MAP, SERVER_TYPE, SELECT_IMAGE_KEY_SUFFIX, NETWORK_OPTIONS_MAP } from '@Compute/constants'
import OsSelect from '@Compute/sections/OsSelect'
import CpuRadio from '@Compute/sections/CpuRadio'
import MemRadio from '@Compute/sections/MemRadio'
import sku from '@Compute/sections/SKU'
import gpu from '@Compute/sections/GPU/index'
import pci from '@Compute/sections/PCI'
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
  mixins: [workflowMixin],
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
    const initDataForDecorators = (this.isInitForm || this.$route.query.workflow)
      ? (this.initFormData && !R.isEmpty(this.initFormData) ? this.initFormData : routeInitData)
      : {}
    const decorators = new Decorator(SERVER_TYPE[this.type]).createDecorators(initDataForDecorators)
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
          errPanes: [], // 表单校验错误的tabs
          containerPanes: [], // 子组件同步的tabs
        },
        fd: { ...initFd, os: '' },
      },
      decorators,
      capabilityParams: {}, // 防止 capability 反复调用，这里对当前的接口参数做记录
      price: null,
      collapseActive: [],
      tagDefaultChecked: {},
      hostNameValidate: {
        validateStatus: '',
        errorMsg: '',
      },
    }
  },
  provide () {
    return {
      form: this.form,
    }
  },
  computed: {
    initSkuData () {
      const data = (!R.isEmpty(this.initFormData) && this.initFormData) || this.$route.params?.data || {}
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
      return this.form.fd.networkType === 'manual'
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
  },
  mounted () {
    this.initForm()
  },
  watch: {
    'form.fi.imageMsg': {
      deep: true,
      handler (val, oldVal) {
        if (R.equals(val, oldVal)) return
        this.$nextTick(() => {
          if (!this.isInitForm) {
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
    async initForm () {
      const initData = (!R.isEmpty(this.initFormData) && this.initFormData) || this.$route.params?.data || {}
      const canInit = !!(this.$route.query.workflow && initData.extraData)
      if (!canInit || !this.form?.fc) return
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
        // 网络
        if (this.$refs.networkRef && initData.nets) {
          let initNetworkType = NETWORK_OPTIONS_MAP.default.key
          if (initData.nets[0] && initData.nets[0].hasOwnProperty('exit') && !initData.nets[0].exit) {
            initNetworkType = NETWORK_OPTIONS_MAP.default.key
          } else if (initData.nets[0] && initData.nets[0].hasOwnProperty('network') && initData.extraData?.nets?.[0]) {
            initNetworkType = NETWORK_OPTIONS_MAP.manual.key
          } else if (initData.nets[0]?.schedtags) {
            initNetworkType = NETWORK_OPTIONS_MAP.schedtag.key
          }
          this.form.fc.setFieldsValue({ networkType: initNetworkType })
          this.$refs.networkRef.change({ target: { value: initNetworkType }, name: 'default' })
          if (initNetworkType === NETWORK_OPTIONS_MAP.manual.key) {
            this.$nextTick(() => {
              const networkConfigRef = this.$refs.networkRef?.$refs?.networkConfigRef
              if (networkConfigRef && networkConfigRef.initData) {
                networkConfigRef.initData(initData.extraData.nets)
              }
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
        // 高级配置
        if (initData.hostname || initData.prefer_host || initData.schedtags || initData.secgroups || initData.groups) {
          this.collapseActive = ['1']
          this.$nextTick(() => {
            if (initData.hostname) {
              this.form.fc.setFieldsValue({ hostName: initData.hostname })
            }
            if (initData.secgroups?.length) {
              setTimeout(() => {
                this.form.fc.setFieldsValue({
                  secgroup_type: 'bind',
                  secgroup: initData.secgroups,
                })
              }, 1500)
            }
            if (this.$refs.schedPolicyRef) {
              if (initData.prefer_host) {
                this.$refs.schedPolicyRef.change({ target: { value: 'host' }, name: 'default' })
              }
              if (initData.schedtags?.length) {
                this.$refs.schedPolicyRef.change({ target: { value: 'schedtag' }, name: 'default' })
                setTimeout(() => {
                  const policySchedtagRef = this.$refs.schedPolicyRef?.$refs?.policySchedtagRef
                  if (policySchedtagRef && policySchedtagRef.initData) {
                    policySchedtagRef.initData(initData.schedtags)
                  }
                }, 1000)
              }
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
          } else if (this.isOpenOrderSetWorkflow) {
            await this.checkCreateData(data)
            await this.doForecast(genCreteData, data)
            await this.doCreateOrderSetWorkflow(data)
          } else {
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
            this.collapseActive = ['1'] // 仅仅在报错的时候展开高级配置
            reject(err)
          }
        })
      })
    },
    cpuChange (cpu) {
      const cpuMem = this.form.fi.cpuMem || {}
      const cpuNum = Number(cpu)
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
      let defaultMem = 2048
      if (!memOpts.some(m => Number(m) === 2048)) {
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
