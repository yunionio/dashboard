<template>
  <div class="h-100 position-relative">
    <div class="dashboard-card-wrap">
      <div class="dashboard-card-header">
        <div class="dashboard-card-header-left">{{ form.fd.name || $t('dashboard.UserCount') }}<a-icon class="ml-2" type="loading" v-if="loading" /></div>
        <div class="dashboard-card-header-right">
          <slot name="actions" :handle-edit="handleEdit" />
          <router-link v-if="!edit" to="/log" class="ml-2">
            <icon type="arrow-right" style="font-size:18px" />
          </router-link>
        </div>
      </div>
      <div class="dashboard-card-body d-flex align-items-center justify-content-center w-100 heightCss">
        <div class="d-flex w-100 h-100 align-items-center justify-content-center">
          <div class="w-100 d-flex align-items-center justify-content-center h-100">
            <icon type="icon_baremetal" :style="`font-size:${options.h * 23}px`" />
          </div>
          <div class="d-flex align-items-baseline w-100">
            <div class="number-card-number mr-1">{{ data.total || 0 }}</div>
            <div class="number-card-unit">{{ $t('dashboard.text_193') }}</div>
          </div>
        </div>
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
import BaseDrawer from '@Dashboard/components/BaseDrawer'

export default {
  name: 'UserCount',
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
    const initialNameValue = (this.params && this.params.name) || this.$t('dashboard.UserCount')
    return {
      data: {},
      scope: this.$store.getters.scope,
      visible: false,
      loading: false,
      manager: new this.$Manager('domains', 'v1'),
      form: {
        fc: this.$form.createForm(this),
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
  watch: {
    'form.fd' (val) {
      this.fetchCounts()
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
    this.fetchCounts()
    this.$emit('update', this.options.i, {
      ...this.form.fd,
    })
  },
  methods: {
    refresh () {
      return this.fetchCounts()
    },
    async fetchCounts () {
      this.loading = true
      const params = {
        scope: this.scope,
        limit: 1,
        details: false,
        show_fail_reason: true,
      }
      try {
        const data = await this.manager.list({ params })
        this.data = data.data || {}
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
<style lang="less" scoped>
.number-card-number {
  font-size: 50px;
  color: #000;
}
.number-card-unit {
  font-size: 14px;
  color: #4F4B53;
  margin-left: 5px;
}
.drawer-wrapper {
  &::v-deep.ant-drawer.ant-drawer-open .ant-drawer-mask {
    animation: none;
  }
}
.heightCss{
  flex: 1;
  overflow: hidden;
}
.icon-content{
  width: 80px;
  height: 80px;
  margin:  5px;
  cursor: pointer;
  text-align: center;
  border-radius: 6px;
  border: 1px solid #ccc
}
.dashboard-icon {
  font-size: 77px;
}
</style>
