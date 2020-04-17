import validateForm from '@/utils/validate'

export const BRANDS = ['OneCloud', 'Azure']

export const DECORATORS = {
  projectDomain: {
    project: [
      'project',
      {
        initialValue: undefined,
      },
    ],
    domain: [
      'domain',
      {
        initialValue: undefined,
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
        { validator: validateForm('serverCreateName') },
      ],
    },
  ],
  guest_template_id: [
    'guest_template_id',
    {
      rules: [
        { required: true, message: '请选择模版' },
      ],
    },
  ],
  min_instance_number: [
    'min_instance_number',
    {
      initialValue: 0,
      rules: [
        { required: true, message: '请输入最小实例数' },
      ],
    },
  ],
  max_instance_number: [
    'max_instance_number',
    {
      initialValue: 2,
      rules: [
        { required: true, message: '请输入最大实例数' },
      ],
    },
  ],
  desire_instance_number: [
    'desire_instance_number',
    {
      initialValue: 0,
      rules: [
        { required: true, message: '请输入期望实例数' },
      ],
    },
  ],
  brand: [
    'brand',
    {
      rules: [
        { required: true, message: '暂无平台不可新建' },
      ],
    },
  ],
  servertemplate: [
    'servertemplate',
    {
      initialValue: undefined,
    },
  ],
  health_check_gov: [
    'health_check_gov',
    {
      initialValue: 180,
      rules: [
        { required: true, message: '请输入健康状况检查宽限期' },
      ],
    },
  ],
  health_check_mode: [
    'health_check_mode',
    {
      initialValue: 'normal',
      rules: [
        { required: true, message: '选择健康检测方式' },
      ],
    },
  ],
  loadbalancer_id: [
    'loadbalancer_id',
    {
      rules: [
        { required: true, message: '请选择负载均衡' },
      ],
    },
  ],
  lb_backend_group: [
    'lb_backend_group',
    {
      rules: [
        { required: true, message: '请选择负后台服务器组' },
      ],
    },
  ],
  loadbalancer_backend_port: [
    'loadbalancer_backend_port',
    {
      rules: [
        { required: true, message: '请输入服务器组端口' },
      ],
    },
  ],
  loadbalancer_backend_weight: [
    'loadbalancer_backend_weight',
    {
      initialValue: 50,
      rules: [
        { required: true, message: '请输入权重' },
      ],
    },
  ],
  shrink_principle: [
    'shrink_principle',
    {
      initialValue: 'earliest',
      rules: [
        { required: true, message: '请选择实例移除策略' },
      ],
    },
  ],
  health_check_cycle: [
    'health_check_cycle',
    {
      initialValue: 300,
      rules: [
        { required: true, message: '请选择检查周期' },
      ],
    },
  ],
}
