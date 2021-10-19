<template>
  <quota :domain="domain" scene="domain" />
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
      domain: this.resId,
    }
  },
}
</script>
