import validateForm from '@/utils/validate'

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
          { validator: true, message: '请选择关联密钥' },
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
          { required: true, message: '请选择安全组' },
        ],
      },
    ],
  },
}
