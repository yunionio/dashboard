// 此文件用于 general-usage 和 usage 接口的字段映射
import * as R from 'ramda'
import { UNITS, sizestr } from '@/utils/utils'
import i18n from '@/locales'

export const usageMap = {
  cpu: {
    field: {
      used: {
        system: 'all.servers.cpu',
        domain: 'domain.servers.cpu',
        project: 'servers.cpu',
      },
      total: {
        system: ['hosts.cpu', 'hosts.cpu.virtual'],
        domain: ['domain.hosts.cpu', 'domain.hosts.cpu.virtual'],
      },
    },
    unit: i18n.t('common_60'),
  },
  memory: {
    field: {
      used: {
        system: 'all.servers.memory',
        domain: 'domain.servers.memory',
        project: 'servers.memory',
      },
      total: {
        system: ['hosts.memory', 'hosts.memory.virtual'],
        domain: ['domain.hosts.memory', 'domain.hosts.memory.virtual'],
      },
    },
    unit: 'M',
  },
  disk: {
    field: {
      used: {
        system: 'all.disks',
        domain: 'domain.disks',
        project: 'disks',
      },
      total: {
        system: ['storages', 'storages.virtual'],
        domain: ['domain.storages', 'domain.storages.virtual'],
      },
    },
    unit: 'M',
  },
  ip: {
    field: {
      used: {
        system: 'all.nics',
        domain: 'domain.nics',
        project: 'nics',
      },
      total: {
        system: 'all.ports',
        domain: 'domain.ports',
        project: 'ports',
      },
    },
    unit: i18n.t('common_61'),
  },
  host: {
    field: {
      used: {
        system: 'enabled_hosts',
        domain: 'domain.enabled_hosts',
      },
      total: {
        system: 'hosts',
        domain: 'domain.hosts',
      },
    },
    unit: i18n.t('common_62'),
  },
  server: {
    field: {
      total: {
        system: 'all.servers',
        domain: 'domain.servers',
        project: 'servers',
      },
      running: {
        system: 'all.running_servers',
        domain: 'domain.running_servers',
        project: 'running_servers',
      },
      ready: {
        system: 'all.ready_servers',
        domain: 'domain.ready_servers',
        project: 'ready_servers',
      },
      other: {
        system: obj => obj['all.servers'] - (obj['all.running_servers'] + obj['all.ready_servers']),
        domain: obj => obj['domain.servers'] - (obj['domain.running_servers'] + obj['domain.ready_servers']),
        project: obj => obj.servers - (obj.running_servers + obj.ready_servers),
      },
      delete: {
        system: 'all.pending_delete_servers',
        domain: 'domain.pending_delete_servers',
        project: 'pending_delete_servers',
      },
    },
    unit: i18n.t('common_62'),
  },
  baremetal: {
    field: {
      used: {
        system: 'all.servers',
        domain: 'domain.servers',
        project: 'servers',
      },
      total: {
        system: 'baremetals',
        domain: 'domain.baremetals',
      },
    },
    unit: i18n.t('common_62'),
  },
  gpu: {
    field: {
      used: {
        system: 'all.servers.isolated_devices',
        domain: 'domain.servers.isolated_devices',
        project: 'servers.isolated_devices',
      },
      total: {
        system: 'isolated_devices',
        domain: 'domain.isolated_devices',
      },
    },
    unit: i18n.t('common_63'),
  },
  floatingEip: {
    field: {
      used: {
        system: 'all.eip.floating_ip.used',
        domain: 'domain.eip.floating_ip.used',
        project: 'eip.floating_ip.used',
      },
      remain: {
        system: obj => obj['all.eip.floating_ip'] - obj['all.eip.floating_ip.used'],
        domain: obj => obj['domain.eip.floating_ip'] - obj['domain.eip.floating_ip.used'],
        project: obj => obj['eip.floating_ip'] - obj['eip.floating_ip.used'],
      },
      total: {
        system: 'all.eip.floating_ip',
        domain: 'domain.eip.floating_ip',
        project: 'eip.floating_ip',
      },
    },
    unit: i18n.t('common_61'),
  },
  eip: {
    field: {
      used: {
        system: 'all.eip.floating_ip.used',
        domain: 'domain.eip.floating_ip.used',
        project: 'eip.floating_ip.used',
      },
      remain: {
        system: obj => obj['all.eip.floating_ip'] - obj['all.eip.floating_ip.used'],
        domain: obj => obj['domain.eip.floating_ip'] - obj['domain.eip.floating_ip.used'],
        project: obj => obj['eip.floating_ip'] - obj['eip.floating_ip.used'],
      },
      total: {
        system: 'all.eip.floating_ip',
        domain: 'domain.eip.floating_ip',
        project: 'eip.floating_ip',
      },
    },
    unit: i18n.t('common_61'),
  },
  diskCountAttach: {
    field: {
      used: {
        system: 'all.disks.mounted.count',
        domain: 'domain.disks.mounted.count',
        project: 'disks.mounted.count',
      },
      remain: {
        system: 'all.disks.unmounted.count',
        domain: 'domain.disks.unmounted.count',
        project: 'disks.unmounted.count',
      },
      total: {
        system: 'all.disks.count',
        domain: 'domain.disks.count',
        project: 'disks.count',
      },
    },
    unit: 'M',
  },
  diskAttach: {
    field: {
      used: {
        system: 'all.disks.mounted',
        domain: 'domain.disks.mounted',
        project: 'disks.mounted',
      },
      remain: {
        system: 'all.disks.unmounted',
        domain: 'domain.disks.unmounted',
        project: 'disks.unmounted',
      },
      total: {
        system: 'all.disks',
        domain: 'domain.disks',
        project: 'disks',
      },
    },
    unit: 'M',
  },
  diskAttachSsd: {
    field: {
      used: {
        system: 'storages.system.medium_type.ssd_capacity_used',
      },
      remain: {
        system: 'storages.system.medium_type.ssd_capacity_no_used',
      },
      total: {
        system: 'storages.system.medium_type.ssd_capacity',
      },
    },
    unit: 'M',
  },
  diskAttachHdd: {
    field: {
      used: {
        system: 'storages.system.medium_type.hybrid_capacity_used',
      },
      remain: {
        system: 'storages.system.medium_type.hybrid_capacity_no_used',
      },
      total: {
        system: 'storages.system.medium_type.hybrid_capacity',
      },
    },
    unit: 'M',
  },
  image: {
    field: {
      img: {
        system: 'all.img.total.size',
        domain: 'domain.img.total.size',
        project: 'img.total.size',
      },
      iso: {
        system: 'all.iso.total.size',
        domain: 'domain.iso.total.size',
        project: 'iso.total.size',
      },
      total: {
        system: 'all.imgiso.total.size',
        domain: 'domain.imgiso.total.size',
        project: 'imgiso.total.size',
      },
    },
    unit: 'M',
  },
}

// 普通后台和域后台的dashboard字段映射
export const resourceMap = {
  server: {
    field: {
      domain: 'servers',
      project: 'servers',
    },
    unit: i18n.t('common_62'),
  },
  cpu: {
    field: {
      domain: 'domain.servers.cpu',
      project: 'servers.cpu',
    },
    unit: i18n.t('common_60'),
  },
  disk: {
    field: {
      domain: 'disks',
      project: 'disks',
    },
    unit: 'M',
  },
  memory: {
    field: {
      domain: 'domain.servers.memory',
      project: 'servers.memory',
    },
    unit: 'M',
  },
  image: {
    field: {
      domain: 'domain.imgiso.total.count',
      project: 'imgiso.total.count',
    },
    unit: i18n.t('common_61'),
  },
  gpu: {
    field: {
      domain: 'running_servers.isolated_devices',
      project: 'running_servers.isolated_devices',
    },
    unit: i18n.t('common_63'),
  },
  ip: {
    field: {
      domain: 'nics',
      project: 'nics',
    },
    unit: i18n.t('common_61'),
  },
  eip: {
    field: {
      domain: 'eip.used',
      project: 'eip.used',
    },
    unit: i18n.t('common_61'),
  },
}

export const bucketMap = {
  buckets: {
    field: {
      total: {
        system: 'all.buckets',
        domain: 'buckets',
        project: 'buckets',
      },
    },
    label: i18n.t('common_64'),
    unit: i18n.t('common_61'),
  },
  bucketObjects: {
    field: {
      total: {
        system: 'all.bucket_objects',
        domain: 'bucket_objects',
        project: 'bucket_objects',
      },
    },
    label: i18n.t('common_65'),
    unit: i18n.t('common_61'),
  },
  bucketBytes: {
    field: {
      total: {
        system: 'all.bucket_bytes',
        domain: 'bucket_bytes',
        project: 'bucket_bytes',
      },
    },
    label: i18n.t('common_66'),
    unit: 'B',
  },
}

/**
 * @param {String} F eg: cpu、bucketObjects、image
 * @param {Object} resData eg: 后端返回的数据
 * @param {Object} dataMap eg: 数据的map类型，上面几个常量之一
 * @param {String} fieldObjKey eg: total、used
 * @param {string} [scope='project']
 * @param {number} [scale=1024]
 * @returns {Object}
 */
export const getUsageData = (F, resData, dataMap, scope = 'project', scale = 1024) => {
  const data = {}
  const fieldObj = dataMap[F]
  const fieldDetailObj = dataMap[F].field
  R.forEachObjIndexed((value, scopeKey) => {
    const field = value[scope]
    data[scopeKey] = {}
    if (R.is(Function, field)) {
      data[scopeKey].value = field(resData)
      data[scopeKey].formatValue = field(resData)
    } else if (R.is(Array, field)) {
      field.map(usageKey => {
        data[scopeKey].value = resData[usageKey]
        if (UNITS.includes(fieldObj.unit)) {
          data[scopeKey].formatValue = sizestr(resData[usageKey], fieldObj.unit, scale)
        } else {
          data[scopeKey].formatValue = resData[usageKey]
        }
      })
    } else {
      data[scopeKey].value = resData[field]
      if (UNITS.includes(fieldObj.unit)) {
        data[scopeKey].formatValue = sizestr(resData[field], fieldObj.unit, scale)
      } else {
        data[scopeKey].formatValue = resData[field]
      }
    }
  }, fieldDetailObj)
  R.forEachObjIndexed((val, k) => {
    if (R.is(String, val)) {
      data[k] = val
    }
  }, fieldObj)
  return data
}
