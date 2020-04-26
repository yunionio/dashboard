export const LB_SCHEDULER_MAP = {
  rr: {
    text: '轮询',
    desc: '按照访问顺序依次将外部请求依序分发到后端服务器。',
  },
  wrr: {
    text: '加权轮询',
    desc: '权重值越高的后端服务器，被轮询到的次数（概率）也越高',
  },
  wlc: {
    text: '加权最小连接数',
    desc: '除了根据每台后端服务器设定的权重值来进行轮询，同时还考虑后端服务器的实际负载（即连接数）。<br />当权重值相同时，当前连接数越小的后端服务器被轮询到的次数（概率）也越高。',
  },
  sch: {
    text: '基于源IP一致性哈希',
    desc: '基于源IP地址的一致性hash，相同的源地址会调度到相同的后端服务器。',
  },
  tch: {
    text: '基于四元组一致性哈希',
    desc: '基于四元组的一致性hash（源IP+目的IP+源端口+目的端口），相同的流会调度到相同的后端服务器。',
  },
}

export const healcheckDiff = {
  aliyun: {
    disabled: { // 以下情况健康检查禁用
      listener_type: ['tcp', 'udp'],
    },
    alwaysOn: { // 以下情况健康检查须开启
      listener_type: ['tcp', 'udp'],
    },
  },
  aws: { // aws 不允许关闭健康检查
    disabled: { // 以下情况健康检查禁用
      listener_type: ['tcp', 'udp', 'http', 'https'],
    },
  },
}

// 没有声明的表示支持该操作
export const LB_LISTENEER_ACTION_POLICIES = {
  aliyun: {
    disableHealthCheck (row) {
      return !['tcp', 'udp'].includes(row.listener_type)
    },
  },
  qcloud: {
    aclUpdate: false,
  },
  huawei: {
    enable: false,
    disable: false,
  },
  aws: {
    enable: false,
    disable: false,
    aclUpdate: false,
    enableHealthCheck: false,
    disableHealthCheck: false,
  },
}
