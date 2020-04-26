<template>
  <div>
    <status-table :data="data" />
    <monitor class="mt-4" :data="data" />
  </div>
</template>

<script>
import StatusTable from './StatusTable'
import Monitor from './Monitor'

export default {
  name: 'LblistenerDashboard',
  components: {
    StatusTable,
    Monitor,
  },
  props: {
    data: {
      type: Object,
      required: true,
    },
  },
}
</script>
