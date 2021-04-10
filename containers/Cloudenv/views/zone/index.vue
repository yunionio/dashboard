<template>
  <div>
    <page-header :title="$t('cloudenv.text_11')" />
    <page-body>
      <zone-list :getParams="getParams" :id="listId" />
    </page-body>
  </div>
</template>

<script>
import ZoneList from './components/List'

export default {
  name: 'ZoneIndex',
  components: {
    ZoneList,
  },
  data () {
    return {
      listId: 'ZoneList',
      getParams: { details: true, with_meta: true, show_emulated: true, cloud_env: 'private_or_onpremise' },
    }
  },
}
</script>
