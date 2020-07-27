<template>
  <div>
    <page-header :title="$t('compute.text_105')" />
    <page-body>
      <secgroup-list :id="listId" />
    </page-body>
  </div>
</template>
<script>
import SecgroupList from './components/List'

export default {
  name: 'SecgroupIndex',
  components: {
    SecgroupList,
  },
  data () {
    return {
      listId: 'SecgroupList',
    }
  },
}
</script>
