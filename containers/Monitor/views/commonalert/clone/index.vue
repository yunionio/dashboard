<template>
  <div>
    <page-header :title="$t('monitor.action.clone', [$t('dictionary.commonalert')])" />
    <page-body needMarginBottom>
      <alert ref="alertRef" :commonalertId="$route.params.id" :loading.sync="loading" />
    </page-body>
    <page-footer>
      <div slot="right">
        <a-button class="mr-3" type="primary" :loading="loading" @click="handleConfirm">{{ $t('common.save') }}</a-button>
        <a-button @click="cancel">{{ $t('common.cancel') }}</a-button>
      </div>
    </page-footer>
  </div>
</template>

<script>
import Alert from '../components/new-alert'

export default {
  name: 'CommonalertClone',
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
