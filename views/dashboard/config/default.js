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
          w: 5,
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
          component: 'Notify',
          h: 4,
          w: 5,
          x: 15,
          y: 0,
        },
        params: {
          name: i18n.t('dashboard.text_124'),
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
          usage_key: 'all.servers',
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
          w: 5,
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
          usage_key: 'hosts',
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
          y: 6,
          w: 5,
          h: 3,
          component: 'Ring',
          x: 5,
        },
        params: {
          all_usage_key: 'disks.count',
          name: i18n.t('dashboard.text_147'),
          usage_key: 'disks.detached.count',
        },
      }, {
        layout: {
          y: 4,
          w: 5,
          h: 2,
          component: 'NumberCard',
          x: 0,
        },
        params: {
          name: i18n.t('dashboard.text_148'),
          usage_key: 'eip',
        },
      }, {
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
      }, {
        params: {
          usage_key: 'servers.cpu',
          name: i18n.t('dashboard.text_149'),
        },
        layout: {
          component: 'NumberCard',
          x: 5,
          y: 0,
          w: 5,
          h: 2,
        },
      }, {
        layout: {
          component: 'NumberCard',
          x: 10,
          y: 4,
          w: 5,
          h: 2,
        },
        params: {
          name: i18n.t('dashboard.text_150'),
          usage_key: 'bucket_objects',
        },
      }, {
        layout: {
          x: 0,
          y: 6,
          w: 5,
          h: 3,
          component: 'Ring',
        },
        params: {
          usage_key: 'ready_servers',
          all_usage_key: 'servers',
          name: i18n.t('dashboard.text_151'),
        },
      }, {
        params: {
          all_usage_key: 'ports',
          name: i18n.t('dashboard.text_152'),
          usage_key: 'nics',
        },
        layout: {
          component: 'Ring',
          x: 10,
          y: 6,
          w: 5,
          h: 3,
        },
      }, {
        layout: {
          x: 15,
          y: 0,
          w: 5,
          h: 4,
          component: 'Notify',
        },
        params: {
          name: i18n.t('dashboard.text_124'),
        },
      }, {
        layout: {
          x: 10,
          y: 2,
          w: 5,
          h: 2,
          component: 'NumberCard',
        },
        params: {
          usage_key: 'servers.isolated_devices',
          name: i18n.t('dashboard.text_153'),
        },
      }, {
        params: {
          name: i18n.t('dashboard.text_137'),
        },
        layout: {
          component: 'ResourceHistoryLine',
          h: 5,
          w: 10,
          x: 0,
          y: 14,
        },
      }, {
        layout: {
          h: 2,
          component: 'NumberCard',
          x: 15,
          y: 4,
          w: 5,
        },
        params: {
          usage_key: 'buckets',
          name: i18n.t('dashboard.text_154'),
        },
      }, {
        layout: {
          h: 2,
          component: 'NumberCard',
          x: 5,
          y: 2,
          w: 5,
        },
        params: {
          name: i18n.t('dashboard.text_155'),
          usage_key: 'nics',
        },
      }, {
        layout: {
          y: 6,
          w: 5,
          h: 3,
          component: 'Ring',
          x: 15,
        },
        params: {
          name: i18n.t('dashboard.text_156'),
          usage_key: 'eip.used',
          all_usage_key: 'eip',
        },
      }, {
        layout: {
          x: 10,
          y: 0,
          w: 5,
          h: 2,
          component: 'NumberCard',
        },
        params: {
          name: i18n.t('dashboard.text_157'),
          usage_key: 'servers.memory',
        },
      }, {
        params: {
          name: i18n.t('dashboard.text_158'),
          usage_key: 'bucket_bytes',
        },
        layout: {
          x: 5,
          y: 4,
          w: 5,
          h: 2,
          component: 'NumberCard',
        },
      }, {
        params: {
          usage_key: 'disks',
          name: i18n.t('dashboard.text_159'),
        },
        layout: {
          w: 5,
          h: 2,
          component: 'NumberCard',
          x: 0,
          y: 2,
        },
      }, {
        layout: {
          h: 2,
          component: 'NumberCard',
          x: 0,
          y: 0,
          w: 5,
        },
        params: {
          usage_key: 'servers',
          name: i18n.t('dashboard.text_160'),
        },
      }, {
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
          name: i18n.t('dashboard.text_126'),
          order: 'TOP',
          resType: 'server',
          time: 18000,
          usage: 'usage_active,vm_cpu',
        },
      }, {
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
          name: i18n.t('dashboard.text_133'),
          order: 'TOP',
          resType: 'server',
          time: 18000,
          usage: 'read_bps,vm_diskio',
        },
      }, {
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
          name: i18n.t('dashboard.text_125'),
          order: 'TOP',
          resType: 'server',
          time: 18000,
          usage: 'write_bps,vm_diskio',
        },
      }, {
        layout: {
          component: 'Log',
          h: 5,
          w: 5,
          x: 15,
          y: 9,
        },
        params: {
          limit: 4,
          name: i18n.t('dashboard.text_131'),
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
          component: 'NumberCard',
          h: 2,
          w: 5,
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
          y: 0,
        },
        params: {
          name: i18n.t('dashboard.text_160'),
          usage_key: 'servers',
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
          component: 'Log',
          h: 5,
          w: 5,
          x: 15,
          y: 9,
        },
        params: {
          limit: 4,
          name: i18n.t('dashboard.text_131'),
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
          component: 'Top5',
          h: 5,
          w: 5,
          x: 10,
          y: 9,
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
          name: i18n.t('dashboard.text_133'),
          order: 'TOP',
          resType: 'server',
          time: 18000,
          usage: 'read_bps,vm_diskio',
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
          name: i18n.t('dashboard.text_90'),
        },
      },
      {
        layout: {
          component: 'NumberCard',
          h: 2,
          w: 5,
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
          component: 'Notify',
          h: 4,
          w: 5,
          x: 15,
          y: 0,
        },
        params: {
          name: i18n.t('dashboard.text_19'),
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
          component: 'BillHistoryLine',
          h: 5,
          w: 10,
          x: 10,
          y: 14,
        },
        params: {
          name: i18n.t('dashboard.text_88'),
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
          component: 'Top5',
          h: 5,
          w: 5,
          x: 0,
          y: 9,
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
    ],
  },
}
