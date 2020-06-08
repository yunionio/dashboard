
import validateForm, { isRequired } from '@/utils/validate'

// 公有云计费方式配置选项
export const BILL_TYPES_MAP = {
  postpaid: {
    label: '按量付费',
    key: 'postpaid',
  },
  prepaid: {
    label: '包年包月',
    key: 'prepaid',
  },
}

export const BUY_DURATIONS_OPTIONS = [
  {
    label: '1个月',
    value: '1M',
    unit: 'M',
  },
  {
    label: '2个月',
    value: '2M',
    unit: 'M',
  },
  {
    label: '3个月',
    value: '3M',
    unit: 'M',
  },
  {
    label: '半年',
    value: '6M',
    unit: 'M',
  },
  {
    label: '1年',
    value: '1Y',
    unit: 'Y',
  },
  {
    label: '2年',
    value: '2Y',
    unit: 'Y',
  },
  {
    label: '3年',
    value: '3Y',
    unit: 'Y',
  },
]

// 账号权限
export const ACCOUNT_PRIVILEGES = {
  read: '只读',
  write: '读写',
  repl: '复制',
}

export const ENGINE_KEYS = ['single', 'master', 'cluster', 'rwsplit']
// Elasticache机型翻译
export const ENGINE_ARCH = {
  single: '基础版',
  master: '高可用',
  cluster: '集群',
  rwsplit: '读写分离',
}

export const NODE_KEYS = ['single', 'double', 'readone', 'readthree', 'readfive']
// 节点类型翻译
export const NODE_TYPE = {
  readthree: '只读节点（3个）',
  readone: '只读节点（1个）',
  readfive: '只读节点（5个）',
  single: '单副本',
  double: '双副本',
}

export const PERFORMANCE_TYPE_KEYS = ['standard', 'enhanced']
// 性能类型
export const PERFORMANCE_TYPE = {
  standard: '标准性能',
  enhanced: '增强性能',
}

// capbilit接口所需要的参数
export const CAPABILIT_PARAMS = ['billing_type', 'city', 'provider', 'cloudregion', 'zone']

// elasticcacheskus/instance-specs接口所需要的参数
export const SPECS_PARAMS = ['billing_type', 'engine', 'engine_version', 'local_category', 'node_type', 'performance_type']

// elasticcacheskus接口所需要的参数
export const SKU_PARAMS = ['memory_size_mb', ...CAPABILIT_PARAMS, ...SPECS_PARAMS]

export const DECORATORS = {
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
  projectDomain: {
    project: [
      'project',
      {
        initialValue: undefined,
        rules: [
          { required: true, message: '请选择项目', trigger: 'change' },
        ],
      },
    ],
    domain: [
      'domain',
      {
        initialValue: undefined,
        rules: [
          { required: true, message: '请选择域', trigger: 'change' },
        ],
      },
    ],
  },
  generate_name: [
    'generate_name',
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
      rules: [
        { required: true, message: '请输入数量' },
      ],
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
        { required: true, message: '请选择套餐' },
      ],
    },
  ],
  regionZone: {
    cloudregion: [
      'region',
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
          { validator: true, message: '请选择关联密钥' },
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
          { required: true, message: '请选择VPC' },
        ],
      },
    ],
    network: [
      'network',
      {
        initialValue: undefined,
        rules: [
          { required: true, message: '请选择IP子网' },
        ],
      },
    ],
  },
}
