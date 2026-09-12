<template>
  <div>
    <page-header :title="$t('dictionary.container_registry')" />
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
