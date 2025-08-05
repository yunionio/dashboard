import i18n from '@/locales'

export const healthCheckTypeColumn = () => {
  return {
    field: 'health_check_type',
    title: i18n.t('network.text_420'),
    formatter: ({ row }) => {
      return row.health_check_type || '-'
    },
  }
}

export const healthCheckUriColumn = () => {
  return {
    field: 'health_check_uri',
    title: i18n.t('network.waf.rate_limit_rule_type.http.request.uri.path'),
    formatter: ({ row }) => {
      return row.health_check_uri || '-'
    },
  }
}

export const healthCheckPortColumn = () => {
  return {
    field: 'health_check_port',
    title: i18n.t('network.text_165'),
    formatter: ({ row }) => {
      return row.health_check_port || '-'
    },
  }
}

export const healthCheckDomainColumn = () => {
  return {
    field: 'health_check_domain',
    title: i18n.t('network.text_156'),
    formatter: ({ row }) => {
      return row.health_check_domain || '-'
    },
  }
}

export const healthCheckMethodColumn = () => {
  return {
    field: 'health_check_method',
    title: i18n.t('network.health_check.method'),
    formatter: ({ row }) => {
      return row.health_check_method || '-'
    },
  }
}

export const healthCheckHttpCodeColumn = () => {
  return {
    field: 'health_check_http_code',
    title: i18n.t('network.health_check.http_code'),
    formatter: ({ row }) => {
      return row.health_check_http_code || '-'
    },
  }
}

export const healthCheckIntervalColumn = () => {
  return {
    field: 'health_check_interval',
    title: i18n.t('network.health_check.interval'),
    formatter: ({ row }) => {
      return row.health_check_interval || '-'
    },
  }
}

export const healthCheckTimeoutColumn = () => {
  return {
    field: 'health_check_timeout',
    title: i18n.t('network.health_check.timeout'),
    formatter: ({ row }) => {
      return row.health_check_timeout || '-'
    },
  }
}

export const healthCheckHealthyThresholdColumn = () => {
  return {
    field: 'health_check_rise',
    title: i18n.t('network.health_check.healthy_threshold'),
    formatter: ({ row }) => {
      return row.health_check_rise || '-'
    },
  }
}

export const healthCheckUnhealthyThresholdColumn = () => {
  return {
    field: 'health_check_fall',
    title: i18n.t('network.health_check.unhealthy_threshold'),
    formatter: ({ row }) => {
      return row.health_check_fall || '-'
    },
  }
}
