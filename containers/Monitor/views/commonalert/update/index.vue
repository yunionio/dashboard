<template>
  <div>
    <page-header :title="`${$t('common.edit')}${$t('dictionary.commonalert')}`" />
    <page-body>
      <alert ref="alertRef" :isUpdate="true" :commonalertId="$route.params.id" :loading.sync="loading" />
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
import Alert from '../components/alert'

export default {
  name: 'CommonalertUpdate',
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
    reset () {
      this.$refs.alertRef.reset()
    },
    cancel () {
      this.$refs.alertRef.cancel()
    },
  },
}
</script>
