<template>
  <div>
    <page-header :title="headerTitle" />
    <page-body needMarginBottom>
      <llm-sku-create-form
        ref="createForm"
        mode="create"
        hide-footer
        @success="onFormSuccess"
        @cancel="onFormCancel" />
    </page-body>
    <page-footer>
      <template v-slot:right>
        <a-button type="primary" :loading="submitLoading" @click="handleConfirm">{{ $t('common.create') }}</a-button>
        <a-button class="ml-2" @click="handleCancel">{{ $t('common.cancel') }}</a-button>
      </template>
    </page-footer>
  </div>
</template>

<script>
import { parseLlmRoute } from '@Ai/utils/llmRouteContext'
import LlmSkuCreateForm from './Form.vue'

export default {
  name: 'LlmSkuCreate',
  components: {
    LlmSkuCreateForm,
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
    isApplyType () {
      return this.llmRouteCtx.isApplyType
    },
    isDesktopType () {
      return this.llmRouteCtx.isDesktopType
    },
    headerTitle () {
      let skuLabel = this.$t('aice.llm_sku')
      if (this.isDesktopType) skuLabel = this.$t('aice.desktop_llm_sku')
      else if (this.isApplyType) skuLabel = this.$t('aice.app_llm_sku')
      return `${this.$t('common.create')} - ${skuLabel}`
    },
  },
  methods: {
    async handleConfirm () {
      const form = this.$refs.createForm
      if (!form) return
      this.submitLoading = true
      try {
        await form.handleConfirm()
      } catch (e) {
        // 校验失败等由表单处理
      } finally {
        this.submitLoading = false
      }
    },
    handleCancel () {
      this.$refs.createForm && this.$refs.createForm.handleCancel()
    },
    onFormSuccess () {
      this.$router.push(this.llmRouteCtx.skuListPath)
    },
    onFormCancel () {
      this.$router.push(this.llmRouteCtx.skuListPath)
    },
  },
}
</script>
