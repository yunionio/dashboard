<template>
  <div>
    <page-header title="密钥" />
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
