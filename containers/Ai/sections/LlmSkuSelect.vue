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
        <div class="oc-selected-display-none" :title="formatLlmSkuTitle(item)">
          <div class="llm-sku-option__title">
            <span class="llm-sku-option__name text-truncate">{{ item.name }}</span>
            <span v-if="hasLlmSkuTags(item)" class="llm-sku-option__tags">
              <a-tag
                v-if="formatLlmSkuModel(item)"
                class="llm-sku-option__tag llm-sku-option__tag--model"
                :title="formatLlmSkuModel(item)">
                {{ formatLlmSkuModel(item) }}
              </a-tag>
              <a-tag v-if="item.llm_type" class="llm-sku-option__tag">{{ item.llm_type }}</a-tag>
              <a-tag v-if="item.source" class="llm-sku-option__tag">{{ formatLlmSkuSource(item.source) }}</a-tag>
              <a-tag v-if="item.app_name" class="llm-sku-option__tag" :title="item.app_name">{{ item.app_name }}</a-tag>
            </span>
          </div>
          <div
            v-if="formatLlmSkuSpecs(item)"
            class="llm-sku-option__meta text-color-secondary text-truncate">
            {{ formatLlmSkuSpecs(item) }}
          </div>
        </div>
        <div
          class="oc-dropdown-display-none llm-sku-option__selected text-truncate"
          :title="formatLlmSkuTitle(item)">
          <span>{{ item.name }}</span>
          <span v-if="formatLlmSkuSelectedMeta(item)" class="text-color-secondary">
            · {{ formatLlmSkuSelectedMeta(item) }}
          </span>
          <span v-if="formatLlmSkuSpecs(item)" class="text-color-secondary">
            ({{ formatLlmSkuSpecs(item) }})
          </span>
        </div>
      </div>
    </template>
  </base-select>
</template>

<script>
import { sizestr } from '@/utils/utils'
import { formatDevicesDisplay } from '@Ai/utils/deviceFormUtils'
import { getSkuModelDisplayText } from '@Ai/views/llm-sku/utils/modelDisplay'
import { getLlmSkuSourceLabel } from '@Ai/views/llm-sku/utils/skuSourceDisplay'

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
    formatLlmSkuSource (source) {
      return getLlmSkuSourceLabel(source)
    },
    hasLlmSkuTags (item) {
      return !!(this.formatLlmSkuModel(item) || item.llm_type || item.source || item.app_name)
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
    formatLlmSkuSpecs (item) {
      const parts = []
      if (item.devices?.length) {
        parts.push(`${this.$t('aice.devices')}：${formatDevicesDisplay(item.devices, { fallbackMemoryMb: item.vram_claim_mb })}`)
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
    formatLlmSkuSelectedMeta (item) {
      const parts = []
      const model = this.formatLlmSkuModel(item)
      if (model) parts.push(model)
      if (item.llm_type) parts.push(item.llm_type)
      if (item.source) parts.push(this.formatLlmSkuSource(item.source))
      if (item.app_name) parts.push(item.app_name)
      return parts.join(' · ')
    },
    formatLlmSkuTitle (item) {
      const identityParts = []
      const model = this.formatLlmSkuModel(item)
      if (model) identityParts.push(`${this.$t('aice.model')}：${model}`)
      if (item.llm_type) identityParts.push(`${this.$t('aice.llm_type')}：${item.llm_type}`)
      if (item.source) {
        identityParts.push(`${this.$t('aice.llm_deployment.source')}：${this.formatLlmSkuSource(item.source)}`)
      }
      if (item.app_name) {
        identityParts.push(`${this.$t('aice.llm_image.app_name')}：${item.app_name}`)
      }
      const specs = this.formatLlmSkuSpecs(item)
      let label = item.name
      if (identityParts.length) label += ` · ${identityParts.join(' · ')}`
      if (specs) label += ` (${specs})`
      return label
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
.llm-sku-option__title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  min-width: 0;
  line-height: 22px;
}
.llm-sku-option__name {
  flex: 1;
  min-width: 0;
  font-weight: 500;
}
.llm-sku-option__tags {
  display: inline-flex;
  flex-shrink: 0;
  max-width: 58%;
  margin-left: auto;
  align-items: center;
  justify-content: flex-end;
  gap: 4px;
  overflow: hidden;
}
.llm-sku-option__tag {
  margin: 0;
  padding: 0 6px;
  font-size: 12px;
  line-height: 18px;
  height: 20px;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
}
.llm-sku-option__tag--model {
  max-width: 220px;
}
.llm-sku-option__meta {
  margin-top: 2px;
  font-size: 12px;
  line-height: 18px;
}
</style>
