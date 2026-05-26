<!--
  推理模板：从模型目录 / Hugging Face 导入 SKU 的共用表单壳（内部仍为 LlmSkuCreateForm）。
-->
<template>
  <llm-sku-create-form
    ref="inner"
    mode="create"
    hide-footer
    :catalog-set="catalogSet"
    :catalog-spec="catalogSpec"
    catalog-submit-type="import"
    v-bind="$attrs"
    v-on="$listeners" />
</template>

<script>
import LlmSkuCreateForm from '@Ai/views/llm-sku/create/Form.vue'

export default {
  name: 'CatalogImportSkuForm',
  components: {
    LlmSkuCreateForm,
  },
  inheritAttrs: false,
  props: {
    catalogSet: {
      type: Object,
      default: null,
    },
    catalogSpec: {
      type: Object,
      default: null,
    },
  },
  methods: {
    async handleCatalogImport () {
      return this.$refs.inner.handleCatalogImport()
    },
    applyCatalogSpec () {
      if (this.$refs.inner && this.$refs.inner.applyCatalogSpec) {
        this.$refs.inner.applyCatalogSpec()
      }
    },
  },
}
</script>
