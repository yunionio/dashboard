<template>
  <div>
    <page-header title="云账号" />
    <page-body>
      <cloudaccount-list :id="listId" />
    </page-body>
  </div>
</template>

<script>
import CloudaccountList from './components/List'

export default {
  name: 'CloudaccountIndex',
  components: {
    CloudaccountList,
  },
  data () {
    return {
      listId: 'CloudaccountList',
    }
  },
}
</script>
