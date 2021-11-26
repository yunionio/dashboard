import validateForm from '@/utils/validate'
import i18n from '@/locales'

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
        { required: true, message: i18n.t('compute.text_210') },
        { validator: validateForm('serverCreateName') },
      ],
    },
  ],
  description: [
    'description',
  ],
  guest_template_id: [
    'guest_template_id',
    {
      rules: [
        { required: true, message: i18n.t('compute.text_878') },
      ],
    },
  ],
  min_instance_number: [
    'min_instance_number',
    {
      initialValue: 0,
      rules: [
        { required: true, message: i18n.t('compute.text_879') },
      ],
    },
  ],
  max_instance_number: [
    'max_instance_number',
    {
      initialValue: 2,
      rules: [
        { required: true, message: i18n.t('compute.text_880') },
      ],
    },
  ],
  desire_instance_number: [
    'desire_instance_number',
    {
      initialValue: 0,
      rules: [
        { required: true, message: i18n.t('compute.text_881') },
      ],
    },
  ],
  brand: [
    'brand',
    {
      rules: [
        { required: true, message: i18n.t('compute.text_882') },
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
        { required: true, message: i18n.t('compute.text_883') },
      ],
    },
  ],
  health_check_mode: [
    'health_check_mode',
    {
      initialValue: 'normal',
      rules: [
        { required: true, message: i18n.t('compute.text_884') },
      ],
    },
  ],
  loadbalancer_id: [
    'loadbalancer_id',
    {
      rules: [
        { required: true, message: i18n.t('compute.text_885') },
      ],
    },
  ],
  lb_backend_group: [
    'lb_backend_group',
    {
      rules: [
        { required: true, message: i18n.t('compute.text_886') },
      ],
    },
  ],
  loadbalancer_backend_port: [
    'loadbalancer_backend_port',
    {
      rules: [
        { required: true, message: i18n.t('compute.text_887') },
      ],
    },
  ],
  loadbalancer_backend_weight: [
    'loadbalancer_backend_weight',
    {
      initialValue: 50,
      rules: [
        { required: true, message: i18n.t('compute.text_888') },
      ],
    },
  ],
  shrink_principle: [
    'shrink_principle',
    {
      initialValue: 'earliest',
      rules: [
        { required: true, message: i18n.t('compute.text_889') },
      ],
    },
  ],
  health_check_cycle: [
    'health_check_cycle',
    {
      initialValue: 300,
      rules: [
        { required: true, message: i18n.t('compute.text_890') },
      ],
    },
  ],
}
