<template>
  <a-form-item>
    <base-select
      v-decorator="decorators.storage"
      filterable
      resource="storages"
      :params="storageParams" />
  </a-form-item>
</template>

<script>
export default {
  name: 'DiskStorageSelect',
  props: {
    decorators: {
      type: Object,
      validator: val => val.storage,
    },
    storageParams: {
      type: Object,
      default: () => ({}),
    },
  },
}
</script>

<style>

</style>
