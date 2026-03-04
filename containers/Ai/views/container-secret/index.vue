<template>
  <div>
    <page-header :title="$t('aice.container_secret')" />
    <page-body>
      <list :id="listId" />
    </page-body>
  </div>
</template>

<script>
import List from './components/List'

export default {
  name: 'ContainerSecretIndex',
  components: {
    List,
  },
  data () {
    return {
      listId: 'ContainerSecretList',
    }
  },
}
</script>
