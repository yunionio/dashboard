import i18n from '@/locales'

export const getTechStackTableColumn = () => {
  return {
    field: 'tech_stack',
    title: i18n.t('compute.webapp.tech.stack'),
    minWidth: 100,
    formatter: ({ row }) => {
      return row.tech_stack
    },
  }
}

export const getOsTypeTableColumn = () => {
  return {
    field: 'os_type',
    title: i18n.t('compute.webapp.os_type'),
    minWidth: 100,
    formatter: ({ row }) => {
      return row.os_type
    },
  }
}

export const getDomainTableColumn = () => {
  return {
    field: 'hostname',
    title: i18n.t('compute.webapp.domain'),
    minWidth: 100,
    formatter: ({ row }) => {
      return row.hostname
    },
  }
}

export const getIpAddrTableColumn = () => {
  return {
    field: 'ip_addr',
    title: i18n.t('compute.webapp.ip_addr'),
    minWidth: 100,
    formatter: ({ row }) => {
      return row.ip_addr
    },
  }
}

export const getServerFarmTableColumn = () => {
  return {
    field: 'server_farm',
    title: i18n.t('compute.webapp.server_farm'),
    minWidth: 100,
    formatter: ({ row }) => {
      return row.server_farm
    },
  }
}
