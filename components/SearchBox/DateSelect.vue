<template>
  <div class="p-2">
    <a-form-model layout="vertical" :model="fd" :rules="rules">
      <a-form-model-item class="mb-0">
        <a-radio-group v-model="fd.type" size="small">
          <template v-for="item of typeOptions">
            <a-radio-button :value="item.key" :key="item.key">{{ item.label }}</a-radio-button>
          </template>
        </a-radio-group>
      </a-form-model-item>
      <a-form-model-item :label="fd.type === 'range' && $t('common.text00119')" class="mb-0" v-if="fd.type === 'before' || fd.type === 'range'">
        <a-row :gutter="8">
          <a-col :span="12">
            <a-form-model-item class="mb-0">
              <a-date-picker
                v-model="fd.date1"
                :allowClear="false"
                :placeholder="$t('common_648')"
                class="w-100"
                :getCalendarContainer="getPopupContainer"
                @click.native.stop.prevent />
            </a-form-model-item>
          </a-col>
          <a-col :span="12">
            <a-form-model-item class="mb-0">
              <a-time-picker
                v-model="fd.time1"
                :allowClear="false"
                :placeholder="$t('compute.text_856')"
                class="w-100"
                :getPopupContainer="getPopupContainer"
                @click.native.stop.prevent />
            </a-form-model-item>
          </a-col>
        </a-row>
      </a-form-model-item>
      <a-form-model-item :label="fd.type === 'range' && $t('common.text00120')" class="mb-0" v-if="fd.type === 'after' || fd.type === 'range'">
        <a-row :gutter="8">
          <a-col :span="12">
            <a-form-model-item class="mb-0">
              <a-date-picker
                v-model="fd.date2"
                :allowClear="false"
                :placeholder="$t('common_648')"
                class="w-100"
                :getCalendarContainer="getPopupContainer"
                @click.native.stop.prevent />
            </a-form-model-item>
          </a-col>
          <a-col :span="12">
            <a-form-model-item class="mb-0">
              <a-time-picker
                v-model="fd.time2"
                :allowClear="false"
                :placeholder="$t('compute.text_856')"
                class="w-100"
                :getPopupContainer="getPopupContainer"
                @click.native.stop.prevent />
            </a-form-model-item>
          </a-col>
        </a-row>
      </a-form-model-item>
    </a-form-model>
  </div>
</template>

<script>
import moment from 'moment'

export default {
  name: 'DateSelect',
  props: {
    value: Array,
    getPopupContainer: Function,
  },
  data () {
    const value = this.value || []
    const initDate1 = (value[0] && moment(value[0])) || moment()
    const initTime1 = (value[0] && moment(value[0], 'YYYY-MM-DD HH:mm:ss')) || moment('00:00:00', 'HH:mm:ss')
    const initDate2 = (value[1] && moment(value[1])) || moment()
    const initTime2 = (value[1] && moment(value[1], 'YYYY-MM-DD HH:mm:ss')) || moment('00:00:00', 'HH:mm:ss')
    let initType = 'before'
    if (value && value.length) {
      if (value[0] && value[1]) {
        initType = 'range'
      } else if (value[0]) {
        initType = 'before'
      } else if (value[1]) {
        initType = 'after'
      }
    }
    return {
      typeOptions: [
        { label: this.$t('common_649'), key: 'before' },
        { label: this.$t('common_650'), key: 'after' },
        { label: this.$t('common_651'), key: 'range' },
      ],
      fd: {
        type: initType,
        date1: initDate1,
        time1: initTime1,
        date2: initDate2,
        time2: initTime2,
      },
      rules: {
        date1: [
          { required: true, message: this.$t('common_652'), trigger: 'blur' },
        ],
        time1: [
          { required: true, message: this.$t('common_653'), trigger: 'blur' },
        ],
        date2: [
          { required: true, message: this.$t('common_654'), trigger: 'blur' },
        ],
        time2: [
          { required: true, message: this.$t('common_655'), trigger: 'blur' },
        ],
      },
    }
  },
  watch: {
    fd: {
      handler (val) {
        const date1 = val.date1.format('YYYY-MM-DD')
        const time1 = val.time1.format('HH:mm:ss')
        const date2 = val.date2 && val.date2.format('YYYY-MM-DD')
        const time2 = val.time2 && val.time2.format('HH:mm:ss')
        let selectValue = []
        if (val.type === 'before') {
          selectValue = [[moment(`${date1} ${time1}`), null]]
        } else if (val.type === 'after') {
          selectValue = [[null, moment(`${date2} ${time2}`)]]
        } else if (val.type === 'range') {
          selectValue = [[moment(`${date1} ${time1}`), moment(`${date2} ${time2}`)]]
        }
        this.$emit('change', selectValue)
      },
      deep: true,
      immediate: true,
    },
  },
  beforeDestroy () {
    this.$emit('date-editing-change', false)
  },
  mounted () {
    this.$emit('date-editing-change', true)
  },
}
</script>
