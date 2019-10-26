<template>
  <common-dashboard :range-id="resId" range-type="cloudaccounts" />
</template>

<script>
import CommonDashboard from '@/sections/CommonDashboard'
export default {
  name: 'Dashboard',
  components: {
    CommonDashboard,
  },
  props: {
    resId: {
      type: String,
      required: true,
    },
  },
}
</script>
