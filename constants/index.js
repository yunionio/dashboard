// 管理员密码选择配置
export const LOGIN_TYPES_MAP = {
  random: {
    label: '随机生成',
    key: 'random',
  },
  keypair: {
    label: '关联密钥',
    key: 'keypair',
  },
  image: {
    label: '保留镜像设置',
    key: 'image',
  },
  password: {
    label: '手工输入',
    key: 'password',
  },
}

export const RDS_ACCOUNT_PRIVILEGES = {
  rw: '读写',
  r: '只读',
  ddl: '仅DDL',
  dml: '仅DML',
  owner: '所有者',
  custom: '自定义',
}
