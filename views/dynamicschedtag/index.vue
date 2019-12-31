<template>
  <div>
    <page-header title="动态调度标签" />
    <page-body>
      <dynamicschedtag-list :id="listId" />
    </page-body>
  </div>
</template>

<script>
import DynamicschedtagList from './components/List'

export default {
  name: 'Dynamicschedtag',
  components: {
    DynamicschedtagList,
  },
  data () {
    return {
      listId: 'DynamicschedtagList',
    }
  },
}
</script>
