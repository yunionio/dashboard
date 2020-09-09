<template>
  <div>
    <page-header :title="$t('helm.text_6')" />
    <page-body>
      <repo-list :id="listId" />
    </page-body>
  </div>
</template>

<script>
import RepoList from './components/List'

export default {
  name: 'K8sRepoIndex',
  components: {
    RepoList,
  },
  data () {
    return {
      listId: 'K8sRepoList',
    }
  },
}
</script>
