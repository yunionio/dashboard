<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{$t('compute.disk.change_driver')}}</div>
    <div slot="body">
      <a-alert :message="$t('compute.driver_exchange_tip')" type="warning" style="margin-bottom: 30px" />
      <a-form
        :form="form.fc" v-bind="formItemLayout" hideRequiredMark>
        <a-form-item :label="$t('dictionary.server')">
          <div class="text-box">{{form.fd.server}}</div>
        </a-form-item>
        <a-form-item :label="$t('compute.disk_name')">
          <div class="text-box">{{form.fd.disk}}</div>
        </a-form-item>
        <a-form-item :label="$t('compute.text_381')">
          <div class="text-box">{{getDiskType(form.fd.disk_type)}}</div>
        </a-form-item>
        <a-form-item :label="$t('compute.cache_mode')">
          <a-select v-decorator="decorators.cache_mode">
            <a-select-option v-for="item in cacheModesOpts" :key="item.value">
              {{item.label}}
            </a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item :label="$t('compute.text_634')">
          <a-select v-decorator="decorators.driver">
            <a-select-option v-for="item in driversOpts" :key="item.value">
              {{item.label}}
            </a-select-option>
          </a-select>
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
import { mapGetters } from 'vuex'
import i18n from '@/locales'
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'

const diskTypeMap = {
  sys: {
    label: i18n.t('compute.text_49'),
    value: 'sys',
  },
  data: {
    label: i18n.t('compute.text_50'),
    value: 'data',
  },
}

export default {
  name: 'DiskDriverUpdateDialog',
  mixins: [DialogMixin, WindowsMixin],
  data () {
    return {
      loading: false,
      form: {
        fc: this.$form.createForm(this),
        fd: {},
      },
      decorators: {
        driver: [
          'driver',
          {
            rules: [
              { required: true, message: this.$t('compute.driver.select_tip') },
            ],
          },
        ],
        cache_mode: [
          'cache_mode',
          {
            rules: [
              { required: false, message: this.$t('compute.disk.cache_mode.select_tip') },
            ],
          },
        ],
      },
      formItemLayout: {
        wrapperCol: {
          span: 21,
        },
        labelCol: {
          span: 3,
        },
      },
      driversOpts: [
        { label: 'virtio', value: 'virtio' },
        { label: 'ide', value: 'ide' },
        { label: 'scsi', value: 'scsi' },
        { label: 'pvscsi', value: 'pvscsi' },
      ],
      cacheModesOpts: [
        { label: 'none', value: 'none' },
        { label: 'writethrough', value: 'writethrough' },
        { label: 'writeback', value: 'writeback' },
      ],
    }
  },
  computed: {
    ...mapGetters(['isAdminMode', 'isDomainMode', 'scope']),
  },
  created () {
    this.fetchDrivers()
  },
  methods: {
    async fetchDrivers () {
      const { guests, id: disk_id } = this.params.data[0]
      const { id } = guests[0]
      if (id) {
        const drivers = await new this.$Manager('guestdisks', 'v2').list({ params: { server: id } })
        const { data = [] } = drivers.data
        const current = data.filter(item => {
          return item.disk_id === disk_id
        })
        if (current && current[0]) {
          this.form.fd = current[0]
          this.form.fc.setFieldsValue({
            driver: current[0].driver,
            cache_mode: current[0].cache_mode,
          })
        }
      }
    },
    validateForm () {
      return new Promise((resolve, reject) => {
        this.form.fc.validateFields((err, values) => {
          if (!err) {
            resolve(values)
          } else {
            reject(err)
          }
        })
      })
    },
    doUpdate (data) {
      return new this.$Manager('guestdisks', 'v2').jointUpdate({
        joints: [{ resource: 'servers', id: data.server }, { resource: 'disks', id: data.disk }],
        data: {
          driver: data.driver,
          cache_mode: data.cache_mode,
        },
      })
    },
    async handleConfirm () {
      this.loading = true
      try {
        const values = await this.validateForm()
        this.loading = true
        const params = {
          driver: values.driver,
          server: this.form.fd.guest_id,
          disk: this.form.fd.disk_id,
          cache_mode: values.cache_mode,
        }
        await this.doUpdate(params)
        this.loading = false
        this.$message.success(this.$t('common.success'))
        this.cancelDialog()
      } catch (error) {
        this.loading = false
      }
    },
    getDiskType (type) {
      return diskTypeMap[type]?.label || type
    },
  },
}
</script>
<style scoped>
.text-box{
  width: 100%;
  min-height: 32px;
  border: 1px solid #e8e8e8;
  padding: 0 11px;
  line-height: 32px;
  word-wrap: break-word;
  margin-top: 5px;
}
</style>
