<template>
  <base-dialog width="580px" class="license-dialog">
    <div slot="body">
      <div class="titles">
         <img class="logo" :src="logo" alt="" />
         <h2>{{$t('common_120', [companyInfo.name])}}</h2>
         <p v-if="updateInfo.current_version">{{$t('common_121', [updateInfo.current_version])}}</p>
      </div>
      <a-form class="form" label-align="right" :form="form.fc" v-bind="formItemLayout">
        <a-form-item v-if="allSn && allSn.length > 0" :label="$t('common_122')">
          <div>
            <div class="flex-fill d-flex all-sn align-items-end">
              <div class="border pb-2 px-3">
                <template v-for="item of allSn">
                  <div class="mt-2" :key="item">
                    <span>{{ item }}</span>
                  </div>
                </template>
              </div>
              <copy :message="copySn" class="flex-shrink-0 flex-grow-0 ml-2" />
            </div>
          </div>
        </a-form-item>
        <a-form-item :label="$t('common_123')">
          <a-upload-dragger
            name="license"
            :headers="headers"
            :beforeUpload="beforeUpload"
            :fileList="fileList"
            :remove="hanldeRemoveFile"
            action="/api/v1/licenses">
            <p class="ant-upload-drag-icon">
              <a-icon type="cloud-upload" />
            </p>
            <p class="ant-upload-text">{{$t('common_124')}}</p>
            <p class="ant-upload-hint">{{$t('common_125')}}</p>
          </a-upload-dragger>
          <div slot="extra"  v-if="license || email">
            <div class="mt-2 mb-1">{{$t('common_126')}}</div>
            <ul>
              <li v-if="license">{{$t('common_127')}}<help-link :href="license">{{$t('common_128')}}</help-link></li>
              <li v-if="email">{{$t('common_129')}}<a :href="`mailto:${email}`">{{ email }}</a>{{$t('common_130')}}</li>
            </ul>
          </div>
        </a-form-item>
        <a-form-item v-bind="formItemOffset">
          <a-button block type="primary" @click="handleConfirm" :loading="loading">{{ $t("dialog.ok") }}</a-button>
        </a-form-item>
      </a-form>
    </div>
    <!-- <div slot="footer">
      <a-button type="primary" @click="handleConfirm" :loading="loading">{{ $t("dialog.ok") }}</a-button>
    </div> -->
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
          span: 17,
        },
        labelCol: {
          span: 7,
        },
      },
      formItemOffset: {
        wrapperCol: {
          span: 17,
          offset: 7,
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
    ...mapState('app', {
      companyInfo: state => state.companyInfo,
    }),
    ...mapState({
      serviceNumbers: state => state.app.license.service_numbers,
      status: state => state.app.license.status,
      oemInfo: state => state.app.oem,
    }),
    allSn () {
      return this.serviceNumbers && R.type(this.serviceNumbers) === 'Array' ? this.serviceNumbers : []
    },
    copySn () {
      return this.allSn.join('\n')
    },
    email () {
      if (!R.isNil(this.oemInfo.email) && !R.isEmpty(this.oemInfo.email)) {
        return this.oemInfo.email
      }
      return null
    },
    license () {
      if (!R.isNil(this.oemInfo.license)) {
        return this.oemInfo.license
      }
      return 'https://cloud.yunion.cn/account/license'
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
        this.$message.info(this.$t('common_131'))
        return
      }
      if (file.size > 10240) {
        this.$message.info(this.$t('common_132'))
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
          this.$message.info(this.$t('common_133'))
          return false
        }
        const file = this.fileList[0]
        const fd = new FormData()
        fd.append('license', file)
        const manager = new this.$Manager('licenses', 'v1')
        await manager.create({
          data: fd,
        })
        this.goGuide()
        this.cancelDialog()
        this.$message.success(this.$t('common_134'))
      } catch (error) {
        throw error
      } finally {
        this.loading = false
      }
    },
  },
}
</script>

<style lang="less">
@import "~@/styles/less/theme";
.license-dialog {
  .ant-modal-header, .ant-modal-close, .ant-modal-footer{
    display: none;
  }
  .ant-modal-body{
    padding: 10px;
  }
  .ant-form-item-label{
    text-align: right;
    label {
      margin-right: 5px;
    }
  }
  .form{
     padding: 0 60px;
  }
  .titles {
    text-align: center;
    padding: 10px 0 30px 0;
    font-weight: 500;
    h2 {
      font-size: 20px;
      margin: 10px 0;
      color: @heading-color;
    }
    p {
      font-size: 13px;
      color: @text-color;
      font-weight: 400;
    }
    .logo{
      height: 62px;
    }
  }
  .all-sn {
    line-height: 20px;
  }
}
</style>
