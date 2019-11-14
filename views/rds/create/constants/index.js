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
}
