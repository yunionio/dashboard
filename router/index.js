import Kubeclusters from '@K8S/views/cluster'
import KubeclustersImport from '@K8S/views/cluster/import'
import KubeclustersCreate from '@K8S/views/cluster/create'
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
            {
              name: 'KubeclustersImport',
              path: 'import',
              component: KubeclustersImport,
            },
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
