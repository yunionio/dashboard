<template>
  <div>
   <page-header :title="$t('dictionary.policy')" :tabs="tabs" :current-tab.sync="currentTab" />
   <page-body>
     <list :id="listId" :type="currentTab" />
   </page-body>
  </div>
</template>

<script>
import List from './components/List'

export default {
  name: 'PolicyIndex',
  components: {
    List,
  },
  data () {
    return {
      listId: 'PolicyList',
      tabs: [
        { label: this.$t('policy.list_tabs.all'), key: '' },
        { label: this.$t('policy.list_tabs.custom'), key: 'custom' },
        { label: this.$t('policy.list_tabs.system'), key: 'system' },
      ],
      currentTab: '',
    }
  },
}
</script>
