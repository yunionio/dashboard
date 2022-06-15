<template>
  <div class="h-100 position-relative">
    <div class="dashboard-card-wrap">
      <div class="dashboard-card-header">
        <div class="dashboard-card-header-left">{{ form.fd.name }}<a-icon class="ml-2" type="loading" v-if="loading" /></div>
        <div class="dashboard-card-header-right">
          <slot name="actions" :handle-edit="handleEdit" />
          <a class="ml-2" v-if="!edit" @click="goPage">
            <icon type="arrow-right" style="font-size:18px" />
          </a>
        </div>
      </div>
      <div class="dashboard-card-body flex-column justify-content-center">
        <template v-if="!loading">
          <div class="flex-fill position-relative">
            <div class="dashboard-fco-wrap optimization-suggestion-row">
              <div class="optimization-suggestion p-2">
                <div class="optimization-suggestion-title bold-weith blue-color">{{suggestionData.host_up_num}}<icon type="icon_ascent" class="dashboard-icon bg-blue-color" /></div>
                <div class="optimization-suggestion-value mt-2">{{$t('dashboard.optimization_suggestion_host_up')}}</div>
                <div class="optimization-suggestion-value mt-2">
                  <template>
                    <span v-if="rules&&rules.UpsizeServer&&rules.UpsizeServer[0]&&rules.UpsizeServer[0].eval_type!=='within_range'" class="optimization-suggestion-tips mr-12">{{$t('dashboard.text_191')}}{{rules.UpsizeServer[0].eval_type}}{{rules.UpsizeServer[0].threshold}}%</span>
                    <span v-else class="optimization-suggestion-tips mr-12">{{rules.UpsizeServer[0].within_range[0]}}%&gt;{{$t('dashboard.text_191')}}&lt;{{rules.UpsizeServer[0].within_range[1]}}%</span>
                  </template>
                  <template>
                    <span class="optimization-suggestion-tips mr-12">{{$t('dashboard.text_192')}}&gt;85%</span>
                  </template>
                </div>
              </div>
              <div class="optimization-suggestion p-2">
                <div class="optimization-suggestion-title bold-weith blue-color">{{suggestionData.cloudhost_up_num}}<icon type="icon_ascent" class="dashboard-icon bg-blue-color" /></div>
                <div class="optimization-suggestion-value mt-2">{{$t('dashboard.optimization_suggestion_cloudhost_up')}}</div>
                <div class="optimization-suggestion-value mt-2">
                  <span class="optimization-suggestion-tips mr-12">{{$t('dashboard.text_198')}}&gt;70%</span>
                </div>
              </div>
              <div class="optimization-suggestion p-2">
                <div class="optimization-suggestion-title bold-weith green-color">{{suggestionData.host_down_num}}<icon type="icon_decline" class="dashboard-icon bg-green-color" /></div>
                <div class="optimization-suggestion-value mt-2">{{$t('dashboard.optimization_suggestion_host_down')}}</div>
                <div class="optimization-suggestion-value mt-2">
                  <template>
                    <span v-if="rules&&rules.DownsizeServer&&rules.DownsizeServer[0]&&rules.DownsizeServer[0].eval_type!=='within_range'" class="optimization-suggestion-tips mr-12">{{$t('dashboard.text_191')}}{{rules.DownsizeServer[0].eval_type}}{{rules.DownsizeServer[0].threshold}}%</span>
                    <span v-else class="optimization-suggestion-tips mr-12">{{rules.DownsizeServer[0].within_range[0]}}%&gt;{{$t('dashboard.text_191')}}&lt;{{rules.DownsizeServer[0].within_range[1]}}%</span>
                  </template>
                  <template>
                    <span class="optimization-suggestion-tips mr-12">{{$t('dashboard.text_192')}}&lt;20%</span>
                  </template>
                </div>
              </div>
              <div class="optimization-suggestion p-2 ">
                <div class="optimization-suggestion-title bold-weith green-color">{{suggestionData.cloudhost_down_num}}<icon type="icon_decline" class="dashboard-icon bg-green-color" /></div>
                <div class="optimization-suggestion-value mt-2">{{$t('dashboard.optimization_suggestion_cloudhost_down')}}</div>
                <div class="optimization-suggestion-value mt-2">
                  <span class="optimization-suggestion-tips mr-12">{{$t('dashboard.text_198')}}&lt;30%</span>
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
import { load } from '@Dashboard/utils/cache'

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
        host_down_num: 0,
        host_up_num: 0,
        cloudhost_down_num: 0,
        cloudhost_up_num: 0,
      },
      rules: {
        UpsizeServer: {
          within_range: [],
        },
        DownsizeServer: {
          within_range: [],
        },
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
    goPage () {
      this.$router.push('./suggestsysalert')
    },
    refresh () {
      return this.fetchData()
    },
    async getRule () {
      const params = {
        scope: this.$store.getters.scope,
        show_fail_reason: true,
        details: true,
      }
      const data = await load({
        res: 'suggestsysrules',
        actionArgs: {
          url: '/v1/suggestsysrules',
          method: 'GET',
          params,
        },
        useManager: false,
        resPath: 'data',
      })
      if (data && data.data && data.data.length > 0) {
        const rulesName = ['UpsizeServer', 'DownsizeServer']
        for (let i = 0; i < data.data.length; i++) {
          const element = data.data[i]
          if (rulesName.indexOf(element.name) > -1) {
            this.rules[element.name] = element.setting.scale_rule
          }
        }
      } else {
        this.rules = {
          UpsizeServer: {
            within_range: [],
          },
          DownsizeServer: {
            within_range: [],
          },
        }
      }
    },
    async getData () {
      const params = {
        scope: this.$store.getters.scope,
        show_fail_reason: true,
        rule_scope: 'cost',
        exchanged_currency: '',
        details: true,
        limit: 10,
      }
      const data = await load({
        res: 'suggestsysalerts',
        actionArgs: {
          url: '/v1/suggestsysalerts',
          method: 'GET',
          params,
        },
        useManager: false,
        resPath: 'data',
      })
      if (data && data.data && data.data.length > 0) {
        this.suggestionData = {
          host_down_num: data.data[0].rule_total.down_total,
          host_up_num: data.data[0].rule_total.rise_total,
          cloudhost_down_num: 0,
          cloudhost_up_num: 0,
        }
      } else {
        this.suggestionData = {
          host_down_num: 0,
          host_up_num: 0,
          cloudhost_down_num: 0,
          cloudhost_up_num: 0,
        }
      }
    },
    fetchData () {
      this.loading = true
      try {
        this.getData()
        this.getRule()
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
    font-size: 14px;
    font-family: PingFangSC-Medium, PingFang SC;
    font-weight: 500;
    color: rgba(0, 0, 0, 0.85);
  }
  .optimization-suggestion-title{
    font-size: 18px;
  }
  .green-color{
    color: #5AD8A6;
  }
  .blue-color{
    color: #3AA0FE;
  }
  .bold-weith{
    font-weight: bold;
  }
  .optimization-suggestion-tips{
    background: #fff;
    color: #A0A0A0;
    display: inline-block;
    // border: 1px solid #bdbdbd;
    border-radius: 2px;
    font-weight: normal;
    font-size: 12px;
  }
  .mr-12{
    margin-right: 12px;
  }
  .dashboard-icon{
    vertical-align: text-top;
    padding: 3px;
    margin-left: 7px;
    border-radius: 50%;
    font-size: 12px;
  }
  .bg-blue-color{
    background: rgba(58, 160, 254, 0.17);
  }
  .bg-green-color{
    background: rgba(90, 216, 166, 0.17);
  }
}
</style>
