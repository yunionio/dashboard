<template>
  <div>
    <page-header title="新建弹性伸缩组" />
    <a-form :form="form.fc" class="mt-3" v-bind="formItemLayout" style="padding:0 20px">
      <a-form-item class="mb-0" :label="`指定${$t('dictionary.project')}`">
        <domain-project :decorators="decorators.projectDomain" :fc="form.fc" :labelInValue="false" />
      </a-form-item>
      <a-form-item label="名称">
        <a-input :placeholder="$t('validator.serverCreateName')" v-decorator="decorators.generate_name" />
        <name-repeated
          v-slot:extra
          res="scalinggroups"
          default-text="名称支持有序后缀占位符‘#’，用法举例，名称host##，数量2，创建后实例的名称依次为host01、host02，已有同名实例，序号顺延"  />
      </a-form-item>
      <a-form-item label="平台">
         <a-radio-group v-decorator="decorators.brand">
           <a-radio-button v-for="item in BRANDS" :key="item" :value="item">{{item}}</a-radio-button>
         </a-radio-group>
      </a-form-item>
      <a-form-item label="主机模版">
        <a-select @change="handleServerTemplateChange" v-decorator="decorators.guest_template_id" :loading="serverTemplateListLoading">
          <a-select-option v-for="item in serverTemplateList" :row="item" :key="item.id" :value="item.id">{{item.name}}</a-select-option>
        </a-select>
        <div slot="extra">
          选择主机模版为创建的弹性伸缩组内伸缩实例的配置模板
        </div>
      </a-form-item>
      <network-selects
        isRequired
        ref="NETWORK"
        label="网络"
        :form="form"
        v-bind="formItemLayout"
        :vpcParams="scopeParams" />
      <a-form-item label="最大实例数">
        <a-tooltip placement="top" title="范围在 1 ～ 1000">
           <a-input-number v-decorator="decorators.max_instance_number" :min="1" :max="1000" />
        </a-tooltip>
      </a-form-item>
      <a-form-item label="期望实例数">
        <a-tooltip placement="top" title="范围在 0 ～ 最大实例数">
          <a-input-number v-decorator="decorators.desire_instance_number" :min="0" :max="form.fd.max_instance_number" />
        </a-tooltip>
        <div slot="extra">
          该弹性伸缩组中期望运行的虚拟机个数，当新建完成后会自动创建与期望值相同的虚拟机
        </div>
      </a-form-item>
      <a-form-item label="最小实例数">
        <a-tooltip placement="top" :title="`范围在 0 ~ 期望实例数`">
          <a-input-number onChange="handleMinNumberChange" v-decorator="decorators.min_instance_number" :min="0" :max="form.fd.desire_instance_number"  />
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
            <a-radio-button :value="true">绑定</a-radio-button>
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
import NameRepeated from '@/sections/NameRepeated'
import NetworkSelects from '@/sections/NetworkSelects'
import { getInitialValue } from '@/utils/common/ant'

export default {
  name: 'ScalingGroupCreae',
  components: {
    BindLb,
    DomainProject,
    NameRepeated,
    NetworkSelects,
  },
  data () {
    const initFd = getInitialValue(DECORATORS)
    return {
      BRANDS,
      decorators: DECORATORS,
      loading: false,
      isLoadbalancer: false,
      serverTemplateListLoading: false,
      serverTemplateList: [],
      healthCheckModeList: [],
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
    }
  },
  computed: {
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
        }
      }
      return { scope: this.$store.getters.scope }
    },
  },
  watch: {
    isLoadbalancer (v) {
      if (v) {
        this.$nextTick(() => {
          this.$refs['BIND_LB'].fetchQueryLbs(this.form.fd.vpc)
        })
      }
    },
  },
  created () {
    if (!this.$store.getters.isAdminMode) {
      this.fetchQueryTs()
    }
  },
  methods: {
    domainChange () {
      this.fetchQueryTs()
      this.$refs['NETWORK'].fetchs()
    },
    vpcChange (vpcId) {
      if (this.isLoadbalancer) {
        this.$refs['BIND_LB'].fetchQueryLbs(vpcId)
      }
    },
    // numberChange (v) {
    //   const { fd, fc } = this.form
    //   if (fd.min_instance_number >= fd.max_instance_number) {
    //     fc.setFields({
    //       min_instance_number: {
    //         value: fd.min_instance_number,
    //         errors: [new Error('最小实例数要小于等于期望是例数、最大实例数')],
    //       },
    //     })
    //   }
    // },
    handleValuesChange (vm, changedFields) {
      this.form.fd = {
        ...this.form.fd,
        ...changedFields,
      }
      this.$nextTick(() => {
        if (changedFields.domain) {
          this.domainChange()
        }
        if (changedFields.vpc) {
          this.vpcChange()
        }
        if (changedFields.min_instance_number || changedFields.max_instance_number) {
          // this.numberChange()
        }
      })
    },
    handleServerTemplateChange (e, { data }) {
      const { row } = data.attrs
      if (row.config_info && row.config_info.nets && row.config_info.nets.length > 0) {
        const net = row.config_info.nets[0]
        if (net.vpc_id && net.id) {
          this.form.fc.setFieldsValue({
            vpc: net.vpc_id,
            network: net.id,
          })
        }
      }
    },
    async fetchQueryTs () {
      const manager = new this.$Manager('servertemplates')
      this.serverTemplateListLoading = true
      try {
        const { data } = await manager.list({
          params: {
            limit: 0,
            ...this.scopeParams,
          },
        })
        this.serverTemplateList = data.data || []
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
      if (values.network) {
        values['networks'] = [values.network]
        delete values.network
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
      const defaultParams = {
        cloudregion: 'default',
        hypervisor: 'kvm',
      }
      try {
        const values = await validateFields()
        this.loading = true
        await manager.create({
          data: Object.assign({}, defaultParams, this.formatValues(values)),
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
