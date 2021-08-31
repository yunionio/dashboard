<template>
  <div class="oc-select w-100">
    <a-select
      ref="ocSelectRef"
      dropdownClassName="oc-select-dropdown-wrapper"
      :style="{ width }"
      :value="dataVal"
      v-bind="$attrs"
      v-on="$listeners"
      show-search
      :loading="c_loading"
      :size="size"
      :allowClear="true"
      :filter-option="false"
      :not-found-content="c_loading ? $t('common.loding') : $t('common.notData')"
      :option-label-prop="layout === 'between' ? 'label' : 'children'"
      @search="handleSearch"
      @change="changeHanlde">
      <a-spin v-if="c_loading" slot="notFoundContent" size="small" />
      <a-select-option v-if="showStatus && statusDesc && (resOpts && resOpts.length > 0)" :key="-1" :value="-1" :disabled="true">
        <a-badge status="success" class="text-left text-wrap" :text="statusDesc" />
      </a-select-option>
      <template v-if="!$scopedSlots.optTpl">
        <!-- 双列左右排布 -->
        <template v-if="layout === 'between'">
          <a-select-option v-for="obj of resOpts" :key="obj.key" :value="obj.key" :label="obj.label" :disabled="obj.disabled">
            <div class="d-flex justify-content-between">
              <div style="width: 40%; margin-right: 6px;" class="text-left text-wrap" :title="obj.label">
                <a-badge v-if="showStatus" :status="obj.disabled ? 'default' : 'success'" />
                  {{ obj.label }}
                </div>
              <div class="text-right text-wrap" :title="obj.rightLabel">{{ obj.rightLabel }}</div>
            </div>
          </a-select-option>
        </template>
        <!-- 单列居左排布 -->
        <template v-else>
          <a-select-option v-for="obj of resOpts" :key="obj.key" :value="obj.key" :title="obj.label" :label="label ? undefined : obj.label" :disabled="obj.disabled">
            <a-badge v-if="showStatus" :status="obj.disabled ? 'default' : 'success'" />
            <span v-if="label" class="text-color-secondary option-prefix">{{ label }}: </span>{{ obj.label }}
          </a-select-option>
        </template>
      </template>
      <slot v-else name="optTpl" :resOpts="resOpts" />
    </a-select>
    <a-icon v-if="showSync" type="sync" class="ml-2 primary-color" :spin="c_loading" @click="refresh" />
  </div>
</template>

<script>
import debounce from 'lodash/debounce'
import { Manager } from '@/utils/manager'

export default {
  name: 'OcSelect',
  props: {
    label: {
      type: String,
    },
    width: {
      type: String,
      default: '200px',
    },
    size: {
      type: String,
      default: 'default',
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
    layout: {
      type: String,
      default: 'left', // 支持left、between两个取值，默认为left
    },
    showStatus: {
      type: Boolean,
      default: false,
    },
    showSync: {
      type: Boolean,
      default: false,
    },
    statusDesc: {
      type: String,
    },
    searchParams: { // 支持搜索参数自定义的处理函数，返回值类型为Object
      type: Function,
    },
    mapper: { // 请求数据后进行数据处理
      type: Function,
      required: false,
    },
    sort: { // 请求数据后进行排序处理
      type: Function,
      required: false,
    },
    loading: {
      type: Boolean,
      default: false,
    },
  },
  data () {
    this.fetchResourceData = debounce(this.fetchResourceData, 300)
    return {
      c_loading: this.loading,
      resOpts: [],
      metadata: {
        resOpts: [],
      },
      dataVal: this.value,
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
        let resArr = newVal
        if (this.formatter) {
          resArr = resArr.map(v => this.formatter(v))
        }
        if (this.sort) {
          resArr = this.sort(resArr)
        }
        this.resOpts = resArr
        this.metadata.resOpts = [...this.resOpts]
      },
      deep: true,
      immediate: true,
    },
    value: {
      handler (v) {
        this.dataVal = v
      },
    },
    loading: {
      handler (v) {
        this.c_loading = v
      },
    },
  },
  methods: {
    fetchResourceData (res, queryParams) {
      const resManager = new Manager(this.resource, this.apiVersion)
      this.c_loading = true
      this.metadata.resOpts = []
      this.resOpts = []
      if (this.cascade && !this.cascadeDataLoaded) return
      resManager.list({ params: { ...this.params, ...queryParams } }).then((res) => {
        this.c_loading = false
        let resArr = res.data.data || []
        if (this.formatter) {
          resArr = resArr.map(v => this.formatter(v))
        }
        if (this.mapper) {
          resArr = this.mapper(resArr)
        }
        if (this.sort) {
          resArr = this.sort(resArr)
        }
        this.$emit('fetchSuccess', resArr)
        this.metadata.resOpts = resArr
        this.resOpts = resArr
      }).catch((err) => {
        this.c_loading = false
        console.log(err)
        throw err
      })
    },
    changeHanlde (value) {
      const curObjArr = this.resOpts.filter(obj => {
        if (Array.isArray(value)) {
          return value.includes(obj.key || obj.id)
        }
        return obj.key === value || obj.id === value
      })
      this.$emit('selectChange', [...curObjArr])
    },
    handleSearch (value) {
      this.queryResOpts(value)
    },
    queryResOpts (value) {
      if (!this.resource) {
        const resOpts = this.metadata.resOpts
        this.resOpts = resOpts.filter(item => {
          const label = item.label || item.rightLabel
          return label.includes(value)
        })
      } else {
        let params = {}
        if (this.searchParams) {
          params = this.searchParams(value)
        } else {
          params.search = value
        }
        this.fetchResourceData(this.resource, params)
      }
    },
    refresh () {
      this.fetchResourceData(this.resource)
    },
  },
}
</script>

<style lang="less">
.oc-select-dropdown-wrapper {
  .ant-badge-status-text {
    color: rgba(0, 0, 0, 0.25);
  }
  .option-prefix {
    display: none;
  }
  .option-show {
    display: inline-block !important;
  }
  .ant-badge-status-default {
    background-color: transparent;
  }
}
.ant-select-selection-selected-value {
  .ant-badge {
    display: none;
  }
}
</style>
