import i18n from '@/locales'

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
