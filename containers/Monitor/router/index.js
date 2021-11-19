import Overview from '@Monitor/views/overview'
import CommonalertsIndex from '@Monitor/views/commonalert'
import commonalertsCreate from '@Monitor/views/commonalert/create'
import commonalertsUpdate from '@Monitor/views/commonalert/update'
import MonitorresourcesIndex from '@Monitor/views/monitorresource'
import AlertresourceIndex from '@Monitor/views/alertresource'
import AlertrecordIndex from '@Monitor/views/alertrecord'
import Explorer from '@Monitor/views/explorer'
import Dashboard from '@Monitor/views/dashboard'
import MonitorDashboardChartCreate from '@Monitor/views/dashboard/create'
import AlertRecordShieldsIndex from '@Monitor/views/alertrecordshields'
import Layout from '@/layouts/RouterView'
import { setupKeys } from '@/utils/auth'
import i18n from '@/locales'
import store from '@/store'
import { isScopedPolicyMenuHidden } from '@/utils/scopedPolicy'

export default {
  index: 65,
  meta: {
    label: i18n.t('monitor.text_0'),
    icon: 'menu-monitor',
  },
  menus: [
    {
      path: '/monitoroverview',
      meta: {
        label: i18n.t('monitor.text_18'),
        permission: 'commonalerts_list',
        hidden: () => {
          if (isScopedPolicyMenuHidden('sub_hidden_menus.monitoroverview')) {
            return true
          }
          return !setupKeys.hasVersionedSetupKey({ '3.0': ['monitor'] }, true)
        },
      },
      component: Overview,
    },
    {
      meta: {
        label: i18n.t('monitor.monitorresources'),
        t: 'dictionary.monitorresources',
      },
      submenus: [
        {
          path: '/monitorresources-guest',
          meta: {
            label: i18n.t('common.server'),
            permission: 'monitorresources_list',
            hidden: () => {
              if (isScopedPolicyMenuHidden('sub_hidden_menus.monitorresources_guest')) {
                return true
              }

              return process.env.VUE_APP_IS_PRIVATE ? !setupKeys.hasVersionedSetupKey({
                '3.0': ['monitor'],
                default: ['onestack', 'openstack', 'dstack', 'zstack', 'public', 'vmware', 'hcso'],
              }) : false
            },
          },
          component: Layout,
          children: [
            {
              name: 'MonitorresourcesGuest',
              path: '',
              props: { res_type: 'guest' },
              component: MonitorresourcesIndex,
            },
          ],
        },
        {
          path: '/monitorresources-host',
          meta: {
            label: i18n.t('dictionary.host'),
            permission: 'monitorresources_list',
            hidden: () => {
              if (isScopedPolicyMenuHidden('sub_hidden_menus.monitorresources_host')) {
                return true
              }

              if (!(store.getters.isAdminMode || store.getters.isDomainMode)) {
                return true
              }

              return process.env.VUE_APP_IS_PRIVATE ? !setupKeys.hasVersionedSetupKey({
                '3.0': ['monitor'],
                default: ['onestack', 'openstack', 'dstack', 'zstack', 'public', 'vmware', 'hcso'],
              }) : false
            },
          },
          component: Layout,
          children: [
            {
              name: 'MonitorresourcesHost',
              path: '',
              props: { res_type: 'host' },
              component: MonitorresourcesIndex,
            },
          ],
        },
      ],
    },
    {
      meta: {
        label: i18n.t('monitor.monitor_metric'),
        t: 'dictionary.monitor_metrics',
      },
      submenus: [
        {
          name: 'Query',
          meta: {
            label: i18n.t('monitor.dashboard.title'),
            permission: 'unifiedmonitors_get',
            hidden: () => {
              if (isScopedPolicyMenuHidden('sub_hidden_menus.monitor_dashboard')) {
                return true
              }

              return process.env.VUE_APP_IS_PRIVATE ? !setupKeys.hasVersionedSetupKey({
                '3.0': ['monitor'],
                default: ['onestack', 'openstack', 'dstack', 'zstack', 'public', 'vmware', 'hcso'],
              }) : false
            },
          },
          path: '/monitor-dashboard',
          component: Layout,
          children: [
            {
              name: 'MonitorDashboard',
              path: '',
              component: Dashboard,
            },
            {
              name: 'MonitorDashboardChartCreate',
              path: 'create',
              component: MonitorDashboardChartCreate,
            },
            {
              name: 'MonitorDashboardChartUpdate',
              path: ':id/update',
              component: MonitorDashboardChartCreate,
            },
          ],
        },
        {
          name: 'Query',
          meta: {
            label: i18n.t('monitor.text_119'),
            permission: 'unifiedmonitors_get',
            hidden: () => {
              if (isScopedPolicyMenuHidden('sub_hidden_menus.explorer')) {
                return true
              }
              return process.env.VUE_APP_IS_PRIVATE ? !setupKeys.hasVersionedSetupKey({
                '3.0': ['monitor'],
                default: ['onestack', 'openstack', 'dstack', 'zstack', 'public', 'vmware', 'hcso'],
              }) : false
            },
          },
          path: '/explorer',
          component: Explorer,
        },
      ],
    },
    {
      meta: {
        label: i18n.t('monitor.text_1'),
        t: 'dictionary.monitor_commonalert',
      },
      submenus: [
        {
          path: '/commonalerts',
          meta: {
            label: i18n.t('monitor.text_2'),
            t: 'dictionary.commonalert',
            permission: 'commonalerts_list',
            hidden: () => {
              if (isScopedPolicyMenuHidden('sub_hidden_menus.commonalerts')) {
                return true
              }

              return process.env.VUE_APP_IS_PRIVATE ? !setupKeys.hasVersionedSetupKey({
                '3.0': ['monitor'],
                default: ['onestack', 'openstack', 'dstack', 'zstack', 'public', 'vmware', 'hcso'],
              }) : false
            },
          },
          component: Layout,
          children: [
            {
              name: 'CommonalertsIndex',
              path: '',
              component: CommonalertsIndex,
            },
            {
              name: 'CommonalertCreate',
              path: 'create',
              component: commonalertsCreate,
            },
            {
              name: 'CommonalertUpdate',
              path: ':id/update',
              component: commonalertsUpdate,
            },
          ],
        },
        {
          path: '/alertrecord',
          meta: {
            label: i18n.t('dictionary.alertrecord'),
            permission: 'alertrecords_list',
            hidden: () => {
              if (isScopedPolicyMenuHidden('sub_hidden_menus.alertrecord')) {
                return true
              }

              return !setupKeys.hasVersionedSetupKey({
                '3.0': ['monitor'],
              })
            },
          },
          component: Layout,
          children: [
            {
              name: 'AlertrecordIndex',
              path: '',
              component: AlertrecordIndex,
            },
          ],
        },
        {
          path: '/alertresource',
          meta: {
            label: i18n.t('monitor.text_17'),
            // t: 'dictionary.alertresource',
            permission: 'alertresources_list',
            hidden: () => {
              if (isScopedPolicyMenuHidden('sub_hidden_menus.alertresource')) {
                return true
              }
              if (!store.getters.isAdminMode) return true
              return !setupKeys.hasVersionedSetupKey({ '3.0': ['monitor'] }, !(!store.getters.isAdminMode && process.env.VUE_APP_IS_PRIVATE))
            },
          },
          component: Layout,
          children: [
            {
              name: 'alertresourceIndex',
              path: '',
              component: AlertresourceIndex,
            },
          ],
        },
        {
          path: '/monitorresourcealerts',
          meta: {
            label: i18n.t('monitor.text_2'),
            t: 'dictionary.monitorresourcealerts',
            permission: 'monitorresourcealerts_list',
            hidden: () => {
              if (isScopedPolicyMenuHidden('sub_hidden_menus.commonalerts')) {
                return true
              }

              return process.env.VUE_APP_IS_PRIVATE ? !setupKeys.hasVersionedSetupKey({
                '3.0': ['monitor'],
                default: ['onestack', 'openstack', 'dstack', 'zstack', 'public', 'vmware', 'huaweicloudstack'],
              }) : false
            },
          },
          component: Layout,
          children: [
            {
              name: 'AlertRecordShieldsIndex',
              path: '',
              component: AlertRecordShieldsIndex,
            },
          ],
        },
      ],
    },
  ],
}
