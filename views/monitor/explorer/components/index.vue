<template>
  <div class="explorer d-flex">
    <div class="form mr-2">
      <monitor-form />
    </div>
    <div class="line">
      <monitor-line />
    </div>
  </div>
</template>

<script>
import MonitorForm from './form'
import MonitorLine from './monitor-line'

export default {
  name: 'ExplorerIndex',
  components: {
    MonitorForm,
    MonitorLine,
  },
}
</script>

<style lang="scss" scoped>
.explorer {
  .form {
    width: 500px;
  }
  .line {
    flex: 1;
  }
}
</style>
