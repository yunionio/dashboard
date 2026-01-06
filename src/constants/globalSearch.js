import * as R from 'ramda'
import i18n from '@/locales'
import store from '@/store'
import { hasPermission } from '@/utils/auth'
import { changeToArr } from '@/utils/utils'

export const getSearchMaps = (searchRes = {}) => {
  const commonSearchQuery = {
    scope: store.getters.scope,
    limit: 20,
    details: true,
    with_meta: true,
  }
  const getFilter = (searchType, symbol = '"') => {
    const res = searchRes[searchType]
    if (!res) return ''
    let filter = ''
    if (R.is(Array, res)) {
      res.forEach((val, i, arr) => {
        if (i === arr.length - 1) {
          filter += `${symbol}${val}${symbol}`
        } else {
          filter += `${symbol}${val}${symbol},`
        }
      })
    }
    return filter
  }

  const getParams = itemParams => {
    let params = { ...itemParams.common }
    const searchTypes = Object.keys(searchRes)
    const surportType = searchTypes.every(type => !!itemParams[type])
    searchTypes.forEach(type => {
      const typeParams = itemParams[type]
      if (R.is(Object, typeParams)) {
        if (params.filter && typeParams.filter) {
          const paramsFilter = changeToArr(params.filter)
          params.filter = paramsFilter.concat(typeParams.filter)
          delete typeParams.filter // 因为上面代码已经合并过了，这里删除防止被覆盖
        }
        params = Object.assign(params, typeParams)
      }
    })
    return { params, surportType }
  }

  const normalizeIp = (s) => {
    var r = /^([0-9]{1,3}\.){0,3}[0-9]{1,3}$/
    if (r.test(s)) {
      return s
    } else {
      return '0.0.0.0'
    }
  }

  const maps = {
    servers: {
      res_name: 'servers',
      menu_key: 'vminstance',
      label: i18n.t('dictionary.server'),
      id: 'servers',
      component: 'VmInstanceList',
      hasPermission: hasPermission({ key: 'servers_list' }),
      params: {
        common: {
          ...commonSearchQuery,
          filter: 'hypervisor.notin(baremetal,container)',
        },
        name: {
          filter: `name.contains(${getFilter('name')})`,
        },
        ip: {
          // joint_filter: `guestnetworks.guest_id(id).ip_addr.contains(${getFilter('ip')})`,
          ip_addr: searchRes.ip ? searchRes.ip[0] : '',
        },
        id: {
          id: searchRes.id,
        },
        external_id: {
          filter: `external_id.equals(${searchRes.external_id})`,
        },
      },
      resData: {}, // 查询结果
    },
    serverTemplates: {
      res_name: 'servertemplates',
      menu_key: 'servertemplate',
      label: i18n.t('dictionary.servertemplate'),
      id: 'serverTemplates',
      component: 'ServertemplateList',
      hasPermission: hasPermission({ key: 'servertemplates_list' }),
      params: {
        common: {
          ...commonSearchQuery,
          with_meta: true,
        },
        name: {
          filter: `name.contains(${getFilter('name')})`,
        },
        id: {
          id: searchRes.id,
        },
      },
      resData: {}, // 查询结果
    },
    baremetals: {
      menu_key: 'baremetal',
      res_name: 'servers',
      label: i18n.t('dictionary.baremetal'),
      id: 'baremetals',
      component: 'BaremetalList',
      hasPermission: hasPermission({ key: 'servers_list' }),
      params: {
        common: {
          ...commonSearchQuery,
          hypervisor: 'baremetal',
          with_meta: true,
        },
        name: {
          filter: `name.contains(${getFilter('name')})`,
        },
        ip: {
          joint_filter: `guestnetworks.guest_id(id).ip_addr.contains(${getFilter('ip')})`,
        },
        id: {
          id: searchRes.id,
        },
        external_id: {
          filter: `external_id.equals(${searchRes.external_id})`,
        },
      },
      resData: {},
    },
    images: {
      menu_key: 'image',
      res_name: 'images',
      label: i18n.t('dictionary.image'),
      id: 'images',
      component: 'ImageList',
      hasPermission: hasPermission({ key: 'images_list' }),
      params: {
        common: {
          ...commonSearchQuery,
          is_guest_image: false,
        },
        name: {
          filter: `name.contains(${getFilter('name')})`,
        },
        id: {
          id: searchRes.id,
        },
      },
      resData: {},
    },
    guestimages: {
      menu_key: 'image',
      res_name: 'guestimages',
      label: i18n.t('dictionary.guestimage'),
      id: 'guestimages',
      component: 'HostImageList',
      hasPermission: hasPermission({ key: 'guestimages_list' }),
      params: {
        common: {
          ...commonSearchQuery,
          is_guest_image: true,
        },
        name: {
          filter: `name.contains(${getFilter('name')})`,
        },
        id: {
          id: searchRes.id,
        },
      },
      resData: {},
    },
    disks: {
      menu_key: 'disk',
      res_name: 'disks',
      label: i18n.t('dictionary.disk'),
      id: 'disks',
      component: 'DiskList',
      hasPermission: hasPermission({ key: 'disks_list' }),
      params: {
        common: {
          ...commonSearchQuery,
          is_guest_image: true,
          filter: 'disk_type.notin(volume)',
        },
        name: {
          filter: `name.contains(${getFilter('name')})`,
        },
        id: {
          id: searchRes.id,
        },
        external_id: {
          filter: `external_id.equals(${searchRes.external_id})`,
        },
      },
      resData: {},
    },
    diskSnapshots: {
      menu_key: 'disk_snapshot',
      res_name: 'snapshots',
      label: i18n.t('dictionary.disk_snapshots'),
      id: 'diskSnapshots',
      component: 'SnapshotList',
      hasPermission: hasPermission({ key: 'snapshots_list' }),
      params: {
        common: {
          ...commonSearchQuery,
          with_meta: true,
          is_instance_snapshot: false,
        },
        name: {
          filter: `name.contains(${getFilter('name')})`,
        },
        id: {
          id: searchRes.id,
        },
        external_id: {
          filter: `external_id.equals(${searchRes.external_id})`,
        },
      },
      resData: {},
    },
    snapshotPolicies: {
      menu_key: 'snapshotpolicy',
      res_name: 'snapshotpolicies',
      label: i18n.t('dictionary.snapshotpolicy'),
      id: 'snapshotPolicies',
      component: 'SnapshotPolicyList',
      hasPermission: hasPermission({ key: 'snapshotpolicy_list' }),
      params: {
        common: {
          ...commonSearchQuery,
          with_meta: true,
        },
        name: {
          filter: `name.contains(${getFilter('name')})`,
        },
        id: {
          id: searchRes.id,
        },
      },
      resData: {},
    },
    instanceSnapshots: {
      menu_key: 'instance_snapshot',
      res_name: 'instance_snapshots',
      label: i18n.t('common.text00023'),
      id: 'instanceSnapshots',
      component: 'InstanceSnapshotList',
      hasPermission: hasPermission({ key: 'instance_snapshots_list' }),
      params: {
        common: {
          ...commonSearchQuery,
        },
        name: {
          filter: `name.contains(${getFilter('name')})`,
        },
        id: {
          id: searchRes.id,
        },
        external_id: {
          filter: `external_id.equals(${searchRes.external_id})`,
        },
      },
      resData: {},
    },
    secgroups: {
      menu_key: 'secgroup',
      res_name: 'secgroups',
      label: i18n.t('dictionary.secgroup'),
      id: 'secgroups',
      component: 'SecgroupList',
      hasPermission: hasPermission({ key: 'secgroups_list' }),
      params: {
        common: {
          ...commonSearchQuery,
        },
        name: {
          filter: `name.contains(${getFilter('name')})`,
        },
        id: {
          id: searchRes.id,
        },
      },
      resData: {},
    },
    eips: {
      menu_key: 'eip2',
      res_name: 'eips',
      label: i18n.t('dictionary.eip'),
      id: 'eips',
      component: 'EipList',
      hasPermission: hasPermission({ key: 'eips_list' }),
      params: {
        common: {
          ...commonSearchQuery,
        },
        name: {
          filter: `name.contains(${getFilter('name')})`,
        },
        ip: {
          filter: `ip_addr.contains(${getFilter('ip')})`,
        },
        id: {
          id: searchRes.id,
        },
        external_id: {
          filter: `external_id.equals(${searchRes.external_id})`,
        },
      },
      resData: {},
    },
    // networkinterfaces: {
    //   res_name: 'networkinterfaces',
    //   label: i18n.t('dictionary.networkinterface'),
    //   id: 'networkinterfaces',
    //   component: 'FlexNetworkList',
    //   hasPermission: hasPermission({ key: 'networkcard_list' }),
    //   params: {
    //     common: {
    //       ...commonSearchQuery,
    //     },
    //     name: {
    //       filter: `name.contains(${getFilter('name')})`,
    //     },
    //     id: {
    //       id: searchRes.id,
    //     },
    //     external_id: {
    //       filter: `external_id.equals(${searchRes.external_id})`,
    //     },
    //   },
    //   resData: {},
    // },
    networks: {
      menu_key: 'network2',
      res_name: 'networks',
      label: i18n.t('dictionary.network'),
      id: 'networks',
      component: 'NetworkList',
      hasPermission: hasPermission({ key: 'networks_list' }),
      params: {
        common: {
          ...commonSearchQuery,
        },
        name: {
          filter: `name.contains(${getFilter('name')})`,
        },
        ip: {
          ip_match: searchRes.ip ? normalizeIp(searchRes.ip[0]) : '',
        },
        id: {
          id: searchRes.id,
        },
        external_id: {
          filter: `external_id.equals(${searchRes.external_id})`,
        },
      },
      resData: {},
    },
    hosts: {
      menu_key: 'host',
      res_name: 'hosts',
      label: i18n.t('dictionary.host'),
      id: 'hosts',
      component: 'HostList',
      hasPermission: hasPermission({ key: 'hosts_list' }),
      params: {
        common: {
          ...commonSearchQuery,
          baremetal: false,
        },
        name: {
          filter: `name.contains(${getFilter('name')})`,
        },
        ip: {
          // filter: `access_ip.contains(${getFilter('ip')})`,
          any_ip: searchRes.ip ? searchRes.ip[0] : '',
        },
        id: {
          id: searchRes.id,
        },
        external_id: {
          filter: `external_id.equals(${searchRes.external_id})`,
        },
      },
      resData: {},
    },
    physicalmachines: {
      menu_key: 'physicalmachine',
      res_name: 'hosts',
      label: i18n.t('dictionary.physicalmachine'),
      id: 'physicalmachines',
      component: 'PhysicalmachineList',
      hasPermission: hasPermission({ key: 'hosts_list' }),
      params: {
        common: {
          ...commonSearchQuery,
          baremetal: true,
          host_type: 'baremetal',
          with_meta: true,
        },
        name: {
          filter: `name.contains(${getFilter('name')})`,
        },
        ip: {
          // filter: `access_ip.contains(${getFilter('ip')})`,
          any_ip: searchRes.ip ? searchRes.ip[0] : '',
        },
        id: {
          id: searchRes.id,
        },
        external_id: {
          filter: `external_id.equals(${searchRes.external_id})`,
        },
      },
      resData: {},
    },
    rds: {
      menu_key: 'rds',
      res_name: 'dbinstances',
      label: 'RDS',
      id: 'rds',
      component: 'RDSList',
      hasPermission: hasPermission({ key: 'rds_dbinstances_list' }),
      params: {
        common: {
          ...commonSearchQuery,
        },
        name: {
          filter: `name.contains(${getFilter('name')})`,
        },
        ip: {
          filter: `internal_connection_str.contains(${getFilter('ip')})`,
        },
        id: {
          id: searchRes.id,
        },
        external_id: {
          filter: `external_id.equals(${searchRes.external_id})`,
        },
      },
      resData: {},
    },
    redis: {
      menu_key: 'redis',
      res_name: 'elasticcaches',
      label: 'Redis',
      id: 'redis',
      component: 'RedisList',
      hasPermission: hasPermission({ key: 'redis_elasticcaches_list' }),
      params: {
        common: {
          ...commonSearchQuery,
        },
        name: {
          filter: `name.contains(${getFilter('name')})`,
        },
        ip: {
          filter: `private_ip_addr.contains(${getFilter('ip')})`,
        },
        id: {
          id: searchRes.id,
        },
        external_id: {
          filter: `external_id.equals(${searchRes.external_id})`,
        },
      },
      resData: {},
    },
    deleteServers: {
      menu_key: 'serverrecovery',
      res_name: 'servers',
      label: i18n.t('dictionary.delete_servers'),
      id: 'deleteServers',
      component: 'ServerRecoveryList',
      hasPermission: hasPermission({ key: 'servers_list' }),
      params: {
        common: {
          ...commonSearchQuery,
          with_meta: true,
          pending_delete: true,
        },
        name: {
          filter: `name.contains(${getFilter('name')})`,
        },
        ip: {
          // joint_filter: `guestnetworks.guest_id(id).ip_addr.contains(${getFilter('ip')})`,
          ip_addr: searchRes.ip ? searchRes.ip[0] : '',
        },
        id: {
          id: searchRes.id,
        },
        external_id: {
          filter: `external_id.equals(${searchRes.external_id})`,
        },
      },
      resData: {},
    },
    deleteDisks: {
      menu_key: 'diskrecovery',
      res_name: 'disks',
      label: i18n.t('dictionary.delete_disks'),
      id: 'deleteDisks',
      component: 'DiskRecoveryList',
      hasPermission: hasPermission({ key: 'disks_list' }),
      params: {
        common: {
          ...commonSearchQuery,
          with_meta: true,
          pending_delete: true,
        },
        name: {
          filter: `name.contains(${getFilter('name')})`,
        },
        id: {
          id: searchRes.id,
        },
        external_id: {
          filter: `external_id.equals(${searchRes.external_id})`,
        },
      },
      resData: {},
    },
    deleteImages: {
      menu_key: 'imagerecovery',
      res_name: 'images',
      label: i18n.t('dictionary.delete_images'),
      id: 'deleteImages',
      component: 'ImageRecoveryList',
      hasPermission: hasPermission({ key: 'images_list' }),
      params: {
        common: {
          ...commonSearchQuery,
          is_guest_image: false,
          pending_delete: true,
        },
        name: {
          filter: `name.contains(${getFilter('name')})`,
        },
        id: {
          id: searchRes.id,
        },
        external_id: {
          filter: `external_id.equals(${searchRes.external_id})`,
        },
      },
      resData: {},
    },
    vpcs: {
      menu_key: 'vpc',
      res_name: 'vpcs',
      label: i18n.t('dictionary.vpc'),
      id: 'vpcs',
      component: 'VPCList',
      hasPermission: hasPermission({ key: 'vpcs_list' }),
      params: {
        common: {
          ...commonSearchQuery,
        },
        name: {
          filter: `name.contains(${getFilter('name')})`,
        },
        ip: {
          // filter: `access_ip.contains(${getFilter('ip')})`,
          cidr_block: searchRes.ip ? searchRes.ip[0] : '',
        },
        id: {
          id: searchRes.id,
        },
        external_id: {
          filter: `external_id.equals(${searchRes.external_id})`,
        },
      },
      resData: {},
    },
    wires: {
      menu_key: 'wire',
      res_name: 'wires',
      label: i18n.t('dictionary.wire'),
      id: 'wires',
      component: 'WireList',
      hasPermission: hasPermission({ key: 'wires_list' }),
      params: {
        common: {
          ...commonSearchQuery,
        },
        name: {
          filter: `name.contains(${getFilter('name')})`,
        },
        id: {
          id: searchRes.id,
        },
        external_id: {
          filter: `external_id.equals(${searchRes.external_id})`,
        },
      },
      resData: {},
    },
    natgateways: {
      menu_key: 'nat',
      res_name: 'natgateways',
      label: i18n.t('dictionary.nat'),
      id: 'natgateways',
      component: 'NatList',
      hasPermission: hasPermission({ key: 'natgateways_list' }),
      params: {
        common: {
          ...commonSearchQuery,
        },
        name: {
          filter: `name.contains(${getFilter('name')})`,
        },
        id: {
          id: searchRes.id,
        },
        external_id: {
          filter: `external_id.equals(${searchRes.external_id})`,
        },
      },
      resData: {},
    },
    dns_zones: {
      menu_key: 'dns_zone',
      res_name: 'dns_zones',
      label: i18n.t('dictionary.dns_zone'),
      id: 'dns_zones',
      component: 'DnsZoneList',
      hasPermission: hasPermission({ key: 'dns_zones_list' }),
      params: {
        common: {
          ...commonSearchQuery,
        },
        name: {
          filter: `name.contains(${getFilter('name')})`,
        },
        id: {
          id: searchRes.id,
        },
      },
      resData: {},
    },
    dnsrecords: {
      menu_key: 'dnsrecords',
      res_name: 'dnsrecords',
      label: i18n.t('dictionary.dnsrecords'),
      id: 'dnsrecords',
      component: 'DnsRecordSetList',
      hasPermission: hasPermission({ key: 'dnsrecords_list' }),
      params: {
        common: {
          ...commonSearchQuery,
        },
        name: {
          filter: `name.contains(${getFilter('name')})`,
        },
        id: {
          id: searchRes.id,
        },
        ip: {
          filter: `dns_value.contains("${searchRes.ip}")`,
        },
      },
      resData: {},
    },
    loadbalancers: {
      menu_key: 'lb',
      res_name: 'loadbalancers',
      label: i18n.t('dictionary.loadbalancer'),
      id: 'loadbalancers',
      component: 'LbList',
      hasPermission: hasPermission({ key: 'lb_loadbalancers_list' }),
      params: {
        common: {
          ...commonSearchQuery,
        },
        name: {
          filter: `name.contains(${getFilter('name')})`,
        },
        ip: {
          address: searchRes.ip ? searchRes.ip.join(',') : '',
        },
        id: {
          id: searchRes.id,
        },
        external_id: {
          filter: `external_id.equals(${searchRes.external_id})`,
        },
      },
      resData: {},
    },
    loadbalanceracls: {
      menu_key: 'lbacl',
      res_name: 'loadbalanceracls',
      label: i18n.t('dictionary.loadbalanceracl'),
      id: 'loadbalanceracls',
      component: 'LbaclsList',
      hasPermission: hasPermission({ key: 'lb_loadbalanceracls_list' }),
      params: {
        common: {
          ...commonSearchQuery,
        },
        name: {
          filter: `name.contains(${getFilter('name')})`,
        },
        id: {
          id: searchRes.id,
        },
        external_id: {
          filter: `external_id.equals(${searchRes.external_id})`,
        },
      },
      resData: {},
    },
    loadbalancercertificates: {
      menu_key: 'lbcert',
      res_name: 'loadbalancercertificates',
      label: i18n.t('dictionary.loadbalancercertificate'),
      id: 'loadbalancercertificates',
      component: 'LbcertList',
      hasPermission: hasPermission({ key: 'lb_loadbalancercertificates_list' }),
      params: {
        common: {
          ...commonSearchQuery,
        },
        name: {
          filter: `name.contains(${getFilter('name')})`,
        },
        id: {
          id: searchRes.id,
        },
        external_id: {
          filter: `external_id.equals(${searchRes.external_id})`,
        },
      },
      resData: {},
    },
    storages: {
      menu_key: 'blockstorage',
      res_name: 'storages',
      label: i18n.t('dictionary.storage'),
      id: 'storages',
      component: 'BlockStorageList',
      hasPermission: hasPermission({ key: 'storages_list' }),
      params: {
        common: {
          ...commonSearchQuery,
        },
        name: {
          filter: `name.contains(${getFilter('name')})`,
        },
        id: {
          id: searchRes.id,
        },
        external_id: {
          filter: `external_id.equals(${searchRes.external_id})`,
        },
      },
      resData: {},
    },
    buckets: {
      menu_key: 'bucket',
      res_name: 'buckets',
      label: i18n.t('dictionary.bucket'),
      id: 'buckets',
      component: 'BucketStorageList',
      hasPermission: hasPermission({ key: 'buckets_list' }),
      params: {
        common: {
          ...commonSearchQuery,
        },
        name: {
          filter: `name.contains(${getFilter('name')})`,
        },
        id: {
          id: searchRes.id,
        },
        external_id: {
          filter: `external_id.equals(${searchRes.external_id})`,
        },
      },
      resData: {},
    },
    idps: {
      menu_key: 'idp',
      res_name: 'identity_providers',
      label: i18n.t('dictionary.identity_provider'),
      id: 'identity_providers',
      component: 'IDPList',
      hasPermission: hasPermission({ key: 'idps_list' }),
      params: {
        common: {
          ...commonSearchQuery,
        },
        name: {
          filter: `name.contains(${getFilter('name')})`,
        },
        id: {
          id: searchRes.id,
        },
        external_id: {
          filter: `external_id.equals(${searchRes.external_id})`,
        },
      },
      resData: {},
    },
    domains: {
      menu_key: 'domain',
      res_name: 'domains',
      label: i18n.t('dictionary.domain'),
      id: 'domains',
      component: 'DomainList',
      hasPermission: hasPermission({ key: 'domains_list' }),
      params: {
        common: {
          ...commonSearchQuery,
        },
        name: {
          filter: `name.contains(${getFilter('name')})`,
        },
        id: {
          id: searchRes.id,
        },
      },
      resData: {},
    },
    projects: {
      menu_key: 'project',
      res_name: 'projects',
      label: i18n.t('dictionary.project'),
      id: 'projects',
      component: 'ProjectList',
      hasPermission: hasPermission({ key: 'projects_list' }),
      params: {
        common: {
          ...commonSearchQuery,
        },
        name: {
          filter: `name.contains(${getFilter('name')})`,
        },
        id: {
          id: searchRes.id,
        },
      },
      resData: {},
    },
    users: {
      menu_key: 'systemuser',
      res_name: 'users',
      label: i18n.t('dictionary.user'),
      id: 'users',
      component: 'UserList',
      hasPermission: hasPermission({ key: 'users_list' }),
      params: {
        common: {
          ...commonSearchQuery,
        },
        name: {
          filter: `name.contains(${getFilter('name')})`,
        },
        id: {
          id: searchRes.id,
        },
      },
      resData: {},
    },
    groups: {
      menu_key: 'group',
      res_name: 'groups',
      label: i18n.t('dictionary.group'),
      id: 'groups',
      component: 'GroupList',
      hasPermission: hasPermission({ key: 'groups_list' }),
      params: {
        common: {
          ...commonSearchQuery,
        },
        name: {
          filter: `name.contains(${getFilter('name')})`,
        },
        id: {
          id: searchRes.id,
        },
      },
      resData: {},
    },
    roles: {
      menu_key: 'role',
      res_name: 'roles',
      label: i18n.t('dictionary.role'),
      id: 'roles',
      component: 'RoleList',
      hasPermission: hasPermission({ key: 'roles_list' }),
      params: {
        common: {
          ...commonSearchQuery,
        },
        name: {
          filter: `name.contains(${getFilter('name')})`,
        },
        id: {
          id: searchRes.id,
        },
      },
      resData: {},
    },
    policies: {
      menu_key: 'policy',
      res_name: 'policies',
      label: i18n.t('res.policies'),
      id: 'policies',
      component: 'PolicyList',
      hasPermission: hasPermission({ key: 'policies_list' }),
      params: {
        common: {
          ...commonSearchQuery,
        },
        name: {
          filter: `name.contains(${getFilter('name')})`,
        },
        id: {
          id: searchRes.id,
        },
      },
      resData: {},
    },
    cloudaccounts: {
      menu_key: 'cloudaccount',
      res_name: 'cloudaccounts',
      label: i18n.t('dictionary.cloudaccount'),
      id: 'cloudaccounts',
      component: 'CloudaccountList',
      hasPermission: hasPermission({ key: 'cloudaccounts_list' }),
      params: {
        common: {
          ...commonSearchQuery,
        },
        name: {
          filter: `name.contains(${getFilter('name')})`,
        },
        id: {
          id: searchRes.id,
        },
      },
      resData: {},
    },
    route_tables: {
      menu_key: 'routetable',
      res_name: 'route_tables',
      label: i18n.t('dictionary.route_table'),
      id: 'route_tables',
      component: 'RouteTableList',
      hasPermission: hasPermission({ key: 'route_tables_list' }),
      params: {
        common: {
          ...commonSearchQuery,
        },
        name: {
          filter: `name.contains(${getFilter('name')})`,
        },
        id: {
          id: searchRes.id,
        },
        external_id: {
          filter: `external_id.equals(${searchRes.external_id})`,
        },
      },
      resData: {},
    },
    vpc_network: {
      menu_key: 'vpc-network',
      res_name: 'inter_vpc_networks',
      label: i18n.t('dictionary.vpc_network'),
      id: 'vpc_network',
      component: 'VpcNetworkList',
      hasPermission: hasPermission({ key: 'inter_vpc_networks_list' }),
      params: {
        common: {
          ...commonSearchQuery,
        },
        name: {
          filter: `name.contains(${getFilter('name')})`,
        },
        id: {
          id: searchRes.id,
        },
        external_id: {
          filter: `external_id.equals(${searchRes.external_id})`,
        },
      },
      resData: {},
    },
    vpc_peer_connect: {
      menu_key: 'vpc-peerconnect',
      res_name: 'vpc_peering_connections',
      label: i18n.t('dictionary.vpc_peer_connect'),
      id: 'vpc_peer_connect',
      component: 'VpcPeerConnectList',
      hasPermission: hasPermission({ key: 'vpc_peering_connections_list' }),
      params: {
        common: {
          ...commonSearchQuery,
        },
        name: {
          filter: `name.contains(${getFilter('name')})`,
        },
        id: {
          id: searchRes.id,
        },
        external_id: {
          filter: `external_id.equals(${searchRes.external_id})`,
        },
      },
      resData: {},
    },
    mongodb: {
      menu_key: 'mongodb',
      res_name: 'mongodbs',
      label: i18n.t('dictionary.mongodb'),
      id: 'mongodb',
      component: 'MongoDBList',
      hasPermission: hasPermission({ key: 'mongodbs_list' }),
      params: {
        common: {
          ...commonSearchQuery,
        },
        name: {
          filter: `name.contains(${getFilter('name')})`,
        },
        id: {
          id: searchRes.id,
        },
        external_id: {
          filter: `external_id.equals(${searchRes.external_id})`,
        },
      },
      resData: {},
    },
    kafka: {
      menu_key: 'kafka',
      res_name: 'kafkas',
      label: i18n.t('dictionary.kafka'),
      id: 'kafka',
      component: 'KafkaList',
      hasPermission: hasPermission({ key: 'kafkas_list' }),
      params: {
        common: {
          ...commonSearchQuery,
        },
        name: {
          filter: `name.contains(${getFilter('name')})`,
        },
        id: {
          id: searchRes.id,
        },
        external_id: {
          filter: `external_id.equals(${searchRes.external_id})`,
        },
      },
      resData: {},
    },
    elasticsearch: {
      menu_key: 'elasticsearch',
      res_name: 'elastic_searchs',
      label: i18n.t('dictionary.elasticsearch'),
      id: 'elasticsearch',
      component: 'ElasticSearchList',
      hasPermission: hasPermission({ key: 'elastic_searchs_list' }),
      params: {
        common: {
          ...commonSearchQuery,
        },
        name: {
          filter: `name.contains(${getFilter('name')})`,
        },
        id: {
          id: searchRes.id,
        },
        external_id: {
          filter: `external_id.equals(${searchRes.external_id})`,
        },
      },
      resData: {},
    },
    cdn: {
      menu_key: 'cdn',
      res_name: 'cdn_domains',
      label: i18n.t('dictionary.cdn'),
      id: 'cdn',
      component: 'CdnDomainList',
      hasPermission: hasPermission({ key: 'cdn_domains_list' }),
      params: {
        common: {
          ...commonSearchQuery,
        },
        name: {
          filter: `name.contains(${getFilter('name')})`,
        },
        id: {
          id: searchRes.id,
        },
        external_id: {
          filter: `external_id.equals(${searchRes.external_id})`,
        },
      },
      resData: {},
    },
    waf: {
      menu_key: 'waf',
      res_name: 'waf_instances',
      label: i18n.t('dictionary.waf_instance'),
      id: 'waf',
      component: 'WafList',
      hasPermission: hasPermission({ key: 'waf_instances_list' }),
      params: {
        common: {
          ...commonSearchQuery,
        },
        name: {
          filter: `name.contains(${getFilter('name')})`,
        },
        id: {
          id: searchRes.id,
        },
        external_id: {
          filter: `external_id.equals(${searchRes.external_id})`,
        },
      },
      resData: {},
    },
    nas: {
      menu_key: 'nas',
      res_name: 'file_systems',
      label: i18n.t('dictionary.filesystem'),
      id: 'nas',
      component: 'FileSystemList',
      hasPermission: hasPermission({ key: 'file_systems_list' }),
      params: {
        common: {
          ...commonSearchQuery,
        },
        name: {
          filter: `name.contains(${getFilter('name')})`,
        },
        id: {
          id: searchRes.id,
        },
        external_id: {
          filter: `external_id.equals(${searchRes.external_id})`,
        },
      },
      resData: {},
    },
    isolated_devices: {
      menu_key: 'gpu',
      res_name: 'isolated_devices',
      label: i18n.t('compute.pci.passthrough_device'),
      id: 'isolated_devices',
      component: 'GpuList',
      hasPermission: hasPermission({ key: 'isolated_devices_list' }),
      params: {
        common: {
          ...commonSearchQuery,
        },
        name: {
          filter: `name.contains(${getFilter('name')})`,
        },
        id: {
          id: searchRes.id,
        },
      },
      resData: {},
    },
    vminstanceContainer: {
      menu_key: 'vminstance-container',
      res_name: 'servers',
      label: i18n.t('compute.vminstance-container'),
      id: 'vminstanceContainer',
      component: 'VmContainerInstanceList',
      hasPermission: hasPermission({ key: 'servers_list' }),
      params: {
        common: {
          ...commonSearchQuery,
          hypervisor: 'pod',
          with_meta: true,
        },
        name: {
          filter: `name.contains(${getFilter('name')})`,
        },
        id: {
          id: searchRes.id,
        },
      },
      resData: {},
    },
    deadlyResource: {
      menu_key: 'deadly-resource',
      res_name: 'billing_resource_checks',
      label: i18n.t('compute.deadly_resource'),
      id: 'deadlyResource',
      component: 'DeadlyResourceList',
      hasPermission: hasPermission({ key: 'billing_resource_checks_list' }),
      params: {
        common: {
          ...commonSearchQuery,
        },
        name: {
          filter: `name.contains(${getFilter('name')})`,
        },
        id: {
          id: searchRes.id,
        },
      },
      resData: {},
    },
  }

  const validMaps = R.filter((val, key) => {
    const { params, surportType } = getParams(val.params)
    if (val.hasPermission !== false) { // 权限通过
      val.params = params
      return surportType
    }
  }, maps)
  return validMaps
}
