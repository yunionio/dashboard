<template>
  <div class="ap-logs">
    <code-mirror :value="output" :options="cmOptions" view-height="1000px" :is-scroll="true" />
  </div>
</template>
<script>
export default {
  name: 'AnsiblePlaybookSidepageLogs',
  props: {
    data: {
      type: Object,
      required: true,
    },
  },
  data () {
    return {
      T: undefined,
      cmOptions: {
        tabSize: 2,
        styleActiveLine: true,
        lineNumbers: true,
        line: true,
        mode: 'text/x-yaml',
        theme: 'material',
        autofocus: true,
      },
      playbookItem: {},
    }
  },
  computed: {
    output () {
      return this.playbookItem.output || ''
    },
    isRun () {
      const { status } = this.data
      return status === 'running'
    },
  },
  watch: {
    isRun: {
      handler (newIsRun) {
        if (newIsRun) {
          this.querys()
        } else {
          this.unQuerys()
        }
      },
      immediate: true,
    },
  },
  created () {
    this.manager = new this.$Manager('ansibleplaybooks')
    this.fetchQueryInfo()
  },
  beforeDestroy () {
    this.unQuerys()
  },
  methods: {
    async fetchQueryInfo (id = this.data.id) {
      try {
        const { data } = await this.manager.get({ id })
        this.playbookItem = data
      } catch (err) {
        throw err
      }
    },
    querys () {
      this.T = setInterval(this.fetchQueryInfo, 1000)
    },
    unQuerys () {
      clearInterval(this.T)
    },
  },
}
</script>
<style>
  .ap-logs .CodeMirror {
    height: 100% !important;
  }
</style>
