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
import { getLlmSpecSections, fetchLlmSpecCredentialNames } from '../../llm-sku/utils/llmSpecDetail'

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
      credentialNamesMap: {},
      skuLlmSpecOpenclaw: null,
      baseInfo: [
        getUserTagColumn({
          onManager: this.onManager,
          resource: 'llms',
          columns: () => this.columns,
          tipName: this.$t('aice.instance'),
        }),
      ],
      extraInfo: [
        {
          title: this.$t('aice.config_info'),
          items: [
            getLlmIpColumn(),
            getLlmSkuColumn({ vm: this }),
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
              title: this.$t('aice.llm_instantapp'),
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
      ],
      streamEndpoint: null,
      ports: [],
    }
  },
  watch: {
    'data.llm_spec': {
      handler () {
        this.fetchSkuOpenclawIfNeeded()
        fetchLlmSpecCredentialNames(this)
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
  },
  methods: {
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
      try {
        const res = await new this.$Manager('llms', 'v2').get({
          id: `${this.data.id}/url`,
        })
        const { access_url = '' } = res.data
        const firstBlock = {
          title: this.extraInfo[0].title,
          items: [
            ...this.extraInfo[0].items,
            {
              field: 'access_url',
              title: this.$t('aice.access_url'),
              slots: {
                default: ({ row }) => {
                  return [
                    <list-body-cell-wrap copy hideField={true} field='access_url' row={{ access_url }} message={access_url}>
                      {access_url}
                    </list-body-cell-wrap>,
                  ]
                },
              },
            },
          ],
        }
        this.extraInfo = [firstBlock, ...getLlmSpecSections(this)]
      } catch (error) {
        console.error(error)
      }
    },
  },
}
</script>
