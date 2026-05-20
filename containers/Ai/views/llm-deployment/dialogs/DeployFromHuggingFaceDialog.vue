<template>
  <base-dialog :width="1200" @cancel="cancelDialog">
    <div slot="header">{{ $t('aice.llm_deployment.deploy.from_huggingface') }}</div>
    <div slot="body">
      <a-row :gutter="16">
        <a-col :span="8">
          <!-- Left column: search + results -->
          <div class="hf-pane">
            <a-row :gutter="8" class="mb-2">
              <a-col :span="14">
                <a-input
                  v-model="search.q"
                  :placeholder="$t('aice.hf.search_q_placeholder')"
                  allow-clear
                  @pressEnter="runSearch" />
              </a-col>
              <a-col :span="10">
                <a-button type="primary" :loading="searching" block @click="runSearch">
                  {{ $t('aice.hf.search') }}
                </a-button>
              </a-col>
            </a-row>
            <a-row :gutter="8" class="mb-3">
              <a-col :span="12">
                <a-select
                  v-model="search.sort"
                  size="small"
                  style="width: 100%;"
                  @change="runSearch">
                  <a-select-option v-for="opt in sortOptions" :key="opt.value" :value="opt.value">
                    {{ opt.label }}
                  </a-select-option>
                </a-select>
              </a-col>
              <a-col :span="12">
                <a-select
                  v-model="search.quantizations"
                  size="small"
                  style="width: 100%;"
                  mode="multiple"
                  allow-clear
                  :placeholder="$t('aice.llm_deployment.deploy.quantization')"
                  @change="runSearch">
                  <a-select-option v-for="opt in quantizationOptions" :key="opt.value" :value="opt.value">
                    {{ opt.label }}
                  </a-select-option>
                </a-select>
              </a-col>
            </a-row>
            <a-spin :spinning="searching">
              <a-empty v-if="!searching && results.length === 0" :description="$t('aice.hf.no_results')" />
              <div v-else class="hf-result-list">
                <a-card
                  v-for="item in results"
                  :key="repoIdOf(item)"
                  hoverable
                  :class="['hf-result-card', { 'hf-result-card-selected': isSelected(item) }]"
                  @click="pickRepo(item)">
                  <div class="hf-result-title">
                    <a-icon v-if="isSelected(item)" type="check-circle" theme="filled" class="hf-result-tick" />
                    {{ repoIdOf(item) }}
                  </div>
                  <div class="hf-result-meta">
                    <a-tag v-if="item.pipeline_tag">{{ item.pipeline_tag }}</a-tag>
                    <span v-if="item.downloads != null">⬇ {{ formatCount(item.downloads) }}</span>
                    <span v-if="item.likes != null">♥ {{ formatCount(item.likes) }}</span>
                  </div>
                </a-card>
              </div>
              <div v-if="hasMore" class="mt-2" style="text-align: center;">
                <a-button type="link" :loading="loadingMore" @click="loadMore">
                  {{ $t('common.LoadMore') }}
                </a-button>
              </div>
            </a-spin>
          </div>
        </a-col>

        <a-col :span="9">
          <!-- Middle column: README preview -->
          <div class="hf-pane">
            <div class="hf-section-title">{{ $t('aice.llm_deployment.deploy.readme') }}</div>
            <a-spin :spinning="readmeLoading">
              <div v-if="!selectedRepo" class="hf-readme-empty">
                {{ $t('aice.llm_deployment.deploy.hf_pick_hint') }}
              </div>
              <div v-else-if="!readmeHtml && !readmeLoading" class="hf-readme-empty">
                {{ $t('aice.llm_deployment.deploy.readme_unavailable') }}
              </div>
              <div v-else class="hf-readme markdown-body" v-html="readmeHtml" />
            </a-spin>
          </div>
        </a-col>

        <a-col :span="7">
          <!-- Right column: deploy form -->
          <div class="hf-pane">
            <a-alert
              v-if="!selectedRepo"
              type="info"
              show-icon
              :message="$t('aice.llm_deployment.deploy.hf_pick_hint')" />
            <a-alert
              v-else
              type="info"
              show-icon
              class="mb-3"
              :message="$t('aice.llm_deployment.deploy.selected_repo', [selectedRepoId])" />

            <a-form-model
              ref="form"
              :model="form"
              :rules="rules"
              :label-col="{ span: 8 }"
              :wrapper-col="{ span: 16 }">
              <a-form-model-item :label="$t('common.name')" prop="name">
                <a-input v-model="form.name" :disabled="!selectedRepo" />
              </a-form-model-item>
              <a-form-model-item :label="$t('aice.llm_type')" prop="llm_type">
                <a-radio-group v-model="form.llm_type" button-style="solid">
                  <a-radio-button value="vllm">vLLM</a-radio-button>
                  <a-radio-button value="sglang">SGLang</a-radio-button>
                </a-radio-group>
              </a-form-model-item>
              <a-form-model-item :label="$t('aice.llm_image')" prop="llm_image_id">
                <base-select
                  v-model="form.llm_image_id"
                  resource="llm_images"
                  :params="imageParams"
                  :select-props="{ placeholder: $t('common.tips.select', [$t('aice.llm_image')]), disabled: !selectedRepo }" />
              </a-form-model-item>
              <a-form-model-item :label="$t('compute.text_104')" prop="network">
                <base-select
                  v-model="form.network"
                  resource="networks"
                  :params="networkParams"
                  :select-props="{ placeholder: $t('common.tips.select', [$t('compute.text_104')]), disabled: !selectedRepo }" />
              </a-form-model-item>
              <a-form-model-item :label="$t('aice.llm_deployment.create.devices')" prop="devices">
                <a-select
                  v-model="form.devices"
                  mode="multiple"
                  :options="gpuOptions"
                  :disabled="!selectedRepo"
                  :placeholder="$t('common.tips.select', [$t('aice.llm_deployment.create.devices')])" />
              </a-form-model-item>
              <a-form-model-item :label="$t('aice.llm_deployment.replicas')">
                <a-input-number v-model="form.replicas" :min="1" :max="100" :disabled="!selectedRepo" />
              </a-form-model-item>
              <a-form-model-item label="CPU">
                <a-input-number v-model="form.cpu" :min="1" :max="128" :disabled="!selectedRepo" />
              </a-form-model-item>
              <a-form-model-item :label="$t('compute.text_300')">
                <a-input-number v-model="form.memory" :min="512" :step="512" :disabled="!selectedRepo" /> MB
              </a-form-model-item>
              <a-form-model-item :label="$t('aice.llm_deployment.create.disk_size')">
                <a-input-number v-model="form.disk_size" :min="1024" :step="1024" :disabled="!selectedRepo" /> MB
              </a-form-model-item>
            </a-form-model>
          </div>
        </a-col>
      </a-row>
    </div>
    <div slot="footer">
      <a-button type="primary" :disabled="!selectedRepo" :loading="deploying" @click="handleDeploy">
        {{ $t('aice.llm_catalog.deploy') }}
      </a-button>
      <a-button @click="cancelDialog">{{ $t('dialog.cancel') }}</a-button>
    </div>
  </base-dialog>
</template>

<script>
import marked from 'marked'
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'
import { getDefaultPortMappingsForType } from '@Ai/views/llm-sku/llmTypeConfig'

function repoIdOf (item) {
  if (!item) return ''
  return item.repo_id || item.id || item.modelId || item.model_id || item.name || ''
}

function safeName (s) {
  return String(s || '').toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/^-+|-+$/g, '')
}

export default {
  name: 'DeployFromHuggingFaceDialog',
  mixins: [DialogMixin, WindowsMixin],
  data () {
    return {
      searching: false,
      loadingMore: false,
      deploying: false,
      search: {
        q: '',
        sort: 'trendingScore',
        direction: -1,
        limit: 20,
        quantizations: [],
      },
      results: [],
      hasMore: false,
      nextCursor: '',
      selectedRepo: null,
      readmeLoading: false,
      readmeHtml: '',
      readmeForRepo: '',
      form: {
        name: '',
        llm_type: 'vllm',
        llm_image_id: '',
        network: '',
        devices: [],
        replicas: 1,
        cpu: 8,
        memory: 16384,
        disk_size: 40960,
      },
      rules: {
        name: [{ required: true, message: this.$t('common.tips.input', [this.$t('common.name')]) }],
        llm_type: [{ required: true, message: this.$t('common.tips.select', [this.$t('aice.llm_type')]) }],
        llm_image_id: [{ required: true, message: this.$t('common.tips.select', [this.$t('aice.llm_image')]) }],
        network: [{ required: true, message: this.$t('common.tips.select', [this.$t('compute.text_104')]) }],
        devices: [{ required: true, type: 'array', message: this.$t('common.tips.select', [this.$t('aice.llm_deployment.create.devices')]) }],
      },
      instantModelsManager: new this.$Manager('llm_instant_models'),
      deploymentsManager: new this.$Manager('llm_deployments', 'v1'),
    }
  },
  computed: {
    selectedRepoId () { return repoIdOf(this.selectedRepo) },
    sortOptions () {
      return [
        { value: 'trendingScore', label: this.$t('aice.llm_deployment.deploy.sort.trending') },
        { value: 'downloads', label: this.$t('aice.llm_deployment.deploy.sort.downloads') },
        { value: 'likes', label: this.$t('aice.llm_deployment.deploy.sort.likes') },
        { value: 'lastModified', label: this.$t('aice.llm_deployment.deploy.sort.lastModified') },
        { value: 'createdAt', label: this.$t('aice.llm_deployment.deploy.sort.createdAt') },
      ]
    },
    // HF API accepts these as `filter=<tag>` (repeatable). They roughly map to
    // quantization formats. "safetensors" isn't a quantization per se but is a
    // common filter for users avoiding GGUF.
    quantizationOptions () {
      return [
        { value: 'gguf', label: 'GGUF' },
        { value: 'awq', label: 'AWQ' },
        { value: 'gptq', label: 'GPTQ' },
        { value: 'fp8', label: 'FP8' },
        { value: 'int8', label: 'INT8' },
        { value: 'int4', label: 'INT4' },
        { value: 'safetensors', label: 'safetensors' },
      ]
    },
    imageParams () {
      return { scope: this.$store.getters.scope, llm_type: this.form.llm_type }
    },
    networkParams () {
      return { scope: this.$store.getters.scope, limit: 20, usable: true, host_type: 'container' }
    },
    gpuOptions () {
      const types = this.$store.getters.capability?.pci_model_types || {}
      const list = Object.values(types).filter(item => item.hypervisor === 'pod')
      return list.map(item => ({ value: item.model, label: item.model }))
    },
  },
  created () {
    // Show popular models by default — no search input required.
    // Matches GPUStack's "models visible on open" UX.
    this.runSearch()
  },
  methods: {
    repoIdOf,
    isSelected (item) {
      return this.selectedRepo && repoIdOf(item) === repoIdOf(this.selectedRepo)
    },
    formatCount (n) {
      if (n == null) return '-'
      const v = Number(n)
      if (!Number.isFinite(v)) return '-'
      if (v >= 1e6) return (v / 1e6).toFixed(1) + 'M'
      if (v >= 1e3) return (v / 1e3).toFixed(1) + 'k'
      return String(v)
    },
    buildSearchURL (extra = {}) {
      const q = (this.search.q || '').trim()
      const sp = new URLSearchParams()
      if (q) sp.set('search', q)
      sp.set('sort', this.search.sort)
      sp.set('direction', String(this.search.direction))
      sp.set('limit', String(this.search.limit))
      // Baseline filter — only text-generation models.
      sp.append('filter', 'text-generation')
      // HF lets `filter` be repeated; quantization picks each add their own.
      ;(this.search.quantizations || []).forEach(q => sp.append('filter', q))
      for (const [k, v] of Object.entries(extra)) {
        if (v != null && v !== '') sp.set(k, String(v))
      }
      return `https://huggingface.co/api/models?${sp.toString()}`
    },
    async proxyGet (upstream) {
      const res = await this.instantModelsManager.get({ id: 'proxy', params: { url: upstream } })
      return res?.data
    },
    async runSearch () {
      this.searching = true
      try {
        const body = await this.proxyGet(this.buildSearchURL())
        if (Array.isArray(body)) {
          this.results = body
          this.hasMore = false
          this.nextCursor = ''
        } else {
          const list = body?.data || body?.items || body?.results || body?.models || []
          this.results = Array.isArray(list) ? list : []
          this.hasMore = !!body?.has_more
          this.nextCursor = body?.next_cursor || ''
        }
        // Auto-select the first result so the README pane has something to
        // render. Re-runs of search (sort/filter change) also re-pick — the
        // previous selection often won't even be in the new result set.
        if (this.results.length > 0) {
          this.pickRepo(this.results[0])
        } else {
          this.selectedRepo = null
          this.readmeHtml = ''
        }
      } catch (e) {
        this.$message.error(this.$t('aice.hf.search_fetch_failed'))
      } finally {
        this.searching = false
      }
    },
    async loadMore () {
      if (!this.hasMore || !this.nextCursor) return
      this.loadingMore = true
      try {
        const body = await this.proxyGet(this.buildSearchURL({ cursor: this.nextCursor }))
        const list = Array.isArray(body) ? body : (body?.data || body?.items || body?.results || body?.models || [])
        const seen = new Set(this.results.map(repoIdOf))
        ;(Array.isArray(list) ? list : []).forEach(item => {
          const k = repoIdOf(item)
          if (k && !seen.has(k)) {
            this.results.push(item)
            seen.add(k)
          }
        })
        this.hasMore = Array.isArray(body) ? false : !!body?.has_more
        this.nextCursor = body?.next_cursor || ''
      } catch (e) {
        this.$message.error(this.$t('aice.hf.search_fetch_failed'))
      } finally {
        this.loadingMore = false
      }
    },
    pickRepo (item) {
      this.selectedRepo = item
      const id = repoIdOf(item)
      const slug = safeName(id) || 'deploy'
      const rand = Math.random().toString(36).slice(2, 6)
      this.form.name = `${slug}-${rand}`
      this.form.llm_image_id = ''
      this.fetchReadme(id)
    },
    async fetchReadme (repoId) {
      if (!repoId) {
        this.readmeHtml = ''
        return
      }
      this.readmeForRepo = repoId
      this.readmeLoading = true
      this.readmeHtml = ''
      try {
        // /resolve/<rev>/<path> is HF's canonical "fetch the file" route —
        // returns text inline for README.md and redirects to the CDN for
        // binary blobs. The legacy /raw/ alias isn't kept current on every repo.
        const url = `https://huggingface.co/${repoId}/resolve/main/README.md`
        const body = await this.proxyGet(url)
        // README arrives wrapped in {content, content_type} by the proxy when
        // upstream returns text/markdown.
        const md = body?.content || (typeof body === 'string' ? body : '')
        // Stale fetch guard: only render if the user hasn't switched models
        // while this request was in flight.
        if (this.readmeForRepo !== repoId) return
        this.readmeHtml = md ? marked(md) : ''
      } catch (e) {
        if (this.readmeForRepo === repoId) {
          this.readmeHtml = ''
        }
      } finally {
        if (this.readmeForRepo === repoId) {
          this.readmeLoading = false
        }
      }
    },
    async handleDeploy () {
      if (!this.selectedRepo) return
      try {
        await this.$refs.form.validate()
      } catch (e) {
        return
      }
      const repoId = this.selectedRepoId
      if (!repoId) {
        this.$message.error(this.$t('aice.hf.missing_repo_id'))
        return
      }
      const skuSpec = {
        llm_image_id: this.form.llm_image_id,
        llm_type: this.form.llm_type,
        cpu: this.form.cpu,
        memory: this.form.memory,
        volumes: [{ size_mb: this.form.disk_size, storage_type: 'local' }],
      }
      if (this.form.devices.length > 0) {
        skuSpec.devices = this.form.devices.map(model => ({ model }))
      }
      const defaultPorts = getDefaultPortMappingsForType(this.form.llm_type)
      if (defaultPorts.length > 0) {
        skuSpec.port_mappings = defaultPorts.map(pm => ({ protocol: pm.protocol, container_port: pm.container_port }))
      }
      const payload = {
        name: this.form.name,
        replicas: this.form.replicas,
        placement_strategy: 'spread',
        access_policy: 'authed',
        auto_start: true,
        nets: [{ network: this.form.network }],
        sku_spec: skuSpec,
        model_spec: {
          llm_type: this.form.llm_type,
          source: 'huggingface',
          repo_id: repoId,
          model_name: repoId,
          model_tag: 'main',
        },
      }
      this.deploying = true
      try {
        await this.deploymentsManager.create({ data: payload })
        this.$message.success(this.$t('common.success'))
        this.cancelDialog()
        if (this.params?.vm?.list?.fetchData) {
          this.params.vm.list.fetchData()
        }
      } catch (e) {
        // global error handler will surface the toast
      } finally {
        this.deploying = false
      }
    },
  },
}
</script>

<style scoped>
.hf-pane {
  max-height: 540px;
  overflow-y: auto;
  padding-right: 4px;
}
.hf-result-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.hf-result-card { cursor: pointer; }
.hf-result-card-selected {
  border: 2px solid #36c626;
  background: #f6fffb;
}
.hf-result-title {
  font-weight: 600;
  font-size: 14px;
  margin-bottom: 4px;
  display: flex;
  align-items: center;
  gap: 6px;
}
.hf-result-tick { color: #36c626; }
.hf-result-meta {
  display: flex;
  gap: 12px;
  align-items: center;
  color: #666;
  font-size: 12px;
}

.hf-section-title {
  font-weight: 600;
  margin-bottom: 8px;
  font-size: 13px;
  color: #555;
}
.hf-readme {
  font-size: 13px;
  line-height: 1.55;
  color: #333;
}
.hf-readme ::v-deep h1 { font-size: 18px; margin: 12px 0 8px; }
.hf-readme ::v-deep h2 { font-size: 16px; margin: 10px 0 6px; }
.hf-readme ::v-deep h3 { font-size: 14px; margin: 8px 0 4px; }
.hf-readme ::v-deep p { margin: 6px 0; }
.hf-readme ::v-deep code {
  background: #f5f5f5;
  padding: 2px 4px;
  border-radius: 3px;
  font-size: 12px;
}
.hf-readme ::v-deep pre {
  background: #f5f5f5;
  padding: 8px;
  border-radius: 4px;
  overflow-x: auto;
  font-size: 12px;
}
.hf-readme ::v-deep pre code {
  background: transparent;
  padding: 0;
}
.hf-readme ::v-deep table {
  border-collapse: collapse;
  margin: 6px 0;
}
.hf-readme ::v-deep td,
.hf-readme ::v-deep th {
  border: 1px solid #e8e8e8;
  padding: 4px 8px;
  font-size: 12px;
}
.hf-readme ::v-deep img { max-width: 100%; }
.hf-readme-empty {
  color: #999;
  font-size: 13px;
  padding: 24px 8px;
  text-align: center;
}
</style>
