<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{ $t('network.ssh-proxy-match.link.create') }}</div>
    <div slot="body">
      <a-form
          :form="form.fc">
        <a-form-item :label="$t('network.text_21')" v-bind="formItemLayout">
          <a-input v-decorator="decorators.name" :placeholder="$t('network.text_44')" @change="handleNameChange" />
          <name-repeated v-slot:extra res="proxy_matches" :name="name" />
        </a-form-item>
        <area-selects
            class="mb-0"
            ref="areaSelects"
            :wrapperCol="formItemLayout.wrapperCol"
            :labelCol="formItemLayout.labelCol"
            :names="['provider', 'cloudregion']"
            :cloudregionParams="regionParams"
            :providerParams="providerParams"
            :isRequired="false"
            @change="handleRegionChange" />
        <a-form-item :label="$t('network.text_277')" v-bind="formItemLayout">
          <a-radio-group v-decorator="decorators.match_scope" :defaultChecked="true" @change="handleScopeChange">
            <a-radio-button value="vpc" key="vpc">
              {{ $t('dictionary.vpc') }}
            </a-radio-button>
            <a-radio-button value="network" key="network">
              {{ $t('compute.text_106') }}
            </a-radio-button>
          </a-radio-group>
        </a-form-item>
        <a-form-item label="VPC" v-bind="formItemLayout">
          <base-select
              v-decorator="decorators.vpc"
              resource="vpcs"
              @change="handleVpcChange"
              :params="vpcParams"
              :isDefaultSelect="true"
              :needParams="true"
              :labelFormat="vpcLabelFormat"
              :select-props="{ placeholder: $t('common_226') }" />
        </a-form-item>
        <a-form-item v-if="showNetworks" :label="$t('compute.text_106')" v-bind="formItemLayout">
          <base-select
              v-decorator="decorators.network"
              resource="networks"
              need-params
              filterable
              :isDefaultSelect="true"
              :params="networkParams"
              :select-props="{ placeholder: $t('network.text_212') }" />
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
import _ from 'lodash'
import * as R from 'ramda'
import { mapGetters } from 'vuex'
import NameRepeated from '@/sections/NameRepeated'
import AreaSelects from '@/sections/AreaSelects'
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'SshProxyMatchLinkDialog',
  components: {
    AreaSelects,
    NameRepeated,
  },
  mixins: [DialogMixin, WindowsMixin],
  data () {
    this.handleNameChange = _.debounce(this._handleNameChange, 500)
    return {
      loading: false,
      manager: new this.$Manager('proxy_matches'),
      showNetworks: false,
      form: {
        fc: this.$form.createForm(this),
      },
      scope: this.$store.getters.scope,
      name: '',
      regionId: '',
      vpcId: '',
      decorators: {
        name: [
          'name',
          {
            validateFirst: true,
            validateTrigger: ['blur'],
            rules: [
              { required: true, message: this.$t('network.text_116') },
              { validator: this.$validate('resourceCreateName') },
            ],
          },
        ],
        match_scope: [
          'match_scope',
          {
            initialValue: 'vpc',
            rules: [
              { required: true, message: this.$t('network.text_343') },
            ],
          },
        ],
        vpc: [
          'vpc',
          {
            initialValue: '',
            rules: [
              { required: true, message: this.$t('network.text_274') },
            ],
          },
        ],
        network: [
          'network',
          {
            initialValue: '',
            rules: [
              { required: true, message: this.$t('network.text_212') },
            ],
          },
        ],
      },
      formItemLayout: {
        wrapperCol: {
          span: 20,
        },
        labelCol: {
          span: 4,
        },
      },
    }
  },
  computed: {
    ...mapGetters(['isAdminMode', 'isDomainMode', 'userInfo']),
    regionParams () {
      return {
        usable: true,
        show_emulated: true,
        scope: this.scope,
      }
    },
    providerParams () {
      return {
        scope: this.scope,
      }
    },
    vpcParams () {
      const params = {
        limit: 0,
        usable_vpc: true,
        scope: this.scope,
      }

      if (this.regionId) params.cloudregion_id = this.regionId
      if (!this.regionId) return {}
      return params
    },
    networkParams () {
      const params = { scope: this.scope, usable: true, limit: 0 }
      if (this.vpcId) {
        params.vpc = this.vpcId
      }
      return params
    },
  },
  methods: {
    _handleNameChange (e) {
      this.name = e.target.value
    },
    handleScopeChange (e) {
      this.showNetworks = e.target.value === 'network'
    },
    handleVpcChange (e) {
      this.vpcId = e
    },
    handleRegionChange (data) {
      if (!R.isEmpty(data.cloudregion) && !R.isNil(data.cloudregion)) {
        this.regionId = data.cloudregion.id
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
    doCreate (data) {
      return this.manager.create({
        data: {
          generate_name: data.name,
          proxy_endpoint: this.params.proxy_endpoint_id,
          match_scope: data.match_scope,
          match_value: data.match_scope === 'vpc' ? data.vpc : data.network,
        },
      })
    },
    async handleConfirm () {
      this.loading = true
      try {
        const values = await this.form.fc.validateFields()
        await this.doCreate(values)
        this.loading = false
        if (this.params.list && typeof this.params.list.fetchData === 'function') {
          this.params.list.fetchData()
        }
        this.cancelDialog()
      } catch (error) {
        this.loading = false
      }
    },
  },
}
</script>
