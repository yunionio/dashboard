export const priorityRuleMap = {
  aws: {
    noSupport: true,
  },
  bingocloud: {
    noSupport: true,
  },
  openstack: {
    noSupport: true,
  },
  aliyun: {
    min: 1,
    max: 100,
  },
  apsara: {
    min: 1,
    max: 100,
  },
  azure: {
    min: 100,
    max: 4096,
    canRepeat: false,
    portSupportComma: true,
  },
  ctyun: {
    min: 1,
    max: 100,
  },
  google: {
    min: 0,
    max: 65536,
  },
  huawei: {
    min: 1,
    max: 100,
  },
  hcso: {
    min: 1,
    max: 100,
  },
  qcloud: {
    min: 0,
    max: 99,
    portSupportComma: true,
    noSupport: true,
  },
  ucloud: {
    min: 1,
    max: 3,
  },
  cloudpods: {
    min: 1,
    max: 100,
    isMaxHigh: true,
    portSupportComma: true,
  },
  onecloud: {
    min: 1,
    max: 100,
    isMaxHigh: true,
    portSupportComma: true,
  },
}
