<template>
  <div>
    <page-header :title="$t('k8s.text_338')" />
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
