<template>
  <quota :tenant="tenant" scene="tenant" />
</template>

<script>
import Quota from '@IAM/sections/Quota'
import WindowsMixin from '@/mixins/windows'

export default {
  components: {
    Quota,
  },
  mixins: [WindowsMixin],
  props: {
    resId: String,
  },
  data () {
    return {
      tenant: this.resId,
    }
  },
}
</script>
