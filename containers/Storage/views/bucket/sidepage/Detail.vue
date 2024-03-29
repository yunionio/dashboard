<template>
  <detail
    :on-manager="onManager"
    :data="data"
    :base-info="baseInfo"
    :extra-info="extraInfo"
    statusModule="bucket"
    resource="buckets"
    auto-hidden-columns-key="oss_hidden_columns" />
</template>

<script>
// import BrandIcon from '@/sections/BrandIcon'
import { ACL_TYPE, LOCATION_MAP } from '@Storage/constants/index.js'
import { sizestrWithUnit } from '@/utils/utils'
import WindowsMixin from '@/mixins/windows'
import {
  getBrandTableColumn,
  getCopyWithContentTableColumn,
  getPublicScopeTableColumn,
} from '@/utils/common/tableColumn'
import {
  getUserTagColumn,
  // getExtTagColumn,
} from '@/utils/common/detailColumn'
import { HYPERVISORS_MAP } from '@/constants'
import i18n from '@/locales'

const RenderSizeTitle = {
  props: ['data'],
  data () {
    return {
      loading: false,
    }
  },
  methods: {
    async fetchSync () {
      this.loading = true
      try {
        const { data } = await this.bucketsM.performAction({
          id: this.data.id,
          action: 'sync',
          data: {
            stats_only: true,
          },
        })
        this.data.size_bytes = data.size_bytes
        this.data.object_cnt = data.object_cnt
      } catch (err) {
        throw err
      } finally {
        this.loading = false
      }
    },
  },
  created () {
    this.bucketsM = new this.$Manager('buckets')
    this.fetchSync()
  },
  render () {
    return (
      <div>{ this.$t('storage.text_172') } <a onClick={this.fetchSync}><a-icon type="sync" spin={this.loading} /></a></div>
    )
  },
}
export default {
  name: 'BucketDetail',
  mixins: [WindowsMixin],
  props: {
    onManager: {
      type: Function,
      required: true,
    },
    refresh: {
      type: Function,
      required: true,
    },
    data: {
      type: Object,
      required: true,
    },
    columns: {
      type: Array,
    },
  },
  data () {
    return {
      syncLoading: false,
      websiteData: {},
      baseInfo: [
        getUserTagColumn({ onManager: this.onManager, resource: 'bucket', columns: () => this.columns, tipName: this.$t('storage.text_18') }),
        // getExtTagColumn({ onManager: this.onManager, resource: 'bucket', columns: () => this.columns, tipName: this.$t('storage.text_18') }),
        getPublicScopeTableColumn({ vm: this, resource: 'buckets' }),
        getBrandTableColumn(),
        getCopyWithContentTableColumn({
          field: 'region',
          title: this.$t('storage.text_47'),
          hideField: true,
          slotCallback: row => {
            if (!row.cloudregion) return '-'
            return [
              <side-page-trigger permission='areas_get' name='CloudregionSidePage' id={row.cloudregion_id} vm={this}>{ row.cloudregion }</side-page-trigger>,
            ]
          },
        }),
        {
          field: 'location',
          title: this.$t('storage.location'),
          slots: {
            default: ({ row }) => {
              return LOCATION_MAP[row.location] || row.location || '-'
            },
          },
        },
        {
          field: 'storage_class',
          title: this.$t('storage.text_38'),
        },
      ],
    }
  },
  computed: {
    isSupportReferer () {
      if (this.data.provider === HYPERVISORS_MAP.qcloud.provider || this.data.provider === HYPERVISORS_MAP.aliyun.provider) {
        return true
      }
      return false
    },
    extraInfo () {
      const referer = {
        title: ({ row }, h) => {
          return h('div', {
            class: 'detail-title',
          }, [
            <span class='ml-2'>{i18n.t('storage.text_213')}</span>,
            <a-tooltip>
              { !this.isSupportReferer
                ? (this._isOwner
                  ? (HYPERVISORS_MAP[row.provider.toLowerCase()]
                    ? <template slot="title">{i18n.t('storage.text_235', [HYPERVISORS_MAP[row.provider.toLowerCase()].label])}</template>
                    : '')
                  : this.$t('storage.text_257'))
                : null }
              <a-button type="link" class="ml-2" disabled={ !this.isSupportReferer && this._isOwner } onClick={() => this.handleSetReferer(row)}>{ i18n.t('common.setting') }</a-button>
            </a-tooltip>,
          ])
        },
        items: [],
        hidden: () => this.$isScopedPolicyMenuHidden('oss_hidden_columns.referer'),
      }
      if (this.data.referer) {
        const others = [
          {
            field: 'referer.enabled',
            title: this.$t('storage.text_214'),
            formatter: ({ row }) => {
              return row.referer.enabled ? this.$t('storage.text_215') : this.$t('storage.text_216')
            },
          },
        ]
        referer.items = referer.items.concat(others)
        if (this.data.referer.enabled) {
          const refers = [
            {
              field: 'referer.allow_empty_refer',
              title: this.$t('storage.text_208'),
              formatter: ({ row }) => {
                if (!row.referer.enabled) {
                  return '-'
                }
                return row.referer.allow_empty_refer ? this.$t('storage.text_217') : this.$t('storage.text_218')
              },
            },
            {
              field: 'referer.referer_type',
              title: this.$t('storage.text_86'),
              slots: {
                default: ({ row }) => {
                  if (row.referer.enabled && row.referer.referer_type) {
                    if (row.referer.referer_type === 'White-List') {
                      return this.$t('storage.text_206')
                    } else if (row.referer.referer_type === 'Black-List') {
                      return this.$t('storage.black_list')
                    }
                    return row.referer.referer_type
                  }
                  return '-'
                },
              },
            },
            {
              field: 'referer.domain_list',
              title: this.$t('storage.text_219'),
              slots: {
                default: ({ row }) => {
                  return row.referer.domain_list ? row.referer.domain_list.map(item => {
                    return (
                      <list-body-cell-wrap hideField copy title={ item } message={ item }>
                        <span>{ item }</span>
                      </list-body-cell-wrap>
                    )
                  }) : '-'
                },
              },
            },
          ]
          referer.items = referer.items.concat(refers)
        }
      }
      const ret = [
        {
          title: this.$t('storage.text_139'),
          field: 'url',
          slots: {
            default: ({ row }, h) => {
              if (!this.data.access_urls) {
                return '-'
              }
              const columns = [
                {
                  field: 'url',
                  title: 'URL',
                  slots: {
                    default: ({ row }) => {
                      return [
                        <div>
                          <a href={row.url}>{row.url}</a>
                          <copy class="ml-1" message={row.url} />
                        </div>]
                    },
                  },
                },
                {
                  field: 'description',
                  title: this.$t('storage.text_140'),
                },
              ]
              return [
                <vxe-grid class="mb-2" data={ this.data.access_urls || [] } columns={ columns } />,
              ]
            },
          },
          hidden: () => this.$isScopedPolicyMenuHidden('oss_hidden_columns.url'),
        },
        {
          title: this.$t('storage.text_220'),
          field: 'cdn_domains',
          slots: {
            default: ({ row }, h) => {
              if (!this.data.cdn_domains) {
                return '-'
              }
              const columns = [
                {
                  field: 'domain',
                  title: this.$t('storage.text_221'),
                  slots: {
                    default: ({ row }) => {
                      return [
                        <div>
                          <a href={row.domain}>{row.domain}</a>
                          <copy class="ml-1" message={row.domain} />
                        </div>]
                    },
                  },
                },
                {
                  field: 'status',
                  title: this.$t('storage.text_41'),
                  formatter: ({ cellValue, row }) => {
                    const map = {
                      rejected: this.$t('storage.text_222'),
                      processing: this.$t('storage.text_223'),
                      online: this.$t('storage.text_224'),
                      offline: this.$t('storage.text_225'),
                    }
                    return map[cellValue] || '-'
                  },
                },
                {
                  field: 'area',
                  title: this.$t('storage.text_226'),
                  formatter: ({ cellValue, row }) => {
                    const map = {
                      mainland: this.$t('storage.text_227'),
                      overseas: this.$t('storage.text_228'),
                      global: this.$t('storage.text_229'),
                    }
                    return map[cellValue] || '-'
                  },
                },
              ]
              return [
                <vxe-grid class="mb-2" data={ this.data.cdn_domains || [] } columns={ columns } />,
              ]
            },
          },
          hidden: () => this.$isScopedPolicyMenuHidden('oss_hidden_columns.cdn_domains'),
        },
        {
          title: this.$t('storage.text_230'),
          items: [
            {
              field: 'website_url',
              title: this.$t('storage.text_231'),
              slots: {
                default: ({ row }, h) => {
                  return [
                    <list-body-cell-wrap class="float-left" copy row={ row } field='website_url' title={ row.website_url } />,
                    <a-tooltip>
                      { row.provider !== HYPERVISORS_MAP.qcloud.provider
                        ? (this._isOwner
                          ? (HYPERVISORS_MAP[row.provider.toLowerCase()]
                            ? <template slot="title">{i18n.t('storage.text_236', [HYPERVISORS_MAP[row.provider.toLowerCase()].label])}</template>
                            : '')
                          : this.$t('storage.text_257'))
                        : null }
                      <a-button type="link" class="float-left ml-2" style="display: grid;" disabled={ row.provider !== HYPERVISORS_MAP.qcloud.provider && this._isOwner } onClick={() => this.handleSetWebsite(row)}>{ this.$t('common.setting') }</a-button>
                    </a-tooltip>,
                  ]
                },
              },
            },
          ],
          hidden: () => this.$isScopedPolicyMenuHidden('oss_hidden_columns.website_url'),
        },
        {
          title: <RenderSizeTitle data={this.data} />,
          items: [
            {
              field: 'size_bytes',
              title: this.$t('storage.text_141'),
              formatter: ({ row }) => {
                return sizestrWithUnit(row.size_bytes, 'B', 1024)
              },
            },
            {
              field: 'object_cnt',
              title: this.$t('storage.text_142'),
              formatter: ({ row }) => {
                return this.$t('storage.text_143', [row.object_cnt || 0])
              },
            },
          ],
          hidden: () => this.$isScopedPolicyMenuHidden('oss_hidden_columns.size'),
        },
        {
          title: this.$t('storage.text_144'),
          items: [
            {
              field: 'size_bytes_limit',
              title: this.$t('storage.text_59'),
              formatter: ({ row }) => {
                if (row.size_bytes_limit > 0) {
                  return sizestrWithUnit(row.size_bytes_limit, 'B', 1024)
                } else {
                  return this.$t('storage.text_145')
                }
              },
            },
            {
              field: 'object_cnt_limit',
              title: this.$t('storage.text_135'),
              formatter: ({ row }) => {
                if (row.object_cnt_limit > 0) {
                  return this.$t('storage.text_146', [row.object_cnt_limit])
                } else {
                  return this.$t('storage.text_145')
                }
              },
            },
          ],
          hidden: () => this.$isScopedPolicyMenuHidden('oss_hidden_columns.size_limit'),
        },
        {
          title: this.$t('storage.text_147'),
          items: [
            {
              field: 'acl',
              title: this.$t('storage.text_93'),
              slots: {
                default: ({ row }, h) => {
                  return [
                    <span>{ ACL_TYPE[row.acl] || row.acl }</span>,
                    <a onClick={() => this.handleSetAcl(row)} class='ml-2'>{ this.$t('common.setting') }</a>,
                  ]
                },
              },
            },
          ],
          hidden: () => this.$isScopedPolicyMenuHidden('oss_hidden_columns.acl'),
        },
        referer,
      ]
      return ret
    },
    _isOwner () {
      if (this.$store.getters.scope === 'project' && this.data.tenant_id !== this.$store.getters.auth.tenant) return false
      return this.$isOwner(this.data).validate
    },
  },
  created () {
    this.bucketsM = new this.$Manager('buckets')
    // 目前进腾讯云支持
    if (this.data.provider === HYPERVISORS_MAP.qcloud.provider) {
      this.fetchWebsite()
      this.fetchCdnDomain()
    }
    if (this.isSupportReferer) {
      this.fetchReferer()
    }
  },
  methods: {
    async fetchWebsite () {
      this.loading = true
      try {
        const { data } = await this.bucketsM.getSpecific({
          id: this.data.id,
          spec: 'website',
        })
        this.$set(this.data, 'website_url', data.url)
        this.websiteData = data
      } catch (err) {
        throw err
      } finally {
        this.loading = false
      }
    },
    async fetchReferer () {
      this.loading = true
      try {
        const { data } = await this.bucketsM.getSpecific({
          id: this.data.id,
          spec: 'referer',
        })
        this.$set(this.data, 'referer', data)
      } catch (err) {
        throw err
      } finally {
        this.loading = false
      }
    },
    async fetchCdnDomain () {
      this.loading = true
      try {
        const { data: { data } } = await this.bucketsM.getSpecific({
          id: this.data.id,
          spec: 'cdn-domain',
        })
        this.$set(this.data, 'cdn_domains', data)
      } catch (err) {
        throw err
      } finally {
        this.loading = false
      }
    },
    handleSetAcl (row) {
      this.createDialog('ObjectsUpdateAclDialog', {
        title: this.$t('storage.text_138'),
        data: [row],
        bucket: row,
        resName: row.name,
        columns: this.columns,
        list: this.list,
        refresh: this.refresh,
      })
    },
    handleSetWebsite (row) {
      this.$router.push({
        path: '/bucket/setstaticwebsit',
        query: {
          id: row.id,
          ...this.websiteData,
        },
      })
    },
    handleSetReferer (row) {
      this.createDialog('SetAntiLeechDialog', {
        name: this.$t('storage.text_18'),
        data: [row],
        columns: this.columns,
        onManager: this.onManager,
        refresh: this.refresh,
        success: () => {
          this.fetchReferer()
        },
      })
    },
  },
}
</script>
