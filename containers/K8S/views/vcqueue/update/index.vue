<template>
  <div>
    <page-header :title="$t('k8s.vc_queue')" />
    <page-body needMarginBottom>
      <a-spin :spinning="loading && !loaded">
        <queue-form v-if="loaded" ref="FormRef" :isUpdate="true" :initial="initial" />
      </a-spin>
    </page-body>
    <page-footer>
      <div slot="right">
        <a-button class="mr-3" type="primary" @click="confirm" :loading="loading" :disabled="!loaded">{{ $t('k8s.vc_edit') }}</a-button>
        <a-button @click="cancel">{{ $t('k8s.text_213') }}</a-button>
      </div>
    </page-footer>
  </div>
</template>

<script>
import QueueForm from '../create/Form'

export default {
  name: 'K8SVcqueueUpdate',
  components: {
    QueueForm,
  },
  data () {
    return {
      loading: false,
      loaded: false,
      initial: null,
    }
  },
  created () {
    this.fetchData()
  },
  methods: {
    async fetchData () {
      const { id, cluster } = this.$route.query
      this.loading = true
      try {
        const { data } = await new this.$Manager('vcqueues', 'v1').get({
          id,
          params: { cluster },
        })
        this.initial = data
        this.loaded = true
      } finally {
        this.loading = false
      }
    },
    async confirm () {
      try {
        this.loading = true
        await this.$refs.FormRef.doUpdate()
        this.loading = false
        this.cancel()
      } catch (error) {
        this.loading = false
        throw error
      }
    },
    cancel () {
      this.$router.push('/k8s-vcqueue')
    },
  },
}
</script>
