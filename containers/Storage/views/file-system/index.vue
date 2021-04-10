<template>
  <div>
    <page-header :title="$t('dictionary.filesystem')" />
    <page-body>
      <file-system-list :id="listId" />
    </page-body>
  </div>
</template>

<script>
import FileSystemList from './components/List'

export default {
  name: 'FileSystem',
  components: {
    FileSystemList,
  },
  data () {
    return {
      listId: 'FileSystemList',
    }
  },
}
</script>
