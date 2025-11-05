<template>
  <div class="dmesg-container">
    <div class="dmesg-filter">
      <div class="d-flex align-items-center flex-wrap">
        <fixed-label-filter :label="$t('compute.ops_time')" class="mr-2 mb-2">
          <a-range-picker
            v-model="filterForm.timeRange"
            :show-time="{ format: 'HH:mm:ss', defaultValue: [$moment('00:00:00', 'HH:mm:ss'), $moment('23:59:59', 'HH:mm:ss')] }"
            format="YYYY-MM-DD HH:mm:ss"
            :placeholder="[$t('compute.text_230'), $t('compute.text_231')]"
            @change="handleFilterChange" />
        </fixed-label-filter>
        <fixed-label-filter :label="$t('compute.log_level')" class="mr-2 mb-2">
          <a-select
            v-model="filterForm.logLevel"
            allow-clear
            style="width: 150px"
            @change="handleFilterChange">
            <a-select-option v-for="level in logLevelOptions" :key="level.value" :value="level.value">
              {{ level.label }}
            </a-select-option>
          </a-select>
        </fixed-label-filter>
        <fixed-label-filter :label="$t('compute.log_info')" class="mr-2 mb-2">
          <a-input
            v-model="filterForm.notes"
            allow-clear
            style="width: 200px"
            @input="handleFilterInput" />
        </fixed-label-filter>
        <div class="mb-2">
          <a-button @click="handleResetFilter">
            {{ $t('common.reset') }}
          </a-button>
        </div>
      </div>
    </div>
    <div
      ref="scrollContainer"
      class="dmesg-scroll-container"
      @scroll="handleScroll">
      <div v-if="loading && dataList.length === 0" class="loading-wrapper">
        <a-spin size="large" />
      </div>
      <div v-else-if="dataList.length === 0" class="empty-wrapper">
        <a-empty :description="$t('common.notData')" />
      </div>
      <div v-else class="dmesg-list">
        <div
          v-for="(item, index) in dataList"
          :key="index"
          class="dmesg-item">
          <span style="font-weight: bold;">></span> {{ formatItem(item) }}
        </div>
        <div v-if="loadingMore" class="loading-more">
          <a-spin size="small" />
          <span class="ml-2">{{ $t('common_67') }}</span>
        </div>
        <div v-if="noMoreData && dataList.length > 0" class="no-more-data">
          {{ $t('common.load_no_more') }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'Dmesg',
  mixins: [WindowsMixin],
  props: {
    resId: {
      type: String,
      required: true,
    },
    data: {
      type: Object,
      required: true,
    },
  },
  data () {
    return {
      dataList: [],
      loading: false,
      loadingMore: false,
      noMoreData: false,
      nextMarker: null,
      pageSize: 50,
      scrollContainer: null,
      filterForm: {
        timeRange: null,
        logLevel: undefined,
        notes: '',
      },
      logLevelOptions: ['emerg', 'alert', 'crit', 'err', 'warning', 'notice', 'info', 'debug'].map(level => ({
        label: level,
        value: level,
      })),
      debounceTimer: null,
    }
  },
  created () {
    this.fetchData()
  },
  mounted () {
    this.scrollContainer = this.$refs.scrollContainer
  },
  beforeDestroy () {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer)
    }
  },
  methods: {
    async fetchData (isLoadMore = false) {
      if (this.loading || this.loadingMore) return

      if (isLoadMore) {
        this.loadingMore = true
      } else {
        this.loading = true
        this.dataList = []
        this.noMoreData = false
      }

      try {
        const manager = new this.$Manager('events', 'v2')
        const params = {
          limit: this.pageSize,
          scope: this.$store.getters.scope,
          filter: [],
        }

        if (this.nextMarker) {
          params.paging_marker = this.nextMarker
        }

        // 添加过滤条件
        if (this.filterForm.timeRange && this.filterForm.timeRange.length === 2) {
          const startTime = this.$moment(this.filterForm.timeRange[0]).utc().format('YYYY-MM-DD HH:mm:ss')
          const endTime = this.$moment(this.filterForm.timeRange[1]).utc().format('YYYY-MM-DD HH:mm:ss')
          params.filter.push(`ops_time.between("${startTime}", "${endTime}")`)
        }

        if (this.filterForm.logLevel) {
          const logLevelFilter = `log_level.equals("${this.filterForm.logLevel}")`
          params.filter.push(logLevelFilter)
        }

        if (this.filterForm.notes && this.filterForm.notes.trim()) {
          const notesFilter = `notes.contains("${this.filterForm.notes.trim()}")`
          params.filter.push(notesFilter)
        }

        const response = await manager.list({
          params: {
            ...params,
            obj_id: this.resId,
            obj_type: 'host',
            show_dmesg_log: true,
          },
        })

        const newData = response.data?.data || response.data?.items || response.data || []
        const nextMarker = response.data?.next_marker || response.data?.marker || null

        if (isLoadMore) {
          this.dataList = [...this.dataList, ...newData]
        } else {
          this.dataList = newData
        }

        this.nextMarker = nextMarker
        this.noMoreData = !nextMarker

        // 加载完成后滚动到底部（首次加载）
        if (!isLoadMore && this.dataList.length > 0) {
          this.$nextTick(() => {
            this.scrollToBottom()
          })
        }
      } catch (error) {
        this.$message.error(error.message || this.$t('common.fetch_error'))
      } finally {
        this.loading = false
        this.loadingMore = false
      }
    },
    handleScroll (event) {
      const container = event.target
      const scrollTop = container.scrollTop
      const scrollHeight = container.scrollHeight
      const clientHeight = container.clientHeight

      // 当滚动到距离底部 100px 时加载更多
      if (scrollHeight - scrollTop - clientHeight < 100) {
        if (this.nextMarker && !this.loadingMore && !this.noMoreData) {
          this.fetchData(true)
        }
      }
    },
    scrollToBottom () {
      if (this.scrollContainer) {
        this.scrollContainer.scrollTop = this.scrollContainer.scrollHeight
      }
    },
    formatItem (item) {
      return `${item.ops_time ? this.$moment(item.ops_time).format('YYYY-MM-DD HH:mm:ss') : '-'} [${item.log_level || '-'}] ${item.notes || ''}`
    },
    handleFilterChange () {
      // 清除之前的防抖定时器
      if (this.debounceTimer) {
        clearTimeout(this.debounceTimer)
      }
      // 立即执行过滤
      this.doFilter()
    },
    handleFilterInput () {
      // 清除之前的防抖定时器
      if (this.debounceTimer) {
        clearTimeout(this.debounceTimer)
      }
      // 设置新的防抖定时器，500ms 后执行
      this.debounceTimer = setTimeout(() => {
        this.doFilter()
      }, 500)
    },
    doFilter () {
      // 重置分页和标记
      this.nextMarker = null
      this.dataList = []
      this.noMoreData = false
      // 重新加载数据
      this.fetchData(false)
    },
    handleResetFilter () {
      // 清除防抖定时器
      if (this.debounceTimer) {
        clearTimeout(this.debounceTimer)
        this.debounceTimer = null
      }
      // 重置过滤条件
      this.filterForm = {
        timeRange: null,
        logLevel: undefined,
        notes: '',
      }
      // 重置分页和标记
      this.nextMarker = null
      this.dataList = []
      this.noMoreData = false
      // 重新加载数据
      this.fetchData(false)
    },
  },
}
</script>

<style lang="less" scoped>
.dmesg-container {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.dmesg-filter {
  background-color: #fff;
}

.dmesg-scroll-container {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  background-color: #f5f5f5;
}

.loading-wrapper,
.empty-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  min-height: 300px;
}

.dmesg-list {
  .dmesg-item {
    padding: 5px 3px;
    // background-color: #fff;
    font-family: 'Courier New';
    font-size: 14px;
    line-height: 1.6;
    word-break: break-all;
    white-space: pre-wrap;
    // border-left: 3px solid #1890ff;

    // &:hover {
    //   background-color: #f0f0f0;
    // }
  }

  .loading-more {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 16px;
    color: #999;
  }

  .no-more-data {
    text-align: center;
    padding: 16px;
    color: #999;
    font-size: 12px;
  }
}
</style>
