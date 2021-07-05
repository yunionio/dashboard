<template>
  <div class="lb-properties">
    <code-mirror :value="text" :options="cmOptions" view-height="1000px" :is-scroll="true" />
  </div>
</template>

<script>
export default {
  name: 'LbProperties',
  props: {
    data: {
      type: Object,
      required: true,
    },
  },
  data () {
    let text = this.data.metadata['sys:properties'] || ''
    try {
      text = JSON.stringify(JSON.parse(text), null, 4)
    } catch (e) {
      console.debug('parse sys:properties', e)
    }

    return {
      text: text,
      cmOptions: {
        tabSize: 2,
        styleActiveLine: true,
        lineNumbers: true,
        lineWrapping: true,
        line: true,
        name: 'javascript',
        json: true,
        theme: 'material',
      },
    }
  },
}
</script>

<style lang="less"  scoped>
.lb-properties {
  ::v-deep .CodeMirror {
    border: 1px solid #eee;
    height: 100%;
  }

  ::v-deep .CodeMirror-scroll {
    max-height: 1000px;
    overflow-y: scroll;
    overflow-x: auto;
  }
}
</style>
