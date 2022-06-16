<template>
  <div>
    <a-card class="mb-2 card" v-for="(item, i) in serverConfigList" :key="item.key">
      <a-button v-if="i !== 0" @click="decrease(item.key, i)" type="link" size="small" class="error-color position-absolute" style="right: 10px; top: 10px;">{{ $t('common.delete') }}</a-button>
      <slot name="hypervisor" :formItemLayout="formItemLayout" :i="item.key" />
      <!-- <a-form-item label="CPU" v-bind="formItemLayout">
        <a-input-number v-decorator="decorator.vcpu_count(item.key)" :formatter="value => $t('k8s.text_119', [value])" :parser="v => parser(v, $t('k8s.text_100'))" :min="4" :max="32" />
      </a-form-item>
      <a-form-item :label="$t('k8s.text_101')" v-bind="formItemLayout">
        <a-input-number v-decorator="decorator.vmem_size(item.key)" :formatter="value => `${value}G`" :parser="v => parser(v, 'G')" :min="1" :max="128" />
      </a-form-item> -->
      <!-- <a-form-item :label="$t('network.text_24')" v-bind="formItemLayout">
        <a-select
          v-decorator="decorator.zone(item.key)"
          :placeholder="$t('network.text_287')"
          @change="handleZoneChanage(i, $event)">
          <a-select-option
            v-for="zone in getZones(i)"
            :key="zone.id"
            :value="zone.id">{{zone.name}}</a-select-option>
        </a-select>
      </a-form-item>-->
      <a-form-item :label="$t('k8s.text_121')" v-bind="formItemLayout" required>
        <a-row :gutter="8">
          <a-col :span="24">
            <a-form-item
              :wrapperCol="{ span: 24 }"
              style="min-width: 200px;"
              class="w-100 mb-0 mr-1">
              <base-select
                class="w-100"
                v-decorator="decorator.network(item.key)"
                resource="networks"
                remote
                is-default-select
                @change="handleNetworkChange(i, $event)"
                :item.sync="item.network"
                :need-params="true"
                :params="getNetworkParams(item.key)"
                :mapper="networkResourceMapper"
                :labelFormat="networkLabelFormat"
                :select-props="{ allowClear: true, placeholder: $t('k8s.text_122') }" />
            </a-form-item>
          </a-col>
          <!--<a-col :span="10" v-if="item.ipShow">
            <a-form-item class="mb-0 mr-2" :wrapperCol="{ span: 24 }">
              <a-input
                :placeholder="$t('k8s.text_123')"
                @change="e => ipChange(e, i)"
                v-decorator="decorator.ip(item.key, item.network)" />
            </a-form-item>
          </a-col>
          <a-col :span="2">
            <a-button v-if="item.ipShow" type="link" class="mr-1 mt-1" @click="hideIp(item)">{{$t('k8s.text_410')}}</a-button>
            <a-button v-else type="link" class="mr-1 mt-1" @click="showIp(item)">{{$t('k8s.text_124')}}</a-button>
          </a-col>-->
        </a-row>
      </a-form-item>
      <a-form-item>
        <sku
          v-decorator="decorator.sku(item.key)"
          @change="handleSkuChange(i, $event)"
          :hypervisor="hypervisor"
          :sku-params="skuParam(i)" />
        </a-form-item>
      <a-form-item :label="$t('compute.text_267')" v-bind="formItemLayout" class="mb-0" v-if="useImage">
        <image-select
          :decorator="decorator.imageOS(item.key)"
          :cloudType="platform"
          :imageType="getImageType()"
          :form="form"
          :imageParams="getImageParams()"
          :cacheImageParams="getCacheImageParams()" />
      </a-form-item>
      <a-form-item :label="$t('k8s.text_120')" v-bind="formItemLayout" class="mb-0">
        <system-disk
          :decorator="decorator.disk(item.key)"
          :type="platform"
          :form="form"
          :image="imageMock"
          :hypervisor="hypervisor"
          :capability-data="getCapability(i)"
          :sku="getSku(i)"
          :domain="userInfo.projectDomainId" />
      </a-form-item>

      <a-form-item :label="$t('dictionary.role')" v-bind="formItemLayout">
        <a-radio-group
          v-decorator="decorator.role(item.key)">
          <a-radio-button v-for="role in roleList" :key="role.value" :value="role.value">
            {{ role.label}}
          </a-radio-button>
        </a-radio-group>
      </a-form-item>

      <a-form-item :label="$t('k8s.text_125')" v-bind="formItemLayout" :extra="$t('k8s.text_126')">
        <a-input-number v-decorator="decorator.num(item.key)" :min="1" :max="item.ipShow ? 1 : 10"  :parser="v => parser(v, '', '1')" />
      </a-form-item>
    </a-card>
    <div class="d-flex align-items-center" v-if="serverConfigRemaining > 0">
      <a-button type="primary" shape="circle" icon="plus" size="small" @click="add" />
      <a-button type="link" @click="add">{{$t('k8s.text_127')}}</a-button>
      <span class="network-count-tips">{{$t('k8s.text_128')}}<span class="remain-num">{{ serverConfigRemaining }}</span>{{$t('k8s.text_129')}}</span>
    </div>
  </div>
</template>

<script>
import * as R from 'ramda'
import { mapGetters } from 'vuex'
import { NODE_ROLE_MAP } from '../../views/cluster/constants'
import { IMAGES_TYPE_MAP } from '@/constants/compute'
import { HYPERVISORS_MAP } from '@/constants'
import { uuid } from '@/utils/utils'
import SystemDisk from '@Compute/views/vminstance/create/components/SystemDisk'
import Sku from '@Compute/sections/SKU'
import ImageSelect from '@Compute/sections/OsSelect/ImageSelect'

export default {
  name: 'K8SClusterServerConfig',
  components: {
    SystemDisk,
    Sku,
    ImageSelect,
  },
  props: {
    decorator: {
      type: Object,
      required: true,
    },
    form: {
      type: Object,
      validator: val => val.fc,
    },
    cloudregionId: {
      type: String,
      required: true,
    },
    hypervisor: {
      type: String,
      required: true,
    },
    platform: {
      type: String,
      required: true,
    },
    networkParams: {
      type: Object,
      required: true,
    },
  },
  data () {
    const roleList = []
    R.forEachObjIndexed((value, key) => {
      roleList.push({ label: value, value: key })
    }, NODE_ROLE_MAP)
    return {
      imageMock: { min_disk: 40960 }, // 通过mock image数据设置最小磁盘大小
      formItemLayout: {
        wrapperCol: { span: 20 },
        labelCol: { span: 3 },
      },
      serverConfigList: [],
      limit: 10,
      roleList,
    }
  },
  computed: {
    ...mapGetters(['isAdminMode', 'scope', 'isDomainMode', 'userInfo', 'l3PermissionEnable']),
    useImage () {
      const hypervisor = this.$props.hypervisor
      if (hypervisor === HYPERVISORS_MAP.kvm.key || hypervisor === HYPERVISORS_MAP.cloudpods.key) {
        return true
      }
      return false
    },
    serverConfigRemaining () {
      return this.limit - this.serverConfigList.length
    },
  },
  watch: {
    hypervisor: {
      handler (val, oldVal) {
        console.log(`hypervisor change: ${val}`)
      },
    },
  },
  created () {
    this.add()
  },
  methods: {
    showIp (item) {
      item.ipShow = true
    },
    hideIp (item) {
      item.ipShow = false
    },
    ipChange (e, i) {
      this.serverConfigList[i].ip = e.target.value
    },
    decrease (uid, index) {
      this.serverConfigList.splice(index, 1)
    },
    networkLabelFormat (net) {
      return ( // IP子网
        <div>
          <span>{ net.name } ({ net.guest_ip_start } - { net.guest_ip_end }, zone={ net.zone })</span>
        </div>
      )
    },
    add () {
      const uid = uuid()
      const data = {
        ipShow: false,
        key: uid,
      }
      this.serverConfigList.push(data)
      this.$nextTick(() => {
        this.$emit('vmAdd', data)
      })
    },
    parser (val, unit, defaultValue = '4') {
      const value = val.replace(unit, '')
      const valueNum = Number(value)
      if (!Number.isNaN(valueNum) && R.is(Number, valueNum)) {
        return value
      }
      return defaultValue
    },
    networkResourceMapper (list) {
      return list
        .map(val => {
          const remain = val.ports - val.ports_used
          if (remain <= 0) {
            return {
              ...val,
              __disabled: true,
            }
          }
          return val
        })
        .sort((a, b) => (b.ports - b.ports_used) - (a.ports - a.ports_used))
    },
    getNetworkParams (key) {
      return {
        ...this.networkParams,
        $t: key,
      }
    },
    getConfig (index) {
      return this.serverConfigList[index]
    },
    setConfig (index, setFunc) {
      let conf = this.getConfig(index)
      conf = setFunc(conf)
      this.$set(this.serverConfigList, index, conf)
    },
    getCurrentNetwork (index) {
      return this.getConfig(index).network
    },
    getCurrentZone (index) {
      const curNet = this.getCurrentNetwork(index)
      if (curNet && curNet.zone_id) {
        return curNet.zone_id
      }
      return null
    },
    skuParam (index) {
      const filters = []
      filters.push('cpu_core_count.gt(1)')
      filters.push('memory_size_mb.gt(4095)')
      const orderBy = []
      orderBy.push('memory_size_mb')
      const param = {
        limit: 0,
        enabled: true,
        usable: true,
        filter: filters,
        order_by: orderBy,
        order: 'asc',
        cloudregion: this.cloudregionId,
        ...this.scopeParams,
      }
      const curZone = this.getCurrentZone(index)
      if (curZone) {
        param.zone = curZone
      }
      return param
    },
    handleNetworkChange (index, networkId) {
      this.fetchCapability(index)
    },
    handleSkuChange (index, sku) {
      this.setConfig(index, (conf) => {
        conf.sku = sku
        console.log(`set config(${index}) sku to ${sku.name}`)
        return conf
      })
    },
    getSku (index) {
      return this.getConfig(index).sku
    },
    fetchCapability (index) {
      const params = {
        show_emulated: true,
        resource_type: 'shared',
        scope: this.scope,
      }
      let id = this.getCurrentZone(index)
      let res = 'zones'
      if (!id) {
        id = this.cloudregionId
        res = 'cloudregions'
      }
      const capabilityParams = { id, spec: 'capability', params }
      this.capabilityParams = capabilityParams
      new this.$Manager(res).getSpecific(this.capabilityParams)
        .then(({ data }) => {
          this.setConfig(index, (conf) => {
            conf.capability = data
            /* console.log(`set config(${index}) capability to ${JSON.stringify(data)}`) */
            return conf
          })
        })
    },
    getCapability (index) {
      return this.getConfig(index).capability
    },
    isPublicCloud () {
      return this.platform === 'public'
    },
    isOnPremise () {
      return this.platform === 'idc'
    },
    getImageType () {
      if (this.isPublicCloud()) {
        return IMAGES_TYPE_MAP.public.key
      }
      if (this.isOnPremise()) {
        return IMAGES_TYPE_MAP.standard.key
      }
      throw Error(`Not support platform ${this.platform}`)
    },
    getImageParams () {
      return {
        distributions: ['centos'],
      }
    },
    getCacheImageParams () {
      if (!this.isPublicCloud()) {
        return {}
      }
      return {
        public_cloud: true,
        region: this.cloudregionId,
      }
    },
    /*
     * getImageIgnoreOptions () {
     *   const opts = [
     *     IMAGES_TYPE_MAP.private,
     *     IMAGES_TYPE_MAP.customize,
     *     IMAGES_TYPE_MAP.iso,
     *     IMAGES_TYPE_MAP.snapshot,
     *     IMAGES_TYPE_MAP.host,
     *   ]
     *   return opts.map(item => item.key)
     * },
     */
  },
}
</script>
