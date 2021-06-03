<template>
  <div class="os-select">
    <a-button v-if="label" :style="{ borderRight: label ? 'none' : '' }">{{ label }}</a-button>
    <a-select
      ref="ocSelectRef"
      dropdownClassName="os-select-dropdown"
      :style="{ borderLeft: label ? '' : 'none', width }"
      :value="value"
      v-bind="$attrs"
      v-on="$listeners"
      show-search
      :allowClear="true"
      :filter-option="false"
      option-label-prop="label"
      @search="handleSearch"
      @change="changeHanlde">
      <template v-if="!$scopedSlots.optTpl">
        <!-- 双列左右排布 -->
        <template v-if="mode === 'between'">
          <a-select-option v-if="showStatus && statusDesc" :key="-1" :value="-1" :disabled="true">
            <a-badge status="success" class="text-left text-wrap" :text="statusDesc" />
          </a-select-option>
          <a-select-option v-for="obj of resOpts" :key="obj.key" :value="obj.key" :label="obj.leftLabel" :disabled="obj.disabled">
            <div class="d-flex justify-content-between">
              <a-badge v-if="showStatus" :status="obj.disabled ? 'default' : 'success'" />
              <div style="width: 40%; margin-right: 6px;" class="text-left text-wrap" :title="obj.leftLabel">{{ obj.leftLabel }}</div>
              <div class="text-right text-wrap" :title="obj.rightLabel">{{ obj.rightLabel }}</div>
            </div>
          </a-select-option>
        </template>
        <!-- 单列居左排布 -->
        <template v-else>
          <a-select-option v-if="showStatus && statusDesc" :key="-1" :value="-1" :disabled="true">
            <a-badge status="success" :text="statusDesc" />
          </a-select-option>
          <a-select-option v-for="obj of resOpts" :key="obj.key" :value="obj.key" :label="obj.label" :disabled="obj.disabled">
            <a-badge v-if="showStatus" :status="obj.disabled ? 'default' : 'success'" /> {{ obj.label }}
          </a-select-option>
        </template>
      </template>
      <slot v-else name="optTpl" :resOpts="resOpts" />
    </a-select>
  </div>
</template>

<script>
import debounce from 'lodash/debounce'
import { Manager } from '@/utils/manager'

export default {
  name: 'OsSelelct',
  props: {
    label: {
      type: String,
    },
    width: {
      type: String,
      default: '200px',
    },
    value: {
      required: true,
    },
    data: {
      type: Array,
      default () {
        return []
      },
    },
    resource: {
      type: String,
    },
    apiVersion: {
      type: String,
      default: 'v2',
    },
    params: {
      type: Object,
      default () {
        return {}
      },
    },
    formatter: {
      type: Function,
    },
    mode: {
      type: String,
      default: 'left', // 支持left、between两个取值，默认为left
    },
    showStatus: {
      type: Boolean,
      default: false,
    },
    statusDesc: {
      type: String,
    },
  },
  data () {
    this.fetchResourceData = debounce(this.fetchResourceData, 300)
    return {
      resOpts: [],
      metadata: {
        resOpts: [],
      },
    }
  },
  watch: {
    resource: {
      handler (v) {
        if (v) {
          this.fetchResourceData(v)
        }
      },
      immediate: true,
    },
    data: {
      handler (newVal) {
        if (this.formatter) {
          this.resOpts = newVal.map(v => this.formatter(v))
        } else {
          this.resOpts = newVal
        }
        this.metadata.resOpts = [...this.resOpts]
      },
      deep: true,
      immediate: true,
    },
  },
  methods: {
    fetchResourceData (res, queryParams) {
      const resManager = new Manager(this.resource, this.apiVersion)
      resManager.list({ params: { ...this.params, ...queryParams } }).then((res) => {
        let resArr = res.data.data || []
        if (this.formatter) {
          resArr = resArr.map(v => this.formatter(v))
        }
        this.metadata.resOpts = resArr
        this.resOpts = resArr
      }).catch((err) => {
        console.log(err)
        throw err
      })
    },
    changeHanlde (value) {
      const curObj = this.resOpts.find(obj => {
        return obj.id === value || obj.key === value
      })
      this.$emit('selectChange', { ...curObj })
    },
    handleSearch (value) {
      this.queryResOpts(value)
    },
    queryResOpts (value) {
      if (!this.resource) {
        const resOpts = this.data
        this.resOpts = resOpts.filter(item => {
          const label = item.label || item.leftLabel || item.rightLabel
          return label.includes(value)
        })
      } else {
        const params = {}
        if (value) {
          params.name = value
        }
        this.fetchResourceData(this.resource, params)
      }
    },
  },
}
</script>

<style lang="less">
.os-select-dropdown {
  .ant-badge-status-text {
    color: rgba(0, 0, 0, 0.25);
  }
}
</style>
