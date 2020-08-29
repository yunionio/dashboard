import i18n from '@/locales'

export const getZoneTypeTableColumns = () => {
  return {
    field: 'zone_type',
    title: i18n.t('network.text_717'),
  }
}

export const getVpcCountTableColumns = () => {
  return {
    field: 'vpc_count',
    title: i18n.t('network.text_719'),
  }
}

export const getDnsRecordsetCountTableColumns = () => {
  return {
    field: 'dns_recordset_count',
    title: i18n.t('network.text_718'),
  }
}
