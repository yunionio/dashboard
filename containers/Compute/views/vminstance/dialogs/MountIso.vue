<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{$t('compute.text_366')}}</div>
    <div slot="body">
      <dialog-selected-tips :name="$t('dictionary.server')" :count="params.data.length" :action="$t('compute.text_366')" />
      <dialog-table :data="params.data" :columns="params.columns.slice(0, 3)" />
      <a-form :form="form.fc" hideRequiredMark>
        <a-form-item v-if="hasMounted" :label="$t('compute.iso.mounted')" v-bind="formItemLayout">
          <span>{{ mountedIsoName }}</span>
        </a-form-item>
        <a-form-item :label="imageLabel" v-bind="formItemLayout">
          <base-select
            class="w-100"
            remote
            filterable
            version="v1"
            v-decorator="decorators.image_id"
            resource="images"
            :params="imageParams"
            :select-props="{ allowClear: hasMounted, placeholder: $t('compute.text_1219') }"
            @change="onImageChange" />
        </a-form-item>
      </a-form>
    </div>
    <div slot="footer">
      <template v-if="hasMounted">
        <a-button @click="handleUnmount" :loading="loading">{{ $t('compute.iso.unmount') }}</a-button>
        <a-button
          type="primary"
          class="ml-2"
          :disabled="!selectedImageId"
          :loading="loading"
          @click="handleRemount">{{ $t('compute.iso.unmount_and_mount') }}</a-button>
        <a-button class="ml-2" @click="cancelDialog">{{ $t('dialog.cancel') }}</a-button>
      </template>
      <template v-else>
        <a-button type="primary" @click="handleMount" :loading="loading">{{ $t('dialog.ok') }}</a-button>
        <a-button @click="cancelDialog">{{ $t('dialog.cancel') }}</a-button>
      </template>
    </div>
  </base-dialog>
</template>

<script>
import { mapGetters } from 'vuex'
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'VmMountIsoDialog',
  mixins: [DialogMixin, WindowsMixin],
  data () {
    const hasMounted = !!(this.params.data[0] && this.params.data[0].cdrom)
    return {
      loading: false,
      selectedImageId: undefined,
      form: {
        fc: this.$form.createForm(this),
      },
      decorators: {
        image_id: [
          'image_id',
          {
            rules: hasMounted
              ? []
              : [{ required: true, message: this.$t('compute.text_1219') }],
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
    }
  },
  computed: {
    ...mapGetters(['scope']),
    server () {
      return this.params.data[0] || {}
    },
    hasMounted () {
      return !!this.server.cdrom
    },
    mountedIsoName () {
      return this.getCdromName(this.server) || '-'
    },
    mountedIsoId () {
      return this.getCdromId(this.server)
    },
    imageLabel () {
      return this.hasMounted ? this.$t('compute.iso.mount_new') : this.$t('compute.text_1218')
    },
    imageParams () {
      const params = {
        disk_formats: 'iso',
        scope: this.scope,
      }
      if (this.mountedIsoId) {
        params.filter = `id.notin(${this.mountedIsoId})`
      }
      return params
    },
  },
  methods: {
    getCdromDetail (row) {
      if (!row?.cdrom) return ''
      if (Array.isArray(row.cdrom) && row.cdrom.length > 0) {
        return row.cdrom[0].detail || ''
      }
      return `${row.cdrom}`
    },
    getCdromName (row) {
      const cdrom = this.getCdromDetail(row)
      if (!cdrom) return ''
      const idx = cdrom.indexOf('(')
      return idx > 0 ? cdrom.substring(0, idx) : cdrom
    },
    getCdromId (row) {
      const cdrom = this.getCdromDetail(row)
      if (!cdrom) return ''
      const idx = cdrom.indexOf('(')
      if (idx < 0) return ''
      const end = cdrom.indexOf('/', idx + 1)
      if (end < 0) return ''
      return cdrom.substring(idx + 1, end)
    },
    onImageChange (val) {
      this.selectedImageId = val
    },
    async doSetIso (imageId) {
      const ids = this.params.data.map(item => item.id)
      const data = {}
      if (imageId) {
        data.image_id = imageId
      }
      await this.params.onManager('batchPerformAction', {
        id: ids,
        managerArgs: {
          action: 'set-iso',
          data,
        },
      })
      this.params.refresh && this.params.refresh()
      this.cancelDialog()
    },
    async handleMount () {
      this.loading = true
      try {
        const values = await this.form.fc.validateFields()
        await this.doSetIso(values.image_id)
      } finally {
        this.loading = false
      }
    },
    async handleUnmount () {
      this.loading = true
      try {
        await this.doSetIso()
      } finally {
        this.loading = false
      }
    },
    async handleRemount () {
      if (!this.selectedImageId) {
        this.$message.warning(this.$t('compute.text_1219'))
        return
      }
      this.loading = true
      try {
        await this.doSetIso(this.selectedImageId)
      } finally {
        this.loading = false
      }
    },
  },
}
</script>
