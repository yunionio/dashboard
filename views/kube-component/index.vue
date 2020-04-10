<template>
  <div>
    <page-header title="服务组件" />
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
