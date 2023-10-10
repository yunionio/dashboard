<template>
  <div>
    <page-header :title="$t('k8s.text_158')" />
    <page-body>
      <repos-list :id="listId" />
    </page-body>
  </div>
</template>

<script>
import ReposList from './components/List'

export default {
  name: 'K8sReposIndex',
  components: {
    ReposList,
  },
  data () {
    return {
      listId: 'K8sReposList',
    }
  },
}
</script>
