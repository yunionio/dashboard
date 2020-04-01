import Kubeclusters from '@K8S/views/cluster'
import KubeclustersCreate from '@K8S/views/cluster/create'
import Deployment from '@K8S/views/deployment'
import K8sDeploymentCreate from '@K8S/views/deployment/create'
import Layout from '@/layouts/RouterView'

export default {
  index: 3,
  meta: {
    label: '容器',
    icon: 'menu-k8s',
  },
  menus: [
    {
      meta: {
        label: '应用',
      },
      submenus: [
        {
          path: '/k8s-cluster',
          meta: {
            label: '无状态',
            permission: 'k8s_depolyments_list',
          },
          component: Layout,
          children: [
            {
              name: 'K8sDeploymentList',
              path: '',
              component: Deployment,
            },
            // {
            //   name: 'KubeclustersImport',
            //   path: 'import',
            //   component: KubeclustersImport,
            // },
            {
              name: 'K8sDeploymentCreate',
              path: 'create',
              component: K8sDeploymentCreate,
            },
          ],
        },
      ],
    },
    {
      meta: {
        label: '集群',
      },
      submenus: [
        {
          path: '/k8s-cluster',
          meta: {
            label: '集群',
            permission: 'k8s_kubeclusters_list',
          },
          component: Layout,
          children: [
            {
              name: 'Kubeclusters',
              path: '',
              component: Kubeclusters,
            },
            // {
            //   name: 'KubeclustersImport',
            //   path: 'import',
            //   component: KubeclustersImport,
            // },
            {
              name: 'KubeclustersCreate',
              path: 'create',
              component: KubeclustersCreate,
            },
          ],
        },
      ],
    },
  ],
}
