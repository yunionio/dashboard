<template>
  <detail
    :onManager="onManager"
    :data="data"
    :base-info="baseInfo"
    :extra-info="extraInfo"
    status-module="server"
    resource="llms" />
</template>

<script>
import {
  getUserTagColumn,
} from '@/utils/common/detailColumn'
import { sizestr } from '@/utils/utils'
import WindowsMixin from '@/mixins/windows'
import { getStatusTableColumn } from '@/utils/common/tableColumn'
import {
  getLlmIpColumn,
  // getStreamEndpointColumn,
  // getPortsColumn,
  getLlmSkuColumn,
  getLlmImageColumn,
  getCpuTableColumn,
  getMemoryTableColumn,
  getBandwidthTableColumn,
  getNetworkTypeTableColumn,
  getNetworkTableColumn,
} from '../utils/columns'
import { getLlmSpecSections, fetchLlmSpecCredentialNames, fetchLlmSpecDifyImages } from '../../llm-sku/utils/llmSpecDetail'

export default {
  name: 'PhoneDetail',
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
  },
  data () {
    return {
      isApplyType: this.$route.path.includes('app-llm'),
      credentialNamesMap: {},
      difyImageNamesMap: {},
      skuLlmSpecOpenclaw: null,
      baseInfo: [
        getUserTagColumn({
          onManager: this.onManager,
          resource: 'llms',
          columns: () => this.columns,
          tipName: this.$t('aice.instance'),
        }),
        getStatusTableColumn({ field: 'llm_status', statusModule: 'container', title: this.$t('aice.container_status') }),
      ],
      streamEndpoint: null,
      ports: [],
      loginInfo: null,
      loginInfoSection: [],
      loginPasswordVisible: false,
    }
  },
  computed: {
    extraInfo () {
      return [
        {
          title: this.$t('aice.config_info'),
          items: [
            getLlmIpColumn(),
            getLlmSkuColumn({ vm: this, isApplyType: this.isApplyType }),
            getLlmImageColumn({ vm: this }),
            getCpuTableColumn(),
            getMemoryTableColumn(),
            getBandwidthTableColumn(),
            getNetworkTypeTableColumn(),
            getNetworkTableColumn(),
            {
              field: 'volume',
              title: this.$t('aice.disk'),
              slots: {
                default: ({ row }) => {
                  if (!row.volume || !row.volume.size_mb) return '-'
                  const { id, size_mb, storage_type } = row.volume
                  const storageType = this.$te('common.storage.' + storage_type) ? this.$t('common.storage.' + storage_type) : storage_type
                  const volumeText = `${id} (${sizestr(size_mb, 'M', 1024)} ${storageType})`
                  return [
                    <list-body-cell-wrap copy hideField={true} field='volume' row={row} message={id}>
                      <side-page-trigger permission='disks_get' name='DiskSidePage' id={id} vm={this}>{volumeText}</side-page-trigger>
                    </list-body-cell-wrap>,
                  ]
                },
              },
            },
            {
              field: 'cmp_id',
              title: this.$t('dictionary.server_container'),
              slots: {
                default: ({ row }) => {
                  if (!row.cmp_id) return '-'
                  const serverText = `${row.server} (${row.cmp_id})`
                  return [
                    <list-body-cell-wrap copy hideField={true} field='server' row={row} message={row.cmp_id}>
                      <side-page-trigger permission='servers_get' name='VmContainerInstanceSidePage' id={row.cmp_id} vm={this}>{serverText}</side-page-trigger>
                    </list-body-cell-wrap>,
                  ]
                },
              },
            },
            {
              field: 'host',
              title: this.$t('compute.text_111'),
              sortable: true,
              showOverflow: 'ellipsis',
              minWidth: 100,
              slots: {
                default: ({ row }) => {
                  const text = row.host || '-'
                  return [
                    <list-body-cell-wrap copy hideField={true} field='host' row={row} message={text}>
                      <side-page-trigger permission='hosts_get' name='HostSidePage' id={row.host_id} vm={this}>{row.host}</side-page-trigger>
                    </list-body-cell-wrap>,
                  ]
                },
              },
            },
            {
              field: 'mounted_models',
              title: this.isApplyType ? this.$t('aice.app_llm_instantapp') : this.$t('aice.llm_instantapp'),
              slots: {
                default: ({ row }) => {
                  const mounted_apps = row.mounted_models
                  if (mounted_apps?.length) {
                    return mounted_apps.map((item, idx) => {
                      return <list-body-cell-wrap copy hideField={true} field='mounted_models' row={item} message={item.fullname}>
                        <side-page-trigger permission='llm_instant_models_get' name='LlmInstantModelSidePage' id={item.id} vm={this}>{item.fullname}</side-page-trigger>
                      </list-body-cell-wrap>
                    })
                  }
                  return '-'
                },
              },
            },
          ],
        },
        ...this.loginInfoSection,
        ...getLlmSpecSections(this),
      ]
    },
  },
  watch: {
    'data.llm_spec': {
      handler () {
        this.fetchSkuOpenclawIfNeeded()
        fetchLlmSpecCredentialNames(this)
        fetchLlmSpecDifyImages(this)
      },
      deep: true,
    },
    'data.llm_sku_id': {
      handler () {
        this.fetchSkuOpenclawIfNeeded()
      },
    },
  },
  created () {
    this.getAccessInfo()
    this.fetchSkuOpenclawIfNeeded()
    fetchLlmSpecCredentialNames(this)
    fetchLlmSpecDifyImages(this)
  },
  methods: {
    handleUpdateSpec () {
      if ((this.data.llm_type || '').toLowerCase() !== 'openclaw') return
      this.createDialog('LlmUpdateSpecDialog', {
        data: [this.data],
        onManager: this.onManager,
        refresh: () => {
          if (this.$emit) this.$emit('refresh')
        },
      })
    },
    async fetchSkuOpenclawIfNeeded () {
      if (!this.data || !this.data.llm_sku_id) {
        this.skuLlmSpecOpenclaw = null
        return
      }
      const hasInstanceProviders = this.data.llm_spec?.openclaw?.providers?.length > 0
      if (hasInstanceProviders) {
        this.skuLlmSpecOpenclaw = null
        return
      }
      try {
        const res = await new this.$Manager('llm_skus').get({ id: this.data.llm_sku_id })
        const openclaw = res.data && res.data.llm_spec && res.data.llm_spec.openclaw != null ? res.data.llm_spec.openclaw : null
        this.skuLlmSpecOpenclaw = openclaw && (openclaw.providers?.length > 0) ? openclaw : null
        if (this.skuLlmSpecOpenclaw) {
          fetchLlmSpecCredentialNames(this)
        }
      } catch (e) {
        this.skuLlmSpecOpenclaw = null
      }
    },
    async getAccessInfo () {
      const loginSectionItems = []
      this.loginPasswordVisible = false
      try {
        // GET /llms/<llm_id>/login-info
        const loginRes = await new this.$Manager('llms', 'v2').get({
          id: `${this.data.id}/login-info`,
        })
        const info = loginRes.data || {}
        this.loginInfo = info
        const loginUrl = info.login_url != null ? info.login_url : ''
        const username = info.username != null ? info.username : ''
        const password = info.password != null ? info.password : ''
        const extra = info.extra && typeof info.extra === 'object' ? { ...info.extra } : {}
        if ((this.data.llm_type || '').toLowerCase() === 'hermes-agent') {
          delete extra.OPENCLAW_GATEWAY_TOKEN
        }

        loginSectionItems.push({
          field: 'login_url',
          title: this.$t('aice.login_url'),
          slots: {
            default: () => {
              const urlCtrl = (loginUrl) => {
                return <list-body-cell-wrap copy hideField={true} field='login_url' row={{ login_url: loginUrl }} message={loginUrl}>
                  {loginUrl || '-'}
                  <a-icon type="link" class="ml-1" onClick={() => this.openLoginUrl(loginUrl)} />
                </list-body-cell-wrap>
              }
              const urls = [
                urlCtrl(loginUrl),
              ]
              if (this.loginInfo.internal_url && this.loginInfo.internal_url !== loginUrl) {
                urls.push(urlCtrl(this.loginInfo.internal_url))
              }
              if (this.loginInfo.public_url && this.loginInfo.public_url !== loginUrl) {
                urls.push(urlCtrl(this.loginInfo.public_url))
              }
              return urls
            },
          },
        })
        loginSectionItems.push({
          field: 'login_username',
          title: this.$t('aice.login_username'),
          slots: {
            default: () => [
              <list-body-cell-wrap copy hideField={true} field='username' row={{ username }} message={username}>
                {username || '-'}
              </list-body-cell-wrap>,
            ],
          },
        })
        loginSectionItems.push({
          field: 'login_password',
          title: this.$t('aice.login_password'),
          slots: {
            default: () => {
              const displayValue = this.loginPasswordVisible ? (password || '-') : password ? '••••••' : '-'
              return [
                <div class="login-password-row">
                  <span class="login-password-value">{displayValue}</span>
                  {password &&
                    [
                      <a-icon
                        class="login-password-eye ml-1"
                        type={this.loginPasswordVisible ? 'eye-invisible' : 'eye'}
                        theme="twoTone"
                        twoToneColor="#1890ff"
                        on-click={() => { this.loginPasswordVisible = !this.loginPasswordVisible }}
                      />,
                      <a-icon
                        class="login-password-copy ml-1"
                        type="copy"
                        theme="twoTone"
                        twoToneColor="#1890ff"
                        on-click={() => this.copyLoginPassword(password)}
                      />,
                    ]}
                </div>,
              ]
            },
          },
        })
        const extraKeys = Object.keys(extra)
        if (extraKeys.length > 0) {
          const extraLines = extraKeys.map(k => {
            const v = extra[k]
            return `${k}: ${v != null ? String(v) : ''}`
          }).join('\n')
          const extraFullText = extraLines
          loginSectionItems.push({
            field: 'login_extra',
            title: this.$t('aice.login_extra'),
            slots: {
              default: () => [
                <list-body-cell-wrap copy hideField={true} field='extra' row={{ extra: extraFullText }} message={extraFullText}>
                  <div style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                    {extraLines}
                  </div>
                </list-body-cell-wrap>,
              ],
            },
          })
        }
      } catch (loginErr) {
        try {
          const urlRes = await new this.$Manager('llms', 'v2').get({
            id: `${this.data.id}/url`,
          })
          const access_url = (urlRes.data && urlRes.data.access_url) != null ? urlRes.data.access_url : ''
          loginSectionItems.push({
            field: 'access_url',
            title: this.$t('aice.access_url'),
            slots: {
              default: () => [
                <list-body-cell-wrap copy hideField={true} field='access_url' row={{ access_url }} message={access_url}>
                  {access_url || '-'}
                </list-body-cell-wrap>,
              ],
            },
          })
        } catch (urlErr) {
          console.error(urlErr)
        }
      }
      if (loginSectionItems.length > 0) {
        this.loginInfoSection = [{
          title: this.$t('aice.login_info'),
          items: loginSectionItems,
        }]
      }
    },
    async copyLoginPassword (value) {
      if (value == null || value === '') return
      try {
        await this.$copyText(String(value))
        this.$message.success(this.$t('common.copy'))
      } catch (e) {
        this.$message.error(this.$t('common.copyError'))
      }
    },
    openLoginUrl (url) {
      if (url == null || url === '') return
      window.open(url, '_blank')
    },
  },
}
</script>

<style scoped>
.login-password-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
}
.login-password-value {
  color: #333;
}
.login-password-eye {
  cursor: pointer;
  vertical-align: middle;
}
.login-password-copy {
  cursor: pointer;
  vertical-align: middle;
}
</style>
