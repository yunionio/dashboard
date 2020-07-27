<template>
  <a-result status="403" title="403" :subTitle="$t('common_341')">
    <template v-slot:extra>
      <a-button type="primary">
        <router-link to="/">{{$t('common_342')}}</router-link>
      </a-button>
    </template>
  </a-result>
</template>
