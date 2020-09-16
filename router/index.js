import K8sRbacrolebindingCreate from '@K8S/views/rbacrolebinding/create'
import K8sRbacclusterroleCreate from '@K8S/views/rbacclusterrole/create'
import K8sRbacclusterrolebinding from '@K8S/views/rbacclusterrolebinding'
import K8sRbacclusterrolebindingCreate from '@K8S/views/rbacclusterrolebinding/create'
import Federatednamespace from '@K8S/views/federatednamespace'
import Federatedclusterrole from '@K8S/views/federatedclusterrole'
import FederatedclusterroleCreate from '@K8S/views/federatedclusterrole/create'
import Federatedrolebinding from '@K8S/views/federatedrolebinding'
import FederatedrolebindingCreate from '@K8S/views/federatedrolebinding/create'
import Federatedclusterrolebinding from '@K8S/views/federatedclusterrolebinding'
import FederatedclusterrolebindingCreate from '@K8S/views/federatedclusterrolebinding/create'
import Federatedrole from '@K8S/views/federatedrole'
import Kubeclusters from '@K8S/views/cluster'
import KubeclustersCreate from '@K8S/views/cluster/create'
import KubeclustersImport from '@K8S/views/cluster/import'
import Deployment from '@K8S/views/deployment'
import K8sDeploymentCreate from '@K8S/views/deployment/create'
import Daemonset from '@K8S/views/daemonset'
import K8sDaemonsetCreate from '@K8S/views/daemonset/create'
import K8SNode from '@K8S/views/nodes'
import K8sStorageclasses from '@K8S/views/storage-class'
import K8sStorageclassesCreate from '@K8S/views/storage-class/create'
import K8sNamespace from '@K8S/views/namespace'
import K8sNamespaceCreate from '@K8S/views/namespace/create'
import K8sRbacrole from '@K8S/views/rbacrole'
import K8sRbacrolebinding from '@K8S/views/rbacrolebinding'
import K8sRbacroleCreate from '@K8S/views/rbacrole/create'
import K8sRbacclusterrole from '@K8S/views/rbacclusterrole'
import K8sServiceAccount from '@K8S/views/service-account'
import K8sKubeComponent from '@K8S/views/kube-component'
import K8sKubeComponentCreate from '@K8S/views/kube-component/create'
import K8sKubeComponentUpdate from '@K8S/views/kube-component/update'
import Statefulset from '@K8S/views/statefulset'
import K8sStatefulsetCreate from '@K8S/views/statefulset/create'
import Pod from '@K8S/views/pod'
import Job from '@K8S/views/job'
import K8sJobCreate from '@K8S/views/job/create'
import CronJob from '@K8S/views/cronjob'
import K8sCronJobCreate from '@K8S/views/cronjob/create'
import Persistentvolumeclaim from '@K8S/views/persistentvolumeclaim'
import K8sPersistentvolumeclaimCreate from '@K8S/views/persistentvolumeclaim/create'
import Service from '@K8S/views/service'
import K8sServiceCreate from '@K8S/views/service/create'
import Ingress from '@K8S/views/ingress'
import K8sIngressCreate from '@K8S/views/ingress/create'
import Configmap from '@K8S/views/configmap'
import K8sConfigmapCreate from '@K8S/views/configmap/create'
import Secret from '@K8S/views/secret'
import K8sSecretCreate from '@K8S/views/secret/create'
import Layout from '@/layouts/RouterView'
import FederatednamespaceCreate from '@K8S/views/federatednamespace/create'
import FederatedroleCreate from '@K8S/views/federatedrole/create'

import { hasSetupKey } from '@/utils/auth'
import i18n from '@/locales'

export default {
  index: 3,
  meta: {
    label: i18n.t('k8s.text_1'),
    icon: 'menu-k8s',
    hidden: () => !hasSetupKey('k8s'),
  },
  menus: [
    {
      meta: {
        label: i18n.t('k8s.text_2'),
        labelAlias: i18n.t('k8s.text_3'),
      },
      submenus: [
        {
          path: '/k8s-deployment',
          meta: {
            label: i18n.t('k8s.text_4'),
            permission: 'k8s_deployments_list',
          },
          component: Layout,
          children: [
            {
              name: 'K8sDeploymentList',
              path: '',
              component: Deployment,
            },
            {
              name: 'K8sDeploymentCreate',
              path: 'create',
              component: K8sDeploymentCreate,
            },
          ],
        },
        {
          path: '/k8s-statefulset',
          meta: {
            label: i18n.t('k8s.text_5'),
            permission: 'k8s_statefulsets_list',
          },
          component: Layout,
          children: [
            {
              name: 'K8sStatefulsetList',
              path: '',
              component: Statefulset,
            },
            {
              name: 'K8sStatefulsetCreate',
              path: 'create',
              component: K8sStatefulsetCreate,
            },
          ],
        },
        {
          path: '/k8s-daemonset',
          meta: {
            label: i18n.t('k8s.text_6'),
            permission: 'k8s_daemonsets_list',
          },
          component: Layout,
          children: [
            {
              name: 'K8sDaemonsetList',
              path: '',
              component: Daemonset,
            },
            {
              name: 'K8sDaemonsetCreate',
              path: 'create',
              component: K8sDaemonsetCreate,
            },
          ],
        },
        {
          path: '/k8s-job',
          meta: {
            label: i18n.t('k8s.text_7'),
            permission: 'k8s_jobs_list',
          },
          component: Layout,
          children: [
            {
              name: 'K8sJobList',
              path: '',
              component: Job,
            },
            {
              name: 'K8sJobCreate',
              path: 'create',
              component: K8sJobCreate,
            },
          ],
        },
        {
          path: '/k8s-cronjob',
          meta: {
            label: i18n.t('k8s.text_8'),
            permission: 'k8s_cronjobs_list',
          },
          component: Layout,
          children: [
            {
              name: 'K8sCronJobList',
              path: '',
              component: CronJob,
            },
            {
              name: 'K8sCronJobCreate',
              path: 'create',
              component: K8sCronJobCreate,
            },
          ],
        },
        {
          path: '/k8s-pod',
          meta: {
            label: i18n.t('k8s.text_9'),
            permission: 'k8s_pods_list',
          },
          component: Layout,
          children: [
            {
              name: 'K8sPodList',
              path: '',
              component: Pod,
            },
          ],
        },
        {
          path: '/k8s-persistentvolumeclaim',
          meta: {
            label: i18n.t('k8s.text_10'),
            permission: 'k8s_persistentvolumeclaims_list',
          },
          component: Layout,
          children: [
            {
              name: 'K8sPersistentvolumeclaimList',
              path: '',
              component: Persistentvolumeclaim,
            },
            {
              name: 'K8sPersistentvolumeclaimCreate',
              path: 'create',
              component: K8sPersistentvolumeclaimCreate,
            },
          ],
        },
      ],
    },
    {
      meta: {
        label: i18n.t('k8s.text_11'),
        labelAlias: i18n.t('k8s.text_12'),
      },
      submenus: [
        {
          path: '/k8s-service',
          meta: {
            label: i18n.t('k8s.text_13'),
            permission: 'k8s_services_list',
          },
          component: Layout,
          children: [
            {
              name: 'K8sServiceList',
              path: '',
              component: Service,
            },
            {
              name: 'K8sServiceCreate',
              path: 'create',
              component: K8sServiceCreate,
            },
          ],
        },
        {
          path: '/k8s-ingress',
          meta: {
            label: i18n.t('k8s.text_14'),
            permission: 'k8s_ingresses_list',
          },
          component: Layout,
          children: [
            {
              name: 'K8sIngressList',
              path: '',
              component: Ingress,
            },
            {
              name: 'K8sIngressCreate',
              path: 'create',
              component: K8sIngressCreate,
            },
          ],
        },
      ],
    },
    {
      meta: {
        label: i18n.t('k8s.text_15'),
        labelAlias: i18n.t('k8s.text_16'),
      },
      submenus: [
        {
          path: '/k8s-configmap',
          meta: {
            label: i18n.t('k8s.text_17'),
            permission: 'k8s_configmaps_list',
          },
          component: Layout,
          children: [
            {
              name: 'K8sConfigmapList',
              path: '',
              component: Configmap,
            },
            {
              name: 'K8sConfigmapCreate',
              path: 'create',
              component: K8sConfigmapCreate,
            },
          ],
        },
        {
          path: '/k8s-secret',
          meta: {
            label: i18n.t('k8s.text_18'),
            permission: 'k8s_secrets_list',
          },
          component: Layout,
          children: [
            {
              name: 'K8sSecretList',
              path: '',
              component: Secret,
            },
            {
              name: 'K8sSecretCreate',
              path: 'create',
              component: K8sSecretCreate,
            },
          ],
        },
      ],
    },
    {
      meta: {
        label: i18n.t('k8s.text_19'),
        labelAlias: i18n.t('k8s.text_20'),
      },
      submenus: [
        {
          path: '/k8s-cluster',
          meta: {
            label: i18n.t('k8s.text_19'),
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
        {
          path: '/k8s-node',
          meta: {
            label: i18n.t('k8s.text_21'),
            permission: 'k8s_k8sNode_list',
          },
          component: Layout,
          children: [
            {
              name: 'K8SNode',
              path: '',
              component: K8SNode,
            },
          ],
        },
        {
          path: '/k8s-storageclass',
          meta: {
            label: i18n.t('k8s.text_22'),
            permission: 'k8s_storageclasses_list',
          },
          component: Layout,
          children: [
            {
              name: 'K8sStorageclasses',
              path: '',
              component: K8sStorageclasses,
            },
            {
              name: 'K8sStorageclassesCreate',
              path: 'create',
              component: K8sStorageclassesCreate,
            },
          ],
        },
        {
          path: '/k8s-namespace',
          meta: {
            label: i18n.t('k8s.text_23'),
            permission: 'k8s_namespace_list',
          },
          component: Layout,
          children: [
            {
              name: 'K8sNamespace',
              path: '',
              component: K8sNamespace,
            },
            {
              name: 'K8sNamespaceCreate',
              path: 'create',
              component: K8sNamespaceCreate,
            },
          ],
        },
        {
          path: '/k8s-rbacrole',
          meta: {
            label: i18n.t('k8s.text_24'),
            permission: 'k8s_rbacroles_list',
          },
          component: Layout,
          children: [
            {
              name: 'K8sRbacrole',
              path: '',
              component: K8sRbacrole,
            },
            {
              name: 'K8sRbacroleCreate',
              path: 'create',
              component: K8sRbacroleCreate,
            },
          ],
        },
        {
          path: '/k8s-rbacclusterrole',
          meta: {
            label: i18n.t('k8s.text_371'),
            permission: 'k8s_rbacclusterroles_list',
          },
          component: Layout,
          children: [
            {
              name: 'K8sRbacclusterrole',
              path: '',
              component: K8sRbacclusterrole,
            },
            {
              name: 'K8sRbacclusterroleCreate',
              path: 'create',
              component: K8sRbacclusterroleCreate,
            },
          ],
        },
        {
          path: '/k8s-rbacrolebinding',
          meta: {
            label: i18n.t('k8s.text_25'),
            permission: 'k8s_rbacrolebindings_list',
          },
          component: Layout,
          children: [
            {
              name: 'K8sRbacrolebinding',
              path: '',
              component: K8sRbacrolebinding,
            },
            {
              name: 'K8sRbacrolebindingCreate',
              path: 'create',
              component: K8sRbacrolebindingCreate,
            },
          ],
        },
        {
          path: '/k8s-rbacclusterrolebinding',
          meta: {
            label: i18n.t('k8s.text_372'),
            permission: 'k8s_rbacclusterrolebindings_list',
          },
          component: Layout,
          children: [
            {
              name: 'K8sRbacclusterrolebind',
              path: '',
              component: K8sRbacclusterrolebinding,
            },
            {
              name: 'K8sRbacclusterrolebindingCreate',
              path: 'create',
              component: K8sRbacclusterrolebindingCreate,
            },
          ],
        },
        {
          path: '/k8s-serviceaccount',
          meta: {
            label: i18n.t('k8s.text_26'),
            permission: 'k8s_serviceaccounts_list',
          },
          component: Layout,
          children: [
            {
              name: 'K8sServiceAccount',
              path: '',
              component: K8sServiceAccount,
            },
          ],
        },
        {
          path: '/k8s-kubecomponent',
          meta: {
            label: i18n.t('k8s.text_27'),
            permission: 'k8s_kubeclusters_list', // 服务组件权限和 集群list 权限一致
          },
          component: Layout,
          children: [
            {
              name: 'K8sKubeComponent',
              path: '',
              component: K8sKubeComponent,
            },
            {
              name: 'K8sKubeComponentCreate',
              path: 'create',
              component: K8sKubeComponentCreate,
            },
            {
              name: 'K8sKubeComponentUpdate',
              path: 'update',
              component: K8sKubeComponentUpdate,
            },
          ],
        },
      ],
    },
    {
      meta: {
        label: i18n.t('k8s.text_364'),
      },
      submenus: [
        {
          path: '/k8s-federatednamespace',
          meta: {
            label: i18n.t('k8s.text_365'),
            permission: 'k8s_federatednamespaces_list',
          },
          component: Layout,
          children: [
            {
              name: 'Federatednamespace',
              path: '',
              component: Federatednamespace,
            },
            {
              name: 'FederatednamespaceCreate',
              path: 'create',
              component: FederatednamespaceCreate,
            },
          ],
        },
        {
          path: '/k8s-federatedrole',
          meta: {
            label: i18n.t('k8s.text_370'),
            permission: 'k8s_federatedroles_list',
          },
          component: Layout,
          children: [
            {
              name: 'federatedrole',
              path: '',
              component: Federatedrole,
            },
            {
              name: 'FederatedroleCreate',
              path: 'create',
              component: FederatedroleCreate,
            },
          ],
        },
        {
          path: '/k8s-federatedclusterrole',
          meta: {
            label: i18n.t('k8s.text_373'),
            permission: 'k8s_federatedclusterroles_list',
          },
          component: Layout,
          children: [
            {
              name: 'Federatedclusterrole',
              path: '',
              component: Federatedclusterrole,
            },
            {
              name: 'FederatedclusterroleCreate',
              path: 'create',
              component: FederatedclusterroleCreate,
            },
          ],
        },
        {
          path: '/k8s-federatedrolebinding',
          meta: {
            label: i18n.t('k8s.text_374'),
            permission: 'k8s_federatedrolebindings_list',
          },
          component: Layout,
          children: [
            {
              name: 'Federatedrolebinding',
              path: '',
              component: Federatedrolebinding,
            },
            {
              name: 'FederatedrolebindingCreate',
              path: 'create',
              component: FederatedrolebindingCreate,
            },
          ],
        },
        {
          path: '/k8s-federatedclusterrolebinding',
          meta: {
            label: i18n.t('k8s.text_375'),
            permission: 'k8s_federatedclusterrolebindings_list',
          },
          component: Layout,
          children: [
            {
              name: 'Federatedclusterrolebinding',
              path: '',
              component: Federatedclusterrolebinding,
            },
            {
              name: 'FederatedclusterrolebindingCreate',
              path: 'create',
              component: FederatedclusterrolebindingCreate,
            },
          ],
        },
      ],
    },
  ],
}
