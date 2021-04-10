<template>
  <div>
    <page-header :title="$t('k8s.text_398')" />
    <page-body>
      <k8s-federatedrolebinding-list :id="listId" :getParams="getParams" />
    </page-body>
  </div>
</template>

<script>
import K8sFederatedrolebindingList from './components/List'

export default {
  name: 'K8SFederatedrolebindingIndex',
  components: {
    K8sFederatedrolebindingList,
  },
  data () {
    return {
      listId: 'K8SFederatedrolebindingList',
      getParams: {
        details: true,
      },
    }
  },
}
</script>
