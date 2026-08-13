<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{action}}</div>
    <div slot="body">
      <a-alert class="mb-2" type="warning">
        <div slot="message" v-if="params.data.length === 1">{{$t('compute.text_1400')}}</div>
        <div slot="message" v-else>
          <p>{{$t('compute.text_1168')}}</p>
          <p>{{$t('compute.text_1169')}}</p>
        </div>
      </a-alert>
      <dialog-selected-tips :name="$t('dictionary.server')" :count="params.data.length" :action="action" />
      <dialog-table :data="params.data" :columns="columns" />
      <a-form
        :form="form.fc"
        v-bind="formItemLayout">
        <a-form-item :label="$t('compute.text_1170')">
          <a-radio-group name="radioGroup" :defaultValue="true" v-if="isGroupAction" v-model="isOpenUsb">
            <a-radio :value="true">{{$t('compute.text_902')}}</a-radio>
            <a-radio :value="false">{{$t('compute.text_723')}}</a-radio>
          </a-radio-group>
          <a-switch :checkedChildren="$t('compute.text_115')" :unCheckedChildren="$t('compute.text_116')" v-model="isOpenUsb" v-else />
        </a-form-item>
        <a-form-item :label="$t('compute.text_1401')" v-show="isOpenUsb" :extra="$t('compute.text_1402')">
          <!-- 批量设置 -->
          <base-select
            v-if="isGroupAction"
            v-decorator="decorators.device"
            :params="usbParams"
            :need-params="false"
            :labelFormat="labelFormat"
            :disabled-items="disabledItems"
            filterable
            :resList.sync="usbOpt"
            :mapper="mapper"
            resource="isolated_devices"
            :select-props="{ allowClear: true, placeholder: $t('compute.text_1172'), mode: 'default' }">
            <template v-slot:optionTemplate>
              <a-select-option v-for="item in usbOpt" :key="item.id" :value="item.id" :disabled="item.__disabled">
                <div class="d-flex">
                  <span class="text-truncate flex-fill mr-2" :title="item.model">{{ item.model }}</span>
                  <span style="color: #8492a6; font-size: 13px" v-show="item.totalCount > item.usedCount">{{$t('compute.text_1173', [ item.totalCount - item.usedCount , item.totalCount ])}}</span>
                  <span style="color: #8492a6; font-size: 13px" v-show="item.totalCount === item.usedCount">{{$t('compute.text_1174')}}</span>
                </div>
              </a-select-option>
            </template>
          </base-select>
          <!-- 单条操作 -->
          <base-select
            v-else
            v-decorator="decorators.device"
            :params="usbParams"
            :need-params="false"
            filterable
            :options="usbOptions"
            :select-props="{ allowClear: true, placeholder: $t('compute.text_1403'), mode: 'multiple', loading: usbOptionsLoading }" />
        </a-form-item>
        <a-form-item :label="$t('compute.text_294')" v-show="isOpenUsb && isGroupAction" :extra="$t('compute.text_1175')">
          <a-input-number :min="1" v-decorator="decorators.number" />
        </a-form-item>
        <a-form-item :label="$t('compute.text_494')" :extra="$t('compute.text_495')" v-if="isOpenAutoStart">
          <a-switch :checkedChildren="$t('compute.text_115')" :unCheckedChildren="$t('compute.text_116')" v-decorator="decorators.autoStart" />
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
import * as R from 'ramda'
import {
  formatIsolatedDeviceSelectLabel,
} from '@Compute/constants'
import {
  getIpsTableColumn,
} from '@/utils/common/tableColumn'
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'VmAttachUsbDialog',
  mixins: [DialogMixin, WindowsMixin],
  data () {
    return {
      loading: false,
      action: this.$t('compute.text_1399'),
      form: {
        fc: this.$form.createForm(this, { onValuesChange: this.onValuesChange }),
        fd: {
          device: [],
        },
      },
      decorators: {
        device: [
          'device',
          {
            rules: [
              { required: true, type: 'any', message: this.$t('compute.text_1403'), trigger: 'change' },
            ],
          },
        ],
        autoStart: [
          'autoStart',
          {
            valuePropName: 'checked',
            initialValue: false,
          },
        ],
        number: [
          'number',
          {
            initialValue: 1,
          },
        ],
      },
      formItemLayout: {
        wrapperCol: {
          span: 20,
        },
        labelCol: {
          span: 4,
        },
      },
      usbOpt: [],
      usbOptions: [],
      isOpenUsb: false,
      bindUsbs: [],
      guestIsolatedDevices: [],
      usbOptionsLoading: false,
      columns: [
        {
          field: 'name',
          title: this.$t('compute.text_228'),
        },
        getIpsTableColumn({ field: 'ip', title: 'IP' }),
        {
          field: 'usb',
          title: 'USB',
          slots: {
            default: ({ row }) => {
              const ret = []
              if (row.isolated_devices) {
                row.isolated_devices.map(item => {
                  if (item.dev_type === 'USB') {
                    ret.push(<list-body-cell-wrap row={{ showName: `${item.addr || ''} ${item.model || ''}` }} field="showName" />)
                  }
                })
              }
              return ret
            },
          },
        },
      ],
    }
  },
  computed: {
    selectedItems () {
      return this.params.data
    },
    usbParams () {
      if (this.selectedItems && this.selectedItems.length > 0) {
        let host = ''
        this.selectedItems.map(item => {
          host += item.host_id + ','
        })
        host = host.substring(0, host.lastIndexOf(','))
        return {
          'filter.0': `host_id.in(${host})`,
          limit: 0,
          'filter.1': 'dev_type.equals(USB)',
          scope: this.$store.getters.scope,
        }
      }
      return {}
    },
    disabledItems () {
      if (this.isGroupAction) {
        return this.usbOpt.filter(val => {
          if (val.usedCount === val.totalCount) {
            return true
          } else if (val.totalCount - val.usedCount < this.params.data.length) {
            return true
          }
          return false
        }).map(item => { return item.id })
      }
      return this.usbOpt.filter(val => { return val.guest_id && val.guest_id !== this.selectedItems[0].id }).map(item => { return item.id })
    },
    isGroupAction () {
      if (this.params.data.length > 1) return true
      return false
    },
    isOpenAutoStart () {
      return this.selectedItems.every(item => item.status === 'ready')
    },
  },
  watch: {
    disabledItems () {
      if (this.disabledItems && this.disabledItems.length && this.isGroupAction) {
        this.disabledItems.forEach(disabledId => {
          this.usbOpt.forEach(item => {
            if (disabledId === item.id) {
              item.__disabled = true
            }
          })
        })
      }
    },
  },
  created () {
    this.init()
  },
  methods: {
    isUsbDevice (item) {
      return item.dev_type === 'USB'
    },
    getGuestIsolatedDeviceId (item) {
      return item.isolated_device_id || item.device || item.id
    },
    getBoundDeviceIds () {
      if (this.guestIsolatedDevices.length) {
        return this.guestIsolatedDevices.map(item => this.getGuestIsolatedDeviceId(item))
      }
      return (this.selectedItems?.[0]?.isolated_devices || [])
        .filter(item => this.isUsbDevice(item))
        .map(item => item.id)
    },
    getCurrentlyBoundDevices () {
      const list = this.guestIsolatedDevices.length
        ? this.guestIsolatedDevices
        : (this.selectedItems?.[0]?.isolated_devices || [])
          .filter(item => this.isUsbDevice(item))
      return list.map((item, idx) => {
        const deviceId = this.getGuestIsolatedDeviceId(item)
        return {
          device: deviceId,
          index: (item.index !== undefined && item.index !== null) ? item.index : idx,
        }
      })
    },
    async fetchGuestIsolatedDevices () {
      const guest = this.selectedItems?.[0]
      if (!guest?.id || !guest?.isolated_devices?.length) {
        this.guestIsolatedDevices = []
        return
      }
      try {
        const res = await new this.$Manager('guestisolateddevices').list({
          params: {
            limit: 0,
            guest_id: guest.id,
            scope: this.$store.getters.scope,
          },
        })
        this.guestIsolatedDevices = (res.data.data || []).filter(item => this.isUsbDevice(item))
      } catch (e) {
        this.guestIsolatedDevices = []
      }
    },
    async init () {
      if (!this.isGroupAction) {
        await this.fetchGuestIsolatedDevices()
        const bindDevices = this.getBoundDeviceIds()
        if (bindDevices.length > 0) {
          this.isOpenUsb = true
          this.bindUsbs = bindDevices
        }
        await this.initUsbOptions()
      }
    },
    async initUsbOptions () {
      try {
        this.usbOptionsLoading = true
        const acttachedRes = await new this.$Manager('isolated_devices', 'v2').list({
          params: {
            $t: 2,
            guest_id: this.params.data[0].id,
          },
        })
        const { data: acttachedList = [] } = acttachedRes.data
        const probleDevRes = await new this.$Manager('isolated_devices', 'v2').list({
          params: {
            $t: 1,
            host_id: this.params.data[0].host_id,
          },
        })
        const { data: probleDevList = [] } = probleDevRes.data
        const device = this.bindUsbs.length
          ? this.bindUsbs
          : acttachedList.filter(item => this.isUsbDevice(item)).map(item => item.id)
        this.bindUsbs = device
        this.form.fc.setFieldsValue({
          device,
        })
        const list = [...acttachedList]
        probleDevList.forEach(item => {
          if (!item.guest_id && !list.some(l => l.id === item.id)) {
            list.push(item)
          }
        })
        const usbOptions = list.filter(item => {
          return this.isUsbDevice(item)
        }).map(item => {
          return {
            key: item.id,
            id: item.id,
            name: `${item.addr || ''} ${item.model || ''}`,
          }
        })
        usbOptions.sort((a, b) => {
          return a.key - b.key
        })
        this.usbOptions = usbOptions
      } catch (err) {
        throw err
      } finally {
        this.usbOptionsLoading = false
      }
    },
    buildDeviceDiff (data) {
      const formIds = (Array.isArray(data.device) ? data.device : [data.device]).filter(Boolean)
      const boundPool = this.getCurrentlyBoundDevices().slice()
      const addDevices = []
      formIds.forEach(id => {
        const matchIdx = boundPool.findIndex(b => b.device === id)
        if (matchIdx >= 0) {
          boundPool.splice(matchIdx, 1)
        } else {
          addDevices.push({ device: id })
        }
      })
      return {
        addDevices,
        delDevices: boundPool.map(({ device, index }) => ({ device, index })),
      }
    },
    buildDelDevices (boundDevices) {
      const list = boundDevices || this.getCurrentlyBoundDevices()
      return list.map(({ device, index }) => ({ device, index }))
    },
    async doAttachSubmit (data) {
      const ids = this.params.data.map(item => item.id)
      if (ids.length > 1) {
        const selectedNum = this.params.data.length
        const { number: count } = data
        const usbItem = this.usbOpt.find(item => item.id === (Array.isArray(this.form.fd.device) ? this.form.fd.device[0] : this.form.fd.device))
        const model = usbItem.model
        const remain = usbItem.totalCount - usbItem.usedCount
        if (selectedNum * count > remain) {
          this.$message.warning(this.$t('compute.text_1177'))
          throw new Error(this.$t('compute.text_1178'))
        }
        const attachData = {
          model,
          count,
          auto_start: data.autoStart,
          device: usbItem.id,
        }
        return this.params.onManager('batchPerformAction', {
          id: ids,
          steadyStatus: ['running', 'ready'],
          managerArgs: {
            action: 'attach-isolated-device',
            data: attachData,
          },
        })
      }
      const { addDevices, delDevices } = this.buildDeviceDiff(data)
      const params = {
        add_devices: addDevices,
        del_devices: delDevices,
        auto_start: data.autoStart,
      }
      return this.params.onManager('batchPerformAction', {
        id: ids,
        steadyStatus: ['running', 'ready'],
        managerArgs: {
          action: 'set-isolated-device',
          data: params,
        },
      })
    },
    async doDetachSubmit (data) {
      let params = {}
      if (this.isGroupAction) {
        params = {
          detach_all: true,
          auto_start: data.autoStart,
        }
      } else {
        params = {
          add_devices: [],
          del_devices: this.buildDelDevices(this.getCurrentlyBoundDevices()),
          auto_start: data.autoStart,
        }
      }
      const ids = this.params.data.map(item => item.id)

      return this.params.onManager('batchPerformAction', {
        id: ids,
        steadyStatus: ['running', 'ready'],
        managerArgs: {
          action: this.isGroupAction ? 'detach-isolated-device' : 'set-isolated-device',
          data: params,
        },
      })
    },
    async handleConfirm () {
      this.loading = true
      try {
        if (this.isOpenUsb) {
          const values = await this.form.fc.validateFields()
          await this.doAttachSubmit(values)
        } else {
          const values = await this.form.fc.getFieldsValue()
          await this.doDetachSubmit(values)
        }
        this.loading = false
        this.cancelDialog()
      } catch (error) {
        this.loading = false
        throw error
      }
    },
    mapper (data) {
      let newData = []
      newData = this.grpupMapper(data)
      return newData
    },
    genResourceData (data) {
      const obj = {}
      for (let i = 0; i < data.length; i++) {
        const item = data[i]
        if (!obj[item.model]) {
          obj[item.model] = {
            usedCount: item.guest ? 1 : 0,
            totalCount: 1,
          }
          if (!item.guest) {
            obj[item.model] = {
              ...obj[item.model],
              ...item,
            }
          }
          if (item.guest && !obj[item.model].id) {
            obj[item.model] = {
              ...obj[item.model],
              ...item,
            }
          }
        } else {
          obj[item.model].totalCount += 1
          if (item.guest) {
            obj[item.model].usedCount += 1
          } else {
            obj[item.model] = {
              ...obj[item.model],
              ...item,
            }
          }
        }
      }
      const newData = []
      R.forEachObjIndexed((value, key) => {
        newData.push(value)
      }, obj)
      return newData
    },
    grpupMapper (data) {
      const obj = {}
      for (var i = 0; i < data.length; i++) {
        const item = data[i]
        if (!obj[item.host_id]) {
          obj[item.host_id] = [
            item,
          ]
        } else {
          obj[item.host_id].push(item)
        }
      }
      for (const key in obj) {
        obj[key] = this.genResourceData(obj[key])
      }
      return this.filterSameModel(obj)
    },
    filterSameModel (obj) {
      const arrs = []
      Object.values(obj).map(item => arrs.push(item))
      let arr = arrs.shift()
      for (let i = arrs.length; i--;) {
        const modelMap = {}
        arr = arr.concat(arrs[i]).filter((item, key) => {
          const objItem = modelMap[item.model]
          if (!objItem) {
            modelMap[item.model] = item
            modelMap[item.model].inx = key
          }
          if (objItem && objItem.inx !== key) {
            const readyRemain = objItem.totalCount - objItem.usedCount
            const targetRemain = item.totalCount - item.usedCount
            if (readyRemain > targetRemain) {
              objItem.totalCount = item.totalCount
              objItem.usedCount = item.usedCount
            } else {
              item.totalCount = objItem.totalCount
              item.usedCount = objItem.usedCount
            }
            return true
          }
          return false
        })
      }
      this.selectedItems.map(item => {
        if (!obj[item.host_id]) {
          arr = []
        }
      })
      return arr
    },
    labelFormat (val) {
      return formatIsolatedDeviceSelectLabel(val)
    },
    onValuesChange (props, values) {
      Object.keys(values).forEach((key) => {
        const value = values[key]
        if (key === 'device' && this.isGroupAction) {
          this.form.fd[key] = [value]
        } else {
          this.form.fd[key] = value
        }
      })
    },
  },
}
</script>
