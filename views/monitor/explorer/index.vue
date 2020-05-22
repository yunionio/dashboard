<template>
  <div>
    <page-header title="监控面板" />
    <page-body>
      <monitor-index />
    </page-body>
    <page-footer>
      <div slot="right">
        <a-button class="mr-3" type="primary" :loading="loading">{{ $t('dialog.ok') }}</a-button>
        <a-button @click="cancel">{{ $t('dialog.cancel') }}</a-button>
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
}
</script>
