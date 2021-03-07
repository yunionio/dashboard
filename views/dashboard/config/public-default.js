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
          brand: 'OneCloud',
          cloud_env: 'onpremise',
          name: i18n.t('dashboard.text_130'),
          region: 'default',
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
          brand: 'OneCloud',
          cloud_env: 'onpremise',
          name: i18n.t('dashboard.text_136'),
          region: 'default',
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
          brand: 'OneCloud',
          cloud_env: 'onpremise',
          name: i18n.t('dashboard.text_134'),
          region: 'default',
          usage_key: 'baremetals',
        },
      },
      {
        layout: {
          component: 'NumberCard',
          h: 2,
          w: 5,
          x: 15,
          y: 0,
        },
        params: {
          name: i18n.t('dashboard.text_154'),
          usage_key: 'all.buckets',
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
          component: 'NumberCard',
          h: 2,
          w: 5,
          x: 15,
          y: 2,
        },
        params: {
          name: i18n.t('dashboard.text_158'),
          usage_key: 'all.bucket_bytes',
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
          component: 'Ring',
          h: 3,
          w: 5,
          x: 0,
          y: 7,
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
          component: 'Ring',
          h: 3,
          w: 5,
          x: 5,
          y: 7,
        },
        params: {
          all_usage_key: 'ports',
          name: i18n.t('dashboard.text_152'),
          usage_key: 'nics',
        },
      },
      {
        layout: {
          component: 'Ring',
          h: 3,
          w: 5,
          x: 10,
          y: 7,
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
          x: 15,
          y: 7,
        },
        params: {
          all_usage_key: 'disks.count',
          name: i18n.t('dashboard.text_147'),
          usage_key: 'disks.attached.count',
          usage_label: i18n.t('dashboard.mounted'),
          un_usage_label: i18n.t('dashboard.not_mounted'),
          color: 'reverse',
        },
      },
      {
        layout: {
          component: 'Top5',
          h: 5,
          w: 5,
          x: 0,
          y: 10,
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
          component: 'Top5',
          h: 5,
          w: 5,
          x: 5,
          y: 10,
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
          component: 'Top5',
          h: 5,
          w: 5,
          x: 10,
          y: 10,
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
          x: 15,
          y: 10,
        },
        params: {
          brand: 'OneCloud',
          limit: 5,
          name: i18n.t('dashboard.net.send.top5'),
          order: 'TOP',
          resType: 'server',
          time: 18000,
          usage: 'bps_sent,vm_netio',
        },
      },
    ],
  },
}
