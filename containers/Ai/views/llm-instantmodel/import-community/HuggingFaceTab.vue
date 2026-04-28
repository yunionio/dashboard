<template>
  <div class="hf-root">
    <!-- <a-alert type="info" class="mb-3">
      <span slot="message">{{ $t('aice.hf.registry_hint') }}</span>
    </a-alert> -->

    <div class="hf-filters mb-3">
      <a-row :gutter="8">
        <a-col :span="8">
          <fixed-label-filter :label="$t('aice.hf.search_q')">
            <a-input v-model="filters.q" :placeholder="$t('aice.hf.search_q_placeholder')" allow-clear />
          </fixed-label-filter>
        </a-col>
        <a-col :span="8">
          <fixed-label-filter :label="$t('aice.hf.search_author')">
            <a-input v-model="filters.author" :placeholder="$t('aice.hf.search_author_placeholder')" allow-clear />
          </fixed-label-filter>
        </a-col>
        <a-col :span="8">
          <fixed-label-filter :label="$t('aice.hf.filter_tags')">
            <a-input v-model="filters.filterStr" :placeholder="$t('aice.hf.filter_tags_placeholder')" allow-clear />
          </fixed-label-filter>
        </a-col>
      </a-row>
      <a-row :gutter="8" class="mt-2">
        <a-col :span="16">
          <fixed-label-filter :label="$t('aice.hf.sort')">
            <a-select v-model="filters.sort" style="width: 70%;">
              <a-select-option value="downloads">{{ $t('aice.hf.sort_downloads') }}</a-select-option>
              <a-select-option value="likes">{{ $t('aice.hf.sort_likes') }}</a-select-option>
            </a-select>
            <a-select v-model="filters.direction" class="ml-2" style="width: 30%;">
              <a-select-option :value="-1">{{ $t('aice.hf.direction_desc') }}</a-select-option>
              <a-select-option :value="1">{{ $t('aice.hf.direction_asc') }}</a-select-option>
            </a-select>
          </fixed-label-filter>
        </a-col>
        <!-- <a-col :span="8">
          <fixed-label-filter :label="$t('aice.hf.direction')">
            <a-select v-model="filters.direction" style="width: 100%;">
              <a-select-option :value="-1">{{ $t('aice.hf.direction_desc') }}</a-select-option>
              <a-select-option :value="1">{{ $t('aice.hf.direction_asc') }}</a-select-option>
            </a-select>
          </fixed-label-filter>
        </a-col> -->
        <a-col :span="8">
          <fixed-label-filter :label="$t('aice.hf.limit')">
            <a-input-number v-model="filters.limit" :min="1" :max="500" style="width: 100%;" />
          </fixed-label-filter>
        </a-col>
      </a-row>
      <div class="mt-2">
        <a-tooltip :title="!canSearch ? $t('aice.hf.search_q_required_tip') : ''">
          <a-button
            type="primary"
            :loading="loadingList"
            :disabled="!canSearch || loadingMore"
            @click="runSearch">
            {{ $t('aice.hf.search') }}
          </a-button>
        </a-tooltip>
      </div>
    </div>

    <div class="hf-card-list">
      <page-card-list
        :list="cardList"
        :card-fields="cardFields"
        :showPageer="false"
        :isRefreshed="false"
        :singleActions="singleActions" />

      <div class="hf-load-more" v-if="rawList.length">
        <a-button
          v-if="hasMore"
          type="link"
          :loading="loadingMore"
          :disabled="loadingList || loadingMore"
          @click="loadMore">
          {{ loadingMore ? $t('common.loding') : $t('common.LoadMore') }}
        </a-button>
        <span v-else class="text-secondary">{{ $t('common_640') }}</span>
      </div>
    </div>

  </div>
</template>

<script>
import WindowsMixin from '@/mixins/windows'

function parseFilterTags (str) {
  if (!str || typeof str !== 'string') return []
  return str.split(/[,，\s]+/).map(s => s.trim()).filter(Boolean)
}

function normalizeSearchResp (payload) {
  if (!payload) return { list: [], hasMore: false, nextCursor: '' }
  // 后端返回形态可能是 { data: [...], has_more, next_cursor }
  if (payload && typeof payload === 'object' && Array.isArray(payload.data)) {
    return {
      list: payload.data,
      hasMore: !!payload.has_more,
      nextCursor: payload.next_cursor || '',
    }
  }
  // 兼容历史/其他形态
  if (Array.isArray(payload)) return { list: payload, hasMore: false, nextCursor: '' }
  if (Array.isArray(payload.items)) return { list: payload.items, hasMore: !!payload.has_more, nextCursor: payload.next_cursor || '' }
  if (Array.isArray(payload.results)) return { list: payload.results, hasMore: !!payload.has_more, nextCursor: payload.next_cursor || '' }
  if (Array.isArray(payload.models)) return { list: payload.models, hasMore: !!payload.has_more, nextCursor: payload.next_cursor || '' }
  if (payload.data && typeof payload.data === 'object') {
    return normalizeSearchResp(payload.data)
  }
  return { list: [], hasMore: false, nextCursor: '' }
}

function pickRepoId (item) {
  if (!item || typeof item !== 'object') return ''
  // 优先完整 repo_id（含 org/repo），避免 id 仅后半段时无法拆作者
  if (item.repo_id) return String(item.repo_id)
  if (item.repoId) return String(item.repoId)
  return String(item.id || item.modelId || item.model_id || item.name || '')
}

function splitRepoId (repoId) {
  const s = String(repoId || '')
  const idx = s.indexOf('/')
  if (idx <= 0) return { author: '', name: s }
  return { author: s.slice(0, idx), name: s.slice(idx + 1) }
}

function formatCount (val) {
  if (val == null || val === '') return '-'
  const n = typeof val === 'number' ? val : Number(val)
  if (!Number.isFinite(n)) return '-'
  const abs = Math.abs(n)
  const sign = n < 0 ? '-' : ''
  if (abs >= 10000) {
    const v = (abs / 10000).toFixed(1).replace(/\.0$/, '')
    return `${sign}${v}w`
  }
  if (abs >= 1000) {
    const v = (abs / 1000).toFixed(1).replace(/\.0$/, '')
    return `${sign}${v}k`
  }
  return `${n}`
}

export default {
  name: 'LlmInstantModelHuggingFaceTab',
  mixins: [WindowsMixin],
  data () {
    return {
      loadingList: false,
      loadingMore: false,
      rawList: [],
      hasMore: false,
      nextCursor: '',
      filters: {
        q: '',
        author: '',
        filterStr: '',
        sort: 'downloads',
        direction: -1,
        limit: 10,
      },
      cardFields: {
        title: 'title',
        description: 'description',
        desc: 'desc',
      },
    }
  },
  computed: {
    canSearch () {
      return !!String(this.filters.q || '').trim()
    },
    cardList () {
      return {
        data: this.rawList.map(item => {
          const repoId = pickRepoId(item)
          const { author: splitAuthor, name: splitName } = splitRepoId(repoId)
          const repoAuthor = splitAuthor || (item.author != null && String(item.author).trim() ? String(item.author).trim() : '')
          const titleText = splitAuthor && splitName ? splitName : (repoId || '-')
          const downloadsText = formatCount(item.downloads)
          const likesText = formatCount(item.likes)
          const pipelineTag = item.pipeline_tag || item.pipelineTag || ''
          const tags = Array.isArray(item.tags) ? item.tags : []
          // 不在字符串里手动拼接省略号，避免 DOM 文本本身就是“.../…”，统一交给样式 line-clamp 处理
          const tagPreview = tags.length ? tags.join(', ') : '-'
          const flags = [
            item.private ? this.$t('aice.hf.private') : '',
            item.gated ? 'gated' : '',
            item.disabled ? 'disabled' : '',
            item.supported === false ? 'unsupported' : '',
          ].filter(Boolean).join(' | ')
          const descMeta = [
            pipelineTag ? `pipeline: ${pipelineTag}` : '',
            `tags: ${tagPreview}`,
            flags,
          ].filter(Boolean).join(' | ')
          const rawDesc = item.description ?? item.cardData
          const baseDescription = (rawDesc != null && String(rawDesc).trim() !== '')
            ? String(rawDesc).trim()
            : ''
          let description
          if (repoAuthor && baseDescription) {
            description = `${this.$t('aice.hf.card_author')}: ${repoAuthor} · ${baseDescription}`
          } else if (repoAuthor) {
            description = `${this.$t('aice.hf.card_author')}: ${repoAuthor}`
          } else {
            description = baseDescription || '-'
          }
          const descParts = []
          descParts.push(`${this.$t('aice.hf.downloads')}: ${downloadsText} | ${this.$t('aice.hf.likes')}: ${likesText}`)
          if (descMeta) descParts.push(descMeta)
          const desc = descParts.join(' | ')
          return {
            data: {
              title: titleText,
              description,
              desc,
              _raw: { ...item, repo_id: repoId },
            },
          }
        }),
        loading: this.loadingList,
      }
    },
    singleActions () {
      return [
        {
          label: this.$t('aice.import'),
          // render 覆盖默认按钮时仍须提供 action，否则 ActionButton 的 onClick 会调用 undefined
          action: () => {},
          meta: () => ({ buttonType: 'primary' }),
          render: (row, _props, h) => h('div', { style: { display: 'flex', gap: '8px', width: '100%' } }, [
            h('a-button', {
              props: { type: 'primary' },
              style: { flex: 1 },
              on: { click: (e) => { e.stopPropagation(); this.handleImport(row) } },
            }, this.$t('aice.import')),
            h('a-button', {
              style: { flex: 1 },
              on: { click: (e) => { e.stopPropagation(); this.handleView(row) } },
            }, this.$t('common.view')),
          ]),
        },
      ]
    },
  },
  methods: {
    async handleImport (data) {
      const raw = data?._raw || {}
      const repoId = raw.repo_id || pickRepoId(raw)
      if (!repoId) {
        this.$message.warning(this.$t('aice.hf.missing_repo_id'))
        return
      }
      const revision = raw.revision || 'main'
      this.createDialog('HuggingFaceImportDialog', {
        repo_id: repoId,
        revision,
        generate_name: this.toSafeName(repoId),
        model_name: repoId,
        model_tag: revision,
        onSuccess: () => {
          this.$router.push({ name: 'LlmInstantmodelList' })
        },
      })
    },
    handleView (data) {
      const raw = data?._raw || {}
      const repoId = raw.repo_id || pickRepoId(raw)
      if (!repoId) {
        this.$message.warning(this.$t('aice.hf.missing_repo_id'))
        return
      }
      const revision = raw.revision || raw.default_revision || 'main'
      this.createDialog('HuggingFaceRepoInfoDialog', { repo_id: repoId, revision })
    },
    buildSearchParams () {
      const params = {}
      const q = (this.filters.q || '').trim()
      const author = (this.filters.author || '').trim()
      const sort = (this.filters.sort || '').trim()
      if (q) params.q = q
      if (author) params.author = author
      const filterArr = parseFilterTags(this.filters.filterStr)
      if (filterArr.length) params.filter = filterArr
      if (sort) params.sort = sort
      if (this.filters.direction != null && this.filters.direction !== '') {
        params.direction = Number(this.filters.direction)
      }
      const lim = this.filters.limit != null && this.filters.limit !== '' ? Number(this.filters.limit) : 10
      if (!Number.isNaN(lim) && lim > 0) params.limit = lim
      return params
    },
    async runSearch () {
      if (!this.canSearch) return
      this.loadingList = true
      try {
        const manager = new this.$Manager('llm_instant_models')
        const res = await manager.get({ id: 'huggingface-search', params: this.buildSearchParams() })
        const body = res?.data != null ? res.data : res
        const { list, hasMore, nextCursor } = normalizeSearchResp(body)
        this.rawList = list
        this.hasMore = hasMore
        this.nextCursor = nextCursor || ''
      } catch (e) {
        this.$message.error(this.$t('aice.hf.search_fetch_failed'))
        this.rawList = []
        this.hasMore = false
        this.nextCursor = ''
        throw e
      } finally {
        this.loadingList = false
      }
    },
    async loadMore () {
      if (!this.hasMore || !this.nextCursor) return
      this.loadingMore = true
      try {
        const manager = new this.$Manager('llm_instant_models')
        // 兼容后端 cursor 参数命名：优先 cursor（常见），若后端用 next_cursor 也能读取
        const params = { ...this.buildSearchParams(), cursor: this.nextCursor, next_cursor: this.nextCursor }
        const res = await manager.get({ id: 'huggingface-search', params })
        const body = res?.data != null ? res.data : res
        const { list, hasMore, nextCursor } = normalizeSearchResp(body)
        const appended = Array.isArray(list) ? list : []
        // 基于 repo_id 去重，避免重复页
        const seen = new Set(this.rawList.map(i => pickRepoId(i)))
        const merged = this.rawList.slice()
        appended.forEach(i => {
          const k = pickRepoId(i)
          if (!k || !seen.has(k)) {
            merged.push(i)
            if (k) seen.add(k)
          }
        })
        this.rawList = merged
        this.hasMore = hasMore
        this.nextCursor = nextCursor || ''
      } catch (e) {
        this.$message.error(this.$t('aice.hf.search_fetch_failed'))
        throw e
      } finally {
        this.loadingMore = false
      }
    },
    toSafeName (fullName) {
      return (fullName || '').toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/^-+|-+$/g, '')
    },
  },
}
</script>

<style scoped>
.hf-root {
  overflow: hidden; /* 防止 gutter/长文本导致页面出现横向/竖向滚动条 */
}
.mb-3 {
  margin-bottom: 12px;
}
.mt-2 {
  margin-top: 8px;
}
.hf-filters {
  max-width: 1500px;
  /* ant-row gutter 会产生左右负 margin，极易导致页面出现 1 条横向滚动条 */
  padding: 0 4px;
}
.hf-filters ::v-deep .ant-input-number {
  width: 100%;
}
.hf-card-list {
  overflow-x: hidden;
}
.hf-card-list ::v-deep .card-list {
  overflow-x: hidden;
}
/* 隐藏复制链接功能 */
::v-deep .link_copy {
  display: none !important;
}

/* HF 列表：不展示图片区域（VerticalCard 固定渲染 cover） */
.hf-card-list ::v-deep .p-2.d-flex {
  display: none !important;
}

.hf-card-list ::v-deep .text-wrap {
  height: 280px;
  overflow: hidden;
  /* VerticalCard 底部有绝对定位按钮，预留空间避免文案被压缩导致提前 ... */
  padding-bottom: 72px;
}
.hf-card-list ::v-deep .mutiline-text-truncate {
  overflow: hidden;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  /* 限制最大行数，超出显示 ...（不滚动） */
  -webkit-line-clamp: 6;
  word-break: break-word;
  white-space: normal;
  line-height: 18px;
}
.hf-card-list ::v-deep .ant-card-meta-description > div.mutiline-text-truncate:not([style]) {
  /* 第一段 description（无内联 style）通常较短，限制更少行数，给 desc 腾空间 */
  -webkit-line-clamp: 2;
  min-height: 36px; /* 固定两行高度，避免不同卡片 description 高度不一致 */
}
.hf-card-list ::v-deep .ant-card-meta-description > div.mutiline-text-truncate[style] {
  /* 第二段 desc（有内联 style）固定 6 行高度，保证“能显示几行就显示几行”，不提前 ... */
  -webkit-line-clamp: 6;
  min-height: 108px; /* 18px * 6 */
}
.hf-card-list ::v-deep .card-title {
  overflow: hidden;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  word-break: break-word;
  line-height: 18px;
  min-height: 36px; /* 固定两行高度，避免短标题导致整体高度跳动 */
}
.hf-card-list ::v-deep .ant-card-meta-description,
.hf-card-list ::v-deep .ant-card-meta-description div {
  color: rgba(0, 0, 0, 0.65);
}
.hf-load-more {
  display: flex;
  justify-content: center;
  padding: 4px 0 8px;
}
.text-secondary {
  color: rgba(0, 0, 0, 0.45);
  font-size: 12px;
}
</style>
