<template>
  <div>
    <page-header title="保密字典(Secret)" />
    <page-body>
      <secret-list :id="listId" />
    </page-body>
  </div>
</template>

<script>
import SecretList from './components/List'

export default {
  name: 'K8sSecretIndex',
  components: {
    SecretList,
  },
  data () {
    return {
      listId: 'K8sSecretList',
    }
  },
}
</script>
