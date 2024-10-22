<template>
  <div>
    <page-header :title="$t('k8s.text_27')" />
    <page-body>
      <kube-component-list :id="listId" />
    </page-body>
  </div>
</template>

<script>
import KeepAliveMixin from '@/mixins/keepAlive'
import KubeComponentList from './components/List'

export default {
  name: 'KubeComponentIndex',
  components: {
    KubeComponentList,
  },
  mixins: [KeepAliveMixin],
  data () {
    return {
      listId: 'KubeComponentList',
    }
  },
}
</script>
