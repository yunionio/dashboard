<template>
  <div>
    <page-header :title="$t('k8s.text_294')" />
    <!-- <a-tabs v-model="activedTab">
      <a-tab-pane :tab="$t('k8s.text_231')" key="FormCreate" />
      <a-tab-pane :tab="$t('k8s.text_232')" key="InputCreate" />
      <a-tab-pane :tab="$t('k8s.text_233')" key="UploadCreate" />
    </a-tabs> -->
    <component :is="activedTab" />
  </div>
</template>

<script>
import FormCreate from './components/FormCreate'
import InputCreate from './components/InputCreate'
import UploadCreate from './components/UploadCreate'

export default {
  name: 'K8SNamespaceCreate',
  components: {
    FormCreate,
    InputCreate,
    UploadCreate,
  },
  data () {
    return {
      loading: false,
      activedTab: 'FormCreate',
    }
  },
}
</script>
