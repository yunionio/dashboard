<template>
  <div class="idp-saml-xml-dialog">
    <div>
       <code-mirror v-model="metadata" :options="cmOptions" />
    </div>
    <div class="text-right mt-2">
      <a-button type="primary" :loading="loading" @click="downloadXml">{{$t('common_502')}}</a-button>
    </div>
  </div>
</template>

<script>
import 'codemirror/theme/monokai.css'
import 'codemirror/mode/xml/xml.js'
import 'codemirror/mode/htmlmixed/htmlmixed.js'
import vkbeautify from '@/utils/vkbeautify'

export default {
  name: 'IdpSamlXml',
  props: {
    data: {
      type: Object,
      required: true,
    },
  },
  data () {
    return {
      loading: false,
      metadata: '',
      cmOptions: {
        tabSize: 2,
        indentUnit: 4,
        htmlMode: true,
        smartIndent: true,
        matchClosing: true,
        alignCDATA: true,
        lineWrapping: true,
        lineNumbers: true,
        readOnly: true,
        mode: 'application/xml',
        theme: 'monokai',
      },
    }
  },
  created () {
    this.authManager = new this.$Manager('auth/idp', 'v1')
    this.queryMetadata()
  },
  methods: {
    async queryMetadata () {
      this.loading = true
      try {
        const { data } = await this.authManager.getSpecific({
          id: this.data.id,
          spec: 'saml-metadata',
        })
        this.metadata = vkbeautify.xml(data.metadata)
      } catch (err) {
        throw err
      } finally {
        this.loading = false
      }
    },
    downloadXml () {
      const eleLink = document.createElement('a')
      eleLink.download = `${this.data.name}.xml`
      const blob = new Blob([this.metadata])
      eleLink.href = URL.createObjectURL(blob)
      document.body.appendChild(eleLink)
      eleLink.click()
    },
  },
}
</script>
<style scoped lang="less">
 .idp-saml-xml-dialog  {
   ::v-deep {
     .ant-modal-body{
        padding: 0;
      }
      .CodeMirror{
        height: 500px;
      }
      // .CodeMirror-gutter{
      //   width: 0 !important;
      // }
   }
 }
</style>
