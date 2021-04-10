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
            preview=".cropper-preview"
            :ready="ready"
            @zoom="handleCropperZoom" />
          <div v-show="showControl">
            <div class="d-flex align-items-center w-100">
              <a-button type="link" icon="minus" class="flex-shrink-0 flex-grow-0 mt-1" @click="handleDecZoom" />
              <div class="flex-fill w-100">
                <a-slider v-model="zoom" v-bind="zoomSlider" @change="handleZoomChange" :tooltip-visible="false" />
              </div>
              <a-button type="link" icon="plus" class="flex-shrink-0 flex-grow-0 mt-1" @click="handleIncZoom" />
            </div>
          </div>
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
      showControl: false,
      minSliderZoom: 0,
      zoom: 0,
      zoomSlider: {
        min: 0,
        max: 1,
        step: 0.001,
      },
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
        this.showControl = true
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
    ready (e) {
      if (this.params.cropperProps && this.params.cropperProps.ready) {
        this.params.cropperProps.ready(e)
      }
      const cropper = e.target.cropper
      // const imageData = cropper.getImageData()
      // const minSliderZoom = imageData.width / imageData.naturalWidth
      // this.zoomSlider.min = Number(minSliderZoom.toFixed(3))
      this.zoom = this.zoomSlider.min
      cropper.zoomTo(this.zoomSlider.min)
    },
    handleZoomChange (val) {
      const cropper = this.$refs.cropper
      cropper.zoomTo(val)
    },
    handleDecZoom () {
      if (this.zoom > this.zoomSlider.min) {
        this.zoom -= 0.001
        this.$refs.cropper.zoomTo(this.zoom)
      }
    },
    handleIncZoom () {
      if (this.zoom < 1) {
        this.zoom += 0.001
        this.$refs.cropper.zoomTo(this.zoom)
      }
    },
    handleCropperZoom (e) {
      const { ratio } = e.detail
      this.zoom = ratio
      if (ratio > 1 || ratio < this.zoomSlider.min) {
        event.preventDefault()
      }
    },
  },
}
</script>
