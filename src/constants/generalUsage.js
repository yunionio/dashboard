// 此文件用于 general-usage 和 usage 接口的字段映射
import * as R from 'ramda'
import { UNITS, sizestr } from '@/utils/utils'
import i18n from '@/locales'

export const usageMap = {
  cpu: {
    field: {
      used: {
        system: 'all.servers.any_pool.cpu',
        domain: 'servers.any_pool.cpu',
        project: 'servers.any_pool.cpu',
      },
      total: {
        system: 'hosts.any_pool.cpu',
        domain: 'hosts.any_pool.cpu',
      },
    },
    unit: i18n.t('common_60'),
  },
  memory: {
    field: {
      used: {
        system: 'all.servers.any_pool.memory',
        domain: 'servers.any_pool.memory',
        project: 'servers.any_pool.memory',
      },
      total: {
        system: 'hosts.any_pool.memory',
        domain: 'hosts.any_pool.memory',
      },
    },
    unit: 'M',
  },
  disk: {
    field: {
      used: {
        system: 'all.disks.any_pool',
        domain: 'disks',
        project: 'disks',
      },
      total: {
        system: 'storages.any_pool',
        domain: 'storages.any_pool',
      },
    },
    unit: 'M',
  },
  ip: {
    field: {
      used: {
        system: 'all.nics',
        domain: 'nics',
        project: 'nics',
      },
      total: {
        system: 'all.ports',
        domain: 'all.ports',
      },
    },
    unit: i18n.t('common_61'),
  },
  host: {
    field: {
      used: {
        system: 'enabled_hosts',
      },
      total: {
        system: 'hosts',
      },
    },
    unit: i18n.t('common_62'),
  },
  server: {
    field: {
      total: {
        system: 'all.servers.any_pool',
        domain: 'servers.any_pool',
        project: 'servers.any_pool',
      },
      running: {
        system: 'all.running_servers.any_pool',
        domain: 'running_servers.any_pool',
        project: 'running_servers.any_pool',
      },
      ready: {
        system: 'all.ready_servers.any_pool',
        domain: 'ready_servers.any_pool',
        project: 'ready_servers.any_pool',
      },
      other: {
        system: obj =>
          obj['all.servers.any_pool'] -
          (obj['all.running_servers.any_pool'] + obj['all.ready_servers.any_pool']),
        domain: obj => obj['servers.any_pool'] - (obj['running_servers.any_pool'] + obj['ready_servers.any_pool']),
        project: obj => obj['servers.any_pool'] - (obj['running_servers.any_pool'] + obj.ready_servers),
      },
      delete: {
        system: 'all.pending_delete_servers.any_pool',
        domain: 'pending_delete_servers.any_pool',
        project: 'pending_delete_servers.any_pool',
      },
    },
    unit: i18n.t('common_62'),
  },
  baremetal: {
    field: {
      used: {
        system: 'all.servers',
        domain: 'servers',
        project: 'servers',
      },
      total: {
        system: 'baremetals',
      },
    },
    unit: i18n.t('common_62'),
  },
  gpu: {
    field: {
      used: {
        system: 'all.servers.any_pool.isolated_devices',
        domain: 'servers.any_pool.isolated_devices',
        project: 'servers.any_pool.isolated_devices',
      },
      total: {
        system: 'isolated_devices.any_pool',
      },
    },
    unit: i18n.t('common_63'),
  },
  eip: {
    field: {
      used: {
        system: 'all.eip.used',
        domain: 'eip.used',
        project: 'eip.used',
      },
      remain: {
        system: obj => obj['all.eip.floating_ip'] - obj['all.eip.floating_ip.used'],
        domain: obj => obj['eip.floating_ip'] - obj['eip.floating_ip.used'],
        project: obj => obj['eip.floating_ip'] - obj['eip.floating_ip.used'],
      },
      total: {
        system: 'all.eip',
        domain: 'eip',
        project: 'eip',
      },
    },
    unit: i18n.t('common_61'),
  },
  diskAttach: {
    field: {
      used: {
        system: 'all.disks.any_pool.attached',
        domain: 'disks.attached',
        project: 'disks.attached',
      },
      remain: {
        system: 'all.disks.any_pool.detached',
        domain: 'disks.detached',
        project: 'disks.detached',
      },
      total: {
        system: 'all.disks.any_pool',
        domain: 'disks',
        project: 'disks',
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
      domain: 'servers.any_pool.cpu',
      project: 'servers.any_pool.cpu',
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
      domain: 'servers.any_pool.memory',
      project: 'servers.any_pool.memory',
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
