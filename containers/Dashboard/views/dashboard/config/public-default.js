import i18n from '@/locales'
export default {
  system: {
    options: [
      { id: 'dashboard-system-default', name: i18n.t('dashboard.text_121') },
    ],
    'dashboard-system-default': [
      {
        layout: {
          x: 0,
          y: 0,
          w: 8,
          h: 6,
          component: 'UserCount',
        },
        params: {
          name: '租户数量',
        },
      },
      {
        layout: {
          x: 0,
          y: 24,
          w: 12,
          h: 6,
          component: 'MonitorInfo',
        },
        params: {
          dashboardId: 'cc355b4c-24c4-4043-8b4f-27e708111277',
          name: '虚拟机网络使用情况(每秒接收字节数)',
          panelId: 'a372ba71-59bd-4b2c-895e-a0b9f34248ea',
          panelName: '虚拟机网络使用情况(每秒接收字节数)',
        },
      },
      {
        layout: {
          x: 24,
          y: 12,
          w: 8,
          h: 18,
          component: 'Log',
        },
        params: {
          name: '操作日志',
          limit: 12,
        },
      },
      {
        layout: {
          x: 16,
          y: 0,
          w: 8,
          h: 6,
          component: 'Ring',
        },
        params: {
          all_usage_key: 'all.servers',
          color: 'default',
          name: '虚拟机数量',
          regionAccountType: 'region',
          un_usage_label: '未使用',
          usage_key: 'all.running_servers',
          usage_label: '已使用',
        },
      },
      {
        layout: {
          x: 12,
          y: 18,
          w: 12,
          h: 6,
          component: 'MonitorInfo',
        },
        params: {
          dashboardId: 'cc355b4c-24c4-4043-8b4f-27e708111277',
          name: '虚拟机内存使用情况(内存使用率)',
          panelId: '047cccc4-66fe-4f2e-81d4-9fd461893ff2',
          panelName: '虚拟机内存使用情况(内存使用率)',
        },
      },
      {
        layout: {
          x: 24,
          y: 30,
          w: 8,
          h: 8,
          component: 'Top5',
        },
        params: {
          name: '磁盘写入速率TOP5',
          brand: 'OneCloud',
          resType: 'server',
          usage: 'write_bps,vm_diskio',
          order: 'TOP',
          limit: 5,
          time: 5184000,
          dimensionId: 'vm_id',
          color: 'color5',
        },
      },
      {
        layout: {
          x: 0,
          y: 30,
          w: 8,
          h: 8,
          component: 'Top5',
        },
        params: {
          name: 'CPU使用率TOP5',
          brand: 'OneCloud',
          resType: 'server',
          usage: 'usage_active,vm_cpu',
          order: 'TOP',
          limit: 5,
          time: 5184000,
          dimensionId: 'vm_id',
          color: 'color3',
        },
      },
      {
        layout: {
          x: 0,
          y: 18,
          w: 12,
          h: 6,
          component: 'MonitorInfo',
        },
        params: {
          dashboardId: 'cc355b4c-24c4-4043-8b4f-27e708111277',
          name: '虚拟机CPU使用情况(CPU 使用率)',
          panelId: '87bbbdfd-fabb-4f81-82e4-9a2201f9e918',
          panelName: '虚拟机CPU使用情况(CPU 使用率)',
        },
      },
      {
        layout: {
          x: 16,
          y: 30,
          w: 8,
          h: 8,
          component: 'Top5',
        },
        params: {
          name: '网络流出量TOP5',
          brand: 'OneCloud',
          resType: 'server',
          usage: 'bps_sent,vm_netio',
          order: 'TOP',
          limit: 5,
          time: 5184000,
          dimensionId: 'vm_id',
          color: 'color1',
        },
      },
      {
        layout: {
          x: 0,
          y: 12,
          w: 8,
          h: 6,
          component: 'Ring',
        },
        params: {
          all_usage_key: 'all.eip.floating_ip',
          cloud_env: 'onpremise',
          color: 'reverse',
          name: 'EIP使用率',
          region: 'default',
          regionAccountType: 'region',
          un_usage_label: '未使用',
          usage_key: 'all.eip.floating_ip.used',
          usage_label: '已使用',
        },
      },
      {
        layout: {
          x: 8,
          y: 0,
          w: 8,
          h: 6,
          component: 'NumberCard',
        },
        params: {
          cloud_env: 'onpremise',
          icon: 'icon_tenant',
          name: '裸金属数量',
          region: 'default',
          regionAccountType: 'region',
          usage_key: 'baremetals',
        },
      },
      {
        layout: {
          x: 16,
          y: 12,
          w: 8,
          h: 6,
          component: 'Ring',
        },
        params: {
          all_usage_key: 'storages.system.medium_type.hybrid_capacity',
          brand: 'OneCloud',
          cloud_env: 'onpremise',
          color: 'default',
          name: '已挂载的HDD磁盘总容量',
          region: 'default',
          regionAccountType: 'region',
          un_usage_label: '未使用',
          usage_key: 'storages.system.medium_type.hybrid_capacity_used',
          usage_label: '已使用',
        },
      },
      {
        layout: {
          x: 24,
          y: 6,
          w: 8,
          h: 6,
          component: 'UnrecoveredAlarm',
        },
        params: {
          name: '未恢复告警',
          brand: '',
        },
      },
      {
        layout: {
          x: 0,
          y: 38,
          w: 8,
          h: 8,
          component: 'Top5',
        },
        params: {
          name: '磁盘使用率TOP5',
          brand: 'OneCloud',
          resType: 'server',
          usage: 'used_percent,agent_disk',
          order: 'TOP',
          limit: 5,
          time: 5184000,
          dimensionId: 'vm_id',
          color: 'color4',
        },
      },
      {
        layout: {
          x: 8,
          y: 30,
          w: 8,
          h: 8,
          component: 'Top5',
        },
        params: {
          name: '内存使用率TOP5',
          brand: 'OneCloud',
          resType: 'server',
          usage: 'used_percent,vm_mem',
          order: 'TOP',
          limit: 5,
          time: 5184000,
          dimensionId: 'vm_id',
          color: 'color2',
        },
      },
      {
        layout: {
          x: 8,
          y: 6,
          w: 8,
          h: 6,
          component: 'Ring',
        },
        params: {
          all_usage_key: 'hosts.cpu.virtual',
          brand: 'OneCloud',
          cloud_env: 'onpremise',
          color: 'default',
          name: 'cpu分配率',
          region: 'default',
          regionAccountType: 'region',
          un_usage_label: '未分配',
          usage_key: 'all.servers.cpu',
          usage_label: '已分配',
        },
      },
      {
        layout: {
          x: 16,
          y: 6,
          w: 8,
          h: 6,
          component: 'Ring',
        },
        params: {
          all_usage_key: 'hosts.memory.virtual',
          brand: 'OneCloud',
          cloud_env: 'onpremise',
          color: 'reverse',
          name: '内存分配率',
          region: 'default',
          regionAccountType: 'region',
          un_usage_label: '未使用',
          usage_key: 'all.servers.memory',
          usage_label: '已使用',
        },
      },
      {
        layout: {
          x: 24,
          y: 0,
          w: 8,
          h: 6,
          component: 'Notify',
        },
        params: {
          name: '公告',
        },
      },
      {
        layout: {
          x: 12,
          y: 24,
          w: 12,
          h: 6,
          component: 'MonitorInfo',
        },
        params: {
          dashboardId: 'cc355b4c-24c4-4043-8b4f-27e708111277',
          name: '虚拟机磁盘流量(磁盘读速率)',
          panelId: 'c4ccc4e3-b8ce-4d39-8a2a-69769778c4a9',
          panelName: '虚拟机磁盘流量(磁盘读速率)',
        },
      },
      {
        layout: {
          x: 8,
          y: 12,
          w: 8,
          h: 6,
          component: 'Ring',
        },
        params: {
          all_usage_key: 'storages.system.medium_type.ssd_capacity',
          brand: 'OneCloud',
          cloud_env: 'onpremise',
          color: 'default',
          name: '已挂载的SSD磁盘总容量',
          region: 'default',
          regionAccountType: 'region',
          un_usage_label: '未分配',
          usage_key: 'storages.system.medium_type.ssd_capacity_used',
          usage_label: '已分配',
        },
      },
      {
        layout: {
          x: 0,
          y: 6,
          w: 8,
          h: 6,
          component: 'Ring',
        },
        params: {
          all_usage_key: 'hosts',
          cloud_env: 'onpremise',
          color: 'default',
          name: '宿主机数量',
          region: 'default',
          regionAccountType: 'region',
          un_usage_label: '关机',
          usage_key: 'enabled_hosts',
          usage_label: '运行中',
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
          x: 16,
          y: 0,
          w: 8,
          h: 6,
          component: 'NumberCard',
        },
        params: {
          brand: 'OneCloud',
          cloud_env: 'onpremise',
          icon: 'icon_cpu',
          name: '裸金属数量',
          region: 'default',
          regionAccountType: 'region',
          usage_key: 'domain.baremetals',
        },
      },
      {
        layout: {
          x: 16,
          y: 26,
          w: 8,
          h: 8,
          component: 'Top5',
        },
        params: {
          name: '网络入流量TOP5',
          brand: 'OneCloud',
          resType: 'server',
          usage: 'bps_recv,vm_netio',
          order: 'TOP',
          limit: 5,
          time: 5184000,
          dimensionId: 'vm_id',
          color: 'color4',
        },
      },
      {
        layout: {
          x: 0,
          y: 0,
          w: 8,
          h: 6,
          component: 'NumberCard',
        },
        params: {
          brand: 'OneCloud',
          cloud_env: 'onpremise',
          icon: 'icon_baremetal',
          name: 'CPU数量',
          region: 'default',
          regionAccountType: 'region',
          usage_key: 'domain.servers.cpu',
        },
      },
      {
        layout: {
          x: 0,
          y: 6,
          w: 8,
          h: 6,
          component: 'Ring',
        },
        params: {
          all_usage_key: 'domain.servers',
          brand: 'OneCloud',
          cloud_env: 'onpremise',
          color: 'default',
          name: '虚拟机数量',
          region: 'default',
          regionAccountType: 'region',
          un_usage_label: '未使用',
          usage_key: 'domain.running_servers',
          usage_label: '已使用',
        },
      },
      {
        layout: {
          x: 24,
          y: 12,
          w: 8,
          h: 7,
          component: 'Notify',
        },
        params: {
          name: '公告',
        },
      },
      {
        layout: {
          x: 24,
          y: 0,
          w: 8,
          h: 6,
          component: 'OptimizationSuggestion',
        },
        params: {
          name: '优化建议',
        },
      },
      {
        layout: {
          x: 8,
          y: 26,
          w: 8,
          h: 8,
          component: 'Top5',
        },
        params: {
          name: '内存使用率TOP5',
          brand: 'OneCloud',
          resType: 'server',
          usage: 'used_percent,vm_mem',
          order: 'TOP',
          limit: 5,
          time: 5184000,
          dimensionId: 'vm_id',
          color: 'color1',
        },
      },
      {
        layout: {
          x: 8,
          y: 0,
          w: 8,
          h: 6,
          component: 'NumberCard',
        },
        params: {
          brand: 'OneCloud',
          cloud_env: 'onpremise',
          icon: 'icon_tenant',
          name: '内存容量',
          region: 'default',
          regionAccountType: 'region',
          unit: 'auto',
          usage_key: 'domain.servers.memory',
        },
      },
      {
        layout: {
          x: 24,
          y: 6,
          w: 8,
          h: 6,
          component: 'UnrecoveredAlarm',
        },
        params: {
          name: '未恢复告警',
          brand: '',
        },
      },
      {
        layout: {
          x: 12,
          y: 12,
          w: 12,
          h: 7,
          component: 'MonitorInfo',
        },
        params: {
          dashboardId: 'cc355b4c-24c4-4043-8b4f-27e708111277',
          name: '虚拟机内存使用情况(内存使用率)',
          panelId: '047cccc4-66fe-4f2e-81d4-9fd461893ff2',
          panelName: '虚拟机内存使用情况(内存使用率)',
        },
      },
      {
        layout: {
          x: 12,
          y: 19,
          w: 12,
          h: 7,
          component: 'MonitorInfo',
        },
        params: {
          dashboardId: 'cc355b4c-24c4-4043-8b4f-27e708111277',
          name: '虚拟机磁盘流量(磁盘读速率)',
          panelId: 'c4ccc4e3-b8ce-4d39-8a2a-69769778c4a9',
          panelName: '虚拟机磁盘流量(磁盘读速率)',
        },
      },
      {
        layout: {
          x: 0,
          y: 26,
          w: 8,
          h: 8,
          component: 'Top5',
        },
        params: {
          name: 'CPU使用率TOP5',
          brand: 'OneCloud',
          resType: 'server',
          usage: 'usage_active,vm_cpu',
          order: 'TOP',
          limit: 5,
          time: 5184000,
          dimensionId: 'vm_id',
          color: 'color2',
        },
      },
      {
        layout: {
          x: 24,
          y: 26,
          w: 8,
          h: 8,
          component: 'Top5',
        },
        params: {
          name: '磁盘写入速度TOP5',
          brand: 'OneCloud',
          resType: 'server',
          usage: 'write_bps,vm_diskio',
          order: 'TOP',
          limit: 5,
          time: 5184000,
          dimensionId: 'vm_id',
          color: 'color5',
        },
      },
      {
        layout: {
          x: 16,
          y: 6,
          w: 8,
          h: 6,
          component: 'Ring',
        },
        params: {
          all_usage_key: 'domain.disks',
          brand: 'OneCloud',
          cloud_env: 'onpremise',
          color: 'default',
          name: '磁盘总容量',
          region: 'default',
          regionAccountType: 'region',
          un_usage_label: '未使用',
          usage_key: 'domain.disks.mounted',
          usage_label: '已使用',
        },
      },
      {
        layout: {
          x: 0,
          y: 19,
          w: 12,
          h: 7,
          component: 'MonitorInfo',
        },
        params: {
          dashboardId: 'cc355b4c-24c4-4043-8b4f-27e708111277',
          name: '虚拟机内存使用情况(内存使用率)',
          panelId: '047cccc4-66fe-4f2e-81d4-9fd461893ff2',
          panelName: '虚拟机内存使用情况(内存使用率)',
        },
      },
      {
        layout: {
          x: 24,
          y: 19,
          w: 8,
          h: 7,
          component: 'SuggestsysAlertsOverview',
        },
        params: {
          name: '费用优化总览',
          currency: 'CNY',
        },
      },
      {
        layout: {
          x: 0,
          y: 12,
          w: 12,
          h: 7,
          component: 'MonitorInfo',
        },
        params: {
          dashboardId: 'cc355b4c-24c4-4043-8b4f-27e708111277',
          name: '虚拟机CPU使用情况(CPU 使用率)',
          panelId: '87bbbdfd-fabb-4f81-82e4-9a2201f9e918',
          panelName: '虚拟机CPU使用情况(CPU 使用率)',
        },
      },
      {
        layout: {
          x: 8,
          y: 6,
          w: 8,
          h: 6,
          component: 'Ring',
        },
        params: {
          all_usage_key: 'domain.eip.floating_ip',
          brand: 'OneCloud',
          cloud_env: 'onpremise',
          color: 'default',
          name: '公网IP使用率',
          region: 'default',
          regionAccountType: 'region',
          un_usage_label: '未使用',
          usage_key: 'domain.eip.floating_ip.used',
          usage_label: '已使用',
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
          x: 16,
          y: 0,
          w: 8,
          h: 6,
          component: 'NumberCard',
        },
        params: {
          brand: 'OneCloud',
          cloud_env: 'onpremise',
          icon: 'icon_cpu',
          name: '裸金属数量',
          region: 'default',
          regionAccountType: 'region',
          usage_key: 'domain.baremetals',
        },
      },
      {
        layout: {
          x: 16,
          y: 26,
          w: 8,
          h: 8,
          component: 'Top5',
        },
        params: {
          name: '网络入流量TOP5',
          brand: 'OneCloud',
          resType: 'server',
          usage: 'bps_recv,vm_netio',
          order: 'TOP',
          limit: 5,
          time: 5184000,
          dimensionId: 'vm_id',
          color: 'color4',
        },
      },
      {
        layout: {
          x: 0,
          y: 0,
          w: 8,
          h: 6,
          component: 'NumberCard',
        },
        params: {
          brand: 'OneCloud',
          cloud_env: 'onpremise',
          icon: 'icon_baremetal',
          name: 'CPU数量',
          region: 'default',
          regionAccountType: 'region',
          usage_key: 'servers.cpu',
        },
      },
      {
        layout: {
          x: 0,
          y: 6,
          w: 8,
          h: 6,
          component: 'Ring',
        },
        params: {
          all_usage_key: 'servers',
          brand: 'OneCloud',
          cloud_env: 'onpremise',
          color: 'default',
          name: '虚拟机数量',
          region: 'default',
          regionAccountType: 'region',
          un_usage_label: '未使用',
          usage_key: 'running_servers',
          usage_label: '已使用',
        },
      },
      {
        layout: {
          x: 24,
          y: 12,
          w: 8,
          h: 7,
          component: 'Notify',
        },
        params: {
          name: '公告',
        },
      },
      {
        layout: {
          x: 24,
          y: 0,
          w: 8,
          h: 6,
          component: 'OptimizationSuggestion',
        },
        params: {
          name: '优化建议',
        },
      },
      {
        layout: {
          x: 8,
          y: 26,
          w: 8,
          h: 8,
          component: 'Top5',
        },
        params: {
          name: '内存使用率TOP5',
          brand: 'OneCloud',
          resType: 'server',
          usage: 'used_percent,vm_mem',
          order: 'TOP',
          limit: 5,
          time: 5184000,
          dimensionId: 'vm_id',
          color: 'color1',
        },
      },
      {
        layout: {
          x: 8,
          y: 0,
          w: 8,
          h: 6,
          component: 'NumberCard',
        },
        params: {
          brand: 'OneCloud',
          cloud_env: 'onpremise',
          icon: 'icon_tenant',
          name: '内存容量',
          region: 'default',
          regionAccountType: 'region',
          unit: 'auto',
          usage_key: 'servers.memory',
        },
      },
      {
        layout: {
          x: 24,
          y: 6,
          w: 8,
          h: 6,
          component: 'UnrecoveredAlarm',
        },
        params: {
          name: '未恢复告警',
          brand: '',
        },
      },
      {
        layout: {
          x: 12,
          y: 12,
          w: 12,
          h: 7,
          component: 'MonitorInfo',
        },
        params: {
          dashboardId: '0d0a6071-d529-4287-8952-f9f778da668d',
          name: '虚拟机内存使用情况(内存使用率)',
          panelId: '63c73dd9-059e-4c4b-85b4-adc61e65f008',
          panelName: '虚拟机内存使用情况(内存使用率)',
        },
      },
      {
        layout: {
          x: 12,
          y: 19,
          w: 12,
          h: 7,
          component: 'MonitorInfo',
        },
        params: {
          dashboardId: '0d0a6071-d529-4287-8952-f9f778da668d',
          name: '虚拟机磁盘流量(磁盘读速率)',
          panelId: '58f4edf2-0892-47a1-81f6-ab4c5f41fe5a',
          panelName: '虚拟机磁盘流量(磁盘读速率)',
        },
      },
      {
        layout: {
          x: 0,
          y: 26,
          w: 8,
          h: 8,
          component: 'Top5',
        },
        params: {
          name: 'CPU使用率TOP5',
          brand: 'OneCloud',
          resType: 'server',
          usage: 'usage_active,vm_cpu',
          order: 'TOP',
          limit: 5,
          time: 5184000,
          dimensionId: 'vm_id',
          color: 'color2',
        },
      },
      {
        layout: {
          x: 24,
          y: 26,
          w: 8,
          h: 8,
          component: 'Top5',
        },
        params: {
          name: '磁盘写入速度TOP5',
          brand: 'OneCloud',
          resType: 'server',
          usage: 'write_bps,vm_diskio',
          order: 'TOP',
          limit: 5,
          time: 5184000,
          dimensionId: 'vm_id',
          color: 'color5',
        },
      },
      {
        layout: {
          x: 16,
          y: 6,
          w: 8,
          h: 6,
          component: 'Ring',
        },
        params: {
          all_usage_key: 'disks',
          brand: 'OneCloud',
          cloud_env: 'onpremise',
          color: 'default',
          name: '磁盘总容量',
          region: 'default',
          regionAccountType: 'region',
          un_usage_label: '未使用',
          usage_key: 'disks.mounted',
          usage_label: '已使用',
        },
      },
      {
        layout: {
          x: 0,
          y: 19,
          w: 12,
          h: 7,
          component: 'MonitorInfo',
        },
        params: {
          dashboardId: '0d0a6071-d529-4287-8952-f9f778da668d',
          name: '虚拟机内存使用情况(内存使用率)',
          panelId: '033f3746-8a8f-43af-8a2a-6e85798d5fdc',
          panelName: '虚拟机内存使用情况(内存使用率)',
        },
      },
      {
        layout: {
          x: 24,
          y: 19,
          w: 8,
          h: 7,
          component: 'SuggestsysAlertsOverview',
        },
        params: {
          name: '费用优化总览',
          currency: 'CNY',
        },
      },
      {
        layout: {
          x: 0,
          y: 12,
          w: 12,
          h: 7,
          component: 'MonitorInfo',
        },
        params: {
          dashboardId: '0d0a6071-d529-4287-8952-f9f778da668d',
          name: '虚拟机CPU使用情况(CPU 使用率)',
          panelId: '960bea6d-d4a1-4b6d-8844-7992eb8f9618',
          panelName: '虚拟机CPU使用情况(CPU 使用率)',
        },
      },
      {
        layout: {
          x: 8,
          y: 6,
          w: 8,
          h: 6,
          component: 'Ring',
        },
        params: {
          all_usage_key: 'eip.floating_ip',
          brand: 'OneCloud',
          cloud_env: 'onpremise',
          color: 'default',
          name: '公网IP使用率',
          region: 'default',
          regionAccountType: 'region',
          un_usage_label: '未使用',
          usage_key: 'eip.floating_ip.used',
          usage_label: '已使用',
        },
      },
    ],
  },
}
