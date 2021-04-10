<template>
  <div class="p-4">
    <page-header :title="$t('common_345')" />
    <page-body>
      <me-process />
    </page-body>
  </div>
</template>

<script>
import * as R from 'ramda'
import { mapGetters } from 'vuex'
import MeProcess from '@/views/workflow/me-process/components/List'

export default {
  name: 'NoProjectMeProcess',
  components: {
    MeProcess,
  },
  computed: {
    ...mapGetters(['userInfo']),
  },
  watch: {
    userInfo: {
      handler (val = {}, oldVal = {}) {
        if (val.id !== oldVal.id) {
          if (!R.isNil(val.projects) && !R.isEmpty(val.projects)) {
            this.$router.push('/')
          }
        }
      },
      immediate: true,
    },
  },
}
</script>
