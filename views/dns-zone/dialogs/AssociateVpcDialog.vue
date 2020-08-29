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
          v-if="isShowRegionSelect"
          class="mb-0"
          ref="areaSelects"
          :wrapperCol="formItemLayout.wrapperCol"
          :labelCol="formItemLayout.labelCol"
          :names="areaselectsName"
          :cloudregionParams="cloudregionParams"
          :isRequired="true"
          @change="handleRegionChange" />
        <a-form-item label="VPC" v-bind="formItemLayout">
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
import { getRequestT } from '@/utils/utils'

export default {
  name: 'AssociateVpcDialog',
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
        vpc: [
          'vpc',
          {
            rules: [
              { required: true, message: this.$t('network.text_274') },
            ],
          },
        ],
      },
      areaselectsName: ['city', 'provider', 'cloudregion'],
      cloudregionParams: {
        scope: this.scope,
        limit: 0,
        usable_vpc: true,
        show_emulated: true,
      },
      regionProvider: '',
      regionId: '',
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
    zoneParams () {
      const { cloudaccount_id, provider } = this.params.data[0]
      if (cloudaccount_id) {
        return { cloudaccount_id }
      } else if (provider) {
        return { provider }
      }
      return null
    },
    isShowRegionSelect () {
      return !this.zoneParams
    },
    vpcParams () {
      let params = {
        show_emulated: true,
        limit: 0,
        usable_vpc: true,
        scope: this.scope,
        cloudregion_id: this.regionId,
      }
      if (this.zoneParams) {
        params = {
          ...params,
          ...this.zoneParams,
        }
        delete params.cloudregion_id
      }
      if (this.associateVpcIds) {
        params.filter = `id.notin(${this.associateVpcIds.join(',')})`
      }
      if (this.isAdminMode) {
        params.project_domain = this.project_domain
        delete params.scope
      }
      return params
    },
  },
  created () {
    this.loadVpcByDnsZone()
  },
  methods: {
    async handleConfirm () {
      this.loading = true
      try {
        const ids = this.params.data.map(item => item.id)
        await this.params.onManager('batchPerformAction', {
          id: ids,
          steadyStatus: ['running', 'ready'],
          managerArgs: {
            action: 'add-vpcs',
            data: {
              vpc_ids: [this.vpcId],
            },
          },
        })
        this.cancelDialog()
      } finally {
        this.loading = false
      }
    },
    handleRegionChange (data) {
      const { provider } = data.cloudregion.value
      this.regionProvider = provider
      this.regionId = data.cloudregion.id
    },
    vpcLabelFormat (item) {
      if (item.manager) {
        if (item.cidr_block) {
          return (<div><span class="text-color-secondary">VPC:</span> { item.name }<span v-if="item.cidr_block">（{ item.cidr_block }）</span><span class="ml-2 text-color-secondary">云订阅: { item.manager }</span></div>)
        }
        return (<div><span class="text-color-secondary">VPC:</span> { item.name }<span class="ml-2 text-color-secondary">云订阅: { item.manager }</span></div>)
      }
      return (<div>{ item.name }</div>)
    },
    loadVpcByDnsZone () {
      const m = new this.$Manager('vpcs')
      const { id } = this.params.data[0]
      const params = {
        show_emulated: true,
        limit: 0,
        usable_vpc: true,
        scope: this.scope,
        dns_zone_id: id,
        $t: getRequestT(),
      }
      m.list({ params }).then((res) => {
        const { data } = res.data
        this.associateVpcIds = data.map((item) => {
          return item.id
        })
      })
    },
  },
}
</script>
