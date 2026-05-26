<!--
  推理部署：从 Hugging Face 部署（页面 / 弹窗共用，不含 page-header）。
-->
<template>
  <div>
    <page-body :needMarginBottom="!inDialog">
      <hf-browse-pane
        ref="browse"
        :in-dialog="inDialog"
        :action-button-label="$t('aice.llm_catalog.deploy')"
        @open-drawer="onOpenDrawer" />
    </page-body>

    <a-drawer
      wrap-class-name="catalog-drawer-wrap"
      :visible="drawerVisible"
      :width="720"
      destroy-on-close
      placement="right"
      @close="closeDrawer">
      <div v-if="formRepo" class="catalog-drawer-layout">
        <div class="catalog-drawer-header">
          <div class="catalog-drawer-name">{{ formRepoId }}</div>
        </div>

        <div class="catalog-drawer-scroll">
          <catalog-drawer-meta-panel :set="hfCatalogSet" />
          <a-divider orientation="left">{{ $t('aice.llm_type') }}</a-divider>
          <a-radio-group v-model="selectedBackend" class="mb-3" button-style="solid">
            <a-radio-button value="vLLM">vLLM</a-radio-button>
            <a-radio-button value="SGLang">SGLang</a-radio-button>
          </a-radio-group>

          <template v-if="deployLlmType">
            <a-divider orientation="left">{{ $t('aice.llm_catalog.deploy_form') }}</a-divider>
            <catalog-deploy-form
              :key="deployFormKey"
              ref="deployFormRef"
              :deploy-form="deployForm"
              :llm-type="deployLlmType" />
          </template>
          <a-alert
            v-else-if="selectedBackend"
            type="warning"
            :message="$t('aice.llm_catalog.unsupported_backend')"
            show-icon
            class="mb-3" />
        </div>

        <div v-if="deployLlmType" class="catalog-drawer-footer">
          <a-button class="mr-2" @click="closeDrawer">{{ $t('common.cancel') }}</a-button>
          <a-button type="primary" :loading="submitLoading" @click="handleDeploy">
            {{ $t('aice.llm_catalog.deploy') }}
          </a-button>
        </div>
      </div>
    </a-drawer>
  </div>
</template>

<script>
import HfBrowsePane from '@Ai/sections/import-from-huggingface/components/HfBrowsePane.vue'
import CatalogDrawerMetaPanel from '@Ai/sections/catalog-model-sets/components/CatalogDrawerMetaPanel.vue'
import { repoIdOf } from '@Ai/utils/hfRepo'
import CatalogDeployForm from '@Ai/views/llm-deployment/shared/CatalogDeployForm.vue'
import {
  applyCatalogSpecToDeployForm,
  buildCatalogDeploymentPayload,
  createDefaultDeployForm,
  resolveCatalogLlmType,
} from '@Ai/utils/catalogSpec'
import { buildHfCatalogSet, buildHfCatalogSpec } from '@Ai/utils/hfImportSpec'

export default {
  name: 'HfDeployWorkspace',
  components: {
    HfBrowsePane,
    CatalogDrawerMetaPanel,
    CatalogDeployForm,
  },
  props: {
    inDialog: {
      type: Boolean,
      default: false,
    },
  },
  data () {
    return {
      formRepo: null,
      selectedBackend: 'vLLM',
      submitLoading: false,
      deploymentsManager: new this.$Manager('llm_deployments', 'v1'),
      deployForm: createDefaultDeployForm(),
    }
  },
  computed: {
    formRepoId () {
      return repoIdOf(this.formRepo)
    },
    drawerVisible () {
      return !!this.formRepo
    },
    hfCatalogSet () {
      if (!this.formRepo) return null
      return buildHfCatalogSet(this.formRepo, this.formRepoId)
    },
    hfCatalogSpec () {
      if (!this.formRepoId) return null
      return buildHfCatalogSpec(this.formRepoId, this.selectedBackend, this.formRepo)
    },
    deployLlmType () {
      if (!this.formRepoId) return ''
      return resolveCatalogLlmType(this.hfCatalogSpec, { fallbackBackend: this.selectedBackend })
    },
    deployFormKey () {
      return `${this.formRepoId}-${this.selectedBackend}-${this.deployLlmType}`
    },
  },
  watch: {
    selectedBackend () {
      this.$nextTick(() => this.applyHfDeployFormDefaults())
    },
  },
  methods: {
    onOpenDrawer (item) {
      this.formRepo = item
      this.selectedBackend = 'vLLM'
      this.deployForm = createDefaultDeployForm()
      if (this.$refs.browse) {
        this.$refs.browse.ensurePreview(item)
      }
      this.$nextTick(() => this.applyHfDeployFormDefaults())
    },
    closeDrawer () {
      this.formRepo = null
      this.selectedBackend = 'vLLM'
      this.deployForm = createDefaultDeployForm()
    },
    applyHfDeployFormDefaults () {
      if (!this.hfCatalogSpec || !this.deployLlmType) return
      applyCatalogSpecToDeployForm(
        this.deployForm,
        this.hfCatalogSpec,
        this.hfCatalogSet,
        this.deployLlmType,
      )
    },
    async handleDeploy () {
      if (!this.hfCatalogSpec || !this.deployLlmType) return
      try {
        await this.$refs.deployFormRef.validate()
      } catch (e) {
        return
      }
      this.submitLoading = true
      try {
        const payload = buildCatalogDeploymentPayload(
          this.deployForm,
          this.hfCatalogSpec,
          this.deployLlmType,
        )
        await this.deploymentsManager.create({ data: payload })
        this.$message.success(this.$t('common.success'))
        this.closeDrawer()
        this.$emit('success')
        if (!this.inDialog) {
          this.$router.push({ name: 'LlmDeploymentList' })
        }
      } finally {
        this.submitLoading = false
      }
    },
  },
}
</script>

<style lang="less" src="@Ai/sections/catalog-model-sets/catalog-drawer.less"></style>
