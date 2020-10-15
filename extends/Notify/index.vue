<template>
  <div class="h-100 position-relative">
    <div class="dashboard-card-wrap">
      <div class="dashboard-card-header">
        <div class="dashboard-card-header-left">{{ form.fd.name || '磁贴名称' }}<a-icon class="ml-2" type="loading" v-if="loading" /></div>
        <div class="dashboard-card-header-right">
          <slot name="actions" :handle-edit="handleEdit" />
          <router-link v-if="!edit && isAdminMode" to="/notice" class="ml-2">更多</router-link>
        </div>
      </div>
      <div class="dashboard-card-body flex-column mini-text justify-content-center">
        <template v-if="data && data[0]">
          <div class="flex-fill position-relative">
            <div class="dashboard-fco-wrap">{{ data[0]['content'] }}</div>
          </div>
          <div class="d-flex flex-shrink-0 flex-grow-0 mt-1">
            <div class="text-color-help flex-fill">{{ data[0]['author'] }} · {{ $moment(data[0]['updated_at']).fromNow() }}</div>
            <div class="flex-shrink-0 flex-grow-0" @click.stop.prevent="doLike" style="cursor: pointer;">{{ readmarkTotal }}<a-icon class="ml-1" type="like" :style="{ color: likeColor }" /></div>
          </div>
        </template>
      </div>
    </div>
    <base-drawer :visible.sync="visible" title="配置磁贴" @ok="handleSubmit">
      <a-form
        hideRequiredMark
        :form="form.fc"
        v-bind="formItemLayout">
        <a-form-item label="磁贴名称">
          <a-input v-decorator="decorators.name" />
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
  name: 'Notify',
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
    const initialNameValue = (this.params && this.params.name) || '公告'
    return {
      data: [],
      readmarkData: {},
      visible: false,
      loading: false,
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
              { required: true, message: '请输入磁贴名称' },
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
    ...mapGetters(['userInfo', 'scope', 'isAdminMode']),
    readmarkTotal () {
      return this.readmarkData.total || 0
    },
    liked () {
      const data = this.readmarkData.data || []
      return data.some(item => item.user_id === this.userInfo.id)
    },
    likeColor () {
      if (this.liked) return '#faad14'
      return '#1890ff'
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
    data (val) {
      if (val && val.length) {
        this.fetchReadmarks()
      }
    },
  },
  destroyed () {
    this.rm = null
  },
  created () {
    this.rm = new this.$Manager('readmarks', 'v1')
    this.fetchNotices()
    this.$emit('update', this.options.i, {
      name: this.form.fd.name,
    })
    this.$bus.$on('DashboardCardRefresh', args => {
      this.fetchNotices()
    }, this)
  },
  methods: {
    async fetchNotices () {
      this.loading = true
      try {
        const data = await load({
          res: 'notices',
          apiVersion: 'v1',
          action: 'list',
          actionArgs: {
            params: {
              scope: this.scope,
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
    async fetchReadmarks () {
      try {
        const response = await this.rm.list({
          params: {
            notice_id: this.data[0].id,
            $t: getRequestT(),
          },
        })
        this.readmarkData = response.data
      } catch (error) {
        throw error
      }
    },
    async doLike () {
      if (this.liked) {
        return
      }
      try {
        await this.rm.create({
          data: {
            notice_id: this.data[0].id,
            scope: this.scope,
          },
        })
        this.fetchRemark()
      } catch (error) {
        throw error
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
