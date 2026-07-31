<template>
  <div>
    <filters ref="FILTERS" :rds-item="rdsItem" @change="onFiltersChange" />
    <size-filters ref="SIZE_FILTER" :rds-item="rdsItem" @change="onSizeFiltersChange">
      <div v-if="$slots.zone" slot="zone">
        <slot name="zone" />
      </div>
    </size-filters>
    <list ref="LIST" @change="handleSkuChange" />
    <!-- aws zone -->
    <a-form-item :label="$t('db.text_133')" v-bind="formItemLayout" v-if="form.fd.provider === 'Aws'">
      <a-radio-group v-decorator="['multi_az',{initialValue: false}]">
        <a-radio-button key="multi_az_no" :value="false">{{$t('db.zone_single')}}</a-radio-button>
        <a-radio-button key="multi_az_yes" :value="true" :disabled="!zoneMultiEnabled">{{$t('db.zone_multi')}}</a-radio-button>
      </a-radio-group>
    </a-form-item>
    <disk-input :selectedSku="selectedSku" :min="rdsItem ? rdsItem.disk_size_gb : -1" />
  </div>
</template>
<script>
import Filters from './components/Filters'
import SizeFilters from './components/SizeFilters'
import List from './components/List'
import DiskInput from './components/DiskInput'
export default {
  name: 'rdsSku',
  components: {
    Filters,
    SizeFilters,
    List,
    DiskInput,
  },
  props: {
    disableds: {
      type: Array,
      default: () => {
        return []
      },
    },
    rdsItem: {
      type: Object,
    },
  },
  inject: ['form', 'formItemLayout'],
  provide () {
    return {
      disableds: this.disabledData,
    }
  },
  data () {
    const _F = () => {}
    return {
      selectedSku: {},
      fetchFilters: _F,
      fetchSpecs: _F,
      fetchSkus: _F,
    }
  },
  computed: {
    disabledData () {
      const _ = {}
      this.disableds.forEach(item => {
        _[item] = true
      })
      return _
    },
    // aws用
    zoneMultiEnabled () {
      if (this.form.fd.provider !== 'Aws') {
        return true
      }
      return this.selectedSku ? this.selectedSku.multi_az : false
    },
  },
  mounted () {
    const { fetchFilters, getVersion } = this.$refs.FILTERS
    const { fetchSpecs } = this.$refs.SIZE_FILTER
    const { fetchSkus } = this.$refs.LIST
    this.fetchCapability = fetchFilters
    this.fetchSpecs = fetchSpecs
    this.fetchSkus = fetchSkus
    this.linkageValue = getVersion
  },
  methods: {
    onFiltersChange (payload) {
      // 级联字段写稳后再拉；带 payload 避免表单读值时机问题
      this.$nextTick(() => this.ensureFetchSpecs(0, payload))
    },
    onSizeFiltersChange () {
      this.$nextTick(() => {
        const fetchSkus = this.$refs.LIST && this.$refs.LIST.fetchSkus
        if (typeof fetchSkus === 'function') fetchSkus.call(this.$refs.LIST)
      })
    },
    async ensureFetchSpecs (retry = 0, payload) {
      const sizeRef = this.$refs.SIZE_FILTER
      const fetchSpecs = sizeRef && sizeRef.fetchSpecs
      if (typeof fetchSpecs !== 'function') {
        if (retry < 8) {
          await new Promise(resolve => setTimeout(resolve, 80))
          return this.ensureFetchSpecs(retry + 1, payload)
        }
        return
      }
      const ok = await fetchSpecs.call(sizeRef, payload)
      if (!ok && retry < 8) {
        await new Promise(resolve => setTimeout(resolve, 80))
        return this.ensureFetchSpecs(retry + 1, payload)
      }
    },
    handleSkuChange (sku) {
      this.selectedSku = sku
      this.initMultiAz(sku)
    },
    initMultiAz (sku) {
      if (this.form.fd.provider !== 'Aws') {
        return
      }
      if (sku && !sku.multi_az) {
        this.form.fc.setFieldsValue({
          multi_az: false,
        })
      }
    },
  },
}
</script>
