<template>
  <a-result status="500" title="500" :subTitle="$t('common_344')">
    <template v-slot:extra>
      <a-button type="primary">
        <router-link to="/">{{$t('common_342')}}</router-link>
      </a-button>
    </template>
  </a-result>
</template>
