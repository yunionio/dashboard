<template>
  <component
    ref="usage"
    :is="type"
    :type="type"
    :visible.sync="visible"
    :formItemLayout="formItemLayout"
    :options="options"
    @update="update"
    :params="params"
    :edit="edit">
    <a-row class="mb-4">
      <a-col :span="formItemLayout.labelCol.span" class="ant-form-item-label">
        <label>{{$t('dashboard.text_24')}}</label>
      </a-col>
      <a-col :span="formItemLayout.wrapperCol.span">
        <a-radio-group v-model="type">
          <a-radio-button v-for="item in typeOpts" :key="item.key" :value="item.key">{{ item.label }}</a-radio-button>
        </a-radio-group>
      </a-col>
    </a-row>
    <template v-slot:actions="{ handleEdit }"><slot name="actions" :handleEdit="handleEdit" /></template>
  </component>
</template>

<script>
import { mapGetters } from 'vuex'
import { hasSetupKey } from '@/utils/auth'
import Server from './components/Server'
import K8s from './components/K8s'
import Identity from './components/Identity'

export default {
  name: 'NumberCard',
  components: {
    Server,
    K8s,
    Identity,
  },
  props: {
    options: {
      type: Object,
      required: true,
    },
    params: Object,
    edit: Boolean,
  },
  data () {
    return {
      type: (this.params && this.params.type) || 'server',
      visible: false,
      formItemLayout: {
        wrapperCol: {
          span: 18,
        },
        labelCol: {
          span: 6,
        },
      },
    }
  },
  computed: {
    ...mapGetters(['isAdminMode']),
    typeOpts () {
      const typeOps = []
      if (hasSetupKey(['onestack', 'openstack', 'dstack', 'zstack', 'public', 'vmware', 'bill'])) {
        typeOps.push({ key: 'server', label: this.$t('dashboard.text_25') })
      }
      if (hasSetupKey(['k8s'])) {
        typeOps.push({ key: 'k8s', label: this.$t('dashboard.text_26') })
      }
      if (this.isAdminMode) {
        typeOps.push({ key: 'identity', label: this.$t('dashboard.system_resource') })
      }
      return typeOps
    },
  },
  watch: {
    visible (v) {
      if (!v) { // 当关闭抽屉的时候重置type
        this.type = (this.params && this.params.type) || 'server'
      }
    },
    typeOpts (opts) {
      if (this.params?.type === 'identity' && !opts.find(item => item.key === 'identity')) {
        return
      }
      if (!opts.find(item => item.key === this.type)) {
        this.type = (opts[0] && opts[0].key) || 'server'
      }
    },
  },
  methods: {
    update (...ret) {
      this.$emit('update', ...ret)
    },
    refresh () {
      return this.$refs.usage.refresh()
    },
  },
}
</script>
