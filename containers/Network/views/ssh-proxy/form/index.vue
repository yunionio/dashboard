<template>
  <a-spin :spinning="loading">
    <page-header :title="title" />
    <page-body>
      <steps class="my-3" v-model="step" />
      <div class="step1" v-show="isSetpOne">
        <a-form :form="endpointForm" ref="endpointFormRef" v-bind="formItemLayout">
          <a-form-item :label="$t('dictionary.domain')" key="domain" v-show="showDomainSelect">
            <base-select
              v-model="filters.project_domain"
              v-if="showDomainSelect"
              :isDefaultSelect="true"
              resource="domains"
              :params="renderOrders.project_domain.params"
              filterable
              version="v1"
              @change="handleDomainChange"
              :select-props="{ placeholder: `${$t('common.text00106')}${$t('dictionary.domain')}` }" />
          </a-form-item>
          <a-form-item :label="$t('common.name')">
            <a-input v-decorator="decorators.generate_name" :placeholder="$t('common.placeholder')" @change="handleNameChange" />
            <name-repeated v-slot:extra res="proxy_endpoints" :name="generate_name" />
          </a-form-item>
          <a-form-item :label="$t('common.description')">
            <a-textarea :auto-size="{ minRows: 1, maxRows: 3 }" v-decorator="decorators.description" :placeholder="$t('common_367')" />
          </a-form-item>
          <area-selects
            class="mb-0"
            ref="areaSelects"
            @change="handleAreaChange"
            :allowClear="false"
            :wrapperCol="formItemLayout.wrapperCol"
            :labelCol="formItemLayout.labelCol"
            :names="areaselectsName"
            :cloudregionParams="renderOrders.region.params"
            :providerParams="renderOrders.brand.params"
            :cloudregionParamsMapper="cloudregionParamsMapper"
            filterBrandResource="compute_engine" />
          <a-form-item :label="$t('cloudenv.text_7')">
            <a-row :gutter="9">
              <a-col :span="12">
                <base-select
                  resource="vpcs"
                  filterable
                  need-params
                  v-model="filters.vpc"
                  ref="vpcSelects"
                  @change="handleVpcChange"
                  class="vpc-selector"
                  :isDefaultSelect="true"
                  :params="renderOrders.vpc.params"
                  :labelFormat="vpcLabelFormat"
                  :select-props="{ placeholder: $t('network.text_274') }" />
              </a-col>
              <a-col :span="12">
                <base-select
                  resource="networks"
                  need-params
                  filterable
                  v-model="filters.network"
                  ref="networkSelects"
                  :style="{'--network-title': networkTitle}"
                  class="network-selector"
                  @change="handleNetworkChange"
                  :isDefaultSelect="false"
                  :params="renderOrders.network.params"
                  :labelFormat="networkLabelFormat"
                  :select-props="{ placeholder: $t('common_227') }" />
              </a-col>
            </a-row>
          </a-form-item>
          <a-form-item :label="$t('network.text_226')">
            <div>
              <search-box :options="options" v-model="searchValue" @input="search" />
              <detect-ssh-table :params="params" :key="table1Key" :showRadioSelect="true" @radio-change="handleRadioChange" :maxColumns="3" :remote="false" style="padding-top: 15px;" />
              <a-input v-decorator="decorators.server_id" v-show="false" />
              <div>{{$t('compute.text_196')}}<help-link href="/vminstance">{{$t('compute.perform_create')}}</help-link>,{{$t('network.ssh-proxy.endpoints.create.vminstance.tips')}}<help-link :href="vmConfigurationLink">{{$t('network.ssh-proxy.endpoints.create.vminstance.tips.link')}}</help-link></div>
            </div>
          </a-form-item>
        </a-form>
      </div>
      <div class="step2" v-if="!isSetpOne">
        <detect-ssh-table :params="t2Params" :key="table2Key" :ansibleTasks="ansibleTasks" :remote="true" :maxColumns="3" @onDetecting="handleDetectStatusChange" />
        <a-alert :message="alertMessage" :type="alertType" v-show="alertType" />
        <setup-ssh-form ref="setupForm" :servers="servers"  @tasks="handleSetupSSHTasks" v-show="showSetupForm" />
      </div>
    </page-body>
    <page-footer>
      <template v-slot:right>
        <a-button size="large" :loading="loading || detecting" @click="lastStep" v-show="!isSetpOne">{{ $t('scope.text_107') }}</a-button>
        <a-button class="ml-2" type="primary" size="large" :loading="loading || detecting" @click="handleSubmit">{{ isSetpOne ? $t('scope.text_108') : $t('common.ok') }}</a-button>
        <a-button class="ml-2" size="large" @click="handleCancel">{{ $t('dialog.cancel') }}</a-button>
      </template>
    </page-footer>
  </a-spin>
</template>

<script>
import _ from 'lodash'
import { DetectSshTable } from '@Compute/views/vminstance/dialogs/DetectSSH'
import SetupSshForm from '@Compute/views/vminstance/create/form/SetupSSHForm'
import AreaSelects from '@/sections/AreaSelects'
import NameRepeated from '@/sections/NameRepeated'
import {
  getStatusTableColumn,
  getIpsTableColumn,
  getNameDescriptionTableColumn,
} from '@/utils/common/tableColumn'
import { getNameFilter } from '@/utils/common/tableFilter'
import ListMixin from '@/mixins/list'
import { genDocsUrl } from '@/utils/utils'

export default {
  name: 'SshProxyCreateForm',
  components: {
    DetectSshTable,
    SetupSshForm,
    AreaSelects,
    NameRepeated,
  },
  mixins: [ListMixin],
  data () {
    let domain = ''
    let showDomainSelect = true
    const serverlist = this.$list.createList(this, { id: 'ssh-endpoint-create-form', resource: 'servers' })
    if (this.$store.getters.scope === 'system') {
      domain = 'default'
    } else {
      showDomainSelect = false
      domain = this.$store.getters.userInfo.projectDomain || ''
    }
    const columns = [
      getNameDescriptionTableColumn({
        onManager: new this.$Manager('servers'),
        hideField: true,
        addBackup: true,
        editDesc: false,
        edit: false,
        slotCallback: row => {
          return (
            <side-page-trigger>{ row.name }</side-page-trigger>
          )
        },
      }),
      getStatusTableColumn({
        minWidth: 130,
        statusModule: 'server',
        slotCallback: row => {
          return [
            <div class='d-flex align-items-center text-truncate'>
              <status status={ row.status } statusModule='server' />
            </div>,
          ]
        },
      }),
      getIpsTableColumn({ field: 'ip', title: 'IP', vm: this }),
    ]
    this.handleNameChange = _.debounce(this.handleNameChange, 500)
    return {
      loading: false,
      detecting: false,
      title: this.$t('network.ssh-proxy.endpoints.create'),
      networkTitle: JSON.stringify(`${this.$t('network.text_565')}: `),
      generate_name: '',
      step: {
        steps: [
          { title: this.$t('network.ssh-proxy.endpoint.create.step1'), key: 'select-endpoint' },
          { title: this.$t('network.ssh-proxy.endpoint.create.step2'), key: 'create-ssh-endpoint' },
        ],
        currentStep: 0,
      },
      endpointForm: this.$form.createForm(this.$refs.endpointFormRef),
      decorators: {
        generate_name: [
          'generate_name',
          {
            rules: [
              { required: true, message: this.$t('network.text_116') },
              { validator: this.$validate('resourceName') },
            ],
          },
        ],
        description: ['description'],
        server_id: [
          'server_id',
          {
            rules: [
              { required: true, message: this.$t('network.text_60') },
            ],
          },
        ],
      },
      servers: [],
      searchValue: {},
      options: {
        name: getNameFilter(),
        ip_addr: {
          label: 'IP',
        },
      },
      ansibleTasks: {},
      areaselectsName: ['provider', 'cloudregion'],
      showSetupForm: false,
      sshableStatus: '',
      alertMessage: '',
      alertType: '',
      table1Key: 't1',
      table2Key: 't2',
      t2Params: {
        onManager: serverlist.onManager,
        data: [],
        columns: columns,
      },
      params: {
        onManager: serverlist.onManager,
        data: [],
        columns: columns,
      },
      showDomainSelect: showDomainSelect,
      filters: {
        project_domain: domain,
        vpc: '',
        network: '',
        region: '',
        brand: '',
      },
      currentIndex: 1,
      renderOrders: {
        project_domain: { order: 1, next: 'brand', params: { scope: this.$store.getters.scope } },
        brand: { order: 2, next: 'region', params: { scope: this.$store.getters.scope, project_domain: domain } },
        region: { order: 3, next: 'vpc', params: {} },
        vpc: { order: 4, next: 'network', params: {} },
        network: { order: 5, next: 'server', params: {}, optional: true },
        server: { order: 6, params: {} },
      },
      formItemLayout: {
        wrapperCol: {
          span: 22,
        },
        labelCol: {
          span: 2,
        },
      },
    }
  },
  computed: {
    isSetpOne () {
      return this.step.currentStep === 0
    },
    vmConfigurationLink () {
      const lang = this.$store.getters.setting.language
      if (lang === 'zh-CN') {
        return genDocsUrl({
          scope: this.$store.getters.domain,
          isSysCE: this.$store.getters.isSysCE,
          cePath: 'guides/onpremise/network/ssh/sshproxy/#虚拟机配置要求',
          eePath: 'web_ui/network/ssh/sshproxy/#虚拟机配置要求',
        })
      } else {
        return genDocsUrl({
          scope: this.$store.getters.domain,
          isSysCE: this.$store.getters.isSysCE,
          cePath: 'guides/onpremise/network/ssh/sshproxy/#server-configuration-requirements',
          eePath: 'web_ui/network/ssh/sshproxy/#server-configuration-requirements',
        })
      }
    },
  },
  created () {
    if (!this.showDomainSelect) {
      this.handleDomainChange(this.filters.project_domain)
    }
  },
  methods: {
    _params (base, key, value) {
      const ret = Object.assign({}, base)
      if (value) {
        ret[key] = value
      } else {
        if (key) delete ret[key]
      }
      return ret
    },
    async fetchServers () {
      if (this.waitRender('server')) return
      const extraParams = {
        limit: 50,
      }
      if (this.searchValue.name) extraParams.filter = `name.contains('${this.searchValue.name.join(',')}')`
      if (this.searchValue.ip_addr) extraParams.ip_addr = this.searchValue.ip_addr.join(',')
      const params = Object.assign({}, this.renderOrders.server.params, extraParams)
      try {
        const ret = await new this.$Manager('servers').list({ params })
        this.params.data = ret.data.data
        this.$nextTick(() => {
          this.table1Key += 1
        })
      } catch (e) {
        throw e
      }
    },
    setNextRender (key, params) {
      this.currentIndex = this.renderOrders[key].order
      this.renderOrders[key].params = params
      // for (const item in this.renderOrders) {
      //   if (this.renderOrders[item].order > this.currentIndex) {
      //     this.renderOrders[item].params = {}
      //   }
      // }
    },
    waitRender (key) {
      return this.currentIndex < this.renderOrders[key].order
    },
    handleDomainChange (e) {
      if (this.filters.domain !== e) {
        this.filters.domain = e
        if (e) {
          this.setNextRender('brand', this._params(this.renderOrders.project_domain.params, 'project_domain', e))
          this.$refs.areaSelects.fetchs(this.areaselectsName)
        }
      }
    },
    handleAreaChange (e) {
      if (e.hasOwnProperty('cloudregion')) {
        this.filters.region = e.cloudregion ? e.cloudregion.id : ''
        this.setNextRender('vpc', this._params(this.renderOrders.region.params, 'region', this.filters.region))
      }
      if (e.hasOwnProperty('provider')) {
        this.filters.brand = e.provider ? e.provider.id : ''
        this.setNextRender('region', this._params(this.renderOrders.brand.params, 'brand', this.filters.brand))
      }
    },
    handleVpcChange (e) {
      this.filters.vpc = e
      if (e || Object.keys(this.$refs.vpcSelects.resOpts).length === 0) {
        this.setNextRender('network', this._params(this.renderOrders.vpc.params, 'vpc', this.filters.vpc))
      }
    },
    handleNetworkChange (e) {
      this.filters.network = e
      if (e || Object.keys(this.$refs.networkSelects.resOpts).length === 0 || this.renderOrders.network.optional) {
        this.setNextRender('server', this._params(this.renderOrders.network.params, 'network', this.filters.network))
        this.fetchServers()
      }
    },
    search (e) {
      this.fetchServers()
    },
    vpcLabelFormat (item) {
      if (item.manager) {
        if (item.cidr_block) {
          return <div> { item.name }<span>（{ item.cidr_block }）</span><span class="ml-2 text-color-secondary">{this.$t('common_711')}: { item.manager }</span></div>
        }
        return <div> { item.name }<span class="ml-2 text-color-secondary">{this.$t('common_711')}: { item.manager }</span></div>
      }
      return <div>{ item.name }</div>
    },
    networkLabelFormat (item) {
      /* <span className="text-color-secondary option-prefix"></span> */
      return <div> { item.name } ({ item.guest_ip_start } - { item.guest_ip_end })</div>
    },
    handleRadioChange (row) {
      if (row) {
        this.t2Params.data = [row]
        this.servers = [row.id]
        this.endpointForm.setFieldsValue({ server_id: row.id })
      } else {
        this.t2Params.data = []
        this.servers = []
        this.endpointForm.setFieldsValue({ server_id: undefined })
      }

      this.table2Key += 1
    },
    handleSetupSSHTasks (tasks) {
      this.ansibleTasks = tasks
      this.table2Key += 1
    },
    handleNameChange (e) {
      this.generate_name = e.target.value
    },
    lastStep () {
      this.sshableStatus = ''
      this.showSetupForm = false
      this.step.currentStep = 0
    },
    async handleDetectStatusChange (e) {
      this.detecting = e
      if (this.sshableStatus || !this.detecting) {
        const newStatus = this.t2Params.data[0] ? this.t2Params.data[0].sshable_status : ''
        // 如果上次已经检测过状态，并且本次新状态是available，则可以直接创建endpoints
        if (this.sshableStatus && newStatus === 'available') {
          try {
            await this.submitEndpoint()
          } catch (e) {
            throw e
          }
        } else {
          if (newStatus !== 'available') {
            this.showSetupForm = true
            this.alertType = 'warning'
            this.alertMessage = this.$t('network.ssh-proxy.endpoint.create.step2.tips_failed')
          } else {
            this.alertType = 'success'
            this.showSetupForm = false
            this.alertMessage = this.$t('network.ssh-proxy.endpoint.create.step2.tips_success')
          }
          this.sshableStatus = newStatus
        }
      }
    },
    cloudregionParamsMapper (params) {
      const ret = { ...params }
      if (ret.provider === 'OneCloud') {
        delete ret.capability
      }
      return ret
    },
    handleCancel () {
      this.$router.push('/ssh-proxy')
    },
    validateForm (form) {
      return new Promise((resolve, reject) => {
        form.validateFieldsAndScroll({ scroll: { alignWithTop: true, offsetTop: 100 } }, (err, values) => {
          if (!err) {
            resolve(values)
          } else {
            reject(err)
          }
        })
      })
    },
    async submitEndpoint () {
      const values = await this.validateForm(this.endpointForm)
      await new this.$Manager('proxy_endpoints').performClassAction({ action: 'create-from-server', data: values })
      this.handleCancel()
    },
    async submitNextStep () {
      await this.validateForm(this.endpointForm)
      this.step.currentStep = 1
    },
    async submitMakeSshable () {
      await this.$refs.setupForm.submit()
    },
    async handleSubmit (e) {
      this.loading = true
      try {
        if (this.isSetpOne) {
          await this.submitNextStep()
        } else {
          if (this.showSetupForm) {
            await this.submitMakeSshable()
          }
          if (this.sshableStatus === 'available') {
            await this.submitEndpoint()
          }
        }
      } catch (err) {
        throw err
      } finally {
        this.loading = false
      }
    },
  },
}
</script>

<style scoped>
.vpc-selector .ant-select-selection-selected-value div:before {
  content: 'VPC:';
  color: rgba(0, 0, 0, 0.45);
}

.network-selector .ant-select-selection-selected-value div:before {
  content: var(--network-title);
  color: rgba(0, 0, 0, 0.45);
}
</style>
