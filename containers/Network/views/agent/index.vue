<template>
  <div>
    <page-header :title="title || $t('network.text_20')" />
    <page-body>
      <list ref="list" :id="listId" :get-params="getParams" />
    </page-body>
  </div>
</template>

<script>
import KeepAliveMixin from '@/mixins/keepAlive'
import List from './components/List'

export default {
  name: 'AgentIndex',
  components: {
    List,
  },
  mixins: [KeepAliveMixin],
  props: {
    title: String,
  },
  data () {
    return {
      listId: 'AgentList',
      getParams: {
        details: true,
      },
    }
  },
}
</script>
