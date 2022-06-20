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
          y: 0,
        },
        params: {
          name: i18n.t('dashboard.text_130'),
          usage_key: 'all.servers',
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
          usage_key: 'hosts',
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
          name: i18n.t('dashboard.text_134'),
          usage_key: 'baremetals',
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
          component: 'NumberCard',
          h: 2,
          w: 5,
          x: 0,
          y: 2,
        },
        params: {
          name: i18n.t('dashboard.text_122'),
          usage_key: 'all.servers.cpu',
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
          name: i18n.t('dashboard.text_127'),
          usage_key: 'all.servers.memory',
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
          name: i18n.t('dashboard.text_123'),
          usage_key: 'all.servers.disk',
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
          all_usage_key: 'all.servers',
          name: i18n.t('dashboard.text_151'),
          usage_key: 'all.ready_servers',
          usage_label: i18n.t('dashboard.shutdown'),
          un_usage_label: i18n.t('dashboard.not_shutdown'),
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
          all_usage_key: 'all.disks.count',
          name: i18n.t('dashboard.text_147'),
          usage_key: 'all.disks.mounted.count',
          usage_label: i18n.t('dashboard.mounted'),
          un_usage_label: i18n.t('dashboard.not_mounted'),
          color: 'reverse',
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
          all_usage_key: 'all.ports',
          name: i18n.t('dashboard.text_152'),
          usage_key: 'all.nics',
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
          all_usage_key: 'all.eip.floating_ip',
          name: i18n.t('dashboard.text_156'),
          usage_key: 'all.eip.floating_ip.used',
          color: 'reverse',
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
          limit: 5,
          name: i18n.t('dashboard.text_126'),
          order: 'TOP',
          resType: 'server',
          time: 108000,
          usage: 'usage_active,vm_cpu',
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
          limit: 5,
          name: i18n.t('dashboard.text_133'),
          order: 'TOP',
          resType: 'server',
          time: 108000,
          usage: 'read_bps,vm_diskio',
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
          limit: 5,
          name: i18n.t('dashboard.text_125'),
          order: 'TOP',
          resType: 'server',
          time: 108000,
          usage: 'write_bps,vm_diskio',
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
      // {
      //   layout: {
      //     component: 'ResourceHistoryLine',
      //     h: 5,
      //     w: 10,
      //     x: 0,
      //     y: 12,
      //   },
      //   params: {
      //     name: i18n.t('dashboard.text_137'),
      //   },
      // },
      // {
      //   layout: {
      //     component: 'BillHistoryLine',
      //     h: 5,
      //     w: 10,
      //     x: 10,
      //     y: 12,
      //   },
      //   params: {
      //     name: i18n.t('dashboard.text_138'),
      //   },
      // },
      {
        layout: {
          component: 'Quota',
          h: 7,
          w: 5,
          x: 0,
          y: 12,
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
          y: 12,
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
          y: 12,
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
          y: 12,
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
          y: 19,
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
          y: 19,
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
          y: 19,
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
          y: 19,
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
          component: 'NumberCard',
          h: 2,
          w: 5,
          x: 0,
          y: 0,
        },
        params: {
          name: i18n.t('dashboard.text_160'),
          usage_key: 'domain.servers',
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
          usage_key: 'domain.servers.cpu',
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
          usage_key: 'domain.servers.memory',
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
          component: 'NumberCard',
          h: 2,
          w: 5,
          x: 0,
          y: 2,
        },
        params: {
          name: i18n.t('dashboard.text_159'),
          usage_key: 'domain.disks',
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
          usage_key: 'domain.nics',
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
          name: i18n.t('dashboard.text_153'),
          usage_key: 'domain.servers.isolated_devices',
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
          name: i18n.t('dashboard.text_158'),
          usage_key: 'domain.bucket_bytes',
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
          name: i18n.t('dashboard.text_150'),
          usage_key: 'domain.bucket_objects',
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
          name: i18n.t('dashboard.text_154'),
          usage_key: 'domain.buckets',
        },
      },
      {
        layout: {
          component: 'SuggestsysAlertsOverview',
          h: 5,
          w: 5,
          x: 15,
          y: 4,
        },
        params: {
          currency: i18n.t('dashboard.currency_name'),
          name: i18n.t('dashboard.text_54'),
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
          all_usage_key: 'domain.servers',
          name: i18n.t('dashboard.text_151'),
          usage_key: 'domain.ready_servers',
          usage_label: i18n.t('dashboard.shutdown'),
          un_usage_label: i18n.t('dashboard.not_shutdown'),
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
          all_usage_key: 'domain.disks.count',
          name: i18n.t('dashboard.text_147'),
          usage_key: 'domain.disks.mounted.count',
          usage_label: i18n.t('dashboard.mounted'),
          un_usage_label: i18n.t('dashboard.not_mounted'),
          color: 'reverse',
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
          all_usage_key: 'domain.eip.floating_ip',
          name: i18n.t('dashboard.text_156'),
          usage_key: 'domain.eip.floating_ip.used',
          color: 'reverse',
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
          limit: 5,
          name: i18n.t('dashboard.text_126'),
          order: 'TOP',
          resType: 'server',
          time: 108000,
          usage: 'usage_active,vm_cpu',
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
          limit: 5,
          name: i18n.t('dashboard.text_133'),
          order: 'TOP',
          resType: 'server',
          time: 108000,
          usage: 'read_bps,vm_diskio',
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
          limit: 5,
          name: i18n.t('dashboard.text_125'),
          order: 'TOP',
          resType: 'server',
          time: 108000,
          usage: 'write_bps,vm_diskio',
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
          name: i18n.t('dashboard.text_17'),
        },
      },
      // {
      //   layout: {
      //     component: 'ResourceHistoryLine',
      //     h: 5,
      //     w: 10,
      //     x: 0,
      //     y: 14,
      //   },
      //   params: {
      //     name: i18n.t('dashboard.text_90'),
      //   },
      // },
      // {
      //   layout: {
      //     component: 'BillHistoryLine',
      //     h: 5,
      //     w: 10,
      //     x: 10,
      //     y: 14,
      //   },
      //   params: {
      //     name: i18n.t('dashboard.text_88'),
      //   },
      // },
      {
        layout: {
          component: 'Quota',
          h: 7,
          w: 5,
          x: 0,
          y: 14,
        },
        params: {
          field: 'cpu',
          name: i18n.t('dashboard.text_170'),
          resource: 'quotas',
          titleKey: 'tenant',
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
          field: 'memory',
          name: i18n.t('dashboard.text_171'),
          resource: 'quotas',
          titleKey: 'tenant',
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
          field: 'storage',
          name: i18n.t('dashboard.text_172'),
          resource: 'quotas',
          titleKey: 'tenant',
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
          field: 'eip',
          name: i18n.t('dashboard.text_173'),
          resource: 'region_quotas',
          titleKey: 'tenant',
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
          field: 'port',
          name: i18n.t('dashboard.text_174'),
          resource: 'region_quotas',
          titleKey: 'tenant',
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
          field: 'isolated_device',
          name: i18n.t('dashboard.text_175'),
          resource: 'quotas',
          titleKey: 'tenant',
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
          field: 'image',
          name: i18n.t('dashboard.text_176'),
          resource: 'image_quotas',
          titleKey: 'tenant',
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
          field: 'snapshot',
          name: i18n.t('dashboard.text_170'),
          resource: 'region_quotas',
          titleKey: 'tenant',
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
          y: 0,
        },
        params: {
          name: i18n.t('dashboard.text_157'),
          usage_key: 'servers.memory',
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
          component: 'NumberCard',
          h: 2,
          w: 5,
          x: 0,
          y: 4,
        },
        params: {
          name: i18n.t('dashboard.text_148'),
          usage_key: 'eip.floating_ip',
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
          component: 'SuggestsysAlertsOverview',
          h: 5,
          w: 5,
          x: 15,
          y: 4,
        },
        params: {
          currency: i18n.t('dashboard.currency_name'),
          name: i18n.t('dashboard.text_54'),
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
          usage_label: i18n.t('dashboard.shutdown'),
          un_usage_label: i18n.t('dashboard.not_shutdown'),
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
          usage_key: 'disks.mounted.count',
          usage_label: i18n.t('dashboard.mounted'),
          un_usage_label: i18n.t('dashboard.not_mounted'),
          color: 'reverse',
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
          all_usage_key: 'eip.floating_ip',
          name: i18n.t('dashboard.text_156'),
          usage_key: 'eip.floating_ip.used',
          color: 'reverse',
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
          limit: 5,
          name: i18n.t('dashboard.text_126'),
          order: 'TOP',
          resType: 'server',
          time: 108000,
          usage: 'usage_active,vm_cpu',
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
          limit: 5,
          name: i18n.t('dashboard.text_133'),
          order: 'TOP',
          resType: 'server',
          time: 108000,
          usage: 'read_bps,vm_diskio',
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
          limit: 5,
          name: i18n.t('dashboard.text_125'),
          order: 'TOP',
          resType: 'server',
          time: 108000,
          usage: 'write_bps,vm_diskio',
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
      // {
      //   layout: {
      //     component: 'ResourceHistoryLine',
      //     h: 5,
      //     w: 10,
      //     x: 0,
      //     y: 14,
      //   },
      //   params: {
      //     name: i18n.t('dashboard.text_90'),
      //   },
      // },
      // {
      //   layout: {
      //     component: 'BillHistoryLine',
      //     h: 5,
      //     w: 10,
      //     x: 10,
      //     y: 14,
      //   },
      //   params: {
      //     name: i18n.t('dashboard.text_88'),
      //   },
      // },
      {
        layout: {
          component: 'ProjectQuota',
          h: 3,
          w: 5,
          x: 0,
          y: 14,
        },
        params: {
          all_usage_key: 'cpu',
          name: i18n.t('dashboard.cpu_quota'),
          type: 'project-quota-common',
          usage_key: 'usage.cpu',
        },
      },
      {
        layout: {
          component: 'ProjectQuota',
          h: 3,
          w: 5,
          x: 5,
          y: 14,
        },
        params: {
          all_usage_key: 'memory',
          name: i18n.t('dashboard.memory_quota'),
          type: 'project-quota-common',
          usage_key: 'usage.memory',
        },
      },
      {
        layout: {
          component: 'ProjectQuota',
          h: 3,
          w: 5,
          x: 10,
          y: 14,
        },
        params: {
          all_usage_key: 'storage',
          name: i18n.t('dashboard.storage_quota'),
          type: 'project-quota-common',
          usage_key: 'usage.storage',
        },
      },
      {
        layout: {
          component: 'ProjectQuota',
          h: 3,
          w: 5,
          x: 15,
          y: 14,
        },
        params: {
          all_usage_key: 'eip',
          name: i18n.t('dashboard.eip_quota'),
          type: 'project-quota-region',
          usage_key: 'usage.eip',
        },
      },
      {
        layout: {
          component: 'ProjectQuota',
          h: 3,
          w: 5,
          x: 0,
          y: 17,
        },
        params: {
          all_usage_key: 'port',
          name: i18n.t('dashboard.port_quota'),
          type: 'project-quota-region',
          usage_key: 'usage.port',
        },
      },
      {
        layout: {
          component: 'ProjectQuota',
          h: 3,
          w: 5,
          x: 5,
          y: 17,
        },
        params: {
          all_usage_key: 'isolated_device',
          name: i18n.t('dashboard.gpu_quota'),
          type: 'project-quota-common',
          usage_key: 'usage.isolated_device',
        },
      },
      {
        layout: {
          component: 'ProjectQuota',
          h: 3,
          w: 5,
          x: 10,
          y: 17,
        },
        params: {
          all_usage_key: 'image',
          name: i18n.t('dashboard.image_quota'),
          type: 'project-quota-image',
          usage_key: 'usage.image',
        },
      },
      {
        layout: {
          component: 'ProjectQuota',
          h: 3,
          w: 5,
          x: 15,
          y: 17,
        },
        params: {
          all_usage_key: 'snapshot',
          name: i18n.t('dashboard.snapshot_quota'),
          type: 'project-quota-region',
          usage_key: 'usage.snapshot',
        },
      },
    ],
  },
}
