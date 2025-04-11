<template>
  <a-form-item :wrapperCol="{ span: 24 }" style="flex: 1;" class="mb-0 mr-1 network-item">
    <base-select
      class="w-100"
      v-decorator="decorators.storage"
      filterable
      resource="storages"
      @change="change"
      :params="{ ...storageParams, $t: diskKey }"
      :options="options"
      :dropdownMenuStyle="{ 'min-height': '20px' }">
      <template #optionLabelTemplate="{ item }">
        <div>
          <div class="d-flex">
            <span class="text-truncate flex-fill mr-2" :title="item.name">{{ item.name }}</span>
            <span style="color: #8492a6; font-size: 13px">{{ item.capacityLabel }}</span>
          </div>
          <div class="mt-1" v-if="item.statusErrors && item.statusErrors.length > 0">
            <a-tag color="red" v-for="(err, idx) in item.statusErrors" :key="idx">{{ err }}</a-tag>
          </div>
        </div>
      </template>
    </base-select>
  </a-form-item>
</template>

<script>
import * as R from 'ramda'
import { sizestr } from '@/utils/utils'

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
    storageHostParams: {
      type: Object,
      default: () => {
        return {}
      },
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
        storageHostParams: this.storageHostParams,
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
      if (v) {
        this.storageCache = v // 只缓存有值的时候
        const disk = this.options.filter(item => item.id === v)
        this.$emit('storageHostChange', {
          disk: this.diskKey,
          storageHosts: disk.length ? disk[0].hosts || [] : [],
        })
      } else {
        this.$emit('storageHostChange', {
          disk: this.diskKey,
          storageHosts: [],
        })
      }
    },
    async fetchData () {
      try {
        const { data } = await new this.$Manager('storages', 'v1').list({ params: { ...this.storageParams, $t: this.diskKey } })
        const list = R.type(data) === 'Array' ? data : (R.type(data) === 'Object' && (data.data || []))
        const opts = list.map((o, idx) => {
          const statusErrors = this.getStatusErrors(o)

          return {
            ...o,
            capacityLabel: this.getCapacityLabel(o),
            __disabled: statusErrors.length > 0,
            statusErrors,
            order: statusErrors.length > 0 ? -1 : idx,
            optClass: 'storage-option-item',
          }
        })
        opts.sort((a, b) => b.order - a.order)
        this.opts = opts
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
        const currentDiskSize = this.diskKey === 'system' ? systemDiskSize : (dataDiskSizes[this.diskKey] || this.form.fd[`dataDiskSizes[${this.diskKey}]`])
        // 当前系统盘块存储host
        const { storageHosts = [], disk } = this.storageHostParams
        // 保留 （容量 - 已经选用此块存储的磁盘大小 > 当前磁盘大小）&& 与系统盘相同host 的块存储
        filterdList = filterdList.filter(storage => {
          let needSize = currentDiskSize
          if (s_d_map[storage.id]) {
            needSize += s_d_map[storage.id]
          }
          if (storageHosts.length && disk && this.diskKey !== disk) {
            let has = false
            const { hosts = [] } = storage
            hosts.map(host => {
              if (storageHosts.some(item => item.id === host.id)) {
                has = true
              }
            })
            return has && storage.free_capacity > needSize * 1024
          }
          return storage.free_capacity > needSize * 1024
        })
      }

      if (this.form && this.form.fc) {
        if (this.storageCache) {
          const hasCache = filterdList.some(val => val.id === this.storageCache)
          if (hasCache) { // 如果新的list存在缓存值的话，取缓存值
            this.form.fc.setFieldsValue({
              [this.decorators.storage[0]]: this.storageCache,
            })
          }
        }
      }
      this.options = filterdList
    },
    getCapacityLabel (val) {
      const capacity = sizestr(val.capacity, 'M', 1024)
      const actual_capacity_used = val.actual_capacity_used ? sizestr(val.actual_capacity_used, 'M', 1024) : '-'
      const allocated = sizestr(val.used_capacity, 'M', 1024)

      return `${this.$t('storage.text_180', [capacity])} / ${this.$t('storage.text_181', [allocated])} / ${this.$t('storage.text_178', [actual_capacity_used])}`
    },
    getStatusErrors (val) {
      const statusErrors = []

      if (val.status !== 'online') {
        statusErrors.push(this.$t('compute.storage.check_status.status'))
      }
      if (!val.enabled) {
        statusErrors.push(this.$t('compute.storage.check_status.enabled'))
      }
      if (val.account_health_status && !['normal', 'no permission'].includes(val.account_health_status)) {
        statusErrors.push(this.$t('compute.storage.check_status.account_health_status'))
      }
      if (val.account_status && val.account_status !== 'connected') {
        statusErrors.push(this.$t('compute.storage.check_status.account_status'))
      }
      const isSomeHostOk = val.hosts?.some(item => {
        return item.host_status === 'online' && item.status === 'running'
      })
      if (!isSomeHostOk) {
        statusErrors.push(this.$t('compute.storage.check_status.host_status'))
      }
      return statusErrors
    },
  },
}
</script>

<style lang="scss">
.storage-option-item {
  min-height: 46px;
}
</style>
