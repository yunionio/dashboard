import Layout from '@/layouts/RouterView'
import { hasSetupKey } from '@/utils/auth'
import i18n from '@/locales'
import { isScopedPolicyMenuHidden } from '@/utils/scopedPolicy'

const Kafka = () => import(/* webpackChunkName: "middleware" */ /* webpackPrefetch: true */ '@Middleware/views/kafka')
const Elasticsearch = () => import(/* webpackChunkName: "middleware" */ /* webpackPrefetch: true */ '@Middleware/views/elasticsearch')

export default {
  index: 60,
  meta: {
    label: i18n.t('middleware'),
    icon: 'menu-middleware',
  },
  menus: [
    /**
     * 消息队列
     */
    {
      meta: {
        label: i18n.t('dictionary.message_queue'),
        t: 'dictionary.message_queue',
      },
      submenus: [
        {
          path: '/kafka',
          meta: {
            label: i18n.t('middleware.kafka'),
            permission: 'kafkas_list',
            t: 'middleware.kafka',
            hidden: () => {
              if (isScopedPolicyMenuHidden('sub_hidden_menus.kafka')) {
                return true
              }
              return !hasSetupKey(['qcloud'])
            },
          },
          component: Layout,
          children: [
            {
              name: 'Kafka',
              path: '',
              component: Kafka,
            },
          ],
        },
      ],
    },
    {
      meta: {
        label: i18n.t('dictionary.data_analysis'),
        t: 'dictionary.data_analysis',
      },
      submenus: [
        {
          path: '/elasticsearch',
          meta: {
            label: i18n.t('middleware.elasticsearch'),
            permission: 'elastic_searchs_list',
            t: 'middleware.elasticsearch',
            hidden: () => {
              if (isScopedPolicyMenuHidden('sub_hidden_menus.elasticsearch')) {
                return true
              }
              return !hasSetupKey(['qcloud'])
            },
          },
          component: Layout,
          children: [
            {
              name: 'Elasticsearch',
              path: '',
              component: Elasticsearch,
            },
          ],
        },
      ],
    },
  ],
}
