export const surpportLb = ['onecloud', 'aliyun', 'qcloud', 'huawei', 'aws']

export const CHARGE_TYPE = {
  postpaid: '按量付费',
  prepaid: '包年包月',
  bandwidth: '带宽费用',
  traffic: '流量费用',
}

export const LB_SPEC = {
  aliyun: [
    { key: 'slb.s1.small', label: '简约型I' },
    { key: 'slb.s2.small', label: '标准型I' },
    { key: 'slb.s2.medium', label: '标准型II' },
    { key: 'slb.s3.small', label: '高阶型I' },
    { key: 'slb.s3.medium', label: '高阶型II' },
    { key: 'slb.s3.large', label: '超强型I' },
  ],
  aws: [
    { key: 'application', label: '应用型' },
    { key: 'network', label: '网络型' },
  ],
}
