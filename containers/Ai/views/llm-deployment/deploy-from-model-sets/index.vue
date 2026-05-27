<!--
  推理部署：从 GPUStack 模型目录一键部署。
  路由：/llm-deployment/deploy-from-model-sets
-->
<template>
  <div>
    <page-header :title="headerTitle" />
    <page-body class="catalog-grid-page-body">
      <catalog-set-grid @select="onSetSelect" />
    </page-body>

    <a-drawer
      wrap-class-name="catalog-drawer-wrap"
      :visible="drawerVisible"
      :width="720"
      destroy-on-close
      placement="right"
      @close="clearSet">
      <div v-if="set" class="catalog-drawer-layout">
        <div class="catalog-drawer-header">
          <div class="catalog-drawer-name">{{ set.name }}</div>
        </div>

        <div class="catalog-drawer-scroll">
          <catalog-drawer-meta-panel :set="set" />

          <a-divider orientation="left">{{ $t('aice.llm_catalog.specs') }}</a-divider>
          <a-radio-group v-model="selectedSpecId" class="spec-list mb-3">
            <a-radio
              v-for="spec in catalogSpecs"
              :key="getCatalogSpecId(spec)"
              :value="getCatalogSpecId(spec)"
              class="spec-row">
              <div class="spec-row-content">
                <div class="spec-row-title">{{ specTitle(spec) }}</div>
                <div class="spec-row-meta">
                  <a-tag v-if="spec.backend">{{ spec.backend }}</a-tag>
                  <a-tag v-if="spec.mode">{{ spec.mode }}</a-tag>
                  <a-tag v-if="spec.quantization">{{ spec.quantization }}</a-tag>
                  <a-tag v-if="spec.source" color="cyan">{{ spec.source }}</a-tag>
                </div>
                <div class="spec-row-source">{{ specSourceText(spec) }}</div>
                <div v-if="(spec.backend_parameters || []).length > 0" class="spec-row-params">
                  {{ (spec.backend_parameters || []).join(' ') }}
                </div>
              </div>
            </a-radio>
          </a-radio-group>

          <template v-if="selectedSpec && deployLlmType">
            <a-divider orientation="left">{{ $t('aice.llm_catalog.deploy_form') }}</a-divider>
            <catalog-deploy-form
              :key="deployFormKey"
              ref="deployFormRef"
              :deploy-form="deployForm"
              :llm-type="deployLlmType" />
          </template>

          <a-alert
            v-else-if="selectedSpecId && !deployLlmType"
            type="warning"
            :message="$t('aice.llm_catalog.unsupported_backend')"
            show-icon
            class="mb-3" />
        </div>

        <div v-if="selectedSpec && deployLlmType" class="catalog-drawer-footer">
          <a-button class="mr-2" @click="clearSet">{{ $t('common.cancel') }}</a-button>
          <a-button type="primary" :loading="submitLoading" @click="handleDeploy">
            {{ $t('aice.llm_catalog.deploy') }}
          </a-button>
        </div>
      </div>
    </a-drawer>
  </div>
</template>

<script>
import CatalogSetGrid from '@Ai/sections/catalog-model-sets/components/CatalogSetGrid.vue'
import CatalogDrawerMetaPanel from '@Ai/sections/catalog-model-sets/components/CatalogDrawerMetaPanel.vue'
import CatalogDeployForm from '@Ai/views/llm-deployment/shared/CatalogDeployForm.vue'
import {
  applyCatalogSpecToDeployForm,
  buildCatalogDeploymentPayload,
  createDefaultDeployForm,
  getCatalogSpecId,
  isCatalogInferenceBackend,
  resolveCatalogLlmType,
} from '@Ai/utils/catalogSpec'

export default {
  name: 'LlmDeploymentDeployFromModelSets',
  components: {
    CatalogSetGrid,
    CatalogDrawerMetaPanel,
    CatalogDeployForm,
  },
  data () {
    return {
      set: null,
      selectedSpecId: '',
      submitLoading: false,
      deploymentsManager: new this.$Manager('llm_deployments', 'v1'),
      deployForm: createDefaultDeployForm(),
    }
  },
  computed: {
    headerTitle () {
      return this.$t('aice.llm_deployment.deploy.from_catalog') + ' - ' + this.$t('aice.llm_deployment')
    },
    drawerVisible () {
      return !!this.set
    },
    catalogSpecs () {
      return (this.set && this.set.specs) || []
    },
    selectedSpec () {
      if (!this.selectedSpecId) return null
      return this.catalogSpecs.find(s => getCatalogSpecId(s) === this.selectedSpecId) || null
    },
    deployLlmType () {
      if (!this.selectedSpec) return ''
      return resolveCatalogLlmType(this.selectedSpec)
    },
    deployFormKey () {
      return `${getCatalogSpecId(this.selectedSpec)}-${this.deployLlmType}`
    },
  },
  watch: {
    selectedSpecId () {
      this.applySpecToDeployForm()
    },
  },
  methods: {
    getCatalogSpecId,
    specTitle (spec) {
      if (!spec) return ''
      if (spec.name || spec.label) return spec.name || spec.label
      const backend = spec.backend || ''
      const quant = spec.quantization || spec.mode || 'default'
      return `${backend} · ${quant}`.trim()
    },
    specSourceText (spec) {
      if (!spec) return ''
      if (spec.huggingface_repo_id) return spec.huggingface_repo_id
      if (spec.model_scope_model_id) return spec.model_scope_model_id
      if (spec.ollama_model) {
        const tag = spec.ollama_tag || 'latest'
        return `${spec.ollama_model}:${tag}`
      }
      return spec.name || spec.label || ''
    },
    onSetSelect (set) {
      this.set = set
      const specs = set.specs || []
      const first = specs.find(s => isCatalogInferenceBackend(s.backend)) || specs[0]
      this.selectedSpecId = first ? getCatalogSpecId(first) : ''
      this.$nextTick(() => this.applySpecToDeployForm())
    },
    clearSet () {
      this.set = null
      this.selectedSpecId = ''
      this.resetDeployForm()
    },
    resetDeployForm () {
      this.deployForm = createDefaultDeployForm()
      this.$nextTick(() => {
        if (this.$refs.deployFormRef) {
          this.$refs.deployFormRef.clearValidate()
        }
      })
    },
    applySpecToDeployForm () {
      applyCatalogSpecToDeployForm(this.deployForm, this.selectedSpec, this.set, this.deployLlmType)
    },
    async handleDeploy () {
      const spec = this.selectedSpec
      if (!spec || !this.deployLlmType) return
      try {
        await this.$refs.deployFormRef.validate()
      } catch (e) {
        return
      }
      this.submitLoading = true
      try {
        const payload = buildCatalogDeploymentPayload(this.deployForm, spec, this.deployLlmType)
        await this.deploymentsManager.create({ data: payload })
        this.$message.success(this.$t('common.success'))
        this.clearSet()
        this.$router.push({ name: 'LlmDeploymentList' })
      } finally {
        this.submitLoading = false
      }
    },
  },
}
</script>

<style lang="less" scoped>
.catalog-grid-page-body {
  overflow: hidden;
}
.spec-list { display: block; }
.spec-row {
  display: flex;
  align-items: flex-start;
  margin-bottom: 12px;
  width: 100%;
}
.spec-row-content { margin-left: 8px; min-width: 0; }
.spec-row-title { font-weight: 500; }
.spec-row-meta { margin-top: 4px; }
.spec-row-source {
  margin-top: 4px;
  font-size: 12px;
  color: #666;
  word-break: break-all;
}
.spec-row-params {
  margin-top: 4px;
  font-size: 12px;
  color: #888;
  word-break: break-all;
}
</style>

<style lang="less" src="@Ai/sections/catalog-model-sets/catalog-drawer.less"></style>
