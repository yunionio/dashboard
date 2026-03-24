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
