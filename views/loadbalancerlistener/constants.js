import i18n from '@/locales'
export const schedulerMaps = {
  rr: { key: 'rr', label: i18n.t('network.text_375'), tooltip: i18n.t('network.text_386') },
  wrr: { key: 'wrr', label: i18n.t('network.text_376'), tooltip: i18n.t('network.text_387') },
  wlc: { key: 'wlc', label: i18n.t('network.text_377'), tooltip: i18n.t('network.text_388') },
  sch: { key: 'sch', label: i18n.t('network.text_378'), tooltip: i18n.t('network.text_389') },
  tch: { key: 'tch', label: i18n.t('network.text_390'), tooltip: i18n.t('network.text_391') },
  qch: { key: 'qch', label: i18n.t('network.text_392'), tooltip: i18n.t('network.text_393') },
}

export const schedulerProviderMaps = {
  onecloud: [schedulerMaps.rr, schedulerMaps.wrr, schedulerMaps.wlc, schedulerMaps.sch],
  aliyun: [schedulerMaps.rr, schedulerMaps.wrr, schedulerMaps.wlc, schedulerMaps.sch, schedulerMaps.tch, schedulerMaps.qch],
  qcloud: [schedulerMaps.wrr, schedulerMaps.wlc, schedulerMaps.sch],
  huawei: [schedulerMaps.wrr, schedulerMaps.wlc, schedulerMaps.sch],
  aws_network: [schedulerMaps.wrr, schedulerMaps.wlc, schedulerMaps.sch],
  aws_application: [schedulerMaps.wrr, schedulerMaps.wlc, schedulerMaps.sch],
  openstack: [schedulerMaps.rr, schedulerMaps.wrr, schedulerMaps.wlc, schedulerMaps.sch],
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
  openstack: [healthCheckTypeMaps.tcp, healthCheckTypeMaps.http, healthCheckTypeMaps.udp],
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
