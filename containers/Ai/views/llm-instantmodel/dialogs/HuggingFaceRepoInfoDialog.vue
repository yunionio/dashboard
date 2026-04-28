<template>
  <base-dialog :width="860" @cancel="cancelDialog">
    <div slot="header">{{ title }}</div>
    <div slot="body">
      <div v-if="loading" class="hf-repo-loading">
        <a-spin />
      </div>
      <code-mirror
        v-else
        v-model="text"
        class="hf-repo-cm"
        :options="cmOptions" />
    </div>
    <div slot="footer">
      <a-button @click="cancelDialog">{{ $t('dialog.cancel') }}</a-button>
    </div>
  </base-dialog>
</template>

<script>
import 'codemirror/mode/javascript/javascript.js'
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'HuggingFaceRepoInfoDialog',
  mixins: [DialogMixin, WindowsMixin],
  data () {
    return {
      loading: true,
      text: '',
      cmOptions: {
        tabSize: 2,
        lineNumbers: true,
        readOnly: true,
        lineWrapping: true,
        theme: 'material',
        mode: 'application/json',
      },
    }
  },
  computed: {
    title () {
      const r = this.params && this.params.repo_id
      const rev = this.params && this.params.revision
      return `${this.$t('common.view')} ${r || ''}${rev ? ` (${rev})` : ''}`
    },
  },
  async created () {
    const repoId = this.params && this.params.repo_id
    const revision = (this.params && this.params.revision) || 'main'
    if (!repoId) {
      this.text = '-'
      this.loading = false
      return
    }
    try {
      const manager = new this.$Manager('llm_instant_models')
      const res = await manager.get({ id: 'huggingface-repo-info', params: { repo_id: repoId, revision } })
      const body = res?.data != null ? res.data : res
      this.text = typeof body === 'string' ? body : JSON.stringify(body, null, 2)
    } catch (e) {
      this.text = this.$t('common.fail')
    } finally {
      this.loading = false
    }
  },
}
</script>

<style scoped>
.hf-repo-loading {
  min-height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.hf-repo-cm {
  text-align: left;
}
.hf-repo-cm ::v-deep .CodeMirror {
  max-height: 800px;
  font-size: 14px;
  border-radius: 6px;
}
</style>
