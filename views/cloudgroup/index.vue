<template>
  <div>
    <page-header :title="$t('cloudenv.text_491')" />
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
