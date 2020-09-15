<template>
  <div>
    <page-header :title="$t('k8s.text_394')" />
    <page-body>
      <k8s-federatedclusterrolebinding-list :id="listId" :getParams="getParams" />
    </page-body>
  </div>
</template>

<script>
import K8sFederatedclusterrolebindingList from './components/List'

export default {
  name: 'K8SFederatedclusterrolebindingIndex',
  components: {
    K8sFederatedclusterrolebindingList,
  },
  data () {
    return {
      listId: 'K8SFederatedclusterrolebindingList',
      getParams: {
        details: true,
      },
    }
  },
}
</script>
