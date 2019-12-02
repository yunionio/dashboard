import validateForm from '@/utils/validate'

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
  name: [
    'name',
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
