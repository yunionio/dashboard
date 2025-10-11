<template>
  <a-select label-in-value :value="value" :loading="loading" @change="imageChange" :filterOption="filterOption" :showSearch="true" option-filter-prop="children" :placeholder="$t('compute.text_214')" allowClear>
    <a-select-option v-for="item in imageOptions" :key="item.id" :value="item.id">
      <div :key="`${item.name} ${item.id}`">
        <a-row>
          <a-col :span="24">
            <div>{{ item.name }}<a-icon type="safety-certificate" v-if="isEncryped(item)" :title="$t('common.text.encrption_enable')" /></div>
          </a-col>
        </a-row>
        <a-row>
          <a-col :span="16">
            <div class="oc-selected-display-none text-color-secondary over-hidden" v-if="showExternalId && item.external_id">{{ $t('compute.text_1346') }}: {{ item.external_id }}</div>
          </a-col>
          <a-col :span="8" align="right">
            <div class="oc-selected-display-none text-color-secondary" style="text-align: right;">
              {{ imgLabels(item) }}
            </div>
          </a-col>
        </a-row>
      </div>
      <!-- <div class="d-flex align-items-center">
        <span class="flex-fill mr-2">{{ item.name }}</span>
        <a-tag v-show="item.feData.cached" color="green">{{$t('compute.text_152')}}</a-tag>
      </div> -->
    </a-select-option>
  </a-select>
</template>

<script>
import * as R from 'ramda'
import _ from 'lodash'
import { IMAGES_TYPE_MAP } from '@/constants/compute'
import { sizestr } from '@/utils/utils'

export default {
  name: 'ImageSelectTemplate',
  props: {
    value: {
    },
    imageOpts: {
      type: Array,
      default: () => [],
    },
    loading: {
      type: Boolean,
      default: false,
    },
    imageType: {
      type: String,
      required: true,
    },
  },
  computed: {
    imageOptions () {
      return this.imageOpts.filter((item) => { return !item.hidden })
    },
    showExternalId () {
      const showExternalIdList = [IMAGES_TYPE_MAP.public.key, IMAGES_TYPE_MAP.public_customize.key]
      if (showExternalIdList.includes(this.imageType)) {
        return true
      }
      return false
    },
  },
  methods: {
    imageChange (imageObj) {
      if (imageObj && R.is(Object, imageObj)) {
        if (R.is(Array, imageObj.label)) {
          const label = _.get(imageObj, 'label[0].children[0].children[0].text')
          imageObj = {
            ...imageObj,
            label,
          }
        }
      }
      this.$emit('change', imageObj)
      this.$emit('imageChange', imageObj)
    },
    filterOption (inp, option) {
      const input = inp.toLowerCase()
      const text = _.get(option.componentOptions, 'children[0].key') || ''
      return text.toLowerCase().indexOf(input) >= 0
    },
    imgLabels (img) {
      let min_disk_mb = 0
      if (img.min_disk) {
        min_disk_mb = img.min_disk
      } else if (img.server_config && img.server_config.disks && img.server_config.disks.length > 0) {
        min_disk_mb = img.server_config.disks[0].size
      } else if (img.info && (img.info.min_disk || img.info.min_disk_mb)) {
        min_disk_mb = img.info.min_disk || img.info.min_disk_mb
      }
      const min_disk = sizestr(min_disk_mb, 'M', 1024)
      let size = img.size
      if (img.size) {
        size = img.size
      } else if (img.size_mb) {
        size = img.size_mb * 1024 * 1024
      }
      const sizeStr = sizestr(size, 'B', 1024)
      const props = img.properties || (img.info ? img.info.properties : undefined)
      const arch = img.os_arch || (props && props.os_arch && props.os_arch === 'aarch64' ? this.$t('compute.cpu_arch.aarch64') : props?.os_arch) || 'x86_64'
      let bios = 'BIOS'
      if (props) {
        const { uefi_support, bios_support } = props
        if (uefi_support === 'true' && bios_support === 'true') {
          bios = 'BIOS & UEFI'
        } else if (uefi_support === 'true' && bios_support !== 'true') {
          bios = 'UEFI'
        } else if ((uefi_support !== 'true' && bios_support === 'true') || (uefi_support !== 'true' && bios_support !== 'true')) {
          bios = 'BIOS'
        }
      } else if (img.server_config && img.server_config.bios) {
        bios = img.server_config.bios
      }
      let part = 'MBR'
      if (props && props.partition_type) {
        part = props.partition_type.toUpperCase()
      } else if (bios === 'UEFI' || bios === 'BIOS & UEFI') {
        part = 'GPT'
      }
      return `${min_disk}|${sizeStr}|${arch}|${part}|${bios}`
    },
    isEncryped (img) {
      return !!img.encrypt_key_id
    },
  },
}
</script>

<style lang="less" scoped>
.over-hidden{
  margin-right: 10px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
