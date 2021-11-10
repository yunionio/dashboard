<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{params.title}}</div>
    <div slot="body">
      <a-form
        class="mt-3"
        :form="form.fc"
        @submit.prevent="handleSubmit"
        v-bind="formItemLayout">
        <area-selects
          class="mb-0"
          ref="areaSelects"
          :wrapperCol="formItemLayout.wrapperCol"
          :labelCol="formItemLayout.labelCol"
          :names="areaselectsName"
          :providerParams="providerParams"
          :cloudregionParams="cloudregionParams"
          :isRequired="true"
          @change="handleRegionChange" />
        <a-form-item label="VPC">
          <base-select
            v-decorator="decorators.vpc"
            resource="vpcs"
            :params="vpcParams"
            :isDefaultSelect="true"
            :needParams="true"
            :labelFormat="vpcLabelFormat"
            :select-props="{ placeholder: $t('common_226') }" />
        </a-form-item>
      </a-form>
    </div>
    <div slot="footer">
      <a-button type="primary" @click="handleConfirm" :loading="loading">{{ $t('dialog.ok') }}</a-button>
      <a-button @click="cancelDialog">{{ $t('dialog.cancel') }}</a-button>
    </div>
  </base-dialog>
</template>

<script>
import { mapGetters } from 'vuex'
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'
import AreaSelects from '@/sections/AreaSelects'

export default {
  name: 'AssociateVpcForVpcNetworkDialog',
  components: {
    AreaSelects,
  },
  mixins: [DialogMixin, WindowsMixin],
  provide () {
    return {
      form: this.form,
    }
  },
  data () {
    return {
      loading: false,
      form: {
        fc: this.$form.createForm(this),
      },
      decorators: {
        account: [
          'account',
          {
            rules: [{
              required: true,
              message: this.$t('network.text_215'),
            }],
          },
        ],
        vpc: [
          'vpc',
          {
            rules: [
              { required: true, message: this.$t('network.text_274') },
            ],
          },
        ],
      },
      areaselectsName: ['provider', 'cloudregion'],
      regionProvider: '',
      regionId: '',
      cloudaccountId: '',
      associateVpcIds: [],
      formItemLayout: {
        wrapperCol: {
          md: { span: 18 },
          xl: { span: 20 },
          xxl: { span: 22 },
        },
        labelCol: {
          md: { span: 6 },
          xl: { span: 4 },
          xxl: { span: 2 },
        },
      },
    }
  },
  computed: {
    ...mapGetters(['isAdminMode', 'scope']),
    curItem () {
      return this.params.data[0]
    },
    vpcParams () {
      const accountId = this.curItem.account_id
      const brand = this.curItem.brand
      const params = {
        limit: 0,
        usable_vpc: true,
        scope: this.scope,
        cloudregion_id: this.regionId,
        filter: `provider.in(${brand})`,
        usable_for_inter_vpc_network_id: this.curItem.id,
      }
      if (this.isAdminMode) {
        params.project_domain = this.curItem.project_domain
        delete params.scope
      }
      if (!this.regionId) return {}
      if (accountId) {
        return {
          ...params,
          cloudaccount_id: accountId,
        }
      }
      return params
    },
    providerParams () {
      const brand = this.curItem.brand
      return {
        filter: `provider.in(${brand})`,
        scope: this.scope,
        cloud_env: 'public',
      }
    },
    cloudregionParams () {
      return {
        scope: this.scope,
        limit: 0,
        usable_vpc: true,
        show_emulated: true,
      }
    },
  },
  methods: {
    async handleConfirm () {
      this.loading = true
      try {
        const ids = this.params.data.map(item => item.id)
        const { vpc } = await this.form.fc.validateFields()
        const vpcManager = new this.$Manager('inter_vpc_networks')
        await vpcManager.batchPerformAction({
          ids: ids,
          action: 'addvpc',
          data: {
            vpc_id: vpc,
          },
        })
        this.params.refresh && this.params.refresh(2)
        this.$bus.$emit('VpcNetworkListSingleRefresh', [this.params.resData.id])
        this.cancelDialog()
        this.$message.success(this.$t('common.success'))
      } finally {
        this.loading = false
      }
    },
    handleRegionChange (data) {
      const { cloudregion } = data
      if (cloudregion) {
        const { provider } = cloudregion.value
        this.regionProvider = provider
        this.regionId = cloudregion.id
      }
    },
    vpcLabelFormat (item) {
      if (item.manager) {
        if (item.cidr_block) {
          return <div><span class="text-color-secondary">VPC:</span> { item.name }<span>（{ item.cidr_block }）</span><span class="ml-2 text-color-secondary">{this.$t('common_711')}: { item.manager }</span></div>
        }
        return <div><span class="text-color-secondary">VPC:</span> { item.name }<span class="ml-2 text-color-secondary">{this.$t('common_711')}: { item.manager }</span></div>
      }
      return <div>{ item.name }</div>
    },
  },
}
</script>
