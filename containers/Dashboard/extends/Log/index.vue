<template>
  <div class="h-100 position-relative">
    <div class="dashboard-card-wrap">
      <div class="dashboard-card-header">
        <div class="dashboard-card-header-left">{{ form.fd.name || $t('dashboard.text_6') }}<a-icon class="ml-2" type="loading" v-if="loading" /></div>
        <div class="dashboard-card-header-right">
          <slot name="actions" :handle-edit="handleEdit" />
          <router-link v-if="!edit" to="/log" class="ml-2">{{$t('dashboard.text_13')}}</router-link>
        </div>
      </div>
      <div class="dashboard-card-body flex-column justify-content-center">
        <template v-if="data && data.length">
          <div class="flex-fill position-relative">
            <div class="dashboard-fco-wrap">
              <template v-for="item of data">
                <div :key="item.id" class="pt-2 pb-2 d-flex align-items-center" style="border-bottom: 1px solid #eee;">
                  <div class="flex-fill mini-text">
                    <div>{{ $te(`dictionary.${item.obj_type}`) ? $t(`dictionary.${item.obj_type}`) : item.obj_type }} - {{ item.action }}</div>
                    <div class="text-color-help mt-1">{{ item.user }} · {{ $moment(item.ops_time).fromNow() }}</div>
                  </div>
                  <a-tag :color="item.success ? '#52c41a' : '#f5222d'"> {{ item.success ? $t('dashboard.text_14') : $t('dashboard.text_15') }} </a-tag>
                </div>
              </template>
            </div>
          </div>
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
        <a-form-item :label="$t('dashboard.text_16')">
          <a-input-number v-decorator="decorators.limit" />
        </a-form-item>
      </a-form>
    </base-drawer>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import BaseDrawer from '@Dashboard/components/BaseDrawer'
import { load } from '@Dashboard/utils/cache'
import { getRequestT } from '@/utils/utils'

export default {
  name: 'Log',
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
    const initialNameValue = (this.params && this.params.name) || this.$t('dashboard.text_17')
    const initialLimitValue = (this.params && this.params.limit) || 4
    return {
      data: [],
      visible: false,
      loading: false,
      form: {
        fc: this.$form.createForm(this),
        fd: {
          name: initialNameValue,
          limit: initialLimitValue,
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
        limit: [
          'limit',
          {
            initialValue: initialLimitValue,
            rules: [
              { required: true, message: this.$t('dashboard.text_18') },
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
    ...mapGetters(['scope']),
  },
  watch: {
    'form.fd' (val) {
      this.fetchLogs()
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
  destroyed () {
    this.manager = null
  },
  created () {
    this.fetchLogs()
    this.$emit('update', this.options.i, {
      ...this.form.fd,
    })
  },
  methods: {
    refresh () {
      return this.fetchLogs()
    },
    async fetchLogs () {
      this.loading = true
      try {
        const data = await load({
          res: 'actions',
          apiVersion: 'v1',
          action: 'list',
          actionArgs: {
            params: {
              scope: this.scope,
              limit: this.form.fd.limit,
              $t: getRequestT(),
            },
          },
          resPath: 'data.data',
        })
        this.data = data
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
        this.$emit('update', this.options.i, values)
        this.visible = false
      } catch (error) {
        throw error
      }
    },
  },
}
</script>
