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
              <!-- <li v-if="license">{{$t('common_127')}}<help-link :href="license">{{$t('common_128')}}</help-link></li> -->
              <li v-if="email">{{$t('common_129')}}<a :href="`mailto:${email}`">{{ email }}</a>{{$t('common_130')}}</li>
            </ul>
          </div>
        </a-form-item>
        <a-form-item
          v-if="showEditionProductRow"
          :label="$t('scope.text_146')"
          class="license-edition-form-item">
          <div class="license-edition-block">
            <div class="license-edition-line license-edition-line--main">
              <span class="license-edition-product">{{ productName }}</span>
              <a-tag
                v-if="showEditionTag"
                class="license-edition-tag"
                :color="editionTagColor">{{ editionLabel(currentEdition) }}</a-tag>
              <button
                v-if="showEditionDowngradeBtn"
                type="button"
                class="license-downgrade-btn-pill"
                @click="handleDowngradeClick">
                <svg
                  v-if="!editionSwitchInProgress"
                  class="license-downgrade-btn__icon"
                  viewBox="0 0 1024 1024"
                  aria-hidden="true">
                  <path d="M910.848 449.024l-324.096-395.264c-33.792-32.768-88.576-32.768-122.368 0L103.936 440.832c-28.672 32.768-35.84 74.24-21.504 107.008 14.336 32.768 43.008 57.856 79.36 57.856h108.032c21.504 0 35.84 16.384 35.84 32.768v40.96c0 16.384 14.336 32.768 28.672 32.768s28.672-16.384 28.672-32.768v-58.88c0-35.84-16.896-60.416-59.904-60.416H170.496c-32.768 1.024-43.008-25.6-43.008-25.6s-13.824-35.84 4.096-54.272l366.592-400.384c8.192-10.24 17.92-15.872 28.672-15.872 9.216 0 18.944 4.608 26.112 13.312l331.776 409.6c7.68 17.408 7.68 40.96 4.096 48.128 0 0-12.288 26.112-43.52 28.672h-126.464c-44.544 0-48.64 23.552-48.64 63.488v102.4c0 33.792-19.456 59.392-54.784 59.392l-303.104-2.048c-8.704 0-17.408 14.848-17.408 24.576s8.704 24.576 17.408 24.576l309.76 1.024c50.176 0 93.696-33.792 93.696-91.648v-107.008c0.512-23.04 21.504-32.768 35.84-32.768h100.864c35.84 0 64.512-24.576 79.36-57.856 14.848-32.768 7.168-73.728-20.992-98.816z m-202.24 502.784H306.176c-12.8 0-21.504 9.728-21.504 24.576s8.704 24.576 21.504 24.576h402.432c12.8 0 21.504-9.728 21.504-24.576s-8.704-24.576-21.504-24.576z" fill="currentColor" />
                </svg>
                {{ editionSwitchInProgress ? $t('scope.edition_switch.view_log') : downgradeButtonLabel }}
              </button>
            </div>
            <div v-if="editionSwitchInProgress" class="license-edition-line license-edition-line--status">
              <span class="license-edition-switching text-color-help">
                <a-icon type="loading" class="mr-1" />
                {{ editionSwitchProgressLabel }}
              </span>
            </div>
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
import http from '@/utils/http'
import { getProductName, hasPermission, hasServices } from '@/utils/auth'
import editionSwitchStatusMixin from '@scope/views/licenses/editionSwitchStatusMixin'

export default {
  name: 'UpdateLicenseDialog',
  mixins: [DialogMixin, WindowsMixin, editionSwitchStatusMixin],
  data () {
    return {
      loading: false,
      fileList: [],
      updateInfo: {},
      currentEdition: '',
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
      'isAdminMode',
    ]),
    canEditionSwitch () {
      return this.isAdminMode && hasServices('devtool') && hasPermission({ key: 'editionswitches_perform_switch' })
    },
    showEditionDowngradeBtn () {
      if (!this.canEditionSwitch) return false
      if (this.editionSwitchInProgress) return true
      return this.currentEdition === 'ce' || this.currentEdition === 'ce/support'
    },
    downgradeButtonLabel () {
      return this.$t('scope.edition_switch.dialog_title_downgrade')
    },
    productName () {
      return getProductName((this.companyInfo && this.companyInfo.name) || this.$t('scope.text_135'))
    },
    showEditionProductRow () {
      return this.showEditionTag || this.editionSwitchInProgress || this.showEditionDowngradeBtn
    },
    showEditionTag () {
      return this.currentEdition === 'ce' || this.currentEdition === 'ce/support'
    },
    editionTagColor () {
      if (this.currentEdition === 'ce') return 'green'
      if (this.currentEdition === 'ce/support') return 'blue'
      return ''
    },
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
      return 'https://cloud.yunion.cn/license'
    },
  },
  created () {
    this.getUpdateInfo()
    this.fetchCurrentEdition()
  },
  methods: {
    async fetchCurrentEdition () {
      try {
        const ret = await http.get('/v1/infos/info')
        this.currentEdition = (ret.data && ret.data.edition) || ''
      } catch (error) {
        const status = error && error.response && error.response.status
        this.currentEdition = status === 404 ? 'ce' : ''
      }
    },
    editionLabel (edition) {
      if (edition === 'ce') return this.$t('scope.edition_switch.ce')
      if (edition === 'ce/support') return this.$t('scope.licenses.edition_ce_support_tag')
      return edition || this.$t('scope.edition_switch.unknown')
    },
    handleDowngradeClick () {
      if (!this.canEditionSwitch) return
      if (!this.editionSwitchInProgress &&
        this.currentEdition !== 'ce' &&
        this.currentEdition !== 'ce/support') {
        return
      }
      this.openSwitchEditionDialog()
    },
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
        this.$bus.$emit('LicenseSelectAllFeatures')
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
        await this.$store.dispatch('app/fetchLicense')
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
  .form {
    padding: 0 60px;
    .license-edition-form-item {
      margin-bottom: 16px;
      &.ant-form-item {
        display: flex;
        align-items: flex-start;
      }
      &.ant-form-item .ant-form-item-label {
        line-height: 32px;
      }
      &.ant-form-item .ant-form-item-control {
        line-height: 1.5;
      }
    }
    .license-edition-block {
      width: 100%;
    }
    .license-edition-line--main {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 8px;
      width: 100%;
      min-height: 32px;
    }
    .license-edition-line--status {
      margin-top: 4px;
      min-height: 22px;
    }
    .license-edition-product {
      color: rgba(0, 0, 0, 0.85);
      font-size: 14px;
      line-height: 22px;
    }
    .license-edition-tag {
      margin: 0;
      border-radius: 4px;
    }
    .license-edition-switching {
      display: inline-flex;
      align-items: center;
      font-size: 13px;
      line-height: 22px;
    }
    .license-downgrade-btn-pill {
      display: inline-flex;
      align-items: center;
      height: 24px;
      margin: 0 0 0 auto;
      padding: 0 7px;
      color: rgba(0, 0, 0, 0.65);
      font-size: 14px;
      line-height: 22px;
      background: #fff;
      border: 1px solid #d9d9d9;
      border-radius: 4px;
      cursor: pointer;
      user-select: none;
      transition: color 0.2s ease, border-color 0.2s ease;
      &:hover {
        color: #1890ff;
        border-color: #1890ff;
      }
      &:active {
        color: #096dd9;
        border-color: #096dd9;
      }
    }
    .license-downgrade-btn__icon {
      width: 14px;
      height: 14px;
      margin-right: 4px;
      color: inherit;
      flex-shrink: 0;
      transform: rotate(180deg);
    }
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
    .logo {
      height: 62px;
    }
  }
  .all-sn {
    line-height: 20px;
  }
}
</style>
