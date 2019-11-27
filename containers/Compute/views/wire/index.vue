<template>
  <div>
    <page-header title="二层网络" />
    <page-body>
      <wire-list />
    </page-body>
  </div>
</template>

<script>
import WireList from './components/List'

export default {
  name: 'WireIndex',
  components: {
    WireList,
  },
}
</script>
