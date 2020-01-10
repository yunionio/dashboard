import * as R from 'ramda'
import store from '@/store'
import { hasPermission } from '@/utils/auth'

export const getSearchMaps = (searchRes = {}) => {
  const commonSearchQuery = {
    scope: store.getters.scope,
    limit: 20,
    details: true,
  }
  let getFilter = searchType => {
    const res = searchRes[searchType]
    if (!res) return ''
    let filter = ''
    if (R.is(Array, res)) {
      res.forEach(val => {
        filter += `"${val},"`
      })
    }
    if (filter) {
      filter = filter.slice(0, -1) // 去掉结尾,
    }
    return res
  }
  const maps = {
    servers: {
      res_name: 'servers',
      label: '虚拟机',
      id: 'servers',
      component: 'VmInstanceList',
      hasPermission: hasPermission({ key: 'servers_list' }),
      showIp: true, // 展示IP
      params: {
        ...commonSearchQuery,
        with_meta: true,
        filter: ['hypervisor.notin(baremetal,container)', `name.contains(${getFilter('name')})`],
        joint_filter: `guestnetworks.guest_id(id).ip_addr.contains(${getFilter('ip')})`,
      },
      resData: {}, // 查询结果
    },
    baremetals: {
      res_name: 'servers',
      label: '裸金属服务器',
      id: 'baremetals',
      component: 'BaremetalList',
      hasPermission: hasPermission({ key: 'servers_list' }),
      showIp: true, // 展示IP
      params: {
        ...commonSearchQuery,
        hypervisor: 'baremetal',
        with_meta: true,
        filter: `name.contains(${getFilter('name')})`,
        joint_filter: `guestnetworks.guest_id(id).ip_addr.contains(${getFilter('ip')})`,
      },
      resData: {},
    },
    images: {
      res_name: 'images',
      label: '系统镜像',
      id: 'images',
      component: 'ImageList',
      hasPermission: hasPermission({ key: 'images_list' }),
      params: {
        ...commonSearchQuery,
        is_guest_image: false,
        filter: `name.contains(${getFilter('name')})`,
      },
      resData: {},
    },
    guestimages: {
      res_name: 'guestimages',
      label: '主机镜像',
      id: 'guestimages',
      component: 'HostImageList',
      hasPermission: hasPermission({ key: 'guestimages_list' }),
      params: {
        ...commonSearchQuery,
        is_guest_image: true,
        filter: `name.contains(${getFilter('name')})`,
      },
      resData: {},
    },
    disks: {
      res_name: 'disks',
      label: '硬盘',
      id: 'disks',
      component: 'DiskList',
      hasPermission: hasPermission({ key: 'disks_list' }),
      params: {
        ...commonSearchQuery,
        is_guest_image: true,
        filter: ['disk_type.notin(volume)', `name.contains(${getFilter('name')})`],
      },
      resData: {},
    },
    diskSnapshots: {
      res_name: 'snapshots',
      label: '硬盘快照',
      id: 'diskSnapshots',
      component: 'VmDiskSnapshotsIndex',
      hasPermission: hasPermission({ key: 'snapshots_list' }),
      params: {
        ...commonSearchQuery,
        with_meta: true,
        is_instance_snapshot: false,
        filter: `name.contains(${getFilter('name')})`,
      },
      resData: {},
    },
    instanceSnapshots: {
      res_name: 'instance_snapshots',
      label: '主机快照',
      id: 'instanceSnapshots',
      component: 'VmInstanceSnapshotsIndex',
      hasPermission: hasPermission({ key: 'instance_snapshots_list' }),
      params: {
        ...commonSearchQuery,
        filter: `name.contains(${getFilter('name')})`,
      },
      resData: {},
    },
    secgroups: {
      res_name: 'secgroups',
      label: '安全组',
      id: 'secgroups',
      component: 'SecgroupList',
      hasPermission: hasPermission({ key: 'secgroups_list' }),
      params: {
        ...commonSearchQuery,
        filter: `name.contains(${getFilter('name')})`,
      },
      resData: {},
    },
    eips: {
      res_name: 'eips',
      label: '弹性公网IP',
      id: 'eips',
      component: 'EipList',
      hasPermission: hasPermission({ key: 'eips_list' }),
      showIp: true, // 展示IP
      params: {
        name: {
          ...commonSearchQuery,
          filter: [`name.contains(${getFilter('name')})`, `ip_addr.contains("${getFilter('ip')}")`],
        },
      },
      resData: {},
    },
    networkinterfaces: {
      res_name: 'networkinterfaces',
      label: '弹性网卡',
      id: 'networkinterfaces',
      component: 'FlexNetworkList',
      hasPermission: hasPermission({ key: 'networkcard_list' }),
      showIp: true, // 展示IP
      params: {
        ...commonSearchQuery,
        filter: `name.contains(${getFilter('name')})`,
      },
      resData: {},
    },
    networks: {
      res_name: 'networks',
      label: 'IP子网',
      id: 'networks',
      component: 'NetworkList',
      hasPermission: hasPermission({ key: 'networks_list' }),
      showIp: true, // 展示IP
      params: {
        ...commonSearchQuery,
        filter: `name.contains(${getFilter('name')})`,
        ip: getFilter('ip'),
      },
      resData: {},
    },
    hosts: {
      res_name: 'hosts',
      label: '宿主机',
      id: 'hosts',
      component: 'HostList',
      hasPermission: hasPermission({ key: 'hosts_list' }),
      showIp: true, // 展示IP
      params: {
        ...commonSearchQuery,
        baremetal: false,
        filter: [`name.contains(${getFilter('name')})`, `access_ip.contains("${getFilter('ip')}")`],
      },
      resData: {},
    },
    physicalmachines: {
      res_name: 'hosts',
      label: '物理机',
      id: 'physicalmachines',
      component: 'PhysicalmachineList',
      hasPermission: hasPermission({ key: 'hosts_list' }),
      showIp: true, // 展示IP
      params: {
        ...commonSearchQuery,
        baremetal: true,
        host_type: 'baremetal',
        with_meta: true,
        filter: [`name.contains(${getFilter('name')})`, `access_ip.contains("${getFilter('ip')}")`],
      },
      resData: {},
    },
    rds: {
      res_name: 'dbinstances',
      label: 'RDS',
      id: 'rds',
      component: 'RDSList',
      hasPermission: hasPermission({ key: 'rds_dbinstances_list' }),
      params: {
        ...commonSearchQuery,
        filter: `name.contains(${getFilter('name')})`,
      },
      resData: {},
    },
    redis: {
      res_name: 'elasticcaches',
      label: 'Redis',
      id: 'redis',
      component: 'RedisList',
      hasPermission: hasPermission({ key: 'redis_elasticcaches_list' }),
      params: {
        ...commonSearchQuery,
        filter: `name.contains(${getFilter('name')})`,
      },
      resData: {},
    },
    deleteServers: {
      res_name: 'servers',
      label: '主机（回收站）',
      id: 'deleteServers',
      component: 'ServerRecoveryList',
      hasPermission: hasPermission({ key: 'servers_list' }),
      params: {
        ...commonSearchQuery,
        with_meta: true,
        pending_delete: true,
        filter: `name.contains(${getFilter('name')})`,
      },
      resData: {},
    },
    deleteDisks: {
      res_name: 'disks',
      label: '硬盘（回收站）',
      id: 'deleteDisks',
      component: 'DiskRecoveryList',
      hasPermission: hasPermission({ key: 'disks_list' }),
      params: {
        ...commonSearchQuery,
        with_meta: true,
        pending_delete: true,
        filter: `name.contains(${getFilter('name')})`,
      },
      resData: {},
    },
    deleteImages: {
      res_name: 'images',
      label: '镜像（回收站）',
      id: 'deleteImages',
      component: 'ImageRecoveryList',
      hasPermission: hasPermission({ key: 'images_list' }),
      params: {
        ...commonSearchQuery,
        is_guest_image: false,
        pending_delete: true,
        filter: `name.contains(${getFilter('name')})`,
      },
      resData: {},
    },
  }
  const validMaps = R.filter(val => {
    if (val.hasPermission !== false) { // 权限通过
      if (searchRes.ip) {
        return val.showIp
      } else {
        return true
      }
    }
  }, maps)
  return validMaps
}
