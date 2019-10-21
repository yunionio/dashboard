<template>
  <div>
    <page-header title="动态调度标签" />
    <page-body>
      <dynamicschedtag-list />
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
}
</script>
