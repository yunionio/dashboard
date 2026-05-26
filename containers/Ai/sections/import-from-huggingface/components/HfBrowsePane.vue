<!--
  Hugging Face 浏览区：搜索、结果列表、README 预览（无 drawer / 表单）。
-->
<template>
  <a-row :gutter="16" :class="['hf-page-row', { 'hf-page-row--dialog': inDialog }]">
    <a-col :span="10">
      <div :class="['hf-pane', { 'hf-pane--dialog': inDialog }]">
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
              :class="['hf-result-card', { 'hf-result-card-selected': isPreviewSelected(item) }]"
              @click="pickPreview(item)">
              <div class="hf-result-title">
                <a-icon v-if="isPreviewSelected(item)" type="check-circle" theme="filled" class="hf-result-tick" />
                {{ repoIdOf(item) }}
              </div>
              <div class="hf-result-meta">
                <a-tag v-if="item.pipeline_tag">{{ item.pipeline_tag }}</a-tag>
                <span v-if="item.downloads != null">⬇ {{ formatCount(item.downloads) }}</span>
                <span v-if="item.likes != null">♥ {{ formatCount(item.likes) }}</span>
              </div>
              <div class="hf-result-actions" @click.stop>
                <a-button type="primary" size="small" @click="$emit('open-drawer', item)">
                  {{ actionButtonLabel }}
                </a-button>
              </div>
            </a-card>
          </div>
          <div v-if="hasMore" class="mt-2 hf-load-more">
            <a-button type="link" :loading="loadingMore" @click="loadMore">
              {{ $t('common.LoadMore') }}
            </a-button>
          </div>
        </a-spin>
      </div>
    </a-col>
    <a-col :span="14">
      <div :class="['hf-pane', { 'hf-pane--dialog': inDialog }]">
        <div class="hf-section-title">{{ $t('aice.llm_deployment.deploy.readme') }}</div>
        <a-spin :spinning="readmeLoading">
          <div v-if="!previewRepo" class="hf-readme-empty">
            {{ $t('aice.llm_deployment.deploy.hf_pick_hint') }}
          </div>
          <div v-else-if="!readmeHtml && !readmeLoading" class="hf-readme-empty">
            {{ $t('aice.llm_deployment.deploy.readme_unavailable') }}
          </div>
          <div v-else class="hf-readme markdown-body" v-html="readmeHtml" />
        </a-spin>
      </div>
    </a-col>
  </a-row>
</template>

<script>
import marked from 'marked'
import { repoIdOf } from '@Ai/utils/hfRepo'

export default {
  name: 'HfBrowsePane',
  props: {
    actionButtonLabel: {
      type: String,
      required: true,
    },
    inDialog: {
      type: Boolean,
      default: false,
    },
  },
  data () {
    return {
      searching: false,
      loadingMore: false,
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
      previewRepo: null,
      readmeLoading: false,
      readmeHtml: '',
      readmeForRepo: '',
      instantModelsManager: new this.$Manager('llm_instant_models'),
    }
  },
  computed: {
    previewRepoId () {
      return repoIdOf(this.previewRepo)
    },
    sortOptions () {
      return [
        { value: 'trendingScore', label: this.$t('aice.llm_deployment.deploy.sort.trending') },
        { value: 'downloads', label: this.$t('aice.llm_deployment.deploy.sort.downloads') },
        { value: 'likes', label: this.$t('aice.llm_deployment.deploy.sort.likes') },
        { value: 'lastModified', label: this.$t('aice.llm_deployment.deploy.sort.lastModified') },
        { value: 'createdAt', label: this.$t('aice.llm_deployment.deploy.sort.createdAt') },
      ]
    },
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
  },
  created () {
    this.runSearch()
  },
  methods: {
    repoIdOf,
    isPreviewSelected (item) {
      return this.previewRepo && repoIdOf(item) === repoIdOf(this.previewRepo)
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
      sp.append('filter', 'text-generation')
      ;(this.search.quantizations || []).forEach(f => sp.append('filter', f))
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
        if (this.results.length > 0) {
          this.pickPreview(this.results[0])
        } else {
          this.previewRepo = null
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
    pickPreview (item) {
      this.previewRepo = item
      this.fetchReadme(repoIdOf(item))
    },
    ensurePreview (item) {
      if (!this.previewRepo || repoIdOf(this.previewRepo) !== repoIdOf(item)) {
        this.pickPreview(item)
      }
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
        const url = `https://huggingface.co/${repoId}/resolve/main/README.md`
        const body = await this.proxyGet(url)
        const md = body?.content || (typeof body === 'string' ? body : '')
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
  },
}
</script>

<style lang="less" scoped>
.hf-page-row {
  min-height: calc(100vh - 220px);
}
.hf-page-row--dialog {
  min-height: auto;
}
.hf-pane {
  min-height: 480px;
  max-height: calc(100vh - 220px);
  overflow-y: auto;
  padding-right: 4px;
}
.hf-pane--dialog {
  max-height: 540px;
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
  margin-bottom: 8px;
}
.hf-result-actions { text-align: right; }
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
.hf-readme ::v-deep pre code { background: transparent; padding: 0; }
.hf-readme ::v-deep table { border-collapse: collapse; margin: 6px 0; }
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
.hf-load-more { text-align: center; }
</style>
