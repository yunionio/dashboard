<template>
  <div>
    <page-header
      :title="$t('aice.llm_image.import_community')"
      :tabs="headerTabs"
      :current-tab.sync="currentTab" />
    <page-body>
      <template v-if="currentTab === 'community'">
        <community-tab />
      </template>

      <template v-else>
        <hugging-face-tab />
      </template>
    </page-body>
  </div>
</template>

<script>
import CommunityTab from './CommunityTab.vue'
import HuggingFaceTab from './HuggingFaceTab.vue'

export default {
  name: 'LlmImageImportCommunity',
  components: {
    CommunityTab,
    HuggingFaceTab,
  },
  data () {
    return {
      currentTab: 'community',
    }
  },
  computed: {
    headerTabs () {
      return [
        { label: '社区模型库', key: 'community' },
        { label: 'Hugging Face', key: 'huggingface' },
      ]
    },
  },
}
</script>

<style scoped>
</style>
