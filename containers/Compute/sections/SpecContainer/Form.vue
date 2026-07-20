<template>
  <div>
    <a-form-item :label="$t('common.name')">
      <a-input
        v-decorator="decorators.name"
        :placeholder="$t('common.tips.input', [$t('common.name')])" />
    </a-form-item>
    <a-form-item :label="$t('compute.repo.image.source')">
      <a-radio-group default-value="custom" @change="handleSourceChange">
        <a-radio-button value="custom">{{ $t('compute.repo.image.custom') }}</a-radio-button>
        <a-radio-button value="registry">{{ $t('compute.repo.image.registry') }}</a-radio-button>
      </a-radio-group>
    </a-form-item>
    <a-form-item v-if="source === 'custom'" :label="$t('compute.repo.container_image')">
      <a-input
        v-decorator="decorators.image"
        :placeholder="$t('common.tips.input', [$t('compute.repo.container_image')])" />
    </a-form-item>
    <a-form-item v-else :label="$t('compute.repo.container_image')">
      <mirror-registry v-decorator="decorators.registryImage" @credential-change="handleCredentialChange" />
      <a-input v-show="false" v-decorator="decorators.imageCredentialId" />
    </a-form-item>
    <a-form-item label="CPU" v-show="false">
      <a-input
        :placeholder="$t('common.tips.input', [$t('compute.repo.cpu_cores')])"
        type="number"
        v-decorator="decorators.cpu"
        :addonAfter="$t('compute.repo.cpu_cores.unit')"
        :min="1"
        @blur="e => formatInput(e, 'cpu')" />
    </a-form-item>
    <a-form-item :label="$t('compute.repo.memory')" v-show="false">
      <a-input
        v-decorator="decorators.memory"
        :placeholder="$t('common.tips.input', [$t('compute.repo.memory')])"
        type="number"
        addonAfter="G"
        :min="1"
        @blur="e => formatInput(e, 'memory')" />
    </a-form-item>
    <a-form-item :label="$t('compute.repo.command')">
      <a-input v-decorator="decorators.command" :placeholder="$t('compute.repo.command.placeholder')" />
    </a-form-item>
    <a-form-item :label="$t('compute.repo.command.params')">
      <a-input v-decorator="decorators.arg" :placeholder="$t('compute.repo.command.params.placeholder')" />
    </a-form-item>
    <a-form-item :label="$t('compute.repo.data_volume')">
      <labels
        ref="volumeMountRef"
        :decorators="decorators.volumeMount"
        :title="$t('compute.repo.storage_statement')"
        :keyLabel="$t('compute.repo.storage_statement')"
        :valueLabel="$t('compute.repo.mount_point')"
        :keyPlaceholder="$t('common.tips.select', [$t('compute.repo.storage_volume')])"
        :valuePlaceholder="$t('compute.repo.mount_point.example')"
        :keyBaseSelectProps="keyBaseSelectProps"
        :checkedValues="checkedValues"
        @label-change="labelChangeHandle" />
    </a-form-item>
    <a-form-item :label="$t('compute.repo.env_variables')">
      <labels ref="envRef" :decorators="decorators.env" :title="$t('compute.repo.variables')" :keyLabel="$t('compute.repo.variables')" />
    </a-form-item>
    <a-form-item label="">
      <a-checkbox v-decorator="decorators.enableLxcfs">{{$t('compute.repo.enable_lxcfs')}}</a-checkbox>
    </a-form-item>
    <a-form-item label="">
      <a-checkbox v-decorator="decorators.enableSysDiskOverlay" @change="handleOverlayChange">{{$t('compute.repo.enable_sys_disk_overlay')}}</a-checkbox>
    </a-form-item>
    <a-form-item v-if="overlayEnabled" :label="$t('compute.repo.overlay_disk')">
      <data-disk
        ref="overlayDiskRef"
        :form="form"
        type="idc"
        :hypervisor="form.fd.hypervisor"
        :capabilityData="form.fi.capability || {}"
        :decorator="decorators.overlayDisk"
        :defaultType="form.fd.systemDiskType"
        :isVminstanceContainer="true"
        :isAddDiskShow="false"
        fieldPrefix="overlayDisk" />
    </a-form-item>
    <a-form-item v-if="overlayEnabled" label="">
      <a-checkbox v-decorator="decorators.rootfsPersistent">
        {{$t('compute.repo.rootfs_persistent')}}
        <a-tooltip :title="$t('compute.repo.rootfs_persistent.tips')">
          <a-icon type="question-circle-o" />
        </a-tooltip>
      </a-checkbox>
    </a-form-item>
    <a-form-item :label="$t('compute.repo.capabilities.add')">
      <a-select
        v-decorator="decorators.capAdd"
        mode="multiple"
        :placeholder="$t('compute.repo.capabilities.add.placeholder')"
        optionLabelProp="label"
        allowClear>
        <a-select-option v-for="cap in capabilityOptions" :key="cap.value" :value="cap.value" :label="cap.label">
          <span>{{ cap.label }}</span>
          <span style="color: rgba(0,0,0,.45); margin-left: 8px; font-size: 12px;">{{ cap.description }}</span>
        </a-select-option>
      </a-select>
    </a-form-item>
    <a-form-item :label="$t('compute.repo.capabilities.drop')">
      <a-select
        v-decorator="decorators.capDrop"
        mode="multiple"
        :placeholder="$t('compute.repo.capabilities.drop.placeholder')"
        optionLabelProp="label"
        allowClear>
        <a-select-option v-for="cap in capabilityOptions" :key="cap.value" :value="cap.value" :label="cap.label">
          <span>{{ cap.label }}</span>
          <span style="color: rgba(0,0,0,.45); margin-left: 8px; font-size: 12px;">{{ cap.description }}</span>
        </a-select-option>
      </a-select>
    </a-form-item>
    <a-form-item label="">
      <a-checkbox v-decorator="decorators.privileged">{{$t('compute.repo.privileged_mode')}}</a-checkbox>
    </a-form-item>
  </div>
</template>

<script>
import * as R from 'ramda'
import Labels from '@Compute/sections/Labels'
import MirrorRegistry from '@Compute/sections/MirrorRegistry'
import DataDisk from '@Compute/sections/DataDisk'
import { CAPABILITY_OPTIONS } from '@Compute/views/vminstance-container/constants'

export default {
  name: 'SpecContainerForm',
  components: {
    Labels,
    MirrorRegistry,
    DataDisk,
  },
  props: {
    decorators: {
      type: Object,
      required: true,
    },
    cluster: String,
    namespace: String,
    form: {
      tpye: Object,
      validator: val => val.fc,
    },
    paneKey: String,
    initItem: {
      type: Object,
      default: null,
    },
  },
  data () {
    return {
      source: 'custom', // custom or registry
      labelList: [],
      overlayEnabled: false,
      capabilityOptions: CAPABILITY_OPTIONS,
      initApplied: false,
    }
  },
  computed: {
    keyBaseSelectProps () {
      const { fd } = this.form
      const props = {
        options: [],
      }
      if (fd.dataDiskSizes) {
        for (const k in fd.dataDiskSizes) {
          const label = fd[`dataDiskTypes[${k}]`].label
          const idx = fd[`dataDiskTypes[${k}]`].index
          props.options.push({
            id: `${idx}`,
            name: `${this.$t('compute.text_376')}${idx + 1}: ${fd.dataDiskSizes[k]}G${label}`,
          })
        }
      }
      return props
    },
    checkedValues () {
      const { fc } = this.form
      let checkedValues = []

      if (this.labelList) {
        const mountNames = fc.getFieldValue('containerVolumeMountNames')
        if (mountNames && mountNames[this.paneKey]) {
          checkedValues = Object.values(mountNames[this.paneKey])
        }
      }
      return checkedValues
    },
  },
  watch: {
    initItem: {
      deep: true,
      handler (val) {
        if (val && !this.initApplied) {
          this.$nextTick(() => this.applyInitData(val))
        }
      },
    },
  },
  mounted () {
    if (this.initItem) {
      this.$nextTick(() => this.applyInitData(this.initItem))
    }
  },
  methods: {
    formatInput (e, field) {
      if (this.form && this.form.fc) {
        const val = Number(e.target.value)
        if (R.is(Number, val) && !Number.isNaN(val) && val >= 0) {
        } else {
          this.form.fc.setFieldsValue({
            [this.decorators[field][0]]: 1, // 不合法直接设置为初始值 1
          })
        }
      }
    },
    handleSourceChange (e) {
      this.source = e.target.value
    },
    handleOverlayChange (e) {
      this.overlayEnabled = e.target.checked
      if (this.overlayEnabled) {
        this.$nextTick(() => {
          if (this.$refs.overlayDiskRef) {
            this.$refs.overlayDiskRef.add()
          }
        })
      }
    },
    handleCredentialChange (credentialId) {
      if (this.form && this.form.fc && this.decorators.imageCredentialId) {
        this.form.fc.setFieldsValue({
          [this.decorators.imageCredentialId[0]]: credentialId,
        })
      }
    },
    labelChangeHandle (val) {
      this.labelList = val
    },
    applyInitData (item = {}) {
      if (!item || this.initApplied) return
      if (item.image_credential_id) {
        this.source = 'registry'
      }
      if (item.rootfs) {
        this.overlayEnabled = true
      }
      const fc = this.form && this.form.fc
      if (!fc || !this.decorators) return
      const field = (decorator) => (decorator && decorator[0]) || ''
      const values = {}
      const nameField = field(this.decorators.name)
      const imageField = field(this.decorators.image)
      const registryField = field(this.decorators.registryImage)
      const credentialField = field(this.decorators.imageCredentialId)
      const commandField = field(this.decorators.command)
      const argField = field(this.decorators.arg)
      const privilegedField = field(this.decorators.privileged)
      const lxcfsField = field(this.decorators.enableLxcfs)
      const capAddField = field(this.decorators.capAdd)
      const capDropField = field(this.decorators.capDrop)
      const overlayField = field(this.decorators.enableSysDiskOverlay)
      const rootfsPersistentField = field(this.decorators.rootfsPersistent)
      if (nameField) values[nameField] = item.name || ''
      if (item.image_credential_id) {
        if (registryField) values[registryField] = item.image || ''
        if (credentialField) values[credentialField] = item.image_credential_id
      } else if (imageField) {
        values[imageField] = item.image || ''
      }
      if (commandField) values[commandField] = (item.command || []).filter(Boolean).join(' ')
      if (argField) values[argField] = (item.args || []).filter(Boolean).join(' ')
      if (privilegedField) values[privilegedField] = !!item.privileged
      if (lxcfsField) values[lxcfsField] = item.enable_lxcfs !== false
      if (capAddField) values[capAddField] = item.capabilities?.add || []
      if (capDropField) values[capDropField] = item.capabilities?.drop || []
      if (overlayField) values[overlayField] = !!item.rootfs
      if (rootfsPersistentField) values[rootfsPersistentField] = !!item.rootfs?.persistent
      // 延迟一拍，确保 v-decorator 已注册；再重试一次防止被 tabs 延迟渲染吞掉
      const doSet = () => {
        fc.setFieldsValue(values)
      }
      this.$nextTick(() => {
        doSet()
        this.initApplied = true
        setTimeout(() => {
          doSet()
          if (item.envs?.length && this.$refs.envRef) {
            this.$refs.envRef.initData(item.envs.map(env => ({ key: env.key, value: env.value })))
          }
          if (item.volume_mounts?.length && this.$refs.volumeMountRef) {
            this.$refs.volumeMountRef.initData(item.volume_mounts.map(vm => ({
              key: `${vm.disk?.index ?? ''}`,
              value: vm.mount_path,
            })))
          }
        }, 300)
      })
    },
    initContainerData (item = {}) {
      this.initApplied = false
      this.applyInitData(item)
    },
  },
}
</script>
