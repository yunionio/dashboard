<template>
  <div class="table">
    <div v-if="!showTable" />
    <div v-else>
      <vxe-toolbar>
        <template #tools>
          <vxe-button @click="exportData" icon="vxe-icon--download" />
        </template>
      </vxe-toolbar>
      <vxe-grid
          class="mt-4"
          size="mini"
          border
          ref="overviewTable"
          :columns="tableData.columns"
          max-height="400"
          :data="tableData.rows" />
      <div class="vxe-grid--pager-wrapper">
        <div class="vxe-pager size--mini">
          <div class="vxe-pager--wrapper">
            <span class="vxe-pager--total">{{ total }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'OverviewTable',
  props: {
    tableData: {
      type: Object,
      default: () => ({}),
    },
  },
  computed: {
    showTable () {
      return this.tableData && this.tableData.rows
    },
    total () {
      if (this.showTable) {
        return this.$t('monitor_metric_78', [this.tableData.rows.length])
      }
      return 0
    },
  },
  methods: {
    exportData () {
      this.$refs.overviewTable.exportData({ type: 'csv' })
    },
  },
}
</script>
