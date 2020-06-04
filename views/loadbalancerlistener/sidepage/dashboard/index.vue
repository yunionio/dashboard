<template>
  <div>
    <filter-form :data="data" @change="handleFilterChange" />
    <status-table :data="ruleData || data" />
    <monitor class="mt-4" :data="ruleData || data" />
  </div>
</template>

<script>
import StatusTable from './StatusTable'
import Monitor from './Monitor'
import FilterForm from './FilterForm'

export default {
  name: 'LblistenerDashboard',
  components: {
    FilterForm,
    StatusTable,
    Monitor,
  },
  props: {
    data: {
      type: Object,
      required: true,
    },
  },
  data () {
    return {
      ruleData: undefined,
    }
  },
  methods: {
    handleFilterChange (ruleData) {
      this.ruleData = ruleData || this.data
    },
  },
}
</script>
