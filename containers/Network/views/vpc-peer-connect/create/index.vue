<template>
  <div>
    <page-header :title="$t('common_628', [$t('dictionary.vpc_peer_connect')])" />
    <page-body needMarginBottom>
      <a-form :form="form.fc" v-bind="formItemLayout" hideRequiredMark>
        <a-form-item :label="$t('common.attribution_scope')">
          <domain-select v-decorator="decorators.project_domain" />
        </a-form-item>
        <a-form-item :label="$t('common.name')">
          <a-input v-decorator="decorators.name" :placeholder="$t('compute.text_210')" />
        </a-form-item>
        <a-form-item :label="$t('network.text_198')">
          <a-select v-decorator="decorators.brand" @change="handleBrandChange">
            <a-select-option v-for="item in VPC_PEER_BRANDS" :key="item.key">{{ item.label }}</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item :label="$t('network.request.vpc')">
          <a-row :gutter="6">
            <a-col :span="12">
              <a-form-item :wrapperCol="{ span: 24 }" class="mb-0 mr-1">
                <a-select
                  v-decorator="decorators.request_cloudregion"
                  @change="handleRequestRegionChange"
                  :placeholder="$t('network.text_199')"
                  :loading="regionLoading"
                  :disabled="!regionLoaded">
                  <a-select-option v-for="item in regionArr" :value="item.value" :key="item.value">
                    <span class="text-color-secondary option-prefix">{{ $t('network.text_199') }}:</span>
                    {{item.label}}
                  </a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item :wrapperCol="{ span: 24 }" class="mb-0 mr-1">
                <a-select
                  v-decorator="decorators.request_vpc"
                  placeholder="VPC"
                  :loading="requestVpcLoading"
                  :disabled="regionLoading || !requestVpcLoaded">
                  <a-select-option v-for="item in requestVpcArr" :value="item.value" :key="item.value">
                    <span class="text-color-secondary option-prefix">VPC:</span>
                    {{item.label}}
                  </a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
          </a-row>
        </a-form-item>
        <a-form-item :label="$t('network.receive.vpc')">
          <a-row :gutter="6">
            <a-col :span="12">
              <a-form-item :wrapperCol="{ span: 24 }" class="mb-0 mr-1">
                <a-select
                  v-decorator="decorators.receive_cloudregion"
                  @change="handleReceiveRegionChange"
                  :placeholder="$t('network.text_199')"
                  :loading="regionLoading"
                  :disabled="!regionLoaded">
                  <a-select-option v-for="item in regionArr" :value="item.value" :key="item.value">
                    <span class="text-color-secondary option-prefix">{{ $t('network.text_199') }}:</span>
                    {{item.label}}
                  </a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item :wrapperCol="{ span: 24 }" class="mb-0 mr-1">
                <a-select
                  v-decorator="decorators.receive_vpc"
                  placeholder="VPC"
                  :loading="receiveVpcLoading"
                  :disabled="regionLoading || !receiveVpcLoaded">
                  <a-select-option v-for="item in receiveVpcArr" :value="item.value" :key="item.value">
                    <span class="text-color-secondary option-prefix">VPC:</span>
                    {{item.label}}
                  </a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
          </a-row>
        </a-form-item>
      </a-form>
    </page-body>
    <page-footer>
      <div slot="right">
        <a-button class="mr-3" type="primary" @click="handleConfirm" :loading="loading">
          {{$t('compute.text_907')}}
        </a-button>
        <a-button @click="handleCancel">{{$t('compute.text_908')}}</a-button>
      </div>
    </page-footer>
  </div>
</template>

<script>
import { uuid } from '@/utils/utils'
import DomainSelect from '@/sections/DomainSelect'
import { VPC_PEER_BRANDS } from '../constants'
import { Manager } from '@/utils/manager'

export default {
  name: 'NetworkVpcPeerConnectCreate',
  components: {
    DomainSelect,
  },
  data () {
    return {
      loading: false,
      regionLoading: false,
      regionLoaded: false,
      requestVpcLoading: false,
      requestVpcLoaded: false,
      receiveVpcLoading: false,
      receiveVpcLoaded: false,
      regionArr: [],
      requestVpcArr: [],
      receiveVpcArr: [],
      VPC_PEER_BRANDS,
      form: {
        fc: this.$form.createForm(this),
      },
      decorators: {
        project_domain: [
          'project_domain',
          {
            initialValue: this.$store.getters.userInfo.projectDomainId,
          },
        ],
        name: [
          'name',
          {
            rules: [
              { required: true, message: this.$t('compute.text_210') },
            ],
          },
        ],
        brand: [
          'brand',
          {
            initialValue: VPC_PEER_BRANDS[0].key,
          },
        ],
        request_cloudregion: [
          'request_cloudregion',
          {
            rules: [
              { required: true, message: this.$t('network.text_286') },
            ],
          },
        ],
        request_vpc: [
          'request_vpc',
          {
            rules: [
              { required: true, message: this.$t('common_226') },
            ],
          },
        ],
        receive_cloudregion: [
          'receive_cloudregion',
          {
            rules: [
              { required: true, message: this.$t('network.text_286') },
            ],
          },
        ],
        receive_vpc: [
          'receive_vpc',
          {
            rules: [
              { required: true, message: this.$t('common_226') },
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
  created () {
    this.fetchRegions()
  },
  methods: {
    async fetchRegions (brand = VPC_PEER_BRANDS[0].key) {
      try {
        this.regionLoading = true
        this.regionLoaded = false
        const manager = new this.$Manager('cloudregions')
        const res = await manager.list({
          params: {
            scope: this.$store.getters.scope,
            brand,
          },
        })
        this.regionArr = res.data.data.map((item) => {
          return {
            label: this._$t(item),
            value: item.id,
          }
        })
        if (this.regionArr.length) {
          const defaultValue = this.regionArr[0].value
          this.form.fc.setFieldsValue({
            [this.decorators.request_cloudregion[0]]: defaultValue,
            [this.decorators.receive_cloudregion[0]]: defaultValue,
          })
          this.fetchRequestVpcs(defaultValue)
          this.fetchReceiveVpcs(defaultValue)
        }
        this.regionLoading = false
        this.regionLoaded = true
      } catch (error) {
        this.regionLoading = false
        throw error
      }
    },
    async fetchRequestVpcs (cloudregion) {
      try {
        this.requestVpcLoading = true
        this.requestVpcLoaded = false
        const manager = new this.$Manager('vpcs')
        const res = await manager.list({
          params: {
            $t: uuid(),
            scope: this.$store.getters.scope,
            cloudregion_id: cloudregion,
          },
        })
        this.requestVpcArr = res.data.data.map((item) => {
          return {
            label: item.name,
            value: item.id,
          }
        })
        if (this.requestVpcArr.length) {
          const defaultValue = this.requestVpcArr[0].value
          this.form.fc.setFieldsValue({
            [this.decorators.request_vpc[0]]: defaultValue,
          })
        }
        this.requestVpcLoading = false
        this.requestVpcLoaded = true
      } catch (error) {
        this.requestVpcLoading = false
      }
    },
    async fetchReceiveVpcs (cloudregion) {
      try {
        this.receiveVpcLoading = true
        this.receiveVpcLoaded = false
        const manager = new this.$Manager('vpcs')
        const res = await manager.list({
          params: {
            $t: uuid(),
            scope: this.$store.getters.scope,
            cloudregion_id: cloudregion,
          },
        })
        this.receiveVpcArr = res.data.data.map((item) => {
          return {
            label: item.name,
            value: item.id,
          }
        })
        if (this.receiveVpcArr.length) {
          const defaultValue = this.receiveVpcArr[0].value
          this.form.fc.setFieldsValue({
            [this.decorators.receive_vpc[0]]: defaultValue,
          })
        }
        this.receiveVpcLoading = false
        this.receiveVpcLoaded = true
      } catch (error) {
        this.receiveVpcLoading = false
      }
    },
    handleRequestRegionChange (v) {
      this.fetchRequestVpcs(v)
    },
    handleReceiveRegionChange (v) {
      this.fetchReceiveVpcs(v)
    },
    handleBrandChange (v) {
      this.resetVpc()
      this.fetchRegions(v)
    },
    resetVpc () {
      this.form.fc.setFieldsValue({
        [this.decorators.request_cloudregion[0]]: undefined,
        [this.decorators.receive_cloudregion[0]]: undefined,
        [this.decorators.request_vpc[0]]: undefined,
        [this.decorators.receive_vpc[0]]: undefined,
      })
      this.regionArr = []
      this.requestVpcArr = []
      this.receiveVpcArr = []
    },
    async doSubmit (data) {
      const params = {
        generate_name: data.name,
        vpc_id: data.request_vpc,
        peer_vpc_id: data.receive_vpc,
      }
      const manager = new Manager('vpc_peering_connections')
      return manager.create({
        data: params,
      })
    },
    async handleConfirm () {
      this.loading = true
      try {
        const values = await this.form.fc.validateFields()
        await this.doSubmit(values)
        this.loading = false
        this.$message.success(this.$t('common.success'))
        this.goBack()
      } catch (error) {
        this.loading = false
      }
    },
    handleCancel () {
      this.goBack()
    },
    goBack () {
      this.$router.push({
        name: 'VpcPeerConnect',
      })
    },
  },
}
</script>

<style>

</style>
