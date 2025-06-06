<template>
  <div class="d-flex">
    <a-form-item
      :wrapperCol="{ span: 24 }"
      class="mb-0 mr-1 w-50">
      <div slot="extra">{{ $t('common.schedtag.extra') }}，<help-link  :href="docUrl">{{ $t('common.view.doc') }}</help-link></div>
      <base-select
        class="w-100"
        v-decorator="decorators.schedtag"
        resource="schedtags"
        :need-params="true"
        :item.sync="schedtagItem"
        :params="schedtagParams"
        @change="schedtagChange"
        :select-props="{ allowClear: true, placeholder: $t('common_255') }" />
    </a-form-item>
    <a-form-item class="mb-0 w-50" :wrapperCol="{ span: 24 }">
      <base-select
        class="w-100"
        v-decorator="decorators.policy"
        :options="policyOpts"
        :select-props="{ allowClear: true, placeholder: $t('common_256') }" />
    </a-form-item>
  </div>
</template>

<script>
import { genDocsUrl } from '@/utils/utils'
import { SCHEDTAG_POLICY_OPTIONS } from '@/constants'

export default {
  name: 'SchedtagPolicy',
  props: {
    decorators: {
      type: Object,
      required: true,
      validator: val => val.schedtag && val.policy,
    },
    schedtagParams: {
      type: Object,
      default: () => ({}),
    },
    form: {
      type: Object,
      validator: val => !val || val.fc, // 不传 或者 传就有fc
    },
    policyReactInSchedtag: { // 策略是否与调度标签联动
      type: Boolean,
      default: () => true,
    },
  },
  data () {
    return {
      policyOpts: SCHEDTAG_POLICY_OPTIONS,
      schedtagItem: {},
      docUrl: genDocsUrl({
        scope: this.$store.getters.scope,
        isSysCE: this.$store.getters.isSysCE,
        cePath: 'guides/onpremise/scheduler/schedtags',
        eePath: 'web_ui/computing/schedule/schedtag',
      }),
    }
  },
  methods: {
    schedtagChange (val) {
      this.$nextTick(() => {
        if (this.form && this.form.fc) {
          let defaultStrategy = this.schedtagItem.default_strategy || 'require'
          if (defaultStrategy) {
            if (!this.policyOpts.find(val => val.key === defaultStrategy)) {
              defaultStrategy = undefined
            }
          }
          this.form.fc.getFieldDecorator(this.decorators.policy[0], this.decorators.policy[1])
          if (this.policyReactInSchedtag) {
            this.form.fc.setFieldsValue({
              [this.decorators.policy[0]]: defaultStrategy,
            })
          }
        }
      })
    },
  },
}
</script>
