<template>
  <div class="ap-logs">
    <code-mirror :value="output" :options="cmOptions" view-height="1000px" :is-scroll="true" />
  </div>
</template>
<script>
export default {
  name: 'AnsiblePlaybookSidepageLogs',
  props: {
    output: {
      type: String,
      required: true,
    },
  },
  data () {
    return {
      cmOptions: {
        tabSize: 2,
        styleActiveLine: true,
        lineNumbers: true,
        line: true,
        mode: 'text/x-yaml',
        theme: 'material',
        autofocus: true,
      },
    }
  },
}
</script>
<style>
  .ap-logs .CodeMirror {
    height: 100% !important;
  }
</style>
