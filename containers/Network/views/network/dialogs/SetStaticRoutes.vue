<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{ $t('network.set_static_routes') }}</div>
    <div slot="body">
      <dialog-selected-tips :name="$t('dictionary.network')" :count="params.data.length" :action="$t('network.set_static_routes')" />
      <dialog-table :data="params.data" :columns="columns" />
      <a-form :form="form.fc" class="mt-3" v-bind="formItemLayout" hideRequiredMark>
        <a-form-item
          v-for="(k, index) in (form.fc.getFieldValue('keys') || [])"
          :key="k"
          v-bind="index === 0 ? formItemLayout : formItemLayoutWithOutLabel"
          :label="index === 0 ? $t('network.static_routes') : ''"
          :required="false">
          <a-row :gutter="6">
            <a-col :span="11">
              <a-form-item :wrapperCol="{ span: 24 }" class="mb-0 mr-1">
                <a-input v-decorator="decorators.routes.net(k)" :placeholder="$t('network.static_routes.net_placeholder')" />
              </a-form-item>
            </a-col>
            <a-col :span="11">
              <a-form-item :wrapperCol="{ span: 24 }" class="mb-0 mr-1">
                <a-input v-decorator="decorators.routes.gw(k)" :placeholder="$t('network.static_routes.gw_placeholder')" />
              </a-form-item>
            </a-col>
            <a-col :span="2">
              <a-button shape="circle" icon="minus" size="small" @click="remove(k)" />
            </a-col>
          </a-row>
        </a-form-item>
        <a-form-item
          v-bind="(form.fc.getFieldValue('keys') || []).length ? formItemLayoutWithOutLabel : formItemLayout"
          :label="(form.fc.getFieldValue('keys') || []).length ? '' : $t('network.static_routes')">
          <a-button type="link" class="px-0" @click="add">
            <a-icon type="plus-circle" theme="filled" class="mr-2" style="font-size: 16px" />
            {{ $t('network.static_routes.add') }}
          </a-button>
        </a-form-item>
      </a-form>
    </div>
    <div slot="footer">
      <a-button type="primary" @click="handleConfirm" :loading="loading">{{ $t('dialog.ok') }}</a-button>
      <a-button @click="cancelDialog">{{ $t('dialog.cancel') }}</a-button>
    </div>
  </base-dialog>
</template>

<script>
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'

let id = 0

const getInitialRoutes = (params = {}) => {
  const listData = params.listData
  if (Array.isArray(listData) && listData.length) {
    const routes = listData.map(item => ({
      net: item.cidr || item.net,
      gw: item.gateway || item.gw,
    })).filter(item => item.net && item.gw)
    if (routes.length) return routes
  }
  const meta = params.data?.[0]?.metadata?.static_routes
  if (!meta) return []
  try {
    const routes = typeof meta === 'string' ? JSON.parse(meta) : meta
    if (Array.isArray(routes)) {
      return routes.map(item => {
        if (Array.isArray(item)) {
          return { gw: item[0], net: item[1] }
        }
        return { gw: item.gw, net: item.net || item.cidr }
      }).filter(item => item.net && item.gw)
    }
    const keys = Object.keys(routes || {})
    if (!keys.length) return []
    return keys.map(net => ({ net, gw: routes[net] }))
  } catch (e) {
    return []
  }
}

export default {
  name: 'SetStaticRoutesDialog',
  mixins: [DialogMixin, WindowsMixin],
  data () {
    const initialRoutes = getInitialRoutes(this.params)
    return {
      loading: false,
      decorators: {
        routes: {
          net: i => [
            `net[${i}]`,
            {
              initialValue: initialRoutes[i]?.net || undefined,
              validateTrigger: ['change', 'blur'],
              validateFirst: true,
              rules: [
                { required: true, message: this.$t('network.static_routes.net_placeholder') },
                { validator: this.$validate('cidr') },
                { validator: this.checkNetDuplicate(i) },
              ],
            },
          ],
          gw: i => [
            `gw[${i}]`,
            {
              initialValue: initialRoutes[i]?.gw || undefined,
              validateTrigger: ['change', 'blur'],
              validateFirst: true,
              rules: [
                { required: true, message: this.$t('network.static_routes.gw_placeholder') },
                { validator: this.$validate('IPv4') },
              ],
            },
          ],
        },
      },
      formItemLayout: {
        wrapperCol: {
          md: { span: 16 },
          xl: { span: 18 },
          xxl: { span: 20 },
        },
        labelCol: {
          md: { span: 8 },
          xl: { span: 6 },
          xxl: { span: 4 },
        },
      },
      formItemLayoutWithOutLabel: {
        wrapperCol: {
          md: { span: 16, offset: 8 },
          xl: { span: 18, offset: 6 },
          xxl: { span: 20, offset: 4 },
        },
      },
    }
  },
  computed: {
    columns () {
      const fields = ['name', 'ip', 'server_type']
      return fields.map(field => (this.params.columns || []).find(item => item.field === field)).filter(Boolean)
    },
  },
  beforeCreate () {
    this.form = {}
    this.form.fc = this.$form.createForm(this, { name: 'set_static_routes_form' })
    const initialRoutes = getInitialRoutes(this.$options.propsData.params)
    id = initialRoutes.length ? initialRoutes.length - 1 : -1
    const keys = initialRoutes.map((_, idx) => idx)
    this.form.fc.getFieldDecorator('keys', { initialValue: keys, preserve: true })
  },
  methods: {
    checkNetDuplicate (currentKey) {
      return (rule, value, callback) => {
        if (!value) return callback()
        const keys = this.form.fc.getFieldValue('keys') || []
        const nets = this.form.fc.getFieldValue('net') || {}
        const duplicated = keys.some(key => key !== currentKey && nets[key] === value)
        if (duplicated) {
          return callback(new Error(this.$t('network.static_routes.net_duplicate')))
        }
        return callback()
      }
    },
    generateValues (values) {
      const keys = values.keys || []
      const staticRoutes = {}
      keys.forEach(key => {
        const net = values.net?.[key]
        const gw = values.gw?.[key]
        if (net && gw) {
          staticRoutes[net] = gw
        }
      })
      return {
        static_routes: Object.keys(staticRoutes).length ? staticRoutes : {},
      }
    },
    doSubmit (values) {
      return new this.$Manager('networks').performAction({
        id: this.params.data[0].id,
        action: 'metadata',
        data: this.generateValues(values),
      })
    },
    async handleConfirm () {
      this.loading = true
      try {
        const keys = this.form.fc.getFieldValue('keys') || []
        if (!keys.length) {
          this.loading = false
          this.$confirm({
            title: this.$t('network.set_static_routes'),
            content: this.$t('network.static_routes.clear_confirm'),
            okText: this.$t('dialog.ok'),
            cancelText: this.$t('dialog.cancel'),
            onOk: () => this.doClearStaticRoutes(),
          })
          return
        }
        const values = await this.form.fc.validateFields()
        await this.doSubmit(values)
        this.$message.success(this.$t('common.success'))
        this.params.ok && this.params.ok()
        this.cancelDialog()
      } catch (error) {
        throw error
      } finally {
        this.loading = false
      }
    },
    async doClearStaticRoutes () {
      this.loading = true
      try {
        await this.doSubmit({ keys: [] })
        this.$message.success(this.$t('common.success'))
        this.params.ok && this.params.ok()
        this.cancelDialog()
      } catch (error) {
        throw error
      } finally {
        this.loading = false
      }
    },
    add () {
      const keys = this.form.fc.getFieldValue('keys') || []
      this.form.fc.setFieldsValue({ keys: keys.concat(++id) })
    },
    remove (k) {
      const keys = this.form.fc.getFieldValue('keys') || []
      this.form.fc.setFieldsValue({
        keys: keys.filter(key => key !== k),
      })
    },
  },
}
</script>
