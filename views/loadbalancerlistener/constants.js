export const schedulerMaps = {
  rr: { key: 'rr', label: '轮询(RR)', tooltip: '轮询(rr)：按照访问顺序依次将外部请求依序分发到后端服务器。' },
  wrr: { key: 'wrr', label: '加权轮询(WRR)', tooltip: '加权轮询(wrr)：权重值越高的后端服务器，被轮询到的次数（概率）也越高。' },
  wlc: { key: 'wlc', label: '加权最小连接数(WLC)', tooltip: '加权最小连接数(wlc)：除了根据每台后端服务器设定的权重值来进行轮询，同时还考虑后端服务器的实际负载（即连接数）。' },
  sch: { key: 'sch', label: '源IP一致性哈希(SCH)', tooltip: '基于源IP一致性哈希(sch)：基于源IP地址的一致性hash，相同的源地址会调度到相同的后端服务器。' },
  tch: { key: 'tch', label: '四元组的一致性哈希(TCH)', tooltip: '基于四元组一致性哈希(tch)：基于四元组的一致性hash（源IP+目的IP+源端口+目的端口）。' },
  qch: { key: 'qch', label: 'QUIC Connection ID一致性哈希(QCH)', tooltip: '基于QUIC Connection ID一致性(qch)：相同的QUIC Connection ID会调度到相同的后端服务器。' },
}

export const schedulerProviderMaps = {
  onecloud: [schedulerMaps.rr, schedulerMaps.wrr, schedulerMaps.wlc, schedulerMaps.sch],
  aliyun: [schedulerMaps.rr, schedulerMaps.wrr, schedulerMaps.wlc, schedulerMaps.sch, schedulerMaps.tch, schedulerMaps.qch],
  qcloud: [schedulerMaps.wrr, schedulerMaps.wlc],
  huawei: [schedulerMaps.wrr, schedulerMaps.wlc, schedulerMaps.sch],
  aws_network: [schedulerMaps.wrr, schedulerMaps.wlc, schedulerMaps.sch],
  aws_application: [schedulerMaps.wrr, schedulerMaps.wlc, schedulerMaps.sch],
}

export const healthCheckTypeMaps = {
  tcp: { key: 'tcp', label: 'TCP' },
  http: { key: 'http', label: 'HTTP' },
  udp: { key: 'udp', label: 'UDP' },
  https: { key: 'https', label: 'HTTPS' },
}

export const healthCheckTypeProviderMaps = {
  onecloud: [healthCheckTypeMaps.tcp, healthCheckTypeMaps.http, healthCheckTypeMaps.udp],
  aliyun: [healthCheckTypeMaps.tcp, healthCheckTypeMaps.http],
  qcloud: [healthCheckTypeMaps.http],
  huawei: [healthCheckTypeMaps.tcp, healthCheckTypeMaps.http, healthCheckTypeMaps.udp],
  aws_network: [healthCheckTypeMaps.tcp, healthCheckTypeMaps.http, healthCheckTypeMaps.https],
  aws_application: [healthCheckTypeMaps.http, healthCheckTypeMaps.https],
}

export const healthCheckHttpCodeOpts = {
  aws_application: ['http_2xx', 'http_3xx', 'http_4xx'],
  default: ['http_2xx', 'http_3xx', 'http_4xx', 'http_5xx'],
}

export const healthCheckHttpCode = (() => {
  const onecloud = [
    { key: 'http_2xx', label: 'http_2xx' },
    { key: 'http_3xx', label: 'http_3xx' },
    { key: 'http_4xx', label: 'http_4xx' },
    { key: 'http_5xx', label: 'http_5xx' },
  ]
  return {
    onecloud,
    aliyun: onecloud,
    qcloud: onecloud,
    huawei: onecloud,
    aws_network: onecloud,
    aws_application: [
      { key: 'http_2xx', label: 'http_2xx' },
      { key: 'http_3xx', label: 'http_3xx' },
      { key: 'http_4xx', label: 'http_4xx' },
    ],
  }
})()
