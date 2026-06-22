<template>
  <base-select
    class="llm-sku-select"
    resource="llm_skus"
    dropdown-item-word-wrap
    :value="value"
    v-bind="attrsWithoutValue"
    v-on="otherListeners"
    :params="params"
    :select-props="mergedSelectProps"
    @input="onInput"
    @change="onChange">
    <template #optionLabelTemplate="{ item }">
      <div class="llm-sku-option">
        <div class="oc-selected-display-none">
          <div class="text-truncate" :title="item.name">{{ item.name }}</div>
          <div
            class="text-color-secondary mt-1 text-truncate"
            style="font-size: 12px"
            :title="formatLlmSkuConfig(item)">
            {{ formatLlmSkuConfig(item) }}
          </div>
        </div>
        <div
          class="oc-dropdown-display-none llm-sku-option__selected text-truncate"
          :title="formatLlmSkuSelectedLabel(item)">
          <span>{{ item.name }}</span>
          <span class="text-color-secondary"> ({{ formatLlmSkuConfig(item) }})</span>
        </div>
      </div>
    </template>
  </base-select>
</template>

<script>
import { sizestr } from '@/utils/utils'
import { getSkuModelDisplayText } from '@Ai/views/llm-sku/utils/modelDisplay'

export default {
  name: 'LlmSkuSelect',
  inheritAttrs: false,
  model: {
    prop: 'value',
    event: 'change',
  },
  props: {
    value: {
      default: undefined,
    },
    params: {
      type: Object,
      default: () => ({}),
    },
    selectProps: {
      type: Object,
      default: () => ({}),
    },
  },
  computed: {
    attrsWithoutValue () {
      const attrs = { ...this.$attrs }
      delete attrs.value
      return attrs
    },
    otherListeners () {
      const { input, change, ...rest } = this.$listeners
      return rest
    },
    mergedSelectProps () {
      const placeholder = this.selectProps.placeholder
      return {
        dropdownStyle: { minWidth: '520px' },
        optionLabelProp: 'label',
        ...this.selectProps,
        ...(placeholder != null ? { placeholder } : {}),
      }
    },
  },
  methods: {
    onInput (val) {
      this.$emit('input', val)
    },
    onChange (val, isNative) {
      this.$emit('input', val)
      this.$emit('change', val, isNative)
    },
    formatLlmSkuModel (item) {
      return getSkuModelDisplayText(item)
    },
    formatLlmSkuSelectedLabel (item) {
      return `${item.name} (${this.formatLlmSkuConfig(item)})`
    },
    formatLlmSkuMemory (memory) {
      if (memory == null) return '-'
      return sizestr(memory, 'M', 1024)
    },
    formatLlmSkuDisk (item) {
      const volumes = item.volumes || []
      if (!volumes.length) return '-'
      let size = 0
      volumes.forEach(v => { size += v.size_mb || 0 })
      return sizestr(size, 'M', 1024)
    },
    formatLlmSkuBandwidth (bandwidth) {
      if (bandwidth == null) return '-'
      if (bandwidth === 0) return `0(${this.$t('common.not_limited')})`
      return `${bandwidth}M`
    },
    formatLlmSkuConfig (item) {
      const parts = []
      const model = this.formatLlmSkuModel(item)
      if (model) {
        parts.push(`${this.$t('aice.model')}：${model}`)
      }
      if (item.llm_type) {
        parts.push(`${this.$t('aice.llm_type')}：${item.llm_type}`)
      }
      if (item.app_name) {
        parts.push(`${this.$t('aice.llm_image.app_name')}：${item.app_name}`)
      }
      parts.push(
        `CPU ${item.cpu || '-'}`,
        `${this.$t('aice.memory')} ${this.formatLlmSkuMemory(item.memory)}`,
        `${this.$t('aice.disk')} ${this.formatLlmSkuDisk(item)}`,
      )
      if (item.bandwidth != null) {
        parts.push(`${this.$t('aice.bandwidth')} ${this.formatLlmSkuBandwidth(item.bandwidth)}`)
      }
      if (item.image) {
        parts.push(`${this.$t('aice.image')}：${item.image}`)
      }
      return parts.join(' · ')
    },
  },
}
</script>

<style lang="less" scoped>
.llm-sku-select {
  ::v-deep .ant-select-selection__rendered {
    overflow: hidden;
  }
  ::v-deep .ant-select-selection-selected-value {
    float: none;
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}
</style>
