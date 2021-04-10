<template>
  <a-form-item :required="isRequired" class="no-line-height" :label="$t('cloudenv.text_22')" v-bind="formItemLayout">
    <a-input-group compact>
      <a-select v-decorator="decorators.conditionKey">
        <a-select-option value="projects">{{ $t('dictionary.project') }}</a-select-option>
      </a-select>
      <a-form-item class="mb-0 custom-form-item">
        <base-select
          style="width: 300px;"
          v-decorator="decorators.conditionVals"
          resource="projects"
          version="v1"
          @change="conditionValsChange"
          :params="projectParams"
          remote
          :remote-fn="q => ({ filter: `name.contains(${q})` })"
          :select-props="{ placeholder: $t('rules.project'), mode: 'multiple' }" />
      </a-form-item>
    </a-input-group>
  </a-form-item>
</template>

<script>
export default {
  name: 'ConditionSelect',
  props: {
    decorators: {
      type: Object,
      required: true,
      validator: val => val.conditionKey && val.conditionVals,
    },
    formItemLayout: {
      type: Object,
      required: true,
    },
  },
  data () {
    return {
      scope: this.$store.getters.scope,
    }
  },
  computed: {
    projectParams () {
      return {
        limit: 0,
        scope: this.scope,
      }
    },
    isRequired () {
      const { conditionVals = [] } = this.decorators
      const [, options] = conditionVals
      if (options && options.rules && options.rules.length > 0) {
        return options.rules.some(rules => rules.required)
      }
      return false
    },
  },
  methods: {
    conditionValsChange (...args) {
      this.$emit('conditionValsChange', ...args)
    },
  },
}
</script>

<style lang="less" scoped>
.no-line-height {
  .custom-form-item ::v-deep .ant-form-item-control {
    line-height: 0px;
  }
}
</style>
