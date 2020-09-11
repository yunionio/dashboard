<template>
  <a @click="open"><a-icon style="font-size: 18px" type="tool" /></a>
</template>

<script>
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'BucketAccessInfo',
  mixins: [DialogMixin, WindowsMixin],
  props: {
    row: {
      type: Object,
    },
  },
  methods: {
    open (v) {
      this.createDialog('BucketAccessInfoDialog', {
        data: [this.row],
      })
    },
  },
}
</script>
