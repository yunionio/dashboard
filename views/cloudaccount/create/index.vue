<template>
  <div class="cloudaccount-create">
    <page-header :title="$t('cloudenv.text_271')" />
    <steps class="my-3" v-model="step" />
    <keep-alive>
      <component :prepareNetData="prepareNetData" :is="currentComponent" :current-item.sync="currentItem" :account="newAccountInfo" ref="stepRef" :provider="currentItem.provider" /><!-- provider 是为了 VmNetwork 的 prop 不报错 -->
    </keep-alive>
    <page-footer>
      <div slot="left">
        <div class="d-flex align-items-center">
          <div class="mr-2">{{$t('cloudenv.text_272')}}</div>
          <div class="item d-flex p-1 mb-0 align-items-center active">
            <img :src="currentItem.logo" />
            <h5 class="ml-2" v-if="showName(currentItem)">{{ currentItem.name }}</h5>
          </div>
        </div>
      </div>
      <div slot="right">
        <a-button class="mr-3" @click="perv" v-if="!isFirstStep">{{$t('cloudenv.text_273')}}</a-button>
        <a-button :disabled="nextDisabled" class="mr-3" type="primary"  @click="next" :loading="loading">{{ nextStepTitle }}</a-button>
        <test-button v-if="currentComponent === 'create-cloudaccount' || currentComponent === 'bill-form'" class="mr-3" :post="testPost" />
        <a-button @click="cancel">{{currentComponent === 'bill-form' ? $t('cloudenv.text_274'): $t('cloudenv.text_170')}}</a-button>
      </div>
    </page-footer>
  </div>
</template>

<script>
import SelectCloudaccount from './form/SelectCloudaccount'
import CreateCloudaccount from './form/CreateCloudaccount'
import BillForm from './form/BillForm'
import GuestNetwork from './form/GuestNetwork'
import HostNetwork from './form/HostNetwork'
import { CLOUDACCOUNT_TYPES } from '@Cloudenv/views/cloudaccount/constants'
import step from '@/mixins/step'
import { Manager } from '@/utils/manager'
import { getRequestT } from '@/utils/utils'
import TestButton from '@/sections/TestButton'

export default {
  name: 'Cloudaccount',
  components: {
    SelectCloudaccount,
    CreateCloudaccount,
    BillForm,
    GuestNetwork,
    HostNetwork,
    TestButton,
  },
  mixins: [step],
  data () {
    return {
      testLoding: false,
      newAccountInfo: {},
      isAdminMode: this.$store.getters.isAdminMode,
      isDomainMode: this.$store.getters.isDomainMode,
      l3PermissionEnable: this.$store.getters.l3PermissionEnable,
      userInfo: this.$store.getters.userInfo,
      currentItem: Object.values(Object.values(CLOUDACCOUNT_TYPES)[0])[0],
      currentComponent: 'SelectCloudaccount',
      vmwareFormData: null,
      loading: false,
      prepareNetData: {},
      networkData: {},
      step: {
        steps: [],
        currentStep: 0,
      },
      offsetFormLayout: {
        wrapperCol: {
          md: { span: 18, offset: 6 },
          xl: { span: 20, offset: 3 },
          xxl: { span: 22, offset: 2 },
        },
      },
    }
  },
  computed: {
    nextText () {
      if (this.step.currentStep >= this.step.steps.length - 1) {
        return this.$t('cloudenv.text_275')
      }
      return this.$t('cloudenv.text_276')
    },
    stepKey () {
      return this.step.steps[this.step.currentStep].key
    },
    isBill () {
      return ['Aws', 'Aliyun', 'Google', 'Huawei', 'Azure', 'Qcloud'].indexOf(this.currentItem.provider) > -1 && this.$appConfig.isPrivate
    },
    brand () {
      return this.currentItem.provider.toLowerCase()
    },
    nextDisabled () {
      if (this.currentComponent === 'host-network' && (!this.prepareNetData.hosts || (this.prepareNetData.hosts && !this.prepareNetData.hosts.length))) {
        return true
      }
      return false
    },
  },
  watch: {
    'step.currentStep' (step) {
      this.currentComponent = this.step.steps[step].key
    },
    currentItem (val) {
      this.changeSteps(val)
    },
  },
  created () {
    this.cloudaccountsM = new Manager('cloudaccounts', 'v2')
    this.networksM = new Manager('networks', 'v2')
    this.changeSteps()
  },
  methods: {
    async getFetchPrepareNets () {
      if (!this.vmwareFormData) return false
      try {
        const { name, host, password, port, project, username } = this.vmwareFormData
        const performData = {
          name,
          host,
          password,
          port,
          project: project.key,
          provider: 'VMware',
          username,
        }
        if (this.$store.getters.isAdminMode && this.vmwareFormData.domain && this.vmwareFormData.domain.key) {
          performData.project_domain = this.vmwareFormData.domain.key
        }
        const { data } = await this.cloudaccountsM.performClassAction({
          action: 'prepare-nets',
          data: performData,
        })
        this.prepareNetData = data || {}
      } catch (err) {
        throw err
      }
    },
    changeSteps (val) {
      if (val && val.provider === 'VMware') {
        this.step.steps = [
          { title: this.$t('cloudenv.text_277'), key: 'select-cloudaccount' },
          { title: this.$t('cloudenv.text_278'), key: 'create-cloudaccount' },
          { title: this.$t('cloudenv.text_175'), key: 'host-network' },
          { title: this.$t('cloudenv.text_176'), key: 'guest-network' },
        ]
      } else if (this.isBill) {
        this.step.steps = [
          { title: this.$t('cloudenv.text_277'), key: 'select-cloudaccount' },
          { title: this.$t('cloudenv.text_278'), key: 'create-cloudaccount' },
          { title: this.$t('cloudenv.text_279'), key: 'bill-form' },
        ]
      } else {
        this.step.steps = [
          { title: this.$t('cloudenv.text_277'), key: 'select-cloudaccount' },
          { title: this.$t('cloudenv.text_278'), key: 'create-cloudaccount' },
        ]
      }
    },
    cancel () {
      this.$router.push('/cloudaccount')
    },
    showName (item) {
      if (item.data) {
        if (item.data.hiddenName === true) {
          return false
        } else {
          return true
        }
      } else {
        return true
      }
    },
    _addDomainProject (data) {
      data.domain_id = this.userInfo.projectDomainId
      data.tenant = this.userInfo.projectId
      if (data.domain && data.domain.key) data.domain_id = data.domain.key
      if (data.project && data.project.key) data.tenant = data.project.key
      delete data.domain
      delete data.project
      if (!this.isAdminMode || !this.l3PermissionEnable) delete data.domain_id
    },
    _providerDiff (data) {
      const brand = this.currentItem.provider.toLowerCase()
      // if (brand === 'ucloud' || brand === 'huawei' || brand === 'azure') {
      //   data['auto_create_project'] = true
      // }
      if (brand === 'dstack') {
        data.brand = 'DStack'
        data.provider = 'ZStack'
      }
    },
    async doCreateCloudaccount (formData) {
      const data = {
        ...formData,
        enabled: true,
        provider: this.currentItem.provider,
      }
      if (formData.sync_interval_seconds) {
        data.sync_interval_seconds = formData.sync_interval_seconds * 60 // 转换为秒
      }
      this._addDomainProject(data)
      this._providerDiff(data)
      const ret = await this.cloudaccountsM.create({ data })
      return ret.data
    },
    formatNetParams (values) {
      const { keys = [] } = values
      return keys.map(k => {
        return {
          zone: 'default',
          wire: 'default',
          ...values[k],
        }
      })
    },
    async doCreateNetwork (wire) {
      const hostNetData = this.networkData['host-network']
      const hostParams = this.formatNetParams(hostNetData)
      const promises = []
      hostParams.forEach(dta => {
        promises.push(new Promise((resolve, reject) => {
          dta.server_type = 'baremetal'
          dta.wire = wire.id
          dta.generate_name = dta.name
          dta.tenant = this.newAccountInfo.tenant
          if (this.isAdminMode && this.l3PermissionEnable) {
            dta.domain_id = this.newAccountInfo.domain_id
          }
          delete dta.name
          this.networksM.create({
            data: dta,
            params: { $t: getRequestT() },
          }).then(({ data }) => {
            resolve(data)
          }).catch(err => {
            reject(err)
          })
        }))
      })
      const guestNetData = this.networkData['guest-network']
      if (guestNetData.isCreate) {
        const guestParams = this.formatNetParams(guestNetData)
        guestParams.forEach(dta => {
          promises.push(new Promise((resolve, reject) => {
            dta.server_type = 'guest'
            dta.wire = wire.id
            dta.generate_name = dta.name
            dta.tenant = this.newAccountInfo.tenant
            if (this.isAdminMode && this.l3PermissionEnable) {
              dta.domain_id = this.newAccountInfo.domain_id
            }
            delete dta.name
            this.networksM.create({
              data: dta,
              params: { $t: getRequestT() },
            }).then(({ data }) => {
              resolve(data)
            }).catch(err => {
              reject(err)
            })
          }))
        })
      }
      await Promise.all(promises)
    },
    async createWire () {
      const manager = new this.$Manager('wires')
      try {
        if (!this.prepareNetData.suitable_wire && this.prepareNetData.suggested_wire) {
          const { name, description, zone_id, zone_ids } = this.prepareNetData.suggested_wire
          const params = {
            generate_name: name,
            description,
            zone_id: zone_id || ((zone_ids && zone_ids.length > 0) ? zone_ids[0] : undefined),
            vpc_id: 'default',
            bandwidth: '1000',
          }
          params.tenant = this.newAccountInfo.tenant
          if (this.isAdminMode && this.l3PermissionEnable) {
            params.domain_id = this.newAccountInfo.domain_id
          }
          const { data } = await manager.create({
            data: params,
          })
          return data
        }
        return {
          id: this.prepareNetData.suitable_wire,
        }
      } catch (err) {
        throw err
      }
    },
    async vmwareForm (values) {
      if (this.step.currentStep === 1) {
        this.vmwareFormData = values
        await this.getFetchPrepareNets()
      }
      if (this.step.currentStep > 1) {
        this.networkData[this.currentComponent] = values
      }
      if (this.step.currentStep === 3) {
        try {
          this.newAccountInfo = await this.doCreateCloudaccount(this.vmwareFormData)
          const wireDta = await this.createWire()
          try {
            await this.doCreateNetwork(wireDta)
          } catch (error) {
            this.$router.push('/cloudaccount')
            throw error
          }
          this.$router.push('/cloudaccount')
        } catch (err) {
          throw err
        }
      }
    },
    async validateForm () {
      let createForm = this.$refs.stepRef.$refs.createForm
      if (this.brand === 'vmware' && this.step.currentStep > 1) {
        createForm = this.$refs.stepRef
      }
      if (this.step.currentStep === 2 && this.isBill) {
        return this.fetchBillSubmit()
      }
      if (!createForm) return false
      try {
        this.loading = true
        const values = await createForm.validateForm()
        if (this.brand === 'vmware') {
          return await this.vmwareForm(values)
        }
        this.newAccountInfo = await this.doCreateCloudaccount(values)
        if (this.isBill) {
          this.currentComponent = 'billConfig'
        } else {
          this.$router.push('/cloudaccount')
        }
      } catch (err) {
        throw err
      } finally {
        this.loading = false
      }
    },
    async fetchBillSubmit () {
      const BILL_FORM = this.$refs.stepRef
      this.loading = true
      try {
        await BILL_FORM.doSubmit(this.newAccountInfo)
      } catch (err) {
        throw err
      } finally {
        this.loading = false
      }
    },
    next () {
      const { currentStep } = this.step
      const next = currentStep + 1
      this.setStep(next)
    },
    perv () {
      const { currentStep } = this.step
      const prev = currentStep - 1
      this.setStep(prev)
    },
    testPost () {
      if (this.currentComponent === 'create-cloudaccount') {
        return this.handleTest()
      }
      if (this.$refs.stepRef && this.$refs.stepRef.testPost) {
        return this.$refs.stepRef.testPost()
      }
    },
    async handleTest () {
      const createForm = this.$refs.stepRef.$refs.createForm
      const formData = await createForm.validateForm()
      const data = {
        ...formData,
        enabled: true,
        provider: this.currentItem.provider,
      }
      if (formData.sync_interval_seconds) {
        data.sync_interval_seconds = formData.sync_interval_seconds * 60 // 转换为秒
      }
      this._addDomainProject(data)
      this._providerDiff(data)
      await this.cloudaccountsM.performClassAction({
        action: 'check-create-data',
        data: data,
      })
    },
  },
}
</script>

<style lang="less">
.cloudaccount-create {
  .item {
    width: 120px;
    cursor: pointer;
    display: block;
    font-size: 14px;
    margin-bottom: 10px;
    border: 1px solid #eee;
    text-align: center;
    border-radius: 3px;
    box-sizing: border-box;
    &.active {
      border-color:#4DA1FF;
      h5{
        color:#4DA1FF;
      }
    }
    &:hover {
      border-color:#4DA1FF;
      h5{
        color:#4DA1FF;
      }
    }
    h5 {
      margin: 0;
      font-size: 13px;
      font-weight: 400;
    }
    img {
      height: 24px;
    }
  }
}
</style>
