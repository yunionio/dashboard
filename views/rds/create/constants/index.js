import validateForm from '@/utils/validate'
import i18n from '@/locales'

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
  count: [
    'count',
    {
      initialValue: 1,
    },
  ],
}
