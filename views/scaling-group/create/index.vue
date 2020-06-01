<template>
  <div>
    <page-header title="新建弹性伸缩组" />
    <a-form :form="form.fc" class="mt-3" v-bind="formItemLayout" style="padding:0 20px">
      <a-form-item class="mb-0" :label="`指定${$t('dictionary.project')}`">
        <domain-project :decorators="decorators.projectDomain" :fc="form.fc" :labelInValue="false" />
      </a-form-item>
      <a-form-item label="名称">
        <a-input :placeholder="$t('validator.serverCreateName')" v-decorator="decorators.generate_name" />
        <!-- <name-repeated
          v-slot:extra
          res="scalinggroups"
          default-text="名称支持有序后缀占位符‘#’，用法举例，名称host##，数量2，创建后实例的名称依次为host01、host02，已有同名实例，序号顺延"  /> -->
      </a-form-item>
      <a-form-item label="平台">
        <a-radio-group v-decorator="decorators.brand">
          <a-radio-button v-for="item in brands" :key="item" :value="item">{{item}}</a-radio-button>
        </a-radio-group>
      </a-form-item>
      <a-form-item label="主机模版">
        <a-select :filterOption="filterOption" showSearch @change="handleServerTemplateChange" v-decorator="decorators.guest_template_id" :loading="serverTemplateListLoading">
          <a-select-option v-for="item in serverTemplateList" :row="item" :key="item.id" :value="item.id">{{item.name}}</a-select-option>
        </a-select>
        <div slot="extra">
          选择主机模版为创建的弹性伸缩组内伸缩实例的配置模板
        </div>
      </a-form-item>
      <network-selects
        isRequired
        :decorators="networlDecorators"
        :isDefaultFetch="false"
        :defaultActiveFirstOption="false"
        :disabled="networlDisabled"
        ref="NETWORK"
        label="网络"
        :form="form"
        v-bind="formItemLayout"
        :networkParams="networkParams"
        :vpcParams="vpcParams" />
      <a-form-item label="最大实例数">
        <a-tooltip placement="top" title="范围在 1 ～ 1000">
          <a-input-number v-decorator="decorators.max_instance_number" :min="1" :max="1000" />
        </a-tooltip>
      </a-form-item>
      <a-form-item label="期望实例数">
        <a-tooltip placement="top" title="范围在 最小实例数～最大实例数">
          <a-input-number v-decorator="decorators.desire_instance_number" :min="form.fd.min_instance_number" :max="form.fd.max_instance_number" />
        </a-tooltip>
        <div slot="extra">
          该弹性伸缩组中期望运行的虚拟机个数，当新建完成后会自动创建与期望值相同数量的虚拟机
        </div>
      </a-form-item>
      <a-form-item label="最小实例数">
        <a-tooltip placement="top" :title="`范围在 0 ~ 期望实例数`">
          <a-input-number @blur="handleMinBlur" v-model="min" :min="0" :max="form.fd.desire_instance_number"  />
          <a-input v-show="false" v-decorator="decorators.min_instance_number" />
        </a-tooltip>
      </a-form-item>
      <a-form-item label="实例移除策略">
        <a-select v-decorator="decorators.shrink_principle">
          <a-select-option v-for="(v, k) in $t('flexGrouPprinciple')" :key="k" :value="k">{{v}}</a-select-option>
        </a-select>
      </a-form-item>
      <a-form-item required label="负载均衡">
        <a-radio-group v-model="isLoadbalancer">
          <a-radio-button :value="false">暂不绑定</a-radio-button>
          <a-tooltip v-if="form.fd.brand === 'Azure'" placement="top" title="Azure平台暂不支持此操作">
            <a-radio-button :disabled="true" :value="true">绑定</a-radio-button>
          </a-tooltip>
          <a-radio-button v-else :value="true">绑定</a-radio-button>
        </a-radio-group>
        <div v-if="isLoadbalancer" style="max-width: 920px">
          <bind-lb :fc="form.fc" ref="BIND_LB" />
        </div>
      </a-form-item>
      <a-form-item label="健康检查方式">
        <a-select v-decorator="decorators.health_check_mode">
          <template v-for="(v, k) in $t('flexGroupHealthCheckMode')">
            <a-select-option v-if="k !== 'loadbalancer' || (isLoadbalancer && k === 'loadbalancer')" :key="k" :value="k">{{v}}</a-select-option>
          </template>
        </a-select>
      </a-form-item>
      <a-form-item label="检查周期">
        <a-select v-decorator="decorators.health_check_cycle">
          <a-select-option v-for="(v, k) in $t('flexGroupCycles')" :key="k" :value="parseInt(k)">{{v}}</a-select-option>
        </a-select>
      </a-form-item>
      <a-form-item label="健康状态检查宽限期">
        <a-input-number :min="1"  v-decorator="decorators.health_check_gov" /> 秒
        <div slot="extra">
          实例创建成功后，伸缩组会在健康状况检查宽限期结束后才开始进行健康检查
        </div>
      </a-form-item>
    </a-form>
    <page-footer>
      <div slot="right">
        <a-button class="mr-3" type="primary" @click="handleConfirm" :loading="loading">确 定</a-button>
        <a-button @click="handleCancel">取 消</a-button>
      </div>
    </page-footer>
  </div>
</template>

<script>
import BindLb from '../components/BindLb'
import { DECORATORS, BRANDS } from '../constants'
import DomainProject from '@/sections/DomainProject'
// import NameRepeated from '@/sections/NameRepeated'
import NetworkSelects from '@/sections/NetworkSelects'
import { getInitialValue } from '@/utils/common/ant'
import { typeClouds } from '@/utils/common/hypervisor'

export default {
  name: 'ScalingGroupCreae',
  components: {
    BindLb,
    DomainProject,
    // NameRepeated,
    NetworkSelects,
  },
  data () {
    const initFd = getInitialValue(DECORATORS)
    return {
      min: 0,
      BRANDS,
      decorators: DECORATORS,
      loading: false,
      isLoadbalancer: false,
      serverTemplateListLoading: false,
      serverTemplateList: [],
      healthCheckModeList: [],
      networlDisabled: false,
      form: {
        fc: this.$form.createForm(this, {
          onValuesChange: this.handleValuesChange,
        }),
        fd: { ...initFd },
      },
      formItemLayout: {
        labelCol: { span: 3 },
        wrapperCol: { span: 20 },
      },
      isDeleteVpc: false,
      isDeleteNetwork: false,
    }
  },
  provide () {
    return {
      form: this.form,
    }
  },
  computed: {
    capabilityBrands () {
      return this.$store.getters.capability.brands
    },
    brands () {
      return BRANDS.filter(brand => {
        return this.capabilityBrands.indexOf(brand) > -1
      })
    },
    project_domain () {
      return this.form.fd.domain ? this.form.fd.domain : this.$store.getters.userInfo.projectDomainId
    },
    project () {
      return this.form.fd.project ? this.form.fd.project : this.$store.getters.userInfo.projectId
    },
    scopeParams () {
      if (this.$store.getters.isAdminMode) {
        return {
          project_domain: this.project_domain,
          tenant: this.form.fd.project,
        }
      }
      return { scope: this.$store.getters.scope }
    },
    networlDecorators () {
      return {
        vpc: ['vpc', {
          validateFirst: true,
          rules: [
            { required: true, message: '请选择VPC' },
            {
              validator: (rule, value, _cb) => {
                if (this.isDeleteVpc) {
                  return _cb('该网络资源已缺失')
                }
                _cb()
              },
            },
          ],
        }],
        network: ['network', {
          validateFirst: true,
          rules: [
            { required: true, message: '请选择IP子网' },
            {
              validator: (rule, value, _cb) => {
                if (this.isDeleteNetwork) {
                  return _cb('该网络资源已缺失')
                }
                _cb()
              },
            },
          ],
        }],
      }
    },
  },
  watch: {
    isLoadbalancer (v) {
      if (v) {
        this.$nextTick(() => {
          this.$refs['BIND_LB'].fetchQueryLbs(this.form.fd.vpc)
        })
      }
      this.form.fc.setFieldsValue({
        health_check_mode: v ? 'loadbalancer' : 'normal',
      })
    },
  },
  created () {
    this.form.fc.getFieldDecorator('cloudregion', { preserve: true })
  },
  methods: {
    filterOption (input, option) {
      return (
        option.componentOptions.children[0].text.toLowerCase().indexOf(input.toLowerCase()) >= 0
      )
    },
    async handleMinBlur ({ target }) {
      const val = parseInt(target.value || 0)
      const { setFieldsValue } = this.form.fc
      await this.$nextTick()
      setFieldsValue({
        min_instance_number: val || undefined,
      })
    },
    // domainChange () {
    //   this.fetchQueryTs()
    //   this.$refs['NETWORK'].fetchs()
    // },
    projectChange () {
      if (this.brands && this.brands.length > 0) {
        this.form.fc.setFieldsValue({
          brand: this.brands[0],
        })
      }
    },
    vpcChange () {
      if (this.isLoadbalancer) {
        this.$refs['BIND_LB'].fetchQueryLbs(this.form.fd.vpc)
      }
    },
    brandChange () {
      const { brand } = this.form.fd
      if (brand === 'Azure') {
        this.isLoadbalancer = false
      }
      this.fetchQueryTs()
    },
    templateChange () {
      this.isDeleteVpc = false
      this.isDeleteNetwork = false
      const { fc } = this.form
      this.$refs['NETWORK'].fetchs(async (rets) => {
        await this.$nextTick()
        const { vpcList, networkList } = rets
        // 判断当前选择的主机模版中的VPC是否存在VPC列表中
        const _vpcId = fc.getFieldValue('vpc')
        if (vpcList !== undefined && _vpcId) {
          this.isDeleteVpc = vpcList.length === 0 || !vpcList.find(item => item.id === _vpcId)
          fc.validateFields(['vpc'])
        }
        // 判断当前选择的主机模版中的netwrok是否存在netwrok列表中
        const _networkId = fc.getFieldValue('network')
        if (networkList !== undefined && _networkId) {
          this.isDeleteNetwork = networkList.length === 0 || !networkList.find(item => item.id === _networkId)
          fc.validateFields(['network'])
        }
      })
    },
    async handleValuesChange (vm, changedFields) {
      this.form.fd = {
        ...this.form.fd,
        ...changedFields,
      }
      await this.$nextTick()
      if (changedFields.project) {
        this.projectChange()
      }
      if (changedFields.brand) {
        this.brandChange()
      }
      if (changedFields.guest_template_id) {
        this.templateChange()
      }
      if (changedFields.vpc || Object.keys(changedFields).indexOf('vpc') > -1) {
        this.vpcChange()
      }
    },
    vpcParams () {
      const { brand } = this.form.fd
      return {
        brand,
        ...this.scopeParams,
      }
    },
    networkParams () {
      return {
        ...this.scopeParams,
      }
    },
    setNetworkValues (row) {
      if (row.config_info && row.config_info.nets && row.config_info.nets.length > 0) {
        const net = row.config_info.nets[0]
        if (net.vpc_id && net.id) {
          this.form.fc.setFieldsValue({
            vpc: net.vpc_id,
            network: net.id,
          })
          this.networlDisabled = true
          return true
        }
      }
      this.form.fc.setFieldsValue({
        vpc: undefined,
        network: undefined,
      })
      this.networlDisabled = false
    },
    handleServerTemplateChange (e, { data }) {
      const { row } = data.attrs
      this.setNetworkValues(row)
      this.form.fc.setFieldsValue({
        cloudregion: row.cloudregion_id,
      })
    },
    async fetchQueryTs () {
      const manager = new this.$Manager('servertemplates')
      // console.log(this.form.fd)
      const { brand } = this.form.fd
      this.serverTemplateListLoading = true
      try {
        const { data } = await manager.list({
          params: {
            limit: 0,
            brand,
            filter: 'status.in(ready)',
            ...this.scopeParams,
          },
        })
        if (data.data && data.data.length > 0) {
          const list = data.data
          this.serverTemplateList = list.filter(t => {
            const isNats = t.config_info && t.config_info.nets && t.config_info.nets.length === 1
            return isNats
          })
          this.setNetworkValues(this.serverTemplateList[0])
          this.form.fc.setFieldsValue({
            cloudregion: this.serverTemplateList[0].cloudregion_id,
          })
        } else {
          this.serverTemplateList = []
        }
      } catch (err) {
        throw err
      } finally {
        this.serverTemplateListLoading = false
        const list = this.serverTemplateList
        this.form.fc.setFieldsValue({
          guest_template_id: (list && list.length > 0) ? list[0].id : undefined,
        })
      }
    },
    formatValues (values) {
      const { brand, network } = values
      if (network) {
        values['networks'] = [network]
        delete values.network
      }
      if (brand && typeClouds.brandMap[brand]) {
        values['hypervisor'] = typeClouds.brandMap[brand].hypervisor
      }
      return values
    },
    handleCancel () {
      this.$router.push({
        name: 'ScalingGroup',
      })
    },
    async handleConfirm () {
      const { validateFields } = this.form.fc
      const manager = new this.$Manager('scalinggroups', 'v1')
      try {
        const values = await validateFields()
        this.loading = true
        await manager.create({
          data: Object.assign({}, this.formatValues(values)),
        })
        this.handleCancel()
      } catch (err) {
        throw err
      } finally {
        this.loading = false
      }
    },
  },
}
</script>

<style>

</style>
