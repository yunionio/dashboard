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
import { getLlmSpecSections, fetchLlmSpecCredentialNames } from '../utils/llmSpecDetail'

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
      baseInfo: [
        getDeviceModelTableColumn(),
        getImageTableColumn({ vm: this }),
        getBandwidthTableColumn(),
        getLlmTypeTableColumn(),
        getLlmModelNameTableColumn({ vm: this }),
        getCpuTableColumn(),
        getMemoryTableColumn(),
        getDiskTableColumn(),
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
      },
      deep: true,
    },
  },
  created () {
    fetchLlmSpecCredentialNames(this)
  },
}
</script>
