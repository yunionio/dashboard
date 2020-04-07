<template>
  <div>
    <keep-alive>
      <component :account="newAccountInfo" :current-item="currentItem" :is="componentName" ref="CREATE_FORM" />
    </keep-alive>
    <a-form-item v-bind="offsetFormLayout" v-if="componentName === 'create-cloudaccount'">
      <test-button :post="handleTest" />
    </a-form-item>
  </div>
</template>

<script>
import * as R from 'ramda'
import CreateCloudaccount from '@Cloudenv/views/cloudaccount/create/form/CreateCloudaccount'
import BillForm from '@Cloudenv/views/cloudaccount/create/form/BillForm'
import { providerMap, SUB_EBV_ITMS } from '../constants'
import TestButton from '@/sections/TestButton'

export default {
  name: 'GuideCloundacount',
  components: {
    CreateCloudaccount,
    BillForm,
    TestButton,
  },
  inject: ['env', 'envKey'],
  data () {
    return {
      newAccountInfo: {},
      isAdminMode: this.$store.getters.isAdminMode,
      isDomainMode: this.$store.getters.isDomainMode,
      l3PermissionEnable: this.$store.getters.l3PermissionEnable,
      userInfo: this.$store.getters.userInfo,
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
    currentItem () {
      return SUB_EBV_ITMS[this.env][this.envKey]
    },
    isBill () {
      return ['aws', 'aliyun', 'google', 'huawei'].indexOf(this.currentItem.provider) > -1 && !R.isEmpty(this.newAccountInfo)
    },
    componentName () {
      if (this.isBill) {
        return 'bill-form'
      }
      return 'create-cloudaccount'
    },
  },
  created () {
    this.cloudaccountsM = new this.$Manager('cloudaccounts', 'v2')
  },
  methods: {
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
    getCloudaccountVals (formData) {
      const { provider } = this.currentItem
      const data = {
        ...formData,
        enabled: true,
        provider: providerMap[provider.toLowerCase()].key,
      }
      if (formData.sync_interval_seconds) {
        data.sync_interval_seconds = formData.sync_interval_seconds * 60 // 转换为秒
      }
      this._addDomainProject(data)
      this._providerDiff(data)
      return data
    },
    async doSubmitCloudaccount () {
      const createForm = this.$refs['CREATE_FORM'].$refs.createForm
      const { validateForm } = createForm
      if (!validateForm) return false
      try {
        const values = await validateForm()
        const { data } = await this.cloudaccountsM.create({
          data: this.getCloudaccountVals(values),
        })
        this.newAccountInfo = data
        return ['create-cloudaccount', data]
      } catch (err) {
        throw err
      }
    },
    async doSubmitBillForm () {
      try {
        await this.$refs['CREATE_FORM'].doSubmit(this.newAccountInfo, false)
        return ['bill-form', true]
      } catch (err) {
        throw err
      }
    },
    async doSubmit () {
      const posts = {
        'create-cloudaccount': this.doSubmitCloudaccount,
        'bill-form': this.doSubmitBillForm,
      }
      try {
        const [name] = await posts[this.componentName]()
        if (this.isBill) {
          return name === 'bill-form'
        }
        return true
      } catch (err) {
        throw err
      }
    },
    async handleTest () {
      const createForm = this.$refs['CREATE_FORM'].$refs.createForm
      const { validateForm } = createForm
      if (!validateForm) return false
      const values = await validateForm()
      await this.cloudaccountsM.performClassAction({
        action: 'check-create-data',
        data: this.getCloudaccountVals(values),
      })
    },
  },
}
</script>

<style>

</style>
