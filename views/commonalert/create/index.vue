<template>
  <div>
    <page-header :title="$t('monitor.text_13')" />
    <page-body>
      <alert ref="alertRef" :loading.sync="loading" />
    </page-body>
    <page-footer>
      <div slot="right">
        <a-button class="mr-3" type="primary" :loading="loading" @click="handleConfirm">{{ $t('common.create') }}</a-button>
        <a-button @click="cancel">{{ $t('common.cancel') }}</a-button>
      </div>
    </page-footer>
  </div>
</template>

<script>
import Alert from '../components/alert'

export default {
  name: 'CommonalertCreate',
  components: {
    Alert,
  },
  data () {
    return {
      loading: false,
    }
  },
  methods: {
    handleConfirm () {
      this.$refs.alertRef.submit()
    },
    cancel () {
      this.$refs.alertRef.cancel()
    },
    reset () {
      this.$refs.alertRef.reset()
    },
  },
}
</script>
