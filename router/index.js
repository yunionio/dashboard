import VmRelase from '@Helm/views/vm-release'
import VmReleaseUpdate from '@Helm/views/vm-release/update'
import K8sRelease from '@Helm/views/k8s-release'
import K8sReleaseUpdate from '@Helm/views/k8s-release/update'
import Chart from '@Helm/views/chart'
import K8sChartCreate from '@Helm/views/chart/create'
import Repo from '@Helm/views/repo'
import Scheduledtask from '@Cloudenv/views/scheduledtask'
import ScheduledtaskCreate from '@Cloudenv/views/scheduledtask/create'
import Layout from '@/layouts/RouterView'
import { hasSetupKey } from '@/utils/auth'

let Monitor = { meta: { hidden: true } }
if (process.env.VUE_APP_IS_PRIVATE) {
  const modules = require.context('../../../containers', true, /^((?![\\/]node_modules).)*.\/router\/index.js$/)
  const moduleList = modules.keys()
  if ([].includes.call(moduleList, './Monitor/router/index.js')) {
    Monitor = modules('./Monitor/router/index.js').default
  }
}

export default {
  index: 7,
  meta: {
    label: '运维工具',
    icon: 'menu-helm',
  },
  menus: [
    {
      meta: {
        label: '编排',
        hidden: true,
      },
      submenus: [
        {
          path: '/vm-release',
          component: Layout,
          meta: {
            label: '虚拟机实例',
            permission: 'k8s_releases_list',
            hidden: () => !hasSetupKey(['onestack', 'private', 'public', 'k8s', 'vmware']),
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
            label: '容器实例',
            permission: 'k8s_releases_list',
            hidden: () => !hasSetupKey(['k8s']),
          },
          children: [
            {
              name: 'K8sRelaseIndex',
              path: '',
              component: K8sRelease,
            },
            {
              name: 'K8sReleaseUpdate',
              path: 'update/:name',
              component: K8sReleaseUpdate,
            },
          ],
        },
        {
          path: '/k8s-chart',
          meta: {
            label: '应用市场',
            permission: 'k8s_charts_list',
            hidden: () => !hasSetupKey(['onestack', 'private', 'public', 'k8s', 'vmware']),
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
            label: 'Helm仓库地址',
            permission: 'k8s_repos_list',
            hidden: () => !hasSetupKey(['onestack', 'private', 'public', 'k8s', 'vmware']),
            invisible: () => true,
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
    Monitor,
    {
      meta: {
        label: '常用工具',
      },
      submenus: [
        {
          path: '/scheduledtask',
          meta: {
            hidden: () => !hasSetupKey(['onestack', 'private', 'public', 'vmware']),
            label: '定时任务',
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
