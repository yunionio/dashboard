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
import validateForm, { isRequired, isWithinRange } from '@/utils/validate'
import store from '@/store'

function checkIpInSegment (i, networkData) {
  return (rule, value, cb) => {
    const isIn = isWithinRange(value, networkData.guest_ip_start, networkData.guest_ip_end)
    if (isIn) {
      cb()
    } else {
      cb(new Error('输入的IP不在选择子网网段中'))
    }
  }
}

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

export const decorators = {
  domain: [
    'domain',
    {
      rules: [
        { validator: isRequired(), message: '请选择域', trigger: 'change' },
      ],
    },
  ],
  project: [
    'project',
    {
      rules: [
        { validator: isRequired(), message: '请选择项目', trigger: 'change' },
      ],
    },
  ],
  name: [
    'name',
    {
      initialValue: '',
      validateTrigger: ['change', 'blur'],
      validateFirst: true,
      rules: [
        { required: true, message: '请输入名称' },
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
  cloudregionZone: {
    cloudregion: [
      'cloudregion',
      {
        initialValue: { key: '', label: '' },
        rules: [
          { validator: isRequired(), message: '请选择区域' },
        ],
      },
    ],
    zone: [
      'zone',
      {
        initialValue: { key: '', label: '' },
        rules: [
          { validator: isRequired(), message: '请选择可用区' },
        ],
      },
    ],
  },
  imageOS: {
    os: [
      'os',
      {
        initialValue: '',
        rules: [
          { required: true, message: '请选择操作系统' },
        ],
      },
    ],
    image: [
      'image',
      {
        initialValue: { key: '', label: '' },
        rules: [
          { validator: isRequired(), message: '请选择镜像' },
        ],
      },
    ],
    imageType: [
      'imageType',
      {
        initialValue: IMAGES_TYPE_MAP.standard.key,
      },
    ],
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
          { validator: isRequired(), message: '请选择关联密钥' },
        ],
      },
    ],
    password: [
      'loginPassword',
      {
        initialValue: '',
        rules: [
          { required: true, message: '请输入密码' },
        ],
      },
    ],
  },
  hypervisor: [
    'hypervisor',
    {
      rules: [
        { required: true, message: '请选择平台' },
      ],
    },
  ],
  gpu: {
    gpuEnable: [
      'gpuEnable',
      {
        initialValue: false,
      },
    ],
    gpu: [
      'gpu',
      {
        rules: [
          { required: true, message: '请选择GPU型号' },
        ],
      },
    ],
    gpuCount: [
      'gpuCount',
      {
        initialValue: 1,
      },
    ],
  },
  vcpu: [
    'vcpu',
    {
      initialValue: 2,
    },
  ],
  vmem: [
    'vmem',
    {
      initialValue: 2048,
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
  systemDisk: {
    type: [
      'systemDiskType',
      {
        rules: [
          { validator: isRequired(), message: '请选择磁盘类型' },
        ],
      },
    ],
    size: [
      'systemDiskSize',
      {
        rules: [
          { required: true, message: '请输入磁盘大小' },
        ],
      },
    ],
    schedtag: [
      'systemDiskSchedtag',
      {
        validateTrigger: ['change', 'blur'],
        rules: [{
          required: true,
          message: '请选择调度标签',
        }],
      },
    ],
    policy: [
      'systemDiskPolicy',
      {
        validateTrigger: ['blur', 'change'],
        rules: [{
          required: true,
          message: '请选择调度标签',
        }],
      },
    ],
  },
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
  network: {
    networkType: [
      'networkType',
      {
        initialValue: NETWORK_OPTIONS_MAP.manual.key,
      },
    ],
    networkConfig: {
      networks: i => [
        `networks[${i}]`,
        {
          validateTrigger: ['change', 'blur'],
          rules: [{
            required: true,
            message: '请选择ip子网',
          }],
        },
      ],
      ips: (i, networkData) => [
        `networkIps[${i}]`,
        {
          validateFirst: true,
          validateTrigger: ['blur', 'change'],
          rules: [{
            required: true,
            message: '请输入ip',
          }, {
            validator: checkIpInSegment(i, networkData),
          }],
        },
      ],
    },
    networkSchedtag: {
      schedtags: i => [
        `networkSchedtags[${i}]`,
        {
          validateTrigger: ['change', 'blur'],
          rules: [{
            required: true,
            message: '请选择调度标签',
          }],
        },
      ],
      policys: (i, networkData) => [
        `networkPolicys[${i}]`,
        {
          validateTrigger: ['blur', 'change'],
          rules: [{
            required: true,
            message: '请选择调度标签',
          }],
        },
      ],
    },
  },
  schedPolicy: {
    schedPolicyType: [
      'schedPolicyType',
      {
        initialValue: 'default',
      },
    ],
    schedPolicyHost: [
      'schedPolicyHost',
      {
        rules: [
          { required: true, message: '请选择宿主机' },
        ],
      },
    ],
    policySchedtag: {
      schedtags: i => [
        `policySchedtagSchedtags[${i}]`,
        {
          validateTrigger: ['change', 'blur'],
          rules: [{
            required: true,
            message: '请选择调度标签',
          }],
        },
      ],
      policys: (i, networkData) => [
        `policySchedtagPolicys[${i}]`,
        {
          validateTrigger: ['blur', 'change'],
          rules: [{
            required: true,
            message: '请选择调度标签',
          }],
        },
      ],
    },
  },
  bios: [
    'bios',
    {
      initialValue: 'BIOS',
    },
  ],
  backup: {
    backupEnable: [
      'backupEnable',
      {
        valuePropName: 'checked',
        initialValue: false,
      },
    ],
    backup: [
      'backup',
    ],
  },
}

const decoratorGroup = {
  idc: ['domain', 'project', 'cloudregionZone', 'name', 'count', 'imageOS', 'loginConfig', 'hypervisor', 'gpu', 'vcpu', 'vmem', 'sku', 'systemDisk', 'dataDisk', 'network', 'schedPolicy', 'bios', 'backup'],
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

export class Decorator {
  decorators = {}
  constructor (type) {
    this.type = type
  }
  createDecorators () {
    const decoratorArr = decoratorGroup[this.type]
    if (decoratorArr) {
      decoratorArr.forEach(dec => {
        if (decorators[dec]) {
          this.decorators[dec] = decorators[dec]
        } else {
          console.error(`FE：创建云服务器未声明decorator ${dec}`)
        }
      })
    }
    return this.decorators
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
      let provider = this.fd.sku.selected.provider
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
      let region = this.fd.sku.selected.cloudregion_id
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
    let ret = this.fd.zone && this.fd.zone.key
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
      project_id: (this.fd.project && this.fd.project.key) || store.getters.userInfo.projectId,
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
      data['prefer_zone'] = zoneId
    }
    // 只有kvm支持启动方式
    if (this.fd.hypervisor === HYPERVISORS_MAP.kvm.key) {
      data['bios'] = this.fd.bios
    }
    if (this.fd.imageType === IMAGES_TYPE_MAP.iso.key) {
      data.cdrom = this.fd.image.key
    }
    // 主机镜像需要guest image id参数
    if (this.fd.imageType === IMAGES_TYPE_MAP.host.key) {
      data.guest_image_id = this.fd.image.key
    }
    // 主机快照需要instance_snapshot_id参数
    if (this.fd.imageType === IMAGES_TYPE_MAP.snapshot.key) {
      data.instance_snapshot_id = this.fd.image.key
      delete data.disks // 主机快照不需要 disks 字段
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
    const ret = []
    const genErrorObj = (item, message) => {
      const obj = {
        message,
      }
      if (item.messages && item.messages.length) {
        obj.children = item.messages.map(child => {
          const msgArr = child.split(':')
          if (msgArr && msgArr.length > 0) {
            return msgArr[0]
          }
          return null
        }).filter(child => !!child)
      }
      return obj
    }
    if (data.filters && data.filters.length > 0) {
      for (let i = 0, len = data.filters.length; i < len; i++) {
        const item = data.filters[i]
        if (item.filter === 'disk_schedtag') {
          const obj = genErrorObj(item, `${item.count} 台宿主机被 ${item.filter} 标签过滤`)
          ret.push(obj)
        } else if (item.filter.startsWith('host')) {
          const obj = genErrorObj(item, `${item.count} 台 ${FORECAST_FILTERS_MAP[item.filter]}`)
          ret.push(obj)
        } else {
          if (item.count > 0) {
            const obj = genErrorObj(item, FORECAST_FILTERS_MAP[item.filter] || `${item.count} 台主机被 ${item.filter} 标签过滤`)
            ret.push(obj)
          } else {
            const obj = genErrorObj(item, '被过滤')
            ret.push(obj)
          }
        }
      }
    } else if (data.results && data.results.length > 0) {
      const count = data.results.reduce((total, current) => {
        return total + parseInt(current.capacity)
      }, 0)
      ret.push({
        message: `最多可以创建 ${count} 台主机`,
      })
    } else {
      ret.push({
        message: '创建主机参数错误',
      })
    }
    return ret
  }
}
