<template>
  <detail
    :onManager="onManager"
    :data="data"
    :base-info="baseInfo"
    :extra-info="extraInfo"
    :hidden-keys="detailHiddenKeys"
    status-module="llmSku"
    resource="llm_skus" />
</template>

<script>
import { parseLlmRoute } from '@Ai/utils/llmRouteContext'
import { fetchHostNameMap } from '@Ai/utils/hostNames'
import WindowsMixin from '@/mixins/windows'
import LlmSkuImportStatus from '../components/LlmSkuImportStatus.vue'
import {
  getDeviceModelTableColumn,
  getVramClaimTableColumn,
  getAppNameTableColumn,
  getImageTableColumn,
  getBandwidthTableColumn,
  getCpuTableColumn,
  getMemoryTableColumn,
  getDiskTableColumn,
  getLlmTypeTableColumn,
  getLlmModelNameTableColumn,
  getSourceTableColumn,
} from '../utils/columns'
import { getLlmSpecSections, fetchLlmSpecCredentialNames, fetchLlmSpecDifyImages } from '../utils/llmSpecDetail'

export default {
  name: 'LlmSkuDetail',
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
    const { isDesktopType } = parseLlmRoute(this.$route.path)
    return {
      credentialNamesMap: {},
      difyImageNamesMap: {},
      hostNamesMap: {},
      baseInfo: [
        {
          field: 'status',
          title: this.$t('common.status'),
          slots: {
            default: ({ row }) => {
              return [this.$createElement(LlmSkuImportStatus, { props: { row } })]
            },
          },
        },
        getDeviceModelTableColumn(),
        getVramClaimTableColumn(),
        getImageTableColumn({ vm: this }),
        ...(isDesktopType ? [getAppNameTableColumn()] : []),
        getBandwidthTableColumn(),
        getLlmTypeTableColumn(),
        getLlmModelNameTableColumn({ vm: this }),
        getSourceTableColumn(),
        {
          field: 'backend_parameters',
          title: this.$t('aice.backend_parameters'),
          slots: {
            default: ({ row }) => {
              const type = (row.llm_type || '').toLowerCase()
              if (type !== 'vllm' && type !== 'sglang') return '-'
              const items = row.backend_parameters
              if (!Array.isArray(items) || items.length === 0) return '-'
              return (
                <div>
                  {items.map((item, idx) => (
                    <a-tag key={idx} style={{ marginBottom: '4px' }}>{item}</a-tag>
                  ))}
                </div>
              )
            },
          },
        },
        {
          field: 'prefer_hosts',
          title: this.$t('aice.local_path_import.prefer_hosts'),
          slots: {
            default: ({ row }) => {
              const hosts = row.prefer_hosts
              if (!Array.isArray(hosts) || hosts.length === 0) return '-'
              return (
                <div>
                  {hosts.map((id) => (
                    <div key={id}>
                      <side-page-trigger permission="hosts_get" name="HostSidePage" id={id} vm={this}>
                        {this.hostNamesMap[id] || id}
                      </side-page-trigger>
                    </div>
                  ))}
                </div>
              )
            },
          },
        },
        getCpuTableColumn(),
        getMemoryTableColumn(),
        getDiskTableColumn(),
        {
          field: 'port_mappings',
          title: this.$t('aice.container_port_mapping'),
          slots: {
            default: ({ row }) => {
              const access_infos = row.port_mappings
              if (access_infos?.length) {
                const colors = ['pink', 'red', 'orange', 'green', 'cyan', 'blue', 'purple']
                return (
                  <div>
                    {access_infos.map((item, idx) => {
                      const color = colors[idx % 7]
                      return (
                        <a-tag key={idx} color={color} style={{ marginBottom: '4px' }}>
                          {item.protocol.toUpperCase()}: {this.$t('aice.container_port')} {item.container_port}
                        </a-tag>
                      )
                    })}
                  </div>
                )
              }
              return '-'
            },
          },
        },
        {
          field: 'host_paths',
          title: this.$t('aice.host_paths'),
          slots: {
            default: ({ row }) => {
              const list = row.host_paths
              if (!Array.isArray(list) || list.length === 0) return '-'
              return this.renderHostPaths(list)
            },
          },
        },
      ],
    }
  },
  computed: {
    detailHiddenKeys () {
      return ['status']
    },
    extraInfo () {
      return getLlmSpecSections(this)
    },
  },
  watch: {
    'data.prefer_hosts': {
      handler () {
        this.fetchPreferHostNames()
      },
      deep: true,
    },
    'data.llm_spec': {
      handler () {
        fetchLlmSpecCredentialNames(this)
        fetchLlmSpecDifyImages(this)
      },
      deep: true,
    },
  },
  created () {
    fetchLlmSpecCredentialNames(this)
    fetchLlmSpecDifyImages(this)
    this.fetchPreferHostNames()
  },
  methods: {
    async fetchPreferHostNames () {
      const hosts = this.data?.prefer_hosts
      if (!Array.isArray(hosts) || hosts.length === 0) {
        this.hostNamesMap = {}
        return
      }
      const map = await fetchHostNameMap(hosts, { scope: this.$store.getters.scope })
      this.hostNamesMap = map
    },
    renderHostPathKvRow (label, value) {
      return (
        <div class="host-path-kv-row">
          <div class="host-path-kv-label">{label}</div>
          <div class="host-path-kv-value">{value}</div>
        </div>
      )
    },
    renderHostPathPathValue (path) {
      const text = path ?? '-'
      if (text === '-') return text
      return <code class="host-path-path-value">{text}</code>
    },
    renderPropagationTag (propagation) {
      if (!propagation) return '-'
      const tipKey = `aice.host_paths.propagation.${propagation}`
      const tip = this.$te(tipKey) ? this.$t(tipKey) : ''
      const tag = <a-tag>{propagation}</a-tag>
      if (!tip) return tag
      return (
        <a-tooltip title={tip}>
          {tag}
        </a-tooltip>
      )
    },
    renderContainerMount (containerKey, container) {
      const c = container || {}
      const hasFsUser = c.fs_user !== undefined && c.fs_user !== null && c.fs_user !== ''
      const hasFsGroup = c.fs_group !== undefined && c.fs_group !== null && c.fs_group !== ''
      return (
        <div key={containerKey} class="host-path-container-block">
          <div class="host-path-container-title">
            <span>{this.$t('aice.host_paths.container_index')}</span>
            <a-tag color="blue" class="ml-2">{containerKey}</a-tag>
          </div>
          {this.renderHostPathKvRow(
            this.$t('aice.host_paths.mount_path'),
            this.renderHostPathPathValue(c.mount_path),
          )}
          {this.renderHostPathKvRow(
            this.$t('aice.host_paths.read_only'),
            <a-tag color={c.read_only ? 'orange' : 'green'}>
              {c.read_only ? this.$t('common.true') : this.$t('common.false')}
            </a-tag>,
          )}
          {this.renderHostPathKvRow(
            this.$t('aice.host_paths.propagation'),
            this.renderPropagationTag(c.propagation),
          )}
          {hasFsUser ? this.renderHostPathKvRow(
            this.$t('aice.host_paths.fs_user'),
            c.fs_user,
          ) : null}
          {hasFsGroup ? this.renderHostPathKvRow(
            this.$t('aice.host_paths.fs_group'),
            c.fs_group,
          ) : null}
        </div>
      )
    },
    renderHostPathItem (hp, index) {
      const acc = hp && hp.auto_create_config ? hp.auto_create_config : {}
      const containers = hp && hp.containers && typeof hp.containers === 'object' ? hp.containers : null
      const containerEntries = containers ? Object.keys(containers).sort() : []
      return (
        <a-card
          key={index}
          size="small"
          class="host-path-card"
          title={this.$t('aice.host_paths.item_title', [index + 1])}>
          {this.renderHostPathKvRow(
            this.$t('aice.host_paths.type'),
            hp?.type ? <a-tag>{hp.type}</a-tag> : '-',
          )}
          {this.renderHostPathKvRow(
            this.$t('aice.host_paths.path'),
            this.renderHostPathPathValue(hp?.path),
          )}
          {this.renderHostPathKvRow(
            this.$t('aice.host_paths.auto_create'),
            <a-tag color={hp?.auto_create ? 'green' : undefined}>
              {hp?.auto_create ? this.$t('common.true') : this.$t('common.false')}
            </a-tag>,
          )}
          {hp?.auto_create ? (
            <div class="host-path-auto-create-config">
              <div class="host-path-section-title">{this.$t('aice.host_paths.auto_create_config.title')}</div>
              {this.renderHostPathKvRow(this.$t('aice.host_paths.auto_create_config.uid'), acc.uid ?? '-')}
              {this.renderHostPathKvRow(this.$t('aice.host_paths.auto_create_config.gid'), acc.gid ?? '-')}
              {this.renderHostPathKvRow(this.$t('aice.host_paths.permissions'), acc.permissions ?? '-')}
            </div>
          ) : null}
          <div class="host-path-section-title">{this.$t('aice.host_paths.containers')}</div>
          {containerEntries.length
            ? containerEntries.map(k => this.renderContainerMount(k, containers[k]))
            : <div class="text-weak">-</div>}
        </a-card>
      )
    },
    renderHostPaths (list) {
      return (
        <div class="host-path-list">
          {list.map((hp, i) => this.renderHostPathItem(hp, i))}
        </div>
      )
    },
  },
}
</script>

<style lang="less" scoped>
.host-path-list {
  max-width: 100%;
}

.host-path-card {
  margin-bottom: 12px;
  background: #fafafa;
  border-color: #f0f0f0;

  &:last-child {
    margin-bottom: 0;
  }

  /deep/ .ant-card-head {
    min-height: 36px;
    padding: 0 12px;
  }

  /deep/ .ant-card-head-title {
    padding: 8px 0;
    font-size: 13px;
    font-weight: 600;
  }

  /deep/ .ant-card-body {
    padding: 12px;
  }
}

.host-path-kv-row {
  display: flex;
  align-items: flex-start;
  margin-bottom: 8px;
  line-height: 1.5;

  &:last-child {
    margin-bottom: 0;
  }
}

.host-path-kv-label {
  flex-shrink: 0;
  min-width: 88px;
  color: rgba(0, 0, 0, 0.45);
  padding-right: 12px;
}

.host-path-kv-value {
  flex: 1;
  min-width: 0;
  word-break: break-word;
}

.host-path-path-value {
  display: block;
  padding: 4px 8px;
  background: #f5f5f5;
  border-radius: 2px;
  font-size: 12px;
  color: rgba(0, 0, 0, 0.85);
  word-break: break-all;
  white-space: pre-wrap;
}

.host-path-section-title {
  font-weight: 500;
  margin: 12px 0 8px;
  color: rgba(0, 0, 0, 0.85);

  &:first-child {
    margin-top: 0;
  }
}

.host-path-auto-create-config {
  margin-top: 4px;
  padding-top: 8px;
  border-top: 1px dashed #f0f0f0;
}

.host-path-container-block {
  border: 1px solid #f0f0f0;
  border-radius: 4px;
  padding: 10px 12px;
  margin-bottom: 8px;
  background: #fff;

  &:last-child {
    margin-bottom: 0;
  }
}

.host-path-container-title {
  font-weight: 500;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
}
</style>
