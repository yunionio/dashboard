<template>
  <div>
    <a-form-item class="mb-0">
      <a-switch checkedChildren="开" unCheckedChildren="关" v-decorator="decorators.groupsEnable" @change="change" />
    </a-form-item>
    <a-form-item v-if="showGroups">
      <base-select
        v-decorator="decorators.groups"
        :select-props="{ placeholder: `请选择${$t('dictionary.instancegroup')}`, mode: 'multiple' }"
        resource="instancegroups"
        :params="params"
        :need-params="true" />
    </a-form-item>
  </div>
</template>

<script>
import * as R from 'ramda'

export default {
  name: 'InstanceGroups',
  props: {
    decorators: {
      type: Object,
      required: true,
      validator: val => !R.isNil(val.groupsEnable) && !R.isNil(val.groups),
    },
    params: {
      type: Object,
      required: true,
    },
  },
  data () {
    return {
      showGroups: this.decorators.groupsEnable[1].initialValue,
    }
  },
  computed: {
  },
  methods: {
    change (val) {
      this.showGroups = val
    },
  },
}
</script>
