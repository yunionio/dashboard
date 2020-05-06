<template>
  <div>
    <a-card v-for="item in ruleList" class="mb-3" :key="item.key">
      <a-form-item>
        <a-input v-decorator="decorators.host(item.key)" placeholder="请输入host" />
      </a-form-item>
      <a-card class="mb-2" v-for="(val, i) in item.routes" :key="val.k">
        <a-row :gutter="1">
          <a-col :span="16">
            <a-form-item>
              <base-select
                v-decorator="decorators.services(item.key).serviceName(val.k)"
                resource="k8s_services"
                version="v1"
                :need-params="true"
                filterable
                :params="serviceParams"
                id-key="name"
                :item.sync="val.service"
                :select-props="{  placeholder: '请选择服务' }" />
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item>
              <!-- <base-select
                :options="genPortOpts(val.service)"
                idKey="port"
                nameKey="port"
                v-decorator="decorators.services(item.key).servicePort(val.k)"
                :select-props="{  placeholder: '请选择端口' }" /> -->
              <a-select v-decorator="decorators.services(item.key).servicePort(val.k)" placeholder="请选择端口">
                <a-select-option v-for="v in genPortOpts(val.service)" :key="v.port" :value="v.port">{{ v.port }}</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>
        <a-form-item>
          <a-input v-decorator="decorators.services(item.key).servicePath(val.k)" placeholder="请输入Path，以 / 开头" />
        </a-form-item>
        <a class="ml-2 error-color" @click="remvoeRoute(item.routes, i)" v-if="item.routes.length > 1">删除</a>
      </a-card>
      <a-button class="mt-2" type="primary" icon="plus" @click="addRoute(item)">添加路由</a-button>
      <a-button class="ml-2" type="danger" @click="removeRule(item)" v-if="ruleList.length > 1">删除</a-button>
    </a-card>
    <a-button type="primary" icon="plus" @click="addRule">添加规则</a-button>
  </div>
</template>

<script>
import { uuid } from '@/utils/utils'

export default {
  name: 'IngressCreateRouterRules',
  props: {
    decorators: {
      type: Object,
      required: true,
    },
    cluster: {
      type: String,
    },
    namespace: {
      type: String,
    },
  },
  data () {
    const key = uuid()
    return {
      ruleList: [{
        key,
        routes: [
          { k: uuid(), service: {} },
        ],
      }],
    }
  },
  computed: {
    serviceParams () {
      if (this.namespace && this.cluster) {
        return {
          namespace: this.namespace,
          cluster: this.cluster,
          scope: this.$store.getters.scope,
          limit: 0,
          details: true,
          admin: this.$store.getters.isAdminMode,
        }
      }
      return {}
    },
  },
  methods: {
    addRule () {
      const key = uuid()
      this.ruleList.push({
        key,
        routes: [
          { k: uuid(), ports: [] },
        ],
      })
    },
    removeRule (item) {
      const index = this.ruleList.findIndex(val => val.key === item.key)
      this.ruleList.splice(index, 1)
    },
    addRoute (item) {
      item.routes.push({ k: uuid(), ports: [] },)
    },
    remvoeRoute (item, i) {
      item.splice(i, 1)
    },
    genPortOpts (service) {
      if (service && service.internalEndpoint && service.internalEndpoint.ports) {
        return service.internalEndpoint.ports.filter(val => val.protocol && val.protocol.toLowerCase() === 'tcp') // 仅支持tcp协议，不知udp协议（没有http/https）
      }
      return []
    },
  },
}
</script>
