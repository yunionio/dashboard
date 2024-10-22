<template>
  <div>
    <page-header :title="$t('dictionary.identity_provider')" />
    <page-body>
      <list ref="list" :id="listId" />
    </page-body>
  </div>
</template>

<script>
import KeepAliveMixin from '@/mixins/keepAlive'
import List from './components/List'

export default {
  name: 'IdpIndex',
  components: {
    List,
  },
  mixins: [KeepAliveMixin],
  data () {
    return {
      listId: 'IDPList',
    }
  },
}
</script>
