<template>
  <a-result status="404" title="404" :subTitle="$t('common_343')">
    <template v-slot:extra>
      <a-button type="primary">
        <auto-router-link :text="$t('common_342')" />
      </a-button>
    </template>
  </a-result>
</template>
<script>
import AutoRouterLink from './components/AutoRouterLink'

export default {
  name: '403',
  components: {
    AutoRouterLink,
  },
}
</script>
