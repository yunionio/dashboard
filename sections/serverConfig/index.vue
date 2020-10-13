<template>
  <div>
    <a-card class="mb-2 card" v-for="(item, i) in serverConfigList" :key="item.key">
      <a-button v-if="i !== 0" @click="decrease(item.key, i)" type="link" size="small" class="error-color position-absolute" style="right: 10px; top: 10px;">{{ $t('common.delete') }}</a-button>
      <a-form-item label="CPU" v-bind="formItemLayout">
        <a-input-number v-decorator="decorator.vcpu_count(i)" :formatter="value => $t('k8s.text_119', [value])" :parser="v => parser(v, $t('k8s.text_100'))" :min="4" :max="32" />
      </a-form-item>
      <a-form-item :label="$t('k8s.text_101')" v-bind="formItemLayout">
        <a-input-number v-decorator="decorator.vmem_size(i)" :formatter="value => `${value}G`" :parser="v => parser(v, 'G')" :min="1" :max="128" />
      </a-form-item>
      <a-form-item :label="$t('k8s.text_120')" v-bind="formItemLayout">
        <a-input-number v-decorator="decorator.disk(i)" :formatter="value => `${value}G`" :parser="v => parser(v, 'G', '100')" :min="40" :max="500" />
      </a-form-item>
      <a-form-item :label="$t('k8s.text_121')" v-bind="formItemLayout" required>
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
                :select-props="{ allowClear: true, placeholder: $t('k8s.text_122') }" />
            </a-form-item>
          </a-col>
          <a-col :span="10" v-if="item.ipShow">
            <a-form-item class="mb-0 mr-2" :wrapperCol="{ span: 24 }">
              <a-input
                :placeholder="$t('k8s.text_123')"
                @change="e => ipChange(e, i)"
                v-decorator="decorator.ip(i, item.network)" />
            </a-form-item>
          </a-col>
          <a-col :span="2">
            <a-button v-if="item.ipShow" type="link" class="mr-1 mt-1" @click="hideIp(item)">{{$t('k8s.text_410')}}</a-button>
            <a-button v-else type="link" class="mr-1 mt-1" @click="showIp(item)">{{$t('k8s.text_124')}}</a-button>
          </a-col>
        </a-row>
      </a-form-item>
      <a-form-item :label="$t('dictionary.role')" v-bind="formItemLayout">
        <a-select
          v-decorator="decorator.role(i)"
          :placeholder="$t('k8s.text_118', [$t('dictionary.role')])">
          <a-select-option
            v-for="item in roleList"
            :key="item.value"
            :value="item.value">
            {{ item.label }}
          </a-select-option>
        </a-select>
      </a-form-item>
      <a-form-item :label="$t('k8s.text_125')" v-bind="formItemLayout" :extra="$t('k8s.text_126')">
        <a-input-number v-decorator="decorator.num(i)" :min="1" :max="item.ipShow ? 1 : 10"  :parser="v => parser(v, '', '1')" />
      </a-form-item>
    </a-card>
    <div class="d-flex align-items-center" v-if="serverConfigRemaining > 0">
      <a-button type="primary" shape="circle" icon="plus" size="small" @click="add" />
      <a-button type="link" @click="add">{{$t('k8s.text_127')}}</a-button>
      <span class="network-count-tips">{{$t('k8s.text_128')}}<span class="remain-num">{{ serverConfigRemaining }}</span>{{$t('k8s.text_129')}}</span>
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
    hideIp (item) {
      item.ipShow = false
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
    parser (val, unit, defaultValue = '4') {
      const value = val.replace(unit, '')
      const valueNum = Number(value)
      console.log({ val, unit, value, valueNum })
      if (!Number.isNaN(valueNum) && R.is(Number, valueNum)) {
        return value
      }
      return defaultValue
    },
  },
}
</script>
