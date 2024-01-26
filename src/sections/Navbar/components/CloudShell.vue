<template>
  <div>
    <div class="trigger d-flex align-items-center justify-content-center h-100" @click="toggle">
      <a-tooltip title="CloudShell" placement="right">
        <icon type="cloudshell" class="cloudsheel-icon" />
      </a-tooltip>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'

export default {
  name: 'CloudShell',
  data () {
    return {}
  },
  computed: {
    ...mapState('common', {
      openCloudShell: state => state.openCloudShell,
    }),
  },
  methods: {
    toggle () {
      this.$store.commit('common/SET_OPEN_CLOUDSHELL', !this.openCloudShell)
    },
  },
}
</script>

<style lang="scss" scoped>
.trigger {
  cursor: pointer;
}
.cloudsheel-icon {
  font-size: 22px;
}
</style>
