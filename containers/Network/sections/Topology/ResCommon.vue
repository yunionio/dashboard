<template>
  <div class="res-container d-flex justify-content-center align-items-center" :class="{'is-exist': isExist, 'res-container-host': showSchedTag}">
    <span class="line" :class="{'full': multiple}" />
    <div class="res d-flex" :class="{'res-host': showSchedTag}">
      <a-tooltip placement="top" :get-popup-container="getPopupContainer">
        <template slot="title">
          <p class="title">{{ $t('network.topology.res_type.' + getType(resSource)) }}</p>
          <p>{{ $t('common.name') }}：{{ getName(resSource) }}</p>
          <p>{{ $t('common.status') }}：{{ getStatus(resSource) }}</p>
          <template v-if="type === 'vminstance'">
            <p>{{ $t('network.waf.rule_ip') }}：{{ resSource.ip_addr }}</p>
          </template>
          <template v-else-if="type === 'lb'">
            <p>{{ $t('network.text_248') }}：{{ resSource.ip_addr }}</p>
          </template>
          <template v-else-if="type === 'host'">
            <p v-for="(obj, idx) in resSource.networks" :key="idx">{{ $t('network.waf.rule_ip') }}：{{ obj.ip_addr }}</p>
          </template>
          <template v-else-if="type === 'baremetal'">
            <p v-for="(obj, idx) in resSource.networks" :key="idx">{{ $t('network.waf.rule_ip') }}：{{ obj.ip_addr }}</p>
          </template>
          <template v-if="showSchedTag && resSchedTags.length">
            <p>{{ $t('dictionary.schedtag') }}：</p>
            <div class="tag-list d-flex align-items-center flex-wrap">
              <template v-for="(item,index) in resSchedTags">
                <div class="tag" :key="index" :style="{background: item.background}">{{item.name}}</div>
              </template>
            </div>
          </template>
        </template>
        <div class="d-flex">
          <icon v-if="!showSchedTag" :type="iconType" />
          <div v-else class="res-box">
            <icon :type="iconType" class="mt-2 mb-1" style="border:none;font-size:40px" />
            <div class="tag-list tag-list-limit d-flex align-items-center flex-wrap justify-content-center">
              <template v-for="(item,index) in resSchedTags">
                <div class="tag" :key="index" :style="{background: item.background}" v-if="index<2">{{item.name}}</div>
              </template>
            </div>
          </div>
          <div class="d-flex align-items-center">
            <span class="name text-truncate ml-1 pt-2">{{ getName(resSource) }}</span>
          </div>
        </div>
      </a-tooltip>
    </div>
  </div>
</template>

<script>
import ResMixin from '@Network/sections/Topology/ResMixin'
import { STATUS_MAP } from './constants'

export default {
  name: 'ResCommon',
  mixins: [ResMixin],
  props: {
    dataSource: Object,
    multiple: Boolean,
    type: String,
    isExist: Boolean,
    schedTagColorsMap: Object,
  },
  data () {
    return {}
  },
  computed: {
    showSchedTag () {
      return this.type === 'host' || this.type === 'baremetal'
    },
    iconType () {
      return `res-${this.type}`
    },
    resSource () {
      return this.dataSource || {}
    },
    resSchedTags () {
      const tags = []
      const { schedtags = [] } = this.resSource
      schedtags.map((item, index) => {
        const tag = {
          name: item.name,
          background: '#ccc',
        }
        if (this.schedTagColorsMap && this.schedTagColorsMap[item.name]) {
          tag.background = this.schedTagColorsMap[item.name]
        }
        tags.push(tag)
      })
      tags.sort((a, b) => {
        return a.name.length - b.name.length
      })
      return tags
    },
  },
  methods: {
    getStatus ({ status, owner_status }) {
      if (!status && !owner_status) return this.$t('common.text00001')
      return this.$t(`status.${STATUS_MAP[this.type] || this.type}.${status || owner_status}`)
    },
    getName ({ owner, name }) {
      return owner || name
    },
    getType ({ owner_type, host_type }) {
      return owner_type || host_type
    },
  },
}
</script>

<style lang="scss" scoped>
// @import "@Network/sections/Topology/index.scss";
</style>
