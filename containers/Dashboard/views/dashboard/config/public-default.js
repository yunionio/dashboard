import i18n from '@/locales'
export default {
  system: {
    options: [
      { id: 'dashboard-system-default', name: i18n.t('dashboard.text_121') },
    ],
    'dashboard-system-default': [
      {
        layout: {
          component: 'NumberCard',
          h: 2,
          w: 5,
          x: 0,
          y: 2,
        },
        params: {
          brand: 'OneCloud',
          cloud_env: 'onpremise',
          name: i18n.t('dashboard.text_122'),
          region: 'default',
          usage_key: 'all.servers.cpu',
        },
      },
      {
        layout: {
          component: 'NumberCard',
          h: 2,
          w: 10,
          x: 10,
          y: 2,
        },
        params: {
          brand: 'OneCloud',
          cloud_env: 'onpremise',
          name: i18n.t('dashboard.text_123'),
          region: 'default',
          usage_key: 'all.servers.disk',
        },
      },
      {
        layout: {
          component: 'Top5',
          h: 5,
          w: 5,
          x: 10,
          y: 7,
        },
        params: {
          brand: 'OneCloud',
          limit: 5,
          name: i18n.t('dashboard.text_125'),
          order: 'TOP',
          resType: 'server',
          time: 18000,
          usage: 'write_bps,vm_diskio',
        },
      },
      {
        layout: {
          component: 'Top5',
          h: 5,
          w: 5,
          x: 0,
          y: 7,
        },
        params: {
          brand: 'OneCloud',
          limit: 5,
          name: i18n.t('dashboard.text_126'),
          order: 'TOP',
          resType: 'server',
          time: 18000,
          usage: 'usage_active,vm_cpu',
        },
      },
      {
        layout: {
          component: 'NumberCard',
          h: 2,
          w: 5,
          x: 5,
          y: 2,
        },
        params: {
          brand: 'OneCloud',
          cloud_env: 'onpremise',
          name: i18n.t('dashboard.text_127'),
          region: 'default',
          usage_key: 'all.servers.memory',
        },
      },
      {
        layout: {
          component: 'Ring',
          h: 3,
          w: 5,
          x: 10,
          y: 4,
        },
        params: {
          all_usage_key: 'storages',
          brand: 'OneCloud',
          cloud_env: 'onpremise',
          name: i18n.t('dashboard.text_128'),
          region: 'default',
          usage_key: 'all.servers.disk',
        },
      },
      {
        layout: {
          component: 'Ring',
          h: 3,
          w: 5,
          x: 15,
          y: 4,
        },
        params: {
          all_usage_key: 'isolated_devices',
          brand: 'OneCloud',
          cloud_env: 'onpremise',
          name: i18n.t('dashboard.text_129'),
          region: 'default',
          usage_key: 'all.servers.isolated_devices',
        },
      },
      {
        layout: {
          component: 'NumberCard',
          h: 2,
          w: 5,
          x: 0,
          y: 0,
        },
        params: {
          brand: 'OneCloud',
          cloud_env: 'onpremise',
          name: i18n.t('dashboard.text_130'),
          region: 'default',
          usage_key: 'all.servers.any_pool',
        },
      },
      {
        layout: {
          component: 'Log',
          h: 5,
          w: 5,
          x: 15,
          y: 7,
        },
        params: {
          limit: 5,
          name: i18n.t('dashboard.text_131'),
        },
      },
      {
        layout: {
          component: 'Ring',
          h: 3,
          w: 5,
          x: 5,
          y: 4,
        },
        params: {
          all_usage_key: 'hosts.memory',
          brand: 'OneCloud',
          cloud_env: 'onpremise',
          name: i18n.t('dashboard.text_132'),
          region: 'default',
          usage_key: 'all.servers.memory',
        },
      },
      {
        layout: {
          component: 'Top5',
          h: 5,
          w: 5,
          x: 5,
          y: 7,
        },
        params: {
          brand: 'OneCloud',
          limit: 5,
          name: i18n.t('dashboard.text_133'),
          order: 'TOP',
          resType: 'server',
          time: 18000,
          usage: 'read_bps,vm_diskio',
        },
      },
      {
        layout: {
          component: 'NumberCard',
          h: 2,
          w: 10,
          x: 10,
          y: 0,
        },
        params: {
          brand: 'OneCloud',
          cloud_env: 'onpremise',
          name: i18n.t('dashboard.text_134'),
          region: 'default',
          usage_key: 'baremetals',
        },
      },
      {
        layout: {
          component: 'Ring',
          h: 3,
          w: 5,
          x: 0,
          y: 4,
        },
        params: {
          all_usage_key: 'hosts.cpu',
          brand: 'OneCloud',
          cloud_env: 'onpremise',
          name: i18n.t('dashboard.text_135'),
          region: 'default',
          usage_key: 'all.servers.cpu',
        },
      },
      {
        layout: {
          component: 'NumberCard',
          h: 2,
          w: 5,
          x: 5,
          y: 0,
        },
        params: {
          brand: 'OneCloud',
          cloud_env: 'onpremise',
          name: i18n.t('dashboard.text_136'),
          region: 'default',
          usage_key: 'hosts.any_pool',
        },
      },
      {
        layout: {
          component: 'ResourceHistoryLine',
          h: 5,
          w: 10,
          x: 0,
          y: 12,
        },
        params: {
          name: i18n.t('dashboard.text_137'),
        },
      },
      {
        layout: {
          component: 'BillHistoryLine',
          h: 5,
          w: 10,
          x: 10,
          y: 12,
        },
        params: {
          name: i18n.t('dashboard.text_138'),
        },
      },
      {
        layout: {
          component: 'Quota',
          h: 7,
          w: 5,
          x: 0,
          y: 17,
        },
        params: {
          name: i18n.t('dashboard.text_139'),
          field: 'cpu',
          titleKey: 'domain',
          resource: 'quotas',
        },
      },
      {
        layout: {
          component: 'Quota',
          h: 7,
          w: 5,
          x: 5,
          y: 17,
        },
        params: {
          name: i18n.t('dashboard.text_140'),
          field: 'memory',
          titleKey: 'domain',
          resource: 'quotas',
        },
      },
      {
        layout: {
          component: 'Quota',
          h: 7,
          w: 5,
          x: 10,
          y: 17,
        },
        params: {
          name: i18n.t('dashboard.text_141'),
          field: 'storage',
          titleKey: 'domain',
          resource: 'quotas',
        },
      },
      {
        layout: {
          component: 'Quota',
          h: 7,
          w: 5,
          x: 15,
          y: 17,
        },
        params: {
          name: i18n.t('dashboard.text_142'),
          field: 'eip',
          titleKey: 'domain',
          resource: 'region_quotas',
        },
      },
      {
        layout: {
          component: 'Quota',
          h: 7,
          w: 5,
          x: 0,
          y: 24,
        },
        params: {
          name: i18n.t('dashboard.text_143'),
          field: 'port',
          titleKey: 'domain',
          resource: 'region_quotas',
        },
      },
      {
        layout: {
          component: 'Quota',
          h: 7,
          w: 5,
          x: 5,
          y: 24,
        },
        params: {
          name: i18n.t('dashboard.text_144'),
          field: 'isolated_device',
          titleKey: 'domain',
          resource: 'quotas',
        },
      },
      {
        layout: {
          component: 'Quota',
          h: 7,
          w: 5,
          x: 10,
          y: 24,
        },
        params: {
          name: i18n.t('dashboard.text_145'),
          field: 'image',
          titleKey: 'domain',
          resource: 'image_quotas',
        },
      },
      {
        layout: {
          component: 'Quota',
          h: 7,
          w: 5,
          x: 15,
          y: 24,
        },
        params: {
          name: i18n.t('dashboard.text_146'),
          field: 'snapshot',
          titleKey: 'domain',
          resource: 'region_quotas',
        },
      },
    ],
  },
  domain: {
    options: [
      { id: 'dashboard-domain-default', name: i18n.t('dashboard.text_121') },
    ],
    'dashboard-domain-default': [
      {
        layout: {
          component: 'Ring',
          h: 3,
          w: 5,
          x: 15,
          y: 6,
        },
        params: {
          all_usage_key: 'domain.eip',
          name: i18n.t('dashboard.text_156'),
          usage_key: 'domain.eip.used',
        },
      },
      {
        layout: {
          component: 'NumberCard',
          h: 2,
          w: 10,
          x: 10,
          y: 2,
        },
        params: {
          name: i18n.t('dashboard.text_161'),
          usage_key: 'domain.servers.disk',
        },
      },
      {
        layout: {
          component: 'NumberCard',
          h: 2,
          w: 5,
          x: 0,
          y: 4,
        },
        params: {
          name: i18n.t('dashboard.text_153'),
          usage_key: 'domain.servers.isolated_devices',
        },
      },
      {
        layout: {
          component: 'NumberCard',
          h: 2,
          w: 5,
          x: 10,
          y: 4,
        },
        params: {
          name: i18n.t('dashboard.text_150'),
          usage_key: 'domain.bucket_objects',
        },
      },
      {
        layout: {
          component: 'Ring',
          h: 3,
          w: 5,
          x: 0,
          y: 6,
        },
        params: {
          all_usage_key: 'domain.hosts.cpu',
          brand: 'OneCloud',
          cloud_env: 'onpremise',
          name: i18n.t('dashboard.text_162'),
          usage_key: 'domain.servers.cpu',
        },
      },
      {
        layout: {
          component: 'NumberCard',
          h: 2,
          w: 5,
          x: 0,
          y: 0,
        },
        params: {
          name: i18n.t('dashboard.text_130'),
          usage_key: 'domain.servers.any_pool',
        },
      },
      {
        layout: {
          component: 'Top5',
          h: 5,
          w: 5,
          x: 10,
          y: 9,
        },
        params: {
          brand: 'OneCloud',
          limit: 5,
          name: i18n.t('dashboard.text_163'),
          order: 'TOP',
          resType: 'server',
          time: 108000,
          usage: 'write_bps,vm_diskio',
        },
      },
      {
        layout: {
          component: 'Ring',
          h: 3,
          w: 5,
          x: 10,
          y: 6,
        },
        params: {
          all_usage_key: 'domain.storages',
          brand: 'OneCloud',
          cloud_env: 'onpremise',
          name: i18n.t('dashboard.text_164'),
          usage_key: 'domain.disks',
        },
      },
      {
        layout: {
          component: 'NumberCard',
          h: 2,
          w: 10,
          x: 10,
          y: 0,
        },
        params: {
          name: i18n.t('dashboard.text_134'),
          usage_key: 'domain.baremetals',
        },
      },
      {
        layout: {
          component: 'NumberCard',
          h: 2,
          w: 5,
          x: 5,
          y: 2,
        },
        params: {
          name: i18n.t('dashboard.text_165'),
          usage_key: 'domain.servers.memory',
        },
      },
      {
        layout: {
          component: 'Log',
          h: 5,
          w: 5,
          x: 15,
          y: 9,
        },
        params: {
          limit: 5,
          name: i18n.t('dashboard.text_131'),
        },
      },
      {
        layout: {
          component: 'Top5',
          h: 5,
          w: 5,
          x: 5,
          y: 9,
        },
        params: {
          brand: 'OneCloud',
          limit: 5,
          name: i18n.t('dashboard.text_166'),
          order: 'TOP',
          resType: 'server',
          time: 108000,
          usage: 'read_bps,vm_diskio',
        },
      },
      {
        layout: {
          component: 'NumberCard',
          h: 2,
          w: 5,
          x: 15,
          y: 4,
        },
        params: {
          name: i18n.t('dashboard.text_154'),
          usage_key: 'domain.buckets',
        },
      },
      {
        layout: {
          component: 'NumberCard',
          h: 2,
          w: 5,
          x: 0,
          y: 2,
        },
        params: {
          name: i18n.t('dashboard.text_167'),
          usage_key: 'domain.servers.cpu',
        },
      },
      {
        layout: {
          component: 'NumberCard',
          h: 2,
          w: 5,
          x: 5,
          y: 4,
        },
        params: {
          name: i18n.t('dashboard.text_158'),
          usage_key: 'domain.bucket_bytes',
        },
      },
      {
        layout: {
          component: 'Top5',
          h: 5,
          w: 5,
          x: 0,
          y: 9,
        },
        params: {
          brand: 'OneCloud',
          limit: 5,
          name: i18n.t('dashboard.text_168'),
          order: 'TOP',
          resType: 'server',
          time: 108000,
          usage: 'usage_active,vm_cpu',
        },
      },
      {
        layout: {
          component: 'Ring',
          h: 3,
          w: 5,
          x: 5,
          y: 6,
        },
        params: {
          all_usage_key: 'domain.hosts.memory',
          brand: 'OneCloud',
          cloud_env: 'onpremise',
          name: i18n.t('dashboard.text_169'),
          usage_key: 'domain.servers.memory',
        },
      },
      {
        layout: {
          component: 'NumberCard',
          h: 2,
          w: 5,
          x: 5,
          y: 0,
        },
        params: {
          name: i18n.t('dashboard.text_136'),
          usage_key: 'domain.hosts.any_pool',
        },
      },
      {
        layout: {
          component: 'Quota',
          h: 7,
          w: 5,
          x: 0,
          y: 14,
        },
        params: {
          name: i18n.t('dashboard.text_170'),
          field: 'cpu',
          titleKey: 'tenant',
          resource: 'quotas',
        },
      },
      {
        layout: {
          component: 'Quota',
          h: 7,
          w: 5,
          x: 5,
          y: 14,
        },
        params: {
          name: i18n.t('dashboard.text_171'),
          field: 'memory',
          titleKey: 'tenant',
          resource: 'quotas',
        },
      },
      {
        layout: {
          component: 'Quota',
          h: 7,
          w: 5,
          x: 10,
          y: 14,
        },
        params: {
          name: i18n.t('dashboard.text_172'),
          field: 'storage',
          titleKey: 'tenant',
          resource: 'quotas',
        },
      },
      {
        layout: {
          component: 'Quota',
          h: 7,
          w: 5,
          x: 15,
          y: 14,
        },
        params: {
          name: i18n.t('dashboard.text_173'),
          field: 'eip',
          titleKey: 'tenant',
          resource: 'region_quotas',
        },
      },
      {
        layout: {
          component: 'Quota',
          h: 7,
          w: 5,
          x: 0,
          y: 21,
        },
        params: {
          name: i18n.t('dashboard.text_174'),
          field: 'port',
          titleKey: 'tenant',
          resource: 'region_quotas',
        },
      },
      {
        layout: {
          component: 'Quota',
          h: 7,
          w: 5,
          x: 0,
          y: 21,
        },
        params: {
          name: i18n.t('dashboard.text_174'),
          field: 'port',
          titleKey: 'tenant',
          resource: 'region_quotas',
        },
      },
      {
        layout: {
          component: 'Quota',
          h: 7,
          w: 5,
          x: 5,
          y: 21,
        },
        params: {
          name: i18n.t('dashboard.text_175'),
          field: 'isolated_device',
          titleKey: 'tenant',
          resource: 'quotas',
        },
      },
      {
        layout: {
          component: 'Quota',
          h: 7,
          w: 5,
          x: 10,
          y: 21,
        },
        params: {
          name: i18n.t('dashboard.text_176'),
          field: 'image',
          titleKey: 'tenant',
          resource: 'image_quotas',
        },
      },
      {
        layout: {
          component: 'Quota',
          h: 7,
          w: 5,
          x: 15,
          y: 21,
        },
        params: {
          name: i18n.t('dashboard.text_177'),
          field: 'snapshot',
          titleKey: 'tenant',
          resource: 'region_quotas',
        },
      },
    ],
  },
  project: {
    options: [
      { id: 'dashboard-project-default', name: i18n.t('dashboard.text_121') },
    ],
    'dashboard-project-default': [
      {
        layout: {
          component: 'Ring',
          h: 3,
          w: 5,
          x: 15,
          y: 6,
        },
        params: {
          all_usage_key: 'eip',
          name: i18n.t('dashboard.text_156'),
          usage_key: 'eip.used',
        },
      },
      {
        layout: {
          component: 'NumberCard',
          h: 2,
          w: 5,
          x: 0,
          y: 4,
        },
        params: {
          name: i18n.t('dashboard.text_148'),
          usage_key: 'eip',
        },
      },
      {
        layout: {
          component: 'Ring',
          h: 3,
          w: 5,
          x: 10,
          y: 6,
        },
        params: {
          all_usage_key: 'ports',
          name: i18n.t('dashboard.text_152'),
          usage_key: 'nics',
        },
      },
      {
        layout: {
          component: 'Top5',
          h: 5,
          w: 5,
          x: 0,
          y: 9,
        },
        params: {
          brand: 'OneCloud',
          limit: 5,
          name: i18n.t('dashboard.text_178'),
          order: 'TOP',
          resType: 'server',
          time: 36000,
          usage: 'usage_active,vm_cpu',
        },
      },
      {
        layout: {
          component: 'Top5',
          h: 5,
          w: 5,
          x: 10,
          y: 9,
        },
        params: {
          brand: 'OneCloud',
          limit: 5,
          name: i18n.t('dashboard.text_179'),
          order: 'TOP',
          resType: 'server',
          time: 36000,
          usage: 'write_bps,vm_diskio',
        },
      },
      {
        layout: {
          component: 'NumberCard',
          h: 2,
          w: 5,
          x: 5,
          y: 0,
        },
        params: {
          name: i18n.t('dashboard.text_149'),
          usage_key: 'servers.cpu',
        },
      },
      {
        layout: {
          component: 'NumberCard',
          h: 2,
          w: 5,
          x: 10,
          y: 4,
        },
        params: {
          name: i18n.t('dashboard.text_150'),
          usage_key: 'bucket_objects',
        },
      },
      {
        layout: {
          component: 'Top5',
          h: 5,
          w: 5,
          x: 5,
          y: 9,
        },
        params: {
          brand: 'OneCloud',
          limit: 5,
          name: i18n.t('dashboard.text_180'),
          order: 'TOP',
          resType: 'server',
          time: 36000,
          usage: 'read_bps,vm_diskio',
        },
      },
      {
        layout: {
          component: 'Ring',
          h: 3,
          w: 5,
          x: 0,
          y: 6,
        },
        params: {
          all_usage_key: 'servers',
          name: i18n.t('dashboard.text_151'),
          usage_key: 'ready_servers',
        },
      },
      {
        layout: {
          component: 'NumberCard',
          h: 2,
          w: 5,
          x: 0,
          y: 0,
        },
        params: {
          name: i18n.t('dashboard.text_160'),
          usage_key: 'servers.any_pool',
        },
      },
      {
        layout: {
          component: 'NumberCard',
          h: 2,
          w: 5,
          x: 5,
          y: 4,
        },
        params: {
          name: i18n.t('dashboard.text_158'),
          usage_key: 'bucket_bytes',
        },
      },
      {
        layout: {
          component: 'Log',
          h: 5,
          w: 5,
          x: 15,
          y: 9,
        },
        params: {
          limit: 5,
          name: i18n.t('dashboard.text_131'),
        },
      },
      {
        layout: {
          component: 'NumberCard',
          h: 2,
          w: 10,
          x: 10,
          y: 0,
        },
        params: {
          name: i18n.t('dashboard.text_157'),
          usage_key: 'servers.memory',
        },
      },
      {
        layout: {
          component: 'Ring',
          h: 3,
          w: 5,
          x: 5,
          y: 6,
        },
        params: {
          all_usage_key: 'disks.count',
          name: i18n.t('dashboard.text_147'),
          usage_key: 'disks.detached.count',
        },
      },
      {
        layout: {
          component: 'NumberCard',
          h: 2,
          w: 5,
          x: 0,
          y: 2,
        },
        params: {
          name: i18n.t('dashboard.text_159'),
          usage_key: 'disks',
        },
      },
      {
        layout: {
          component: 'NumberCard',
          h: 2,
          w: 5,
          x: 5,
          y: 2,
        },
        params: {
          name: i18n.t('dashboard.text_155'),
          usage_key: 'nics',
        },
      },
      {
        layout: {
          component: 'NumberCard',
          h: 2,
          w: 5,
          x: 15,
          y: 4,
        },
        params: {
          name: i18n.t('dashboard.text_154'),
          usage_key: 'buckets',
        },
      },
      {
        layout: {
          component: 'NumberCard',
          h: 2,
          w: 10,
          x: 10,
          y: 2,
        },
        params: {
          name: i18n.t('dashboard.text_153'),
          usage_key: 'servers.isolated_devices',
        },
      },
      {
        layout: {
          component: 'ResourceHistoryLine',
          h: 5,
          w: 10,
          x: 0,
          y: 14,
        },
        params: {
          name: i18n.t('dashboard.text_137'),
        },
      },
      {
        layout: {
          component: 'BillHistoryLine',
          h: 5,
          w: 10,
          x: 10,
          y: 14,
        },
        params: {
          name: i18n.t('dashboard.text_138'),
        },
      },
    ],
  },
}
