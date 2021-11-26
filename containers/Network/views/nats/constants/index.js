
import validateForm from '@/utils/validate'
import i18n from '@/locales'

export const BILL_TYPES_MAP = {
  postpaid: {
    label: i18n.t('network.text_256'),
    key: 'postpaid',
  },
  prepaid: {
    label: i18n.t('network.text_257'),
    key: 'prepaid',
  },
}

export const DECORATORS = {
  eip: {
    type: [
      'type',
      {
        initialValue: 'none',
      },
    ],
    charge_type: [
      'charge_type',
      {
        initialValue: 'traffic',
      },
    ],
    bgp_type: [
      'bgp_type',
      {
        initialValue: '',
      },
    ],
    bandwidth: [
      'bandwidth',
      {
        initialValue: 30,
        validateFirst: true,
      },
    ],
    eip: [
      'eip',
      {
        rules: [
          { required: true, message: i18n.t('compute.text_145'), trigger: 'change' },
        ],
      },
    ],
  },
  billing_type: [
    'billing_type',
    {
      initialValue: 'postpaid',
    },
  ],
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
  project_domain: [
    'project_domain',
    {
      initialValue: undefined,
    },
  ],
  name: [
    'name',
    {
      validateFirst: true,
      rules: [
        { required: true, message: i18n.t('network.text_218') },
        { validator: validateForm('serverName') },
      ],
    },
  ],
  description: ['description'],
}

// capbilit接口所需要的参数
export const CAPABILIT_PARAMS = ['city', 'provider', 'cloudregion']

export const SKU_PARAMS = [...CAPABILIT_PARAMS]
