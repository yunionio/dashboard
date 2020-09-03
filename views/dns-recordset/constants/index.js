export const dnsTypes = [
  { label: 'A ：将域名指向一个IPV4地址', value: 'A' }, // A ：将域名指向一个IPV4地址
  { label: 'AAAA：将域名指向一个IPV6地址', value: 'AAAA' }, // AAAA：将域名指向一个IPV6地址
  { label: 'CNAME：将域名指向另外一个域名', value: 'CNAME' }, // CNAME：将域名指向另外一个域名
  { label: 'MX：将域名指向邮件服务器地址', value: 'MX' }, // MX：将域名指向邮件服务器地址
  { label: 'SRV：记录提供特定的服务的服务器', value: 'SRV' }, // SRV：记录提供特定的服务的服务器
  { label: 'PTR：用于从地址反解到域名', value: 'PTR' }, // PTR：用于从地址反解到域名
  { label: 'TXT：通常做SPF记录（反垃圾邮件）', value: 'TXT' }, // TXT：通常做SPF记录（反垃圾邮件）
]

export const ttls = [
  { label: '10分钟', value: 10 * 60 }, // 10分钟
  { label: '30分钟', value: 30 * 60 }, // 30分钟
  { label: '1小时', value: 1 * 60 * 60 }, // 1小时
  { label: '12小时', value: 12 * 60 * 60 }, // 12小时
  { label: '1天', value: 1 * 24 * 60 * 60 }, // 1天
]

export const providers = [
  { label: '腾讯云', value: 'Qcloud' }, // 腾讯云
  { label: 'AWS', value: 'Aws' }, // AWS
]

export const policy_types = {
  qcloud: [
    { label: '默认', value: 'Simple' }, // 默认 简单
    { label: '运营商', value: 'ByCarrier' }, // 运营商
    { label: '地理区域', value: 'ByGeoLocation' }, // 地理区域
    { label: '搜索引擎', value: 'BySearchEngine' }, // 搜索引擎
    { label: '加权', value: 'Weighted' }, // 加权
  ],
  aws: [
    { label: '默认', value: 'Simple' }, // 默认
    { label: '地理区域', value: 'ByGeoLocation' }, // 地理区域
    { label: '加权', value: 'Weighted' }, // 加权
    { label: '故障转移', value: 'Failover' }, // 故障转移
    { label: '多值应答', value: 'MultiValueAnswer' }, // 多值应答
    { label: '延迟', value: 'Latency' }, // 延迟
  ],
}

export const policy_values = {
  ByCarrier: [
    { label: '中国联通', value: 'unicom' }, // 中国联通
    { label: '中国电信', value: 'telecom' }, // 中国电信
    { label: '中国移动', value: 'chinamobile' }, // 中国移动
    { label: '中国教育网', value: 'cernet' }, // 中国教育网
  ],
  ByGeoLocation: [
    { label: '境内', value: 'mainland' }, // 境内
    { label: '境外', value: 'oversea' }, // 境外
  ],
  BySearchEngine: [
    { label: '百度', value: 'baidu' }, // 百度
    { label: '必应', value: 'bing' }, // 必应
    { label: '谷歌', value: 'google' }, // 谷歌
    { label: '有道', value: 'youdao' }, // 有道
    { label: '搜搜', value: 'sousou' }, // 搜搜
    { label: '奇虎360', value: 'qihu360' }, // 奇虎360
  ],
}

export const policyParamsMap = {
  provider: {
    Qcloud: '腾讯云',
    Aws: 'AWS',
  },
  policy_type: {
    Simple: '默认',
    ByCarrier: '运营商',
    ByGeoLocation: '地理区域',
    BySearchEngine: '搜索引擎',
    Weighted: '加权',
    Failover: '故障转移',
    MultiValueAnswer: '多值应答',
    Latency: '延迟',
  },
  policy_value: {
    unicom: '中国联通',
    telecom: '中国电信',
    chinamobile: '中国移动',
    cernet: '中国教育网',
    mainland: '境内',
    oversea: '境外',
    baidu: '百度',
    bing: '必应',
    google: '谷歌',
    youdao: '有道',
    sousou: '搜搜',
    qihu360: '奇虎360',
  },
}
