import { schedulerProviderMaps } from '@Network/views/loadbalancerlistener/constants'
import { REGEXP } from '@/utils/validate'

const { IPv4, domain } = REGEXP

const domainValidator = (rule, value, cb) => {
  if (!value) {
    cb()
  } else if (IPv4.regexp.test(value)) {
    cb()
  } else if (domain.regexp.test(value)) {
    cb()
  } else {
    cb(Error('请输入合法域名或者IP'))
  }
}

const stickySessionCookieTimeout = {
  onecloud: [
    'sticky_session_cookie_timeout',
    {
      initialValue: 1000,
      normalize: v => Number(v),
      rules: [
        { type: 'integer', min: 1, max: 86400, message: '输入范围在 1 - 86400 之间', trigger: 'blur' },
      ],
    },
  ],
  aliyun: [
    'sticky_session_cookie_timeout',
    {
      initialValue: 1000,
      normalize: v => Number(v),
      rules: [
        { type: 'integer', min: 1, max: 86400, message: '输入范围在 1 - 86400 之间', trigger: 'blur' },
      ],
    },
  ],
  qcloud: [
    'sticky_session_cookie_timeout',
    {
      initialValue: 1000,
      normalize: v => Number(v),
      rules: [
        { type: 'integer', min: 30, max: 3600, message: '输入范围在 1 - 86400 之间', trigger: 'blur' },
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
        { type: 'integer', min: 0, max: 600, message: '输入范围在 0-600 之间', trigger: 'blur' },
      ],
    },
  ],
  aliyun: [
    'client_idle_timeout',
    {
      initialValue: 15,
      normalize: v => Number(v),
      rules: [
        { type: 'integer', min: 1, max: 60, message: '输入范围在 1-60 之间', trigger: 'blur' },
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
        { type: 'integer', min: 0, max: 600, message: '输入范围在 0-600 之间', trigger: 'blur' },
      ],
    },
  ],
  aliyun: [
    'client_request_timeout',
    {
      initialValue: 60,
      normalize: v => Number(v),
      rules: [
        { type: 'integer', min: 1, max: 180, message: '输入范围在 1-180 之间', trigger: 'blur' },
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
        { type: 'integer', min: 1, max: 300, message: '请输入范围在 1-300 之间', trigger: 'blur' },
      ],
    },
  ],
  aliyun: [
    'health_check_timeout',
    {
      initialValue: 3,
      normalize: v => Number(v),
      rules: [
        { type: 'integer', min: 1, max: 300, message: '请输入范围在 1-300 之间', trigger: 'blur' },
      ],
    },
  ],
  qcloud: [
    'health_check_timeout',
    {
      initialValue: 2,
      normalize: v => Number(v),
      rules: [
        { type: 'integer', min: 2, max: 60, message: '请输入范围在 2-60 之间', trigger: 'blur' },
      ],
    },
  ],
  huawei: [
    'health_check_timeout',
    {
      initialValue: 2,
      normalize: v => Number(v),
      rules: [
        { type: 'integer', min: 1, max: 50, message: '请输入范围在 1-50 之间', trigger: 'blur' },
      ],
    },
  ],
  aws_application: [
    'health_check_timeout',
    {
      initialValue: 5,
      normalize: v => Number(v),
      rules: [
        { type: 'integer', min: 2, max: 120, message: '请输入范围在 2-120 之间', trigger: 'blur' },
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
        { type: 'integer', min: 1, max: 1000, message: '请输入范围在 1-1000 之间', trigger: 'blur' },
      ],
    },
  ],
  aliyun: [
    'health_check_interval',
    {
      initialValue: 5,
      normalize: v => Number(v),
      rules: [
        { type: 'integer', min: 1, max: 50, message: '请输入范围在 1-50 之间', trigger: 'blur' },
      ],
    },
  ],
  qcloud: [
    'health_check_interval',
    {
      initialValue: 5,
      normalize: v => Number(v),
      rules: [
        { type: 'integer', min: 5, max: 300, message: '请输入范围在 5-300 之间', trigger: 'blur' },
      ],
    },
  ],
  huawei: [
    'health_check_interval',
    {
      initialValue: 5,
      normalize: v => Number(v),
      rules: [
        { type: 'integer', min: 1, max: 50, message: '请输入范围在 1-50 之间', trigger: 'blur' },
      ],
    },
  ],
  aws_network: [
    'health_check_interval',
    {
      initialValue: 10,
      normalize: v => Number(v),
      rules: [
        { type: 'enum', enum: [10, 30], message: '输入值应该是10或者30', trigger: 'blur' },
      ],
    },
  ],
  aws_application: [
    'health_check_interval',
    {
      initialValue: 30,
      normalize: v => Number(v),
      rules: [
        { type: 'integer', min: 5, max: 300, message: '请输入范围在 5-300 之间', trigger: 'blur' },
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
        { type: 'integer', min: 1, max: 1000, message: '请输入范围在 1-1000 之间', trigger: 'blur' },
      ],
    },
  ],
  aliyun: [
    'health_check_rise',
    {
      initialValue: 3,
      normalize: v => Number(v),
      rules: [
        { type: 'integer', min: 2, max: 10, message: '请输入范围在 2-10 之间', trigger: 'blur' },
      ],
    },
  ],
  qcloud: [
    'health_check_rise',
    {
      initialValue: 3,
      normalize: v => Number(v),
      rules: [
        { type: 'integer', min: 2, max: 10, message: '请输入范围在 2-10 之间', trigger: 'blur' },
      ],
    },
  ],
  huawei: [
    'health_check_rise',
    {
      initialValue: 3,
      normalize: v => Number(v),
      rules: [
        { type: 'integer', min: 1, max: 10, message: '请输入范围在 1-10 之间', trigger: 'blur' },
      ],
    },
  ],
  aws_network: [
    'health_check_rise',
    {
      initialValue: 3,
      normalize: v => Number(v),
      rules: [
        { type: 'integer', min: 2, max: 10, message: '请输入范围在 2-10 之间', trigger: 'blur' },
      ],
    },
  ],
  aws_application: [
    'health_check_rise',
    {
      initialValue: 5,
      normalize: v => Number(v),
      rules: [
        { type: 'integer', min: 2, max: 10, message: '请输入范围在 2-10 之间', trigger: 'blur' },
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
        { type: 'integer', min: 2, max: 1000, message: '请输入范围在 1-1000 之间', trigger: 'blur' },
      ],
    },
  ],
  aliyun: [
    'health_check_fall',
    {
      initialValue: 3,
      normalize: v => Number(v),
      rules: [
        { type: 'integer', min: 2, max: 10, message: '请输入范围在 1-10 之间', trigger: 'blur' },
      ],
    },
  ],
  qcloud: [
    'health_check_fall',
    {
      initialValue: 3,
      normalize: v => Number(v),
      rules: [
        { type: 'integer', min: 2, max: 10, message: '请输入范围在 1-10 之间', trigger: 'blur' },
      ],
    },
  ],
  aws_application: [
    'health_check_fall',
    {
      initialValue: 2,
      normalize: v => Number(v),
      rules: [
        { type: 'integer', min: 2, max: 10, message: '请输入范围在 1-10 之间', trigger: 'blur' },
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
          { required: true, message: '请输入名称' },
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
          { type: 'integer', required: true, message: '请输入监听端口', trigger: 'blur' },
          { type: 'integer', min: 1, max: 65535, message: '请输入范围在 1-65535 之间', trigger: 'blur' },
        ],
      },
    ],
    listener_type: [
      'listener_type',
      {
        initialValue: provider === 'aws_application' ? 'http' : 'tcp',
        rules: [
          { required: true, message: '请选择协议' },
        ],
      },
    ],
    scheduler: [
      'scheduler',
      {
        initialValue: schedulerProviderMaps[provider][0].key,
        rules: [
          { required: true, message: '请选择调度策略' },
        ],
      },
    ],
    certificate: [
      'certificate',
      {
        rules: [
          { required: true, message: '请选择证书' },
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
          { required: true, message: '请选择证书' },
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
          { required: true, message: '请选择访问控制' },
        ],
      },
    ],
    backend_connect_timeout: [
      'backend_connect_timeout',
      {
        initialValue: 5,
        normalize: v => Number(v),
        rules: [
          { type: 'integer', min: 0, max: 180, message: '请输入范围在 0-180 之间', trigger: 'blur' },
        ],
      },
    ],
    backend_idle_timeout: [
      'backend_idle_timeout',
      {
        initialValue: 90,
        normalize: v => Number(v),
        rules: [
          { type: 'integer', min: 0, max: 600, message: '请输入范围在 0-180 之间', trigger: 'blur' },
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
          { required: true, message: '请选择后端服务器组' },
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
          { required: true, message: '请输入健康检查路径' },
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
          { required: true, message: '请选择正常状态码' },
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
          { type: 'string', pattern: /^\w+$/, message: '只允许包含字母、数字字符，最大长度限制为500字符', max: 500 },
        ],
      },
    ],
    health_check_exp: [
      'health_check_exp',
      {
        rules: [
          { type: 'string', pattern: /^\w+$/, message: '只允许包含字母、数字字符，最大长度限制为500字符', max: 500 },
        ],
      },
    ],
  }
}
