import i18n from '@/locales'
export const surpportLb = ['onecloud', 'aliyun', 'qcloud', 'huawei', 'aws', 'openstack']

export const CHARGE_TYPE = {
  postpaid: i18n.t('network.text_256'),
  prepaid: i18n.t('network.text_257'),
  bandwidth: i18n.t('network.text_258'),
  traffic: i18n.t('network.text_259'),
}

export const LB_SPEC = {
  aliyun: [
    { key: 'slb.s1.small', label: i18n.t('network.text_260') },
    { key: 'slb.s2.small', label: i18n.t('network.text_261') },
    { key: 'slb.s2.medium', label: i18n.t('network.text_262') },
    { key: 'slb.s3.small', label: i18n.t('network.text_263') },
    { key: 'slb.s3.medium', label: i18n.t('network.text_264') },
    { key: 'slb.s3.large', label: i18n.t('network.text_265') },
  ],
  aws: [
    { key: 'application', label: i18n.t('network.text_266') },
    { key: 'network', label: i18n.t('network.text_267') },
  ],
}
