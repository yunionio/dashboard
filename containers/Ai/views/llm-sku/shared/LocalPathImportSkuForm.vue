<!--
  推理模板：从本地路径导入 SKU 的共用表单壳（内部仍为 LlmSkuCreateForm）。
-->
<template>
  <llm-sku-create-form
    ref="inner"
    mode="create"
    hide-footer
    import-mode="local_path"
    v-bind="$attrs"
    v-on="$listeners" />
</template>

<script>
import LlmSkuCreateForm from '@Ai/views/llm-sku/create/Form.vue'

export default {
  name: 'LocalPathImportSkuForm',
  components: {
    LlmSkuCreateForm,
  },
  inheritAttrs: false,
  methods: {
    async handleLocalPathImport () {
      return this.$refs.inner.handleLocalPathImport()
    },
  },
}
</script>
