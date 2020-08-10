<template>
  <div class="cloudaccount-create">
    <page-header title="新建云账号" />
    <steps class="my-3" v-model="step" />
    <keep-alive>
      <component :is="currentComponent" :current-item.sync="currentItem" :account="newAccountInfo" ref="stepRef" :provider="currentItem.provider" /><!-- provider 是为了 VmNetwork 的 prop 不报错 -->
    </keep-alive>
    <a-form-item v-if="step.currentStep === 1" v-bind="offsetFormLayout">
      <a-button :loading="testLoding" style="padding: 0" type="link" @click="handleTest">连接测试</a-button>
    </a-form-item>
    <page-footer>
      <div slot="left">
        <div class="d-flex align-items-center">
          <div class="mr-2">已选择: </div>
          <div class="item d-flex p-1 mb-0 align-items-center active">
            <img :src="currentItem.logo" />
            <h5 class="ml-2" v-if="showName(currentItem)">{{ currentItem.name }}</h5>
          </div>
        </div>
      </div>
      <div slot="right">
        <a-button class="mr-3" @click="perv" v-if="!isFirstStep">上一步</a-button>
        <a-button class="mr-3" type="primary" @click="next" :loading="loading">{{ nextStepTitle }}</a-button>
        <a-button @click="cancel">{{currentComponent === 'BillForm' ? '跳 过': '取 消'}}</a-button>
      </div>
    </page-footer>
  </div>
</template>

<script>
import { CLOUDACCOUNT_TYPES } from '@Cloudenv/views/cloudaccount/constants'
import SelectCloudaccount from './form/SelectCloudaccount'
import CreateCloudaccount from './form/CreateCloudaccount'
import BillForm from './form/BillForm'
import VmNetwork from './form/VmNetwork'
import step from '@/mixins/step'
import { Manager } from '@/utils/manager'

export default {
  name: 'Cloudaccount',
  components: {
    SelectCloudaccount,
    CreateCloudaccount,
    BillForm,
    VmNetwork,
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
      step: {
        steps: [
        ],
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
        return '确定'
      }
      return '下一步'
    },
    stepKey () {
      return this.step.steps[this.step.currentStep].key
    },
    isBill () {
      return ['Aws', 'Aliyun', 'Google', 'Huawei', 'Azure'].indexOf(this.currentItem.provider) > -1 && this.$appConfig.isPrivate
    },
  },
  watch: {
    'step.currentStep' (step) {
      if (step === 0) {
        this.currentComponent = 'SelectCloudaccount'
      } else if (step === 1) {
        this.currentComponent = 'CreateCloudaccount'
      } else {
        this.currentComponent = this.isBill ? 'BillForm' : 'VmNetwork'
      }
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
    changeSteps (val) {
      if (val && val.provider === 'VMware') {
        this.step.steps = [
          { title: '选择云平台', key: 'platform' },
          { title: '配置云账号', key: 'cloudaccount' },
          { title: '配置IP子网', key: 'network' },
        ]
      } else if (this.isBill) {
        this.step.steps = [
          { title: '选择云平台', key: 'platform' },
          { title: '配置云账号', key: 'cloudaccount' },
          { title: '账单文件访问信息（可选）', key: 'billConfig' },
        ]
      } else {
        this.step.steps = [
          { title: '选择云平台', key: 'platform' },
          { title: '配置云账号', key: 'cloudaccount' },
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
    doCreateCloudaccount (formData) {
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
      return this.cloudaccountsM.create({ data })
    },
    async doCreateNetwork (formData) {
      const data = {
        'wire_id': formData.wire.key,
        name: formData.name,
      }
      let num = 0
      for (const uid in formData.startip) {
        data['guest_ip_start'] = formData.startip[uid]
        data['guest_ip_end'] = formData.endip[uid]
        data['guest_ip_mask'] = formData.netmask[uid]
        if (formData.gateway[uid]) {
          data['guest_gateway'] = formData.gateway[uid]
        }
        if (formData.vlan[uid]) {
          data['vlan_id'] = formData.vlan[uid]
        }
        if (num > 0) {
          data.name = `${data.name}-${num}`
        }
        try {
          await this.networksM.create({ data })
          num++
        } catch (error) {
          console.error(error, '<----doCreateNetwork')
        }
      }
      return true
    },
    validateForm () {
      const successFn = () => {
        this.loading = false
        this.$message.success('操作成功')
        this.$router.push('/cloudaccount')
      }
      const errorFn = () => {
        this.loading = false
      }
      const brand = this.currentItem.provider.toLowerCase()
      let createForm = this.$refs.stepRef.$refs.createForm
      if (this.step.currentStep === 2) {
        if (this.isBill) {
          return this.fetchBillSubmit()
        }
        createForm = this.$refs.stepRef // VmNetwork 组件
      }
      return new Promise((resolve, reject) => {
        if (createForm && createForm.validateForm) {
          createForm.validateForm()
            .then(values => {
              if (brand === 'vmware') { // vmware 需要第三步的时候提交云账号的创建和network的创建
                if (this.step.currentStep === 1) {
                  this.vmwareFormData = values
                } else if (this.step.currentStep === 2) {
                  this.loading = true
                  return this.doCreateCloudaccount(this.vmwareFormData)
                    .then(() => {
                      const networkRef = this.$refs.stepRef
                      if (networkRef.configNetwork) {
                        this.doCreateNetwork(values) // 创建IP子网
                          .then(successFn)
                          .catch(err => {
                            this.$message.error(`创建云账号出错：${err}`)
                            errorFn()
                          })
                      } else {
                        successFn()
                      }
                    })
                    .catch(errorFn)
                }
                resolve()
              } else {
                this.loading = true
                return this.doCreateCloudaccount(values)
                  .then(({ data }) => {
                    if (this.isBill) {
                      this.step.currentStep = 2
                      this.newAccountInfo = data
                    } else {
                      successFn()
                    }
                    this.loading = false
                  })
                  .catch(errorFn)
              }
            }).catch(err => {
              reject(err)
            })
        } else {
          resolve()
        }
      })
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
    async handleTest () {
      let createForm = this.$refs.stepRef.$refs.createForm
      this.testLoding = true
      try {
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
        this.$notification.success({
          message: '连接成功',
          description: '请点击确定继续',
        })
      } catch (err) {
        throw err
      } finally {
        this.testLoding = false
      }
    },
  },
}
</script>

<style lang="scss">
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
