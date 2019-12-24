<template>
  <div class="cloudaccount-create">
    <page-header title="新建云账号" />
    <steps class="my-3" v-model="step" />
    <keep-alive>
      <component :is="currentComponent" :current-item.sync="currentItem" ref="stepRef" :provider="currentItem.provider" /><!-- provider 是为了 VmNetwork 的 prop 不报错 -->
    </keep-alive>
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
        <a-button @click="cancel">取 消</a-button>
      </div>
    </page-footer>
  </div>
</template>

<script>
import { CLOUDACCOUNT_TYPES } from '@Cloudenv/views/cloudaccount/constants'
import SelectCloudaccount from './form/SelectCloudaccount'
import CreateCloudaccount from './form/CreateCloudaccount'
import VmNetwork from './form/VmNetwork'
import step from '@/mixins/step'
import { Manager } from '@/utils/manager'

export default {
  name: 'Cloudaccount',
  components: {
    SelectCloudaccount,
    CreateCloudaccount,
    VmNetwork,
  },
  mixins: [step],
  data () {
    return {
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
          { title: '选择云平台', key: 'platform' },
          { title: '配置云账号', key: 'cloudaccount' },
        ],
        currentStep: 0,
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
  },
  watch: {
    'step.currentStep' (step) {
      if (step === 0) {
        this.currentComponent = 'SelectCloudaccount'
      } else if (step === 1) {
        this.currentComponent = 'CreateCloudaccount'
      } else {
        this.currentComponent = 'VmNetwork'
      }
    },
    currentItem (val) {
      if (val.name === 'VMware') {
        this.step.steps = [
          { title: '选择云平台', key: 'platform' },
          { title: '配置云账号', key: 'cloudaccount' },
          { title: '配置IP子网', key: 'network' },
        ]
      } else {
        this.step.steps = [
          { title: '选择云平台', key: 'platform' },
          { title: '配置云账号', key: 'cloudaccount' },
        ]
      }
    },
  },
  created () {
    this.cloudaccountsM = new Manager('cloudaccounts', 'v2')
    this.networksM = new Manager('networks', 'v2')
  },
  methods: {
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
      if (brand === 'ucloud' || brand === 'huawei' || brand === 'azure') {
        data['auto_create_project'] = true
      }
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
      if (this.step.currentStep === 2) createForm = this.$refs.stepRef // VmNetwork 组件
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
                  .then(successFn)
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
