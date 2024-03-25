<template>
  <div class="h-100 position-relative">
    <div class="dashboard-card-wrap" :style="wrapStyle">
      <div class="dashboard-card-header" style="margin-bottom:0">
        <div class="dashboard-card-header-left">
          <span :style="headerStyle">{{ form.fd.name || $t('dashboard.title_bar') }}</span>
          <a-icon class="ml-2" type="loading" v-if="loading" /></div>
        <div class="dashboard-card-header-right">
          <slot name="actions" :handle-edit="handleEdit" />
        </div>
      </div>
      <div v-if="desc" class="dashboard-card-body flex-column justify-content-center" :style="descStyle">
        {{ desc }}
      </div>
    </div>
    <base-drawer :visible.sync="visible" :title="$t('dashboard.text_5')" @ok="handleSubmit" @cancel="handleCancel">
      <a-form
        :form="form.fc"
        v-bind="formItemLayout">
        <a-form-item :label="$t('dashboard.text_6')">
          <a-input v-decorator="decorators.name" />
        </a-form-item>
        <a-form-item :label="$t('dashboard.explain')">
          <a-input v-decorator="decorators.desc" />
        </a-form-item>
        <a-form-item :label="$t('dashboard.background')">
          <div class="d-flex flex-wrap" style="line-height: 30px">
            <a-tooltip class="color-item" v-for="(item, index) in colorList" :key="index">
              <template slot="title">
                {{ item.key }}
              </template>
              <a-tag :color="item.color" @click="changeColor(item.color)" :style="item.color === '#FFFFFF' ? {border:'solid #ccc 1px'} : {}">
                <a-icon type="check" v-if="item.color === form.fd.color" :style="item.color === '#FFFFFF' ? {color:'#333'} : {}" />
              </a-tag>
            </a-tooltip>
          </div>
        </a-form-item>
      </a-form>
    </base-drawer>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import BaseDrawer from '@Dashboard/components/BaseDrawer'
import { colorList } from '@/utils/theme/utils'

export default {
  name: 'Title',
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
    const initialNameValue = (this.params && this.params.name) || this.$t('dashboard.title_bar')
    const initialDesc = (this.params && this.params.desc) || ''
    const initialColor = (this.params && this.params.color) || '#FFFFFF'
    return {
      data: [],
      visible: false,
      loading: false,
      form: {
        fc: this.$form.createForm(this),
        fd: {
          name: initialNameValue,
          desc: initialDesc,
          color: initialColor,
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
        desc: [
          'desc',
          {
            initialValue: initialDesc,
          },
        ],
        color: [
          'color',
          {
            initialValue: initialColor,
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
      colorList: [
        ...colorList,
        {
          key: this.$t('dashboard.color_white'),
          color: '#FFFFFF',
        },
      ],
    }
  },
  computed: {
    ...mapGetters(['scope', 'userInfo']),
    desc () {
      return this.form.fd.desc
    },
    bgColor () {
      return (this.params && this.params.color) || '#FFFFFF'
    },
    headerStyle () {
      const ret = {
        fontSize: '1.3em',
        fontWeight: 'bold',
      }
      if (!this.desc) {
        ret.height = '50px'
        ret.lineHeight = '50px'
      }
      if (this.params && this.params.color && this.params.color !== '#FFFFFF') {
        ret.color = '#fff'
      }
      return ret
    },
    wrapStyle () {
      const ret = {
        padding: '12px 15px',
      }
      if (this.params && this.params.color && this.params.color !== '#FFFFFF') {
        ret.background = this.params.color
      }
      return ret
    },
    descStyle () {
      if (this.params && this.params.color && this.params.color !== '#FFFFFF') {
        return { color: '#fff' }
      }
      return {}
    },
  },
  watch: {
    'form.fd' (val) {
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
    this.$emit('update', this.options.i, {
      ...this.form.fd,
    })
  },
  methods: {
    changeColor (color) {
      this.form.fd.color = color
    },
    refresh () {
      return function () {}
    },
    handleEdit () {
      this.visible = true
    },
    async handleSubmit () {
      try {
        const values = await this.form.fc.validateFields()
        this.form.fd = { ...values, color: this.form.fd.color }
        this.$emit('update', this.options.i, { ...values, color: this.form.fd.color })
        this.visible = false
      } catch (error) {
        throw error
      }
    },
    handleCancel () {
      this.form.fd.color = (this.params && this.params.color) || '#fff'
    },
  },
}
</script>
<style scoped lang="less">
.color-item {
  width: 20px;
  height: 20px;
  border-radius: 2px;
  cursor: pointer;
  margin-right: 8px;
  padding-left: 0px;
  padding-right: 0px;
  text-align: center;
  color: #fff;
  font-weight: 700;
  i {
    font-size: 14px;
  }
}
</style>
