import Layout from '@/layouts/RouterView'
import store from '@/store'
import { hasSetupKey } from '@/utils/auth'
import i18n from '@/locales'
import { isScopedPolicyMenuHidden } from '@/utils/scopedPolicy'

const K8sRbacrolebindingCreate = () => import(/* webpackChunkName: "k8s" */ /* webpackPrefetch: true */ '@K8S/views/rbacrolebinding/create')
const K8sRbacclusterroleCreate = () => import(/* webpackChunkName: "k8s" */ /* webpackPrefetch: true */ '@K8S/views/rbacclusterrole/create')
const K8sRbacclusterrolebinding = () => import(/* webpackChunkName: "k8s" */ /* webpackPrefetch: true */ '@K8S/views/rbacclusterrolebinding')
const K8sRbacclusterrolebindingCreate = () => import(/* webpackChunkName: "k8s" */ /* webpackPrefetch: true */ '@K8S/views/rbacclusterrolebinding/create')
const Federatednamespace = () => import(/* webpackChunkName: "k8s" */ /* webpackPrefetch: true */ '@K8S/views/federatednamespace')
const Federatedclusterrole = () => import(/* webpackChunkName: "k8s" */ /* webpackPrefetch: true */ '@K8S/views/federatedclusterrole')
const FederatedclusterroleCreate = () => import(/* webpackChunkName: "k8s" */ /* webpackPrefetch: true */ '@K8S/views/federatedclusterrole/create')
const Federatedrolebinding = () => import(/* webpackChunkName: "k8s" */ /* webpackPrefetch: true */ '@K8S/views/federatedrolebinding')
const FederatedrolebindingCreate = () => import(/* webpackChunkName: "k8s" */ /* webpackPrefetch: true */ '@K8S/views/federatedrolebinding/create')
const Federatedclusterrolebinding = () => import(/* webpackChunkName: "k8s" */ /* webpackPrefetch: true */ '@K8S/views/federatedclusterrolebinding')
const FederatedclusterrolebindingCreate = () => import(/* webpackChunkName: "k8s" */ /* webpackPrefetch: true */ '@K8S/views/federatedclusterrolebinding/create')
const Federatedrole = () => import(/* webpackChunkName: "k8s" */ /* webpackPrefetch: true */ '@K8S/views/federatedrole')
const Kubeclusters = () => import(/* webpackChunkName: "k8s" */ /* webpackPrefetch: true */ '@K8S/views/cluster')
const KubeclustersCreate = () => import(/* webpackChunkName: "k8s" */ /* webpackPrefetch: true */ '@K8S/views/cluster/create')
const KubeclustersImport = () => import(/* webpackChunkName: "k8s" */ /* webpackPrefetch: true */ '@K8S/views/cluster/import')
const Deployment = () => import(/* webpackChunkName: "k8s" */ /* webpackPrefetch: true */ '@K8S/views/deployment')
const K8sDeploymentCreate = () => import(/* webpackChunkName: "k8s" */ /* webpackPrefetch: true */ '@K8S/views/deployment/create')
const Daemonset = () => import(/* webpackChunkName: "k8s" */ /* webpackPrefetch: true */ '@K8S/views/daemonset')
const K8sDaemonsetCreate = () => import(/* webpackChunkName: "k8s" */ /* webpackPrefetch: true */ '@K8S/views/daemonset/create')
const K8SNode = () => import(/* webpackChunkName: "k8s" */ /* webpackPrefetch: true */ '@K8S/views/nodes')
const K8sStorageclasses = () => import(/* webpackChunkName: "k8s" */ /* webpackPrefetch: true */ '@K8S/views/storage-class')
const K8sStorageclassesCreate = () => import(/* webpackChunkName: "k8s" */ /* webpackPrefetch: true */ '@K8S/views/storage-class/create')
const K8sNamespace = () => import(/* webpackChunkName: "k8s" */ /* webpackPrefetch: true */ '@K8S/views/namespace')
const K8sNamespaceCreate = () => import(/* webpackChunkName: "k8s" */ /* webpackPrefetch: true */ '@K8S/views/namespace/create')
const K8sRbacrole = () => import(/* webpackChunkName: "k8s" */ /* webpackPrefetch: true */ '@K8S/views/rbacrole')
const K8sRbacrolebinding = () => import(/* webpackChunkName: "k8s" */ /* webpackPrefetch: true */ '@K8S/views/rbacrolebinding')
const K8sRbacroleCreate = () => import(/* webpackChunkName: "k8s" */ /* webpackPrefetch: true */ '@K8S/views/rbacrole/create')
const K8sRbacclusterrole = () => import(/* webpackChunkName: "k8s" */ /* webpackPrefetch: true */ '@K8S/views/rbacclusterrole')
const K8sServiceAccount = () => import(/* webpackChunkName: "k8s" */ /* webpackPrefetch: true */ '@K8S/views/service-account')
const K8sKubeComponent = () => import(/* webpackChunkName: "k8s" */ /* webpackPrefetch: true */ '@K8S/views/kube-component')
const K8sKubeComponentCreate = () => import(/* webpackChunkName: "k8s" */ /* webpackPrefetch: true */ '@K8S/views/kube-component/create')
const K8sKubeComponentUpdate = () => import(/* webpackChunkName: "k8s" */ /* webpackPrefetch: true */ '@K8S/views/kube-component/update')
const Statefulset = () => import(/* webpackChunkName: "k8s" */ /* webpackPrefetch: true */ '@K8S/views/statefulset')
const K8sStatefulsetCreate = () => import(/* webpackChunkName: "k8s" */ /* webpackPrefetch: true */ '@K8S/views/statefulset/create')
const Pod = () => import(/* webpackChunkName: "k8s" */ /* webpackPrefetch: true */ '@K8S/views/pod')
const Job = () => import(/* webpackChunkName: "k8s" */ /* webpackPrefetch: true */ '@K8S/views/job')
const K8sJobCreate = () => import(/* webpackChunkName: "k8s" */ /* webpackPrefetch: true */ '@K8S/views/job/create')
const CronJob = () => import(/* webpackChunkName: "k8s" */ /* webpackPrefetch: true */ '@K8S/views/cronjob')
const K8sCronJobCreate = () => import(/* webpackChunkName: "k8s" */ /* webpackPrefetch: true */ '@K8S/views/cronjob/create')
const Persistentvolumeclaim = () => import(/* webpackChunkName: "k8s" */ /* webpackPrefetch: true */ '@K8S/views/persistentvolumeclaim')
const K8sPersistentvolumeclaimCreate = () => import(/* webpackChunkName: "k8s" */ /* webpackPrefetch: true */ '@K8S/views/persistentvolumeclaim/create')
const Service = () => import(/* webpackChunkName: "k8s" */ /* webpackPrefetch: true */ '@K8S/views/service')
const K8sServiceCreate = () => import(/* webpackChunkName: "k8s" */ /* webpackPrefetch: true */ '@K8S/views/service/create')
const Ingress = () => import(/* webpackChunkName: "k8s" */ /* webpackPrefetch: true */ '@K8S/views/ingress')
const K8sIngressCreate = () => import(/* webpackChunkName: "k8s" */ /* webpackPrefetch: true */ '@K8S/views/ingress/create')
const Configmap = () => import(/* webpackChunkName: "k8s" */ /* webpackPrefetch: true */ '@K8S/views/configmap')
const K8sConfigmapCreate = () => import(/* webpackChunkName: "k8s" */ /* webpackPrefetch: true */ '@K8S/views/configmap/create')
const Secret = () => import(/* webpackChunkName: "k8s" */ /* webpackPrefetch: true */ '@K8S/views/secret')
const K8sSecretCreate = () => import(/* webpackChunkName: "k8s" */ /* webpackPrefetch: true */ '@K8S/views/secret/create')
const FederatednamespaceCreate = () => import(/* webpackChunkName: "k8s" */ /* webpackPrefetch: true */ '@K8S/views/federatednamespace/create')
const FederatedroleCreate = () => import(/* webpackChunkName: "k8s" */ /* webpackPrefetch: true */ '@K8S/views/federatedrole/create')
const K8sRepos = () => import(/* webpackChunkName: "k8s" */ /* webpackPrefetch: true */ '@K8S/views/repos')

export default {
  index: 30,
  meta: {
    label: i18n.t('k8s.text_1'),
    icon: 'menu-k8s',
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
            hidden: () => {
              if (isScopedPolicyMenuHidden('sub_hidden_menus.k8s_deployment')) {
                return true
              }
              return !hasSetupKey('k8s')
            },
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
            hidden: () => {
              if (isScopedPolicyMenuHidden('sub_hidden_menus.k8s_statefulset')) {
                return true
              }
              return !hasSetupKey('k8s')
            },
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
            hidden: () => {
              if (isScopedPolicyMenuHidden('sub_hidden_menus.k8s_daemonset')) {
                return true
              }
              return !hasSetupKey('k8s')
            },
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
            hidden: () => {
              if (isScopedPolicyMenuHidden('sub_hidden_menus.k8s_job')) {
                return true
              }
              return !hasSetupKey('k8s')
            },
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
            hidden: () => {
              if (isScopedPolicyMenuHidden('sub_hidden_menus.k8s_cronjob')) {
                return true
              }
              return !hasSetupKey('k8s')
            },
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
            hidden: () => {
              if (isScopedPolicyMenuHidden('sub_hidden_menus.k8s_pod')) {
                return true
              }
              return !hasSetupKey('k8s')
            },
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
            hidden: () => {
              if (isScopedPolicyMenuHidden('sub_hidden_menus.k8s_persistentvolumeclaim')) {
                return true
              }
              return !hasSetupKey('k8s')
            },
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
        label: i18n.t('k8s.repo'),
      },
      submenus: [
        {
          path: '/k8s-repos',
          meta: {
            label: i18n.t('k8s.text_158'),
            permission: 'k8s_container_registries_list',
            hidden: () => {
              if (isScopedPolicyMenuHidden('sub_hidden_menus.k8s_service')) {
                return true
              }
              if (!store.getters.isAdminMode) return true
              return !hasSetupKey('k8s')
            },
          },
          component: Layout,
          children: [
            {
              name: 'K8sRepos',
              path: '',
              component: K8sRepos,
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
            hidden: () => {
              if (isScopedPolicyMenuHidden('sub_hidden_menus.k8s_service')) {
                return true
              }
              return !hasSetupKey('k8s')
            },
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
            hidden: () => {
              if (isScopedPolicyMenuHidden('sub_hidden_menus.k8s_ingress')) {
                return true
              }
              return !hasSetupKey('k8s')
            },
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
            hidden: () => {
              if (isScopedPolicyMenuHidden('sub_hidden_menus.k8s_configmap')) {
                return true
              }
              return !hasSetupKey('k8s')
            },
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
            hidden: () => {
              if (isScopedPolicyMenuHidden('sub_hidden_menus.k8s_secret')) {
                return true
              }
              return !hasSetupKey('k8s')
            },
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
        hidden: () => store.getters.isProjectMode,
      },
      submenus: [
        {
          path: '/k8s-cluster',
          meta: {
            label: i18n.t('k8s.text_19'),
            permission: 'k8s_kubeclusters_list',
            hidden: () => {
              if (isScopedPolicyMenuHidden('sub_hidden_menus.k8s_cluster')) {
                return true
              }
              return !hasSetupKey('k8s')
            },
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
            hidden: () => {
              if (isScopedPolicyMenuHidden('sub_hidden_menus.k8s_node')) {
                return true
              }
              return !hasSetupKey('k8s')
            },
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
            hidden: () => {
              if (isScopedPolicyMenuHidden('sub_hidden_menus.k8s_storageclass')) {
                return true
              }
              return !hasSetupKey('k8s')
            },
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
            hidden: () => {
              if (isScopedPolicyMenuHidden('sub_hidden_menus.k8s_namespace')) {
                return true
              }
              return !hasSetupKey('k8s')
            },
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
            hidden: () => {
              if (isScopedPolicyMenuHidden('sub_hidden_menus.k8s_rbacrole')) {
                return true
              }
              return !hasSetupKey('k8s')
            },
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
            hidden: () => {
              if (isScopedPolicyMenuHidden('sub_hidden_menus.k8s_rbacclusterrole')) {
                return true
              }
              return !hasSetupKey('k8s')
            },
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
            hidden: () => {
              if (isScopedPolicyMenuHidden('sub_hidden_menus.k8s_rbacrolebinding')) {
                return true
              }
              return !hasSetupKey('k8s')
            },
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
            hidden: () => {
              if (isScopedPolicyMenuHidden('sub_hidden_menus.k8s_rbacclusterrolebinding')) {
                return true
              }
              return !hasSetupKey('k8s')
            },
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
            hidden: () => {
              if (isScopedPolicyMenuHidden('sub_hidden_menus.k8s_serviceaccount')) {
                return true
              }
              return !hasSetupKey('k8s')
            },
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
            hidden: () => {
              if (isScopedPolicyMenuHidden('sub_hidden_menus.k8s_kubecomponent')) {
                return true
              }
              return !hasSetupKey('k8s')
            },
          },
          component: Layout,
          children: [
            {
              name: 'K8sKubeComponent',
              path: '',
              component: K8sKubeComponent,
              meta: {
                key: '/k8s-kubecomponent',
                keepAlive: true,
                keepAliveViews: ['K8sKubeComponentUpdate'],
              },
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
        hidden: () => store.getters.isProjectMode,
      },
      submenus: [
        {
          path: '/k8s-federatednamespace',
          meta: {
            label: i18n.t('k8s.text_365'),
            permission: 'k8s_federatednamespaces_list',
            hidden: () => {
              if (isScopedPolicyMenuHidden('sub_hidden_menus.k8s_federatednamespace')) {
                return true
              }
              return !hasSetupKey('k8s')
            },
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
            hidden: () => {
              if (isScopedPolicyMenuHidden('sub_hidden_menus.k8s_federatedrole')) {
                return true
              }
              return !hasSetupKey('k8s')
            },
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
            hidden: () => {
              if (isScopedPolicyMenuHidden('sub_hidden_menus.k8s_federatedclusterrole')) {
                return true
              }
              return !hasSetupKey('k8s')
            },
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
            hidden: () => {
              if (isScopedPolicyMenuHidden('sub_hidden_menus.k8s_federatedrolebinding')) {
                return true
              }
              return !hasSetupKey('k8s')
            },
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
            hidden: () => {
              if (isScopedPolicyMenuHidden('sub_hidden_menus.k8s_federatedclusterrolebinding')) {
                return true
              }
              return !hasSetupKey('k8s')
            },
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
