<template>
  <div>
    <a-button class="mb-2" @click="hanleCreate" type="primary">新建共享存储</a-button>
    <ceph-list :list="lists.rbd" :manager="manager" :refresh="queryStorageList" />
    <nfc-list :list="lists.nfs" :manager="manager" :refresh="queryStorageList" />
  </div>
</template>

<script>
import CephList from './ShareStorageCeph'
import NfcList from './ShareStorageNFC'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'GuideShareStorageList',
  components: {
    CephList,
    NfcList,
  },
  mixins: [WindowsMixin],
  data () {
    return {
      lists: {
        'rbd': [],
        'nfs': [],
      },
    }
  },
  created () {
    this.manager = new this.$Manager('storages')
    this.queryStorageList()
  },
  methods: {
    hanleCreate () {
      this.createDialog('BlockStorageCreateDialog', {
        title: '新建共享存储',
        storageTypes: ['rbd', 'nfs'],
        refresh: this.queryStorageList,
      })
    },
    async queryStorageList () {
      this.lists['rbd'] = []
      this.lists['nfs'] = []
      try {
        const { data } = await this.manager.list({
          params: {
            filter: 'storage_type.contains("rbd", "nfs")',
            limit: 0,
          },
        })
        if (data && data.data && data.data.length > 0) {
          const list = data.data
          list.forEach(item => {
            this.lists[item.storage_type].push(item)
          })
        }
      } catch (err) {
        throw err
      }
    },
  },
}
</script>
