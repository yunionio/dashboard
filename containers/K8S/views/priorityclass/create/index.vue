<template>
  <div>
    <page-header :title="$t('k8s.vc_priority_class')" />
    <page-body needMarginBottom>
      <priorityclass-form ref="FormCreateRef" />
    </page-body>
    <page-footer>
      <div slot="right">
        <a-button class="mr-3" type="primary" @click="confirm" :loading="loading">{{ $t('k8s.create') }}</a-button>
        <a-button @click="cancel">{{ $t('k8s.text_213') }}</a-button>
      </div>
    </page-footer>
  </div>
</template>

<script>
import PriorityclassForm from './Form'

export default {
  name: 'K8SPriorityclassCreate',
  components: {
    PriorityclassForm,
  },
  data () {
    return {
      loading: false,
    }
  },
  methods: {
    async confirm () {
      try {
        this.loading = true
        await this.$refs.FormCreateRef.doCreate()
        this.loading = false
        this.cancel()
      } catch (error) {
        this.loading = false
        throw error
      }
    },
    cancel () {
      this.$router.push('/k8s-priorityclass')
    },
  },
}
</script>
