// 创建主机相应组件的参数
import * as R from 'ramda'
import {
  DEFAULT_PARAMS,
  NETWORK_OPTIONS_MAP,
  SERVER_TYPE,
  EIP_TYPES_MAP,
  EIP_CHARGE_TYPES_MAP,
  BILL_TYPES_MAP,
  LOGIN_TYPES_MAP,
  SCHED_POLICY_OPTIONS_MAP,
  STORAGE_AUTO,
  SECGROUP_OPTIONS_MAP,
  FORECAST_FILTERS_MAP,
  RESOURCE_TYPES_MAP,
} from '@Compute/constants'
import { IMAGES_TYPE_MAP } from '@/constants/compute'
import { HYPERVISORS_MAP } from '@/constants'
import validateForm, { isRequired } from '@/utils/validate'
import store from '@/store'
import i18n from '@/locales'

export const decorators = {
  generate_name: [
    'generate_name',
    {
      initialValue: '',
      validateTrigger: ['change', 'blur'],
      validateFirst: true,
      rules: [
        { required: true, message: i18n.t('db.text_136') },
        { validator: validateForm('serverName') },
      ],
    },
  ],
  count: [
    'count',
    {
      initialValue: 1,
    },
  ],
  billing_type: [
    'billing_type',
    {
      initialValue: 'postpaid',
    },
  ],
  sku: [
    'sku',
    {
      rules: [
        { required: true, message: i18n.t('db.text_258') },
      ],
    },
  ],
  regionZone: {
    cloudregion: [
      'region',
      {
        initialValue: { key: '', label: '' },
        rules: [
          { validator: isRequired(), message: i18n.t('db.text_259') },
        ],
      },
    ],
    zone: [
      'zone',
      {
        initialValue: { key: '', label: '' },
        rules: [
          { validator: isRequired(), message: i18n.t('db.text_260') },
        ],
      },
    ],
  },
  cityProviderRegion: {
    city: ['city', {
      initialValue: undefined,
    }],
    provider: ['provider', {
      initialValue: undefined,
    }],
    region: ['region', {
      initialValue: undefined,
    }],
    zone: ['zone', {
      initialValue: undefined,
    }],
  },
  loginConfig: {
    loginType: [
      'loginType',
      {
        initialValue: 'random',
      },
    ],
    keypair: [
      'loginKeypair',
      {
        initialValue: undefined, // { key: '', label: '' }
        rules: [
          { validator: isRequired(), message: i18n.t('db.text_137') },
        ],
      },
    ],
  },
  vpcNetwork: {
    vpc: [
      'vpc',
      {
        initialValue: undefined,
        rules: [
          { required: true, message: i18n.t('db.text_261') },
        ],
      },
    ],
    network: [
      'network',
      {
        initialValue: undefined,
        rules: [
          { required: true, message: i18n.t('db.text_262') },
        ],
      },
    ],
  },
}

export class ControlParams {
  constructor (type) {
    this.type = type
    this.scope = store.getters.scope
    this.params = DEFAULT_PARAMS[type]
    this.initScope()
  }

  initScope () {
    R.forEachObjIndexed((value, key) => {
      if (!R.isNil(value.scope)) {
        this.params[key].scope = this.scope
      }
    }, this.params)
  }

  zoneChange (zoneId) {
    this.params.network.zone = zoneId
  }
}

/**
 * 根据表单拼装创建参数
 *
 * @export
 * @class GenCreateData
 */
export class GenCreateData {
  constructor (fd, fi) {
    this.fd = fd
    this.fi = fi
    this.createType = this.fi.createType
    this.isPublic = this.createType === SERVER_TYPE.public
    this.isPrepaid = this.fd.resourceType === RESOURCE_TYPES_MAP.prepaid.key
  }

  /**
   * 拼装磁盘数据
   *
   * @param { Object } item       // 磁盘数据
   * @param { String } type       // 磁盘类型 sys | data
   * @param { Number } index      // 序号
   * @returns { Object }
   * @memberof GenCreateData
   */
  genDisk (item, type, index) {
    const ret = {
      disk_type: type,
      index,
      backend: item.type === STORAGE_AUTO.key ? '' : item.type,
      size: item.size * 1024,
    }
    if (type === 'sys' && this.fd.imageType !== IMAGES_TYPE_MAP.iso.key) {
      ret.image_id = this.fd.image.key
    }
    if (type === 'sys' && this.fd.imageType === IMAGES_TYPE_MAP.iso.key) {
      ret.driver = 'ide'
    }
    if (item.schedtags) {
      ret.schedtags = item.schedtags
    }
    if (item.filetype) {
      ret.fs = item.filetype
      if (item.filetype !== 'swap') {
        ret.mountpoint = item.mountpoint
      }
    }
    if (item.snapshot_id) {
      ret.snapshot_id = item.snapshot_id
    }
    return ret
  }

  _genDisksArr () {
    const diskType = this.fd.systemDiskType.key
    const systemDisk = {
      type: diskType,
      size: this.fd.systemDiskSize,
    }
    if (this.fd.systemDiskSchedtag) {
      systemDisk.schedtags = [
        { id: this.fd.systemDiskSchedtag },
      ]
      if (this.fd.systemDiskPolicy && this.fd.systemDiskPolicy) {
        systemDisk.schedtags[0].strategy = this.fd.systemDiskPolicy
      }
    }
    const dataDisk = []
    R.forEachObjIndexed((value, key) => {
      const diskObj = {
        size: value,
        type: diskType,
      }
      if (this.fd.dataDiskFiletypes && this.fd.dataDiskFiletypes[key]) {
        diskObj.filetype = this.fd.dataDiskFiletypes[key]
      }
      if (this.fd.dataDiskMountPaths && this.fd.dataDiskMountPaths[key]) {
        diskObj.mountpoint = this.fd.dataDiskMountPaths[key]
      }
      if (this.fd.dataDiskSnapshots && this.fd.dataDiskSnapshots[key]) {
        diskObj.snapshot_id = this.fd.dataDiskSnapshots[key]
      }
      if (this.fd.dataDiskSchedtags && this.fd.dataDiskSchedtags[key]) {
        diskObj.schedtags = [
          { id: this.fd.dataDiskSchedtags[key] },
        ]
        if (this.fd.dataDiskPolicys && this.fd.dataDiskPolicys[key]) {
          diskObj.schedtags[0].strategy = this.fd.dataDiskPolicys[key]
        }
      }
      dataDisk.push(diskObj)
    }, this.fd.dataDiskSizes)
    const disks = { data: dataDisk, system: systemDisk }
    return disks
  }

  /**
   * 组装所有磁盘数据，包含系统盘及数据盘
   *
   * @returns { Array }
   * @memberof GenCreateData
   */
  genDisks () {
    const disks = this._genDisksArr()
    if (this.isPublic && this.isPrepaid) {
      return this.fd.spec.disks
    }
    const ret = [this.genDisk(disks.system, 'sys', 0)]
    for (let i = 0, len = disks.data.length; i < len; i++) {
      ret.push(this.genDisk(disks.data[i], 'data', i + 1))
    }
    return ret
  }

  /**
   * 组装所有网络数据
   *
   * @returns { Array }
   * @memberof GenCreateData
   */
  genNetworks () {
    let ret = [{ exit: false }]
    // 指定 IP 子网
    if (this.fd.networkType === NETWORK_OPTIONS_MAP.manual.key) {
      ret = []
      R.forEachObjIndexed((value, key) => {
        const obj = {
          network: value,
        }
        if (this.fd.networkIps) {
          const address = this.fd.networkIps[key]
          if (address) {
            obj.address = address
          }
        }
        ret.push(obj)
      }, this.fd.networks)
    }
    // 指定 调度标签
    if (this.fd.networkType === NETWORK_OPTIONS_MAP.schedtag.key) {
      ret = []
      R.forEachObjIndexed((value, key) => {
        const obj = {
          id: value,
        }
        const strategy = this.fd.networkPolicys[key]
        if (strategy) {
          obj.strategy = strategy
        }
        ret.push({
          schedtags: [obj],
        })
      }, this.fd.networkSchedtags)
    }
    return ret
  }

  /**
   * 获取配置的GPU数据
   *
   * @returns { Array }
   * @memberof GenCreateData
   */
  genDevices () {
    const ret = []
    for (let i = 0, len = this.fd.gpu.count; i < len; i++) {
      const regexp = /vendor=(.+):(.+)/
      const matched = this.fd.gpu.match(regexp)
      const model = matched[1]
      const vendor = matched[2]
      ret.push({
        model,
        vendor,
      })
    }
    return ret
  }

  /**
   * 获取管理员密码所提交的 key 与 value
   *
   * @returns { String }
   * @memberof GenCreateData
   */
  getLoginValueKey () {
    const ret = {}
    switch (this.fd.loginType) {
      case LOGIN_TYPES_MAP.keypair.key:
        ret.key = 'keypair'
        ret.value = this.fd.loginKeypair
        break
      case LOGIN_TYPES_MAP.image.key:
        ret.key = 'reset_password'
        ret.value = false
        break
      case LOGIN_TYPES_MAP.password.key:
        ret.key = 'password'
        ret.value = this.fd.loginPassword
        break
      default:
        break
    }
    return ret
  }

  /**
   * 获取调度策略所提交的 key 与 value
   *
   * @returns
   * @memberof GenCreateData
   */
  getSchedPolicyValueKey () {
    const ret = {}
    // 调度策略选择为 指定宿主机
    if (this.fd.schedPolicyType === SCHED_POLICY_OPTIONS_MAP.host.key) {
      ret.key = 'prefer_host'
      ret.value = this.fd.schedPolicyHost
    }
    // 调度策略选择为 调度标签
    if (this.fd.schedPolicyType === SCHED_POLICY_OPTIONS_MAP.schedtag.key) {
      ret.key = 'schedtags'
      ret.value = []
      R.forEachObjIndexed((value, key) => {
        ret.value.push({
          id: value,
          strategy: this.fd.policySchedtagPolicys[key],
        })
      }, this.policySchedtagSchedtags)
    }
    return ret
  }

  /**
   * 获取平台
   *
   * @returns { String }
   * @memberof GenCreateData
   */
  getHypervisor () {
    let ret = this.fd.hypervisor
    if (this.isPublic && !this.isPrepaid) {
      const provider = this.fd.sku.selected.provider
      if (provider) ret = provider.toLowerCase()
    }
    return ret
  }

  /**
   * 获取Region
   *
   * @returns { String }
   * @memberof GenCreateData
   */
  getPreferRegion () {
    let ret = this.fd.cloudregion.key
    if (this.isPublic && !this.isPrepaid) {
      const region = this.fd.sku.selected.cloudregion_id
      if (region) ret = region
    }
    return ret
  }

  /**
   * 获取Zone
   *
   * @returns { String }
   * @memberof GenCreateData
   */
  getPreferZone () {
    const ret = this.fd.zone && this.fd.zone.key
    return ret
  }

  /**
   * 获取CPU核数
   *
   * @returns { String }
   * @memberof GenCreateData
   */
  getCpuCount () {
    let ret = this.fd.vcpu
    if (this.isPublic && this.isPrepaid) {
      ret = this.fd.spec.vcpu_count
    }
    return ret
  }

  /**
   * 获取内存
   *
   * @returns { String }
   * @memberof GenCreateData
   */
  getMemSize () {
    let ret = this.fd.vmem
    if (this.isPublic && this.isPrepaid) {
      ret = this.fd.spec.vmem_size * 1024
    }
    return ret
  }

  /**
   * 组装所有的创建数据
   *
   * @returns { Object }
   * @memberof GenCreateData
   */
  all () {
    const data = {
      auto_start: true,
      generate_name: this.fd.name,
      hypervisor: this.getHypervisor(),
      __count__: this.fd.count,
      disks: this.genDisks(),
      nets: this.genNetworks(),
      prefer_region: this.getPreferRegion(),
      vcpu_count: this.getCpuCount(),
      vmem_size: this.getMemSize(),
      project_id: store.getters.userInfo.projectId,
      // project_id: this.fd.project.id || store.getters.userInfo.projectId,
    }
    if (this.fd.imageType === IMAGES_TYPE_MAP.iso.key) {
      data.cdrom = this.fd.image.data.id
    }
    // 非预付费资源池不会添加sku
    if (!this.isPrepaid) {
      data.sku = this.fd.sku.name
    }
    // 弹性IP
    if (this.isPublic) {
      if (this.fi.eipType === EIP_TYPES_MAP.new.key) {
        if (
          this.fd.eip_charge_type === EIP_CHARGE_TYPES_MAP.traffic.key ||
          this.fd.eip_charge_type === EIP_CHARGE_TYPES_MAP.bandwidth.key
        ) {
          data.eip_charge_type = this.fd.eip_charge_type
          data.eip_bw = this.fd.eip_bw
        }
      }
      // resource_type
      data.resource_type = this.fd.resourceType
      // 包年包月参数
      if (this.fi.billType === BILL_TYPES_MAP.package.key) {
        data.duration = this.fd.duration
        data.auto_prepaid_recycle = this.fd.auto_prepaid_recycle
      }
    }
    // gpu
    if (this.fd.gpuEnable) {
      data.isolated_devices = this.genDevices()
    }
    // 管理员密码非默认的情况下进行传参设置
    if (this.fd.loginType !== LOGIN_TYPES_MAP.random.key) {
      const loginValueKey = this.getLoginValueKey()
      data[loginValueKey.key] = loginValueKey.value
    }
    // 安全组
    if (this.fd.secgroupType === SECGROUP_OPTIONS_MAP.manual.key) {
      data.secgroup = this.fd.secgroup.id
    }
    // 如果设置了调度策略则拼装调度所需数据
    if (this.fd.schedPolicyType !== SCHED_POLICY_OPTIONS_MAP.default.key) {
      const schedPolicyValueKey = this.getSchedPolicyValueKey()
      data[schedPolicyValueKey.key] = schedPolicyValueKey.value
    }
    // 是否需要 拼装 高可用备份机
    if (this.fd.backupEnable) {
      data.backup = true
      data.prefer_backup_host = this.fd.backup
    }
    // zone
    const zoneId = this.getPreferZone()
    if (zoneId) {
      data.prefer_zone = zoneId
    }
    // 只有kvm支持启动方式
    if (this.fd.hypervisor === HYPERVISORS_MAP.kvm.key) {
      data.bios = this.fd.bios
    }
    return data
  }

  /**
   * 获取创建预测的错误信息
   *
   * @returns { Array }
   * @memberof GenCreateData
   */
  getForecastErrors (data) {
    const errors = []
    if (data.filtered_candidates && data.filtered_candidates.length > 0) {
      for (let i = 0, len = data.filtered_candidates.length; i < len; i++) {
        const item = data.filtered_candidates[i]
        const message = FORECAST_FILTERS_MAP[item.filter_name] || i18n.t('compute.text_1310', [item.filter_name])
        errors.push({
          message,
          children: item.reasons,
        })
      }
    } else {
      errors.push({
        message: i18n.t('compute.text_227'),
      })
    }
    return {
      errors,
      allow_count: data.allow_count,
      req_count: data.req_count,
      not_allow_reasons: data.not_allow_reasons,
    }
  }
}
