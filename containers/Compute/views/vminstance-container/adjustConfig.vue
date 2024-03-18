<template>
  <adjust-config :params="params" v-if="isRender" />
</template>

<script>
import AdjustConfig from './components/AdjustConfigForm'
export default {
  name: 'VmAdjustConfig',
  components: {
    AdjustConfig,
  },
  data () {
    return {
      params: {
        data: [],
      },
    }
  },
  computed: {
    isRender () {
      return this.params.data.length > 0
    },
  },
  created () {
    this.fetchData()
  },
  methods: {
    fetchData () {
      const serversManager = new this.$Manager('servers')
      let ids = [this.$route.query.id]
      if (Array.isArray(this.$route.query.id)) {
        ids = this.$route.query.id
      }
      serversManager.batchGet({ id: ids })
        .then((res) => {
          this.params.data = res.data.data
        })
    },
  },
}
</script>
