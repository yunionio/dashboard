<template>
  <div>
    <page-header :title="$t('aice.llm_catalog')" />
    <page-body>
      <a-row :gutter="8" class="mt-3 mb-3">
        <a-col :span="10">
          <a-input-search
            v-model="filter.search"
            :placeholder="$t('aice.llm_catalog.search.placeholder')"
            allow-clear
            @search="fetchList"
            @change="onFilterChange" />
        </a-col>
        <a-col :span="10">
          <a-select
            v-model="filter.category"
            :placeholder="$t('aice.llm_catalog.category.placeholder')"
            allow-clear
            style="width: 100%"
            :dropdown-match-select-width="false"
            @change="fetchList">
            <a-select-option v-for="opt in categoryOptions" :key="opt.value" :value="opt.value">
              {{ opt.label }}
            </a-select-option>
          </a-select>
        </a-col>
        <a-col :span="4" style="text-align: right;">
          <a-button
            shape="circle"
            icon="reload"
            :loading="refreshing"
            :title="$t('common.refresh')"
            @click="refresh" />
        </a-col>
      </a-row>

      <a-spin :spinning="loading">
        <a-empty v-if="!loading && sets.length === 0" />
        <a-row v-else :gutter="[12, 12]">
          <a-col v-for="set in sets" :key="set.name" :xs="24" :sm="12" :md="8" :lg="6">
            <a-card hoverable class="catalog-card" @click="openDetail(set)">
              <div class="catalog-card-header">
                <img v-if="set.icon" :src="set.icon" class="catalog-icon" />
                <div v-else class="catalog-icon catalog-icon-default">{{ initials(set.name) }}</div>
                <div class="catalog-card-title">
                  <div class="catalog-name">{{ set.name }}</div>
                  <div class="catalog-subtitle">
                    <span v-if="set.size">{{ formatSize(set) }}</span>
                    <span v-if="(set.specs || []).length > 0">
                      · {{ (set.specs || []).length }} {{ $t('aice.llm_catalog.specs') }}
                    </span>
                  </div>
                  <div v-if="set.downloads || set.likes" class="catalog-popularity">
                    <span v-if="set.downloads">⬇ {{ formatCount(set.downloads) }}</span>
                    <span v-if="set.likes">♥ {{ formatCount(set.likes) }}</span>
                  </div>
                </div>
              </div>
              <div class="catalog-desc">{{ shortDesc(set.description) }}</div>
              <div class="catalog-tags">
                <a-tag v-for="cat in set.categories" :key="`c-${cat}`" color="blue">{{ cat }}</a-tag>
                <a-tag v-for="cap in (set.capabilities || []).slice(0, 3)" :key="`cap-${cap}`">{{ cap }}</a-tag>
              </div>
              <div v-if="(set.specs || []).length > 0" class="catalog-backends">
                <a-tag v-for="b in uniqueBackends(set)" :key="`b-${b}`" color="purple">{{ b }}</a-tag>
              </div>
            </a-card>
          </a-col>
        </a-row>
      </a-spin>

      <a-pagination
        v-if="total > pageSize"
        class="mt-3"
        :total="total"
        :current.sync="page"
        :page-size="pageSize"
        @change="onPageChange" />

      <a-drawer
        :title="detailSet ? detailSet.name : ''"
        :visible="detailVisible"
        :width="640"
        @close="detailVisible = false">
        <template v-if="detailSet">
          <p style="white-space: pre-wrap;">{{ detailSet.description }}</p>
          <a-descriptions :column="1" size="small" bordered class="mb-3">
            <a-descriptions-item v-if="detailSet.size" :label="$t('aice.llm_catalog.size')">
              {{ formatSize(detailSet) }}
            </a-descriptions-item>
            <a-descriptions-item v-if="(detailSet.licenses || []).length > 0" :label="$t('aice.llm_catalog.license')">
              {{ (detailSet.licenses || []).join(', ') }}
            </a-descriptions-item>
            <a-descriptions-item v-if="detailSet.release_date" :label="$t('aice.llm_catalog.release_date')">
              {{ detailSet.release_date }}
            </a-descriptions-item>
            <a-descriptions-item v-if="(detailSet.capabilities || []).length > 0" :label="$t('aice.llm_catalog.capabilities')">
              <a-tag v-for="cap in detailSet.capabilities" :key="cap">{{ cap }}</a-tag>
            </a-descriptions-item>
            <a-descriptions-item v-if="detailSet.home" :label="$t('aice.llm_catalog.homepage')">
              <a :href="detailSet.home" target="_blank" rel="noopener">{{ detailSet.home }}</a>
            </a-descriptions-item>
          </a-descriptions>

          <a-divider orientation="left">{{ $t('aice.llm_catalog.specs') }}</a-divider>
          <a-radio-group v-model="selectedSpecId" class="spec-list">
            <a-radio
              v-for="spec in (detailSet.specs || [])"
              :key="spec.spec_id"
              :value="spec.spec_id"
              class="spec-row">
              <div class="spec-row-content">
                <div class="spec-row-title">
                  {{ spec.name || `${spec.backend || ''} · ${spec.quantization || (spec.mode || 'default')}` }}
                </div>
                <div class="spec-row-meta">
                  <a-tag v-if="spec.backend">{{ spec.backend }}</a-tag>
                  <a-tag v-if="spec.mode">{{ spec.mode }}</a-tag>
                  <a-tag v-if="spec.quantization">{{ spec.quantization }}</a-tag>
                  <a-tag v-if="spec.source" color="cyan">{{ spec.source }}</a-tag>
                </div>
                <div class="spec-row-source">
                  {{ specSourceText(spec) }}
                </div>
                <div v-if="(spec.backend_parameters || []).length > 0" class="spec-row-params">
                  {{ (spec.backend_parameters || []).join(' ') }}
                </div>
              </div>
            </a-radio>
          </a-radio-group>

          <a-divider orientation="left">{{ $t('aice.llm_catalog.deploy_form') }}</a-divider>
          <a-form-model
            ref="deployForm"
            :model="deployForm"
            :rules="deployRules"
            :label-col="{ span: 6 }"
            :wrapper-col="{ span: 18 }">
            <a-form-model-item :label="$t('common.name')" prop="name">
              <a-input v-model="deployForm.name" :placeholder="$t('common.tips.input', [$t('common.name')])" />
            </a-form-model-item>
            <a-form-model-item :label="$t('aice.llm_image')" prop="llm_image_id">
              <base-select
                v-model="deployForm.llm_image_id"
                resource="llm_images"
                :params="imageParams"
                :select-props="{ placeholder: $t('common.tips.select', [$t('aice.llm_image')]) }" />
            </a-form-model-item>
            <a-form-model-item :label="$t('compute.text_104')" prop="network">
              <base-select
                v-model="deployForm.network"
                resource="networks"
                :params="networkParams"
                :select-props="{ placeholder: $t('common.tips.select', [$t('compute.text_104')]) }" />
            </a-form-model-item>
            <a-form-model-item :label="$t('aice.llm_deployment.create.devices')" prop="devices">
              <a-select
                v-model="deployForm.devices"
                mode="multiple"
                :options="gpuOptions"
                :placeholder="$t('common.tips.select', [$t('aice.llm_deployment.create.devices')])" />
              <div class="text-color-help">
                {{ $t('aice.llm_deployment.create.devices.help') }}
              </div>
            </a-form-model-item>
            <a-form-model-item :label="$t('aice.llm_deployment.replicas')">
              <a-input-number v-model="deployForm.replicas" :min="1" :max="100" />
            </a-form-model-item>
            <a-form-model-item label="CPU">
              <a-input-number v-model="deployForm.cpu" :min="1" :max="128" />
            </a-form-model-item>
            <a-form-model-item :label="$t('compute.text_300')">
              <a-input-number v-model="deployForm.memory" :min="512" :step="512" /> MB
            </a-form-model-item>
            <a-form-model-item :label="$t('aice.llm_deployment.create.disk_size')">
              <a-input-number v-model="deployForm.disk_size" :min="1024" :step="1024" /> MB
            </a-form-model-item>
          </a-form-model>

          <div class="mt-3" style="text-align: right;">
            <a-button class="mr-2" @click="detailVisible = false">{{ $t('dialog.cancel') }}</a-button>
            <a-button type="primary" :disabled="!selectedSpecId" :loading="deploying" @click="deploy">
              {{ $t('aice.llm_catalog.deploy') }}
            </a-button>
          </div>
        </template>
      </a-drawer>
    </page-body>
  </div>
</template>

<script>
import { getDefaultPortMappingsForType } from '@Ai/views/llm-sku/llmTypeConfig'

export default {
  name: 'LlmModelSetList',
  data () {
    return {
      loading: false,
      refreshing: false,
      sets: [],
      total: 0,
      page: 1,
      pageSize: 20,
      filter: {
        search: '',
        category: null,
      },
      detailVisible: false,
      detailSet: null,
      selectedSpecId: undefined,
      deploying: false,
      deployForm: {
        name: '',
        llm_image_id: '',
        network: '',
        devices: [],
        replicas: 1,
        cpu: 4,
        memory: 8192,
        disk_size: 20480,
      },
      setsManager: new this.$Manager('llm_model_sets', 'v1'),
      deploymentsManager: new this.$Manager('llm_deployments', 'v1'),
      filterDebounce: null,
    }
  },
  computed: {
    selectedSpec () {
      if (!this.detailSet || !this.selectedSpecId) return null
      return (this.detailSet.specs || []).find(sp => sp.spec_id === this.selectedSpecId) || null
    },
    catalogLlmType () {
      const m = { vllm: 'vllm', ollama: 'ollama', sglang: 'sglang' }
      const k = (this.selectedSpec?.backend || '').toLowerCase()
      return m[k] || 'vllm'
    },
    imageParams () {
      return {
        scope: this.$store.getters.scope,
        llm_type: this.catalogLlmType,
      }
    },
    networkParams () {
      return {
        scope: this.$store.getters.scope,
        limit: 20,
        usable: true,
        host_type: 'container',
      }
    },
    deployRules () {
      return {
        name: [{ required: true, message: this.$t('common.tips.input', [this.$t('common.name')]) }],
        llm_image_id: [{ required: true, message: this.$t('common.tips.select', [this.$t('aice.llm_image')]) }],
        network: [{ required: true, message: this.$t('common.tips.select', [this.$t('compute.text_104')]) }],
        devices: [{ required: true, type: 'array', message: this.$t('common.tips.select', [this.$t('aice.llm_deployment.create.devices')]) }],
      }
    },
    gpuOptions () {
      const types = this.$store.getters.capability?.pci_model_types || {}
      const list = Object.values(types).filter(item => item.hypervisor === 'pod')
      return list.map(item => ({ value: item.model, label: item.model }))
    },
    categoryOptions () {
      return [
        { value: 'llm', label: this.$t('aice.llm_catalog.category.llm') },
        { value: 'embedding', label: this.$t('aice.llm_catalog.category.embedding') },
        { value: 'reranker', label: this.$t('aice.llm_catalog.category.reranker') },
        { value: 'image', label: this.$t('aice.llm_catalog.category.image') },
        { value: 'speech_to_text', label: this.$t('aice.llm_catalog.category.stt') },
        { value: 'text_to_speech', label: this.$t('aice.llm_catalog.category.tts') },
      ]
    },
  },
  created () {
    this.fetchList()
  },
  methods: {
    onFilterChange () {
      if (this.filterDebounce) clearTimeout(this.filterDebounce)
      this.filterDebounce = setTimeout(() => this.fetchList(), 300)
    },
    onPageChange (page) {
      this.page = page
      this.fetchList()
    },
    async fetchList () {
      this.loading = true
      try {
        const params = {
          limit: this.pageSize,
          offset: (this.page - 1) * this.pageSize,
        }
        if (this.filter.search) params.search = this.filter.search
        if (this.filter.category) params.category = this.filter.category
        const res = await this.setsManager.list({ params })
        // The Manager wrapper parses the backend's `llm_model_sets` field
        // and exposes the array under `data.data`. Total/limit/offset are
        // surfaced at the top level of `data`.
        this.sets = res.data?.data || []
        this.total = res.data?.total ?? this.sets.length
      } catch (e) {
        this.$message.error(this.$t('aice.llm_catalog.fetch_failed'))
      } finally {
        this.loading = false
      }
    },
    async refresh () {
      this.refreshing = true
      try {
        await this.setsManager.performClassAction({ action: 'refresh' })
        this.$message.success(this.$t('common.success'))
        await this.fetchList()
      } catch (e) {
        this.$message.error(this.$t('aice.llm_catalog.refresh_failed'))
      } finally {
        this.refreshing = false
      }
    },
    openDetail (set) {
      this.detailSet = set
      this.selectedSpecId = (set.specs && set.specs.length > 0) ? set.specs[0].spec_id : undefined
      // Seed the deploy form with a reasonable default name derived from the set.
      this.deployForm = {
        name: this.defaultDeploymentName(set),
        llm_image_id: '',
        network: '',
        devices: [],
        replicas: 1,
        cpu: 4,
        memory: 8192,
        disk_size: 20480,
      }
      this.detailVisible = true
    },
    defaultDeploymentName (set) {
      const base = (set.name || 'model').toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/^-+|-+$/g, '')
      const rand = Math.random().toString(36).slice(2, 6)
      return `${base}-${rand}`
    },
    async deploy () {
      if (!this.selectedSpecId || !this.selectedSpec) return
      try {
        await this.$refs.deployForm.validate()
      } catch (e) {
        return
      }
      const spec = this.selectedSpec
      const llmType = this.catalogLlmType
      // Build sku_spec from the form + spec metadata.
      const skuSpec = {
        llm_image_id: this.deployForm.llm_image_id,
        llm_type: llmType,
        cpu: this.deployForm.cpu,
        memory: this.deployForm.memory,
        volumes: [{ size_mb: this.deployForm.disk_size, storage_type: 'local' }],
      }
      if (this.deployForm.devices && this.deployForm.devices.length > 0) {
        skuSpec.devices = this.deployForm.devices.map(model => ({ model }))
      }
      // Always include backend-default port mappings so the inference service
      // is reachable inside the container (ollama → tcp:11434, vllm → tcp:8000,
      // etc.). Same defaults the manual SKU create form uses.
      const defaultPorts = getDefaultPortMappingsForType(llmType)
      if (defaultPorts.length > 0) {
        skuSpec.port_mappings = defaultPorts.map(pm => ({
          protocol: pm.protocol,
          container_port: pm.container_port,
        }))
      }
      if (spec.backend_parameters && spec.backend_parameters.length > 0) {
        skuSpec.backend_parameters = spec.backend_parameters
      }
      // model_spec is the import payload — map from GPUStack source schema.
      const modelSpec = this.buildModelSpec(spec, llmType)
      const payload = {
        name: this.deployForm.name,
        replicas: this.deployForm.replicas,
        placement_strategy: 'spread',
        access_policy: 'authed',
        auto_start: true,
        nets: [{ network: this.deployForm.network }],
        sku_spec: skuSpec,
      }
      if (modelSpec) payload.model_spec = modelSpec
      this.deploying = true
      try {
        await this.deploymentsManager.create({ data: payload })
        this.$message.success(this.$t('common.success'))
        this.detailVisible = false
        this.$router.push({ name: 'LlmDeploymentList' })
      } catch (e) {
        // error toast surfaced by the global error handler
      } finally {
        this.deploying = false
      }
    },
    buildModelSpec (spec, llmType) {
      const src = spec.source
      if (src === 'ollama') {
        // OneCloud convention: ollama-registry source uses empty string and
        // looks up by (model_name, tag) directly from the bundled registry.
        const name = spec.ollama_model
        const tag = spec.ollama_tag || 'latest'
        if (!name) return null
        return {
          llm_type: 'ollama',
          source: '',
          model_name: name,
          model_tag: tag,
        }
      }
      const repo = spec.huggingface_repo_id || spec.model_scope_model_id
      if (!repo) return null
      // Backend's DownloadModel uses model_name as the full upstream repo path
      // (e.g. "Qwen/Qwen3-0.6B" for HuggingFace). Stripping the org prefix
      // breaks the API lookup, so model_name == repo_id here.
      const ms = { llm_type: llmType, model_name: repo, repo_id: repo }
      if (src === 'huggingface') {
        ms.source = 'huggingface'
        ms.model_tag = spec.huggingface_filename || 'main'
      } else if (src === 'model_scope') {
        ms.source = 'model_scope'
        ms.model_tag = spec.model_scope_file_path || 'main'
      } else {
        // local_path or unknown — not importable through this flow.
        return null
      }
      return ms
    },
    shortDesc (s) {
      if (!s) return ''
      const trimmed = s.trim()
      return trimmed.length > 100 ? trimmed.slice(0, 97) + '…' : trimmed
    },
    initials (name) {
      return (name || '?').slice(0, 2).toUpperCase()
    },
    formatSize (set) {
      const unit = set.size_unit || 'B'
      return `${set.size}${unit}`
    },
    formatCount (n) {
      if (n == null) return '-'
      const v = Number(n)
      if (!Number.isFinite(v)) return '-'
      if (v >= 1e6) return (v / 1e6).toFixed(1) + 'M'
      if (v >= 1e3) return (v / 1e3).toFixed(1) + 'k'
      return String(v)
    },
    uniqueBackends (set) {
      const seen = new Set()
      ;(set.specs || []).forEach(sp => sp.backend && seen.add(sp.backend))
      return Array.from(seen)
    },
    specSourceText (spec) {
      switch (spec.source) {
        case 'huggingface':
          return `HuggingFace: ${spec.huggingface_repo_id || ''}${spec.huggingface_filename ? ' / ' + spec.huggingface_filename : ''}`
        case 'model_scope':
          return `ModelScope: ${spec.model_scope_model_id || ''}${spec.model_scope_file_path ? ' / ' + spec.model_scope_file_path : ''}`
        case 'local_path':
          return `Local: ${spec.local_path || ''}`
        case 'ollama':
          return `Ollama: ${spec.ollama_model || ''}${spec.ollama_tag ? ':' + spec.ollama_tag : ''}`
        default:
          return spec.source || ''
      }
    },
  },
}
</script>

<style scoped>
.filter-label {
  font-size: 12px;
  color: #666;
  margin-bottom: 4px;
}
.catalog-popularity {
  display: flex;
  gap: 10px;
  font-size: 11px;
  color: #888;
  margin-top: 2px;
}

.catalog-card { height: 100%; cursor: pointer; }
.catalog-card-header { display: flex; align-items: center; margin-bottom: 8px; }
.catalog-icon { width: 40px; height: 40px; border-radius: 4px; margin-right: 12px; object-fit: cover; }
.catalog-icon-default { display: flex; align-items: center; justify-content: center; background: #f0f1f5; color: #666; font-weight: 600; }
.catalog-card-title { flex: 1; min-width: 0; }
.catalog-name { font-size: 14px; font-weight: 600; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.catalog-subtitle { font-size: 12px; color: #999; }
.catalog-desc { font-size: 12px; color: #666; height: 36px; overflow: hidden; margin-bottom: 8px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; }
.catalog-tags, .catalog-backends { display: flex; flex-wrap: wrap; gap: 4px; }
.catalog-backends { margin-top: 6px; }

.spec-list { display: block; }
.spec-row { display: block; padding: 10px; border: 1px solid #e8e8e8; border-radius: 4px; margin-bottom: 8px; width: 100%; height: auto; }
.spec-row-content { display: inline-block; vertical-align: top; }
.spec-row-title { font-weight: 500; margin-bottom: 4px; }
.spec-row-meta { display: flex; flex-wrap: wrap; gap: 4px; align-items: center; margin-bottom: 4px; }
.spec-row-source { font-size: 12px; color: #666; }
.spec-row-params { font-size: 11px; color: #999; margin-top: 2px; font-family: monospace; word-break: break-all; }
</style>
