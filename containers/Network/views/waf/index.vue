<template>
  <div>
    <page-header :title="$t('dictionary.waf_instance')" />
    <page-body>
      <waf-list :id="listId" />
    </page-body>
  </div>
</template>

<script>
import WafList from './components/List'

export default {
  name: 'WafIndex',
  components: {
    WafList,
  },
  data () {
    return {
      listId: 'WafInstancesList',
    }
  },
}
</script>
