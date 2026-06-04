<template>
  <base-select
    class="llm-image-select"
    resource="llm_images"
    dropdown-item-word-wrap
    :value="value"
    v-bind="attrsWithoutValue"
    v-on="otherListeners"
    :params="params"
    :select-props="mergedSelectProps"
    @input="onInput"
    @change="onChange">
    <template #optionLabelTemplate="{ item }">
      <div class="llm-image-option">
        <div class="oc-selected-display-none">
          <div class="text-truncate" :title="item.name">{{ item.name }}</div>
          <div
            class="text-color-secondary mt-1 text-truncate"
            style="font-size: 12px"
            :title="formatLlmImageConfig(item)">
            {{ formatLlmImageConfig(item) }}
          </div>
        </div>
        <div
          class="oc-dropdown-display-none llm-image-option__selected text-truncate"
          :title="`${item.name} (${formatLlmImageConfig(item)})`">
          <span>{{ item.name }}</span>
          <span class="text-color-secondary"> ({{ formatLlmImageConfig(item) }})</span>
        </div>
      </div>
    </template>
  </base-select>
</template>

<script>
export default {
  name: 'LlmImageSelect',
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
    formatLlmImageRef (item) {
      if (!item.image_name) return ''
      const label = item.image_label || 'latest'
      return `${item.image_name}:${label}`
    },
    formatLlmImageConfig (item) {
      const parts = []
      const ref = this.formatLlmImageRef(item)
      if (ref) {
        parts.push(`${this.$t('aice.llm_image.url')}：${ref}`)
      }
      if (item.llm_type) {
        const key = `aice.llm_type.${String(item.llm_type).replace(/-/g, '_')}`
        const typeLabel = this.$te(key) ? this.$t(key) : item.llm_type
        parts.push(`${this.$t('aice.llm_type')}：${typeLabel}`)
      }
      if (item.app_name) {
        parts.push(`${this.$t('aice.llm_image.app_name')}：${item.app_name}`)
      }
      const desc = item.description
      if (desc && desc !== '-') {
        parts.push(desc)
      }
      return parts.join(' · ') || item.name || '-'
    },
  },
}
</script>

<style lang="less" scoped>
.llm-image-select {
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
