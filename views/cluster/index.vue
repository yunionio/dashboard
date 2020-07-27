<template>
  <div>
    <page-header :title="$t('k8s.text_185')" />
    <page-body>
      <kubecluster-list :id="listId" :getParams="getParams" />
    </page-body>
  </div>
</template>

<script>
import KubeclusterList from './components/List'

export default {
  name: 'KubeclustersIndex',
  components: {
    KubeclusterList,
  },
  data () {
    return {
      listId: 'KubeclustersList',
      getParams: {
        details: true,
      },
    }
  },
}
</script>
