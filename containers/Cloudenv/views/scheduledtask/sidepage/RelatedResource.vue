<template>
  <component :is="isRenderComponent" :data="data" :id="data.id" />
</template>

<script>
import RelatedResourceServer from './RelatedResourceServer'
import RelatedResourceTag from './RelatedResourceTag'

export default {
  name: 'RelatedResource',
  components: {
    RelatedResourceServer,
    RelatedResourceTag,
  },
  props: {
    resId: String,
    data: {
      type: Object,
      required: true,
    },
  },
  computed: {
    isRenderComponent () {
      if (this.data.label_type === 'id') {
        return 'related-resource-server'
      }
      return 'related-resource-tag'
    },
  },
}
</script>
