<template>
  <div style="border: 1px solid #ccc">
    <toolbar
      style="border-bottom: 1px solid #ccc"
      :editor="editor"
      :defaultConfig="toolbarConfig"
      :mode="mode" />
    <editor
      style="height: auto;min-height:52px"
      v-model="html"
      :defaultConfig="editorConfig"
      :mode="mode"
      @onCreated="onCreated" />
  </div>
</template>

<script>
// https://www.wangeditor.com/v5/
import { Editor, Toolbar } from '@wangeditor/editor-for-vue'

export default {
  name: 'RichEditor',
  components: {
    Editor,
    Toolbar,
  },
  model: {
    prop: 'value',
    event: 'change',
  },
  props: {
    value: String,
    mode: {
      type: String,
      default: 'simple',
    },
    toolbarConfig: {
      type: Object,
      default: () => ({ toolbarKeys: ['fontSize', 'bold', 'underline', 'color', 'indent', 'delIndent'] }),
    },
    editorConfig: {
      type: Object,
      default: () => ({}),
    },
  },
  data () {
    return {
      editor: null,
      html: this.value,
    }
  },
  watch: {
    html (val) {
      this.$emit('change', val)
    },
  },
  mounted () {},
  beforeDestroy () {
    const editor = this.editor
    if (editor === null) return
    editor.destroy()
  },
  methods: {
    onCreated (editor) {
      this.editor = Object.seal(editor)
    },
  },
}
</script>
