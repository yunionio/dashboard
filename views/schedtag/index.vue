<template>
  <div>
    <page-header :title="$t('cloudenv.text_18')" />
    <page-body>
      <schedtag-list :id="listId" />
    </page-body>
  </div>
</template>

<script>
import SchedtagList from './components/List'

export default {
  name: 'Schedtag',
  components: {
    SchedtagList,
  },
  data () {
    return {
      listId: 'SchedtagList',
    }
  },
}
</script>
