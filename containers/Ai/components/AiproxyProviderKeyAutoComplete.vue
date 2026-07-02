<template>
  <a-auto-complete
    :value="value"
    :placeholder="placeholder"
    option-label-prop="value"
    @change="onChange"
    @search="onSearch">
    <template slot="dataSource">
      <a-select-option v-for="key in providerKeys" :key="key" :value="key">
        <aiproxy-provider-label :provider-key="key" :label="key" :icon-size="16" />
      </a-select-option>
    </template>
  </a-auto-complete>
</template>

<script>
import { filterAiproxyProviderKeys } from '@Ai/constants/aiproxyProviderKeys'
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
    }
  },
  methods: {
    onSearch (value) {
      this.providerKeys = filterAiproxyProviderKeys(value)
    },
    onChange (value) {
      this.$emit('input', value)
      this.$emit('change', value)
    },
  },
}
</script>

<style lang="less" scoped>
::v-deep .aiproxy-provider-label__text {
  white-space: normal;
}
</style>
