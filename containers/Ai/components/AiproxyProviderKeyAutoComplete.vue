<template>
  <a-auto-complete
    :value="inputValue"
    :placeholder="placeholder"
    option-label-prop="label"
    @change="onChange"
    @search="onSearch"
    @select="onSelect"
    @blur="onBlur">
    <template slot="dataSource">
      <a-select-option
        v-for="key in providerKeys"
        :key="key"
        :value="key"
        :label="providerKeyLabel(key)">
        <aiproxy-provider-label :provider-key="key" :icon-size="16" />
      </a-select-option>
    </template>
  </a-auto-complete>
</template>

<script>
import {
  AIPROXY_PROVIDER_KEYS,
  filterAiproxyProviderKeys,
  getAiproxyProviderKeyDisplayName,
} from '@Ai/constants/aiproxyProviderKeys'
import AiproxyProviderLabel from '@Ai/components/AiproxyProviderLabel'

export default {
  name: 'AiproxyProviderKeyAutoComplete',
  components: { AiproxyProviderLabel },
  props: {
    value: {
      type: String,
      default: '',
    },
    placeholder: {
      type: String,
      default: '',
    },
  },
  data () {
    return {
      providerKeys: filterAiproxyProviderKeys(''),
      searchText: '',
      searchActive: false,
    }
  },
  computed: {
    inputValue () {
      if (this.searchActive) return this.searchText
      return getAiproxyProviderKeyDisplayName(this, this.value)
    },
  },
  watch: {
    value () {
      if (!this.searchActive) {
        this.searchText = ''
      }
    },
  },
  methods: {
    providerKeyLabel (key) {
      return getAiproxyProviderKeyDisplayName(this, key)
    },
    onSearch (value) {
      this.searchActive = true
      this.searchText = value
      this.providerKeys = filterAiproxyProviderKeys(value, this)
    },
    onSelect (value) {
      this.searchActive = false
      this.searchText = ''
      this.emitValue(value)
    },
    onChange (value) {
      this.searchText = value
      this.providerKeys = filterAiproxyProviderKeys(value, this)
      const resolved = this.resolveProviderKey(value)
      if (AIPROXY_PROVIDER_KEYS.includes(resolved)) {
        this.searchActive = false
        this.emitValue(resolved)
      } else {
        this.searchActive = true
      }
    },
    onBlur () {
      const resolved = this.resolveProviderKey(this.searchActive ? this.searchText : this.value)
      this.searchActive = false
      this.searchText = ''
      if (AIPROXY_PROVIDER_KEYS.includes(resolved)) {
        this.emitValue(resolved)
      }
    },
    resolveProviderKey (input) {
      const text = String(input || '').trim()
      if (!text) return ''
      const lower = text.toLowerCase()
      const exact = AIPROXY_PROVIDER_KEYS.find(key => key.toLowerCase() === lower)
      if (exact) return exact
      for (const key of AIPROXY_PROVIDER_KEYS) {
        if (this.providerKeyLabel(key).toLowerCase() === lower) {
          return key
        }
      }
      return text
    },
    emitValue (key) {
      const normalized = String(key || '').trim()
      this.$emit('input', normalized)
      this.$emit('change', normalized)
    },
  },
}
</script>

<style lang="less" scoped>
::v-deep .aiproxy-provider-label__text {
  white-space: normal;
}
</style>
