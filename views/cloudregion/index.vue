<template>
  <div>
    <page-header title="区域" />
    <page-body>
      <cloudregion-list :id="listId" />
    </page-body>
  </div>
</template>

<script>
import CloudregionList from './components/List'

export default {
  name: 'CloudaccountIndex',
  components: {
    CloudregionList,
  },
  data () {
    return {
      listId: 'CloudregionList',
    }
  },
}
</script>
