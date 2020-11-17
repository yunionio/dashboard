// 创建主机相应组件的参数
import * as R from 'ramda'
import _ from 'lodash'
import {
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
import { IMAGES_TYPE_MAP, HOST_CPU_ARCHS } from '@/constants/compute'
import { HYPERVISORS_MAP } from '@/constants'
import validateForm, { isRequired, isWithinRange } from '@/utils/validate'
import store from '@/store'
import i18n from '@/locales'

export function checkIpInSegment (i, networkData) {
  return (rule, value, cb) => {
    const isIn = isWithinRange(value, networkData.guest_ip_start, networkData.guest_ip_end)
    if (isIn) {
      cb()
    } else {
      cb(new Error(i18n.t('compute.text_205')))
    }
  }
}

export function diskValidator (rule, value, callback) {
  if (R.isNil(value) || R.isEmpty(value)) {
    return callback(new Error(i18n.t('compute.text_206')))
  }
  if (!value.startsWith('/')) {
    return callback(new Error(i18n.t('compute.text_207')))
  }
  if (value === '/') {
    return callback(new Error(i18n.t('compute.text_208')))
  }
  callback()
}

function validateTag (rule, value, callback) {
  if (R.is(Object, value) && Object.keys(value).length > 20) {
    return callback(new Error(i18n.t('compute.text_209')))
  }
  callback()
}

export const createVmDecorators = type => {
  let imageTypeInitValue = IMAGES_TYPE_MAP.standard.key
  if (type === SERVER_TYPE.public) {
    imageTypeInitValue = IMAGES_TYPE_MAP.public.key // 公有云机器默认选择公有云镜像
  }
  if (type === SERVER_TYPE.private) {
    imageTypeInitValue = IMAGES_TYPE_MAP.private.key // 私有云机器默认选择私有云镜像
  }
  return {
    domain: [
      'domain',
      {
        rules: [
          { validator: isRequired(), message: i18n.t('rules.domain'), trigger: 'change' },
        ],
      },
    ],
    project: [
      'project',
      {
        rules: [
          { validator: isRequired(), message: i18n.t('rules.project'), trigger: 'change' },
        ],
      },
    ],
    name: [
      'name',
      {
        initialValue: '',
        validateTrigger: 'blur',
        validateFirst: true,
        rules: [
          { required: true, message: i18n.t('compute.text_210') },
          { validator: validateForm('resourceCreateName') },
        ],
      },
    ],
    reason: [
      'reason',
    ],
    count: [
      'count',
      {
        initialValue: 1,
        rules: [
          { required: true, message: i18n.t('compute.text_211') },
        ],
      },
    ],
    cloudregionZone: {
      cloudregion: [
        'cloudregion',
        {
          initialValue: { key: '', label: '' },
          rules: [
            { validator: isRequired(), message: i18n.t('compute.text_212') },
          ],
        },
      ],
      zone: [
        'zone',
        {
          initialValue: { key: '', label: '' },
          rules: [
            { validator: isRequired(), message: i18n.t('compute.text_213') },
          ],
        },
      ],
    },
    imageOS: {
      prefer_manager: [
        'prefer_manager',
        {
          rules: [
            { required: true, message: i18n.t('compute.text_149') },
          ],
        },
      ],
      os: [
        'os',
        {
          initialValue: '',
          rules: [
            { required: true, message: i18n.t('compute.text_153') },
          ],
        },
      ],
      image: [
        'image',
        {
          initialValue: { key: '', label: '' },
          rules: [
            { validator: isRequired(), message: i18n.t('compute.text_214') },
          ],
        },
      ],
      imageType: [
        'imageType',
        {
          initialValue: imageTypeInitValue,
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
            { required: true, message: i18n.t('compute.text_203') },
          ],
        },
      ],
      password: [
        'loginPassword',
        {
          initialValue: '',
          validateFirst: true,
          rules: [
            { required: true, message: i18n.t('compute.text_204') },
            { validator: validateForm('sshPassword') },
          ],
        },
      ],
    },
    hypervisor: [
      'hypervisor',
      {
        rules: [
          { required: true, message: i18n.t('compute.text_215') },
        ],
      },
    ],
    gpu: {
      gpuEnable: [
        'gpuEnable',
        {
          valuePropName: 'checked',
          initialValue: false,
        },
      ],
      gpu: [
        'gpu',
        {
          rules: [
            { required: true, message: i18n.t('compute.text_147') },
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
          { validator: isRequired(true, 'id'), message: i18n.t('compute.text_216') },
        ],
      },
    ],
    systemDisk: {
      type: [
        'systemDiskType',
        {
          rules: [
            { validator: isRequired(), message: i18n.t('compute.text_121') },
          ],
        },
      ],
      size: [
        'systemDiskSize',
        {
          rules: [
            { required: true, message: i18n.t('compute.text_122') },
          ],
        },
      ],
      schedtag: [
        'systemDiskSchedtag',
        {
          validateTrigger: ['change', 'blur'],
          rules: [{
            required: true,
            message: i18n.t('compute.text_123'),
          }],
        },
      ],
      policy: [
        'systemDiskPolicy',
        {
          validateTrigger: ['blur', 'change'],
          rules: [{
            required: true,
            message: i18n.t('compute.text_123'),
          }],
        },
      ],
      storage: [
        'systemDiskStorage',
        {
          rules: [{
            required: true,
            message: i18n.t('compute.text_1351'),
          }],
        },
      ],
    },
    dataDisk: {
      type: i => [
        `dataDiskTypes[${i}]`,
        {
          rules: [
            { validator: isRequired(), message: i18n.t('compute.text_121') },
          ],
        },
      ],
      size: i => [
        `dataDiskSizes[${i}]`,
        {
          rules: [
            { required: true, message: i18n.t('compute.text_122') },
          ],
        },
      ],
      schedtag: i => [
        `dataDiskSchedtags[${i}]`,
        {
          validateTrigger: ['change', 'blur'],
          rules: [{
            required: true,
            message: i18n.t('compute.text_123'),
          }],
        },
      ],
      policy: i => [
        `dataDiskPolicys[${i}]`,
        {
          validateTrigger: ['blur', 'change'],
          rules: [{
            required: true,
            message: i18n.t('compute.text_123'),
          }],
        },
      ],
      snapshot: i => [
        `dataDiskSnapshots[${i}]`,
        {
          validateTrigger: ['blur', 'change'],
          rules: [{
            required: true,
            message: i18n.t('compute.text_124'),
          }],
        },
      ],
      filetype: i => [
        `dataDiskFiletypes[${i}]`,
        {
          validateTrigger: ['blur', 'change'],
          rules: [{
            required: true,
            message: i18n.t('compute.text_125'),
          }],
        },
      ],
      mountPath: i => [
        `dataDiskMountPaths[${i}]`,
        {
          validateTrigger: ['blur', 'change'],
          rules: [{
            required: true,
            message: i18n.t('compute.text_126'),
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
          initialValue: NETWORK_OPTIONS_MAP.default.key,
        },
      ],
      networkConfig: {
        vpcs: i => [
          `vpcs[${i}]`,
          {
            validateTrigger: ['change', 'blur'],
            rules: [{
              required: true,
              message: i18n.t('compute.text_194'),
            }],
          },
        ],
        networks: i => [
          `networks[${i}]`,
          {
            validateTrigger: ['change', 'blur'],
            rules: [{
              required: true,
              message: i18n.t('compute.text_217'),
            }],
          },
        ],
        ips: (i, networkData) => [
          `networkIps[${i}]`,
          {
            validateFirst: true,
            validateTrigger: ['blur', 'change'],
            rules: [
              {
                required: true,
                message: i18n.t('compute.text_218'),
              },
              {
                validator: validateForm('IPv4'),
              },
              {
                validator: checkIpInSegment(i, networkData),
              },
            ],
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
              message: i18n.t('compute.text_123'),
            }],
          },
        ],
        policys: (i, networkData) => [
          `networkPolicys[${i}]`,
          {
            validateTrigger: ['blur', 'change'],
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
            { required: true, message: i18n.t('compute.text_219') },
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
              message: i18n.t('compute.text_123'),
            }],
          },
        ],
        policys: (i, networkData) => [
          `policySchedtagPolicys[${i}]`,
          {
            validateTrigger: ['blur', 'change'],
          },
        ],
      },
      cloudprovider: [ // 传给后端的字段是 prefer_manager
        'cloudprovider',
        {
          rules: [
            { required: true, message: i18n.t('compute.text_149') },
          ],
        },
      ],
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
    duration: {
      durationStandard: [
        'durationStandard',
        {
          initialValue: 'none',
        },
      ],
      duration: [
        'duration',
        {
          initialValue: '1h',
        },
      ],
    },
    groups: {
      groupsEnable: [
        'groupsEnable',
        {
          valuePropName: 'checked',
          initialValue: false,
        },
      ],
      groups: [
        'groups',
      ],
    },
    bill: {
      billType: [
        'billType',
        {
          initialValue: 'quantity',
        },
      ],
      duration: [
        'duration',
        {
          initialValue: '1M',
        },
      ],
      autoRenew: [
        'autoRenew',
        {
          valuePropName: 'checked',
        },
      ],
    },
    resourceType: [
      'resourceType',
      {
        preserve: true,
        initialValue: RESOURCE_TYPES_MAP.shared.key,
      },
    ],
    eip: {
      type: [
        'eip_type',
        {
          initialValue: 'none',
        },
      ],
      charge_type: [
        'eip_charge_type',
      ],
      bgp_type: [
        'eip_bgp_type',
        {
          initialValue: '',
        },
      ],
      bandwidth: [
        'eip_bw',
        {
          initialValue: 30,
        },
      ],
      eip: [
        'eip',
        {
          rules: [
            { required: true, message: i18n.t('compute.text_145') },
          ],
        },
      ],
    },
    secgroup: {
      type: [
        'secgroup_type',
        {
          initialValue: 'default',
        },
      ],
      secgroup: [
        'secgroup',
        {
          validateFirst: true,
          rules: [
            { required: true, message: i18n.t('compute.text_190') },
            // { validator: secgroupValidator }, // Azure和Ucloud的安全组最大关联一个，动态效验放在组件内部
          ],
        },
      ],
    },
    tag: [
      'tag',
      {
        rules: [
          { validator: validateTag },
        ],
      },
    ],
    servertemplate: {
      servertemplate_name: [
        'servertemplate_name',
        {
          validateFirst: true,
          rules: [
            { required: true, message: i18n.t('compute.text_220') },
            { validator: validateForm('resourceName') },
          ],
        },
      ],
    },
    os_arch: [
      'os_arch',
      {
        rules: [
          { required: true, message: i18n.t('compute.text_1363') },
        ],
      },
    ],
  }
}

const decoratorGroup = {
  idc: ['domain', 'project', 'cloudregionZone', 'name', 'reason', 'count', 'imageOS', 'loginConfig', 'hypervisor', 'gpu', 'vcpu', 'vmem', 'sku', 'systemDisk', 'dataDisk', 'network', 'secgroup', 'schedPolicy', 'bios', 'backup', 'duration', 'groups', 'tag', 'servertemplate', 'eip', 'os_arch'],
  public: ['domain', 'project', 'name', 'count', 'imageOS', 'reason', 'loginConfig', 'vcpu', 'vmem', 'sku', 'systemDisk', 'dataDisk', 'network', 'schedPolicy', 'bill', 'eip', 'secgroup', 'resourceType', 'tag', 'servertemplate', 'duration'],
  private: ['domain', 'project', 'cloudregionZone', 'name', 'reason', 'count', 'imageOS', 'loginConfig', 'hypervisor', 'vcpu', 'vmem', 'sku', 'systemDisk', 'dataDisk', 'network', 'secgroup', 'schedPolicy', 'duration', 'tag', 'servertemplate'],
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
        const decorators = createVmDecorators(this.type)
        if (decorators[dec]) {
          this.decorators[dec] = decorators[dec]
        } else {
          console.error(i18n.t('compute.text_221', [dec]))
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
    if (R.isNil(fd)) return
    this.fd = fd
    this.fi = fi
    this.createType = this.fi.createType
    this.isPublic = this.createType === SERVER_TYPE.public
    this.isIDC = this.createType === SERVER_TYPE.idc
    this.isPrepaid = this.fd.resourceType === RESOURCE_TYPES_MAP.prepaid.key
    console.log(fd, 'createServerData')
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
    if (item.storage_id) {
      ret.storage_id = item.storage_id
    }
    return ret
  }

  _getDataDiskType (dataDiskTypes) {
    if (!R.isNil(dataDiskTypes) && !R.isEmpty(dataDiskTypes)) {
      const firstKey = Object.keys(dataDiskTypes)[0]
      if (firstKey && dataDiskTypes[firstKey]) {
        return dataDiskTypes[firstKey].key
      }
    }
  }

  _genDisksArr () {
    const sysDiskType = this.fd.systemDiskType.key
    const dataDiskType = this._getDataDiskType(this.fd.dataDiskTypes)
    const systemDisk = {
      type: sysDiskType,
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
    if (this.fd.systemDiskStorage) {
      systemDisk.storage_id = this.fd.systemDiskStorage
    }
    const dataDisk = []
    R.forEachObjIndexed((value, key) => {
      const diskObj = {
        size: value,
        type: dataDiskType,
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
        if (this.fd.networkExits) {
          const exit = this.fd.networkExits[key]
          if (exit) {
            obj.exit = true
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
    for (let i = 0, len = this.fd.gpuCount; i < len; i++) {
      const regexp = /vendor=(.+):(.+)/
      const matched = this.fd.gpu.match(regexp)
      const model = matched[2]
      const vendor = matched[1]
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
      if (this.isPublic) {
        ret.key = 'prefer_manager'
      } else {
        ret.key = 'prefer_host'
      }
      ret.value = this.fd.schedPolicyHost
    } else if (this.showPreferManager()) { // 如果是通过云账号过滤镜像
      ret.key = 'prefer_manager'
      ret.value = this.fd.prefer_manager
    }
    // 调度策略选择为 云账号
    if (this.fd.schedPolicyType === SCHED_POLICY_OPTIONS_MAP.cloudprovider.key) {
      ret.key = 'prefer_manager'
      ret.value = this.fd.cloudprovider
    }
    // 调度策略选择为 调度标签
    if (this.fd.schedPolicyType === SCHED_POLICY_OPTIONS_MAP.schedtag.key) {
      ret.key = 'schedtags'
      ret.value = []
      R.forEachObjIndexed((value, key) => {
        const item = { id: value }
        if (this.fd.policySchedtagPolicys[key]) {
          item.strategy = this.fd.policySchedtagPolicys[key]
        }
        ret.value.push(item)
      }, this.fd.policySchedtagSchedtags)
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
      const provider = this.fd.sku.provider
      if (provider) ret = provider.toLowerCase()
    }
    return ret
  }

  /**
   * 是否是通过云账号过滤后选择的镜像
   *
   * @returns { String }
   * @memberof GenCreateData
   */
  showPreferManager () {
    const imageMsg = IMAGES_TYPE_MAP[this.fd.imageType]
    return imageMsg && imageMsg.enable_cloudaccount
  }

  /**
   * 获取Region
   *
   * @returns { String }
   * @memberof GenCreateData
   */
  getPreferRegion () {
    if (this.isPublic && !this.isPrepaid) {
      return this.fd.sku.cloudregion_id
    }
    return this.fd.cloudregion.key
  }

  /**
   * 获取Zone
   *
   * @returns { String }
   * @memberof GenCreateData
   */
  getPreferZone () {
    let ret = ''
    if (R.is(Object, this.fd.zone)) {
      ret = this.fd.zone.key
    }
    if (R.is(String, this.fd.zone)) { // 字符串形式是公有云 AreaSelect 的 zone
      ret = this.fd.zone
    }
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
      os_arch: _.get(HOST_CPU_ARCHS, `[${this.fd.os_arch}].key`),
    }
    // 非预付费资源池不会添加sku
    if (!this.isPrepaid) {
      data.sku = this.fd.sku.name
    }
    // 弹性IP
    if (this.isPublic || this.isIDC) {
      if (this.fd.eip_type === EIP_TYPES_MAP.new.key) {
        if (
          this.fd.eip_charge_type === EIP_CHARGE_TYPES_MAP.traffic.key ||
          this.fd.eip_charge_type === EIP_CHARGE_TYPES_MAP.bandwidth.key
        ) {
          data.eip_charge_type = this.fd.eip_charge_type
          data.eip_bw = this.fd.eip_bw
        }
      }
      if (this.fd.eip_type === EIP_TYPES_MAP.bind.key) {
        data.eip = this.fd.eip
      }
      // 包年包月参数
      if (this.fd.billType === BILL_TYPES_MAP.package.key) {
        data.duration = this.fd.duration
        // 自动续费
        data.auto_renew = this.fd.autoRenew
      }
      // 线路类型
      data.eip_bgp_type = this.fd.eip_bgp_type
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
    if (this.fd.secgroup_type === SECGROUP_OPTIONS_MAP.bind.key) {
      data.secgroups = this.fd.secgroup
    }
    // 如果设置了调度策略则拼装调度所需数据 或者 通过云账号过滤镜像
    if ((this.fd.schedPolicyType !== SCHED_POLICY_OPTIONS_MAP.default.key) || this.showPreferManager()) {
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
    // 到期释放
    if (this.fd.billType !== BILL_TYPES_MAP.package.key && this.fd.durationStandard !== 'none') {
      if (this.fd.durationStandard === 'custom') {
        data.duration = this.fd.duration
      } else {
        data.duration = this.fd.durationStandard
      }
      data.billing_type = 'postpaid'
    }
    // 镜像类型为 iso 需要加参数 cdrom
    if (this.fd.imageType === IMAGES_TYPE_MAP.iso.key) {
      data.cdrom = this.fd.image.key
    }
    // 主机镜像需要guest image id参数，并且把磁盘中的镜像ID回填回去
    if (this.fd.imageType === IMAGES_TYPE_MAP.host.key) {
      data.guest_image_id = this.fd.image.key
      data.disks.forEach((val, i) => {
        if (i === 0) { // 系统盘
          data.disks[i] = { ...val, image_id: this.fi.imageMsg.root_image.id }
        } else {
          data.disks[i] = { ...val, image_id: this.fi.imageMsg.data_images[i - 1].id }
        }
      })
    }
    // 主机快照需要instance_snapshot_id参数
    if (this.fd.imageType === IMAGES_TYPE_MAP.snapshot.key) {
      data.instance_snapshot_id = this.fd.image.key
      delete data.disks // 主机快照不需要 disks 字段
    }
    // 主机组
    if (this.fd.groupsEnable && this.fd.groups && this.fd.groups.length) {
      data.groups = this.fd.groups
    }
    // 标签
    if (this.fd.tag) {
      data.__meta__ = this.fd.tag
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
        let message = `${i18n.t('dictionary.host')}【${item.name}】`
        const filterMapItem = FORECAST_FILTERS_MAP[item.filter_name]
        if (filterMapItem) {
          message += filterMapItem
        } else {
          message += i18n.t('compute.text_1325', [item.filter_name])
        }
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
      allow_count: data.allow_count || 0,
      req_count: data.req_count || 1,
      not_allow_reasons: data.not_allow_reasons,
    }
  }
}
