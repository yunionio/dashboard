<template>
  <overview-card-layout>
    <template #header>
      <div>
        <filter-form
            @updateTable="handleUpdateTable"
            @updateChart="handleUpdateChart"
            @changeNav="handleChangeNav"
            @dataLoading="handleOnDataLoading"
            @showTable="handleShowTable"
            @changeLimit="handleChangeLimit"
            :scope="scope"
            :extraParams="extraParams" />
      </div>
    </template>
     <component v-if="chart.chartType && limit" :is="chart.chartType" :chartData="chart.chartData" :yAxisFormat="chart.metric.format" :loading="chart.loading || tableLoading" id="monitor-overview-resource" :exportName="exportName" />
    <template #footer>
      <overview-table :table-data="table" :loading="tableLoading" v-if="showTable" />
    </template>
  </overview-card-layout>
</template>

<script>
import OverviewCardLayout from '../layout'
import OverviewLine from '../sections/chart/line'
import OverviewHistogram from '../sections/chart/histogram'
import OverviewRing from '../sections/chart/ring'
import OverviewTable from '../sections/table'
import filterForm from './filterForm'

export default {
  name: 'index',
  components: {
    OverviewCardLayout,
    filterForm,
    OverviewLine,
    OverviewHistogram,
    OverviewRing,
    OverviewTable,
  },
  props: {
    scope: {
      type: String,
      required: true,
    },
    extraParams: {
      type: Object,
      required: false,
      default: () => ({}),
    },
  },
  data () {
    return {
      chart: { loading: true },
      table: {},
      showTable: false,
      tableLoading: false,
      limit: 10,
    }
  },
  computed: {
    exportName () {
      return this.chart.metric?.label || 'Export'
    },
  },
  methods: {
    handleShowTable (v) {
      this.showTable = v
    },
    handleOnDataLoading (v) {
      this.tableLoading = v
    },
    handleUpdateTable (v) {
      this.table = v
    },
    handleUpdateChart (v) {
      this.chart = v
    },
    handleChangeNav (v) {
      this.$emit('changeNav', v)
    },
    handleChangeLimit (v) {
      this.limit = v || 0
    },
  },
}
</script>
