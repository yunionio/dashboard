<template>
  <div>
    <page-header title="可用区" />
    <page-body>
      <zone-list />
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
}
</script>
