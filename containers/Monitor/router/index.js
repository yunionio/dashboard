import Layout from '@/layouts/RouterView'
import { setupKeys } from '@/utils/auth'
import i18n from '@/locales'
import store from '@/store'
import { isScopedPolicyMenuHidden } from '@/utils/scopedPolicy'

const Overview = () => import(/* webpackChunkName: "monitor" */ /* webpackPrefetch: true */ '@Monitor/views/overview')
const CommonalertsIndex = () => import(/* webpackChunkName: "monitor" */ /* webpackPrefetch: true */ '@Monitor/views/commonalert')
const commonalertsCreate = () => import(/* webpackChunkName: "monitor" */ /* webpackPrefetch: true */ '@Monitor/views/commonalert/create')
const commonalertsUpdate = () => import(/* webpackChunkName: "monitor" */ /* webpackPrefetch: true */ '@Monitor/views/commonalert/update')
const commonalertsClone = () => import(/* webpackChunkName: "monitor" */ /* webpackPrefetch: true */ '@Monitor/views/commonalert/clone')
const MonitorresourcesIndex = () => import(/* webpackChunkName: "monitor" */ /* webpackPrefetch: true */ '@Monitor/views/monitorresource')
const AlertresourceIndex = () => import(/* webpackChunkName: "monitor" */ /* webpackPrefetch: true */ '@Monitor/views/alertresource')
const AlertrecordIndex = () => import(/* webpackChunkName: "monitor" */ /* webpackPrefetch: true */ '@Monitor/views/alertrecord')
const Explorer = () => import(/* webpackChunkName: "monitor" */ /* webpackPrefetch: true */ '@Monitor/views/explorer')
const Dashboard = () => import(/* webpackChunkName: "monitor" */ /* webpackPrefetch: true */ '@Monitor/views/dashboard')
const MonitorDashboardChartCreate = () => import(/* webpackChunkName: "monitor" */ /* webpackPrefetch: true */ '@Monitor/views/dashboard/create')
const AlertRecordShieldsIndex = () => import(/* webpackChunkName: "monitor" */ /* webpackPrefetch: true */ '@Monitor/views/alertrecordshields')

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
                default: ['onestack', 'openstack', 'dstack', 'zstack', 'public', 'vmware', 'hcso', 'hcs'],
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
                default: ['onestack', 'openstack', 'dstack', 'zstack', 'public', 'vmware', 'hcso', 'hcs'],
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
                default: ['onestack', 'openstack', 'dstack', 'zstack', 'public', 'vmware', 'hcso', 'hcs'],
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
                default: ['onestack', 'openstack', 'dstack', 'zstack', 'public', 'vmware', 'hcso', 'hcs'],
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
                default: ['onestack', 'openstack', 'dstack', 'zstack', 'public', 'vmware', 'hcso', 'hcs'],
              }) : false
            },
          },
          component: Layout,
          children: [
            {
              name: 'CommonalertsIndex',
              path: '',
              component: CommonalertsIndex,
              meta: {
                key: '/commonalerts',
                keepAlive: true,
                keepAliveViews: ['CommonalertUpdate'],
              },
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
            {
              name: 'CommonalertClone',
              path: ':id/clone',
              component: commonalertsClone,
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
          path: '/alertrecord',
          meta: {
            label: i18n.t('dictionary.alertrecord'),
            permission: 'alertrecords_list,monitorresourcealerts_list',
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
          path: '/monitorresourcealerts',
          meta: {
            label: i18n.t('monitor.text_2'),
            t: 'dictionary.monitorresourcealerts',
            permission: 'alertrecordshields_list',
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
