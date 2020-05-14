<template>
  <div>
    <div class="d-flex align-items-center">
      <refresh-button :loading="loading" :disabled="loading" class="mr-3" @refresh="fetchData" />
      <a-tabs v-model="currentTab">
        <a-tab-pane :key="item.id" v-for="item in searchMapsObj" :disabled="item.resData.status && item.resData.status !== 200">
          <span slot="tab" :class="{ 'text-color-help': getTotal(item) === 0 }">{{ item.label }}({{ getTotal(item) }})</span>
        </a-tab-pane>
      </a-tabs>
    </div>
    <div v-if="loading || !currentTab">
      <loader :loading="loading" />
    </div>
    <div v-else>
      <page-header :title="currentTabMsg.label" />
      <page-body>
        <components
          :is="currentTabMsg.component"
          :response-data="currentTabMsg.resData.data || {}"
          :show-group-actions="false"
          :show-searchbox="false" />
      </page-body>
    </div>
  </div>
</template>

<script>
import * as R from 'ramda'
import _ from 'lodash'
import qs from 'qs'
import VmInstanceList from '@Compute/views/vminstance/components/List'
import BaremetalList from '@Compute/views/baremetal/components/List'
import ImageList from '@Compute/views/image/components/List'
import HostImageList from '@Compute/views/host-image/components/List'
import DiskList from '@Compute/views/disk/components/List'
import VmInstanceSnapshotsIndex from '@Compute/views/snapshot-instance'
import VmDiskSnapshotsIndex from '@Compute/views/snapshot'
import SecgroupList from '@Compute/views/secgroup/components/List'
import EipList from '@Network/views/eip/components/List'
import NetworkList from '@Network/views/network/components/List'
import HostList from '@Compute/views/host/components/List'
import PhysicalmachineList from '@Compute/views/physicalmachine/components/List'
import RDSList from '@DB/views/rds/components/List'
import RedisList from '@DB/views/redis/components/List'
import ServerRecoveryList from '@Compute/views/server-recovery/components/List'
import DiskRecoveryList from '@Compute/views/disk-recovery/components/List'
import ImageRecoveryList from '@Compute/views/image-recovery/components/List'
import { getSearchMaps } from '@/constants/globalSearch'
import RefreshButton from '@/components/PageList/RefreshButton'

export default {
  name: 'GlobalSearchResult',
  components: {
    VmInstanceList,
    BaremetalList,
    ImageList,
    HostImageList,
    DiskList,
    VmInstanceSnapshotsIndex,
    VmDiskSnapshotsIndex,
    SecgroupList,
    EipList,
    NetworkList,
    HostList,
    PhysicalmachineList,
    RDSList,
    RedisList,
    ServerRecoveryList,
    DiskRecoveryList,
    ImageRecoveryList,
    RefreshButton,
  },
  data () {
    const maps = getSearchMaps()
    const query = window.location.search.replace('?', '')
    const searchRes = qs.parse(query)
    const searchType = Object.keys(searchRes)
    return {
      searchMaps: maps,
      currentTab: '',
      loading: false,
      searchRes,
      searchType,
    }
  },
  computed: {
    currentTabMsg () {
      return this.searchMaps[this.currentTab]
    },
    searchMapsObj () {
      return R.filter((value, key) => {
        const listData = _.get(value, 'resData.data.data')
        return listData && listData.length
      }, this.searchMaps)
    },
  },
  watch: {
    '$route.query' () {
      const query = window.location.search.replace('?', '')
      this.searchRes = qs.parse(query)
      if (!R.isEmpty(this.searchRes)) this.fetchData()
    },
  },
  created () {
    this.searchMaps = getSearchMaps()
    if (!R.isEmpty(this.searchRes)) this.fetchData()
  },
  methods: {
    getTotal (item) {
      let total = 0
      if (R.is(Object, item.resData.data)) {
        if (item.resData.data.total) {
          total = item.resData.data.total
        }
      }
      return total
    },
    setValidTab () {
      // 找到第一个有值的tab
      const searchMapList = Object.values(this.searchMaps).map(v => v.resData)
      const firstValidTab = searchMapList.find(val => val.status === 200 && val.data && val.data.data && val.data.data.length)
      if (firstValidTab) {
        this.setCurrentTab(firstValidTab.id)
      } else {
        this.setCurrentTab(null)
      }
    },
    setCurrentTab (key) {
      this.currentTab = key
    },
    async fetchData () {
      try {
        // 根据请求类型过滤
        const maps = getSearchMaps(this.searchRes)
        // 组装成数组
        const paramsList = Object.values(maps)
          .map(val => ({
            ...val,
            params: val.params,
          }))
        const data = { data: paramsList }
        this.loading = true
        const { data: { data: resData } } = await new this.$Manager('multi-search', 'v1').create({ data })
        this.loading = false
        this.searchMaps = maps
        resData.forEach(dataWrap => {
          if (this.searchMaps[dataWrap.id]) {
            this.searchMaps[dataWrap.id].resData = dataWrap
          }
        })
        this.setValidTab()
      } catch (error) {
        this.loading = false
        throw error
      }
    },
  },
}
</script>
