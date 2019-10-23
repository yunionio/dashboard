<template>
  <div>
    <page-header title="可用区" />
    <page-body>
      <zone-list :getParams="getParams" />
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
      getParams: { details: true, with_meta: true, cloud_env: 'private_or_onpremise' },
    }
  },
}
</script>
