<template>
  <a-form
    :form="form.fc">
    <a-form-item :label="$t('cloudenv.text_95')" v-bind="formItemLayout" v-if="!updateValue">
      <a-input v-decorator="decorators.name" :placeholder="$t('validator.resourceName')" />
    </a-form-item>
    <a-form-item required :label="$t('cloudenv.text_413')" v-bind="formItemLayout">
      <strategy-radio
       :isNone="false"
      :decorator="decorators.strategy" />
    </a-form-item>
    <a-form-item :label="$t('cloudenv.text_18')" v-bind="formItemLayout">
      <base-select
        v-decorator="decorators.schedtag"
        resource="schedtags"
        :params="schedtagParams"
        :select-props="{ placeholder: $t('cloudenv.text_378') }" />
    </a-form-item>
    <condition-select @conditionValsChange="conditionValsChange" :decorators="decorators" :formItemLayout="formItemLayout" />
  </a-form>
</template>

<script>
import StrategyRadio from '@Cloudenv/sections/StrategyRadio'
import ConditionSelect from '@Cloudenv/sections/ConditionSelect'

export default {
  name: 'SchedpolicyForm',
  components: {
    StrategyRadio,
    ConditionSelect,
  },
  props: {
    updateValue: Object,
  },
  data () {
    const getInitValue = () => {
      let strategy = 'exclude'
      let schedtag
      let conditionVals
      if (this.updateValue) {
        strategy = this.updateValue.strategy
        schedtag = this.updateValue.schedtag
        if (this.updateValue.condition.includes('in')) {
          const key = this.updateValue.condition.substring(this.updateValue.condition.indexOf('(') + 1, this.updateValue.condition.length - 1)
          /* eslint-disable no-useless-escape */
          conditionVals = key.replace(/\"/g, '').split(',')
        }
      }
      return {
        strategy,
        schedtag,
        conditionVals,
      }
    }
    const initValue = getInitValue()
    return {
      scope: this.$store.getters.scope,
      form: {
        fc: this.$form.createForm(this),
        fd: {},
      },
      decorators: {
        name: [
          'name',
          {
            validateFirst: true,
            rules: [
              { required: true, message: this.$t('common.text00042') },
              { validator: this.$validate('resourceName') },
            ],
          },
        ],
        strategy: [
          'strategy',
          {
            initialValue: initValue.strategy,
            rules: [
              { required: true, message: this.$t('common_620') },
            ],
          },
        ],
        schedtag: [
          'schedtag',
          {
            initialValue: initValue.schedtag,
          },
        ],
        conditionKey: [
          'conditionKey',
          {
            initialValue: 'projects',
          },
        ],
        conditionVals: [
          'conditionVals',
          {
            initialValue: initValue.conditionVals,
            rules: [
              { required: true, message: this.$t('common_621') },
            ],
          },
        ],
      },
      formItemLayout: {
        wrapperCol: {
          span: 21,
        },
        labelCol: {
          span: 3,
        },
      },
    }
  },
  computed: {
    schedtagParams () {
      return {
        limit: 0,
        scope: this.scope,
        filter: 'resource_type.equals(hosts)',
      }
    },
  },
  methods: {
    conditionValsChange (val) {
      if (val) {
        const conditions = []
        val.forEach((item) => {
          /* eslint-disable no-useless-escape */
          conditions.push(`\"${item}\"`)
        })
        this.form.fd.condition = `server.owner_tenant_id.in(${conditions.join(',')})`
      }
    },
    validateForm () {
      return new Promise((resolve, reject) => {
        this.form.fc.validateFields((err, values) => {
          if (!err) {
            resolve({ ...values, condition: this.form.fd.condition })
          } else {
            reject(err)
          }
        })
      })
    },
  },
}
</script>
