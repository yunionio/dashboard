<template>
  <div class="h-100 position-relative">
    <div class="dashboard-card-wrap">
      <div class="dashboard-card-header">
        <div class="dashboard-card-header-left">{{ form.fd.name }}<a-icon class="ml-2" type="loading" v-if="loading" /></div>
        <div class="dashboard-card-header-right">
          <slot name="actions" :handle-edit="handleEdit" />
          <!-- <router-link v-if="!edit" to="/notice" class="ml-2">{{$t('dashboard.more')}}</router-link> -->
        </div>
      </div>
      <div class="dashboard-card-body flex-column justify-content-center">
        <template v-if="!loading">
          <div class="flex-fill position-relative">
            <div class="dashboard-fco-wrap optimization-suggestion-row">
              <div class="optimization-suggestion p-2">
                <div class="optimization-suggestion-title bold-weith blue-color">{{suggestionData.host_down_num}}</div>
                <div class="optimization-suggestion-value mt-2">{{$t('dashboard.optimization_suggestion_host_down')}}
                  <icon type="down" class="dashboard-icon" />
                </div>
                <div class="optimization-suggestion-value mt-2">
                  <span class="optimization-suggestion-tips ml-0">{{$t('dashboard.text_190')}}&lt;100%</span>
                  <span class="optimization-suggestion-tips">{{$t('dashboard.text_191')}}&lt;100%</span>
                </div>
              </div>
              <div class="optimization-suggestion p-2 ">
                <div class="optimization-suggestion-title bold-weith blue-color">{{suggestionData.cloudhost_down_num}}</div>
                <div class="optimization-suggestion-value mt-2">{{$t('dashboard.optimization_suggestion_cloudhost_down')}}
                  <icon type="down" class="dashboard-icon" />
                </div>
                <div class="optimization-suggestion-value mt-2">
                  <span class="optimization-suggestion-tips ml-0">{{$t('dashboard.text_190')}}&lt;30%</span>
                  <span class="optimization-suggestion-tips">{{$t('dashboard.text_191')}}&lt;20%</span>
                </div>
              </div>
              <div class="optimization-suggestion p-2">
                <div class="optimization-suggestion-title bold-weith blue-color">{{suggestionData.host_up_num}}</div>
                <div class="optimization-suggestion-value mt-2">{{$t('dashboard.optimization_suggestion_host_up')}}
                  <icon type="up" class="dashboard-icon" />
                </div>
                <div class="optimization-suggestion-value mt-2">
                  <span class="optimization-suggestion-tips ml-0">{{$t('dashboard.text_190')}}&gt;85%</span>
                  <span class="optimization-suggestion-tips">{{$t('dashboard.text_191')}}&gt;85%</span>
                </div>
              </div>
              <div class="optimization-suggestion p-2">
                <div class="optimization-suggestion-title bold-weith blue-color">{{suggestionData.cloudhost_up_num}}</div>
                <div class="optimization-suggestion-value mt-2">{{$t('dashboard.optimization_suggestion_cloudhost_up')}}
                  <icon type="up" class="dashboard-icon" />
                </div>
                <div class="optimization-suggestion-value mt-2">
                  <span class="optimization-suggestion-tips ml-0">{{$t('dashboard.text_190')}}&gt;70%</span>
                  <span class="optimization-suggestion-tips">{{$t('dashboard.text_191')}}&gt;70%</span>
                </div>
              </div>
            </div>
          </div>
        </template>
        <template v-else>
          <a-empty />
        </template>
      </div>
    </div>
    <base-drawer :visible.sync="visible" :title="$t('dashboard.text_5')" @ok="handleSubmit">
      <a-form
        hideRequiredMark
        :form="form.fc"
        v-bind="formItemLayout">
        <a-form-item :label="$t('dashboard.text_6')">
          <a-input v-decorator="decorators.name" />
        </a-form-item>
      </a-form>
    </base-drawer>
  </div>
</template>

<script>
import * as R from 'ramda'
import { mapGetters } from 'vuex'
import BaseDrawer from '@Dashboard/components/BaseDrawer'
import { resolveValueChangeField } from '@/utils/common/ant'
// import { uuid } from '@/utils/utils'

export default {
  name: 'OptimizationSuggestion',
  components: {
    BaseDrawer,
  },
  props: {
    options: {
      type: Object,
      required: true,
    },
    params: Object,
    edit: Boolean,
  },
  data () {
    const initialNameValue = (this.params && this.params.name) || this.$t('dashboard.optimization_suggestion')
    return {
      data: [],
      visible: false,
      loading: false,
      suggestionData: {
        host_down_num: 1,
        host_up_num: 2,
        cloudhost_down_num: 1,
        cloudhost_up_num: 0,
      },
      form: {
        fc: this.$form.createForm(this, {
          onValuesChange: (props, values) => {
            const newField = resolveValueChangeField(values)
            R.forEachObjIndexed((item, key) => {
              this.$set(this.form.fd, key, item)
            }, newField)
          },
        }),
        fd: {
          name: initialNameValue,
        },
      },
      decorators: {
        name: [
          'name',
          {
            initialValue: initialNameValue,
            rules: [
              { required: true, message: this.$t('dashboard.text_8') },
            ],
          },
        ],
      },
      formItemLayout: {
        wrapperCol: {
          span: 18,
        },
        labelCol: {
          span: 6,
        },
      },
    }
  },
  computed: {
    ...mapGetters(['scope', 'capability', 'isAdminMode', 'isDomainMode', 'isProjectMode', 'userInfo']),
  },
  watch: {
    'form.fd' (val) {
      this.fetchData()
      for (const key in this.decorators) {
        let config = this.decorators[key][1] || {}
        config = {
          ...config,
          initialValue: val[key],
        }
        this.decorators[key][1] = config
      }
    },
  },
  created () {
    const values = { ...this.form.fd }
    this.$emit('update', this.options.i, values)
    this.fetchData()
  },
  methods: {
    refresh () {
      return this.fetchData()
    },
    async fetchData () {
      this.loading = true
      try {
        this.suggestionData = {
          host_down_num: 1,
          host_up_num: 2,
          cloudhost_down_num: 1,
          cloudhost_up_num: 0,
        }
      } finally {
        this.loading = false
      }
    },
    handleEdit () {
      this.visible = true
    },
    async handleSubmit () {
      try {
        const values = await this.form.fc.validateFields()
        this.form.fd = values
        const updateValues = { ...values }
        this.$emit('update', this.options.i, updateValues)
        this.visible = false
      } catch (error) {
        throw error
      }
    },
  },
}
</script>
<style lang="scss" scoped>
.optimization-suggestion-row{
    flex-wrap: wrap;
    display: flex;
}
.optimization-suggestion{
  width: 50%;
  height: 50%;
  .optimization-suggestion-value{
    font-size: 12px;
  }
  .optimization-suggestion-title{
    font-size: 18px;
  }
  .green-color{
    color: #52c41a;
  }
  .blue-color{
    color: #118dee;
  }
  .bold-weith{
    font-weight: bold;
  }
  .optimization-suggestion-tips{
    background: #eee9e9;
    color: #9d9c9c;
    display: inline-block;
    margin: 0 3px;
    padding: 0 4px;
    border: 1px solid #bdbdbd;
    border-radius: 2px;
  }
}
</style>
