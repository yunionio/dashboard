<template>
  <div class="res-container d-flex justify-content-center">
    <div class="res res-ipsubnet" style="transform: translateY(-52%)">
      <a-tooltip placement="top" :get-popup-container="getPopupContainer">
        <template slot="title">
          <p class="title">{{ $t('scope.text_101') }}</p>
          <p>{{ $t('common.name') }}：{{ dataSource.name }}</p>
          <p>{{ $t('common.status') }}：{{ $t('status.blockstorage.' + dataSource.status) }}</p>
        </template>
        <icon type="res-blockstorage" />
        <span class="name text-truncate">{{ dataSource.name }}</span>
      </a-tooltip>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ResShareStorage',
  props: {
    dataSource: Object,
  },
  data () {
    return {}
  },
}
</script>
