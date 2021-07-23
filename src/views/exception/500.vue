<template>
  <a-result status="500" title="500" :subTitle="$t('common_344')">
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
