<!--
  推理部署：从 Hugging Face 部署。
  路由：/llm-deployment/deploy-from-huggingface
-->
<template>
  <div>
    <page-header :title="headerTitle" />
    <hf-deploy-workspace />
  </div>
</template>

<script>
import HfDeployWorkspace from './components/HfDeployWorkspace.vue'

export default {
  name: 'LlmDeploymentDeployFromHuggingFace',
  components: {
    HfDeployWorkspace,
  },
  computed: {
    headerTitle () {
      return this.$t('aice.llm_deployment.deploy.from_huggingface') + ' - ' + this.$t('aice.llm_deployment')
    },
  },
}
</script>
