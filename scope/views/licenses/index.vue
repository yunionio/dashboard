<template>
  <div class="d-flex flex-direction-column align-items-center mt-2">
    <a-card
      :bordered="false"
      class="license-card"
      :bodyStyle="cardNoPadding"
      :headStyle="cardNoPadding"
      size="small">
      <div slot="title">
        <span style="font-size:24px">{{$t('scope.text_145')}}</span>
      </div>
      <div>
        <div class="d-flex mb-3 mt-2 align-items-center">
          <div class="license-label flex-grow-0 flex-shrink-0">{{$t('scope.text_146')}}</div>
          <div class="flex-fill license-product-line">
            <span>{{ productName }}{{ version ? ` (${version})` : '' }}</span>
            <a-tag
              v-if="showSwitchVersion && showEditionTag"
              class="license-edition-tag"
              :color="editionTagColor">{{ editionLabel(currentEdition) }}</a-tag>
            <span v-if="showSwitchVersion && editionSwitchInProgress" class="license-edition-switching text-color-help">
              <a-icon type="loading" class="mr-1" />
              {{ editionSwitchProgressLabel }}
            </span>
          </div>
        </div>
        <div class="d-flex mb-3">
          <div class="license-label flex-grow-0 flex-shrink-0">{{$t('scope.text_156')}}</div>
          <div class="flex-fill">{{ copyright }}</div>
        </div>
        <div class="d-flex mb-3 license-support-row">
          <div class="license-label flex-grow-0 flex-shrink-0">{{ $t('scope.text_154') }}</div>
          <div class="flex-fill license-support-grid">
            <div class="license-support-item">
              <div class="license-support-item__visual">
                <img class="license-support-item__qr" src="@/assets/contact.png" alt="" />
              </div>
              <p class="license-support-item__desc">{{ $t('scope.licenses.support_open_source_desc') }}</p>
            </div>
            <div v-if="showSwitchVersion" class="license-support-item">
              <div class="license-support-item__visual">
                <img class="license-support-item__qr" :src="miniprogramQr" alt="" />
              </div>
              <p class="license-support-item__desc">{{ $t('scope.licenses.support_pay_per_use_desc') }}</p>
            </div>
            <div
              v-if="showSwitchVersion"
              class="license-support-item"
              :class="{ 'license-support-item--upgrade': canSwitch }"
              role="button"
              :tabindex="canSwitch ? 0 : -1"
              @click="handleUpgradeCardClick"
              @keydown.enter.prevent="handleUpgradeCardClick"
              @keydown.space.prevent="handleUpgradeCardClick">
              <div class="license-support-item__visual license-support-item__visual--enterprise">
                <img class="license-support-item__upgrade-icon" :src="upgradeIcon" alt="" />
                <span v-if="canSwitch" class="license-upgrade-btn-pill">
                  <svg
                    v-if="!editionSwitchInProgress"
                    class="license-upgrade-btn__icon"
                    viewBox="0 0 1024 1024"
                    aria-hidden="true">
                    <path d="M910.848 449.024l-324.096-395.264c-33.792-32.768-88.576-32.768-122.368 0L103.936 440.832c-28.672 32.768-35.84 74.24-21.504 107.008 14.336 32.768 43.008 57.856 79.36 57.856h108.032c21.504 0 35.84 16.384 35.84 32.768v40.96c0 16.384 14.336 32.768 28.672 32.768s28.672-16.384 28.672-32.768v-58.88c0-35.84-16.896-60.416-59.904-60.416H170.496c-32.768 1.024-43.008-25.6-43.008-25.6s-13.824-35.84 4.096-54.272l366.592-400.384c8.192-10.24 17.92-15.872 28.672-15.872 9.216 0 18.944 4.608 26.112 13.312l331.776 409.6c7.68 17.408 7.68 40.96 4.096 48.128 0 0-12.288 26.112-43.52 28.672h-126.464c-44.544 0-48.64 23.552-48.64 63.488v102.4c0 33.792-19.456 59.392-54.784 59.392l-303.104-2.048c-8.704 0-17.408 14.848-17.408 24.576s8.704 24.576 17.408 24.576l309.76 1.024c50.176 0 93.696-33.792 93.696-91.648v-107.008c0.512-23.04 21.504-32.768 35.84-32.768h100.864c35.84 0 64.512-24.576 79.36-57.856 14.848-32.768 7.168-73.728-20.992-98.816z m-202.24 502.784H306.176c-12.8 0-21.504 9.728-21.504 24.576s8.704 24.576 21.504 24.576h402.432c12.8 0 21.504-9.728 21.504-24.576s-8.704-24.576-21.504-24.576z" fill="currentColor" />
                  </svg>
                  {{ editionSwitchInProgress ? $t('scope.edition_switch.view_log') : upgradeButtonLabel }}
                </span>
              </div>
              <p class="license-support-item__desc">{{ $t('scope.licenses.support_enterprise_desc') }}</p>
            </div>
          </div>
        </div>
      </div>
    </a-card>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import setting from '@/config/setting'
import http from '@/utils/http'
import WindowsMixin from '@/mixins/windows'
import { hasPermission, hasServices } from '@/utils/auth'
import { SHOW_SWITCH_VERSION } from '@/config/switchVersion'
import editionSwitchStatusMixin from './editionSwitchStatusMixin'

export default {
  name: 'Licenses',
  mixins: [WindowsMixin, editionSwitchStatusMixin],
  data () {
    return {
      email: 'info@yunion.cn',
      copyright: '北京云联壹云技术有限公司',
      miniprogramQr: require('./assets/enterprise-support-purchase-qrcode.png'),
      upgradeIcon: require('./assets/upgrade-enterprise.svg'),
      currentEdition: '',
    }
  },
  computed: {
    ...mapGetters(['isAdminMode']),
    showSwitchVersion () {
      return SHOW_SWITCH_VERSION
    },
    canSwitch () {
      if (!SHOW_SWITCH_VERSION) return false
      return this.isAdminMode && hasServices('devtool') && hasPermission({ key: 'editionswitches_perform_switch' })
    },
    version () {
      if (setting.oemVersion) {
        return `v${setting.oemVersion.replace(/^[v]/, '')}`
      }
      return ''
    },
    productName () {
      if (process.env.PRODUCT) {
        return setting.product[setting.language] || 'Cloudpods'
      }
      return 'Cloudpods'
    },
    showEditionTag () {
      return this.currentEdition === 'ce' || this.currentEdition === 'ce/support'
    },
    editionTagColor () {
      if (this.currentEdition === 'ce') return 'green'
      if (this.currentEdition === 'ce/support') return 'blue'
      return ''
    },
    upgradeButtonLabel () {
      const locale = (this.$i18n && this.$i18n.locale) || ''
      if (locale.toLowerCase().startsWith('zh')) {
        return this.$t('scope.licenses.upgrade_enterprise')
      }
      return this.$t('scope.edition_switch.confirm_upgrade')
    },
  },
  mounted () {
    if (SHOW_SWITCH_VERSION) {
      this.fetchCurrentEdition()
    }
  },
  methods: {
    editionLabel (edition) {
      if (edition === 'ce') return this.$t('scope.edition_switch.ce')
      if (edition === 'ce/support') return this.$t('scope.edition_switch.ce_support')
      return edition || this.$t('scope.edition_switch.unknown')
    },
    async fetchCurrentEdition () {
      if (!SHOW_SWITCH_VERSION) return
      try {
        const ret = await http.get('/v1/infos/info')
        this.currentEdition = (ret.data && ret.data.edition) || ''
      } catch (error) {
        const status = error && error.response && error.response.status
        this.currentEdition = status === 404 ? 'ce' : ''
      }
    },
    handleUpgradeCardClick () {
      if (!this.canSwitch) return
      this.openSwitchEditionDialog()
    },
  },
}
</script>

<style lang="less" scoped>
.license-card{
  width: 60%;
  min-width: 900px;
  max-width: 100%;
}
.flex-direction-column{
  flex-direction: column;
  min-width: 950px;
}
.license-label {
  width: 130px;
}
.license-product-line {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
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
.license-support-item__visual--enterprise {
  flex-direction: column;
}
.license-support-item--upgrade {
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
  .license-support-item__visual {
    background: transparent;
  }
  .license-support-item__visual--enterprise {
    justify-content: flex-end;
    gap: 6px;
    padding-bottom: 2px;
  }
  .license-support-item__upgrade-icon {
    margin-bottom: auto;
  }
  .license-support-item__desc {
    margin-top: 6px;
  }
  &:hover {
    border-color: #d9d9d9;
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1);
    transform: scale(1.01);
  }
  &:active {
    transform: scale(1);
    box-shadow: 0 3px 12px rgba(0, 0, 0, 0.08);
  }
}
.license-upgrade-btn-pill {
  display: inline-flex;
  align-items: center;
  height: 24px;
  padding: 0 7px;
  color: #fff;
  font-size: 14px;
  line-height: 22px;
  background: #1890ff;
  border: 1px solid #1890ff;
  border-radius: 4px;
  pointer-events: none;
  user-select: none;
}
.license-upgrade-btn__icon {
  width: 14px;
  height: 14px;
  margin-right: 4px;
  color: inherit;
  flex-shrink: 0;
}
.license-support-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
  align-items: stretch;
}
.license-support-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100%;
  padding: 16px 16px 14px;
  text-align: center;
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  background: #fff;
}
.license-support-item__visual {
  display: flex;
  flex: 1 0 148px;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 148px;
  background: #fff;
}
.license-support-item__qr {
  max-width: 148px;
  max-height: 148px;
  width: auto;
  height: auto;
  object-fit: contain;
}
.license-support-item__upgrade-icon {
  width: 100px;
  height: 100px;
}
.license-support-item__desc {
  flex: 0 0 auto;
  width: 100%;
  min-height: 44px;
  margin: 12px 0 0;
  padding: 0 4px;
  color: rgba(0, 0, 0, 0.65);
  font-size: 13px;
  line-height: 1.6;
}
</style>
