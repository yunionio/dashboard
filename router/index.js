import VmRelase from '@Helm/views/vm-release'
import VmReleaseUpdate from '@Helm/views/vm-release/update'
import K8sRelease from '@Helm/views/k8s-release'
import K8sReleaseUpdate from '@Helm/views/k8s-release/update'
import Chart from '@Helm/views/chart'
import K8sChartCreate from '@Helm/views/chart/create'
import Repo from '@Helm/views/repo'
import Layout from '@/layouts/RouterView'

export default {
  index: 7,
  meta: {
    label: '应用编排',
    icon: 'menu-helm',
  },
  menus: [
    {
      meta: {
        label: '编排',
      },
      submenus: [
        {
          path: '/vm-release',
          component: Layout,
          meta: {
            label: '虚拟机实例',
            permission: 'k8s_releases_list',
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
  ],
}
