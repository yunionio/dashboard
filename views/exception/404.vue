<template>
  <a-result status="404" title="404" :subTitle="$t('common_343')">
    <template v-slot:extra>
      <a-button type="primary">
        <router-link to="/">{{$t('common_342')}}</router-link>
      </a-button>
    </template>
  </a-result>
</template>
