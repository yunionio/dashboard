import { schedulerProviderMaps } from '@Network/views/loadbalancerlistener/constants'
import { REGEXP } from '@/utils/validate'
import i18n from '@/locales'

const { IPv4, domain } = REGEXP

const domainValidator = (rule, value, cb) => {
  if (!value) {
    cb()
  } else if (IPv4.regexp.test(value)) {
    cb()
  } else if (domain.regexp.test(value)) {
    cb()
  } else {
    cb(Error(i18n.t('network.text_446')))
  }
}

const stickySessionCookieTimeout = {
  onecloud: [
    'sticky_session_cookie_timeout',
    {
      initialValue: 1000,
      normalize: v => Number(v),
      rules: [
        { type: 'integer', min: 1, max: 86400, message: i18n.t('network.text_447'), trigger: 'blur' },
      ],
    },
  ],
  aliyun: [
    'sticky_session_cookie_timeout',
    {
      initialValue: 1000,
      normalize: v => Number(v),
      rules: [
        { type: 'integer', min: 1, max: 86400, message: i18n.t('network.text_447'), trigger: 'blur' },
      ],
    },
  ],
  qcloud: [
    'sticky_session_cookie_timeout',
    {
      initialValue: 1000,
      normalize: v => Number(v),
      rules: [
        { type: 'integer', min: 30, max: 3600, message: i18n.t('network.text_447'), trigger: 'blur' },
      ],
    },
  ],
  huawei: [ // 动态表单验证，组件内部UI绑定，这里声明无效
    'sticky_session_cookie_timeout',
    {
      initialValue: 60,
    },
  ],
  default: [
    'sticky_session_cookie_timeout',
  ],
}

const clientIdleTimeout = {
  onecloud: [
    'client_idle_timeout',
    {
      initialValue: 90,
      normalize: v => Number(v),
      rules: [
        { type: 'integer', min: 0, max: 600, message: i18n.t('network.text_448'), trigger: 'blur' },
      ],
    },
  ],
  aliyun: [
    'client_idle_timeout',
    {
      initialValue: 15,
      normalize: v => Number(v),
      rules: [
        { type: 'integer', min: 1, max: 60, message: i18n.t('network.text_449'), trigger: 'blur' },
      ],
    },
  ],
  default: [
    'client_idle_timeout',
  ],
}

const clientRequestTimeout = {
  onecloud: [
    'client_request_timeout',
    {
      initialValue: 10,
      normalize: v => Number(v),
      rules: [
        { type: 'integer', min: 0, max: 600, message: i18n.t('network.text_448'), trigger: 'blur' },
      ],
    },
  ],
  aliyun: [
    'client_request_timeout',
    {
      initialValue: 60,
      normalize: v => Number(v),
      rules: [
        { type: 'integer', min: 1, max: 180, message: i18n.t('network.text_450'), trigger: 'blur' },
      ],
    },
  ],
  default: [
    'client_request_timeout',
  ],
}

const healCheckType = {
  default: [
    'health_check_type',
    {
      initialValue: 'tcp',
    },
  ],
  qcloud: [
    'health_check_type',
    {
      initialValue: 'http',
    },
  ],
  huawei: [
    'health_check_type',
    {
      initialValue: 'http',
    },
  ],
  aws_application: [
    'health_check_type',
    {
      initialValue: 'http',
    },
  ],
}

const healthCheckTimeout = {
  onecloud: [
    'health_check_timeout',
    {
      initialValue: 5,
      normalize: v => Number(v),
      rules: [
        { type: 'integer', min: 1, max: 300, message: i18n.t('network.text_451'), trigger: 'blur' },
      ],
    },
  ],
  aliyun: [
    'health_check_timeout',
    {
      initialValue: 3,
      normalize: v => Number(v),
      rules: [
        { type: 'integer', min: 1, max: 300, message: i18n.t('network.text_451'), trigger: 'blur' },
      ],
    },
  ],
  qcloud: [
    'health_check_timeout',
    {
      initialValue: 2,
      normalize: v => Number(v),
      rules: [
        { type: 'integer', min: 2, max: 60, message: i18n.t('network.text_452'), trigger: 'blur' },
      ],
    },
  ],
  huawei: [
    'health_check_timeout',
    {
      initialValue: 2,
      normalize: v => Number(v),
      rules: [
        { type: 'integer', min: 1, max: 50, message: i18n.t('network.text_453'), trigger: 'blur' },
      ],
    },
  ],
  aws_application: [
    'health_check_timeout',
    {
      initialValue: 5,
      normalize: v => Number(v),
      rules: [
        { type: 'integer', min: 2, max: 120, message: i18n.t('network.text_454'), trigger: 'blur' },
      ],
    },
  ],
  default: [
    'client_request_timeout',
  ],
}

const healthCheckInterval = {
  onecloud: [
    'health_check_interval',
    {
      initialValue: 5,
      normalize: v => Number(v),
      rules: [
        { type: 'integer', min: 1, max: 1000, message: i18n.t('network.text_455'), trigger: 'blur' },
      ],
    },
  ],
  aliyun: [
    'health_check_interval',
    {
      initialValue: 5,
      normalize: v => Number(v),
      rules: [
        { type: 'integer', min: 1, max: 50, message: i18n.t('network.text_453'), trigger: 'blur' },
      ],
    },
  ],
  qcloud: [
    'health_check_interval',
    {
      initialValue: 5,
      normalize: v => Number(v),
      rules: [
        { type: 'integer', min: 5, max: 300, message: i18n.t('network.text_456'), trigger: 'blur' },
      ],
    },
  ],
  huawei: [
    'health_check_interval',
    {
      initialValue: 5,
      normalize: v => Number(v),
      rules: [
        { type: 'integer', min: 1, max: 50, message: i18n.t('network.text_453'), trigger: 'blur' },
      ],
    },
  ],
  aws_network: [
    'health_check_interval',
    {
      initialValue: 10,
      normalize: v => Number(v),
      rules: [
        { type: 'enum', enum: [10, 30], message: i18n.t('network.text_457'), trigger: 'blur' },
      ],
    },
  ],
  aws_application: [
    'health_check_interval',
    {
      initialValue: 30,
      normalize: v => Number(v),
      rules: [
        { type: 'integer', min: 5, max: 300, message: i18n.t('network.text_456'), trigger: 'blur' },
      ],
    },
  ],
  default: [
    'health_check_interval',
  ],
}

const healthCheckRise = {
  onecloud: [
    'health_check_rise',
    {
      initialValue: 3,
      normalize: v => Number(v),
      rules: [
        { type: 'integer', min: 1, max: 1000, message: i18n.t('network.text_455'), trigger: 'blur' },
      ],
    },
  ],
  aliyun: [
    'health_check_rise',
    {
      initialValue: 3,
      normalize: v => Number(v),
      rules: [
        { type: 'integer', min: 2, max: 10, message: i18n.t('network.text_458'), trigger: 'blur' },
      ],
    },
  ],
  qcloud: [
    'health_check_rise',
    {
      initialValue: 3,
      normalize: v => Number(v),
      rules: [
        { type: 'integer', min: 2, max: 10, message: i18n.t('network.text_458'), trigger: 'blur' },
      ],
    },
  ],
  huawei: [
    'health_check_rise',
    {
      initialValue: 3,
      normalize: v => Number(v),
      rules: [
        { type: 'integer', min: 1, max: 10, message: i18n.t('network.text_459'), trigger: 'blur' },
      ],
    },
  ],
  aws_network: [
    'health_check_rise',
    {
      initialValue: 3,
      normalize: v => Number(v),
      rules: [
        { type: 'integer', min: 2, max: 10, message: i18n.t('network.text_458'), trigger: 'blur' },
      ],
    },
  ],
  aws_application: [
    'health_check_rise',
    {
      initialValue: 5,
      normalize: v => Number(v),
      rules: [
        { type: 'integer', min: 2, max: 10, message: i18n.t('network.text_458'), trigger: 'blur' },
      ],
    },
  ],
  default: [
    'health_check_rise',
  ],
}

const healthCheckFall = {
  onecloud: [
    'health_check_fall',
    {
      initialValue: 3,
      normalize: v => Number(v),
      rules: [
        { type: 'integer', min: 2, max: 1000, message: i18n.t('network.text_455'), trigger: 'blur' },
      ],
    },
  ],
  aliyun: [
    'health_check_fall',
    {
      initialValue: 3,
      normalize: v => Number(v),
      rules: [
        { type: 'integer', min: 2, max: 10, message: i18n.t('network.text_459'), trigger: 'blur' },
      ],
    },
  ],
  qcloud: [
    'health_check_fall',
    {
      initialValue: 3,
      normalize: v => Number(v),
      rules: [
        { type: 'integer', min: 2, max: 10, message: i18n.t('network.text_459'), trigger: 'blur' },
      ],
    },
  ],
  aws_application: [
    'health_check_fall',
    {
      initialValue: 2,
      normalize: v => Number(v),
      rules: [
        { type: 'integer', min: 2, max: 10, message: i18n.t('network.text_459'), trigger: 'blur' },
      ],
    },
  ],
  default: [
    'health_check_fall',
  ],
}

export const getDecorators = ({ provider, vm, loadbalancer }) => {
  provider = provider.toLowerCase()
  return {
    redirect: ['redirect'],
    redirect_code: ['redirect_code', {
      initialValue: '301',
    }],
    redirect_scheme: ['redirect_scheme', {
      initialValue: 'http',
    }],
    redirect_host: ['redirect_host'],
    redirect_path: ['redirect_path'],
    send_proxy: ['send_proxy', {
      initialValue: 'off',
    }],
    loadbalancer: [
      'loadbalancer',
      {
        preserve: true,
        initialValue: loadbalancer,
      },
    ],
    generate_name: [
      'generate_name',
      {
        validateFirst: true,
        rules: [
          { required: true, message: i18n.t('network.text_116') },
          { validator: vm.$validate('resourceName') },
        ],
      },
    ],
    listener_port: [
      'listener_port',
      {
        validateFirst: true,
        normalize: v => Number(v),
        rules: [
          { type: 'integer', required: true, message: i18n.t('network.text_350'), trigger: 'blur' },
          { type: 'integer', min: 1, max: 65535, message: i18n.t('network.text_351'), trigger: 'blur' },
        ],
      },
    ],
    listener_type: [
      'listener_type',
      {
        initialValue: provider === 'aws_application' ? 'http' : 'tcp',
        rules: [
          { required: true, message: i18n.t('network.text_460') },
        ],
      },
    ],
    scheduler: [
      'scheduler',
      {
        initialValue: schedulerProviderMaps[provider][0].key,
        rules: [
          { required: true, message: i18n.t('network.text_461') },
        ],
      },
    ],
    certificate: [
      'certificate',
      {
        rules: [
          { required: true, message: i18n.t('network.text_421') },
        ],
      },
    ],
    sticky_session: [
      'sticky_session',
      {
        valuePropName: 'checked',
        initialValue: false,
      },
    ],
    sticky_session_type: [
      'sticky_session_type',
      {
        initialValue: 'insert',
      },
    ],
    sticky_session_cookie: [
      'sticky_session_cookie',
      {
        rules: [
          { required: true, message: i18n.t('network.text_421') },
        ],
      },
    ],
    sticky_session_cookie_timeout: stickySessionCookieTimeout[provider] || stickySessionCookieTimeout.default,
    acl_status: [
      'acl_status',
      {
        valuePropName: 'checked',
        initialValue: false,
      },
    ],
    acl_type: [
      'acl_type',
      {
        initialValue: 'white',
      },
    ],
    acl: [
      'acl',
      {
        rules: [
          { required: true, message: i18n.t('network.text_363') },
        ],
      },
    ],
    backend_connect_timeout: [
      'backend_connect_timeout',
      {
        initialValue: 5,
        normalize: v => Number(v),
        rules: [
          { type: 'integer', min: 0, max: 180, message: i18n.t('network.text_462'), trigger: 'blur' },
        ],
      },
    ],
    backend_idle_timeout: [
      'backend_idle_timeout',
      {
        initialValue: 90,
        normalize: v => Number(v),
        rules: [
          { type: 'integer', min: 0, max: 600, message: i18n.t('network.text_462'), trigger: 'blur' },
        ],
      },
    ],
    client_idle_timeout: clientIdleTimeout[provider] || clientIdleTimeout.default,
    client_request_timeout: clientRequestTimeout[provider] || clientRequestTimeout.default,
    http_request_rate: [
      'http_request_rate',
      {
        normalize: v => Number(v),
        initialValue: 0,
      },
    ],
    http_request_rate_per_src: [
      'http_request_rate_per_src',
      {
        normalize: v => Number(v),
        initialValue: 0,
      },
    ],
    enable_http2: [
      'enable_http2',
      {
        valuePropName: 'checked',
        initialValue: true,
      },
    ],
    gzip: [
      'gzip',
      {
        valuePropName: 'checked',
        initialValue: false,
      },
    ],
    xforwarded_for: [
      'xforwarded_for',
      {
        valuePropName: 'checked',
        initialValue: true,
      },
    ],
    // 后端服务器组
    backend_group: [
      'backend_group',
      {
        rules: [
          { required: true, message: i18n.t('network.text_394') },
        ],
      },
    ],
    // 健康检查
    health_check: [
      'health_check',
      {
        initialValue: true, // 如果监听类型是udp，应该关闭，这部分逻辑在./onecloud/Healthcheck里面做
        valuePropName: 'checked',
      },
    ],
    health_check_type: healCheckType[provider] || healCheckType.default,
    health_check_uri: [
      'health_check_uri',
      {
        initialValue: '/',
        rules: [
          { required: true, message: i18n.t('network.text_402') },
        ],
      },
    ],
    health_check_domain: [
      'health_check_domain',
      {
        rules: [
          { validator: domainValidator, trigger: 'blur' },
        ],
      },
    ],
    health_check_http_code: [
      'health_check_http_code',
      {
        initialValue: ['http_2xx', 'http_3xx'],
        rules: [
          { required: true, message: i18n.t('network.text_463') },
        ],
      },
    ],
    health_check_timeout: healthCheckTimeout[provider] || healthCheckTimeout.default,
    health_check_interval: healthCheckInterval[provider] || healthCheckInterval.default,
    health_check_rise: healthCheckRise[provider] || healthCheckRise.default,
    health_check_fall: healthCheckFall[provider] || healthCheckFall.default,
    health_check_req: [
      'health_check_req',
      {
        rules: [
          { type: 'string', pattern: /^\w+$/, message: i18n.t('network.text_464'), max: 500 },
        ],
      },
    ],
    health_check_exp: [
      'health_check_exp',
      {
        rules: [
          { type: 'string', pattern: /^\w+$/, message: i18n.t('network.text_464'), max: 500 },
        ],
      },
    ],
  }
}
