<template>
  <base-dialog @cancel="cancelDialog" :width="1000">
    <div slot="header">{{action}}</div>
    <div slot="body">
      <a-alert class="mb-2" type="warning">
        <div slot="message" v-if="params.data.length === 1">{{$t('compute.text_1167')}}</div>
        <div slot="message" v-else>
          <p>{{$t('compute.text_1168')}}</p>
          <p>{{$t('compute.text_1169')}}</p>
        </div>
      </a-alert>
      <dialog-selected-tips :name="$t('dictionary.server_container')" :count="params.data.length" :action="action" />
      <dialog-table :data="params.data" :columns="columns" />
      <a-form
        :form="form.fc"
        v-bind="formItemLayout">
        <a-form-item :label="$t('compute.text_1170')">
          <a-radio-group name="radioGroup" :defaultValue="true" v-if="isGroupAction" v-model="isOpenGpu">
            <a-radio :value="true">{{$t('compute.text_902')}}</a-radio>
            <a-radio :value="false">{{$t('compute.text_723')}}</a-radio>
          </a-radio-group>
          <a-switch :checkedChildren="$t('compute.text_115')" :unCheckedChildren="$t('compute.text_116')" v-model="isOpenGpu" v-else />
        </a-form-item>
        <!-- 多对一：批量绑定同一透传设备 -->
        <template v-if="isOpenGpu && isGroupAction">
          <a-form-item :extra="$t('compute.text_1171')">
            <span slot="label">
              {{ $t('compute.text_607') }}&nbsp;
              <a-tooltip :title="$t('compute.vgpu_check.tooltip')">
                <a-icon type="question-circle-o" />
              </a-tooltip>
            </span>
            <base-select
              v-decorator="decorators.device"
              :params="gpuParams"
              :need-params="false"
              :labelFormat="labelFormat"
              :disabled-items="disabledItems"
              filterable
              :resList.sync="gpuOpt"
              :mapper="mapper"
              resource="isolated_devices"
              :select-props="{ allowClear: true, placeholder: $t('compute.text_1172'), mode: 'default' }"
              @change="groupDeviceChange">
              <template v-slot:optionTemplate>
                <a-select-option v-for="item in gpuOpt" :key="item.id" :value="item.id" :disabled="item.__disabled">
                  <div class="d-flex">
                    <span class="text-truncate flex-fill mr-2" :title="labelFormat(item)">{{ labelFormat(item) }}</span>
                    <span style="color: #8492a6; font-size: 13px" v-show="item.totalCount > item.usedCount">{{$t('compute.text_1173', [ item.totalCount - item.usedCount , item.totalCount ])}}</span>
                    <span style="color: #8492a6; font-size: 13px" v-show="item.totalCount === item.usedCount">{{$t('compute.text_1174')}}</span>
                  </div>
                </a-select-option>
              </template>
            </base-select>
          </a-form-item>
          <a-form-item v-if="showGroupGpuType" :label="$t('gpu.device_type')">
            <base-select v-decorator="decorators.gpuType" :options="groupGpuTypeOptions" />
          </a-form-item>
          <a-form-item
            v-if="showGroupMemoryRequest"
            :label="$t('compute.pci.memory_request')">
            <a-tooltip
              :title="groupMemoryRangeTooltip"
              placement="top"
              :get-popup-container="getTooltipContainer">
              <disk-size-input
                v-decorator="decorators.memoryRequest"
                :min="1"
                :max="groupMemorySizeMb || Infinity"
                :step="1"
                :units="['MB', 'GB']"
                value-unit="MB"
                default-unit="GB"
                @change="onGroupMemoryRequestChange"
                @unitChange="onGroupMemoryUnitChange" />
            </a-tooltip>
          </a-form-item>
          <a-form-item :label="$t('compute.text_294')" :extra="$t('compute.text_1175')">
            <a-input-number :min="1" v-decorator="decorators.number" />
          </a-form-item>
        </template>
        <!-- 一对多：每台设备一行，可单独配置 -->
        <template v-if="isOpenGpu && !isGroupAction">
          <a-form-item :extra="$t('compute.text_1171')">
            <span slot="label">
              {{ $t('compute.text_607') }}&nbsp;
              <a-tooltip :title="$t('compute.vgpu_check.tooltip')">
                <a-icon type="question-circle-o" />
              </a-tooltip>
            </span>
            <div
              v-for="(k, index) in deviceKeys"
              :key="k"
              class="pci-device-row">
              <div class="pci-device-group">
                <div class="pci-select-row">
                  <a-form-item class="pci-select-item pci-select-item--model mb-0">
                    <fixed-label-filter :label="$t('compute.text_607')">
                      <base-select
                        v-decorator="decorators.deviceItem(k)"
                        :params="gpuParams"
                        :need-params="false"
                        :labelFormat="labelFormat"
                        filterable
                        :resList.sync="gpuOpt"
                        :disabled-items="getRowDisabledItems(k)"
                        resource="isolated_devices"
                        :select-props="{ allowClear: true, placeholder: $t('compute.text_1172'), mode: 'default' }"
                        @change="(val) => onRowDeviceChange(val, k)" />
                    </fixed-label-filter>
                  </a-form-item>
                  <a-form-item v-if="isRowGpuDevType(k)" class="pci-select-item pci-select-item--fixed mb-0">
                    <fixed-label-filter :label="$t('compute.pci.gpu_mode')">
                      <base-select v-decorator="decorators.gpuTypeItem(k)" :options="getRowGpuTypeOptions(k)" />
                    </fixed-label-filter>
                  </a-form-item>
                </div>
                <a-form-item
                  v-if="isRowHamiSharingMode(k)"
                  class="mb-0 pci-memory-item">
                  <fixed-label-filter :label="$t('compute.pci.memory_request')">
                    <a-tooltip
                      :title="getRowMemoryRangeTooltip(k)"
                      placement="top"
                      :get-popup-container="getTooltipContainer">
                      <disk-size-input
                        v-decorator="decorators.memoryRequestItem(k)"
                        :min="1"
                        :max="getRowMemorySizeMb(k) || Infinity"
                        :step="1"
                        :units="['MB', 'GB']"
                        value-unit="MB"
                        default-unit="GB"
                        @change="(val) => onRowMemoryRequestChange(val, k)"
                        @unitChange="(unit) => onRowMemoryUnitChange(k, unit)" />
                    </a-tooltip>
                  </fixed-label-filter>
                </a-form-item>
              </div>
              <a-button
                v-if="index > 0"
                class="pci-device-row__remove"
                shape="circle"
                icon="minus"
                size="small"
                @click="removeDeviceRow(k)" />
            </div>
            <div class="d-flex align-items-center">
              <a-button type="primary" shape="circle" icon="plus" size="small" @click="addDeviceRow" />
              <a-button type="link" @click="addDeviceRow">{{ $t('compute.pci.add_transparent_device') }}</a-button>
            </div>
          </a-form-item>
        </template>
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
  getDeviceGpuType,
  getGuestIsolatedDeviceMemoryRequest,
  GPU_TYPE_OPTION_MAP,
  formatIsolatedDeviceSelectLabel,
  getGpuTypeSelectOptions,
  resolveGpuTypeBySharingMode,
} from '@Compute/constants'
import {
  getIpsTableColumn,
} from '@/utils/common/tableColumn'
import DiskSizeInput from '@/sections/DiskSizeInput'
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'VmContainerAttachGpuDialog',
  components: {
    DiskSizeInput,
  },
  mixins: [DialogMixin, WindowsMixin],
  data () {
    this.deviceRowId = 0
    return {
      loading: false,
      action: this.$t('compute.text_1112'),
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
              { required: true, type: 'any', message: this.$t('compute.text_1172'), trigger: 'change' },
            ],
          },
        ],
        deviceItem: i => [
          `device[${i}]`,
          {
            rules: [
              { required: true, message: this.$t('compute.text_1172'), trigger: 'change' },
            ],
          },
        ],
        gpuType: [
          'gpu_type',
          {
            initialValue: GPU_TYPE_OPTION_MAP.HPC.value,
          },
        ],
        gpuTypeItem: i => [
          `gpu_type[${i}]`,
          {
            initialValue: GPU_TYPE_OPTION_MAP.HPC.value,
          },
        ],
        memoryRequest: [
          'memory_request',
          {
            rules: [
              { required: true, message: this.$t('compute.pci.memory_request.required') },
              { validator: (rule, value, callback) => this.validateMemoryRequest(rule, value, callback) },
            ],
          },
        ],
        memoryRequestItem: i => [
          `memory_request[${i}]`,
          {
            rules: [
              { required: true, message: this.$t('compute.pci.memory_request.required') },
              { validator: (rule, value, callback) => this.validateMemoryRequest(rule, value, callback, i) },
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
      gpuOpt: [],
      isOpenGpu: false,
      bindGpus: [],
      guestIsolatedDevices: [],
      deviceKeys: [0],
      groupMemoryUnit: 'GB',
      memoryUnits: {},
      columns: [
        {
          field: 'name',
          title: this.$t('compute.text_228'),
        },
        getIpsTableColumn({ field: 'ip', title: 'IP' }),
        {
          field: 'isolated_devices',
          title: this.$t('compute.text_113'),
          slots: {
            default: ({ row }) => {
              const ret = []
              if (row.isolated_devices) {
                row.isolated_devices.map(item => {
                  ret.push(<list-body-cell-wrap row={{ showName: `${item.addr || ''} ${item.model || ''}` }} field="showName" />)
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
    gpuTypeOptions () {
      return getGpuTypeSelectOptions()
    },
    groupGpuTypeOptions () {
      return getGpuTypeSelectOptions(this.selectedGroupDevice?.sharing_mode)
    },
    gpuParams () {
      if (this.selectedItems && this.selectedItems.length > 0) {
        let host = ''
        this.selectedItems.map(item => {
          host += item.host_id + ','
        })
        host = host.substring(0, host.lastIndexOf(','))
        return {
          'filter.0': `host_id.in(${host})`,
          limit: 0,
          'filter.1': 'dev_type.notin(USB,NIC,NVME-PT)',
          scope: this.$store.getters.scope,
        }
      }
      return {}
    },
    selectedGroupDevice () {
      const id = Array.isArray(this.form.fd.device) ? this.form.fd.device[0] : this.form.fd.device
      return this.gpuOpt.find(item => item.id === id)
    },
    showGroupGpuType () {
      return this.selectedGroupDevice?.dev_type === 'GPU'
    },
    showGroupMemoryRequest () {
      return this.selectedGroupDevice?.sharing_mode === 'HAMI'
    },
    groupMemorySizeMb () {
      return this.getDeviceMemorySizeMb(this.selectedGroupDevice)
    },
    groupMemoryRangeTooltip () {
      return this.getMemoryRangeText(this.groupMemorySizeMb, this.groupMemoryUnit || 'GB')
    },
    currentDeviceIds () {
      return this.deviceKeys.map(k => this.getFieldByKey(this.form.fd, 'device', k)).filter(Boolean)
    },
    // 虚拟机当前已绑定的透传设备
    currentlyBoundGpuIds () {
      if (this.guestIsolatedDevices.length) {
        return this.guestIsolatedDevices.map(item => this.getGuestIsolatedDeviceId(item))
      }
      const fromGuest = (this.selectedItems?.[0]?.isolated_devices || [])
        .filter(item => this.isAttachableGuestIsolatedDevice(item))
        .map(item => item.id)
      return fromGuest.length ? fromGuest : this.bindGpus
    },
    disabledItems () {
      if (this.isGroupAction) {
        return this.gpuOpt.filter(val => {
          if (val.usedCount === val.totalCount) {
            return true
          } else if (val.totalCount - val.usedCount < this.params.data.length) {
            return true
          }
          return false
        }).map(item => { return item.id })
      } else {
        return this.gpuOpt.filter(val => { return val.guest_id && val.guest_id !== this.selectedItems[0].id }).map(item => { return item.id })
      }
    },
    isGroupAction () { // 是否是批量操作
      if (this.params.data.length > 1) return true
      return false
    },
    isOpenAutoStart () {
      return this.selectedItems.every(item => item.status === 'ready')
    },
  },
  watch: {
    gpuOpt () {
      if (!this.isGroupAction) {
        const fromOpt = this.gpuOpt.filter(item => item.guest_id === this.params.data[0].id).map(item => item.id)
        // 避免 gpuOpt 瞬时变化把已绑定列表冲成空
        if (fromOpt.length) {
          this.bindGpus = fromOpt
        } else if (!this.bindGpus.length) {
          this.bindGpus = this.getBoundDeviceIds()
        }
        if (this.bindGpus.length > 0 && !this.currentDeviceIds.length) {
          this.initDeviceRows(this.bindGpus)
          this.isOpenGpu = true
        }
      }
    },
    disabledItems () {
      if (this.disabledItems && this.disabledItems.length && this.isGroupAction) { // 禁用某些选项
        this.disabledItems.forEach(disabledId => {
          this.gpuOpt.forEach(item => {
            if (disabledId === item.id) {
              item.__disabled = true
            }
          })
        })
      }
    },
    isOpenGpu (val) {
      if (val && !this.isGroupAction && !this.deviceKeys.length) {
        this.deviceKeys = [this.deviceRowId++]
      }
    },
  },
  created () {
    this.init()
  },
  methods: {
    isAttachableGuestIsolatedDevice (item) {
      return item.dev_type !== 'USB' && item.dev_type !== 'NIC' && item.dev_type !== 'NVME-PT'
    },
    getGuestIsolatedDeviceId (item) {
      return item.isolated_device_id || item.device || item.id
    },
    getBoundDeviceIds () {
      if (this.guestIsolatedDevices.length) {
        return this.guestIsolatedDevices.map(item => this.getGuestIsolatedDeviceId(item))
      }
      return (this.selectedItems?.[0]?.isolated_devices || [])
        .filter(item => this.isAttachableGuestIsolatedDevice(item))
        .map(item => item.id)
    },
    findDeviceById (id) {
      return this.gpuOpt.find(o => o.id === id) ||
        this.guestIsolatedDevices.find(o => this.getGuestIsolatedDeviceId(o) === id) ||
        (this.selectedItems[0]?.isolated_devices || []).find(o => o.id === id)
    },
    getRowDisabledItems (key) {
      const otherSelectedIds = this.deviceKeys
        .filter(k => k !== key)
        .map(k => this.getFieldByKey(this.form.fd, 'device', k))
        .filter(Boolean)
      const boundByOthers = this.gpuOpt
        .filter(val => val.guest_id && val.guest_id !== this.selectedItems[0].id)
        .map(item => item.id)
      return [...otherSelectedIds, ...boundByOthers]
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
        this.guestIsolatedDevices = (res.data.data || []).filter(item => this.isAttachableGuestIsolatedDevice(item))
      } catch (e) {
        this.guestIsolatedDevices = []
      }
    },
    async init () {
      if (!this.isGroupAction) {
        await this.fetchGuestIsolatedDevices()
        const bindDevices = this.getBoundDeviceIds()
        if (bindDevices.length > 0) {
          this.isOpenGpu = true
          this.bindGpus = bindDevices
          this.initDeviceRows(bindDevices)
        }
      }
    },
    initDeviceRows (ids = []) {
      this.deviceRowId = 0
      this.deviceKeys = ids.map(() => this.deviceRowId++)
      if (!this.deviceKeys.length) {
        this.deviceKeys = [this.deviceRowId++]
      }
      const fields = {}
      ids.forEach((id, index) => {
        const key = this.deviceKeys[index]
        fields[`device[${key}]`] = id
        const device = this.findDeviceById(id)
        const boundRecord = this.guestIsolatedDevices.find(item => this.getGuestIsolatedDeviceId(item) === id)
        const sharingMode = boundRecord?.sharing_mode || device?.sharing_mode
        const source = boundRecord || device
        if (source && source.dev_type === 'GPU') {
          fields[`gpu_type[${key}]`] = resolveGpuTypeBySharingMode(
            getDeviceGpuType(boundRecord) || getDeviceGpuType(device) || GPU_TYPE_OPTION_MAP.HPC.value,
            sharingMode,
          )
        }
        const memoryRequest = getGuestIsolatedDeviceMemoryRequest(boundRecord) ?? getGuestIsolatedDeviceMemoryRequest(device)
        if (sharingMode === 'HAMI' && memoryRequest !== undefined) {
          fields[`memory_request[${key}]`] = memoryRequest
        }
      })
      // 先同步到 fd，保证 HAMI 内存输入框能渲染
      Object.keys(fields).forEach(k => {
        this.$set(this.form.fd, k, fields[k])
      })
      this.$nextTick(() => {
        this.form.fc.setFieldsValue(fields)
        Object.assign(this.form.fd, fields)
        // memory 字段依赖 v-if 挂载，需再设一次
        this.$nextTick(() => {
          const memoryFields = {}
          Object.keys(fields).forEach(k => {
            if (k.startsWith('memory_request[')) {
              memoryFields[k] = fields[k]
            }
          })
          if (Object.keys(memoryFields).length) {
            this.form.fc.setFieldsValue(memoryFields)
            Object.assign(this.form.fd, memoryFields)
          }
        })
      })
    },
    getCurrentlyBoundDevices () {
      const list = this.guestIsolatedDevices.length
        ? this.guestIsolatedDevices
        : (this.selectedItems?.[0]?.isolated_devices || [])
          .filter(item => this.isAttachableGuestIsolatedDevice(item))
      return list.map((item, idx) => {
        const deviceId = this.getGuestIsolatedDeviceId(item)
        const opt = this.gpuOpt.find(o => o.id === deviceId) || item
        const devType = item.dev_type || opt.dev_type
        const gpuType = getDeviceGpuType(item) || getDeviceGpuType(opt) || ''
        return {
          device: deviceId,
          index: (item.index !== undefined && item.index !== null) ? item.index : idx,
          gpu_type: gpuType || (devType === 'GPU' ? GPU_TYPE_OPTION_MAP.HPC.value : ''),
          memory_request: getGuestIsolatedDeviceMemoryRequest(item) ?? opt.memory_request,
          sharing_mode: item.sharing_mode || opt.sharing_mode || '',
        }
      })
    },
    buildFormDeviceItem (id, data, key) {
      const device = this.findDeviceById(id)
      const boundRecord = this.guestIsolatedDevices.find(item => this.getGuestIsolatedDeviceId(item) === id)
      const sharingMode = boundRecord?.sharing_mode || device?.sharing_mode || ''
      const item = {
        device: id,
        sharing_mode: sharingMode,
      }
      if ((device?.dev_type || boundRecord?.dev_type) === 'GPU') {
        const gpuType = this.getFieldByKey(data, 'gpu_type', key) || this.getFieldByKey(this.form.fd, 'gpu_type', key)
        if (gpuType && typeof gpuType === 'string') {
          item.gpu_type = gpuType
        }
      }
      if (sharingMode === 'HAMI') {
        const memoryRequest = this.getFieldByKey(data, 'memory_request', key) ||
          this.getFieldByKey(this.form.fd, 'memory_request', key) ||
          getGuestIsolatedDeviceMemoryRequest(boundRecord)
        if (memoryRequest !== undefined && memoryRequest !== null && memoryRequest !== '') {
          item.memory_request = memoryRequest
        }
      }
      return item
    },
    normalizeCompareValue (val) {
      if (val === undefined || val === null || val === '') return ''
      return String(val)
    },
    isSameGpuType (a, b) {
      const left = this.normalizeCompareValue(a)
      const right = this.normalizeCompareValue(b)
      if (left === right) return true
      // 兼容：已绑定 gpu_type 为空，但表单字段带了默认值
      const defaultGpuType = GPU_TYPE_OPTION_MAP.HPC.value
      return (left === '' && right === defaultGpuType) || (right === '' && left === defaultGpuType)
    },
    isSameDeviceConfig (a, b) {
      return a.device === b.device &&
        this.isSameGpuType(a.gpu_type, b.gpu_type) &&
        this.normalizeCompareValue(a.memory_request) === this.normalizeCompareValue(b.memory_request) &&
        this.normalizeCompareValue(a.sharing_mode) === this.normalizeCompareValue(b.sharing_mode)
    },
    getFieldByKey (data = {}, name, key) {
      const flatKey = `${name}[${key}]`
      if (data[flatKey] !== undefined && data[flatKey] !== null && data[flatKey] !== '') {
        return data[flatKey]
      }
      // ant-design-vue validateFields 会把 name[0] 收成 name: [...]
      if (data[name] != null && typeof data[name] === 'object') {
        return data[name][key]
      }
      return undefined
    },
    getDeviceByKey (key) {
      const id = this.getFieldByKey(this.form.fd, 'device', key)
      return this.findDeviceById(id)
    },
    isRowGpuDevType (key) {
      const id = this.getFieldByKey(this.form.fd, 'device', key)
      const boundRecord = this.guestIsolatedDevices.find(item => this.getGuestIsolatedDeviceId(item) === id)
      return (this.getDeviceByKey(key)?.dev_type || boundRecord?.dev_type) === 'GPU'
    },
    isRowHamiSharingMode (key) {
      const id = this.getFieldByKey(this.form.fd, 'device', key)
      const boundRecord = this.guestIsolatedDevices.find(item => this.getGuestIsolatedDeviceId(item) === id)
      return boundRecord?.sharing_mode === 'HAMI' || this.getDeviceByKey(key)?.sharing_mode === 'HAMI'
    },
    getRowGpuTypeOptions (key) {
      const id = this.getFieldByKey(this.form.fd, 'device', key)
      const boundRecord = this.guestIsolatedDevices.find(item => this.getGuestIsolatedDeviceId(item) === id)
      const sharingMode = boundRecord?.sharing_mode || this.getDeviceByKey(key)?.sharing_mode
      return getGpuTypeSelectOptions(sharingMode)
    },
    getDeviceMemorySizeMb (device) {
      if (!device) return undefined
      return device.memory_size_mb || device.memory_size || undefined
    },
    getRowMemorySizeMb (key) {
      return this.getDeviceMemorySizeMb(this.getDeviceByKey(key))
    },
    getMemoryRangeText (maxMb, unit = 'GB') {
      if (!maxMb) return ''
      const factor = unit === 'GB' ? 1024 : 1
      const min = 1 / factor
      const max = maxMb / factor
      const fmt = (n) => (Number.isInteger(n) ? n : Number(n.toFixed(3)))
      return this.$t('compute.pci.memory_request.range', [fmt(min), fmt(max), unit])
    },
    getRowMemoryRangeTooltip (key) {
      return this.getMemoryRangeText(this.getRowMemorySizeMb(key), this.memoryUnits[key] || 'GB')
    },
    getTooltipContainer () {
      return document.body
    },
    validateMemoryRequest (rule, value, callback, key) {
      if (value === undefined || value === null || value === '') {
        callback()
        return
      }
      const num = Number(value)
      if (!Number.isInteger(num) || num <= 0) {
        callback(new Error(this.$t('compute.pci.memory_request.invalid')))
        return
      }
      const maxMb = key === undefined ? this.groupMemorySizeMb : this.getRowMemorySizeMb(key)
      if (maxMb && num > maxMb) {
        callback(new Error(this.getMemoryRangeText(maxMb, key === undefined ? this.groupMemoryUnit : (this.memoryUnits[key] || 'GB'))))
        return
      }
      callback()
    },
    clampMemoryRequest (val, maxMb) {
      if (val === undefined || val === null || val === '') return val
      const num = Number(val)
      if (!Number.isFinite(num)) return val
      if (maxMb && num > maxMb) return maxMb
      if (num < 1) return 1
      return Math.round(num)
    },
    onGroupMemoryRequestChange (val) {
      const next = this.clampMemoryRequest(val, this.groupMemorySizeMb)
      this.form.fc.setFieldsValue({ memory_request: next })
      this.$set(this.form.fd, 'memory_request', next)
    },
    onGroupMemoryUnitChange (unit) {
      this.groupMemoryUnit = unit
    },
    onRowMemoryRequestChange (val, key) {
      const next = this.clampMemoryRequest(val, this.getRowMemorySizeMb(key))
      this.form.fc.setFieldsValue({ [`memory_request[${key}]`]: next })
      this.$set(this.form.fd, `memory_request[${key}]`, next)
    },
    onRowMemoryUnitChange (key, unit) {
      this.$set(this.memoryUnits, key, unit)
    },
    groupDeviceChange (val) {
      this.form.fd.device = [val]
      if (!this.showGroupGpuType) {
        this.$delete(this.form.fd, 'gpu_type')
      } else {
        const nextGpuType = resolveGpuTypeBySharingMode(this.form.fd.gpu_type, this.selectedGroupDevice?.sharing_mode)
        this.form.fc.setFieldsValue({ gpu_type: nextGpuType })
        this.$set(this.form.fd, 'gpu_type', nextGpuType)
      }
      if (!this.showGroupMemoryRequest) {
        this.$delete(this.form.fd, 'memory_request')
      } else {
        const current = this.form.fd.memory_request
        const next = this.clampMemoryRequest(current, this.groupMemorySizeMb)
        if (current !== next) {
          this.form.fc.setFieldsValue({ memory_request: next })
          this.$set(this.form.fd, 'memory_request', next)
        }
      }
    },
    onRowDeviceChange (val, key) {
      if (val) {
        const duplicated = this.deviceKeys.some(k => {
          return k !== key && this.getFieldByKey(this.form.fd, 'device', k) === val
        })
        if (duplicated) {
          this.$message.warning(this.$t('compute.pci.device_duplicate'))
          this.form.fc.setFieldsValue({ [`device[${key}]`]: undefined })
          this.$delete(this.form.fd, `device[${key}]`)
          return
        }
      }
      this.$set(this.form.fd, `device[${key}]`, val)
      const device = this.gpuOpt.find(o => o.id === val)
      if (device?.dev_type === 'GPU') {
        const gpuType = resolveGpuTypeBySharingMode(
          this.getFieldByKey(this.form.fd, 'gpu_type', key) || GPU_TYPE_OPTION_MAP.HPC.value,
          device?.sharing_mode,
        )
        this.form.fc.setFieldsValue({
          [`gpu_type[${key}]`]: gpuType,
        })
        this.$set(this.form.fd, `gpu_type[${key}]`, gpuType)
      } else {
        this.$delete(this.form.fd, `gpu_type[${key}]`)
      }
      if (device?.sharing_mode !== 'HAMI') {
        this.$delete(this.form.fd, `memory_request[${key}]`)
      } else {
        const current = this.getFieldByKey(this.form.fd, 'memory_request', key)
        const next = this.clampMemoryRequest(current, this.getDeviceMemorySizeMb(device))
        if (current !== next) {
          this.form.fc.setFieldsValue({ [`memory_request[${key}]`]: next })
          this.$set(this.form.fd, `memory_request[${key}]`, next)
        }
      }
    },
    addDeviceRow () {
      const nextKey = ++this.deviceRowId
      this.deviceKeys = this.deviceKeys.concat(nextKey)
    },
    removeDeviceRow (k) {
      if (this.deviceKeys.length === 1) return
      this.deviceKeys = this.deviceKeys.filter(key => key !== k)
      this.$delete(this.form.fd, `device[${k}]`)
      this.$delete(this.form.fd, `gpu_type[${k}]`)
      this.$delete(this.form.fd, `memory_request[${k}]`)
    },
    // 按 device + gpu_type + memory_request + sharing_mode 对齐，多出的进 add，少掉的进 del
    buildDeviceDiff (data) {
      const formItems = []
      this.deviceKeys.forEach(key => {
        const id = this.getFieldByKey(data, 'device', key) || this.getFieldByKey(this.form.fd, 'device', key)
        if (!id) return
        formItems.push(this.buildFormDeviceItem(id, data, key))
      })
      const boundPool = this.getCurrentlyBoundDevices().slice()
      const addDevices = []
      formItems.forEach(item => {
        const matchIdx = boundPool.findIndex(b => this.isSameDeviceConfig(b, item))
        if (matchIdx >= 0) {
          boundPool.splice(matchIdx, 1)
        } else {
          // 提交时不带空字符串字段
          const payload = { device: item.device }
          if (item.gpu_type) payload.gpu_type = item.gpu_type
          if (item.memory_request !== undefined && item.memory_request !== null && item.memory_request !== '') {
            payload.memory_request = item.memory_request
          }
          if (item.sharing_mode) payload.sharing_mode = item.sharing_mode
          addDevices.push(payload)
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
        const gpuItem = this.gpuOpt.find(item => item.id === (Array.isArray(this.form.fd.device) ? this.form.fd.device[0] : this.form.fd.device))
        const model = gpuItem.model
        const remain = gpuItem.totalCount - gpuItem.usedCount
        if (selectedNum * count > remain) {
          this.$message.warning(this.$t('compute.text_1177'))
          throw new Error(this.$t('compute.text_1178'))
        }
        const attachData = {
          model,
          count,
          auto_start: data.autoStart,
          device: gpuItem.id,
        }
        if (gpuItem.sharing_mode) {
          attachData.sharing_mode = gpuItem.sharing_mode
        }
        if (this.showGroupGpuType && data.gpu_type) {
          attachData.gpu_type = data.gpu_type
        }
        if (this.showGroupMemoryRequest && data.memory_request) {
          attachData.memory_request = data.memory_request
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
      // 批量解除绑定 / 一对多关闭透传：删除当前已绑定设备
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
        if (this.isOpenGpu) {
          const values = await this.form.fc.validateFields()
          if (!this.isGroupAction) {
            const deviceIds = this.deviceKeys
              .map(k => this.getFieldByKey(values, 'device', k))
              .filter(Boolean)
            if (new Set(deviceIds).size !== deviceIds.length) {
              this.$message.warning(this.$t('compute.pci.device_duplicate'))
              throw new Error(this.$t('compute.pci.device_duplicate'))
            }
          }
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
    // 格式化基本数据
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
          // 兼容如果某个型号第一个就是已使用情况
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
    // 获取多个宿主机下共有的GPU型号数据
    filterSameModel (obj) {
      // 转成二维数组
      const arrs = []
      Object.values(obj).map(item => arrs.push(item))
      let arr = arrs.shift()
      for (let i = arrs.length; i--;) {
        const obj = {}
        arr = arr.concat(arrs[i]).filter((item, key) => {
          const objItem = obj[item.model]
          if (!objItem) {
            obj[item.model] = item
            obj[item.model].inx = key
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
        // 一对多：把 device/gpu_type/memory_request 的嵌套值展平到 fd[`name[index]`]
        if (!this.isGroupAction && ['device', 'gpu_type', 'memory_request'].includes(key) && value != null && typeof value === 'object') {
          if (Array.isArray(value)) {
            value.forEach((v, i) => {
              if (v !== undefined && v !== null) {
                this.$set(this.form.fd, `${key}[${i}]`, v)
              }
            })
          } else {
            Object.keys(value).forEach(subKey => {
              this.$set(this.form.fd, `${key}[${subKey}]`, value[subKey])
            })
          }
          return
        }
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

<style lang="less" scoped>
.pci-device-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  &:last-of-type {
    margin-bottom: 8px;
  }
  &__remove {
    flex-shrink: 0;
  }
}
.pci-device-group {
  flex: 1;
  min-width: 0;
  padding: 12px;
  // border: 1px solid #e8e8e8;
  border-radius: 4px;
  background: #fafafa;
}
.pci-select-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: flex-start;
}
.pci-memory-item {
  display: flex;
  flex: 0 0 auto;
  flex-wrap: wrap;
  align-items: flex-start;
  /deep/ .ant-form-item-label {
    float: none;
    width: auto !important;
    height: 32px;
    padding: 0 8px 0 0;
    line-height: 32px;
    white-space: nowrap;
    > label {
      height: 32px;
      line-height: 32px;
    }
  }
  /deep/ .ant-form-item-control-wrapper {
    flex: 0 0 auto;
    width: auto !important;
  }
  /deep/ .ant-form-item-control {
    line-height: 32px;
  }
}
.pci-select-item {
  margin-bottom: 0 !important;
  &--fixed {
    flex: 0 0 auto;
    /deep/ .ant-select {
      width: auto;
    }
  }
  &--model {
    flex: 1 1 200px;
    min-width: 200px;
    /deep/ .ant-form-item-control-wrapper {
      width: 100%;
    }
    /deep/ .profix-wrapper {
      width: 100%;
      > :not(.profix-label) {
        flex: 1;
        min-width: 0;
      }
    }
    /deep/ .ant-select {
      width: 100%;
    }
  }
}
</style>
