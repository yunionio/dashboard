<template>
  <div>
    <page-header title="监控面板" />
    <page-body>
      <monitor-index />
    </page-body>
    <page-footer>
      <div slot="right">
        <a-button class="mr-3" type="primary" :loading="loading" @click="handleConfirm">保存</a-button>
        <a-button @click="reset">重置</a-button>
      </div>
    </page-footer>
  </div>
</template>

<script>
import MonitorIndex from './components/index'

export default {
  name: 'Monitor',
  components: {
    MonitorIndex,
  },
  data () {
    return {
      loading: false,
    }
  },
  methods: {
    handleConfirm () {},
    reset () {},
  },
}
</script>
