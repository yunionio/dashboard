<template>
  <div>
    <a-form
      v-bind="formItemLayout"
      :form="form.fc">
      <!-- <a-form-item :label="$t('common.name')">
        <a-input v-decorator="decorators.name" :placeholder="$t('common.placeholder')" />
      </a-form-item> -->
    </a-form>
    <div v-for="(item, i) in formList" :key="item.key" class="mb-3">
      <monitor-form
        :panel="panel"
        :query-only="queryOnly"
        :defaultPanelShow="item.show"
        :showDelete="formList.length > 1"
        :formItemLayout="formItemLayout"
        :timeRangeParams="timeRangeParams"
        :extraParams="extraParams"
        @nameChange="val => nameChange(val, i)"
        @mertricItemChange="val => mertricItemChange(val, i)"
        @resetChart="() => resetChart(i)"
        @paramsChange="(val, resVal) => paramsChange(val, resVal, i)"
        @remove="() => remove(i)" />
    </div>
    <div class="d-flex align-items-center" v-if="multiQuery">
      <a-button type="primary" shape="circle" icon="plus" size="small" :disabled="addDisabled"  @click="add" />
      <a-button type="link" @click="add" :disabled="addDisabled">{{ $t('monitor.monitor_add') }}</a-button>
    </div>
  </div>
</template>

<script>
import { uuid } from '@/utils/utils'
import MonitorForm from './form'

export default {
  name: 'MonitorForms',
  components: {
    MonitorForm,
  },
  props: {
    timeRangeParams: {
      type: Object,
      default: () => ({}),
    },
    extraParams: {
      type: Object,
      default: () => ({}),
    },
    panel: {
      type: Object,
      default: () => ({}),
    },
    queryOnly: {
      type: Boolean,
      default: true,
    },
    multiQuery: {
      type: Boolean,
      default: true,
    },
  },
  data () {
    return {
      formList: [{ key: uuid(), show: true }],
      form: {
        fc: this.$form.createForm(this),
      },
      formItemLayout: {
        wrapperCol: {
          span: 20,
        },
        labelCol: {
          span: 4,
        },
      },
      decorators: {
        name: [
          'name',
          {
            rules: [
              { required: true, message: this.$t('monitor.text_7') },
            ],
          },
        ],
      },
    }
  },
  computed: {
    addDisabled () {
      return !this.formList[this.formList.length - 1].model
    },
  },
  methods: {
    add () {
      const list = this.formList.map(val => ({ ...val, show: false }))
      this.formList = list.concat({ key: uuid(), show: true })
    },
    paramsChange (params, resParams, i) {
      this.$set(this.formList[i], 'model', params)
      this.$set(this.formList[i], 'result_reducer', resParams)
      this.$emit('refresh', params, resParams, i)
    },
    remove (idx) {
      this.formList.splice(idx, 1)
      this.$emit('remove', idx)
      if (idx === this.formList.length) {
        this.formList = this.formList.map((val, i, arr) => {
          if (i === arr.length - 1) {
            return { ...val, show: true }
          }
          return { ...val, show: false }
        })
      }
    },
    resetChart (i) {
      this.$emit('resetChart', i)
    },
    mertricItemChange (val, i) {
      this.$emit('mertricItemChange', val, i)
    },
    nameChange (name, i) {
      this.$emit('nameChange', name, i)
    },
  },
}
</script>
