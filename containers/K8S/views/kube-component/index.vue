<template>
  <div>
    <page-header :title="$t('k8s.text_27')" />
    <page-body>
      <kube-component-list :id="listId" />
    </page-body>
  </div>
</template>

<script>
import KubeComponentList from './components/List'

export default {
  name: 'KubeComponentIndex',
  components: {
    KubeComponentList,
  },
  data () {
    return {
      listId: 'KubeComponentList',
    }
  },
}
</script>
