<template>
  <a-form-item>
    <base-select
      v-decorator="decorators.storage"
      filterable
      resource="storages"
      :mapper="mapper"
      @change="change"
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
      required: true,
    },
    form: {
      type: Object,
      validator: val => !val || val.fc, // 不传 或者 传就有fc
    },
  },
  data () {
    return {
      storageCache: undefined,
    }
  },
  methods: {
    change (v) {
      if (v) this.storageCache = v // 只缓存有值的时候
    },
    mapper (list) {
      if (this.form && this.form.fc) {
        if (this.storageCache && list.length) {
          const hasCache = list.some(val => val.id === this.storageCache)
          if (hasCache) { // 如果新的list存在缓存值的话，取缓存值
            this.form.fc.setFieldsValue({
              [this.decorators.storage[0]]: this.storageCache,
            })
          }
        }
      }
      return list
    },
  },
}
</script>

<style>

</style>
