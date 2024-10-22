<template>
  <div>
    <page-header :title="$t('compute.text_1100')" style="margin-bottom: 7px;" />
    <a-card :bordered="false" size="small">
      <template #title>
        <dialog-selected-tips :name="$t('compute.vminstance-container')" :count="params.data.length" :action="$t('compute.text_1100')" />
      </template>
      <dialog-table :data="params.data" :columns="columns" />
    </a-card>
    <page-body needMarginBottom>
      <div class="form-wrapper">
        <a-form
          v-bind="formItemLayout"
          :form="form.fc">
          <a-form-item :label="$t('compute.text_1058')" class="mb-0">
            <cpu-radio
              :decorator="decorators.vcpu"
              :options="form.fi.cpuMem.cpus || []"
              :disable-options="disableCpus"
              :disabled="runningArm"
              :extra="cpuExtra"
              :max="form.fd.vcpu < 32 ? 32 : 128"
              :form="form"
              :hypervisor="hypervisor"
              :showCpuSocketsInit="form.fi.showCpuSockets"
              :cpuSocketsInit="selectedItem.vcpu_count / selectedItem.cpu_sockets"
              :serverStatus="selectedItem.status"
              @change="cpuChange" />
          </a-form-item>
          <a-form-item :label="$t('compute.text_369')" class="mb-0">
            <mem-radio :decorator="decorators.vmem" :options="form.fi.cpuMem.mems_mb || []" :disable-options="disableMems" :disabled="runningArm" :extra="cpuExtra" />
          </a-form-item>
          <a-form-item :label="$t('compute.text_1041')" v-if="isOpenWorkflow">
            <a-input v-decorator="decorators.reason" :placeholder="$t('compute.text_1105')" />
          </a-form-item>
          <a-form-item :label="$t('compute.text_494')" :extra="$t('compute.text_1106')">
            <a-switch :checkedChildren="$t('compute.text_115')" :unCheckedChildren="$t('compute.text_116')" v-decorator="decorators.autoStart" :disabled="isSomeRunning" />
          </a-form-item>
        </a-form>
      </div>
    </page-body>
    <page-footer>
      <div slot="right">
        <div class="d-flex align-items-center">
          <div v-if="hasMeterService" class="mr-4 d-flex align-items-center">
            <div class="text-truncate">{{$t('compute.text_286')}}</div>
            <div class="ml-2 prices">
              <div class="hour error-color d-flex">
                <template v-if="price">
                  <m-animated-number :value="price" :formatValue="priceFormat" />
                  <discount-price class="ml-2 mini-text" :discount="discount" :origin="originPrice" />
                </template>
                <template v-else>---</template>
              </div>
              <div class="tips text-truncate">
                <span v-html="priceTips" />
              </div>
            </div>
          </div>
          <a-button class="mr-3" type="primary" @click="handleConfirm" :loading="loading">{{confirmText}}</a-button>
          <a-button @click="cancel">{{$t('compute.text_908')}}</a-button>
        </div>
      </div>
    </page-footer>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import * as R from 'ramda'
import _ from 'lodash'
import CpuRadio from '@Compute/sections/CpuRadio'
import MemRadio from '@Compute/sections/MemRadio'
import { SERVER_TYPE } from '@Compute/constants'
import { Manager } from '@/utils/manager'
import WindowsMixin from '@/mixins/windows'
import WorkflowMixin from '@/mixins/workflow'
import {
  getNameDescriptionTableColumn,
  getIpsTableColumn,
  getProjectTableColumn,
  getStatusTableColumn,
  getRegionTableColumn,
} from '@/utils/common/tableColumn'
import { findPlatform } from '@/utils/common/hypervisor'
import { sizestr } from '@/utils/utils'
import DiscountPrice from '@/sections/DiscountPrice'

export default {
  name: 'AdjustConfig',
  components: {
    CpuRadio,
    MemRadio,
    DiscountPrice,
  },
  mixins: [WindowsMixin, WorkflowMixin],
  props: {
    params: {
      type: Object,
    },
  },
  data () {
    const itemData = this.params.data[0]
    const autoStart = this.params.data.some(val => val.status === 'running')
    return {
      loading: false,
      action: this.$t('compute.text_1100'),
      form: {
        fc: this.$form.createForm(this, {
          onValuesChange: this.onValuesChange,
        }),
        fd: {
          vcpu: 2,
          vmem: 2048,
          hypervisor: itemData.hypervisor,
        },
        fi: {
          cpuMem: {}, // cpu 和 内存 的关联关系
          capability: {},
          imageMsg: {}, // 当前选中的 image
          showCpuSockets: false,
          cpuSockets: 1,
        },
      },
      beforeDataDisks: [],
      decorators: {
        vcpu: [
          'vcpu',
          {
            initialValue: itemData.vcpu_count,
          },
        ],
        vmem: [
          'vmem',
          {
            initialValue: itemData.vmem_size,
          },
        ],
        reason: [
          'reason',
          {
            initialValue: '',
          },
        ],
        autoStart: [
          'autoStart',
          {
            valuePropName: 'checked',
            initialValue: autoStart,
          },
        ],
      },
      formItemLayout: {
        wrapperCol: {
          span: 20,
          xxl: {
            span: 22,
          },
        },
        labelCol: {
          span: 4,
          xxl: {
            span: 2,
          },
        },
      },
      diskLoaded: false,
      domain: itemData.domain_id,
      cloudaccountId: itemData.account_id,
      origin_price: null,
      price: null,
      priceFormat: null,
      currency: '',
      priceTips: '--',
      discount: 0,
    }
  },
  computed: {
    ...mapGetters(['isAdminMode', 'scope', 'userInfo']),
    scopeParams () {
      if (this.$store.getters.isAdminMode) {
        return {
          project_domain: this.params.data[0].domain_id,
        }
      }
      return { scope: this.$store.getters.scope }
    },
    selectedItems () {
      return this.params.data
    },
    selectedItem () {
      return this.params.data[0]
    },
    count () {
      return this.selectedItems.length || 1
    },
    isSomeRunning () {
      return this.params.data.some(val => val.status === 'running')
    },
    isSomeArm () {
      return this.selectedItem.os_arch === 'arm'
    },
    runningArm () {
      return this.isSomeArm && this.isSomeRunning
    },
    hypervisor () {
      return this.selectedItem.hypervisor
    },
    type () {
      const brand = this.selectedItem.brand
      return findPlatform(brand)
    },
    disableCpus () {
      const cpu = this.selectedItem.vcpu_count
      const cpus = this.form.fi.cpuMem.cpus || []
      if (this.isSomeRunning && cpus.length > 0) {
        return cpus.filter((item) => { return item < cpu })
      }
      return []
    },
    disableMems () {
      const vmem = this.selectedItem.vmem_size
      const mems = this.form.fi.cpuMem.mems_mb || []
      if (this.isSomeRunning && mems.length > 0) {
        return mems.filter((item) => { return item < vmem })
      }
      return []
    },
    hasMeterService () { // 是否有计费的服务
      const { services } = this.$store.getters.userInfo
      const meterService = services.find(val => val.type === 'meter')
      if (meterService && meterService.status === true) {
        return true
      }
      return false
    },
    // 是否为包年包月
    isPackage () {
      return this.selectedItem.billing_type === 'prepaid'
    },
    durationNum () {
      if (this.isPackage) {
        const { duration } = this.form.fd
        let num = parseInt(duration)
        if (num && duration.endsWith('Y')) {
          num *= 12 // 1年=12月
        } else if (num && duration.endsWith('W')) {
          num *= 0.25 // 1周=0.25月
        }
        return num
      }
      return 0
    },
    confirmText () {
      return this.isOpenWorkflow ? this.$t('compute.text_288') : this.$t('compute.text_907')
    },
    cpuExtra () {
      if (this.runningArm) {
        return this.$t('compute.text_1366')
      }
      return null
    },
    memExtra () {
      if (this.runningArm) {
        return this.$t('compute.text_1367')
      }
      return null
    },
    isPublic () {
      return this.params.data[0].cloud_env === SERVER_TYPE.public
    },
    originPrice () {
      if (this.origin_price) {
        this.$emit('getOriginPrice', this.origin_price)
      }
      return this.origin_price
    },
    columns () {
      return [
        getNameDescriptionTableColumn({
          hideField: true,
          addLock: true,
          addBackup: true,
          edit: false,
          editDesc: false,
          slotCallback: row => {
            return (
              <side-page-trigger>{row.name}</side-page-trigger>
            )
          },
        }),
        getIpsTableColumn({ field: 'ip', title: 'IP' }),
        {
          field: 'instance_type',
          title: this.$t('compute.text_295'),
          showOverflow: 'ellipsis',
          minWidth: 120,
          sortable: true,
          slots: {
            default: ({ row }) => {
              const ret = []
              if (row.instance_type) {
                ret.push(<div class='text-truncate' style={{ color: '#0A1F44' }}>{row.instance_type}</div>)
              }
              const config = row.vcpu_count + 'C' + sizestr(row.vmem_size, 'M', 1024) + (row.disk ? sizestr(row.disk, 'M', 1024) : '')
              return ret.concat(<div class='text-truncate' style={{ color: '#53627C' }}>{config}</div>)
            },
          },
        },
        getStatusTableColumn({ statusModule: 'server' }),
        getProjectTableColumn(),
        getRegionTableColumn(),
      ]
    },
  },
  watch: {
    priceTips: {
      handler (val) {
        let ret = `${this.currency} ${this.price && this.price.toFixed(2)}`
        ret += !this.isPackage ? this.$t('compute.text_296') : ''
        this.$bus.$emit('VMGetPrice', `${ret} ${val}`)
      },
      immediate: true,
    },
    dataDiskType (val, oldV) {
      if (val !== oldV) {
        this.getPriceList()
      }
    },
  },
  created () {
    this.serversManager = new Manager('servers', 'v2')
    this.zonesM2 = new Manager('zones', 'v2')
    this.serverskusM = new Manager('serverskus')
    this.loadData(this.params.data)
    this.fetchInstanceSpecs()
  },
  beforeDestroy () {
    this.serversManager = null
    this.zonesM2 = null
    this.serverskusM = null
  },
  methods: {
    async loadData (data) {
      this.data = data
      if (this.data.length > 0) {
        try {
          const { data } = await this.capability(this.data[0].zone_id)
          this.form.fi.capability = data
        } catch (error) { }
      }
      const conf = this.maxConfig()
      this.form.fd.vcpu_count = conf[0]
      this.form.fd.vmem = Math.ceil(conf[1]) * 1024
      this.$nextTick(() => {
        this.form.fc.setFieldsValue({ vcpu: this.form.fd.vcpu_count, vmem: this.form.fd.vmem })
      })
    },
    maxConfig () {
      let cpu = 0
      let mem = 0

      for (let i = 0; i < this.data.length; i++) {
        if (cpu < this.data[i].vcpu_count) {
          cpu = this.data[i].vcpu_count
        }
        if (mem < this.data[i].vmem_size) {
          mem = this.data[i].vmem_size
        }
      }

      return [cpu, mem / 1024]
    },
    async doChangeSettingsSubmit (values) {
      const params = {
        vmem_size: values.vmem,
        vcpu_count: values.vcpu,
        auto_start: values.autoStart,
      }
      const ids = this.params.data.map(item => item.id)
      return this.serversManager.batchPerformAction({
        ids,
        steadyStatus: ['running', 'ready'],
        action: 'change-config',
        data: params,
      })
    },
    async handleConfirm () {
      this.loading = true
      try {
        const values = await this.form.fc.validateFields()
        const res = await this.doChangeSettingsSubmit(values)
        const isOk = res.data.data.every(item => item.status === 200)
        if (isOk) {
          this.$message.success(this.$t('compute.text_423'))
          this.$store.commit('keepAlive/ADD_DELAY_EVENT', { name: 'ResourceListSingleRefresh', params: this.data.map(item => item.id) })
          this.cancel()
        }
      } catch (error) {
        throw error
      } finally {
        this.loading = false
      }
    },
    cpuChange (cpu) {
      if (cpu) {
        if (R.is(Object, this.form.fi.cpuMem)) {
          const memOpts = _.get(this.form.fi, `cpuMem.cpu_mems_mb[${cpu}]`) || []
          this.form.fi.cpuMem.mems_mb = memOpts
          this.form.fc.setFieldsValue({
            vmem: Math.max(this.selectedItem.vmem_size, memOpts[0]),
          })
        }
      }
    },
    fetchInstanceSpecs () {
      const params = {
        usable: true,
        zone: this.selectedItem.zone_id,
        provider: this.selectedItem.provider,
      }
      this.serverskusM.get({ id: 'instance-specs', params })
        .then(({ data }) => {
          this.form.fi.cpuMem = data
          const vcpuDecorator = this.decorators.vcpu
          const vcpuInit = vcpuDecorator[1].initialValue
          this.cpuChange(vcpuInit)
        })
    },
    onValuesChange (props, values) {
      Object.keys(values).forEach((key) => {
        this.$set(this.form.fd, key, values[key])
      })
    },
    async capability (v) { // 可用区查询
      const params = {
        show_emulated: true,
      }
      if (this.isAdminMode) {
        params.project_domain = this.selectedItem.domain_id
      }
      return this.zonesM2.get({ id: `${v}/capability`, params })
    },
    cancel () {
      this.$router.push({ name: 'VMContainerInstance' })
    },
  },
}
</script>

<style lang="less" scoped>
.form-wrapper {
  padding-left: 22px;
}
.prices {
  .hour {
    font-size: 24px;
  }
  .tips {
    color: #999;
    font-size: 12px;
  }
}
</style>
