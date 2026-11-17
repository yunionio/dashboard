import i18n from '@/locales'

export const EIP_MONITOR_OPTS = [
  {
    name: 'net',
    label: i18n.t('compute.text_524'),
    seleteItem: 'bps_recv',
    as: i18n.t('compute.text_524'),
    fromItem: 'eip_net',
    unit: 'bps',
    transfer: 1024,
    supportBrands: ['aliyun', 'apsara', 'huawei', 'hcso', 'hcs', 'qcloud'],
  },
  {
    name: 'net',
    label: i18n.t('compute.text_525'),
    seleteItem: 'bps_sent',
    as: i18n.t('compute.text_525'),
    fromItem: 'eip_net',
    unit: 'bps',
    transfer: 1024,
    supportBrands: ['aliyun', 'apsara', 'huawei', 'hcso', 'hcs', 'qcloud'],
  },
  {
    name: 'net',
    label: i18n.t('network.eip.drop_speed_rx'),
    seleteItem: 'drop_speed_rx',
    as: i18n.t('network.eip.drop_speed_rx'),
    fromItem: 'eip_net',
    unit: 'pps',
    transfer: 1,
    supportBrands: ['aliyun', 'apsara'],
  },
]

export const ASSOCIATE_MAP = {
  server: {
    name: i18n.t('network.text_226'),
    permission: 'server_get',
    sidePage: 'VmInstanceSidePage',
    tab: 'vm-instance-detail',
  },
  loadbalancer: {
    name: i18n.t('network.text_137'),
    permission: 'lb_loadbalancers_get',
    sidePage: 'LbSidePage',
    tab: 'lb-detail',
  },
  instancegroup: {
    name: i18n.t('dictionary.instancegroup'),
    permission: 'instancegroups_get',
    sidePage: 'InstanceGroupSidePage',
    tab: 'instance-group-detail',
  },
  natgateway: {
    name: i18n.t('network.text_227'),
    permission: 'natgateways_get',
    sidePage: 'NatSidePage',
    tab: 'nat-detail',
  },
}
