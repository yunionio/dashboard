<template>
  <div>
    <a-radio-group :value="value" @change="onChange" v-if="optionsC.length">
      <a-radio-button v-for="item in optionsC" :value="item.key"  :key="item.key">
        {{ item.label }}
      </a-radio-button>
    </a-radio-group>
    <div class="warning-color" v-else>{{$t('common_729')}}</div>
  </div>
</template>

<script>
import * as R from 'ramda'
import _ from 'lodash'
import { HOST_CPU_ARCHS } from '@/constants/compute'
import createFormFieldDraftMixin from '@/mixins/createFormFieldDraft'

export default {
  name: 'OsArch',
  mixins: [createFormFieldDraftMixin],
  props: {
    formDraftKey: {
      type: String,
      default: '',
    },
    options: {
      type: Array,
      default: () => Object.values(HOST_CPU_ARCHS),
    },
    value: {},
    form: {
      type: Object,
      required: true,
      validator: val => val.fc,
    },
    decoratorField: {
      type: String,
      default: 'os_arch',
    },
  },
  computed: {
    optionsC () {
      if (this.options.length) {
        if (R.is(String, this.options[0])) {
          return this.options.map(str => {
            const label = _.get(HOST_CPU_ARCHS, `[${str}].label`) || str
            return {
              key: str,
              label,
            }
          })
        }
        return this.options
      }
      return []
    },
  },
  watch: {
    optionsC (val, oldV) {
      if (val.length) {
        if (!_.isEqual(val, oldV)) {
          this.applyOsArchDefault(val)
        }
      } else {
        this.emit(undefined)
      }
    },
  },
  mounted () {
    if (!this.form.fc.getFieldValue(this.decoratorField) && this.optionsC.length) {
      this.applyOsArchDefault(this.optionsC)
    }
  },
  methods: {
    emit (v) {
      this.$emit('change', v)
    },
    onChange (e) {
      const v = e.target.value
      this.writeFormFieldDraft(v)
      this.emit(v)
    },
    applyOsArchDefault (opts) {
      const hit = this.matchFormFieldDraftInOptions(opts)
      const next = hit?.key || opts[0]?.key
      this.emit(next)
    },
    serializeFormFieldDraft () {
      return this.form?.fc?.getFieldValue?.(this.decoratorField) || undefined
    },
  },
}
</script>
