<template>
  <div>
    <page-header :title="$t('dictionary.explorer')" />
    <page-body>
      <monitor-index />
    </page-body>
    <!-- <page-footer>
      <div slot="right">
        <a-button class="mr-3" type="primary" :loading="loading" @click="handleConfirm">{{ $t('common.save') }}</a-button>
        <a-button @click="reset">{{ $t('common.reset') }}</a-button>
      </div>
    </page-footer> -->
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
