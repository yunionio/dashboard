<template>
  <div>
    <page-header :title="$t('network.text_571')" />
    <page-body>
      <wire-list :id="listId" />
    </page-body>
  </div>
</template>

<script>
import WireList from './components/List'

export default {
  name: 'WireIndex',
  components: {
    WireList,
  },
  data () {
    return {
      listId: 'WireList',
    }
  },
}
</script>
