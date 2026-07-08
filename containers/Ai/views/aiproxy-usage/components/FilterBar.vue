<template>
  <div class="usage-filter-box mb-2 mt-2">
    <search-box
      :options="filterOptions"
      :value="searchValue"
      :fetch-distinct-field="fetchDistinctField"
      @input="onSearchInput" />
  </div>
</template>

<script>
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
  props: {
    filters: {
      type: Object,
      required: true,
    },
  },
  data () {
    return {
      searchValue: usageFiltersToSearchValue(this.filters, { includeEventsFields: false }),
      manager: null,
      filterOptions: {},
    }
  },
  watch: {
    filters: {
      handler (val, oldVal) {
        this.searchValue = usageFiltersToSearchValue(val, { includeEventsFields: false })
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
    onSearchInput (searchValue) {
      this.searchValue = searchValue
      this.$emit('update:filters', searchValueToUsageFilters(searchValue, {
        preserveFilters: this.filters,
      }))
    },
  },
}
</script>
