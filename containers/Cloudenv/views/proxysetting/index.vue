<template>
  <div>
    <page-header :title="$t('cloudenv.text_14')" />
    <page-body>
      <proxysetting-list :id="listId" />
    </page-body>
  </div>
</template>

<script>
import ProxysettingList from './components/List'

export default {
  name: 'ProxysettingIndex',
  components: {
    ProxysettingList,
  },
  data () {
    return {
      listId: 'ProxysettingList',
    }
  },
}
</script>
