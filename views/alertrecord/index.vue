<template>
  <div>
    <page-header :title="$t('dictionary.alertrecord')" />
    <page-body>
      <list listId="AlertrecordList" />
    </page-body>
  </div>
</template>

<script>
import List from './components/List'

export default {
  name: 'AlertrecordIndex',
  components: {
    List,
  },
}
</script>
