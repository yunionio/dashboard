<template>
  <a-input-group compact>
    <a-form-item style="width: 28%" :wrapperCol="{ span: 24 }">
      <a-select class="w-100" @change="handleLbChange" v-decorator="decorators.loadbalancer_id" placeholder="请选择负载均衡实例">
        <a-select-option v-for="item in loadbalancerList" :key="item.id" :value="item.id">{{item.name}}</a-select-option>
      </a-select>
      <div slot="extra" style="white-space:nowrap;">
        负载均衡VPC需与该弹性伸缩组一致
      </div>
    </a-form-item>
    <a-form-item style="width: 28%" :wrapperCol="{ span: 24 }">
      <a-select  class="w-100" v-decorator="decorators.lb_backend_group" placeholder="请选择后台服务器组">
        <a-select-option v-for="item in groupList" :key="item.id" :value="item.id">{{item.name}}</a-select-option>
      </a-select>
    </a-form-item>
    <a-row style="width: 28%">
      <a-col :span="11" style="text-align: right;">
        <span class="ant-form-item-label">服务器组端口： </span>
      </a-col>
      <a-col :span="12">
        <a-form-item :wrapperCol="{ span: 24 }">
          <a-tooltip title="端口范围在 1～65535 之间" placement="top">
            <a-input-number class="w-100" :min="1" :max="65535" v-decorator="decorators.loadbalancer_backend_port" />
          </a-tooltip>
        </a-form-item>
      </a-col>
    </a-row>
    <a-row style="width: 15%">
      <a-col :span="10" style="text-align: right;">
        <span class="ant-form-item-label">权重： </span>
      </a-col>
      <a-col :span="14">
        <a-form-item :wrapperCol="{ span: 24 }">
          <a-tooltip title="权重范围在 1～256 之间" placement="top">
            <a-input-number class="w-100" :min="1" :max="256" v-decorator="decorators.loadbalancer_backend_weight" />
          </a-tooltip>
        </a-form-item>
      </a-col>
    </a-row>
  </a-input-group>
</template>

<script>
import { DECORATORS } from '../constants'

export default {
  name: 'BindLb',
  props: ['fc'],
  data () {
    return {
      decorators: DECORATORS,
      loadbalancerListLoading: false,
      loadbalancerList: [],
      groupListLoading: false,
      groupList: [],
    }
  },
  methods: {
    handleLbChange (id) {
      this.fetchQueyrGroups(id)
    },
    async fetchQueryLbs (vpc) {
      if (!vpc) {
        this.loadbalancerList = []
        this.groupList = []
        this.fc.setFieldsValue({
          loadbalancer_id: undefined,
          lb_backend_group: undefined,
        })
        return false
      }
      const manager = new this.$Manager('loadbalancers')
      this.loadbalancerListLoading = true
      try {
        const { data } = await manager.list({
          params: {
            limit: 0,
            vpc,
            status: 'enabled',
          },
        })
        this.loadbalancerList = data.data || []
      } catch (err) {
        throw err
      } finally {
        this.loadbalancerListLoading = false
        const list = this.loadbalancerList
        const id = (list && list.length > 0) ? list[0].id : undefined
        this.fc.setFieldsValue({
          loadbalancer_id: id,
        }, () => {
          if (id) {
            this.fetchQueyrGroups(id)
          }
        })
      }
    },
    async fetchQueyrGroups (loadbalancer) {
      const manager = new this.$Manager('loadbalancerbackendgroups')
      try {
        this.groupListLoading = false
        const { data } = await manager.list({
          params: {
            limit: 0,
            loadbalancer,
          },
        })
        this.groupList = data.data || []
      } catch (err) {
        throw err
      } finally {
        this.groupListLoading = false
      }
    },
  },
}
</script>
