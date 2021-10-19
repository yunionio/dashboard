<template>
  <div>
    <page-header :title="$t('dictionary.mail_config')" />
    <page-body>
      <list :id="listId" />
    </page-body>
  </div>
</template>

<script>
import List from './components/List'

export default {
  name: 'NotifyConfigIndex',
  components: {
    List,
  },
  data () {
    return {
      listId: 'NotifyConfigList',
    }
  },
}
</script>
