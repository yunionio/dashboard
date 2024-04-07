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
      <mirror-registry v-decorator="decorators.registryImage" />
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
      <labels :decorators="decorators.env" :title="$t('compute.repo.variables')" :keyLabel="$t('compute.repo.variables')" />
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

export default {
  name: 'SpecContainerForm',
  components: {
    Labels,
    MirrorRegistry,
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
  },
  data () {
    return {
      source: 'custom', // custom or registry
      labelList: [],
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
    labelChangeHandle (val) {
      this.labelList = val
    },
  },
}
</script>
