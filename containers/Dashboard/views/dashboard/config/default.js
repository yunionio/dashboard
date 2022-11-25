import i18n from '@/locales'

export default {
  system: {
    options: [
      { id: 'dashboard-system-default', name: i18n.t('dashboard.text_121') },
    ],
    'dashboard-system-default': [{
      layout: {
        component: 'NumberCard',
        h: 6,
        w: 20,
        x: 0,
        y: 0,
      },
      params: {
        chart_type: 'icon',
        icon: 'icon_cpu',
        name: i18n.t('dashboard.text_130'),
        regionAccountType: 'region',
        usage_key: 'all.servers',
      },
    }, {
      layout: {
        component: 'NumberCard',
        h: 6,
        w: 20,
        x: 20,
        y: 0,
      },
      params: {
        chart_type: 'icon',
        icon: 'icon_tenant',
        name: i18n.t('dashboard.text_136'),
        regionAccountType: 'region',
        usage_key: 'hosts',
      },
    }, {
      layout: {
        component: 'NumberCard',
        h: 6,
        w: 20,
        x: 40,
        y: 0,
      },
      params: {
        chart_type: 'icon',
        icon: 'icon_baremetal',
        name: i18n.t('dashboard.text_134'),
        regionAccountType: 'region',
        usage_key: 'baremetals',
      },
    }, {
      layout: {
        component: 'NumberCard',
        h: 6,
        w: 20,
        x: 0,
        y: 6,
      },
      params: {
        chart_type: 'icon',
        icon: 'icon_ram',
        name: i18n.t('dashboard.text_122'),
        regionAccountType: 'region',
        usage_key: 'all.servers.cpu',
      },
    }, {
      layout: {
        component: 'NumberCard',
        h: 6,
        w: 20,
        x: 20,
        y: 6,
      },
      params: {
        chart_type: 'icon',
        icon: 'icon_baremetal',
        name: i18n.t('dashboard.text_127'),
        regionAccountType: 'region',
        usage_key: 'all.servers.memory',
      },
    }, {
      layout: {
        component: 'NumberCard',
        h: 6,
        w: 20,
        x: 40,
        y: 6,
      },
      params: {
        chart_type: 'icon',
        icon: 'icon_cpu',
        name: i18n.t('dashboard.text_123'),
        regionAccountType: 'region',
        usage_key: 'all.servers.disk',
      },
    }, {
      layout: {
        component: 'Ring',
        h: 5,
        w: 20,
        x: 0,
        y: 12,
      },
      params: {
        all_usage_key: 'all.servers',
        chart_type: 'liquidfill',
        name: i18n.t('dashboard.all.running_servers_rate'),
        regionAccountType: 'region',
        un_usage_label: i18n.t('dashboard.all.no_running_servers'),
        usage_key: 'all.running_servers',
        usage_label: i18n.t('dashboard.all.running_servers'),
      },
    }, {
      layout: {
        component: 'Ring',
        h: 5,
        w: 20,
        x: 20,
        y: 12,
      },
      params: {
        all_usage_key: 'all.disks.count',
        chart_type: 'liquidfill',
        name: i18n.t('dashboard.text_147'),
        regionAccountType: 'region',
        un_usage_label: i18n.t('dashboard.not_mounted'),
        usage_key: 'all.disks.mounted.count',
        usage_label: i18n.t('dashboard.mounted'),
      },
    }, {
      layout: {
        component: 'Ring',
        h: 5,
        w: 20,
        x: 40,
        y: 12,
      },
      params: {
        all_usage_key: 'all.ports',
        chart_type: 'liquidfill',
        name: i18n.t('dashboard.text_152'),
        regionAccountType: 'region',
        un_usage_label: i18n.t('dashboard.text_34'),
        usage_key: 'all.nics',
        usage_label: i18n.t('dashboard.text_33'),
      },
    }, {
      layout: {
        component: 'Ring',
        h: 5,
        w: 20,
        x: 60,
        y: 12,
      },
      params: {
        all_usage_key: 'all.eip.floating_ip',
        chart_type: 'liquidfill',
        name: i18n.t('dashboard.text_156'),
        regionAccountType: 'region',
        un_usage_label: i18n.t('dashboard.text_34'),
        usage_key: 'all.eip.floating_ip.used',
        usage_label: i18n.t('dashboard.text_33'),
      },
    }, {
      layout: {
        component: 'Top5',
        h: 8,
        w: 20,
        x: 0,
        y: 17,
      },
      params: {
        brand: '',
        dimensionId: 'vm_id',
        limit: 5,
        name: i18n.t('dashboard.text_126'),
        order: 'TOP',
        resType: 'server',
        time: 108000,
        usage: 'usage_active,vm_cpu',
      },
    }, {
      layout: {
        component: 'Top5',
        h: 8,
        w: 20,
        x: 20,
        y: 17,
      },
      params: {
        brand: '',
        dimensionId: 'vm_id',
        limit: 5,
        name: i18n.t('dashboard.memory_use_rate_top5'),
        order: 'TOP',
        resType: 'server',
        time: 604800,
        usage: 'used_percent,vm_mem',
      },
    }, {
      layout: {
        component: 'Top5',
        h: 8,
        w: 20,
        x: 40,
        y: 17,
      },
      params: {
        brand: '',
        dimensionId: 'vm_id',
        limit: 5,
        name: i18n.t('dashboard.disk_use_rate_top5'),
        order: 'TOP',
        resType: 'server',
        time: 604800,
        usage: 'used_percent,vm_disk',
      },
    }, {
      layout: {
        component: 'Log',
        h: 8,
        w: 20,
        x: 60,
        y: 17,
      },
      params: {
        limit: 5,
        name: i18n.t('dashboard.text_17'),
      },
    }, {
      layout: {
        component: 'Quota',
        h: 12,
        w: 20,
        x: 0,
        y: 25,
      },
      params: {
        field: 'cpu',
        name: i18n.t('dashboard.text_139'),
        resource: 'quotas',
        titleKey: 'domain',
      },
    }, {
      layout: {
        component: 'Quota',
        h: 12,
        w: 20,
        x: 20,
        y: 25,
      },
      params: {
        field: 'memory',
        name: i18n.t('dashboard.text_140'),
        resource: 'quotas',
        titleKey: 'domain',
      },
    }, {
      layout: {
        component: 'Quota',
        h: 12,
        w: 20,
        x: 40,
        y: 25,
      },
      params: {
        field: 'storage',
        name: i18n.t('dashboard.text_141'),
        resource: 'quotas',
        titleKey: 'domain',
      },
    }, {
      layout: {
        component: 'Quota',
        h: 12,
        w: 20,
        x: 60,
        y: 25,
      },
      params: {
        field: 'eip',
        name: i18n.t('dashboard.text_142'),
        resource: 'region_quotas',
        titleKey: 'domain',
      },
    }, {
      layout: {
        component: 'Quota',
        h: 12,
        w: 20,
        x: 0,
        y: 37,
      },
      params: {
        field: 'port',
        name: i18n.t('dashboard.text_143'),
        resource: 'region_quotas',
        titleKey: 'domain',
      },
    }, {
      layout: {
        component: 'Quota',
        h: 12,
        w: 20,
        x: 20,
        y: 37,
      },
      params: {
        field: 'isolated_device',
        name: i18n.t('dashboard.text_144'),
        resource: 'quotas',
        titleKey: 'domain',
      },
    }, {
      layout: {
        component: 'Quota',
        h: 12,
        w: 20,
        x: 40,
        y: 37,
      },
      params: {
        field: 'image',
        name: i18n.t('dashboard.text_145'),
        resource: 'image_quotas',
        titleKey: 'domain',
      },
    }, {
      layout: {
        component: 'Quota',
        h: 12,
        w: 20,
        x: 60,
        y: 37,
      },
      params: {
        field: 'snapshot',
        name: i18n.t('dashboard.text_146'),
        resource: 'region_quotas',
        titleKey: 'domain',
      },
    }, {
      layout: {
        component: 'NumberCard',
        h: 6,
        w: 20,
        x: 60,
        y: 6,
      },
      params: {
        chart_type: 'icon',
        icon: 'icon_tenant',
        name: i18n.t('dashboard.server_gpu_num'),
        regionAccountType: 'region',
        usage_key: 'all.servers.isolated_devices',
      },
    }, {
      layout: {
        component: 'UserInfo',
        h: 6,
        w: 20,
        x: 60,
        y: 0,
      },
      params: {
        name: i18n.t('dashboard.userinfo'),
      },
    }],
  },
  domain: {
    options: [
      { id: 'dashboard-domain-default', name: i18n.t('dashboard.text_121') },
    ],
    'dashboard-domain-default': [{
      layout: {
        component: 'NumberCard',
        h: 6,
        w: 20,
        x: 0,
        y: 0,
      },
      params: {
        chart_type: 'icon',
        icon: 'icon_cpu',
        name: i18n.t('dashboard.text_160'),
        regionAccountType: 'region',
        usage_key: 'domain.servers',
      },
    }, {
      layout: {
        component: 'Top5',
        h: 10,
        w: 20,
        x: 0,
        y: 17,
      },
      params: {
        brand: '',
        dimensionId: 'vm_id',
        limit: 5,
        name: i18n.t('dashboard.text_126'),
        order: 'TOP',
        resType: 'server',
        time: 604800,
        usage: 'usage_active,vm_cpu',
      },
    }, {
      layout: {
        component: 'Top5',
        h: 10,
        w: 20,
        x: 20,
        y: 17,
      },
      params: {
        brand: '',
        dimensionId: 'vm_id',
        limit: 5,
        name: i18n.t('dashboard.memory_use_rate_top5'),
        order: 'TOP',
        resType: 'server',
        time: 604800,
        usage: 'used_percent,vm_mem',
      },
    }, {
      layout: {
        component: 'Top5',
        h: 10,
        w: 20,
        x: 40,
        y: 17,
      },
      params: {
        brand: '',
        dimensionId: 'vm_id',
        limit: 5,
        name: i18n.t('dashboard.disk_use_rate_top5'),
        order: 'TOP',
        resType: 'server',
        time: 604800,
        usage: 'used_percent,vm_disk',
      },
    }, {
      layout: {
        component: 'Log',
        h: 10,
        w: 20,
        x: 60,
        y: 17,
      },
      params: {
        limit: 4,
        name: i18n.t('dashboard.text_17'),
      },
    }, {
      layout: {
        component: 'NumberCard',
        h: 6,
        w: 20,
        x: 20,
        y: 6,
      },
      params: {
        chart_type: 'icon',
        icon: 'icon_baremetal',
        name: i18n.t('dashboard.server_memory_num'),
        regionAccountType: 'region',
        unit: 'auto',
        usage_key: 'domain.servers.memory',
      },
    }, {
      layout: {
        component: 'NumberCard',
        h: 6,
        w: 20,
        x: 60,
        y: 6,
      },
      params: {
        chart_type: 'icon',
        icon: 'icon_tenant',
        name: i18n.t('dashboard.server_gpu_num'),
        regionAccountType: 'region',
        usage_key: 'domain.servers.isolated_devices',
      },
    }, {
      layout: {
        component: 'NumberCard',
        h: 6,
        w: 20,
        x: 40,
        y: 0,
      },
      params: {
        chart_type: 'icon',
        icon: 'icon_baremetal',
        name: i18n.t('dashboard.text_134'),
        regionAccountType: 'region',
        usage_key: 'domain.baremetals',
      },
    }, {
      layout: {
        component: 'Ring',
        h: 5,
        w: 20,
        x: 0,
        y: 12,
      },
      params: {
        all_usage_key: 'domain.servers',
        chart_type: 'liquidfill',
        name: i18n.t('dashboard.all.running_servers_rate'),
        regionAccountType: 'region',
        un_usage_label: i18n.t('dashboard.all.no_running_servers'),
        usage_key: 'domain.running_servers',
        usage_label: i18n.t('dashboard.all.running_servers'),
      },
    }, {
      layout: {
        component: 'Ring',
        h: 5,
        w: 20,
        x: 20,
        y: 12,
      },
      params: {
        all_usage_key: 'domain.disks.count',
        chart_type: 'liquidfill',
        name: i18n.t('dashboard.text_147'),
        regionAccountType: 'region',
        un_usage_label: i18n.t('dashboard.not_mounted'),
        usage_key: 'domain.disks.mounted.count',
        usage_label: i18n.t('dashboard.mounted'),
      },
    }, {
      layout: {
        component: 'Ring',
        h: 5,
        w: 20,
        x: 60,
        y: 12,
      },
      params: {
        all_usage_key: 'domain.eip.floating_ip',
        chart_type: 'liquidfill',
        name: i18n.t('dashboard.text_156'),
        regionAccountType: 'region',
        un_usage_label: i18n.t('dashboard.text_34'),
        usage_key: 'domain.eip.floating_ip.used',
        usage_label: i18n.t('dashboard.text_33'),
      },
    }, {
      layout: {
        component: 'Ring',
        h: 5,
        w: 20,
        x: 40,
        y: 12,
      },
      params: {
        all_usage_key: 'domain.ports',
        chart_type: 'liquidfill',
        name: i18n.t('dashboard.text_152'),
        regionAccountType: 'region',
        un_usage_label: i18n.t('dashboard.text_34'),
        usage_key: 'domain.nics',
        usage_label: i18n.t('dashboard.text_33'),
      },
    }, {
      layout: {
        component: 'NumberCard',
        h: 6,
        w: 20,
        x: 0,
        y: 6,
      },
      params: {
        chart_type: 'icon',
        icon: 'icon_ram',
        name: i18n.t('dashboard.server_cpu_num'),
        regionAccountType: 'region',
        usage_key: 'domain.servers.cpu',
      },
    }, {
      layout: {
        component: 'NumberCard',
        h: 6,
        w: 20,
        x: 20,
        y: 0,
      },
      params: {
        chart_type: 'icon',
        icon: 'icon_tenant',
        name: i18n.t('dashboard.host_total_num'),
        regionAccountType: 'region',
        usage_key: 'domain.hosts',
      },
    }, {
      layout: {
        component: 'NumberCard',
        h: 6,
        w: 20,
        x: 40,
        y: 6,
      },
      params: {
        chart_type: 'icon',
        icon: 'icon_cpu',
        name: i18n.t('dashboard.server_disk_num'),
        regionAccountType: 'region',
        unit: 'auto',
        usage_key: 'domain.servers.disk',
      },
    }, {
      layout: {
        component: 'UserInfo',
        h: 6,
        w: 20,
        x: 60,
        y: 0,
      },
      params: {
        name: i18n.t('dashboard.userinfo'),
      },
    }],
  },
  project: {
    options: [
      { id: 'dashboard-project-default', name: i18n.t('dashboard.text_121') },
    ],
    'dashboard-project-default': [{
      layout: {
        component: 'Ring',
        h: 5,
        w: 20,
        x: 0,
        y: 12,
      },
      params: {
        all_usage_key: 'servers',
        chart_type: 'liquidfill',
        name: i18n.t('dashboard.all.running_servers_rate'),
        regionAccountType: 'region',
        un_usage_label: i18n.t('dashboard.all.no_running_servers'),
        usage_key: 'running_servers',
        usage_label: i18n.t('dashboard.all.running_servers'),
      },
    }, {
      layout: {
        component: 'Ring',
        h: 5,
        w: 20,
        x: 20,
        y: 12,
      },
      params: {
        all_usage_key: 'disks.count',
        chart_type: 'liquidfill',
        name: i18n.t('dashboard.text_147'),
        regionAccountType: 'region',
        un_usage_label: i18n.t('dashboard.not_mounted'),
        usage_key: 'disks.mounted.count',
        usage_label: i18n.t('dashboard.mounted'),
      },
    }, {
      layout: {
        component: 'Ring',
        h: 5,
        w: 20,
        x: 60,
        y: 12,
      },
      params: {
        all_usage_key: 'eip.floating_ip',
        chart_type: 'liquidfill',
        name: i18n.t('dashboard.text_156'),
        regionAccountType: 'region',
        un_usage_label: i18n.t('dashboard.text_34'),
        usage_key: 'eip.floating_ip.used',
        usage_label: i18n.t('dashboard.text_33'),
      },
    }, {
      layout: {
        component: 'Top5',
        h: 8,
        w: 20,
        x: 0,
        y: 17,
      },
      params: {
        brand: '',
        dimensionId: 'vm_id',
        limit: 5,
        name: i18n.t('dashboard.text_126'),
        order: 'TOP',
        resType: 'server',
        time: 604800,
        usage: 'usage_active,vm_cpu',
      },
    }, {
      layout: {
        component: 'Top5',
        h: 8,
        w: 20,
        x: 20,
        y: 17,
      },
      params: {
        brand: '',
        dimensionId: 'vm_id',
        limit: 5,
        name: i18n.t('dashboard.memory_use_rate_top5'),
        order: 'TOP',
        resType: 'server',
        time: 604800,
        usage: 'used_percent,vm_mem',
      },
    }, {
      layout: {
        component: 'Top5',
        h: 8,
        w: 20,
        x: 40,
        y: 17,
      },
      params: {
        brand: '',
        dimensionId: 'vm_id',
        limit: 5,
        name: i18n.t('dashboard.disk_use_rate_top5'),
        order: 'TOP',
        resType: 'server',
        time: 18000,
        usage: 'used_percent,vm_disk',
      },
    }, {
      layout: {
        component: 'Log',
        h: 8,
        w: 20,
        x: 60,
        y: 17,
      },
      params: {
        limit: 4,
        name: i18n.t('dashboard.text_17'),
      },
    }, {
      layout: {
        component: 'ProjectQuota',
        h: 6,
        w: 20,
        x: 0,
        y: 25,
      },
      params: {
        all_usage_key: 'cpu',
        name: i18n.t('dashboard.cpu_quota'),
        type: 'project-quota-common',
        usage_key: 'usage.cpu',
      },
    }, {
      layout: {
        component: 'ProjectQuota',
        h: 6,
        w: 20,
        x: 20,
        y: 25,
      },
      params: {
        all_usage_key: 'memory',
        name: i18n.t('dashboard.memory_quota'),
        type: 'project-quota-common',
        usage_key: 'usage.memory',
      },
    }, {
      layout: {
        component: 'ProjectQuota',
        h: 6,
        w: 20,
        x: 40,
        y: 25,
      },
      params: {
        all_usage_key: 'storage',
        name: i18n.t('dashboard.storage_quota'),
        type: 'project-quota-common',
        usage_key: 'usage.storage',
      },
    }, {
      layout: {
        component: 'ProjectQuota',
        h: 6,
        w: 20,
        x: 60,
        y: 25,
      },
      params: {
        all_usage_key: 'eip',
        name: i18n.t('dashboard.eip_quota'),
        type: 'project-quota-region',
        usage_key: 'usage.eip',
      },
    }, {
      layout: {
        component: 'ProjectQuota',
        h: 6,
        w: 20,
        x: 0,
        y: 31,
      },
      params: {
        all_usage_key: 'port',
        name: i18n.t('dashboard.port_quota'),
        type: 'project-quota-region',
        usage_key: 'usage.port',
      },
    }, {
      layout: {
        component: 'ProjectQuota',
        h: 6,
        w: 20,
        x: 20,
        y: 31,
      },
      params: {
        all_usage_key: 'isolated_device',
        name: i18n.t('dashboard.gpu_quota'),
        type: 'project-quota-common',
        usage_key: 'usage.isolated_device',
      },
    }, {
      layout: {
        component: 'ProjectQuota',
        h: 6,
        w: 20,
        x: 40,
        y: 31,
      },
      params: {
        all_usage_key: 'image',
        name: i18n.t('dashboard.image_quota'),
        type: 'project-quota-image',
        usage_key: 'usage.image',
      },
    }, {
      layout: {
        component: 'ProjectQuota',
        h: 6,
        w: 20,
        x: 60,
        y: 31,
      },
      params: {
        all_usage_key: 'snapshot',
        name: i18n.t('dashboard.snapshot_quota'),
        type: 'project-quota-region',
        usage_key: 'usage.snapshot',
      },
    }, {
      layout: {
        component: 'Ring',
        h: 5,
        w: 20,
        x: 40,
        y: 12,
      },
      params: {
        all_usage_key: 'ports',
        chart_type: 'liquidfill',
        name: i18n.t('dashboard.text_152'),
        regionAccountType: 'region',
        un_usage_label: i18n.t('dashboard.text_34'),
        usage_key: 'nics',
        usage_label: i18n.t('dashboard.text_33'),
      },
    }, {
      layout: {
        component: 'NumberCard',
        h: 6,
        w: 20,
        x: 20,
        y: 6,
      },
      params: {
        chart_type: 'icon',
        icon: 'icon_baremetal',
        name: i18n.t('dashboard.text_127'),
        regionAccountType: 'region',
        unit: 'auto',
        usage_key: 'servers.memory',
      },
    }, {
      layout: {
        component: 'NumberCard',
        h: 6,
        w: 20,
        x: 0,
        y: 0,
      },
      params: {
        chart_type: 'icon',
        icon: 'icon_cpu',
        name: i18n.t('dashboard.text_130'),
        regionAccountType: 'region',
        usage_key: 'servers',
      },
    }, {
      layout: {
        component: 'NumberCard',
        h: 6,
        w: 20,
        x: 0,
        y: 6,
      },
      params: {
        chart_type: 'icon',
        icon: 'icon_ram',
        name: i18n.t('dashboard.server_cpu_num'),
        regionAccountType: 'region',
        usage_key: 'servers.cpu',
      },
    }, {
      layout: {
        component: 'NumberCard',
        h: 6,
        w: 20,
        x: 40,
        y: 6,
      },
      params: {
        chart_type: 'icon',
        icon: 'icon_cpu',
        name: i18n.t('dashboard.text_123'),
        regionAccountType: 'region',
        unit: 'auto',
        usage_key: 'servers.disk',
      },
    }, {
      layout: {
        component: 'NumberCard',
        h: 6,
        w: 20,
        x: 40,
        y: 0,
      },
      params: {
        chart_type: 'icon',
        icon: 'icon_baremetal',
        name: i18n.t('dashboard.snapshot_num'),
        regionAccountType: 'region',
        usage_key: 'snapshot',
      },
    }, {
      layout: {
        component: 'NumberCard',
        h: 6,
        w: 20,
        x: 60,
        y: 6,
      },
      params: {
        chart_type: 'icon',
        icon: 'icon_tenant',
        name: i18n.t('dashboard.gpu_num'),
        regionAccountType: 'region',
        usage_key: 'servers.isolated_devices',
      },
    }, {
      layout: {
        component: 'NumberCard',
        h: 6,
        w: 20,
        x: 20,
        y: 0,
      },
      params: {
        chart_type: 'icon',
        icon: 'icon_tenant',
        name: i18n.t('dashboard.disk_num'),
        regionAccountType: 'region',
        usage_key: 'disks.count',
      },
    }, {
      layout: {
        component: 'UserInfo',
        h: 6,
        w: 20,
        x: 60,
        y: 0,
      },
      params: {
        name: i18n.t('dashboard.userinfo'),
      },
    }],
  },
}
