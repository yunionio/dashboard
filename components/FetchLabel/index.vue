<template>
  <div>
    <a-icon type="loading" v-if="loading" />
    <span v-if="text">{{ text }}</span>
    <a-tooltip title="error" v-if="error">
      <a-icon type="exclamation-circle" theme="twoTone" two-tone-color="red" />
    </a-tooltip>
  </div>
</template>

<script>
export default {
  name: 'FetchLabel',
  props: {
    resource: {
      type: String,
      required: true,
    },
    version: {
      type: String,
      required: false,
      default: '',
    },
    id: {
      type: String,
      required: true,
    },
    params: {
      type: Object,
      required: false,
    },
    fetcher: {
      type: Function,
      required: true,
    },
  },
  data () {
    return {
      loading: false,
      text: '',
      error: '',
    }
  },
  mounted () {
    this.fetchData()
  },
  methods: {
    async fetchData () {
      try {
        this.loading = true
        const m = new this.$Manager(this.resource, this.version)
        const resp = await m.get({ id: this.id, params: this.params })
        this.loading = false
        this.text = this.fetcher(resp)
      } catch (error) {
        console.log(error)
        this.loading = false
        this.error = error
      }
    },
  },
}
</script>
