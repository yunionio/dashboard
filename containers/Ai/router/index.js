import Layout from '@/layouts/RouterView'
import i18n from '@/locales'
import { isScopedPolicyMenuHidden } from '@/utils/scopedPolicy'
import { featureMenuHiddenCheck } from '@/utils/auth'

const Llm = () => import(/* webpackChunkName: "k8s" */ /* webpackPrefetch: true */ '@Ai/views/llm')
const LlmSku = () => import(/* webpackChunkName: "k8s" */ /* webpackPrefetch: true */ '@Ai/views/llm-sku')
const LlmSkuCreate = () => import(/* webpackChunkName: "k8s" */ /* webpackPrefetch: true */ '@Ai/views/llm-sku/create/index')
const LlmSkuImportFromModelSets = () => import(/* webpackChunkName: "k8s" */ /* webpackPrefetch: true */ '@Ai/views/llm-sku/import-from-model-sets')
const LlmSkuImportFromHuggingFace = () => import(/* webpackChunkName: "k8s" */ /* webpackPrefetch: true */ '@Ai/views/llm-sku/import-from-huggingface')
const LlmInstantmodel = () => import(/* webpackChunkName: "k8s" */ /* webpackPrefetch: true */ '@Ai/views/llm-instantmodel')
const LlmImage = () => import(/* webpackChunkName: "k8s" */ /* webpackPrefetch: true */ '@Ai/views/llm-image')
const LlmInstantmodelImportFromCommunity = () => import(/* webpackChunkName: "k8s" */ /* webpackPrefetch: true */ '@Ai/views/llm-instantmodel/import-from-community')
const LlmInstantmodelImportFromHuggingFace = () => import(/* webpackChunkName: "k8s" */ /* webpackPrefetch: true */ '@Ai/views/llm-instantmodel/import-from-huggingface')
const LlmImageImportCommunity = () => import(/* webpackChunkName: "k8s" */ /* webpackPrefetch: true */ '@Ai/views/llm-image/import-community')
const LlmCreate = () => import(/* webpackChunkName: "k8s" */ /* webpackPrefetch: true */ '@Ai/views/llm/create')
const LlmDeployment = () => import(/* webpackChunkName: "k8s" */ /* webpackPrefetch: true */ '@Ai/views/llm-deployment')
const LlmDeploymentCreate = () => import(/* webpackChunkName: "k8s" */ /* webpackPrefetch: true */ '@Ai/views/llm-deployment/create')
const LlmDeploymentDeployFromModelSets = () => import(/* webpackChunkName: "k8s" */ /* webpackPrefetch: true */ '@Ai/views/llm-deployment/deploy-from-model-sets')
const LlmDeploymentDeployFromHuggingFace = () => import(/* webpackChunkName: "k8s" */ /* webpackPrefetch: true */ '@Ai/views/llm-deployment/deploy-from-huggingface')
const AppLlm = () => import(/* webpackChunkName: "k8s" */ '@Application/views/app-llm')
const AppLlmSku = () => import(/* webpackChunkName: "k8s" */ '@Application/views/app-llm-sku')
const AgentLlmImage = () => import(/* webpackChunkName: "k8s" */ '@Ai/views/agent-llm-image')
const AiVirtualKey = () => import(/* webpackChunkName: "k8s" */ '@Ai/views/ai-virtual-key')
const AiVirtualKeyCreate = () => import(/* webpackChunkName: "k8s" */ '@Ai/views/ai-virtual-key/create')
const AiRouting = () => import(/* webpackChunkName: "k8s" */ '@Ai/views/ai-routing')
const AiRoutingCreate = () => import(/* webpackChunkName: "k8s" */ '@Ai/views/ai-routing/create')
const AiProvider = () => import(/* webpackChunkName: "k8s" */ '@Ai/views/ai-provider')
const AiProviderCreate = () => import(/* webpackChunkName: "k8s" */ '@Ai/views/ai-provider/create')
const AiModel = () => import(/* webpackChunkName: "k8s" */ '@Ai/views/ai-model')
const AiModelCreate = () => import(/* webpackChunkName: "k8s" */ '@Ai/views/ai-model/create')
const AiKey = () => import(/* webpackChunkName: "k8s" */ '@Ai/views/ai-key')
const AiKeyCreate = () => import(/* webpackChunkName: "k8s" */ '@Ai/views/ai-key/create')
const AiProxyNode = () => import(/* webpackChunkName: "k8s" */ '@Ai/views/ai-proxy-node')
const AiProxyNodeCreate = () => import(/* webpackChunkName: "k8s" */ '@Ai/views/ai-proxy-node/create')
export default {
  index: 61,
  meta: {
    label: i18n.t('aice.ai'),
    icon: 'menu-ai',
  },
  menus: [
    // 人工智能-Agent（Agent实例、Agent模板）
    {
      meta: {
        label: i18n.t('aice.agent'),
      },
      submenus: [
        {
          path: '/app-llm',
          meta: {
            label: i18n.t('aice.app_llm'),
            hidden: (userInfo, menu) => {
              if (isScopedPolicyMenuHidden('sub_hidden_menus.app_llm')) {
                return true
              }
              return featureMenuHiddenCheck(menu)
            },
          },
          component: Layout,
          children: [
            {
              name: 'AppLlmList',
              path: '',
              component: AppLlm,
            },
            {
              name: 'AppLlmCreate',
              path: 'create',
              component: LlmCreate,
            },
          ],
        },
        {
          path: '/app-llm-sku',
          meta: {
            label: i18n.t('aice.app_llm_sku'),
            hidden: (userInfo, menu) => {
              if (isScopedPolicyMenuHidden('sub_hidden_menus.app_llm_sku')) {
                return true
              }
              return featureMenuHiddenCheck(menu)
            },
          },
          component: Layout,
          children: [
            {
              name: 'AppLlmSkuList',
              path: '',
              component: AppLlmSku,
            },
            {
              name: 'AppLlmSkuCreate',
              path: 'create',
              component: LlmSkuCreate,
            },
          ],
        },
        {
          path: '/agent-llm-image',
          meta: {
            label: i18n.t('aice.agent_llm_image'),
            hidden: (userInfo, menu) => {
              if (isScopedPolicyMenuHidden('sub_hidden_menus.agent_llm_image') ||
                isScopedPolicyMenuHidden('sub_hidden_menus.app_llm_image')) {
                return true
              }
              return featureMenuHiddenCheck(menu)
            },
          },
          component: Layout,
          children: [
            {
              name: 'AgentLlmImageList',
              path: '',
              component: AgentLlmImage,
            },
            {
              name: 'AgentLlmImageImportCommunity',
              path: 'import-community',
              component: LlmImageImportCommunity,
            },
          ],
        },
      ],
    },
    // 人工智能-推理
    {
      meta: {
        label: i18n.t('common.inference'),
      },
      submenus: [
        {
          path: '/llm-deployment',
          meta: {
            label: i18n.t('aice.llm_deployment'),
            hidden: (userInfo, menu) => {
              if (isScopedPolicyMenuHidden('sub_hidden_menus.llm_deployment')) {
                return true
              }
              return featureMenuHiddenCheck(menu)
            },
          },
          component: Layout,
          children: [
            {
              name: 'LlmDeploymentList',
              path: '',
              component: LlmDeployment,
            },
            {
              name: 'LlmDeploymentCreate',
              path: 'create',
              component: LlmDeploymentCreate,
            },
            {
              name: 'LlmDeploymentDeployFromModelSets',
              path: 'deploy-from-model-sets',
              component: LlmDeploymentDeployFromModelSets,
            },
            {
              name: 'LlmDeploymentDeployFromHuggingFace',
              path: 'deploy-from-huggingface',
              component: LlmDeploymentDeployFromHuggingFace,
            },
          ],
        },
        {
          path: '/llm',
          meta: {
            label: i18n.t('aice.llm'),
            hidden: (userInfo, menu) => {
              if (isScopedPolicyMenuHidden('sub_hidden_menus.llm')) {
                return true
              }
              return featureMenuHiddenCheck(menu)
            },
          },
          component: Layout,
          children: [
            {
              name: 'LlmList',
              path: '',
              component: Llm,
            },
            {
              name: 'LlmCreate',
              path: 'create',
              component: LlmCreate,
            },
          ],
        },
        {
          path: '/llm-sku',
          meta: {
            label: i18n.t('aice.llm_sku'),
            hidden: (userInfo, menu) => {
              if (isScopedPolicyMenuHidden('sub_hidden_menus.llm_sku')) {
                return true
              }
              return featureMenuHiddenCheck(menu)
            },
          },
          component: Layout,
          children: [
            {
              name: 'LlmSkuList',
              path: '',
              component: LlmSku,
            },
            {
              name: 'LlmSkuImportFromModelSets',
              path: 'import-from-model-sets',
              component: LlmSkuImportFromModelSets,
            },
            {
              name: 'LlmSkuImportFromHuggingFace',
              path: 'import-from-huggingface',
              component: LlmSkuImportFromHuggingFace,
            },
            {
              name: 'LlmSkuCreate',
              path: 'create',
              component: LlmSkuCreate,
            },
          ],
        },
        {
          path: '/llm-instantmodel',
          meta: {
            label: i18n.t('aice.llm_instantmodel.menu'),
            hidden: (userInfo, menu) => {
              if (isScopedPolicyMenuHidden('sub_hidden_menus.llm_instantmodel')) {
                return true
              }
              return featureMenuHiddenCheck(menu)
            },
          },
          component: Layout,
          children: [
            {
              name: 'LlmInstantmodelList',
              path: '',
              component: LlmInstantmodel,
            },
            {
              name: 'LlmInstantmodelImportFromCommunity',
              path: 'import-from-community',
              component: LlmInstantmodelImportFromCommunity,
            },
            {
              name: 'LlmInstantmodelImportFromHuggingFace',
              path: 'import-from-huggingface',
              component: LlmInstantmodelImportFromHuggingFace,
            },
          ],
        },
        {
          path: '/llm-image',
          meta: {
            label: i18n.t('aice.inference_llm_image'),
            hidden: (userInfo, menu) => {
              if (isScopedPolicyMenuHidden('sub_hidden_menus.llm_image')) {
                return true
              }
              return featureMenuHiddenCheck(menu)
            },
          },
          component: Layout,
          children: [
            {
              name: 'LlmImageList',
              path: '',
              component: LlmImage,
            },
            {
              name: 'LlmImageImportCommunity',
              path: 'import-community',
              component: LlmImageImportCommunity,
            },
          ],
        },
      ],
    },
    // 人工智能-AI 网关
    {
      meta: {
        label: i18n.t('aice.aiproxy'),
      },
      submenus: [
        {
          path: '/ai-virtual-key',
          meta: {
            label: i18n.t('aice.aiproxy.virtual_key'),
            hidden: (userInfo, menu) => {
              if (isScopedPolicyMenuHidden('sub_hidden_menus.ai_virtual_key')) {
                return true
              }
              return featureMenuHiddenCheck(menu)
            },
          },
          component: Layout,
          children: [
            { name: 'AiVirtualKeyList', path: '', component: AiVirtualKey },
            { name: 'AiVirtualKeyCreate', path: 'create', component: AiVirtualKeyCreate },
          ],
        },
        {
          path: '/ai-routing',
          meta: {
            label: i18n.t('aice.aiproxy.routing'),
            hidden: (userInfo, menu) => {
              if (isScopedPolicyMenuHidden('sub_hidden_menus.ai_routing')) {
                return true
              }
              return featureMenuHiddenCheck(menu)
            },
          },
          component: Layout,
          children: [
            { name: 'AiRoutingList', path: '', component: AiRouting },
            { name: 'AiRoutingCreate', path: 'create', component: AiRoutingCreate },
          ],
        },
        {
          path: '/ai-provider',
          meta: {
            label: i18n.t('aice.aiproxy.provider'),
            hidden: (userInfo, menu) => {
              if (isScopedPolicyMenuHidden('sub_hidden_menus.ai_provider')) {
                return true
              }
              return featureMenuHiddenCheck(menu)
            },
          },
          component: Layout,
          children: [
            { name: 'AiProviderList', path: '', component: AiProvider },
            { name: 'AiProviderCreate', path: 'create', component: AiProviderCreate },
          ],
        },
        {
          path: '/ai-model',
          meta: {
            label: i18n.t('aice.aiproxy.model'),
            hidden: (userInfo, menu) => {
              if (isScopedPolicyMenuHidden('sub_hidden_menus.ai_model')) {
                return true
              }
              return featureMenuHiddenCheck(menu)
            },
          },
          component: Layout,
          children: [
            { name: 'AiModelList', path: '', component: AiModel },
            { name: 'AiModelCreate', path: 'create', component: AiModelCreate },
          ],
        },
        {
          path: '/ai-key',
          meta: {
            label: i18n.t('aice.aiproxy.api_key'),
            hidden: (userInfo, menu) => {
              if (isScopedPolicyMenuHidden('sub_hidden_menus.ai_key')) {
                return true
              }
              return featureMenuHiddenCheck(menu)
            },
          },
          component: Layout,
          children: [
            { name: 'AiKeyList', path: '', component: AiKey },
            { name: 'AiKeyCreate', path: 'create', component: AiKeyCreate },
          ],
        },
        {
          path: '/ai-proxy-node',
          meta: {
            label: i18n.t('aice.aiproxy.proxy_node'),
            hidden: (userInfo, menu) => {
              if (isScopedPolicyMenuHidden('sub_hidden_menus.ai_proxy_node')) {
                return true
              }
              return featureMenuHiddenCheck(menu)
            },
          },
          component: Layout,
          children: [
            { name: 'AiProxyNodeList', path: '', component: AiProxyNode },
            { name: 'AiProxyNodeCreate', path: 'create', component: AiProxyNodeCreate },
          ],
        },
      ],
    },
  ],
}
