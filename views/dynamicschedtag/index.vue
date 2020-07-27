<template>
  <div>
    <page-header :title="$t('cloudenv.text_20')" />
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
