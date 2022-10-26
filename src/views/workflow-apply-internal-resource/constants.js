import i18n from '@/locales'

const COUNTRYS_LIST = ['本市级', '鹿城区', '龙湾区', '瓯海区', '洞头区', '瑞安市', '乐清市', '永嘉县', '平阳县', '苍南县', '文成县', '泰顺县']

export const COUNTRYS = COUNTRYS_LIST.map(text => {
  return {
    id: text,
    name: text,
  }
})

export const INIT_UNIT_INFO = {
  country: '本市级',
  group_name: '',
  group_code: '',
  contact_name: '',
  contact_phone: '',
  email: '',
  fill_form_date: '',
  customer_name: '',
  customer_phone: '',
}

export const WORKFLOW_ITEM_MAP = {
  country: {
    type: 'select',
    required: true,
    label: i18n.t('wz_workflow_form.labels.country'),
  },
  group_name: {
    type: 'input',
    required: true,
    label: i18n.t('wz_workflow_form.labels.group_name'),
  },
  group_code: {
    type: 'input',
    required: true,
    label: i18n.t('wz_workflow_form.labels.group_code'),
  },
  contact_name: {
    type: 'input',
    required: true,
    label: i18n.t('wz_workflow_form.labels.contact_name'),
  },
  contact_phone: {
    type: 'input',
    required: true,
    label: i18n.t('wz_workflow_form.labels.contact_phone'),
    validator: (vm) => { return vm.$validate('phone') },
  },
  email: {
    type: 'input',
    required: true,
    label: i18n.t('wz_workflow_form.labels.email'),
    validator: (vm) => { return vm.$validate('email') },
  },
  fill_form_date: {
    type: 'date',
    required: true,
    label: i18n.t('wz_workflow_form.labels.fill_form_date'),
  },
  customer_name: {
    type: 'input',
    required: true,
    label: i18n.t('wz_workflow_form.labels.customer_name'),
  },
  customer_phone: {
    type: 'input',
    required: true,
    label: i18n.t('wz_workflow_form.labels.customer_phone'),
    validator: (vm) => { return vm.$validate('phone') },
  },
  project_name: {
    type: 'input',
    required: true,
    label: i18n.t('wz_workflow_form.labels.project_name'),
  },
  business_description: {
    type: 'input',
    required: false,
    label: i18n.t('wz_workflow_form.labels.business_description'),
  },
  network_type: {
    type: 'select',
    required: true,
    label: i18n.t('wz_workflow_form.labels.network_type'),
  },
  level: {
    type: 'select',
    required: true,
    label: i18n.t('wz_workflow_form.labels.level'),
  },
  start_date: {
    type: 'date',
    required: true,
    label: i18n.t('wz_workflow_form.labels.start_date'),
  },
  end_date: {
    type: 'date',
    required: true,
    label: i18n.t('wz_workflow_form.labels.end_date'),
  },
  contractor_name: {
    type: 'input',
    required: false,
    label: i18n.t('wz_workflow_form.labels.contractor_name'),
  },
  contractor_people: {
    type: 'input',
    required: false,
    label: i18n.t('wz_workflow_form.labels.contractor_people'),
  },
  contractor_phone: {
    type: 'input',
    required: false,
    label: i18n.t('wz_workflow_form.labels.contractor_phone'),
    validator: (vm) => { return vm.$validate('phone', false) },
  },
  server_name: {
    type: 'input',
    required: true,
    label: i18n.t('wz_workflow_form.labels.server_name'),
  },
  cpu: {
    type: 'select',
    required: true,
    label: i18n.t('wz_workflow_form.labels.cpu'),
  },
  mem: {
    type: 'select',
    required: true,
    label: i18n.t('wz_workflow_form.labels.mem'),
  },
  data_disk: {
    type: 'select',
    required: true,
    label: i18n.t('wz_workflow_form.labels.data_disk'),
  },
  os: {
    type: 'select',
    required: true,
    label: i18n.t('wz_workflow_form.labels.os'),
  },
  count: {
    type: 'input',
    required: true,
    label: i18n.t('wz_workflow_form.labels.count'),
  },
  bandwidth: {
    type: 'select',
    required: false,
    label: i18n.t('wz_workflow_form.labels.bandwidth'),
  },
  use_to: {
    type: 'input',
    required: true,
    label: i18n.t('wz_workflow_form.labels.use_to'),
  },
  comment: {
    type: 'input',
    required: false,
    label: i18n.t('wz_workflow_form.labels.comment'),
  },
  db_name: {
    type: 'input',
    required: true,
    label: i18n.t('wz_workflow_form.labels.db_name'),
  },
  db_type: {
    type: 'select',
    required: true,
    label: i18n.t('wz_workflow_form.labels.db_type'),
  },
  max_connects: {
    type: 'select',
    required: true,
    label: i18n.t('wz_workflow_form.labels.max_connects'),
  },
  // data_disk: '数据盘（G）',
  // count: '数量（台）',
  // comment: '备注',
  oss_storage_count: {
    type: 'input',
    required: true,
    label: i18n.t('wz_workflow_form.labels.oss_storage_count'),
  },
  oss_storage_comment: {
    type: 'input',
    required: false,
    label: i18n.t('wz_workflow_form.labels.oss_storage_comment'),
  },
  nas_storage_count: {
    type: 'input',
    required: true,
    label: i18n.t('wz_workflow_form.labels.nas_storage_count'),
  },
  nas_storage_comment: {
    type: 'input',
    required: false,
    label: i18n.t('wz_workflow_form.labels.nas_storage_comment'),
  },
  lb_count: {
    type: 'input',
    required: true,
    label: i18n.t('wz_workflow_form.labels.lb_count'),
  },
  backup_count: {
    type: 'input',
    required: true,
    label: i18n.t('wz_workflow_form.labels.backup_count'),
  },
  backup_comment: {
    type: 'input',
    required: false,
    label: i18n.t('wz_workflow_form.labels.backup_comment'),
  },
  data_exchange_service_client: {
    type: 'input',
    required: true,
    label: i18n.t('wz_workflow_form.labels.data_exchange_service_client'),
  },
  data_exchange_service_comment: {
    type: 'input',
    required: false,
    label: i18n.t('wz_workflow_form.labels.data_exchange_service_comment'),
  },
  active_vulnerability_scanning: {
    type: 'input',
    required: true,
    label: i18n.t('wz_workflow_form.labels.active_vulnerability_scanning'),
  },
  intrusion_prevention: {
    type: 'input',
    required: true,
    label: i18n.t('wz_workflow_form.labels.intrusion_prevention'),
  },
  anti_ddos: {
    type: 'input',
    required: true,
    label: i18n.t('wz_workflow_form.labels.anti_ddos'),
  },
  website_monitoring: {
    type: 'input',
    required: true,
    label: i18n.t('wz_workflow_form.labels.website_monitoring'),
  },
  website_vulnerability_scanning: {
    type: 'input',
    required: true,
    label: i18n.t('wz_workflow_form.labels.website_vulnerability_scanning'),
  },
  webpage_tamper_proof: {
    type: 'input',
    required: true,
    label: i18n.t('wz_workflow_form.labels.webpage_tamper_proof'),
  },
  web_application_firewall: {
    type: 'input',
    required: true,
    label: i18n.t('wz_workflow_form.labels.web_application_firewall'),
  },
  virus_protection: {
    type: 'input',
    required: true,
    label: i18n.t('wz_workflow_form.labels.virus_protection'),
  },
  terminal_decection_res_system: {
    type: 'input',
    required: true,
    label: i18n.t('wz_workflow_form.labels.terminal_decection_res_system'),
  },
  host_risk_scanning: {
    type: 'input',
    required: true,
    label: i18n.t('wz_workflow_form.labels.host_risk_scanning'),
  },
  firewall: {
    type: 'input',
    required: true,
    label: i18n.t('wz_workflow_form.labels.firewall'),
  },
  // intrusion_prevention: '入侵防护',
  intrusion_cetection: {
    type: 'input',
    required: true,
    label: i18n.t('wz_workflow_form.labels.intrusion_cetection'),
  },
  network_audit: {
    type: 'input',
    required: true,
    label: i18n.t('wz_workflow_form.labels.network_audit'),
  },
  fortress_machine: {
    type: 'input',
    required: true,
    label: i18n.t('wz_workflow_form.labels.fortress_machine'),
  },
  db_audit: {
    type: 'input',
    required: true,
    label: i18n.t('wz_workflow_form.labels.db_audit'),
  },
  log_audit: {
    type: 'input',
    required: true,
    label: i18n.t('wz_workflow_form.labels.log_audit'),
  },
}

export const INIT_PROJECT_INFO = {
  project_name: '',
  business_description: '',
  network_type: 'network',
  level: 'none',
  start_date: '',
  end_date: '',
}

export const INIT_CONTRACTOR_INFO = {
  contractor_name: '',
  contractor_people: '',
  contractor_phone: '',
}

export const INIT_ECS = {
  server_name: '',
  cpu: '1c',
  mem: '100',
  data_disk: '100',
  os: 'linux',
  count: 1,
  bandwidth: '',
  use_to: '',
  comment: '',
}

export const INIT_RDS = {
  db_name: '',
  db_type: '',
  max_connects: '',
  data_disk: '',
  count: 1,
  comment: '',
}

export const INIT_SERVER = {
  oss_storage_count: 1,
  oss_storage_comment: '',
  nas_storage_count: 1,
  nas_storage_comment: '',
  lb_count: 1,
  backup_count: 1,
  backup_comment: '',
  data_exchange_service_client: '',
  data_exchange_service_comment: '',
}

export const INIT_BASIC_SECURITY_SERVICES = {
  active_vulnerability_scanning: 1,
  intrusion_prevention: 1,
  anti_ddos: 1,
}

export const INIT_CLOUD_SECURITY_TABLE = {
  website_monitoring: 1,
  website_vulnerability_scanning: 1,
  webpage_tamper_proof: 1,
  web_application_firewall: '',
  virus_protection: '',
  terminal_decection_res_system: '',
  host_risk_scanning: '',
  firewall: '',
  intrusion_prevention: '',
  intrusion_cetection: '',
  network_audit: '',
  fortress_machine: '',
  db_audit: '',
  log_audit: '',
}

export const INIT_APPLY_INTERNAL_RESOURCE_DATA = {
  unitInfo: INIT_UNIT_INFO,
  projectInfo: INIT_PROJECT_INFO,
  contractorInfo: INIT_CONTRACTOR_INFO,
  cloudResourceInfo: {
    ecs: [],
    rds: [],
    server: [],
  },
  cloudSecurityInfo: {
    basicSecurityServices: [],
    cloudSecurityTable: [],
  },
}

export const ECS_SELECT_OPTIONS = {
  cpu: [{ id: '1c', name: '1c' }, { id: '2c', name: '2c' }],
  mem: [{ id: 100, name: '100' }],
  data_disk: [{ id: 100, name: '100' }],
  os: [{ id: 'linux', name: 'Linux' }, { id: 'windows', name: 'Windows' }],
  bandwidth: [{ id: '100M', name: '100M' }],
}

export const RDS_SELECT_OPTIONS = {
  db_type: [{ id: 'mysql', name: 'MySQL' }, { id: 'sqlserver', name: 'SQL Server' }],
  max_connects: [{ id: 100, name: '100' }],
}

export const COLUMNS_MAP = {
  ecs: Object.keys(INIT_ECS).map(key => {
    return {
      field: key,
      title: WORKFLOW_ITEM_MAP[key]?.label || key,
      minWidth: '100px',
    }
  }),
  rds: Object.keys(INIT_RDS).map(key => {
    return {
      field: key,
      title: WORKFLOW_ITEM_MAP[key]?.label || key,
      minWidth: '100px',
    }
  }),
  server: Object.keys(INIT_SERVER).map(key => {
    return {
      field: key,
      title: WORKFLOW_ITEM_MAP[key]?.label || key,
      minWidth: '100px',
    }
  }),
  basicSecurityServices: Object.keys(INIT_BASIC_SECURITY_SERVICES).map(key => {
    return {
      field: key,
      title: WORKFLOW_ITEM_MAP[key]?.label || key,
      minWidth: '100px',
    }
  }),
  cloudSecurityTable: Object.keys(INIT_CLOUD_SECURITY_TABLE).map(key => {
    return {
      field: key,
      title: WORKFLOW_ITEM_MAP[key]?.label || key,
      minWidth: '100px',
    }
  }),
}

export const getPlaceholder = (field) => {
  const target = WORKFLOW_ITEM_MAP[field]

  const { type = 'input' } = target
  if (type === 'input') {
    return i18n.t('common.tips.input', [target.label])
  } else {
    return i18n.t('common.tips.select', [target.label])
  }
}
export const getWorkflowFormRules = (vm) => {
  const workflow_item_rule_map = {
    unitInfo: {},
    projectInfo: {},
    contractorInfo: {},
    others: {},
  }
  const workflowItemKeys = Object.keys(WORKFLOW_ITEM_MAP)
  workflowItemKeys.map(key => {
    const rules = [{ required: WORKFLOW_ITEM_MAP[key].required || false, message: getPlaceholder(key), trigger: 'change' }]
    if (WORKFLOW_ITEM_MAP[key].validator) {
      rules.push({ validator: WORKFLOW_ITEM_MAP[key].validator(vm) })
    }
    if (INIT_UNIT_INFO.hasOwnProperty(key)) {
      workflow_item_rule_map.unitInfo[key] = rules
    }
    if (INIT_PROJECT_INFO.hasOwnProperty(key)) {
      workflow_item_rule_map.projectInfo[key] = rules
    }
    if (INIT_CONTRACTOR_INFO.hasOwnProperty(key)) {
      workflow_item_rule_map.contractorInfo[key] = rules
    }
    if (INIT_ECS.hasOwnProperty(key) || INIT_ECS.hasOwnProperty(key) || INIT_SERVER.hasOwnProperty(key) || INIT_BASIC_SECURITY_SERVICES.hasOwnProperty(key) || INIT_CLOUD_SECURITY_TABLE.hasOwnProperty(key)) {
      workflow_item_rule_map.others[key] = rules
    }
  })
  return workflow_item_rule_map
}
