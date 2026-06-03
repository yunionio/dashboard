<template>
  <div />
</template>

<script>
export default {
  name: 'AppLlmImageRedirect',
  created () {
    // Backward-compat: old desktop/app image entrypoint.
    // Redirect to new Agent image list route.
    this.$router.replace({ path: '/agent-llm-image' })
  },
}
</script>
