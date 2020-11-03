<template>
  <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" :label="$t('cloudenv.text_509')">
    <a-form-item>
      <a-checkbox :indeterminate="indeterminate" :checked="checkAll" :disabled="disabled" @change="onCheckAllChange">{{$t('cloudenv.text_563')}}</a-checkbox>
    </a-form-item>
    <a-form-item>
      <a-checkbox-group v-decorator="decorators.hiddenMenus" :options="options" :disabled="disabled" @change="onChange" />
    </a-form-item>
  </a-form-item>
</template>

<script>
import i18n from '@/locales'

export default {
  name: 'StrategyHiddenMenus',
  inject: ['form'],
  props: {
    labelCol: {
      type: Object,
      default: () => {
        return {
          span: 3,
        }
      },
    },
    wrapperCol: {
      type: Object,
      default: () => {
        return {
          span: 21,
        }
      },
    },
    options: {
      type: Array,
      default: () => [],
    },
    presentPolicies: {
      type: Object,
      default: () => {},
    },
    disabled: {
      type: Boolean,
      default: () => false,
    },
  },
  data () {
    return {
      indeterminate: !!Object.keys(this.presentPolicies).length,
      checkAll: false,
      decorators: {
        hiddenMenus: [
          'hiddenMenus',
          {
            initialValue: Object.keys(this.presentPolicies),
            rules: [
              { required: true, message: i18n.t('cloudenv.text_549') },
            ],
          },
        ],
      },
    }
  },
  methods: {
    onChange (checkedList) {
      this.indeterminate = !!checkedList.length && checkedList.length < this.options.length
      this.checkAll = checkedList.length === this.options.length
    },
    onCheckAllChange (e) {
      const allPolicies = this.options.map(item => {
        return item.value
      })
      this.form.fc.setFieldsValue({ hiddenMenus: e.target.checked ? allPolicies : [] })
      Object.assign(this, {
        indeterminate: false,
        checkAll: e.target.checked,
      })
    },
  },
}
</script>
