<template>
  <div>
    <page-header title="ModelArts" />
    <page-body>
      <list :id="listId" />
    </page-body>
  </div>
</template>

<script>
import List from './components/List'

export default {
  name: 'ModelArtsIndex',
  components: {
    List,
  },
  data () {
    return {
      listId: 'ModelArtsList',
    }
  },
}
</script>

<style>

</style>
