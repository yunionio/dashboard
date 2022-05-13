<template>
  <a-form-item :wrapperCol="{ span: 24 }" style="flex: 1;" class="mb-0 mr-1 network-item">
    <base-select
      class="w-100"
      v-decorator="decorators.storage"
      filterable
      resource="storages"
      @change="change"
      :params="{ ...storageParams, $t: diskKey }"
      :options="options" />
  </a-form-item>
</template>

<script>
import * as R from 'ramda'

export default {
  name: 'DiskStorageSelect',
  props: {
    diskKey: String,
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
      opts: [],
      options: [],
    }
  },
  computed: {
    diskSizeParams () {
      const { systemDiskStorage = '', systemDiskSize = 0, dataDiskSizes = {} } = this.form.fd
      const ret = {
        systemDiskStorage,
        systemDiskSize,
        dataDiskSizes,
      }
      if (this.diskKey !== 'system' && this.form.fd.hasOwnProperty(`dataDiskStorages[${this.diskKey}]`)) {
        ret.currentDiskStorage = this.form.fd[`dataDiskStorages[${this.diskKey}]`]
      }
      return ret
    },
  },
  watch: {
    storageParams: {
      handler: function (val, oldVal) {
        if (!R.equals(val, oldVal)) {
          this.fetchData()
        }
      },
      immediate: true,
    },
    diskSizeParams: {
      handler: function (val, oldVal) {
        if (!R.equals(val, oldVal)) {
          this.filterOptions()
        }
      },
      deep: true,
    },
  },
  created () {
    this.$s = new this.$Manager('storages', 'v1')
  },
  methods: {
    change (v) {
      if (v) this.storageCache = v // 只缓存有值的时候
    },
    async fetchData () {
      try {
        const { data } = await new this.$Manager('storages', 'v1').list({ params: { ...this.storageParams, $t: this.diskKey } })
        const list = R.type(data) === 'Array' ? data : (R.type(data) === 'Object' && (data.data || []))
        this.opts = list
        this.$nextTick(() => {
          this.filterOptions()
        })
      } catch (err) {
        console.error(err)
      }
    },
    filterOptions () {
      let filterdList = R.clone(this.opts)
      if (this.diskKey && this.form && this.form.fd) {
        // 获取所有已选存储的storeageId和选择这块存储的diskSize
        const { systemDiskStorage = '', systemDiskSize = 0, dataDiskSizes = {} } = this.form.fd
        const s_d_map = {}
        if (systemDiskStorage && this.diskKey !== 'system') {
          s_d_map[systemDiskStorage] = systemDiskSize
        }
        for (const key in dataDiskSizes) {
          const decoratorKey = this.form.fd[`dataDiskStorages[${key}]`]
          if (decoratorKey && key !== this.diskKey) { // 当前数据盘外的其他数据盘
            if (!s_d_map[decoratorKey]) {
              s_d_map[decoratorKey] = dataDiskSizes[key]
            } else {
              s_d_map[decoratorKey] += dataDiskSizes[key]
            }
          }
        }
        // 当前磁盘大小
        const currentDiskSize = this.diskKey === 'system' ? systemDiskSize : dataDiskSizes[this.diskKey]
        // 保留 （容量 - 已经选用此块存储的磁盘大小 > 当前磁盘大小） 的块存储
        filterdList = filterdList.filter(storage => {
          let needSize = currentDiskSize
          if (s_d_map[storage.id]) {
            needSize += s_d_map[storage.id]
          }
          return storage.free_capacity > needSize * 1024
        })
      }

      if (this.form && this.form.fc) {
        if (this.storageCache) {
          const hasCache = filterdList.some(val => val.id === this.storageCache)
          // if (hasCache) { // 如果新的list存在缓存值的话，取缓存值
          this.form.fc.setFieldsValue({
            [this.decorators.storage[0]]: hasCache ? this.storageCache : '',
          })
          // }
        }
      }
      this.options = filterdList
    },
  },
}
</script>

<style>

</style>
