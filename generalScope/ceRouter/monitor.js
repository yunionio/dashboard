import Layout from '@/layouts/RouterView'
import { setupKeys, isBaremetalProduct } from '@/utils/auth'
import i18n from '@/locales'
import store from '@/store'
import { isScopedPolicyMenuHidden } from '@/utils/scopedPolicy'

// 监控
const Overview = () => import(/* webpackChunkName: "monitor" */ /* webpackPrefetch: true */ '@Monitor/views/overview')
const CommonalertsIndex = () => import(/* webpackChunkName: "monitor" */ /* webpackPrefetch: true */ '@Monitor/views/commonalert')
const commonalertsCreate = () => import(/* webpackChunkName: "monitor" */ /* webpackPrefetch: true */ '@Monitor/views/commonalert/create')
const commonalertsUpdate = () => import(/* webpackChunkName: "monitor" */ /* webpackPrefetch: true */ '@Monitor/views/commonalert/update')
const MonitorresourcesIndex = () => import(/* webpackChunkName: "monitor" */ /* webpackPrefetch: true */ '@Monitor/views/monitorresource')
const AlertresourceIndex = () => import(/* webpackChunkName: "monitor" */ /* webpackPrefetch: true */ '@Monitor/views/alertresource')
const AlertrecordIndex = () => import(/* webpackChunkName: "monitor" */ /* webpackPrefetch: true */ '@Monitor/views/alertrecord')
const Explorer = () => import(/* webpackChunkName: "monitor" */ /* webpackPrefetch: true */ '@Monitor/views/explorer')
const Dashboard = () => import(/* webpackChunkName: "monitor" */ /* webpackPrefetch: true */ '@Monitor/views/dashboard')
const MonitorDashboardChartCreate = () => import(/* webpackChunkName: "monitor" */ /* webpackPrefetch: true */ '@Monitor/views/dashboard/create')
const AlertRecordShieldsIndex = () => import(/* webpackChunkName: "monitor" */ /* webpackPrefetch: true */ '@Monitor/views/alertrecordshields')

// 运维工具
const VmRelase = () => import(/* webpackChunkName: "helm" */ /* webpackPrefetch: true */ '@Helm/views/vm-release')
const VmReleaseUpdate = () => import(/* webpackChunkName: "helm" */ /* webpackPrefetch: true */ '@Helm/views/vm-release/update')
const K8sRelease = () => import(/* webpackChunkName: "helm" */ /* webpackPrefetch: true */ '@Helm/views/k8s-release')
const K8sReleaseUpdate = () => import(/* webpackChunkName: "helm" */ /* webpackPrefetch: true */ '@Helm/views/k8s-release/update')
const Chart = () => import(/* webpackChunkName: "helm" */ /* webpackPrefetch: true */ '@Helm/views/chart')
const K8sChartCreate = () => import(/* webpackChunkName: "helm" */ /* webpackPrefetch: true */ '@Helm/views/chart/create')
const Repo = () => import(/* webpackChunkName: "helm" */ /* webpackPrefetch: true */ '@Helm/views/repo')
const Scheduledtask = () => import(/* webpackChunkName: "helm" */ /* webpackPrefetch: true */ '@Cloudenv/views/scheduledtask')
const ScheduledtaskCreate = () => import(/* webpackChunkName: "helm" */ /* webpackPrefetch: true */ '@Cloudenv/views/scheduledtask/create')

export default {
  index: 65,
  meta: {
    label: i18n.t('common.monitor_operation'),
    icon: 'monitor-operation',
  },
  menus: [
    // 监控
    {
      meta: {
        label: i18n.t('monitor.text_0'),
        t: 'monitor.text_0',
      },
      submenus: [
        {
          path: '/monitoroverview',
          meta: {
            label: i18n.t('common.monitor_overview'),
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
        {
          path: '/monitorresources-guest',
          meta: {
            label: i18n.t('common.server_monitor'),
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
            label: i18n.t('common.host_monitor'),
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
        label: i18n.t('monitor.text_1'),
        t: 'monitor.text_1',
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
            label: i18n.t('dictionary.monitorresourcealerts'),
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
    // 运维工具
    {
      meta: {
        label: i18n.t('helm.text_2'),
      },
      submenus: [
        {
          path: '/vm-release',
          component: Layout,
          meta: {
            label: i18n.t('helm.text_3'),
            permission: 'k8s_releases_list',
            hidden: () => {
              if (isScopedPolicyMenuHidden('sub_hidden_menus.vm_release')) {
                return true
              }
              return process.env.VUE_APP_IS_PRIVATE ? !setupKeys.hasVersionedSetupKey({
                '3.0': ['monitor'],
                default: ['onestack', 'openstack', 'dstack', 'zstack', 'public', 'k8s', 'vmware', 'hcso', 'hcs'],
              }) : !setupKeys.hasVersionedSetupKey({ '3.0': ['k8s'] })
            },
            // invisible: () => true,
          },
          children: [
            {
              name: 'VmRelaseIndex',
              path: '',
              component: VmRelase,
            },
            {
              name: 'VmReleaseUpdate',
              path: 'update/:name',
              component: VmReleaseUpdate,
            },
          ],
        },
        {
          path: '/k8s-release',
          component: Layout,
          meta: {
            label: i18n.t('helm.text_4'),
            permission: 'k8s_releases_list',
            hidden: () => {
              if (isScopedPolicyMenuHidden('sub_hidden_menus.k8s_release')) {
                return true
              }
              return !setupKeys.hasAllVersionedSetupKey({
                '3.0': ['monitor', 'k8s'],
                default: ['k8s'],
              })
            },
            // invisible: () => true,
          },
          children: [
            {
              name: 'K8sRelaseIndex',
              path: '',
              component: K8sRelease,
            },
            {
              name: 'K8sReleaseUpdate',
              path: 'update/:id',
              component: K8sReleaseUpdate,
            },
          ],
        },
        {
          path: '/k8s-chart',
          meta: {
            label: i18n.t('helm.text_5'),
            permission: 'k8s_charts_list',
            hidden: () => {
              if (isScopedPolicyMenuHidden('sub_hidden_menus.k8s_chart')) {
                return true
              }
              return process.env.VUE_APP_IS_PRIVATE ? !setupKeys.hasVersionedSetupKey({
                '3.0': ['monitor'],
                default: ['onestack', 'openstack', 'dstack', 'zstack', 'public', 'k8s', 'vmware', 'hcso', 'hcs'],
              }) : !setupKeys.hasVersionedSetupKey({ '3.0': ['k8s'] })
            },
            // invisible: () => true,
          },
          component: Layout,
          children: [
            {
              name: 'K8sChartList',
              path: '',
              component: Chart,
            },
            {
              name: 'K8sChartCreate',
              path: 'create',
              component: K8sChartCreate,
            },
          ],
        },
        {
          path: '/k8s-repo',
          meta: {
            label: i18n.t('helm.text_6'),
            permission: 'k8s_repos_list',
            hidden: () => {
              if (isScopedPolicyMenuHidden('sub_hidden_menus.k8s_repo')) {
                return true
              }
              return process.env.VUE_APP_IS_PRIVATE ? !setupKeys.hasVersionedSetupKey({
                '3.0': ['monitor'],
                default: ['onestack', 'openstack', 'dstack', 'zstack', 'public', 'k8s', 'vmware', 'hcso', 'hcs'],
              }) : !setupKeys.hasVersionedSetupKey({ '3.0': ['k8s'] })
            },
            // invisible: () => true,
          },
          component: Layout,
          children: [
            {
              name: 'K8sRepoList',
              path: '',
              component: Repo,
            },
          ],
        },
      ],
    },
    {
      meta: {
        label: i18n.t('helm.text_7'),
      },
      submenus: [
        {
          path: '/scheduledtask',
          meta: {
            hidden: () => {
              if (isScopedPolicyMenuHidden('sub_hidden_menus.scheduledtask')) {
                return true
              }
              return process.env.VUE_APP_IS_PRIVATE ? !setupKeys.hasVersionedSetupKey({
                '3.0': ['monitor'],
                default: ['onestack', 'private', 'public', 'vmware'],
              }) : (!setupKeys.hasVersionedSetupKey({ '3.0': ['onecloud'] }) || isBaremetalProduct())
            },
            label: i18n.t('helm.text_8'),
            permission: 'scheduledtasks_list',
          },
          component: Layout,
          children: [
            {
              name: 'Scheduledtasks',
              path: '',
              component: Scheduledtask,
            },
            {
              name: 'ScheduledtaskCreate',
              path: 'create',
              component: ScheduledtaskCreate,
            },
          ],
        },
      ],
    },
  ],
}
