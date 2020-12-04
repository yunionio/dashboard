
import validateForm, { isRequired } from '@/utils/validate'
import i18n from '@/locales'

// 公有云计费方式配置选项
export const BILL_TYPES_MAP = {
  postpaid: {
    label: i18n.t('db.text_55'),
    key: 'postpaid',
  },
  prepaid: {
    label: i18n.t('db.text_56'),
    key: 'prepaid',
  },
}

export const BUY_DURATIONS_OPTIONS = [
  {
    label: i18n.t('db.text_240'),
    value: '1M',
    unit: 'M',
  },
  {
    label: i18n.t('db.text_241'),
    value: '2M',
    unit: 'M',
  },
  {
    label: i18n.t('db.text_242'),
    value: '3M',
    unit: 'M',
  },
  {
    label: i18n.t('db.text_243'),
    value: '6M',
    unit: 'M',
  },
  {
    label: i18n.t('db.text_244'),
    value: '1Y',
    unit: 'Y',
  },
  {
    label: i18n.t('db.text_245'),
    value: '2Y',
    unit: 'Y',
  },
  {
    label: i18n.t('db.text_246'),
    value: '3Y',
    unit: 'Y',
  },
]

// 账号权限
export const ACCOUNT_PRIVILEGES = {
  read: i18n.t('db.text_6'),
  write: i18n.t('db.text_5'),
  repl: i18n.t('db.text_247'),
}

export const ENGINE_KEYS = ['single', 'master', 'cluster', 'rwsplit']
// Elasticache机型翻译
export const ENGINE_ARCH = {
  single: i18n.t('db.text_76'),
  master: i18n.t('db.text_77'),
  cluster: i18n.t('db.text_248'),
  rwsplit: i18n.t('db.text_249'),
}

export const NODE_KEYS = ['single', 'double', 'readone', 'readthree', 'readfive']
// 节点类型翻译
export const NODE_TYPE = {
  readthree: i18n.t('db.text_250'),
  readone: i18n.t('db.text_251'),
  readfive: i18n.t('db.text_252'),
  single: i18n.t('db.text_253'),
  double: i18n.t('db.text_254'),
}

export const PERFORMANCE_TYPE_KEYS = ['standard', 'enhanced']
// 性能类型
export const PERFORMANCE_TYPE = {
  standard: i18n.t('db.text_255'),
  enhanced: i18n.t('db.text_256'),
}

// capbilit接口所需要的参数
export const CAPABILIT_PARAMS = ['billing_type', 'city', 'provider', 'cloudregion', 'zone']

// elasticcacheskus/instance-specs接口所需要的参数
export const SPECS_PARAMS = ['billing_type', 'engine', 'engine_version', 'local_category', 'node_type', 'performance_type']

// elasticcacheskus接口所需要的参数
export const SKU_PARAMS = ['project_domian', 'memory_size_mb', ...CAPABILIT_PARAMS, ...SPECS_PARAMS]

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
          { required: true, message: i18n.t('db.text_134'), trigger: 'change' },
        ],
      },
    ],
    domain: [
      'domain',
      {
        initialValue: undefined,
        rules: [
          { required: true, message: i18n.t('db.text_135'), trigger: 'change' },
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
        { required: true, message: i18n.t('db.text_136') },
        { validator: validateForm('resourceCreateName') },
      ],
    },
  ],
  count: [
    'count',
    {
      initialValue: 1,
      rules: [
        { required: true, message: i18n.t('db.text_257') },
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
          { validator: true, message: i18n.t('db.text_137') },
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
        rules: [
          { required: true, message: i18n.t('db.text_138') },
        ],
      },
    ],
  },
  __meta__: [
    '__meta__',
    {
      rules: [
        { validator: validateForm('tagName') },
      ],
    },
  ],
}
