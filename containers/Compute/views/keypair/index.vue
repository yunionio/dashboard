<template>
  <div>
    <page-header :title="$t('compute.text_108')" />
    <page-body>
      <key-pair-list :id="listId" />
    </page-body>
  </div>
</template>

<script>
import KeyPairList from './components/List'

export default {
  name: 'KeyPairIndex',
  components: {
    KeyPairList,
  },
  data () {
    return {
      listId: 'KeyPairList',
    }
  },
}
</script>
