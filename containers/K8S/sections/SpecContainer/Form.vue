<template>
  <div>
    <a-form-item :label="$t('k8s.text_41')">
      <a-input :placeholder="$t('k8s.text_60')" v-decorator="decorators.name" />
    </a-form-item>
    <a-form-item :label="$t('k8s.text_97')">
      <a-input :placeholder="$t('k8s.text_98')" v-decorator="decorators.image" />
    </a-form-item>
    <a-form-item label="CPU">
      <a-input :placeholder="$t('k8s.text_99')" type="number" v-decorator="decorators.cpu" :addonAfter="$t('k8s.text_100')" :min="1" @blur="e => formatInput(e, 'cpu')" />
    </a-form-item>
    <a-form-item :label="$t('k8s.text_101')">
      <a-input :placeholder="$t('k8s.text_102')" type="number" v-decorator="decorators.memory" addonAfter="G" :min="1" @blur="e => formatInput(e, 'memory')" />
    </a-form-item>
    <a-form-item :label="$t('k8s.text_103')">
      <a-input :placeholder="$t('k8s.text_104')" v-decorator="decorators.command" />
    </a-form-item>
    <a-form-item :label="$t('k8s.text_105')">
      <a-input :placeholder="$t('k8s.text_106')" v-decorator="decorators.arg" />
    </a-form-item>
    <a-form-item :label="$t('k8s.text_107')">
      <labels
        :decorators="decorators.volumeMount"
        :title="$t('k8s.text_10')"
        :keyLabel="$t('k8s.text_10')"
        :valueLabel="$t('k8s.text_108')"
        :keyPlaceholder="$t('k8s.text_109')"
        :valuePlaceholder="$t('k8s.text_110')"
        :keyBaseSelectProps="keyBaseSelectProps" />
    </a-form-item>
    <a-form-item :label="$t('k8s.text_111')">
      <labels :decorators="decorators.env" :title="$t('k8s.text_112')" :keyLabel="$t('k8s.text_112')" />
    </a-form-item>
    <a-form-item label="">
      <a-checkbox v-decorator="decorators.privileged">{{$t('k8s.text_113')}}</a-checkbox>
    </a-form-item>
  </div>
</template>

<script>
import * as R from 'ramda'
import Labels from '@K8S/sections/Labels'

export default {
  name: 'K8SSpecContainerForm',
  components: {
    Labels,
  },
  props: {
    decorators: {
      type: Object,
      required: true,
    },
    cluster: String,
    namespace: String,
    form: {
      tpye: Object,
      validator: val => val.fc,
    },
  },
  computed: {
    keyBaseSelectProps () {
      const params = {}
      if (this.cluster) {
        params.scope = this.$store.getters.scope
        params.unused = true
        params.cluster = this.cluster
        if (this.namespace) params.namespace = this.namespace
      }
      const props = {
        resource: 'persistentvolumeclaims',
        version: 'v1',
        params,
        needParams: true,
      }
      return props
    },
  },
  methods: {
    formatInput (e, field) {
      if (this.form && this.form.fc) {
        const val = Number(e.target.value)
        if (R.is(Number, val) && !Number.isNaN(val) && val >= 0) {
        } else {
          this.form.fc.setFieldsValue({
            [this.decorators[field][0]]: 1, // 不合法直接设置为初始值 1
          })
        }
      }
    },
  },
}
</script>
