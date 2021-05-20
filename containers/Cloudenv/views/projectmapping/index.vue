<template>
  <div>
    <page-header :title="$t('cloudenv.text_580')" />
    <page-body>
      <project-mapping-list :id="listId" />
    </page-body>
  </div>
</template>

<script>
import ProjectMappingList from './components/List'

export default {
  name: 'ProjectMpppingIndex',
  components: {
    ProjectMappingList,
  },
  data () {
    return {
      listId: 'ProjectMappingList',
    }
  },
}
</script>
