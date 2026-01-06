<template>
  <div>
    <a-tabs v-model="currentTab">
      <a-tab-pane :key="item.id" v-for="item in searchMapsObj" :disabled="item.resData.status && item.resData.status !== 200">
        <span slot="tab" :class="{ 'text-color-help': getTotal(item) === 0 }">{{ item.label }}({{ getTotal(item) }})</span>
      </a-tab-pane>
    </a-tabs>
    <div v-if="!currentTab">
      <loader :loading="loading" />
    </div>
    <div v-else>
      <page-header :title="currentTabMsg.label" />
      <page-body>
        <components
          :id="currentTabMsg.component"
          :is="currentTabMsg.component"
          :get-params="currentTabParams"
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
import GpuList from '@Compute/views/gpu/components/List'
import IDPList from '@IAM/views/idp/components/List'
import DomainList from '@IAM/views/domains/components/List'
import ProjectList from '@IAM/views/projects/components/List'
import UserList from '@IAM/views/user/components/List'
import GroupList from '@IAM/views/group/components/List'
import RoleList from '@IAM/views/role/components/List'
import PolicyList from '@IAM/views/policy/components/List'
import VmInstanceList from '@Compute/views/vminstance/components/List'
import ServertemplateList from '@Compute/views/servertemplate/components/List'
import BaremetalList from '@Compute/views/baremetal/components/List'
import ImageList from '@Compute/views/image/components/List'
import HostImageList from '@Compute/views/host-image/components/List'
import DiskList from '@Compute/views/disk/components/List'
import InstanceSnapshotList from '@Compute/views/snapshot-instance/components/List'
import SnapshotList from '@Compute/views/snapshot/components/List'
import SnapshotPolicyList from '@Compute/views/snapshotpolicy/components/List'
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
import VPCList from '@Network/views/vpc/components/List'
import BlockStorageList from '@Storage/views/blockstorage/components/List'
import BucketStorageList from '@Storage/views/bucket/components/List'
import NatList from '@Network/views/nats/components/List'
import DnsZoneList from '@Network/views/dns-zone/components/List'
import DnsRecordSetList from '@Network/views/dns-recordset/components/List'
import LbList from '@Network/views/lb/components/List'
import LbaclsList from '@Network/views/lbacls/components/List'
import LbcertList from '@Network/views/lbcerts/components/List'
import RouteTableList from '@Network/views/route-table/components/List'
import CloudaccountList from '@Cloudenv/views/cloudaccount/components/List'
import VpcPeerConnectList from '@Network/views/vpc-peer-connect/components/List'
import VpcNetworkList from '@Network/views/vpc-network/components/List'
import MongoDBList from '@DB/views/mongodb/components/List'
import KafkaList from '@Middleware/views/kafka/components/List'
import ElasticSearchList from '@Middleware/views/elasticsearch/components/List'
import CdnDomainList from '@Network/views/cdn/components/List'
import WafList from '@Network/views/waf/components/List'
import FileSystemList from '@Storage/views/file-system/components/List'
import VmContainerInstanceList from '@Compute/views/vminstance-container/components/List'
import { getSearchMaps } from '@/constants/globalSearch'
import DeadlyResourceList from '@Compute/views/deadly-resource/components/List'

export default {
  name: 'GlobalSearchResult',
  components: {
    VmInstanceList,
    ServertemplateList,
    BaremetalList,
    ImageList,
    HostImageList,
    DiskList,
    SnapshotList,
    SnapshotPolicyList,
    InstanceSnapshotList,
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
    VPCList,
    BlockStorageList,
    BucketStorageList,
    IDPList,
    DomainList,
    ProjectList,
    UserList,
    GroupList,
    RoleList,
    PolicyList,
    NatList,
    DnsZoneList,
    DnsRecordSetList,
    LbList,
    LbaclsList,
    LbcertList,
    CloudaccountList,
    RouteTableList,
    VpcPeerConnectList,
    VpcNetworkList,
    MongoDBList,
    KafkaList,
    ElasticSearchList,
    CdnDomainList,
    WafList,
    FileSystemList,
    GpuList,
    VmContainerInstanceList,
    DeadlyResourceList,
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
    currentTabData () {
      return this.searchMaps[this.currentTab].resData.data || {}
    },
    currentTabParams () {
      return this.searchMaps[this.currentTab].params
    },
  },
  watch: {
    '$route.query' (val, oldV) {
      const query = window.location.search.replace('?', '')
      this.searchRes = qs.parse(query)
      if (!R.equals(val, oldV)) this.fetchData()
    },
  },
  created () {
    this.searchMaps = getSearchMaps()
    if (!R.isEmpty(this.searchRes)) this.fetchData()
    this.$bus.$on('GlobalSearch', () => {
      this.fetchData()
    }, this)
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
    clearData () {
      this.loading = false
      this.setCurrentTab(null)
      this.searchRes = {}
      this.searchMaps = {}
    },
    async fetchData () {
      try {
        // 根据请求类型过滤
        const maps = getSearchMaps(this.searchRes)
        if (R.isEmpty(this.searchRes)) {
          this.clearData()
          return
        }
        this.setCurrentTab(null)
        // 组装成数组
        const paramsList = Object.values(maps).filter(val => {
          // 绕过无权限和隐藏的页面
          return val.hasPermission && !this.$isScopedPolicyMenuHidden(`sub_hidden_menus.${val.menu_key}`)
        }).map(val => ({
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
