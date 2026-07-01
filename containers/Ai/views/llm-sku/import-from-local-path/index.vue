<!--
  推理模板：从本地路径导入 SKU。
  路由：/llm-sku/import-from-local-path
-->
<template>
  <div>
    <page-header :title="headerTitle" />
    <page-body needMarginBottom>
      <a-divider orientation="left">{{ $t('aice.llm_catalog.import_config') }}</a-divider>
      <local-path-import-sku-form
        ref="importFormRef"
        @success="onImportSuccess"
        @cancel="onCancel" />
    </page-body>
    <page-footer>
      <template v-slot:right>
        <a-button type="primary" :loading="submitLoading" @click="handleImport">
          {{ $t('aice.import_model') }}
        </a-button>
        <a-button class="ml-2" @click="onCancel">{{ $t('common.cancel') }}</a-button>
      </template>
    </page-footer>
  </div>
</template>

<script>
import LocalPathImportSkuForm from '@Ai/views/llm-sku/shared/LocalPathImportSkuForm.vue'
import { parseLlmRoute } from '@Ai/utils/llmRouteContext'

export default {
  name: 'LlmSkuImportFromLocalPath',
  components: {
    LocalPathImportSkuForm,
  },
  data () {
    return {
      submitLoading: false,
    }
  },
  computed: {
    llmRouteCtx () {
      return parseLlmRoute(this.$route.path)
    },
    headerTitle () {
      return `${this.$t('aice.llm_deployment.deploy.from_local')} - ${this.$t('aice.llm_sku')}`
    },
  },
  methods: {
    async handleImport () {
      const form = this.$refs.importFormRef
      if (!form) return
      this.submitLoading = true
      try {
        await form.handleLocalPathImport()
      } finally {
        this.submitLoading = false
      }
    },
    onImportSuccess () {
      this.$router.push(this.llmRouteCtx.skuListPath)
    },
    onCancel () {
      this.$router.push(this.llmRouteCtx.skuListPath)
    },
  },
}
</script>
