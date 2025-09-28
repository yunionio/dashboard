// 创建主机相应组件的参数
import * as R from 'ramda'
import _ from 'lodash'
import ipaddr from 'ipaddr.js'
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
  GPU_DEV_TYPE_OPTION_MAP,
} from '@Compute/constants'
import { IMAGES_TYPE_MAP, HOST_CPU_ARCHS } from '@/constants/compute'

import { HYPERVISORS_MAP } from '@/constants'
import validateForm, { isRequired, isWithinRange } from '@/utils/validate'
import store from '@/store'
import i18n from '@/locales'
import { diskSupportTypeMedium, getOriginDiskKey } from '@/utils/common/hypervisor'

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

export function getIpv6Start (ipv6) {
  try {
    const IPv6 = ipaddr.IPv6.parse(ipv6)
    return IPv6.toNormalizedString().split(':').slice(0, 4).join(':') + ':'
  } catch (err) {
    console.error('IPv6 address is error')
    return ''
  }
}

export function ipv6ToHex (ipv6) {
  return ipv6.parts.map(part => part.toString(16).padStart(4, '0')).join('')
}

export function checkIpV6 (i, networkData) {
  return (rule, value, cb) => {
    const ipv6First = getIpv6Start(networkData.guest_ip6_start)
    try {
      const ipv6 = ipv6First + value
      const ipAddr = ipaddr.IPv6.parse(ipv6)
      const subnet1Addr = ipaddr.IPv6.parse(networkData.guest_ip6_start)
      const subnet2Addr = ipaddr.IPv6.parse(networkData.guest_ip6_end)

      if (ipAddr.kind() !== 'ipv6') {
        cb(new Error(i18n.t('compute.error_ipv6')))
      }
      const target = ipv6ToHex(ipAddr)
      const start = ipv6ToHex(subnet1Addr)
      const end = ipv6ToHex(subnet2Addr)
      // 检查IP是否在两个子网之间
      if (!((target >= start && target <= end))) {
        cb(new Error(i18n.t('compute.ipv6_within_range')))
      }
      cb()
    } catch (err) {
      cb(new Error(i18n.t('compute.error_ipv6')))
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

export const createVmDecorators = (type, initData = {}) => {
  let imageTypeInitValue = IMAGES_TYPE_MAP.standard.key
  if (type === SERVER_TYPE.public) {
    imageTypeInitValue = IMAGES_TYPE_MAP.public.key // 公有云机器默认选择公有云镜像
  }
  if (type === SERVER_TYPE.private) {
    imageTypeInitValue = IMAGES_TYPE_MAP.private.key // 私有云机器默认选择私有云镜像
  }
  let initImage = ''
  if (!R.isNil(initData.extraData?.image_type) && !R.isEmpty(initData.extraData?.image_type)) {
    if (initData.disks && initData.disks.length) {
      if (initData.disks[0].image_id) {
        initImage = initData.disks[0].image_id
      }
    }
    const initImageType = initData.extraData?.image_type
    if (initImageType === IMAGES_TYPE_MAP.iso.key || initImageType === IMAGES_TYPE_MAP.private_iso.key) {
      initImage = initData.cdrom || ''
    }
    if (initImageType === IMAGES_TYPE_MAP.host.key) {
      initImage = initData.guest_image_id || ''
    }
    if (initImageType === IMAGES_TYPE_MAP.snapshot.key) {
      initImage = initData.instance_snapshot_id || ''
    } else if (initImageType === IMAGES_TYPE_MAP.backup.key) {
      initImage = initData.instance_backup_id || ''
    }
  }
  let initSystemDiskIops = ''
  let initSystemDiskThroughput = ''
  if (initData.disks && initData.disks.length && initData.disks[0].disk_type === 'sys') {
    initSystemDiskIops = initData.disks[0].iops
    initSystemDiskThroughput = initData.disks[0].throughput
  }
  let initNetworkType = NETWORK_OPTIONS_MAP.default.key
  if (initData.nets) {
    if (initData.nets[0] && initData.nets[0].hasOwnProperty('exit') && !initData.nets[0].exit) {
      initNetworkType = NETWORK_OPTIONS_MAP.default.key
    }
    if (initData.nets[0] && initData.nets[0].hasOwnProperty('network') && initData.extraData?.nets && initData.extraData?.nets[0] && initData.extraData?.nets[0].hasOwnProperty('network_id')) {
      initNetworkType = NETWORK_OPTIONS_MAP.manual.key
    }
  }
  let initEipType = EIP_TYPES_MAP.none.key
  if (initData.eip_charge_type) {
    initEipType = EIP_TYPES_MAP.new.key
  } else if (initData.public_ip_charge_type) {
    initEipType = EIP_TYPES_MAP.public.key
  }
  let initSecgroupType = 'default'
  if (initData.secgroups && initData.secgroups.length) {
    initSecgroupType = 'bind'
  }
  let initSchedPolicyType = 'default'
  if (initData.prefer_host) {
    initSchedPolicyType = 'host'
  }
  if (initData.schedtags && initData.schedtags.length) {
    initSchedPolicyType = 'schedtag'
  }
  let initEncryptEnable = ''
  if (initData.encrypt_key_new) {
    initEncryptEnable = 'new'
  }
  if (initData.encrypt_key_id) {
    initEncryptEnable = 'existing'
  }
  let initLoginType = 'random'
  if (initData.keypair) {
    initLoginType = 'keypair'
  }
  if (initData.hasOwnProperty('reset_password') && !initData.reset_password) {
    initLoginType = 'image'
  }
  if (initData.hasOwnProperty('password') && initData.password) {
    initLoginType = 'password'
  }
  return {
    domain: [
      'domain',
      {
        initialValue: initData.extraData?.domain_id,
        rules: [
          { validator: isRequired(), message: i18n.t('rules.domain'), trigger: 'change' },
        ],
      },
    ],
    project: [
      'project',
      {
        initialValue: initData.project_id,
        rules: [
          { validator: isRequired(), message: i18n.t('rules.project'), trigger: 'change' },
        ],
      },
    ],
    name: [
      'name',
      {
        initialValue: initData.generate_name || '',
        validateTrigger: 'blur',
        validateFirst: true,
        rules: [
          { required: true, message: i18n.t('compute.text_210') },
          // { validator: validateForm('resourceCreateName') },
        ],
      },
    ],
    description: [
      'description',
      {
        initialValue: initData.description || '',
      },
    ],
    reason: [
      'reason',
      {
        initialValue: initData.extraData?.reason || '',
      },
    ],
    count: [
      'count',
      {
        initialValue: initData.__count__ || 1,
        rules: [
          { required: true, message: i18n.t('compute.text_211') },
        ],
      },
    ],
    cloudregionZone: {
      cloudregion: [
        'cloudregion',
        {
          initialValue: { key: initData.prefer_region || '', label: '' },
          rules: [
            { validator: isRequired(), message: i18n.t('compute.text_212') },
          ],
        },
      ],
      zone: [
        'zone',
        {
          initialValue: { key: initData.prefer_zone || '', label: '' },
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
          initialValue: initData.prefer_manager || '',
          rules: [
            { required: true, message: i18n.t('compute.text_149') },
          ],
        },
      ],
      os: [
        'os',
        {
          initialValue: initData.extraData?.os || '',
          rules: [
            { required: true, message: i18n.t('compute.text_153') },
          ],
        },
      ],
      image: [
        'image',
        {
          initialValue: { key: initImage, label: '' },
          rules: [
            { validator: isRequired(), message: i18n.t('compute.text_214') },
          ],
        },
      ],
      imageType: [
        'imageType',
        {
          initialValue: initData.extraData?.image_type || imageTypeInitValue,
        },
      ],
    },
    loginConfig: {
      loginType: [
        'loginType',
        {
          initialValue: initLoginType,
        },
      ],
      keypair: [
        'loginKeypair',
        {
          initialValue: initData.keypair || '', // { key: '', label: '' }
          rules: [
            { required: true, message: i18n.t('compute.text_203') },
          ],
        },
      ],
      password: [
        'loginPassword',
        {
          initialValue: initData.password || '',
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
        initialValue: initData.hypervisor || '',
        rules: [
          { required: true, message: i18n.t('compute.text_215') },
        ],
      },
    ],
    cloudprovider: [
      'cloudprovider',
      {
        rules: [
          { required: true, message: i18n.t('compute.text_149') },
        ],
      },
    ],
    // 废弃数据，使用 pci 数据代替
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
      devType: [
        'devType',
        {
          initialValue: GPU_DEV_TYPE_OPTION_MAP['GPU-VGA'].value,
        },
      ],
    },
    pci: {
      pciEnable: [
        'pciEnable',
        {
          valuePropName: 'checked',
          initialValue: false,
        },
      ],
      pciDevType: i => [
        `pciDevType[${i}]`,
      ],
      pciModel: i => [
        `pciModel[${i}]`,
        {
          rules: [
            { required: true, message: i18n.t('compute.text_147') },
          ],
        },
      ],
      pciCount: i => [
        `pciCount[${i}]`,
        {
          initialValue: 1,
        },
      ],
    },
    vcpu: [
      'vcpu',
      {
        initialValue: initData.vcpu_count || 2,
      },
    ],
    vmem: [
      'vmem',
      {
        initialValue: initData.vmem_size || 2048,
      },
    ],
    sku: [
      'sku',
      {
        initialValue: initData.sku || '',
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
          initialValue: '',
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
      iops: [
        'systemDiskIops',
        {
          initialValue: initSystemDiskIops,
          rules: [{
            required: true,
            message: i18n.t('compute.iops_input_tip'),
          }],
        },
      ],
      throughput: [
        'systemDiskThroughput',
        {
          initialValue: initSystemDiskThroughput,
          rules: [{
            required: true,
            message: i18n.t('compute.throuthput_input_tip'),
          }],
        },
      ],
      preallocation: [
        'systemDiskPreallocation',
      ],
      auto_reset: [
        'systemDiskAutoReset',
        {
          valuePropName: 'checked',
          initialValue: false,
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
          initialValue: '',
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
      storage: i => [
        `dataDiskStorages[${i}]`,
        {
          rules: [{
            required: true,
            message: i18n.t('compute.text_1351'),
          }],
        },
      ],
      iops: i => [
        `dataDiskIops[${i}]`,
        {
          rules: [{
            required: true,
            message: i18n.t('compute.iops_input_tip'),
          }],
        },
      ],
      throughput: i => [
        `dataDiskThroughputs[${i}]`,
        {
          rules: [{
            required: true,
            message: i18n.t('compute.throughput_input_tip'),
          }],
        },
      ],
      preallocation: i => [
        `dataDiskPreallocation[${i}]`,
      ],
      auto_reset: i => [
        `dataDiskAutoReset[${i}]`,
        {
          valuePropName: 'checked',
          initialValue: false,
        },
      ],
    },
    network: {
      networkType: [
        'networkType',
        {
          initialValue: initNetworkType,
        },
      ],
      networkConfig: {
        vpcs: i => [
          `vpcs[${i}]`,
          {
            validateTrigger: ['change', 'blur'],
            initialValue: ['default', 'default'],
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
        ips6: (i, networkData) => [
          `networkIpsAddress6[${i}]`,
          {
            validateFirst: true,
            validateTrigger: ['blur', 'change'],
            rules: [
              {
                required: true,
                message: i18n.t('compute.complete_ipv6_address'),
              },
              {
                validator: checkIpV6(i, networkData),
              },
            ],
          },
        ],
        macs: (i, networkData) => [
          `networkMacs[${i}]`,
          {
            validateFirst: true,
            validateTrigger: ['blur', 'change'],
            rules: [
              {
                required: true,
                message: i18n.t('compute.text_806'),
              },
              {
                validator: validateForm('mac'),
              },
            ],
          },
        ],
        ipv6s: (i, networkData) => [
          `networkIPv6s[${i}]`,
          {
            validateFirst: true,
            valuePropName: 'checked',
            validateTrigger: ['blur', 'change'],
          },
        ],
        devices: i => [
          `networkDevices[${i}]`,
          {
            validateTrigger: ['change', 'blur'],
            rules: [{
              required: true,
              message: i18n.t('compute.sriov_device_tips'),
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
              message: i18n.t('compute.text_123'),
            }],
          },
        ],
        policys: (i, networkData) => [
          `networkPolicys[${i}]`,
          {
            validateTrigger: ['blur', 'change'],
            rules: [{
              required: true,
              message: i18n.t('common_256'),
            }],
          },
        ],
        devices: i => [
          `networkDevices[${i}]`,
          {
            validateTrigger: ['change', 'blur'],
            rules: [{
              required: true,
              message: i18n.t('compute.sriov_device_tips'),
            }],
          },
        ],
      },
    },
    schedPolicy: {
      schedPolicyType: [
        'schedPolicyType',
        {
          initialValue: initSchedPolicyType,
        },
      ],
      schedPolicyHost: [
        'schedPolicyHost',
        {
          initialValue: initData.prefer_host,
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
            rules: [{
              required: true,
              message: i18n.t('common_256'),
            }],
          },
        ],
      },
    },
    bios: [
      'bios',
      {
        initialValue: initData.bios || '',
      },
    ],
    vdi: [
      'vdi',
      {
        initialValue: initData.vdi || '',
      },
    ],
    vga: [
      'vga',
      {
        initialValue: initData.vga || '',
      },
    ],
    machine: [
      'machine',
      {
        initialValue: initData.machine || '',
      },
    ],
    backup: {
      backupEnable: [
        'backupEnable',
        {
          valuePropName: 'checked',
          initialValue: !!initData.prefer_backup_host || false,
        },
      ],
      backup: [
        'backup',
        {
          initialValue: initData.prefer_backup_host || '',
        },
      ],
    },
    duration: {
      durationStandard: [
        'durationStandard',
        {
          initialValue: initData.duration ? 'custom' : 'none',
        },
      ],
      duration: [
        'duration',
        {
          initialValue: initData.duration === '1w' ? '7d' : initData.duration || '1h',
        },
      ],
    },
    groups: {
      groupsEnable: [
        'groupsEnable',
        {
          valuePropName: 'checked',
          initialValue: !!(initData.groups && initData.groups.length),
        },
      ],
      groups: [
        'groups',
        {
          initialValue: initData.groups || [],
        },
      ],
    },
    bill: {
      billType: [
        'billType',
        {
          initialValue: initData.extraData?.billType || 'quantity',
        },
      ],
      duration: [
        'duration',
        {
          initialValue: initData.duration === '1w' ? '7d' : initData.duration || '1m',
        },
      ],
      autoRenew: [
        'autoRenew',
        {
          initialValue: initData.auto_renew || false,
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
          initialValue: initEipType,
        },
      ],
      charge_type: [
        'eip_charge_type',
        {
          initialValue: initData.eip_charge_type || initData.public_ip_charge_type,
        },
      ],
      bgp_type: [
        'eip_bgp_type',
        {
          initialValue: initData.eip_bgp_type || initData.public_ip_bgp_type,
        },
      ],
      bandwidth: [
        'eip_bw',
        {
          initialValue: initData.eip_bw || initData.public_ip_bw || 30,
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
          initialValue: initSecgroupType,
        },
      ],
      secgroup: [
        'secgroup',
        {
          validateFirst: true,
          initialValue: initData.secgroups || [],
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
        initialValue: initData.__meta__ || {},
        rules: [
          { validator: validateForm('tagName') },
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
      description: [
        'description',
      ],
    },
    os_arch: [
      'os_arch',
      {
        initialValue: initData.os_arch || '',
        rules: [
          { required: true, message: i18n.t('compute.text_1363') },
        ],
      },
    ],
    hostName: [
      'hostName',
      {
        initialValue: initData.hostname || '',
      },
    ],
    encrypt_keys: {
      encryptEnable: [
        'encryptEnable',
        {
          initialValue: initEncryptEnable || '',
        },
      ],
      encrypt_key_alg: [
        'encrypt_key_alg',
        {
          initialValue: initData.encrypt_key_alg || '',
        },
      ],
      encrypt_key_id: [
        'encrypt_key_id',
        {
          initialValue: initData.encrypt_key_id || '',
        },
      ],
    },
    custom_data_type: [
      'custom_data_type',
      {
        initialValue: initData.user_data ? 'input' : '',
      },
    ],
    deploy_telegraf: [
      'deploy_telegraf',
      {
        valuePropName: 'checked',
        initialValue: !(initData && initData.extraData && !initData.deploy_telegraf),
      },
    ],
    bastion_host: {
      bastion_host_enable: [
        'bastion_host_enable',
        {
          valuePropName: 'checked',
          initialValue: !!initData.bastion_server,
        },
      ],
      bastion_host_id: [
        'bastion_host_id',
        {
          initialValue: initData.bastion_server?.bastion_host_id || '',
          rules: [
            { required: true, message: i18n.t('compute.bastionHost.bastion_host.placeholder') },
          ],
        },
      ],
      bastion_org_id: [
        'bastion_org_id',
        {
          initialValue: initData.bastion_server?.bastion_org_id || '',
          rules: [
            { required: true, message: i18n.t('compute.bastionHost.bastion_org.placeholder') },
          ],
        },
      ],
      nodes: [
        'nodes',
        {
          initialValue: initData.bastion_server?.nodes || [],
          rules: [
            { required: true, message: i18n.t('compute.bastionHost.node.placeholder') },
          ],
        },
      ],
      port: [
        'port',
        {
          initialValue: initData.bastion_server?.port || 22,
          rules: [
            { type: 'number', min: 0, max: 65535, message: i18n.t('compute.bastionHost.port.placeholder'), trigger: 'blur', transform: (v) => parseInt(v) },
          ],
        },
      ],
      privileged_accounts: [
        'privileged_accounts',
        {
          rules: [
            { required: true, message: i18n.t('compute.bastionHost.privileged_account.placeholder') },
          ],
        },
      ],
      accounts: [
        'accounts',
        {
          rules: [
            { required: true, message: i18n.t('compute.bastionHost.account.placeholder') },
          ],
        },
      ],
      bastion_domain_id: [
        'bastion_domain_id',
        {
          initialValue: initData.bastion_server?.bastion_domain_id || '',
        },
      ],
    },
    is_daemon: [
      'is_daemon',
      {
        valuePropName: 'checked',
        initialValue: initData.is_daemon || false,
      },
    ],
  }
}

const decoratorGroup = {
  idc: ['domain', 'project', 'cloudregionZone', 'name', 'description', 'reason', 'count', 'imageOS', 'loginConfig', 'hypervisor', 'gpu', 'vcpu', 'vmem', 'sku', 'systemDisk', 'dataDisk', 'network', 'secgroup', 'schedPolicy', 'bios', 'vdi', 'vga', 'machine', 'backup', 'duration', 'groups', 'tag', 'servertemplate', 'eip', 'os_arch', 'hostName', 'encrypt_keys', 'custom_data_type', 'deploy_telegraf', 'pci', 'bastion_host', 'is_daemon'],
  public: ['domain', 'project', 'name', 'description', 'count', 'imageOS', 'reason', 'loginConfig', 'vcpu', 'vmem', 'sku', 'systemDisk', 'dataDisk', 'network', 'schedPolicy', 'bill', 'eip', 'secgroup', 'resourceType', 'tag', 'servertemplate', 'duration', 'cloudprovider', 'hostName', 'custom_data_type', 'bastion_host'],
  private: ['domain', 'project', 'cloudregionZone', 'name', 'description', 'reason', 'count', 'imageOS', 'loginConfig', 'hypervisor', 'vcpu', 'vmem', 'sku', 'systemDisk', 'dataDisk', 'network', 'secgroup', 'schedPolicy', 'duration', 'tag', 'servertemplate', 'cloudprovider', 'hostName', 'custom_data_type', 'bastion_host'],
}

export class Decorator {
  decorators = {}
  constructor (type) {
    this.type = type
  }

  createDecorators (initData) {
    const decoratorArr = decoratorGroup[this.type]
    if (decoratorArr) {
      decoratorArr.forEach(dec => {
        const decorators = createVmDecorators(this.type, initData)
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
    if (type === 'sys' && this.fd.imageType !== IMAGES_TYPE_MAP.iso.key && this.fd.hypervisor !== HYPERVISORS_MAP.proxmox.key) {
      if (this.fd.image && this.fd.image.key) {
        ret.image_id = this.fd.image.key
      }
    }
    if (type === 'sys' && this.fd.imageType === IMAGES_TYPE_MAP.iso.key && this.isWindows()) {
      ret.driver = 'ide'
    }
    if (item.medium) {
      ret.medium = item.medium
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
    if (item.iops) {
      ret.iops = item.iops
    }
    if (item.throughput) {
      ret.throughput = item.throughput
    }
    if (item.preallocation) {
      ret.preallocation = item.preallocation
    }
    // 磁盘区分介质
    if (diskSupportTypeMedium(this.fd.hypervisor)) {
      ret.backend = getOriginDiskKey(ret.backend)
    }
    if (item.auto_reset) {
      ret.auto_reset = true
    }
    return ret
  }

  isWindows () {
    let isWindows = false
    const osType = (_.get(this.fi, 'imageMsg.info.properties.os_type') || '').toLowerCase()
    const os = (_.get(this.fd, 'os') || '').toLowerCase()
    if (~[osType, os].indexOf('windows')) {
      isWindows = true
    }
    return isWindows
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
    let dataDiskType = this._getDataDiskType(this.fd.dataDiskTypes)
    const systemDisk = {
      type: sysDiskType,
      size: this.fd.systemDiskSize,
    }
    // 磁盘介质
    if (this.fi.systemDiskMedium) {
      systemDisk.medium = this.fi.systemDiskMedium
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
    if (this.fd.systemDiskIops) {
      systemDisk.iops = this.fd.systemDiskIops
    }
    if (this.fd.systemDiskThroughput) {
      systemDisk.throughput = this.fd.systemDiskThroughput
    }
    if (this.fd.systemDiskPreallocation) {
      systemDisk.preallocation = this.fd.systemDiskPreallocation
    }
    if (this.fd.systemDiskAutoReset) {
      systemDisk.auto_reset = this.fd.systemDiskAutoReset
    }
    // #7356 新建vmware主机，数据盘没有传磁盘类型字段
    if (this.fd.hypervisor === HYPERVISORS_MAP.esxi.key) {
      dataDiskType = dataDiskType || sysDiskType
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
      if (this.fd.dataDiskStorages && this.fd.dataDiskStorages[key]) {
        // if system disk specifies storage, the data disks should do the same
        diskObj.storage_id = this.fd.dataDiskStorages[key] || this.fd.systemDiskStorage
      }
      if (this.fd.dataDiskIops && this.fd.dataDiskIops[key]) {
        diskObj.iops = this.fd.dataDiskIops[key]
      }
      if (this.fd.dataDiskThroughputs && this.fd.dataDiskThroughputs[key]) {
        diskObj.throughput = this.fd.dataDiskThroughputs[key]
      }
      if (this.fi.dataDiskMedium) {
        diskObj.medium = this.fi.dataDiskMedium
      }
      if (this.fd.dataDiskPreallocation && this.fd.dataDiskPreallocation[key]) {
        diskObj.preallocation = this.fd.dataDiskPreallocation[key]
      }
      if (this.fd.dataDiskAutoReset && this.fd.dataDiskAutoReset[key]) {
        diskObj.auto_reset = this.fd.dataDiskAutoReset[key]
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
    const extraRet = []
    // 指定 IP 子网
    if (this.fd.networkType === NETWORK_OPTIONS_MAP.manual.key) {
      ret = []
      R.forEachObjIndexed((value, key) => {
        const obj = {
          network: value,
        }
        const extraObj = {
          vpc: this.fd[`vpcs[${key}]`] || this.fd.vpcs[key],
        }
        if (this.fd.networkIps) {
          const address = this.fd.networkIps[key]
          if (address) {
            obj.address = address
          }
        }
        if (this.fd.networkMacs) {
          const mac = this.fd.networkMacs[key]
          if (mac) {
            obj.mac = mac
          }
        }
        if (this.fd.networkExits) {
          const exit = this.fd.networkExits[key]
          if (exit) {
            obj.exit = true
          }
        }
        if (this.fd.networkIPv6s) {
          const ipv6 = this.fd.networkIPv6s[key]
          if (ipv6) {
            obj.require_ipv6 = true
          }
        }
        if (this.fd.networkIpsAddress6) {
          const ipv6Last = this.fd.networkIpsAddress6[key]
          const target = this.fi.networkList.filter(item => item.key === key)
          const ipv6First = getIpv6Start(target[0]?.network?.guest_ip6_start)
          obj.address6 = ipv6First + ipv6Last
        }
        if (this.fd.networkDevices) {
          const device = this.fd.networkDevices[key]
          if (device) {
            obj.sriov_device = { model: device }
          }
        }
        ret.push(obj)
        extraRet.push({ ...obj, ...extraObj })
      }, this.fd.networks)
    }
    // 指定 调度标签
    if (this.fd.networkType === NETWORK_OPTIONS_MAP.schedtag.key) {
      ret = []
      R.forEachObjIndexed((value, key) => {
        const obj = {
          id: value,
        }
        const extraObj = {}
        const strategy = this.fd.networkPolicys[key]
        if (strategy) {
          obj.strategy = strategy
        }
        if (this.fd.networkDevices) {
          const device = this.fd.networkDevices[key]
          if (device) {
            obj.sriov_device = { model: device }
          }
        }
        ret.push({
          schedtags: [obj],
        })
        extraRet.push({ schedtags: [{ ...obj, ...extraObj }] })
      }, this.fd.networkSchedtags)
    }
    return { networks: ret, extraNetworks: extraRet }
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
   * 获取配置的PCI数据
   *
   * @returns { Array }
   * @memberof GenCreateData
   */
  genPciDevices () {
    const ret = []
    const { pciCount, pciModel } = this.fd
    const pciKeys = Object.keys(this.fd.pciCount)
    pciKeys.forEach(key => {
      for (let i = 0, len = pciCount[key]; i < len; i++) {
        const regexp = /vendor=(.+):(.+)/
        const matched = pciModel[key].match(regexp)
        const model = matched[2]
        const vendor = matched[1]
        ret.push({
          model,
          vendor,
        })
      }
    })
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
    // if (this.fd.schedPolicyType === SCHED_POLICY_OPTIONS_MAP.cloudprovider.key) {
    //   ret.key = 'prefer_manager'
    //   ret.value = this.fd.cloudprovider
    // }
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
   * 获取CPU插槽数
   * @returns
   */
  getCpuSockets () {
    return this.fi.cpuSockets
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

  getPreferManagerId () {
    let prefer_manager_id = ''
    const hypervisor = this.getHypervisor()
    const privateHypervisors = [HYPERVISORS_MAP.hcso.key, HYPERVISORS_MAP.hcs.key]
    if (this.isPublic || privateHypervisors.includes(hypervisor)) {
      prefer_manager_id = this.fd.cloudprovider
    }
    return prefer_manager_id
  }

  /**
   * 组装所有的创建数据
   *
   * @returns { Object }
   * @memberof GenCreateData
   */
  all () {
    const { create_server_auto_start = true } = store.getters.globalSetting.value || {}
    const { networks, extraNetworks } = this.genNetworks()
    const data = {
      auto_start: create_server_auto_start,
      generate_name: this.fd.name && this.fd.name.trim(),
      description: this.fd.description,
      hypervisor: this.getHypervisor(),
      __count__: this.fd.count,
      disks: this.genDisks(),
      nets: networks,
      prefer_region: this.getPreferRegion(),
      vcpu_count: this.getCpuCount(),
      vmem_size: this.getMemSize(),
      project_id: (this.fd.project && this.fd.project.key) || store.getters.userInfo.projectId,
      os_arch: _.get(HOST_CPU_ARCHS, `[${this.fd.os_arch}].key`),
      hostname: this.fd.hostName,
      extraData: {
        domain_id: (this.fd.domain && this.fd.domain.key) || store.getters.userInfo.domainId,
        image_type: this.fd.imageType,
        os: this.fd.os,
        nets: extraNetworks,
      },
    }
    // 非预付费资源池不会添加sku
    if (!this.isPrepaid) {
      data.sku = this.fd.sku.name
    }
    // 弹性IP
    if (this.isPublic || this.isIDC) {
      if (this.fd.eip_type === EIP_TYPES_MAP.new.key || this.fd.eip_type === EIP_TYPES_MAP.public.key) {
        if (
          this.fd.eip_charge_type === EIP_CHARGE_TYPES_MAP.traffic.key ||
          this.fd.eip_charge_type === EIP_CHARGE_TYPES_MAP.bandwidth.key
        ) {
          if (this.fd.eip_type === EIP_TYPES_MAP.public.key) {
            data.public_ip_charge_type = this.fd.eip_charge_type
            data.public_ip_bw = this.fd.eip_bw
          } else {
            data.eip_charge_type = this.fd.eip_charge_type
            data.eip_bw = this.fd.eip_bw
          }
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
        data.extraData.billType = 'package'
      }
      // 线路类型
      data.eip_bgp_type = this.fd.eip_bgp_type
    }
    // gpu
    // if (this.fd.gpuEnable) {
    //   data.isolated_devices = this.genDevices()
    // }
    // pci
    if (this.fd.pciEnable) {
      data.isolated_devices = this.genPciDevices()
    }
    // 管理员密码非默认的情况下进行传参设置
    if (this.fd.loginType !== LOGIN_TYPES_MAP.random.key) {
      const loginValueKey = this.getLoginValueKey()
      data[loginValueKey.key] = loginValueKey.value
    }
    // 安全组
    if (this.fd.secgroup_type && this.fd.secgroup_type === SECGROUP_OPTIONS_MAP.bind.key) {
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
    const prefer_manager_id = this.getPreferManagerId()
    if (prefer_manager_id) {
      data.prefer_manager_id = prefer_manager_id
    }
    // 只有kvm支持启动方式, VDI, VGA, Machine
    if (this.fd.hypervisor === HYPERVISORS_MAP.kvm.key) {
      data.bios = this.fd.bios
      data.vdi = this.fd.vdi
      data.vga = this.fd.vga
      data.machine = this.fd.machine
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
    if (this.fd.imageType === IMAGES_TYPE_MAP.iso.key || this.fd.imageType === IMAGES_TYPE_MAP.private_iso.key) {
      data.cdrom = this.fd.image.key
    }
    // 主机镜像需要guest image id参数，并且把磁盘中的镜像ID回填回去
    if (this.fd.imageType === IMAGES_TYPE_MAP.host.key) {
      data.guest_image_id = this.fd.image.key
      data.disks.forEach((val, i) => {
        if (i === 0) { // 系统盘
          data.disks[i] = { ...val, image_id: this.fi.imageMsg.root_image.id }
        } else if (this.fi.imageMsg.data_images && i - 1 < this.fi.imageMsg.data_images.length) {
          data.disks[i] = { ...val, image_id: this.fi.imageMsg.data_images[i - 1].id }
        }
      })
    }
    // cloudpods iso 镜像需加参数 cdrom,并移除磁盘中的image_id参数
    if (this.fi.imageMsg?.disk_format === 'iso' || this.fi.imageMsg?.info?.disk_format === 'iso' || (this.fd.image?.label || '').endsWith('.iso')) {
      const { hypervisor_info = {} } = this.fi.capability || {}
      const keys = Object.keys(hypervisor_info)
      if (keys.length === 1 && keys[0] === HYPERVISORS_MAP.cloudpods.provider) {
        data.cdrom = this.fd.image.key
        data.disks = (data.disks || []).map(item => {
          const ret = { ...item }
          delete ret.image_id
          return ret
        })
      }
    }
    // 主机快照需要instance_snapshot_id参数
    if (this.fd.imageType === IMAGES_TYPE_MAP.snapshot.key) {
      data.instance_snapshot_id = this.fd.image.key
      delete data.disks // 主机快照不需要 disks 字段
    } else if (this.fd.imageType === IMAGES_TYPE_MAP.backup.key) {
      data.instance_backup_id = this.fd.image.key
      // delete data.disks // 主机备份可以保留 disks 字段
    }
    // 主机组
    if (this.fd.groupsEnable && this.fd.groups && this.fd.groups.length) {
      data.groups = this.fd.groups
    }
    // 标签
    if (this.fd.tag) {
      data.__meta__ = this.fd.tag
    }
    // 主机加密
    if (this.fd.encryptEnable === 'existing' && this.fd.encrypt_key_id) {
      data.encrypt_key_id = this.fd.encrypt_key_id
    } else if (this.fd.encryptEnable === 'new') {
      data.encrypt_key_new = true
      data.encrypt_key_alg = this.fd.encrypt_key_alg
      data.encrypt_key_user_id = store.getters.userInfo.id
    }
    // 自定义数据
    if (this.fd.custom_data_type) {
      data.custom_data_type = this.fd.custom_data_type
    }
    // 安装监控 agent
    if (this.isIDC) {
      if ((this.isWindows() && this.fd.os_arch !== HOST_CPU_ARCHS.arm.key) || !this.isWindows()) {
        if (this.fd.deploy_telegraf) {
          data.deploy_telegraf = this.fd.deploy_telegraf
        }
      }
    }
    if (this.fd.hypervisor === HYPERVISORS_MAP.kvm.key) {
      if (this.fd.is_daemon) {
        data.is_daemon = this.fd.is_daemon
      }
    }
    if (this.fi.showCpuSockets) {
      data.cpu_sockets = this.getCpuSockets()
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
