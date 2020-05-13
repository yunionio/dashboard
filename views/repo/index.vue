<template>
  <div>
    <page-header title="Helm仓库地址(Repo)" />
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
