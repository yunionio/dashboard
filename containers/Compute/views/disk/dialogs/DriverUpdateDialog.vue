<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{$t('compute.disk.change_driver')}}</div>
    <div slot="body">
      <a-form
        :form="form.fc" v-bind="formItemLayout" hideRequiredMark>
        <dialog-table :data="dataList" :columns="columns" />
        <a-form-item label="SSD" :extra="$t('compute.disk.ssd_extra')">
          <a-switch v-model="is_ssd" />
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
        <a-form-item :label="$t('compute.disk.high_performance_mode')" :extra="$t('compute.disk.high_performance_extra')">
          <a-switch v-model="highPerformance" />
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
import { getNameDescriptionTableColumn } from '@/utils/common/tableColumn'
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
      dataList: [],
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
      is_ssd: false,
      highPerformance: false,
      formItemLayout: {
        wrapperCol: {
          span: 21,
        },
        labelCol: {
          span: 3,
        },
      },
      cacheModesOpts: [
        { label: 'none', value: 'none' },
        { label: 'writethrough', value: 'writethrough' },
        { label: 'writeback', value: 'writeback' },
      ],
      columns: [
        getNameDescriptionTableColumn({
          onManager: this.onManager,
          field: 'disk',
          hideField: true,
          formRules: [
            { required: true, message: i18n.t('compute.text_210') },
            { validator: this.$validate('resourceCreateName') },
          ],
          slotCallback: row => {
            return (
              <side-page-trigger onTrigger={ () => this.handleOpenSidepage(row) }>{ row.disk }</side-page-trigger>
            )
          },
        }),
        {
          title: this.$t('dictionary.server'),
          field: 'server',
        },
        {
          title: this.$t('compute.text_381'),
          formatter: ({ row }) => {
            return this.getDiskType(row.disk_type)
          },
        },
      ],
    }
  },
  computed: {
    ...mapGetters(['isAdminMode', 'isDomainMode', 'scope']),
    driversOpts () {
      if (this.is_ssd) {
        return [{ label: 'scsi', value: 'scsi' }]
      }
      return [
        { label: 'virtio', value: 'virtio' },
        { label: 'ide', value: 'ide' },
        { label: 'scsi', value: 'scsi' },
        { label: 'pvscsi', value: 'pvscsi' },
      ]
    },
  },
  watch: {
    is_ssd: {
      handler: function (val) {
        if (val) {
          this.form.fc.setFieldsValue({
            driver: 'scsi',
          })
        }
      },
    },
  },
  created () {
    this.fetchDrivers()
  },
  methods: {
    async fetchDrivers () {
      const { guests, id: disk_id, is_ssd } = this.params.data[0]
      const { id } = guests[0]
      if (id) {
        const drivers = await new this.$Manager('guestdisks', 'v2').list({ params: { server: id, scope: this.scope } })
        const { data = [] } = drivers.data
        const current = data.filter(item => {
          return item.disk_id === disk_id
        })
        if (current && current[0]) {
          const driver = current[0].driver
          this.form.fd = current[0]
          this.dataList = current
          this.form.fc.setFieldsValue({
            driver,
            cache_mode: current[0].cache_mode,
          })
          const rawIo = current[0].num_iothreads
          const numIo = rawIo === undefined || rawIo === null || rawIo === '' ? 0 : parseInt(rawIo, 10)
          this.highPerformance = !Number.isNaN(numIo) && numIo > 0
          this.is_ssd = driver !== 'scsi' ? false : is_ssd
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
    async doUpdate (data) {
      const actionData = {
        disk_id: data.disk,
        driver: data.driver,
        cache_mode: data.cache_mode,
      }
      actionData.performance = data.performance
      await new this.$Manager('servers', 'v2').performAction({
        id: data.server,
        action: 'change-disk-driver',
        data: actionData,
      })
    },
    async handleConfirm () {
      this.loading = true
      try {
        const values = await this.validateForm()
        const guests = this.params.data[0].guests || []
        const serverId = this.form.fd.guest_id || guests[0]?.id
        const params = {
          driver: values.driver,
          server: serverId,
          cache_mode: values.cache_mode,
          performance: this.highPerformance ? 'high' : 'normal',
          is_ssd: this.is_ssd,
          disk: this.params.data[0].id,
        }
        if (!params.server || !params.disk) {
          return
        }
        await this.doUpdate(params)
        this.$message.success(this.$t('common.success'))
        this.cancelDialog()
        if (this.params && typeof this.params.ok === 'function') {
          this.params.ok(this.params.data[0].id)
        }
      } catch (error) {
        throw error
      } finally {
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
