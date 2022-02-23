<template>
  <detail
    :on-manager="onManager"
    :data="Object.assign({}, data, configData)"
    :base-info="baseInfo"
    :extra-info="extraInfo"
    :resource="resource"
    status-module="idp" />
</template>

<script>
import { getEnabledTableColumn, getStatusTableColumn, getCopyWithContentTableColumn } from '@/utils/common/tableColumn'
import WindowsMixin from '@/mixins/windows'
import IdpSamlXml from '../components/IdpSamlXml'

export default {
  name: 'IDPDetail',
  mixins: [WindowsMixin],
  props: {
    data: {
      type: Object,
      required: true,
    },
    onManager: {
      type: Function,
      required: true,
    },
    resource: String,
  },
  data () {
    const { isDomainMode } = this.$store.getters
    const driverOptions = Object.keys(this.$t('idpDrivers')).reduce((prev, current) => {
      prev[current.toLowerCase()] = current
      return prev
    }, {})
    return {
      configData: {},
      configChildrens: {
        cas: [
          {
            field: 'cas_server_url',
            title: this.$t('system.text_210'),
          },
          {
            title: 'Redirect URI',
            field: 'redirect_uri',
          },
        ],
        msad_one_domain: [
          {
            field: 'url',
            title: this.$t('system.text_217'),
          },
          {
            field: 'suffix',
            title: this.$t('system.text_219'),
          },
          {
            field: 'user',
            span: 24,
            title: this.$t('system.text_143'),
          },
          {
            field: 'user_tree_dn',
            span: 24,
            title: `${this.$t('dictionary.user')}DN`,
          },
          {
            field: 'group_tree_dn',
            title: `${this.$t('dictionary.group')}DN`,
          },
        ],
        msad_multi_domain: [
          {
            field: 'url',
            title: this.$t('system.text_217'),
          },
          {
            field: 'suffix',
            title: this.$t('system.text_219'),
          },
          {
            field: 'user',
            span: 24,
            title: this.$t('system.text_143'),
          },
          {
            field: 'domain_tree_dn',
            title: `${this.$t('dictionary.domain')}DN`,
          },
        ],
        openldap_one_domain: [
          {
            field: 'url',
            title: this.$t('system.text_217'),
          },
          {
            field: 'suffix',
            title: this.$t('system.text_219'),
          },
          {
            field: 'user',
            span: 24,
            title: this.$t('system.text_143'),
          },
          {
            field: 'user_tree_dn',
            span: 24,
            title: `${this.$t('dictionary.user')}DN`,
          },
          {
            field: 'group_tree_dn',
            title: `${this.$t('dictionary.group')}DN`,
          },
          {
            field: 'disable_user_on_import',
            title: this.$t('system.text_223'),
            slots: {
              default: ({ row }) => {
                return [
                  <div class='text-truncate d-flex align-items-center'>
                    <status status={ !row.disable_user_on_import } statusModule='enabled' />
                    <help-tooltip class='ml-1' name='disable_user_on_import' />
                  </div>,
                ]
              },
            },
          },
        ],
        oidc: [
          {
            field: 'client_id',
            title: 'ClientID',
          },
          {
            field: 'client_secret',
            title: 'ClientSecret',
          },
          {
            field: 'scopes',
            title: 'Scopes',
          },
          {
            field: 'auth_url',
            title: 'AuthUrl',
          },
          {
            field: 'token_url',
            title: 'TokenUrl',
          },
          {
            field: 'userinfo_url',
            title: 'UserinfoUrl',
          },
          {
            title: 'RedirectURI',
            field: 'redirect_uri',
          },
        ],
        github_oidc: [
          {
            field: 'client_id',
            title: 'ClientID',
          },
          {
            field: 'client_secret',
            title: 'ClientSecret',
          },
          {
            title: 'RedirectURI',
            field: 'redirect_uri',
          },
        ],
        azure_oidc: [
          {
            field: 'client_id',
            title: 'ClientID',
          },
          {
            field: 'client_secret',
            title: 'ClientSecret',
          },
          {
            field: 'tenant_id',
            title: 'TenantId',
          },
          {
            field: 'cloud_env',
            title: this.$t('common.region'),
            slots: {
              default: ({ row }) => {
                const value = (row.cloud_env || 'global').toLowerCase()
                if (value === 'global') {
                  return this.$t('common_703')
                }
                if (value === 'china') {
                  return this.$t('common_702')
                }
              },
            },
          },
          {
            title: 'Redirect URI',
            field: 'redirect_uri',
          },
        ],
        saml: [
          {
            field: 'entity_id',
            title: 'EntityId',
          },
          {
            title: 'RedirectSSOURL',
            field: 'redirect_sso_url',
          },
          {
            title: 'AssertionURI',
            // field: 'redirect_uri',
            slots: {
              default: ({ row }) => {
                console.log('redirect_uri', row)
                if (!row.remoteConfig) {
                  return '-'
                }
                return <div>{{ row }}</div>
              },
            },
          },
        ],
        azure_ad_saml: [
          {
            field: 'tenant_id',
            title: 'TenantId',
          },
          {
            title: 'AssertionURI',
            field: 'redirect_uri',
          },
          {
            field: 'cloud_env',
            title: this.$t('common.region'),
            slots: {
              default: ({ row }) => {
                const value = (row.cloud_env || 'global').toLowerCase()
                if (value === 'global') {
                  return this.$t('common_703')
                }
                if (value === 'china') {
                  return this.$t('common_702')
                }
              },
            },
          },
        ],
        feishu_oauth2: [
          {
            field: 'app_id',
            title: 'AppId',
          },
          {
            field: 'secret',
            title: 'Secret',
          },
          {
            title: 'RedirectURI',
            field: 'redirect_uri',
          },
        ],
        dingtalk_oauth2: [
          {
            field: 'app_id',
            title: 'AppId',
          },
          {
            field: 'secret',
            title: 'Secret',
          },
          {
            title: 'RedirectURI',
            field: 'redirect_uri',
          },
        ],
        qywechat_oauth2: [
          {
            field: 'corp_id',
            title: this.$t('system.cropid'),
          },
          {
            field: 'agent_id',
            title: 'AgentId',
          },
          {
            field: 'secret',
            title: 'Secret',
          },
          {
            title: 'RedirectURI',
            field: 'redirect_uri',
          },
        ],
      },
      baseInfo: [
        {
          field: 'project_domain',
          title: (isDomainMode || this.data.domain_id) ? this.$t('common_566', [this.$t('dictionary.domain')]) : this.$t('common_548'),
          slots: {
            default: ({ row }) => {
              if (!row.domain_id) return this.$t('system.text_15')
              return <side-page-trigger permission='domains_get' name='DomainSidePage' id={row.domain_id} vm={this}>{ row.project_domain }</side-page-trigger>
            },
          },
        },
        getEnabledTableColumn(),
        getStatusTableColumn({ title: this.$t('system.text_203'), field: 'sync_status', statusModule: 'sync' }),
        getEnabledTableColumn({ title: this.$t('common_501'), field: 'auto_create_user', minWidth: 130 }),
        getCopyWithContentTableColumn({
          field: 'target_domain',
          title: this.$t('common_556'),
        }),
        {
          field: 'driver',
          title: this.$t('system.text_204'),
          formatter: ({ row }) => {
            return driverOptions[row.driver] || row.driver
          },
        },
        getCopyWithContentTableColumn({
          field: 'template',
          title: this.$t('common_550'),
          hideField: true,
          message: (row) => {
            return this.$t('idpTmplTitles')[row.template] || row.template || '-'
          },
          slotCallback: (row) => {
            return this.$t('idpTmplTitles')[row.template] || row.template || '-'
          },
        }),
        {
          field: 'last_sync',
          title: this.$t('system.text_254'),
          formatter: ({ row }) => {
            return this.$moment(row.last_sync).format()
          },
        },
      ],
      extraInfo: [
        {
          title: this.$t('common_553'),
          slots: {
            default: ({ row }) => {
              return [
                <IdpSamlXml data={ row } />,
              ]
            },
          },
          hidden: () => {
            const show = this.data.driver === 'saml' && !this.data.template
            return !show
          },
        },
        {
          title: this.$t('system.text_173'),
          items: [
            {
              field: 'group_count',
              title: this.$t('dictionary.group'),
            },
            {
              field: 'user_count',
              title: this.$t('dictionary.user'),
            },
            {
              field: 'project_count',
              title: this.$t('dictionary.project'),
            },
            {
              field: 'role_count',
              title: this.$t('dictionary.role'),
            },
            {
              field: 'policy_count',
              title: this.$t('dictionary.policy'),
            },
          ],
        },
      ],
    }
  },
  created () {
    this.fetchQueryConfig()
  },
  methods: {
    async fetchQueryConfig () {
      try {
        const manager = new this.$Manager('identity_providers', 'v1')
        const { data: { config } } = await manager.getSpecific({ id: this.data.id, spec: 'config' })
        const template = this.data.template || this.data.driver
        if (config) {
          if (template && this.data.driver) {
            const _config = config[this.data.driver]
            if (template === 'qywechat_oauth2') {
              const { app_id } = _config
              const [corp_id, agent_id] = app_id.split('/')
              _config.corp_id = corp_id
              _config.agent_id = agent_id
              delete _config.app_id
            }
            _config.remoteConfig = {}
            if (this.data.driver === 'saml' || this.data.driver === 'oidc' || this.data.driver === 'oauth2' || this.data.driver === 'cas') {
              _config.remoteConfig = this.queryCallbackUri()
            }

            this.configData = _config

            this.extraInfo.unshift({
              title: this.$t('system.text_255'),
              items: this.configChildrens[template].map(item => {
                if (item.slots) {
                  return item
                }
                return getCopyWithContentTableColumn({
                  ...item,
                })
              }),
            })
          }
        }
      } catch (err) {
        throw err
      }
    },
    async queryCallbackUri () {
      try {
        const manager = new this.$Manager('auth/idp', 'v1')
        const { data } = await manager.getSpecific({
          id: this.data.id,
          spec: 'info',
        })
        console.log('queryCallbackUri', data)
        return data
      } catch (err) {
        throw err
      }
    },
  },
}
</script>
