import i18n from '@/locales'
export const dnsTypes = [
  { label: i18n.t('common_667'), value: 'A' }, // A ：将域名指向一个IPV4地址
  { label: i18n.t('common_668'), value: 'AAAA' }, // AAAA：将域名指向一个IPV6地址
  { label: i18n.t('common_669'), value: 'CNAME' }, // CNAME：将域名指向另外一个域名
  { label: i18n.t('common_670'), value: 'MX' }, // MX：将域名指向邮件服务器地址
  { label: i18n.t('common_671'), value: 'SRV' }, // SRV：记录提供特定的服务的服务器
  { label: i18n.t('common_672'), value: 'PTR' }, // PTR：用于从地址反解到域名
  { label: i18n.t('common_673'), value: 'TXT' }, // TXT：通常做SPF记录（反垃圾邮件）
]

export const ttls = [
  { label: i18n.t('common_171'), value: 10 * 60 }, // 10分钟
  { label: i18n.t('common_172'), value: 30 * 60 }, // 30分钟
  { label: i18n.t('common_173'), value: 1 * 60 * 60 }, // 1小时
  { label: i18n.t('common_674'), value: 12 * 60 * 60 }, // 12小时
  { label: i18n.t('common_178'), value: 1 * 24 * 60 * 60 }, // 1天
]

export const providers = [
  { label: i18n.t('cloudenv.text_148'), value: 'Qcloud' }, // 腾讯云
  { label: 'AWS', value: 'Aws' }, // AWS
]

export const policy_types = {
  qcloud: [
    { label: i18n.t('k8s.text_359'), value: 'Simple' }, // 默认 简单
    { label: i18n.t('common_675'), value: 'ByCarrier' }, // 运营商
    { label: i18n.t('common_676'), value: 'ByGeoLocation' }, // 地理区域
    { label: i18n.t('common_677'), value: 'BySearchEngine' }, // 搜索引擎
    { label: i18n.t('common_678'), value: 'Weighted' }, // 加权
  ],
  aws: [
    { label: i18n.t('k8s.text_359'), value: 'Simple' }, // 默认
    { label: i18n.t('common_676'), value: 'ByGeoLocation' }, // 地理区域
    { label: i18n.t('common_678'), value: 'Weighted' }, // 加权
    { label: i18n.t('common_679'), value: 'Failover' }, // 故障转移
    { label: i18n.t('common_680'), value: 'MultiValueAnswer' }, // 多值应答
    { label: i18n.t('common_681'), value: 'Latency' }, // 延迟
  ],
}

export const policy_values = {
  ByCarrier: [
    { label: i18n.t('common_682'), value: 'unicom' }, // 中国联通
    { label: i18n.t('common_683'), value: 'telecom' }, // 中国电信
    { label: i18n.t('common_684'), value: 'chinamobile' }, // 中国移动
    { label: i18n.t('common_685'), value: 'cernet' }, // 中国教育网
  ],
  ByGeoLocation: [
    { label: i18n.t('common_686'), value: 'mainland' }, // 境内
    { label: i18n.t('common_687'), value: 'oversea' }, // 境外
  ],
  BySearchEngine: [
    { label: i18n.t('common_688'), value: 'baidu' }, // 百度
    { label: i18n.t('common_689'), value: 'bing' }, // 必应
    { label: i18n.t('common_690'), value: 'google' }, // 谷歌
    { label: i18n.t('common_691'), value: 'youdao' }, // 有道
    { label: i18n.t('common_692'), value: 'sousou' }, // 搜搜
    { label: i18n.t('common_693'), value: 'qihu360' }, // 奇虎360
  ],
}

export const policyParamsMap = {
  provider: {
    Qcloud: i18n.t('cloudenv.text_148'),
    Aws: 'AWS',
  },
  policy_type: {
    Simple: i18n.t('k8s.text_359'),
    ByCarrier: i18n.t('common_675'),
    ByGeoLocation: i18n.t('common_676'),
    BySearchEngine: i18n.t('common_677'),
    Weighted: i18n.t('common_678'),
    Failover: i18n.t('common_679'),
    MultiValueAnswer: i18n.t('common_680'),
    Latency: i18n.t('common_681'),
  },
  policy_value: {
    unicom: i18n.t('common_682'),
    telecom: i18n.t('common_683'),
    chinamobile: i18n.t('common_684'),
    cernet: i18n.t('common_685'),
    mainland: i18n.t('common_686'),
    oversea: i18n.t('common_687'),
    baidu: i18n.t('common_688'),
    bing: i18n.t('common_689'),
    google: i18n.t('common_690'),
    youdao: i18n.t('common_691'),
    sousou: i18n.t('common_692'),
    qihu360: i18n.t('common_693'),
  },
}
