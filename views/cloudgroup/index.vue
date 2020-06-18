<template>
  <div>
    <page-header :title="$t('dictionary.cloudgroup')" />
    <a-alert :message="$t('cloudenv.cloudgroup_desc')" type="info" class="mt-2" />
    <page-body>
      <list :id="listId" />
    </page-body>
  </div>
</template>

<script>
import List from './components/List'

export default {
  name: 'CloudgroupsIndex',
  components: {
    List,
  },
  data () {
    return {
      listId: 'CloudgroupsList',
    }
  },
}
</script>
