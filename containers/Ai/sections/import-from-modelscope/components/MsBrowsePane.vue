<!--
  ModelScope 浏览区：搜索、结果列表、描述预览。
-->
<template>
  <a-row :gutter="16" :class="['hf-page-row', { 'hf-page-row--dialog': inDialog }]">
    <a-col :span="10">
      <div :class="['hf-pane', { 'hf-pane--dialog': inDialog }]">
        <a-row :gutter="8" class="mb-2">
          <a-col :span="14">
            <a-input
              v-model="search.q"
              :placeholder="$t('aice.ms.search_q_placeholder')"
              allow-clear
              @pressEnter="runSearch" />
          </a-col>
          <a-col :span="10">
            <a-button type="primary" :loading="searching" block @click="runSearch">
              {{ $t('aice.ms.search') }}
            </a-button>
          </a-col>
        </a-row>
        <a-spin :spinning="searching">
          <a-empty v-if="!searching && results.length === 0" :description="$t('aice.ms.no_results')" />
          <div v-else class="hf-result-list">
            <a-card
              v-for="item in results"
              :key="modelIdOf(item)"
              hoverable
              :class="['hf-result-card', { 'hf-result-card-selected': isPreviewSelected(item) }]"
              @click="pickPreview(item)">
              <div class="hf-result-title">
                <a-icon v-if="isPreviewSelected(item)" type="check-circle" theme="filled" class="hf-result-tick" />
                {{ modelIdOf(item) }}
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
          <div v-if="!previewItem" class="hf-readme-empty">
            {{ $t('aice.ms.pick_hint') }}
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
import { modelIdOf, buildMsReadmeProxyUrl } from '@Ai/utils/msImportSpec'

export default {
  name: 'MsBrowsePane',
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
        page: 1,
        pageSize: 20,
      },
      results: [],
      hasMore: false,
      previewItem: null,
      readmeLoading: false,
      readmeHtml: '',
      readmeForModel: '',
      instantModelsManager: new this.$Manager('llm_instant_models'),
    }
  },
  computed: {
    previewModelId () {
      return modelIdOf(this.previewItem)
    },
  },
  created () {
    this.runSearch()
  },
  methods: {
    modelIdOf,
    isPreviewSelected (item) {
      return this.previewItem && modelIdOf(item) === modelIdOf(this.previewItem)
    },
    formatCount (n) {
      if (n == null) return '-'
      const v = Number(n)
      if (!Number.isFinite(v)) return '-'
      if (v >= 1e6) return (v / 1e6).toFixed(1) + 'M'
      if (v >= 1e3) return (v / 1e3).toFixed(1) + 'k'
      return String(v)
    },
    async runSearch () {
      this.searching = true
      this.search.page = 1
      try {
        const res = await this.instantModelsManager.get({
          id: 'modelscope-search',
          params: {
            q: (this.search.q || '').trim(),
            page: this.search.page,
            page_size: this.search.pageSize,
          },
        })
        const body = res?.data?.data || res?.data || {}
        this.results = Array.isArray(body.data) ? body.data : (Array.isArray(body) ? body : [])
        this.hasMore = !!(body.has_more ?? body.hasMore)
        if (this.results.length > 0) {
          this.pickPreview(this.results[0])
        } else {
          this.previewItem = null
          this.readmeHtml = ''
        }
      } catch (e) {
        this.$message.error(this.$t('aice.ms.search_fetch_failed'))
      } finally {
        this.searching = false
      }
    },
    async loadMore () {
      if (!this.hasMore) return
      this.loadingMore = true
      try {
        this.search.page += 1
        const res = await this.instantModelsManager.get({
          id: 'modelscope-search',
          params: {
            q: (this.search.q || '').trim(),
            page: this.search.page,
            page_size: this.search.pageSize,
          },
        })
        const body = res?.data?.data || res?.data || {}
        const list = Array.isArray(body.data) ? body.data : (Array.isArray(body) ? body : [])
        const seen = new Set(this.results.map(modelIdOf))
        list.forEach(item => {
          const k = modelIdOf(item)
          if (k && !seen.has(k)) {
            this.results.push(item)
            seen.add(k)
          }
        })
        this.hasMore = !!body.has_more
      } catch (e) {
        this.$message.error(this.$t('aice.ms.search_fetch_failed'))
      } finally {
        this.loadingMore = false
      }
    },
    pickPreview (item) {
      this.previewItem = item
      this.fetchReadme(modelIdOf(item))
    },
    ensurePreview (item) {
      if (!this.previewItem || modelIdOf(this.previewItem) !== modelIdOf(item)) {
        this.pickPreview(item)
      }
    },
    async fetchReadme (modelId) {
      if (!modelId) {
        this.readmeHtml = ''
        return
      }
      this.readmeForModel = modelId
      this.readmeLoading = true
      this.readmeHtml = ''
      try {
        const url = buildMsReadmeProxyUrl(modelId)
        if (!url) {
          this.readmeHtml = ''
          return
        }
        const body = await this.proxyGet(url)
        const md = body?.content || (typeof body === 'string' ? body : '')
        if (this.readmeForModel !== modelId) return
        this.readmeHtml = md ? marked(md) : ''
      } catch (e) {
        if (this.readmeForModel === modelId) {
          this.readmeHtml = ''
        }
      } finally {
        if (this.readmeForModel === modelId) {
          this.readmeLoading = false
        }
      }
    },
    async proxyGet (upstream) {
      const res = await this.instantModelsManager.get({ id: 'proxy', params: { url: upstream } })
      return res?.data
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
