<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{ title }}</div>
    <div slot="body">
      <dialog-selected-tips :name="$t('dictionary.network')" :count="params.data.length" :action="action" />
      <dialog-table :data="params.data" :columns="columns" />
      <a-form :form="form.fc" class="mt-3" v-bind="formItemLayout" hideRequiredMark>
        <a-form-item
          v-for="(k, index) in form.fc.getFieldValue('keys')"
          :key="k"
          v-bind="index === 0 ? formItemLayout : formItemLayoutWithOutLabel"
          :label="index === 0 ? $t('network.mac_ip.mapping_table') : ''"
          :required="false">
          <a-row :gutter="6">
            <a-col :span="11">
              <a-form-item
                :wrapperCol="{ span: 24 }"
                class="mb-0 mr-1">
                <a-input v-decorator="decorators.mappingTables.ip(k)" :placeholder="$t('network.text_217')" />
              </a-form-item>
            </a-col>
            <a-col :span="11">
              <a-form-item
                :wrapperCol="{ span: 24 }"
                class="mb-0 mr-1">
                <a-input v-decorator="decorators.mappingTables.mac(k)" :placeholder="$t('common.tips.input', [$t('network.text_228')])" />
              </a-form-item>
            </a-col>
            <a-col :span="2" v-show="!isEdit">
              <a-button v-if="index === 0" type="primary" shape="circle" icon="plus" size="small" @click="add" />
              <a-button v-else shape="circle" icon="minus" size="small" @click="remove(k)" />
            </a-col>
          </a-row>
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
import { Manager } from '@/utils/manager'

let id = 0
export default {
  name: 'NetworkIpMacsCreateDialog',
  mixins: [DialogMixin, WindowsMixin],
  data () {
    return {
      loading: false,
      decorators: {
        mappingTables: {
          ip: i => [
            `ip[${i}]`,
            {
              initialValue: this.params.editData?.[i].ip_addr || undefined,
              validateTrigger: ['change', 'blur'],
              validateFirst: true,
              rules: [
                { required: true, message: this.$t('network.text_217') },
                { validator: this.$validate('IPv4') },
              ],
            },
          ],
          mac: i => [
            `mac[${i}]`,
            {
              initialValue: this.params.editData?.[i].mac_addr || undefined,
              validateTrigger: ['change', 'blur'],
              validateFirst: true,
              rules: [
                { required: true, message: this.$t('common.tips.input', [this.$t('network.text_228')]) },
                { validator: this.$validate('mac') },
              ],
            },
          ],
        },
      },
      columns: [
        {
          field: 'name',
          title: this.$t('common.name'),
        },
        {
          field: 'vpc',
          title: 'VPC',
        },
        {
          field: 'ip',
          title: this.$t('network.text_213'),
          width: 180,
          slots: {
            default: ({ row }) => {
              return [
                <div>{ this.$t('network.ip.start', [row.guest_ip_start, row.guest_ip_mask])}</div>,
                <div>{ this.$t('network.ip.end', [row.guest_ip_end, row.guest_ip_mask])}</div>,
              ]
            },
          },
        },
        {
          field: 'ip',
          title: this.$t('network.ipv6.address'),
          width: 180,
          slots: {
            default: ({ row }) => {
              if (!row.guest_ip6_start || !row.guest_ip6_end) {
                return '-'
              }
              return [
                <div>{ this.$t('network.ip.start', [row.guest_ip6_start, row.guest_ip6_mask])}</div>,
                <div>{ this.$t('network.ip.end', [row.guest_ip6_end, row.guest_ip6_mask])}</div>,
              ]
            },
          },
        },
      ],
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
    isEdit () {
      return this.params.editData
    },
    title () {
      return this.isEdit ? this.$t('common.edit') : this.$t('common.create')
    },
    action () {
      return this.isEdit ? this.$t('network.mac_ip.edit_mapping_table') : this.$t('network.mac_ip.create_mapping_table')
    },
  },
  beforeCreate () {
    this.form = {}
    this.form.fc = this.$form.createForm(this, { name: 'ip_mac_create_form' })
    this.form.fc.getFieldDecorator('keys', { initialValue: [id], preserve: true })
  },
  methods: {
    generateValues (values) {
      const data = {
        network_id: this.params.data[0].id,
      }
      const ip_mac = {}
      values.keys.forEach(key => {
        const ip = values.ip[key]
        const mac = values.mac[key]
        ip_mac[`${ip}`] = mac
      })
      data.ip_mac = ip_mac
      return data
    },
    async doCreate (values) {
      const manager = new Manager('network_ip_macs/batch-create')
      const data = this.generateValues(values)
      await manager.create({ data })
    },
    async doUpdate (values) {
      const manager = new Manager('network_ip_macs')
      const data = {
        ip_addr: values.ip[0],
        mac_addr: values.mac[0],
      }
      await manager.update({
        id: this.params.editData[0].id,
        data,
      })
    },
    async handleConfirm () {
      this.loading = true
      try {
        const { validateFields } = this.form.fc
        const values = await validateFields()
        this.isEdit ? this.doUpdate(values) : this.doCreate(values)
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
      const { form } = this
      const keys = form.fc.getFieldValue('keys')
      const nextKeys = keys.concat(++id)
      form.fc.setFieldsValue({ keys: nextKeys })
    },
    remove (k) {
      const { form } = this
      const keys = form.fc.getFieldValue('keys')

      if (keys.length === 1) {
        return
      }
      form.fc.setFieldsValue({
        keys: keys.filter(key => key !== k),
      })
    },
  },
}
</script>

<style>

</style>
