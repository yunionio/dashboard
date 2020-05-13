<template>
  <div>
    <page-header title="服务目录" />
    <page-body>
      <servicecatalog-list :id="listId" />
    </page-body>
  </div>
</template>

<script>
import ServicecatalogList from './components/List'

export default {
  name: 'ServertemplateIndex',
  components: {
    ServicecatalogList,
  },
  data () {
    return {
      listId: 'ServicecatalogList',
    }
  },
}
</script>
