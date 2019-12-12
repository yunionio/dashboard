<template>
  <div>
    <a-form-item class="mb-0">
      <a-radio-group v-decorator="decorators.type" :disabled="disabled" @change="handleTypeChange">
        <a-radio-button
          v-for="item of types"
          :key="item.key"
          :value="item.key">{{ item.label }}</a-radio-button>
      </a-radio-group>
    </a-form-item>
    <a-form-item class="mb-0" v-if="isBind">
      <div slot="extra">
        没有想要的安全组？可以前往
        <help-link :href="href"> 新建安全组</help-link>
      </div>
      <base-select
        remote
        class="w-50 pr-1"
        v-decorator="decorators.secgroup"
        resource="secgroups"
        :params="params"
        :select-props="{ allowClear: true, placeholder: '请选择安全组' }" />
    </a-form-item>
  </div>
</template>

<script>

const types = {
  none: {
    key: 'default',
    label: '默认',
  },
  bind: {
    key: 'bind',
    label: '指定安全组',
  },
}

export default {
  name: 'SecgroupConfig',
  props: {
    decorators: {
      type: Object,
      required: true,
      validator: val => val.type && val.secgroup,
    },
    secgroupParams: {
      type: Object,
    },
    form: {
      type: Object,
    },
    isSnapshotImageType: { // 表单的镜像类型是否是主机快照
      type: Boolean,
      default: false,
    },
  },
  data () {
    return {
      types,
      isBind: this.decorators.type[1].initialValue === types.bind.key,
      loading: false,
      disabled: false,
    }
  },
  computed: {
    params () {
      const defaultSecgroupParams = {
        limit: 0,
        scope: this.$store.getters.scope,
      }
      return {
        ...defaultSecgroupParams,
        ...this.secgroupParams,
      }
    },
    href () {
      const url = this.$router.resolve('/secgroup')
      return url.href
    },
  },
  watch: {
    isSnapshotImageType (val) {
      if (val) {
        this.disabled = true
        this.form.fc.setFieldsValue({
          [this.decorators.type[0]]: types.none.key,
        })
      } else {
        this.disabled = false
      }
    },
  },
  methods: {
    handleTypeChange (e) {
      this.isBind = (e.target.value === types.bind.key)
    },
  },
}
</script>
