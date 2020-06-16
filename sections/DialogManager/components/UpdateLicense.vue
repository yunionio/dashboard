<template>
  <base-dialog width="700px" class="license-dialog">
    <div slot="body">
      <div class="titles">
         <img class="logo" :src="logo" alt="" />
         <h2>OneCloud 授权激活</h2>
         <p>软件版本：{{updateInfo.current_version}}</p>
      </div>
      <a-form :form="form.fc" v-bind="formItemLayout">
         <a-form-item v-if="allSn && allSn.length > 0" label="服务器识别码">
          <div>
            <div class="flex-fill d-flex all-sn align-items-end">
              <div class="border pb-2 px-3">
                <template v-for="item of allSn">
                  <div class="mt-2" :key="item">
                    <span>{{ item }}</span>
                  </div>
                </template>
              </div>
              <copy :message="copySn" class="flex-shrink-0 flex-grow-0 ml-2 mt-1" />
            </div>
          </div>
        </a-form-item>
        <a-form-item label="License文件上传">
          <a-upload-dragger
            name="license"
            :headers="headers"
            :beforeUpload="beforeUpload"
            :fileList="fileList"
            :remove="hanldeRemoveFile"
            action="/api/v1/licenses">
            <p class="ant-upload-drag-icon">
              <a-icon type="inbox" />
            </p>
            <p class="ant-upload-text">单击或将文件拖到该区域以上传</p>
            <p class="ant-upload-hint">license文件扩展名为.lic,大小不超过10KB</p>
          </a-upload-dragger>
          <div slot="extra">
             还没有License? 您可以<help-link href="https://cloud.yunion.cn/account/license"> 申请免费License</help-link>
          </div>
        </a-form-item>
      </a-form>
    </div>
    <div slot="footer">
      <a-button type="primary" @click="handleConfirm" :loading="loading">{{ $t("dialog.ok") }}</a-button>
    </div>
  </base-dialog>
</template>

<script>
import * as R from 'ramda'
import { mapState, mapGetters } from 'vuex'
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'UpdateLicenseDialog',
  mixins: [DialogMixin, WindowsMixin],
  data () {
    return {
      loading: false,
      fileList: [],
      updateInfo: {},
      // allSn: [],
      formItemLayout: {
        wrapperCol: {
          span: 19,
        },
        labelCol: {
          span: 5,
        },
      },
      form: {
        fc: this.$form.createForm(this),
      },
    }
  },
  computed: {
    headers () {
      return { Authorization: `Bearer ${this.$store.getters.userInfo.session}` }
    },
    ...mapGetters([
      'logo',
    ]),
    ...mapState({
      license: state => state.app.license.compute,
      serviceNumbers: state => state.app.license.service_numbers,
      status: state => state.app.license.status,
    }),
    allSn () {
      return this.serviceNumbers && R.type(this.serviceNumbers) === 'Array' ? this.serviceNumbers : []
    },
    copySn () {
      return this.allSn.join('\n')
    },
  },
  created () {
    this.getUpdateInfo()
  },
  methods: {
    hanldeRemoveFile (file) {
      this.fileList = []
      return true
    },
    beforeUpload (file) {
      if (!file.name.endsWith('.lic')) {
        this.$message.info('文件扩展名必须为.lic')
        return
      }
      if (file.size > 10240) {
        this.$message.info('文件大小超过10K限制')
        return
      }
      this.fileList = [file]
      return false
    },
    getUpdateInfo () {
      new this.$Manager('updates', 'v1').list({
        params: {
          status: true,
        },
      }).then(res => {
        if (res.data.data && res.data.data.length) {
          this.updateInfo = res.data.data[0]
        }
      })
    },
    goGuide () {
      const { path } = this.$route
      if (path === '/guide') {
        return
      }
      this.$router.push('/guide')
    },
    async handleConfirm () {
      this.loading = true
      try {
        if (!this.fileList || this.fileList.length === 0) {
          this.$message.info('License文件上传')
        }
        const file = this.fileList[0]
        const fd = new FormData()
        fd.append('license', file)
        const manager = new this.$Manager('licenses', 'v1')
        await manager.create({
          data: fd,
        })
        this.goGuide()
      } catch (error) {
        throw error
      } finally {
        this.loading = false
      }
    },
  },
}
</script>

<style lang="scss">
@import "~@/styles/_variables.scss";
  .license-dialog {
    .ant-modal-header, .ant-modal-close{
      display: none;
    }
    .titles {
      // text-align: center;
      padding: 10px 0 30px 0;
      font-weight: 500;
      position: relative;
      padding-left: 20.83333333%;
      h2 {
        font-size: 30px;
        color: $heading-color;
      }
      p {
        font-size: 13px;
        color: $text-color;
        font-weight: 400;
      }
      .logo{
        position: absolute;
        left: 0;
        top: 10px;
        // max-width: 100px;
        width: 110px;
      }
    }
    .all-sn {
      line-height: 20px;
    }
  }
</style>
