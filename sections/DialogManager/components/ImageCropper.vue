<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{ params.title || $t('common.text00085') }}</div>
    <div slot="body">
      <div class="d-flex">
        <div class="flex-fill">
          <a-upload-dragger
            v-show="!imageLoaded"
            name="file"
            @change="handleFileChange"
            :showUploadList="false"
            :accept="accept"
            :beforeUpload="handleBeforeUpload">
            <p class="ant-upload-drag-icon">
              <a-icon type="inbox" />
            </p>
            <p class="ant-upload-text">{{$t('common.text00099')}}</p>
          </a-upload-dragger>
          <vue-cropper
            v-show="imageLoaded"
            v-bind="params.cropperProps"
            ref="cropper"
            preview=".cropper-preview" />
        </div>
        <div class="flex-grow-0 flex-shrink-0 ml-4" v-show="imageLoaded">
          <div class="cropper-preview overflow-hidden" :style="this.params.previewStyle" />
          <div class="mt-3 text-center">{{$t('common.text00100')}}</div>
          <div class="text-center mt-3">
            <a-upload
              v-show="imageLoaded"
              name="file"
              @change="handleFileChange"
              :showUploadList="false"
              :accept="accept"
              :beforeUpload="handleBeforeUpload">
              <a-button type="link">{{$t('common.text00101')}}</a-button>
            </a-upload>
          </div>
        </div>
      </div>
    </div>
    <div slot="footer">
      <a-button type="primary" @click="handleConfirm">{{ $t('dialog.ok') }}</a-button>
      <a-button @click="cancelDialog">{{ $t('dialog.cancel') }}</a-button>
    </div>
  </base-dialog>
</template>

<script>
import VueCropper from 'vue-cropperjs'
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'
import 'cropperjs/dist/cropper.css'

export default {
  name: 'ImageCropperDialog',
  components: {
    VueCropper,
  },
  mixins: [DialogMixin, WindowsMixin],
  data () {
    return {
      imageLoaded: false,
    }
  },
  computed: {
    accept () {
      return this.params.accept || 'image/png'
    },
  },
  methods: {
    handleBeforeUpload (file) {
      return false
    },
    handleFileChange (e) {
      const file = e.file
      if (file.type.includes(this.accept) === -1) {
        this.$message.warning(`${this.$t('common.text00102')}${this.accept}${this.$t('common.text00103')}`)
        return
      }
      const reader = new FileReader()
      reader.onload = e => {
        this.imageLoaded = true
        this.$refs.cropper.replace(event.target.result)
      }
      reader.readAsDataURL(file)
    },
    handleConfirm () {
      if (!this.imageLoaded) return
      if (this.params.ok) {
        const data = {
          fullUrl: this.$refs.cropper.getCroppedCanvas().toDataURL(),
        }
        const arr = data.fullUrl.split(',')
        data.url = arr[1]
        data.format = arr[0].split(';')[0].split(':')[1]
        this.params.ok(data)
      }
      this.cancelDialog()
    },
  },
}
</script>
