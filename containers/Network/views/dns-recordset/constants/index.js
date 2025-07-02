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
  { label: i18n.getI18n(['scopeCloudProvidersMap.qcloud', 'scopeProviders.qcloud', 'license.provider.qcloud']), value: 'Qcloud' }, // 腾讯云
  { label: 'AWS', value: 'Aws' }, // AWS
  { label: i18n.t('network.text_250'), value: 'Aliyun' }, // 阿里云
]

export const policy_types = {
  qcloud: [
    { label: i18n.t('common_712'), value: 'Simple' }, // 默认 简单
    { label: i18n.t('common_675'), value: 'ByCarrier' }, // 运营商
    { label: i18n.t('common_676'), value: 'ByGeoLocation' }, // 地理区域
    { label: i18n.t('common_677'), value: 'BySearchEngine' }, // 搜索引擎
    { label: i18n.t('common_678'), value: 'Weighted' }, // 加权
  ],
  aws: [
    { label: i18n.t('common_712'), value: 'Simple' }, // 默认
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
    Qcloud: i18n.t('network.text_251'),
    Aws: 'AWS',
    Aliyun: i18n.t('network.text_250'),
  },
  policy_type: {
    Simple: i18n.t('common_712'),
    ByCarrier: i18n.t('common_675'),
    ByGeoLocation: i18n.t('common_676'),
    BySearchEngine: i18n.t('common_677'),
    Weighted: i18n.t('common_678'),
    Failover: i18n.t('common_679'),
    MultiValueAnswer: i18n.t('common_680'),
    Latency: i18n.t('common_681'),
    ByCloudPlatform: i18n.t('network.by_cloud_vendor'),
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

export const aliyun_ee_policy_types = [
  { label: i18n.t('common_712'), value: 'Simple' }, // 默认 简单
  { label: i18n.t('common_676'), value: 'ByGeoLocation' }, // 地理区域
  { label: i18n.t('common_675'), value: 'ByCarrier' }, // 运营商
  { label: i18n.t('network.by_cloud_vendor'), value: 'ByCloudPlatform' }, // 云厂商
  { label: i18n.t('common_677'), value: 'BySearchEngine' }, // 搜索引擎
]

export const provinces = [
  {
    key: 'liaoning',
    label: i18n.t('network.province.liaoning'),
    region: 'dongbei',
  },
  {
    key: 'heilongjiang',
    label: i18n.t('network.province.heilongjiang'),
    region: 'dongbei',
  },
  {
    key: 'jilin',
    label: i18n.t('network.province.jilin'),
    region: 'dongbei',
  },
  {
    key: 'tianjin',
    label: i18n.t('network.province.tianjin'),
    region: 'huabei',
  },
  {
    key: 'shanxi',
    label: i18n.t('network.province.shanxi'),
    region: 'huabei',
  },
  {
    key: 'beijing',
    label: i18n.t('network.province.beijing'),
    region: 'huabei',
  },
  {
    key: 'hebei',
    label: i18n.t('network.province.hebei'),
    region: 'huabei',
  },
  {
    key: 'neimenggu',
    label: i18n.t('network.province.neimenggu'),
    region: 'huabei',
  },
  {
    key: 'shandong',
    label: i18n.t('network.province.shandong'),
    region: 'huadong',
  },
  {
    key: 'fujian',
    label: i18n.t('network.province.fujian'),
    region: 'huadong',
  },
  {
    key: 'jiangxi',
    label: i18n.t('network.province.jiangxi'),
    region: 'huadong',
  },
  {
    key: 'anhui',
    label: i18n.t('network.province.anhui'),
    region: 'huadong',
  },
  {
    key: 'zhejiang',
    label: i18n.t('network.province.zhejiang'),
    region: 'huadong',
  },
  {
    key: 'jiangsu',
    label: i18n.t('network.province.jiangsu'),
    region: 'huadong',
  },
  {
    key: 'shanghai',
    label: i18n.t('network.province.shanghai'),
    region: 'huadong',
  },
  {
    key: 'shanghai',
    label: i18n.t('network.province.shanghai'),
    region: 'huadong',
  },
  {
    key: 'hainan',
    label: i18n.t('network.province.hainan'),
    region: 'huanan',
  },
  {
    key: 'guangxi',
    label: i18n.t('network.province.guangxi'),
    region: 'huanan',
  },
  {
    key: 'guangdong',
    label: i18n.t('network.province.guangdong'),
    region: 'huanan',
  },
  {
    key: 'hubei',
    label: i18n.t('network.province.hubei'),
    region: 'huazhong',
  },
  {
    key: 'hunan',
    label: i18n.t('network.province.hunan'),
    region: 'huazhong',
  },
  {
    key: 'hunan',
    label: i18n.t('network.province.hunan'),
    region: 'huazhong',
  },
  {
    key: 'henan',
    label: i18n.t('network.province.henan'),
    region: 'huazhong',
  },
  {
    key: 'gansu',
    label: i18n.t('network.province.gansu'),
    region: 'xibei',
  },
  {
    key: 'shanxi',
    label: i18n.t('network.province.shanxi'),
    region: 'xibei',
  },
  {
    key: 'xinjiang',
    label: i18n.t('network.province.xinjiang'),
    region: 'xibei',
  },
  {
    key: 'qinghai',
    label: i18n.t('network.province.qinghai'),
    region: 'xibei',
  },
  {
    key: 'ningxia',
    label: i18n.t('network.province.ningxia'),
    region: 'xibei',
  },
  {
    key: 'yunnan',
    label: i18n.t('network.province.yunnan'),
    region: 'xinan',
  },
  {
    key: 'sichuan',
    label: i18n.t('network.province.sichuan'),
    region: 'xinan',
  },
  {
    key: 'chongqing',
    label: i18n.t('network.province.chongqing'),
    region: 'xinan',
  },
  {
    key: 'guizhou',
    label: i18n.t('network.province.guizhou'),
    region: 'xinan',
  },
  {
    key: 'xizang',
    label: i18n.t('network.province.xizang'),
    region: 'xinan',
  },
]

export const cn_regions = [
  {
    key: 'dongbei',
    label: i18n.t('network.region.dongbei'),
  },
  {
    key: 'huabei',
    label: i18n.t('network.region.huabei'),
  },
  {
    key: 'huadong',
    label: i18n.t('network.region.huadong'),
  },
  {
    key: 'huanan',
    label: i18n.t('network.region.huanan'),
  },
  {
    key: 'huazhong',
    label: i18n.t('network.region.huazhong'),
  },
  {
    key: 'xibei',
    label: i18n.t('network.region.xibei'),
  },
  {
    key: 'xinan',
    label: i18n.t('network.region.xinan'),
  },
]

export const continents = [
  {
    key: 'africa',
    label: i18n.t('network.continent.africa'),
    children: [
      { key: 'ao', label_zh: '安哥拉', label_en: 'Angola', label_jp: 'アンゴラ' },
      { key: 'ci', label_zh: '科特迪瓦', label_en: 'Côte d\'Ivoire', label_jp: 'コートジボワール' },
      { key: 'cm', label_zh: '喀麦隆', label_en: 'Cameroon', label_jp: 'カメルーン' },
      { key: 'dz', label_zh: '阿尔及利亚', label_en: 'Algeria', label_jp: 'アルジェリア' },
      { key: 'eg', label_zh: '埃及', label_en: 'Egypt', label_jp: 'エジプト' },
      { key: 'dz', label_zh: '阿尔及利亚', label_en: 'Algeria', label_jp: 'アルジェリア' },
      { key: 'eg', label_zh: '埃及', label_en: 'Egypt', label_jp: 'エジプト' },
      { key: 'gh', label_zh: '加纳', label_en: 'Ghana', label_jp: 'ガーナ' },
      { key: 'ke', label_zh: '肯尼亚', label_en: 'Kenya', label_jp: 'ケニア' },
      { key: 'ma', label_zh: '摩洛哥', label_en: 'Morocco', label_jp: 'モロッコ' },
      { key: 'ng', label_zh: '尼日利亚', label_en: 'Nigeria', label_jp: 'ニジェリア' },
      { key: 'sc', label_zh: '塞舌尔', label_en: 'Seychelles', label_jp: 'セーシェル' },
      { key: 'sd', label_zh: '苏丹', label_en: 'Sudan', label_jp: 'スーダン' },
      { key: 'sn', label_zh: '塞内加尔', label_en: 'Senegal', label_jp: 'セネガル' },
      { key: 'ss', label_zh: '南苏丹', label_en: 'South Sudan', label_jp: '南スーダン' },
      { key: 'za', label_zh: '南非', label_en: 'South Africa', label_jp: '南アフリカ' },
      { key: 'ly', label_zh: '利比亚', label_en: 'Libya', label_jp: 'リビア' },
      { key: 'tn', label_zh: '突尼斯', label_en: 'Tunisia', label_jp: 'チュニジア' },
      { key: 'eh', label_zh: '西撒哈拉', label_en: 'Western Sahara', label_jp: '西サハラ' },
      { key: 'et', label_zh: '埃塞俄比亚', label_en: 'Ethiopia', label_jp: 'エチオピア' },
      { key: 'bi', label_zh: '布隆迪', label_en: 'Burundi', label_jp: 'ブルンジ' },
      { key: 'er', label_zh: '厄立特里亚', label_en: 'Eritrea', label_jp: 'エリトリア' },
      { key: 'dj', label_zh: '吉布提', label_en: 'Djibouti', label_jp: 'ジブチ' },
      { key: 'zw', label_zh: '津巴布韦', label_en: 'Zimbabwe', label_jp: 'ジンバブエ' },
      { key: 'km', label_zh: '科摩罗', label_en: 'Comoros', label_jp: 'コモロ' },
      { key: 're', label_zh: '留尼汪', label_en: 'Reunion', label_jp: 'リュウニオン' },
      { key: 'rw', label_zh: '卢旺达', label_en: 'Rwanda', label_jp: 'ルワンダ' },
      { key: 'mg', label_zh: '马达加斯加', label_en: 'Madagascar', label_jp: 'マダガスカル' },
      { key: 'mw', label_zh: '马拉维', label_en: 'Malawi', label_jp: 'マラウィ' },
      { key: 'yt', label_zh: '马约特', label_en: 'Mayotte', label_jp: 'マヨット' },
      { key: 'mu', label_zh: '毛里求斯', label_en: 'Mauritius', label_jp: 'モーリシャス' },
      { key: 'mz', label_zh: '莫桑比克', label_en: 'Mozambique', label_jp: 'モザンビーク' },
      { key: 'so', label_zh: '索马里', label_en: 'Somalia', label_jp: 'ソマリア' },
      { key: 'tz', label_zh: '坦桑尼亚', label_en: 'Tanzania', label_jp: 'タンザニア' },
      { key: 'ug', label_zh: '乌干达', label_en: 'Uganda', label_jp: 'ウガンダ' },
      { key: 'zm', label_zh: '赞比亚', label_en: 'Zambia', label_jp: 'ザンビア' },
      { key: 'bw', label_zh: '博茨瓦纳', label_en: 'Botswana', label_jp: 'ボツワナ' },
      { key: 'ls', label_zh: '莱索托', label_en: 'Lesotho', label_jp: 'レソト' },
      { key: 'na', label_zh: '纳米比亚', label_en: 'Namibia', label_jp: 'ナミビア' },
      { key: 'sz', label_zh: '斯威士兰', label_en: 'Eswatini', label_jp: 'エスワティニ' },
      { key: 'bj', label_zh: '贝宁', label_en: 'Benin', label_jp: 'ベナン' },
      { key: 'bf', label_zh: '布基纳法索', label_en: 'Burkina Faso', label_jp: 'ブルキナファソ' },
      { key: 'tg', label_zh: '多哥', label_en: 'Togo', label_jp: 'トーゴ' },
      { key: 'cv', label_zh: '佛得角', label_en: 'Cape Verde', label_jp: 'カーボベルデ' },
      { key: 'gm', label_zh: '冈比亚', label_en: 'Gambia', label_jp: 'ガンビア' },
      { key: 'gn', label_zh: '几内亚', label_en: 'Guinea', label_jp: 'ギニア' },
      { key: 'gw', label_zh: '几内亚比绍', label_en: 'Guinea-Bissau', label_jp: 'ギニアビサウ' },
      { key: 'lr', label_zh: '利比里亚', label_en: 'Liberia', label_jp: 'リベリア' },
      { key: 'ml', label_zh: '马里', label_en: 'Mali', label_jp: 'マリ' },
      { key: 'mr', label_zh: '毛里塔尼亚', label_en: 'Mauritania', label_jp: 'モーリタニア' },
      { key: 'ne', label_zh: '尼日尔', label_en: 'Niger', label_jp: 'ニジェール' },
      { key: 'sl', label_zh: '塞拉利昂', label_en: 'Sierra Leone', label_jp: 'シエラレオネ' },
      { key: 'sh', label_zh: '圣赫勒拿', label_en: 'Saint Helena', label_jp: 'セントヘレナ' },
      { key: 'gq', label_zh: '赤道几内亚', label_en: 'Equatorial Guinea', label_jp: '赤道ギニア' },
      { key: 'cg', label_zh: '刚果（布）', label_en: 'Republic of the Congo', label_jp: 'コンゴ共和国' },
      { key: 'cd', label_zh: '刚果（金）', label_en: 'Democratic Republic of the Congo', label_jp: 'コンゴ民主共和国' },
      { key: 'ga', label_zh: '加蓬', label_en: 'Gabon', label_jp: 'ガボン' },
      { key: 'st', label_zh: '圣多美和普林西比', label_en: 'Sao Tome and Principe', label_jp: 'サントメ・プリンシペ' },
      { key: 'td', label_zh: '乍得', label_en: 'Chad', label_jp: 'チャド' },
      { key: 'cf', label_zh: '中非共和国', label_en: 'Central African Republic', label_jp: '中央アフリカ共和国' },
      { key: 'other', label_zh: '其他', label_en: 'Other', label_jp: 'その他' },
    ],
  },
  {
    key: 'asia',
    label: i18n.t('network.continent.asia'),
    children: [
      { key: 'ae', label_zh: '阿联酋', label_en: 'United Arab Emirates', label_jp: 'アラブ首長国連邦' },
      { key: 'bh', label_zh: '巴林', label_en: 'Bahrain', label_jp: 'バーレーン' },
      { key: 'hk', label_zh: '香港', label_en: 'Hong Kong', label_jp: '香港' },
      { key: 'id', label_zh: '印尼', label_en: 'Indonesia', label_jp: 'インドネシア' },
      { key: 'il', label_zh: '以色列', label_en: 'Israel', label_jp: 'イスラエル' },
      {
        key: 'in',
        label_zh: '印度',
        label_en: 'India',
        label_jp: 'インド',
        children: [
          { key: 'assam', label_zh: '阿萨姆邦', label_en: 'Assam', label_jp: 'アサム' },
          { key: 'nicobar', label_zh: '安达曼_尼科巴群岛', label_en: 'Andaman and Nicobar Islands', label_jp: 'アンダマン・ニコバル諸島' },
          { key: 'andhra', label_zh: '安得拉邦', label_en: 'Andhra Pradesh', label_jp: 'アンドラ州' },
          { key: 'orissa', label_zh: '奥里萨邦', label_en: 'Odisha State', label_jp: 'オリザ州' },
          { key: 'uttarakhand', label_zh: '北阿坎德邦', label_en: 'Uttarakhand', label_jp: '北アーカンド州' },
          { key: 'utar', label_zh: '北方邦', label_en: 'UTTAR', label_jp: '北方諸国' },
          { key: 'pondicherry', label_zh: '本地治里', label_en: 'PONDICHERRY', label_jp: '本地治里' },
          { key: 'bihar', label_zh: '比哈尔邦', label_en: 'Bihar', label_jp: 'ビハール州' },
          { key: 'chandigarh', label_zh: '昌迪加尔', label_en: 'Chandigarh', label_jp: 'チャンディーガル' },
          { key: 'dadra', label_zh: '达德拉-纳加尔哈维利', label_en: 'Dadra and Nagar Haveli', label_jp: 'ダードラー・ナガル・ハヴェーリー' },
          { key: 'daman', label_zh: '达曼-第乌', label_en: 'Daman and Diu', label_jp: 'ダマン・ディーウ' },
          { key: 'delhi', label_zh: '德里', label_en: 'Delhi', label_jp: 'デリー' },
          { key: 'gujarat', label_zh: '古吉拉特邦', label_en: 'Gujarat', label_jp: 'グジャラート州' },
          { key: 'goa', label_zh: '果阿邦', label_en: 'Goa', label_jp: 'ゴア州' },
          { key: 'haryana', label_zh: '哈里亚纳邦', label_en: 'Haryana', label_jp: 'ハリヤーナー州' },
          { key: 'jharkhand', label_zh: '贾坎德邦', label_en: 'Jharkhand', label_jp: 'ジャールカンド州' },
          { key: 'kerala', label_zh: '喀拉拉邦', label_en: 'Kerala', label_jp: 'ケーララ州' },
          { key: 'karnataka', label_zh: '卡纳塔克邦', label_en: 'Karnataka', label_jp: 'カルナータカ州' },
          { key: 'rajasthan', label_zh: '拉贾斯坦邦', label_en: 'Rajasthan', label_jp: 'ラージャスターン州' },
          { key: 'maharashtra', label_zh: '马哈拉施特拉邦', label_en: 'Maharashtra', label_jp: 'マハーラーシュトラ州' },
          { key: 'manipur', label_zh: '曼尼普尔邦', label_en: 'Manipur', label_jp: 'マニプール州' },
          { key: 'meghalaya', label_zh: '梅加拉亚邦', label_en: 'Meghalaya', label_jp: 'メーガーラヤ州' },
          { key: 'mizoram', label_zh: '米佐拉姆邦', label_en: 'Mizoram', label_jp: 'ミゾラム州' },
          { key: 'nagaland', label_zh: '那加兰邦', label_en: 'Nagaland', label_jp: 'ナガランド州' },
          { key: 'punjab', label_zh: '旁遮普邦', label_en: 'Punjab', label_jp: 'パンジャーブ州' },
          { key: 'chhattisgarh', label_zh: '恰蒂斯加尔邦', label_en: 'Chhattisgarh', label_jp: 'チャッティースガル州' },
          { key: 'tamil', label_zh: '泰米尔纳德邦', label_en: 'Tamil Nadu', label_jp: 'タミル・ナードゥ州' },
          { key: 'tripura', label_zh: '特里普拉邦', label_en: 'Tripura', label_jp: 'トリプラ州' },
          { key: 'bengal', label_zh: '西孟加拉邦', label_en: 'West Bengal', label_jp: '西ベンガル州' },
          { key: 'sikkim', label_zh: '锡金邦', label_en: 'Sikkim', label_jp: 'シッキム州' },
          { key: 'himachal', label_zh: '喜马偕尔邦', label_en: 'Himachal Pradesh', label_jp: 'ヒマーチャル・プラデーシュ州' },
          { key: 'madhya', label_zh: '中央邦', label_en: 'Madhya Pradesh', label_jp: 'マディヤ・プラデーシュ州' },
          { key: 'telangana', label_zh: '特伦甘纳邦', label_en: 'Telangana', label_jp: 'テランガーナ州' },
          // { key: 'arunachal-pradesh', label_zh: '阿鲁纳恰尔邦', label_en: 'Arunachal Pradesh', label_jp: 'アルナーチャル・プラデーシュ州' },
          // { key: 'jammu-kashmir', label_zh: '查谟-克什米尔', label_en: 'Jammu and Kashmir', label_jp: 'ジャンムー・カシミール' },
          // { key: 'ladakh', label_zh: '拉达克', label_en: 'Ladakh', label_jp: 'ラダック' },
          // { key: 'lakshadweep', label_zh: '拉克沙群岛', label_en: 'Lakshadweep', label_jp: 'ラクシャディープ' },
        ],
      },
      { key: 'iq', label_zh: '伊拉克', label_en: 'Iraq', label_jp: 'イラク' },
      { key: 'ir', label_zh: '伊朗', label_en: 'Iran', label_jp: 'イラン' },
      { key: 'jp', label_zh: '日本', label_en: 'Japan', label_jp: '日本' },
      { key: 'kh', label_zh: '柬埔寨', label_en: 'Cambodia', label_jp: 'カンボジア' },
      { key: 'kp', label_zh: '朝鲜', label_en: 'North Korea', label_jp: '北朝鮮' },
      { key: 'kr', label_zh: '韩国', label_en: 'South Korea', label_jp: '韓国' },
      { key: 'kw', label_zh: '科威特', label_en: 'Kuwait', label_jp: 'クウェート' },
      { key: 'kz', label_zh: '哈萨克斯坦', label_en: 'Kazakhstan', label_jp: 'カザフスタン' },
      { key: 'la', label_zh: '老挝', label_en: 'Laos', label_jp: 'ラオス' },
      { key: 'lb', label_zh: '黎巴嫩', label_en: 'Lebanon', label_jp: 'レバノン' },
      { key: 'mm', label_zh: '缅甸', label_en: 'Myanmar', label_jp: 'ミャンマー' },
      { key: 'mn', label_zh: '蒙古', label_en: 'Mongolia', label_jp: 'モンゴル' },
      { key: 'mo', label_zh: '澳门', label_en: 'Macau', label_jp: 'マカオ' },
      { key: 'mv', label_zh: '马尔代夫', label_en: 'Maldives', label_jp: 'モルディブ' },
      { key: 'my', label_zh: '马来西亚', label_en: 'Malaysia', label_jp: 'マレーシア' },
      { key: 'np', label_zh: '尼泊尔', label_en: 'Nepal', label_jp: 'ネパール' },
      { key: 'om', label_zh: '阿曼', label_en: 'Oman', label_jp: 'オマーン' },
      { key: 'ph', label_zh: '菲律宾', label_en: 'Philippines', label_jp: 'フィリピン' },
      { key: 'pk', label_zh: '巴基斯坦', label_en: 'Pakistan', label_jp: 'パキスタン' },
      { key: 'qa', label_zh: '卡塔尔', label_en: 'Qatar', label_jp: 'カタール' },
      { key: 'sa', label_zh: '沙特阿拉伯', label_en: 'Saudi Arabia', label_jp: 'サウジアラビア' },
      { key: 'sg', label_zh: '新加坡', label_en: 'Singapore', label_jp: 'シンガポール' },
      { key: 'sy', label_zh: '叙利亚', label_en: 'Syria', label_jp: 'シリア' },
      { key: 'th', label_zh: '泰国', label_en: 'Thailand', label_jp: 'タイ' },
      { key: 'tr', label_zh: '土耳其', label_en: 'Turkey', label_jp: 'トルコ' },
      { key: 'tw', label_zh: '台湾', label_en: 'Taiwan', label_jp: '台湾' },
      { key: 'uz', label_zh: '乌兹别克斯坦', label_en: 'Uzbekistan', label_jp: 'ウズベキスタン' },
      { key: 'vn', label_zh: '越南', label_en: 'Vietnam', label_jp: 'ベトナム' },
      { key: 'tl', label_zh: '东帝汶', label_en: 'Timor-Leste', label_jp: '東ティモール' },
      { key: 'bn', label_zh: '文莱', label_en: 'Brunei', label_jp: 'ブルネイ' },
      { key: 'af', label_zh: '阿富汗', label_en: 'Afghanistan', label_jp: 'アフガニスタン' },
      { key: 'bt', label_zh: '不丹', label_en: 'Bhutan', label_jp: 'ブータン' },
      { key: 'bd', label_zh: '孟加拉国', label_en: 'Bangladesh', label_jp: 'バングラデシュ' },
      { key: 'lk', label_zh: '斯里兰卡', label_en: 'Sri Lanka', label_jp: 'スリランカ' },
      { key: 'az', label_zh: '阿塞拜疆', label_en: 'Azerbaijan', label_jp: 'アゼルバイジャン' },
      { key: 'ps', label_zh: '巴勒斯坦', label_en: 'Palestine', label_jp: 'パレスチナ' },
      { key: 'ge', label_zh: '格鲁吉亚', label_en: 'Georgia', label_jp: 'ジョージア' },
      { key: 'cy', label_zh: '塞浦路斯', label_en: 'Cyprus', label_jp: 'キプロス' },
      { key: 'am', label_zh: '亚美尼亚', label_en: 'Armenia', label_jp: 'アルメニア' },
      { key: 'ye', label_zh: '也门', label_en: 'Yemen', label_jp: 'イエメン' },
      { key: 'jo', label_zh: '约旦', label_en: 'Jordan', label_jp: 'ヨルダン' },
      { key: 'kg', label_zh: '吉尔吉斯斯坦', label_en: 'Kyrgyzstan', label_jp: 'キルギス' },
      { key: 'tj', label_zh: '塔吉克斯坦', label_en: 'Tajikistan', label_jp: 'タジキスタン' },
      { key: 'tm', label_zh: '土库曼斯坦', label_en: 'Turkmenistan', label_jp: 'トルクメニスタン' },
      // { key: 'id', label_zh: '印度尼西亚', label_en: 'Indonesia', label_jp: 'インドネシア' },
      { key: 'other', label_zh: '其他', label_en: 'Other', label_jp: 'その他' },
    ],
  },
  {
    key: 'euro',
    label: i18n.t('network.continent.europe'),
    children: [
      { key: 'at', label_zh: '奥地利', label_en: 'Austria', label_jp: 'オーストリア' },
      { key: 'be', label_zh: '比利时', label_en: 'Belgium', label_jp: 'ベルギー' },
      { key: 'bg', label_zh: '保加利亚', label_en: 'Bulgaria', label_jp: 'ブルガリア' },
      { key: 'by', label_zh: '白俄罗斯', label_en: 'Belarus', label_jp: 'ベラルーシ' },
      { key: 'ch', label_zh: '瑞士', label_en: 'Switzerland', label_jp: 'スイス' },
      { key: 'cz', label_zh: '捷克', label_en: 'Czech Republic', label_jp: 'チェコ' },
      { key: 'de', label_zh: '德国', label_en: 'Germany', label_jp: 'ドイツ' },
      { key: 'dk', label_zh: '丹麦', label_en: 'Denmark', label_jp: 'デンマーク' },
      { key: 'ee', label_zh: '爱沙尼亚', label_en: 'Estonia', label_jp: 'エストニア' },
      { key: 'es', label_zh: '西班牙', label_en: 'Spain', label_jp: 'スペイン' },
      { key: 'fi', label_zh: '芬兰', label_en: 'Finland', label_jp: 'フィンランド' },
      { key: 'fr', label_zh: '法国', label_en: 'France', label_jp: 'フランス' },
      { key: 'gb', label_zh: '英国', label_en: 'United Kingdom', label_jp: 'イギリス' },
      { key: 'hr', label_zh: '克罗地亚', label_en: 'Croatia', label_jp: 'クロアチア' },
      { key: 'hu', label_zh: '匈牙利', label_en: 'Hungary', label_jp: 'ハンガリー' },
      { key: 'ie', label_zh: '爱尔兰', label_en: 'Ireland', label_jp: 'アイルランド' },
      { key: 'is', label_zh: '冰岛', label_en: 'Iceland', label_jp: 'アイスランド' },
      { key: 'it', label_zh: '意大利', label_en: 'Italy', label_jp: 'イタリア' },
      { key: 'lt', label_zh: '立陶宛', label_en: 'Lithuania', label_jp: 'リトアニア' },
      { key: 'nl', label_zh: '荷兰', label_en: 'Netherlands', label_jp: 'オランダ' },
      { key: 'pl', label_zh: '波兰', label_en: 'Poland', label_jp: 'ポーランド' },
      { key: 'pt', label_zh: '葡萄牙', label_en: 'Portugal', label_jp: 'ポルトガル' },
      { key: 'ro', label_zh: '罗马尼亚', label_en: 'Romania', label_jp: 'ルーマニア' },
      { key: 'ru', label_zh: '俄罗斯', label_en: 'Russia', label_jp: 'ロシア' },
      { key: 'se', label_zh: '瑞典', label_en: 'Sweden', label_jp: 'スウェーデン' },
      { key: 'si', label_zh: '斯洛文尼亚', label_en: 'Slovenia', label_jp: 'スロベニア' },
      { key: 'sk', label_zh: '斯洛伐克', label_en: 'Slovakia', label_jp: 'スロバキア' },
      { key: 'ua', label_zh: '乌克兰', label_en: 'Ukraine', label_jp: 'ウクライナ' },
      { key: 'ee', label_zh: '爱沙尼亚', label_en: 'Estonia', label_jp: 'エストニア.' },
      { key: 'ax', label_zh: '奥兰群岛', label_en: 'Åland Islands', label_jp: 'オーラン諸島' },
      { key: 'fo', label_zh: '法罗群岛', label_en: 'the Faroe Islands', label_jp: 'フェロー諸島' },
      { key: 'gg', label_zh: '根西岛', label_en: 'Guernsey Island', label_jp: 'ルート西島' },
      { key: 'lv', label_zh: '拉脱维亚', label_en: 'Latvia', label_jp: 'ラトビア' },
      { key: 'im', label_zh: '马恩岛', label_en: 'Isle of Man', label_jp: 'マーン島' },
      { key: 'no', label_zh: '挪威', label_en: 'Norway', label_jp: 'ノルウェー' },
      { key: 'sj', label_zh: '斯瓦尔巴群岛和扬马延岛', label_en: 'Svalbard and Jan Mayen Islands', label_jp: 'スワルバ諸島とヤンマーヨン島' },
      { key: 'je', label_zh: '泽西', label_en: 'Jersey', label_jp: 'ジャージー' },
      { key: 'md', label_zh: '摩尔多瓦', label_en: 'Moldova', label_jp: 'モルドバ' },
      { key: 'al', label_zh: '阿尔巴尼亚', label_en: 'Albania', label_jp: 'アルバニア' },
      { key: 'ad', label_zh: '安道尔', label_en: 'Andorra', label_jp: 'アンドラ' },
      { key: 'mk', label_zh: '北马其顿', label_en: 'North Macedonia', label_jp: '北マケドニア' },
      { key: 'ba', label_zh: '波黑', label_en: 'Bosnia and Herzegovina', label_jp: 'ボスニア・ヘルツェゴビナ' },
      { key: 'va', label_zh: '梵蒂冈', label_en: 'Vatican City', label_jp: 'バチカン' },
      { key: 'me', label_zh: '黑山', label_en: 'Montenegro', label_jp: 'モンテネグロ' },
      { key: 'mt', label_zh: '马耳他', label_en: 'Malta', label_jp: 'マルタ' },
      { key: 'rs', label_zh: '塞尔维亚', label_en: 'Serbia', label_jp: 'セルビア' },
      { key: 'sm', label_zh: '圣马力诺', label_en: 'San Marino', label_jp: 'サンマリノ' },
      { key: 'gr', label_zh: '希腊', label_en: 'Greece', label_jp: 'ギリシャ' },
      { key: 'gi', label_zh: '直布罗陀', label_en: 'Gibraltar', label_jp: 'ジブラルタル' },
      { key: 'li', label_zh: '列支敦士登', label_en: 'Liechtenstein', label_jp: 'リヒテンシュタイン' },
      { key: 'lu', label_zh: '卢森堡', label_en: 'Luxembourg', label_jp: 'ルクセンブルク' },
      { key: 'mc', label_zh: '摩纳哥', label_en: 'Monaco', label_jp: 'モナコ' },
      { key: 'other', label_zh: '其他', label_en: 'Other', label_jp: 'その他' },
    ],
  },
  {
    key: 'namerica',
    label: i18n.t('network.continent.namerica'),
    children: [
      {
        key: 'ca',
        label_zh: '加拿大',
        label_en: 'Canada',
        label_jp: 'カナダ',
        children: [
          { key: 'british_columbia', label_zh: '不列颠哥伦比亚省', label_en: 'British Columbia', label_jp: 'ブリティッシュコロンビア州' },
          { key: 'alberta', label_zh: '艾伯塔省', label_en: 'Alberta', label_jp: 'アルバータ州' },
          { key: 'saskatchewan', label_zh: '萨斯喀彻温省', label_en: 'Saskatchewan', label_jp: 'サスカチュワン州' },
          { key: 'manitoba', label_zh: '马尼托巴省', label_en: 'Manitoba', label_jp: 'マニトバ州' },
          { key: 'ontario', label_zh: '安大略省', label_en: 'Ontario', label_jp: 'オンタリオ州' },
          { key: 'quebec', label_zh: '魁北克省', label_en: 'Quebec', label_jp: 'ケベック州' },
          { key: 'new_brunswick', label_zh: '新不伦瑞克省', label_en: 'New Brunswick', label_jp: 'ニューブランズウィック州' },
          { key: 'prince_edward', label_zh: '爱德华王子岛', label_en: 'Prince Edward Island', label_jp: 'プリンスエドワードアイランド州' },
          { key: 'nova_scotia', label_zh: '新斯科舍省', label_en: 'Nova Scotia', label_jp: 'ノバスコシア州' },
          { key: 'newfoundland', label_zh: '纽芬兰与拉布拉多省', label_en: 'Newfoundland and Labrador', label_jp: 'ニューファンドランド・ラブラドール州' },
          { key: 'yukon', label_zh: '育空地区', label_en: 'Yukon', label_jp: 'ユーコン準州' },
          { key: 'northwest', label_zh: '西北地区', label_en: 'Northwest Territories', label_jp: 'ノースウェスト準州' },
          { key: 'nunavut', label_zh: '努纳武特地区', label_en: 'Nunavut', label_jp: 'ヌナブト準州' },
        ],
      },
      { key: 'cu', label_zh: '古巴', label_en: 'Cuba', label_jp: 'キューバ' },
      { key: 'mx', label_zh: '墨西哥', label_en: 'Mexico', label_jp: 'メキシコ' },
      { key: 'bm', label_zh: '百慕大', label_en: 'Bermuda Triangle', label_jp: 'バミューダ.' },
      {
        key: 'us',
        label_zh: '美国',
        label_en: 'United States',
        label_jp: 'アメリカ合衆国',
        children: [
          { key: 'arkansas', label_zh: '阿肯色州', label_en: 'Arkansas', label_jp: 'アーカンソー州' },
          { key: 'alabama', label_zh: '阿拉巴马州', label_en: 'Alabama', label_jp: 'アラバマ州' },
          { key: 'alaska', label_zh: '阿拉斯加州', label_en: 'Alaska', label_jp: 'アラスカ州' },
          { key: 'iowa', label_zh: '艾奥瓦州', label_en: 'Iowa', label_jp: 'アイオワ州' },
          { key: 'idaho', label_zh: '爱达荷州', label_en: 'Idaho', label_jp: 'アイダホ州' },
          { key: 'north_dakota', label_zh: '北达科他州', label_en: 'North Dakota', label_jp: 'ノースダコタ州' },
          { key: 'north_carolina', label_zh: '北卡罗来纳州', label_en: 'North Carolina', label_jp: 'ノースカロライナ州' },
          { key: 'pennsylvania', label_zh: '宾夕法尼亚州', label_en: 'Pennsylvania', label_jp: 'ペンシルベニア州' },
          { key: 'texas', label_zh: '得克萨斯州', label_en: 'Texas', label_jp: 'テキサス州' },
          { key: 'ohio', label_zh: '俄亥俄州', label_en: 'Ohio', label_jp: 'オハイオ州' },
          { key: 'oklahoma', label_zh: '俄克拉荷马州', label_en: 'Oklahoma', label_jp: 'オクラホマ州' },
          { key: 'oregon', label_zh: '俄勒冈州', label_en: 'Oregon', label_jp: 'オレゴン州' },
          { key: 'florida', label_zh: '佛罗里达州', label_en: 'Florida', label_jp: 'フロリダ州' },
          { key: 'vermont', label_zh: '佛蒙特州', label_en: 'Vermont', label_jp: 'バーモント州' },
          { key: 'virginia', label_zh: '弗吉尼亚州', label_en: 'Virginia', label_jp: 'バージニア州' },
          { key: 'washington', label_zh: '华盛顿州', label_en: 'Washington', label_jp: 'ワシントン州' },
          { key: 'wyoming', label_zh: '怀俄明州', label_en: 'Wyoming', label_jp: 'ワイオミング州' },
          { key: 'california', label_zh: '加利福尼亚州', label_en: 'California', label_jp: 'カリフォルニア州' },
          { key: 'kansas', label_zh: '堪萨斯州', label_en: 'Kansas', label_jp: 'カンザス州' },
          { key: 'connecticut', label_zh: '康涅狄格州', label_en: 'Connecticut', label_jp: 'コネチカット州' },
          { key: 'colorado', label_zh: '科罗拉多州', label_en: 'Colorado', label_jp: 'コロラド州' },
          { key: 'kentucky', label_zh: '肯塔基州', label_en: 'Kentucky', label_jp: 'ケンタッキー州' },
          { key: 'louisiana', label_zh: '路易斯安那州', label_en: 'Louisiana', label_jp: 'ルイジアナ州' },
          { key: 'rhode', label_zh: '罗得岛州', label_en: 'Rhode Island', label_jp: 'ロードアイランド州' },
          { key: 'maryland', label_zh: '马里兰州', label_en: 'Maryland', label_jp: 'メリーランド州' },
          { key: 'massachusetts', label_zh: '马萨诸塞州', label_en: 'Massachusetts', label_jp: 'マサチューセッツ州' },
          { key: 'montana', label_zh: '蒙大拿州', label_en: 'Montana', label_jp: 'モンタナ州' },
          { key: 'missouri', label_zh: '密苏里州', label_en: 'Missouri', label_jp: 'ミズーリ州' },
          { key: 'mississippi', label_zh: '密西西比州', label_en: 'Mississippi', label_jp: 'ミシシッピ州' },
          { key: 'michigan', label_zh: '密歇根州', label_en: 'Michigan', label_jp: 'ミシガン州' },
          { key: 'maine', label_zh: '缅因州', label_en: 'Maine', label_jp: 'メイン州' },
          { key: 'minnesota', label_zh: '明尼苏达州', label_en: 'Minnesota', label_jp: 'ミネソタ州' },
          { key: 'south_dakota', label_zh: '南达科他州', label_en: 'South Dakota', label_jp: 'サウスダコタ州' },
          { key: 'south_carolina', label_zh: '南卡罗来纳州', label_en: 'South Carolina', label_jp: 'サウスカロライナ州' },
          { key: 'nebraska', label_zh: '内布拉斯加州', label_en: 'Nebraska', label_jp: 'ネブラスカ州' },
          { key: 'nevada', label_zh: '内华达州', label_en: 'Nevada', label_jp: 'ネバダ州' },
          { key: 'new_york', label_zh: '纽约州', label_en: 'New York', label_jp: 'ニューヨーク州' },
          { key: 'georgia', label_zh: '佐治亚州', label_en: 'Georgia', label_jp: 'ジョージア州' },
          { key: 'delaware', label_zh: '特拉华州', label_en: 'Delaware', label_jp: 'デラウェア州' },
          { key: 'tennessee', label_zh: '田纳西州', label_en: 'Tennessee', label_jp: 'テネシー州' },
          { key: 'wisconsin', label_zh: '威斯康星州', label_en: 'Wisconsin', label_jp: 'ウィスコンシン州' },
          { key: 'west_virginia', label_zh: '西弗吉尼亚州', label_en: 'West Virginia', label_jp: 'ウェストバージニア州' },
          { key: 'hawaii', label_zh: '夏威夷州', label_en: 'Hawaii', label_jp: 'ハワイ州' },
          { key: 'new_hampshire', label_zh: '新罕布什尔州', label_en: 'New Hampshire', label_jp: 'ニューハンプシャー州' },
          { key: 'new_mexico', label_zh: '新墨西哥州', label_en: 'New Mexico', label_jp: 'ニューメキシコ州' },
          { key: 'new_jersey', label_zh: '新泽西州', label_en: 'New Jersey', label_jp: 'ニュージャージー州' },
          { key: 'arizona', label_zh: '亚利桑那州', label_en: 'Arizona', label_jp: 'アリゾナ州' },
          { key: 'illinois', label_zh: '伊利诺伊州', label_en: 'Illinois', label_jp: 'イリノイ州' },
          { key: 'indiana', label_zh: '印第安纳州', label_en: 'Indiana', label_jp: 'インディアナ州' },
          { key: 'utah', label_zh: '犹他州', label_en: 'Utah', label_jp: 'ユタ州' },
          { key: 'washington_dc', label_zh: '华盛顿哥伦比亚特区', label_en: 'Washington DC', label_jp: 'ワシントンD.C.' },
        ],
      },
      { key: 'gl', label_zh: '格林兰', label_en: 'greenland', label_jp: 'グリーンランド' },
      { key: 'pm', label_zh: '圣皮埃尔和密克隆', label_en: 'Saint Pierre and Miquelon', label_jp: 'サンピエールとミクロン' },
      { key: 'aw', label_zh: '阿鲁巴', label_en: 'Aruba', label_jp: 'アルバ.' },
      { key: 'ai', label_zh: '安圭拉', label_en: 'ANGUILLA', label_jp: 'アンギラ.' },
      { key: 'ag', label_zh: '安提瓜和巴布达', label_en: 'Antigua and Barbuda', label_jp: 'アンティグア・バーブーダ' },
      { key: 'bb', label_zh: '巴巴多斯', label_en: 'Barbados', label_jp: 'バルバドス' },
      { key: 'bs', label_zh: '巴哈马', label_en: 'Bahamas', label_jp: 'バハマ' },
      { key: 'pr', label_zh: '波多黎各', label_en: 'Puerto Rico', label_jp: 'プエルトリコ.' },
      { key: 'dm', label_zh: '多米尼克', label_en: 'Dominica', label_jp: 'ドミニカ' },
      { key: 'do', label_zh: '多米尼加', label_en: 'Dominican Republic', label_jp: 'ドミニカ共和国' },
      { key: 'mf', label_zh: '法属圣马丁', label_en: 'saint martin', label_jp: 'フランス領セント・マーティン' },
      { key: 'gd', label_zh: '格林纳达', label_en: 'Grenada', label_jp: 'グレナダ' },
      { key: 'gp', label_zh: '瓜德罗普', label_en: 'guadeloupe', label_jp: 'グアドループ.' },
      { key: 'ht', label_zh: '海地', label_en: 'Haiti', label_jp: 'ハイチ' },
      { key: 'bq', label_zh: '荷兰加勒比区', label_en: 'Caribbean Netherlands', label_jp: 'オランダ・カリブ州' },
      { key: 'sx', label_zh: '荷属圣马丁', label_en: 'Sint Maarten', label_jp: 'オランダ領セント・マーティン' },
      { key: 'ky', label_zh: '开曼群岛', label_en: 'Cayman Islands', label_jp: 'ケイマン諸島' },
      { key: 'cw', label_zh: '库拉索', label_en: 'curacao', label_jp: 'キュラソー' },
      { key: 'mq', label_zh: '马提尼克', label_en: 'martinique', label_jp: 'マルティニーク' },
      { key: 'vi', label_zh: '马属维尔京群岛', label_en: 'Virgin Islands of the Year of the Horse', label_jp: 'マゼンバージン諸島' },
      { key: 'ms', label_zh: '蒙特塞拉特', label_en: 'Montserrat', label_jp: 'モンセラット' },
      { key: 'bl', label_zh: '圣巴泰勒米', label_en: 'Saint Barthélemy', label_jp: 'サンバテルミ' },
      { key: 'kn', label_zh: '圣基茨和尼维斯', label_en: 'Saint Kitts and Nevis', label_jp: 'セントクリストファー・ネイビス' },
      { key: 'lc', label_zh: '圣卢西亚', label_en: 'Saint Lucia', label_jp: 'セントルシア' },
      { key: 'vc', label_zh: '圣文森特和格林纳丁斯', label_en: 'Saint Vincent and the Grenadines', label_jp: 'セントビンセント・グレナディーン' },
      { key: 'tc', label_zh: '特克斯和凯克斯群岛', label_en: 'Turks and Caicos Islands', label_jp: 'タークス諸島とカイコス諸島' },
      { key: 'tt', label_zh: '特立尼达和多巴哥', label_en: 'Trinidad and Tobago', label_jp: 'トリニダード・トバゴ' },
      { key: 'jm', label_zh: '牙买加', label_en: 'Jamaica', label_jp: 'ジャマイカ' },
      { key: 'vg', label_zh: '英属维尔京群岛', label_en: 'British Virgin Islands', label_jp: 'イギリス領ヴァージン諸島' },
      { key: 'pa', label_zh: '巴拿马', label_en: 'Panama', label_jp: 'パナマ' },
      { key: 'bz', label_zh: '伯利兹', label_en: 'Belize', label_jp: 'ベリーズ' },
      { key: 'cr', label_zh: '哥斯达黎加', label_en: 'Costa Rica', label_jp: 'コスタリカ' },
      { key: 'hn', label_zh: '洪都拉斯', label_en: 'Honduras', label_jp: 'ホンジュラス' },
      { key: 'ni', label_zh: '尼加拉瓜', label_en: 'Nicaragua', label_jp: 'ニカラグア' },
      { key: 'sv', label_zh: '萨尔瓦多', label_en: 'El Salvador', label_jp: 'エルサルバドル' },
      { key: 'gt', label_zh: '危地马拉', label_en: 'Guatemala', label_jp: 'グアテマラ' },
      { key: 'other', label_zh: '其他', label_en: 'Other', label_jp: 'その他' },
    ],
  },
  {
    key: 'oceania',
    label: i18n.t('network.continent.oceania'),
    children: [
      { key: 'au', label_zh: '澳大利亚', label_en: 'Australia', label_jp: 'オーストラリア' },
      { key: 'fj', label_zh: '斐济', label_en: 'Fiji', label_jp: 'フィジー' },
      { key: 'nz', label_zh: '新西兰', label_en: 'New Zealand', label_jp: 'ニュージーランド' },
      { key: 'pw', label_zh: '帕劳', label_en: 'Palau', label_jp: 'パラオ' },
      { key: 'nf', label_zh: '诺福克岛', label_en: 'Norfolk Is', label_jp: 'ノーフォーク島' },
      { key: 'pf', label_zh: '法属波利尼西亚', label_en: 'French Polynesia', label_jp: 'フランス領ポリネシア' },
      { key: 'ck', label_zh: '库克群岛', label_en: 'Cook Islands', label_jp: 'クック諸島' },
      { key: 'as', label_zh: '美属萨摩亚', label_en: 'American Samoa', label_jp: 'アメリカ領サモア' },
      { key: 'nu', label_zh: '纽埃', label_en: 'niue', label_jp: 'ニウエ' },
      { key: 'pn', label_zh: '皮特凯恩', label_en: 'Pitcairn', label_jp: 'ピトケイン' },
      { key: 'ws', label_zh: '萨摩亚', label_en: 'Samoa', label_jp: 'サモア' },
      { key: 'to', label_zh: '汤加', label_en: 'Tonga', label_jp: 'トンガ' },
      { key: 'tv', label_zh: '图瓦卢', label_en: 'Tuvalu', label_jp: 'ツバル' },
      { key: 'tk', label_zh: '托克劳', label_en: 'tokelau', label_jp: 'トクロ' },
      { key: 'wf', label_zh: '瓦利斯和富图纳群岛', label_en: 'wallis and futuna', label_jp: 'バリスとフツナ' },
      { key: 'pg', label_zh: '巴布亚新几内亚', label_en: 'Papua New Guinea', label_jp: 'パプアニューギニア' },
      { key: 'sb', label_zh: '所罗门群岛', label_en: 'Solomon Islands', label_jp: 'ソロモン諸島' },
      { key: 'vu', label_zh: '瓦努阿图', label_en: 'Vanuatu', label_jp: 'バヌアツ' },
      { key: 'nc', label_zh: '新喀里多尼亚', label_en: 'New Caledonia', label_jp: 'ニューカレドニア' },
      { key: 'mp', label_zh: '北马里亚纳群岛', label_en: 'Northern Mariana Islands', label_jp: 'ノースマリアナ諸島' },
      { key: 'gu', label_zh: '关岛', label_en: 'Guam', label_jp: 'グアム' },
      { key: 'ki', label_zh: '基里巴斯', label_en: 'Kiribati', label_jp: 'キリバス' },
      { key: 'mh', label_zh: '马绍尔群岛', label_en: 'Marshall Islands', label_jp: 'マーシャル諸島' },
      { key: 'fm', label_zh: '密克罗尼西亚', label_en: 'Micronesia', label_jp: 'ミクロネシア' },
      { key: 'nr', label_zh: '瑙鲁', label_en: 'Nauru', label_jp: 'ナウル' },
      { key: 'other', label_zh: '其他', label_en: 'Other', label_jp: 'その他' },
    ],
  },
  {
    key: 'samerica',
    label: i18n.t('network.continent.samerica'),
    children: [
      { key: 'ar', label_zh: '阿根廷', label_en: 'Argentina', label_jp: 'アルゼンチン' },
      { key: 'bo', label_zh: '玻利维亚', label_en: 'Bolivia', label_jp: 'ボリビア' },
      { key: 'br', label_zh: '巴西', label_en: 'Brazil', label_jp: 'ブラジル' },
      { key: 'cl', label_zh: '智利', label_en: 'Chile', label_jp: 'チリ' },
      { key: 'co', label_zh: '哥伦比亚', label_en: 'Colombia', label_jp: 'コロンビア' },
      { key: 'ec', label_zh: '厄瓜多尔', label_en: 'Ecuador', label_jp: 'エクアドル' },
      { key: 'pe', label_zh: '秘鲁', label_en: 'Peru', label_jp: 'ペルー' },
      { key: 'py', label_zh: '巴拉圭', label_en: 'Paraguay', label_jp: 'パラグアイ' },
      { key: 'uy', label_zh: '乌拉圭', label_en: 'Uruguay', label_jp: 'ウルグアイ' },
      { key: 've', label_zh: '委内瑞拉', label_en: 'Venezuela', label_jp: 'ベネズエラ' },
      { key: 'gf', label_zh: '法属圭亚那', label_en: 'french guiana', label_jp: 'フランス領ガイアナ' },
      { key: 'fk', label_zh: '福克兰群岛', label_en: 'the Falkland Islands', label_jp: 'フォークランド諸島' },
      { key: 'gy', label_zh: '圭亚那', label_en: 'Guyana', label_jp: 'ガイアナ' },
      { key: 'sr', label_zh: '苏里南', label_en: 'Suriname', label_jp: 'スリナム' },
      { key: 'other', label_zh: '其他', label_en: 'Other', label_jp: 'その他' },
    ],
  },
  {
    key: 'eastern_africa',
    label: i18n.t('network.continent.eastern_africa'),
  },
  {
    key: 'southern_africa',
    label: i18n.t('network.continent.southern_africa'),
  },
  {
    key: 'western_africa',
    label: i18n.t('network.continent.western_africa'),
  },
  {
    key: 'northern_africa',
    label: i18n.t('network.continent.northern_africa'),
  },
  {
    key: 'middle_africa',
    label: i18n.t('network.continent.middle_africa'),
  },
  {
    key: 'eastern_asia',
    label: i18n.t('network.continent.eastern_asia'),
  },
  {
    key: 'southern_asia',
    label: i18n.t('network.continent.southern_asia'),
  },
  {
    key: 'south_eastern_asia',
    label: i18n.t('network.continent.south_eastern_asia'),
  },
  {
    key: 'western_asia',
    label: i18n.t('network.continent.western_asia'),
  },
  {
    key: 'sentral_asia',
    label: i18n.t('network.continent.sentral_asia'),
  },
  {
    key: 'eastern_europe',
    label: i18n.t('network.continent.eastern_europe'),
  },
  {
    key: 'southern_europe',
    label: i18n.t('network.continent.southern_europe'),
  },
  {
    key: 'western_europe',
    label: i18n.t('network.continent.western_europe'),
  },
  {
    key: 'northern_europe',
    label: i18n.t('network.continent.northern_europe'),
  },
  {
    key: 'sentral_america',
    label: i18n.t('network.continent.sentral_america'),
  },
  {
    key: 'south_america',
    label: i18n.t('network.continent.south_america'),
  },
  {
    key: 'caribbean',
    label: i18n.t('network.continent.caribbean'),
  },
  {
    key: 'sentral_america',
    label: i18n.t('network.continent.sentral_america'),
  },
  {
    key: 'australia_newzaland',
    label: i18n.t('network.continent.australia_newzaland'),
  },
  {
    key: 'melanesia',
    label: i18n.t('network.continent.melanesia'),
  },
  {
    key: 'micronesia',
    label: i18n.t('network.continent.micronesia'),
  },
  {
    key: 'polynesia',
    label: i18n.t('network.continent.polynesia'),
  },
  {
    key: 'other',
    label: i18n.t('network.continent.other'),
  },
]

export const aliyun_ee_operators = [
  {
    value: 'mobile',
    label: i18n.t('network.dns.chinamobile'),
    children: cn_regions.map(item => {
      return {
        value: `cn_mobile_${item.key}`,
        label: item.label,
        children: provinces.filter(province => province.region === item.key).map(province => {
          return {
            value: `cn_mobile_${province.key}`,
            label: province.label,
          }
        }),
      }
    }),
  },
  {
    value: 'telecom',
    label: i18n.t('network.dns.telecom'),
    children: cn_regions.map(item => {
      return {
        value: `cn_telecom_${item.key}`,
        label: item.label,
        children: provinces.filter(province => province.region === item.key).map(province => {
          return {
            value: `cn_telecom_${province.key}`,
            label: province.label,
          }
        }),
      }
    }),
  },
  {
    value: 'unicom',
    label: i18n.t('network.dns.unicom'),
    children: cn_regions.map(item => {
      return {
        value: `cn_unicom_${item.key}`,
        label: item.label,
        children: provinces.filter(province => province.region === item.key).map(province => {
          return {
            value: `cn_unicom_${province.key}`,
            label: province.label,
          }
        }),
      }
    }),
  },
  {
    value: 'edu',
    label: i18n.t('network.dns.cernet'),
    children: cn_regions.map(item => {
      return {
        value: `cn_edu_${item.key}`,
        label: item.label,
        children: provinces.filter(province => province.region === item.key).map(province => {
          return {
            value: `cn_edu_${province.key}`,
            label: province.label,
          }
        }),
      }
    }),
  },
  {
    value: 'btvn',
    label: i18n.t('network.dns.btvn'),
    children: cn_regions.map(item => {
      return {
        value: `cn_btvn_${item.key}`,
        label: item.label,
        children: provinces.filter(province => province.region === item.key).map(province => {
          return {
            value: `cn_btvn_${province.key}`,
            label: province.label,
          }
        }),
      }
    }),
  },
  {
    value: 'drpeng',
    label: i18n.t('network.dns.drpeng'),
    children: provinces.map(province => {
      return {
        value: `cn_drpeng_${province.key}`,
        label: province.label,
      }
    }),
  },
  {
    value: 'cstnet',
    label: i18n.t('network.dns.cstnet'),
    children: provinces.map(province => {
      return {
        value: `cn_cstnet_${province.key}`,
        label: province.label,
      }
    }),
  },
  {
    value: 'wexchange',
    label: i18n.t('network.dns.wexchange'),
    children: provinces.map(province => {
      return {
        value: `cn_wexchange_${province.key}`,
        label: province.label,
      }
    }),
  },
  {
    value: 'founder',
    label: i18n.t('network.dns.founder'),
    children: provinces.map(province => {
      return {
        value: `cn_founder_${province.key}`,
        label: province.label,
      }
    }),
  },
  {
    value: 'topway',
    label: i18n.t('network.dns.topway'),
  },
  {
    value: 'wasu',
    label: i18n.t('network.dns.wasu'),
  },
  {
    value: 'ocn',
    label: i18n.t('network.dns.ocn'),
  },
  {
    value: 'cnix',
    label: i18n.t('network.dns.cnix'),
  },
  {
    value: 'bgctv',
    label: i18n.t('network.dns.bgctv'),
  },
]

export const aliyun_ee_cloudvendors = [
  {
    value: 'aliyun',
    label: i18n.t('network.text_250'),
    children: [
      {
        value: 'cn_aliyun',
        label: i18n.t('network.dns.mainland'),
        children: [
          { value: 'aliyun_r_cn-beijing', label: i18n.t('network.dns.huabei2') },
          { value: 'aliyun_r_cn-chengdu', label: i18n.t('network.dns.xinan1') },
          { value: 'aliyun_r_cn-guangzhou', label: i18n.t('network.dns.huanan3') },
          { value: 'aliyun_r_cn-hangzhou', label: i18n.t('network.dns.huadong1') },
          { value: 'aliyun_r_cn-heyuan', label: i18n.t('network.dns.huanan2') },
          { value: 'aliyun_r_cn-hongkong', label: i18n.t('network.dns.hongkong') },
          { value: 'aliyun_r_cn-huhehaote', label: i18n.t('network.dns.huabei5') },
          { value: 'aliyun_r_cn-nantong', label: i18n.t('network.dns.nantong') },
          { value: 'aliyun_r_cn-qingdao', label: i18n.t('network.dns.huabei1') },
          { value: 'aliyun_r_cn-shanghai', label: i18n.t('network.dns.huadong2') },
          { value: 'aliyun_r_cn-shenzhen', label: i18n.t('network.dns.huanan1') },
          { value: 'aliyun_r_cn-wulanchabu', label: i18n.t('network.dns.huabei6') },
          { value: 'aliyun_r_cn-zhangjiakou', label: i18n.t('network.dns.huabei3') },
        ],
      },
      {
        value: 'os_aliyun',
        label: i18n.t('network.dns.oversea'),
        children: [
          { value: 'aliyun_r_ap-northeast-1', label: i18n.t('network.dns.dongjing') },
          { value: 'aliyun_r_ap-south-1', label: i18n.t('network.dns.mengmai') },
          { value: 'aliyun_r_ap-southeast-1', label: i18n.t('network.dns.xinjiapo') },
          { value: 'aliyun_r_ap-southeast-2', label: i18n.t('network.dns.xini') },
          { value: 'aliyun_r_ap-southeast-3', label: i18n.t('network.dns.jilongpo') },
          { value: 'aliyun_r_ap-southeast-5', label: i18n.t('network.dns.yajiada') },
          { value: 'aliyun_r_eu-central-1', label: i18n.t('network.dns.falankefu') },
          { value: 'aliyun_r_eu-west-1', label: i18n.t('network.dns.lundun') },
          { value: 'aliyun_r_me-east-1', label: i18n.t('network.dns.dibai') },
          { value: 'aliyun_r_us-east-1', label: i18n.t('network.dns.fujiniya') },
          { value: 'aliyun_r_us-west-1', label: i18n.t('network.dns.guigu') },
        ],
      },
    ],
  },
]

export const aliyun_ee_searchengines = [
  {
    value: 'search',
    label: i18n.t('network.dns.bysearchengine'),
    children: [
      {
        value: 'google',
        label: i18n.t('network.dns.google'),
        children: [
          { value: 'cn_search_google', label: i18n.t('network.dns.mainland') },
          { value: 'os_search_google', label: i18n.t('network.dns.oversea') },
        ],
      },
      {
        value: 'baidu',
        label: i18n.t('network.dns.baidu'),
        children: [
          { value: 'cn_search_baidu', label: i18n.t('network.dns.mainland') },
          { value: 'os_search_baidu', label: i18n.t('network.dns.oversea') },
        ],
      },
      {
        value: 'biying',
        label: i18n.t('network.dns.biying'),
        children: [
          { value: 'cn_search_biying', label: i18n.t('network.dns.mainland') },
          { value: 'os_search_biying', label: i18n.t('network.dns.oversea') },
        ],
      },
      {
        value: 'sougou',
        label: i18n.t('network.dns.sougou'),
        children: [
          { value: 'cn_search_sougou', label: i18n.t('network.dns.mainland') },
          { value: 'os_search_sougou', label: i18n.t('network.dns.oversea') },
        ],
      },
      {
        value: 'qihu',
        label: i18n.t('network.dns.qihu'),
        children: [
          { value: 'cn_search_qihu', label: i18n.t('network.dns.mainland') },
          { value: 'os_search_qihu', label: i18n.t('network.dns.oversea') },
        ],
      },
      {
        value: 'youdao',
        label: i18n.t('network.dns.youdao'),
        children: [
          { value: 'cn_search_youdao', label: i18n.t('network.dns.mainland') },
          { value: 'os_search_youdao', label: i18n.t('network.dns.oversea') },
        ],
      },
      {
        value: 'yahoo',
        label: i18n.t('network.dns.yahoo'),
        children: [
          { value: 'cn_search_yahoo', label: i18n.t('network.dns.mainland') },
          { value: 'os_search_yahoo', label: i18n.t('network.dns.oversea') },
        ],
      },
    ],
  },
]
