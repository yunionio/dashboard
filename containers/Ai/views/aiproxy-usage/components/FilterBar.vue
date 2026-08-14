<template>
  <div class="usage-filter-box mb-2 mt-2">
    <div class="d-flex align-items-center mb-2">
      <a-button class="flex-shrink-0" :disabled="loading" @click="onRefreshClick">
        <a-icon type="sync" :spin="loading" />
      </a-button>
      <date-time
        ref="dateTime"
        class="ml-2"
        start="start"
        end="end"
        :timeOpts="timeOpts"
        :defaultDateMode="defaultDateMode"
        :disableLocalTime="true"
        :disableLocalTimeSet="true"
        :timeToEnd="false"
        :canSelectTodayAfter="false"
        paramTimeFormatter="custom"
        :timeFormatter="formatUsageTime"
        @update:getParams="onDateParamsChange" />
    </div>
    <search-box
      v-if="showSearch"
      class="usage-filter-search"
      :options="filterOptions"
      :value="searchValue"
      :fetch-distinct-field="fetchDistinctField"
      @input="onSearchInput" />
  </div>
</template>

<script>
import DateTime from '@/components/DateTime'
import {
  buildUsageQueryParams,
  searchValueToUsageFilters,
  usageFiltersToSearchValue,
} from '../constants'
import {
  buildUsageSearchFilterOptions,
  fetchUsageDistinctField,
  USAGE_DISTINCT_FILTER_KEYS,
} from '../utils/filterOptions'

export default {
  name: 'AiproxyUsageFilterBar',
  components: {
    DateTime,
  },
  props: {
    filters: {
      type: Object,
      required: true,
    },
    showSearch: {
      type: Boolean,
      default: true,
    },
    loading: {
      type: Boolean,
      default: false,
    },
  },
  data () {
    return {
      searchValue: usageFiltersToSearchValue(this.filters, {
        includeEventsFields: false,
        includeRange: false,
      }),
      defaultDateMode: '12h',
      manager: null,
      filterOptions: {},
    }
  },
  computed: {
    timeOpts () {
      return [
        { key: '1h', label: this.$t('aice.aiproxy.usage.range_past_1h') },
        { key: '6h', label: this.$t('aice.aiproxy.usage.range_past_6h') },
        { key: '12h', label: this.$t('aice.aiproxy.usage.range_past_12h') },
        { key: '1d', label: this.$t('aice.aiproxy.usage.range_past_1d') },
        { key: '7d', label: this.$t('aice.aiproxy.usage.range_past_7d') },
        { key: '1M', label: this.$t('aice.aiproxy.usage.range_past_1M') },
      ]
    },
  },
  watch: {
    filters: {
      handler (val, oldVal) {
        this.searchValue = usageFiltersToSearchValue(val, {
          includeEventsFields: false,
          includeRange: false,
        })
        const prevTime = JSON.stringify({
          range: oldVal?.range,
          start: oldVal?.start,
          end: oldVal?.end,
        })
        const curTime = JSON.stringify({
          range: val?.range,
          start: val?.start,
          end: val?.end,
        })
        if (prevTime !== curTime) {
          this.clearDistinctFilterItems()
        }
      },
      deep: true,
    },
  },
  created () {
    this.manager = new this.$Manager('ai_proxy_usage', 'v2')
    this.initFilterOptions()
  },
  beforeDestroy () {
    this.manager = null
  },
  methods: {
    initFilterOptions () {
      this.filterOptions = buildUsageSearchFilterOptions({
        t: key => this.$t(key),
        fetchEventsDistinctField: params => this.fetchEventsDistinctField(params),
        includeEventsFilters: false,
        includeRange: false,
      })
    },
    clearDistinctFilterItems () {
      USAGE_DISTINCT_FILTER_KEYS.forEach(key => {
        const option = this.filterOptions[key]
        if (option?.items) {
          this.$delete(option, 'items')
        }
      })
    },
    fetchEventsDistinctField (params) {
      return this.manager.getSpecific({
        id: 'events',
        spec: 'distinct-field',
        params: {
          ...params,
          ...buildUsageQueryParams(this.filters),
        },
      })
    },
    fetchDistinctField (item) {
      return fetchUsageDistinctField(item, {
        store: this.$store,
        fetchMethod: params => this.fetchEventsDistinctField(params),
      })
    },
    formatUsageTime (time) {
      const m = this.$moment(time)
      if (!m.isValid()) return ''
      return m.utc().format('YYYY-MM-DDTHH:mm:ss[Z]')
    },
    buildRelativeTimeRange (dateMode) {
      const matched = /^(\d+)(h|d|M)$/.exec(dateMode)
      if (!matched) return null
      const amount = parseInt(matched[1], 10)
      const unitMap = { h: 'hours', d: 'days', M: 'months' }
      const end = this.$moment()
      const start = this.$moment().subtract(amount, unitMap[matched[2]])
      return {
        start: start.utc().format('YYYY-MM-DDTHH:mm:ss[Z]'),
        end: end.utc().format('YYYY-MM-DDTHH:mm:ss[Z]'),
      }
    },
    emitTimeFilters ({ start, end, range }) {
      if (!start || !end || start === 'Invalid date' || end === 'Invalid date') return
      if (start === this.filters.start && end === this.filters.end && range === this.filters.range) {
        return
      }
      this.$emit('update:filters', {
        ...this.filters,
        range,
        start,
        end,
      })
    },
    onDateParamsChange (params = {}) {
      const dateMode = this.$refs.dateTime?.time?.dateMode || this.defaultDateMode
      const relative = this.buildRelativeTimeRange(dateMode)
      if (relative) {
        this.emitTimeFilters({ ...relative, range: dateMode })
        return
      }
      this.emitTimeFilters({
        start: params.start || '',
        end: params.end || '',
        range: 'custom',
      })
    },
    onRefreshClick () {
      const dateMode = this.$refs.dateTime?.time?.dateMode || this.filters.range || this.defaultDateMode
      const relative = this.buildRelativeTimeRange(dateMode)
      if (relative) {
        // 相对时间刷新时强制更新窗口（绕过同值跳过）
        this.$emit('update:filters', {
          ...this.filters,
          range: dateMode,
          ...relative,
        })
      }
      this.$nextTick(() => {
        this.$emit('refresh')
      })
    },
    onSearchInput (searchValue) {
      this.searchValue = searchValue
      this.$emit('update:filters', searchValueToUsageFilters(searchValue, {
        preserveFilters: this.filters,
        includeRange: false,
      }))
    },
  },
}
</script>

<style lang="less" scoped>
.usage-filter-box {
  min-width: 0;
}
.usage-filter-search {
  min-width: 0;
}
</style>
