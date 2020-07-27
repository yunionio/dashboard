<template>
  <div>
    <page-header :title="$t('network.text_142')" />
    <page-body>
      <list :id="listId" :get-params="getParams" />
    </page-body>
  </div>
</template>

<script>
import List from './components/List'

export default {
  name: 'LbaclIndex',
  components: {
    List,
  },
  data () {
    return {
      listId: 'LbaclList',
      getParams: {
        details: true,
      },
    }
  },
}
</script>
