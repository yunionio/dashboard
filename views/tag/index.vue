<template>
  <div>
    <page-header title="标签" />
    <page-body>
      <tag-list :getParams="getParams" />
    </page-body>
  </div>
</template>

<script>
import TagList from './components/List'

export default {
  name: 'TagIndex',
  components: {
    TagList,
  },
  data () {
    return {
      getParams: {
        with_user_meta: true,
        with_cloud_meta: true,
      },
    }
  },
}
</script>
