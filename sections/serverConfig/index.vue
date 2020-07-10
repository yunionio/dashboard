<template>
  <div>
    <a-card class="mb-2 card" hoverable v-for="(item, i) in serverConfigList" :key="item.key">
      <a-form-item label="CPU" v-bind="formItemLayout">
        <a-input-number v-decorator="decorator.vcpu_count(i)" :formatter="value => `${value}核`" :parser="value => value.replace('核', '')" :min="2" :max="32" />
      </a-form-item>
      <a-form-item label="内存" v-bind="formItemLayout">
        <a-input-number v-decorator="decorator.vmem_size(i)" :formatter="value => `${value}G`" :parser="value => value.replace('G', '')" :min="1" :max="128" />
      </a-form-item>
      <a-form-item label="磁盘" v-bind="formItemLayout">
        <a-input-number v-decorator="decorator.disk(i)" :formatter="value => `${value}G`" :parser="value => value.replace('G', '')" :min="40" :max="500" />
      </a-form-item>
      <a-form-item label="IP子网" v-bind="formItemLayout" required>
        <a-row :gutter="8">
          <a-col :span="12">
            <a-form-item
              :wrapperCol="{ span: 24 }"
              style="min-width: 200px;"
              class="w-100 mb-0 mr-1">
              <base-select
                class="w-100"
                v-decorator="decorator.network(i)"
                resource="networks"
                remote
                :item.sync="item.network"
                :need-params="true"
                :params="networkParams"
                :mapper="networkResourceMapper"
                :select-props="{ allowClear: true, placeholder: '请选择IP子网' }" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item class="mb-0 mr-2" v-if="item.ipShow" :wrapperCol="{ span: 24 }">
              <a-input
                placeholder="请输入子网内的IP地址"
                @change="e => ipChange(e, i)"
                v-decorator="decorator.ip(i, item.network)" />
            </a-form-item>
            <a-button v-else type="link" class="mr-1 mt-1" @click="showIp(item)">手动配置IP</a-button>
          </a-col>
        </a-row>
      </a-form-item>
      <a-form-item :label="$t('dictionary.role')" v-bind="formItemLayout">
        <a-select
          v-decorator="decorator.role(i)"
          :placeholder="`请选择${$t('dictionary.role')}`">
          <a-select-option
            v-for="item in roleList"
            :key="item.value"
            :value="item.value">
            {{ item.label }}
          </a-select-option>
        </a-select>
      </a-form-item>
      <a-form-item label="数量" v-bind="formItemLayout" extra="机器数量范围：1-10 台">
        <a-input-number v-decorator="decorator.num(i)" :min="1" :max="item.ipShow ? 1 : 10" />
      </a-form-item>
      <a-button v-if="serverConfigList.length > 1" shape="circle" icon="minus" size="small" @click="decrease(item.key, i)" class="mt-2 decrease" />
    </a-card>
    <div class="d-flex align-items-center" v-if="serverConfigRemaining > 0">
      <a-button type="primary" shape="circle" icon="plus" size="small" @click="add" />
      <a-button type="link" @click="add">添加机器</a-button>
      <span class="network-count-tips">您还可以添加 <span class="remain-num">{{ serverConfigRemaining }}</span> 种机器配置</span>
    </div>
  </div>
</template>

<script>
import * as R from 'ramda'
import { mapGetters } from 'vuex'
import { NODE_ROLE_MAP } from '../../views/cluster/constants'
import { uuid } from '@/utils/utils'

export default {
  name: 'K8SClusterServerConfig',
  props: {
    decorator: {
      type: Object,
      required: true,
    },
    networkResourceMapper: {
      type: Function,
      default: (data) => { return data },
    },
    networkParams: {
      type: Object,
      required: true,
    },
  },
  inject: ['form'],
  data () {
    const roleList = []
    R.forEachObjIndexed((value, key) => {
      roleList.push({ label: value, value: key })
    }, NODE_ROLE_MAP)
    return {
      formItemLayout: {
        wrapperCol: { span: 20 },
        labelCol: { span: 3 },
      },
      serverConfigList: [],
      limit: 10,
      roleList,
    }
  },
  computed: {
    ...mapGetters(['isAdminMode', 'scope', 'isDomainMode', 'userInfo', 'l3PermissionEnable']),
    serverConfigRemaining () {
      return this.limit - this.serverConfigList.length
    },
  },
  created () {
    this.add()
  },
  methods: {
    showIp (item) {
      item.ipShow = true
    },
    ipChange (e, i) {
      this.serverConfigList[i].ip = e.target.value
    },
    decrease (uid, index) {
      this.serverConfigList.splice(index, 1)
    },
    add () {
      const uid = uuid()
      const data = {
        ipShow: false,
        key: uid,
      }
      this.serverConfigList.push(data)
    },
  },
}
</script>
<style lang="less">
  .card {
    position: relative;
    .decrease {
      color: #f5222d;
      border-color: #f5222d;
      position: absolute;
      top: 50%;
      right: -40px;
    }
  }
</style>
