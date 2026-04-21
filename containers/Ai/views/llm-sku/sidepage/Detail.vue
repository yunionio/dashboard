<template>
  <detail
    :onManager="onManager"
    :data="data"
    :base-info="baseInfo"
    :extra-info="extraInfo"
    status-module="sku"
    resource="llm_skus" />
</template>

<script>
import WindowsMixin from '@/mixins/windows'
import {
  getDeviceModelTableColumn,
  getImageTableColumn,
  getBandwidthTableColumn,
  getCpuTableColumn,
  getMemoryTableColumn,
  getDiskTableColumn,
  getLlmTypeTableColumn,
  getLlmModelNameTableColumn,
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
    return {
      credentialNamesMap: {},
      difyImageNamesMap: {},
      baseInfo: [
        getDeviceModelTableColumn(),
        getImageTableColumn({ vm: this }),
        getBandwidthTableColumn(),
        getLlmTypeTableColumn(),
        getLlmModelNameTableColumn({ vm: this }),
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
                return access_infos.map((item, idx) => {
                  const color = colors[idx % 7]
                  return <p>
                    <a-tag color={color} style={{ width: '250px' }}>
                      {item.protocol.toUpperCase()}: {this.$t('aice.container_port')} {item.container_port}
                    </a-tag>
                  </p>
                })
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
              return (
                <div>
                  {list.map((hp, i) => {
                    const acc = hp && hp.auto_create_config ? hp.auto_create_config : {}
                    const containers = hp && hp.containers && typeof hp.containers === 'object' ? hp.containers : null
                    const containerEntries = containers ? Object.keys(containers).sort() : []
                    return (
                      <div
                        key={i}
                        style={i > 0 ? { borderTop: '1px solid #f0f0f0', paddingTop: 20, marginTop: 20 } : {}}>
                        <div style={{ fontWeight: 600, marginBottom: 6 }}>{this.$t('aice.host_paths.item_title', [i + 1])}</div>
                        <div style={{ marginBottom: 4 }}>
                          <span class="text-weak">{this.$t('aice.host_paths.type')}:</span> {hp?.type ?? '-'}
                          <span style={{ margin: '0 12px' }}>|</span>
                          <span class="text-weak">{this.$t('aice.host_paths.path')}:</span> {hp?.path ?? '-'}
                        </div>
                        <div style={{ marginBottom: 4 }}>
                          <span class="text-weak">{this.$t('aice.host_paths.auto_create')}:</span> {hp?.auto_create ? this.$t('common.true') : this.$t('common.false')}
                        </div>
                        {hp?.auto_create ? (
                          <div style={{ marginBottom: 6 }}>
                            <span class="text-weak">{this.$t('aice.host_paths.auto_create_config.title')}:</span>{' '}
                            uid={acc.uid ?? '-'}, gid={acc.gid ?? '-'}, permissions={acc.permissions ?? '-'}
                          </div>
                        ) : null}
                        <div style={{ fontWeight: 500, margin: '6px 0 4px' }}>{this.$t('aice.host_paths.containers')}</div>
                        {containerEntries.length ? containerEntries.map((k) => {
                          const c = containers[k] || {}
                          return (
                            <div key={k} style={{ marginBottom: 6 }}>
                              <a-tag color="blue">{k}</a-tag>{' '}
                              <span class="text-weak">{this.$t('aice.host_paths.mount_path')}:</span> {c.mount_path ?? '-'}；{' '}
                              <span class="text-weak">{this.$t('aice.host_paths.read_only')}:</span> {c.read_only ? this.$t('common.true') : this.$t('common.false')}；{' '}
                              <span class="text-weak">{this.$t('aice.host_paths.propagation')}:</span> {c.propagation ?? '-'}
                              {(c.fs_user !== undefined && c.fs_user !== null && c.fs_user !== '') || (c.fs_group !== undefined && c.fs_group !== null && c.fs_group !== '') ? (
                                <span>
                                  {' '}；<span class="text-weak">fs_user:</span> {c.fs_user ?? '-'}；{' '}
                                  <span class="text-weak">fs_group:</span> {c.fs_group ?? '-'}
                                </span>
                              ) : null}
                            </div>
                          )
                        }) : <div class="text-weak">-</div>}
                      </div>
                    )
                  })}
                </div>
              )
            },
          },
        },
      ],
    }
  },
  computed: {
    extraInfo () {
      return getLlmSpecSections(this)
    },
  },
  watch: {
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
  },
}
</script>
