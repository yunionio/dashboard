<template>
  <base-dialog :width="1200" @cancel="cancelDialog">
    <div slot="header">{{ $t('aice.llm_deployment.deploy.from_huggingface') }}</div>
    <div slot="body">
      <hf-deploy-workspace
        ref="workspace"
        in-dialog
        @success="onSuccess" />
    </div>
    <div slot="footer">
      <a-button
        type="primary"
        :disabled="!canSubmit"
        :loading="submitting"
        @click="handleDeploy">
        {{ $t('aice.llm_catalog.deploy') }}
      </a-button>
      <a-button @click="cancelDialog">{{ $t('dialog.cancel') }}</a-button>
    </div>
  </base-dialog>
</template>

<script>
import HfDeployWorkspace from '@Ai/views/llm-deployment/deploy-from-huggingface/components/HfDeployWorkspace.vue'
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'DeployFromHuggingFaceDialog',
  components: {
    HfDeployWorkspace,
  },
  mixins: [DialogMixin, WindowsMixin],
  computed: {
    workspace () {
      return this.$refs.workspace
    },
    canSubmit () {
      return !!(this.workspace && this.workspace.drawerVisible && this.workspace.deployLlmType)
    },
    submitting () {
      return !!(this.workspace && this.workspace.submitLoading)
    },
  },
  methods: {
    async handleDeploy () {
      const ws = this.$refs.workspace
      if (ws) await ws.handleDeploy()
    },
    onSuccess () {
      this.cancelDialog()
      if (this.params?.vm?.list?.fetchData) {
        this.params.vm.list.fetchData()
      }
    },
  },
}
</script>
