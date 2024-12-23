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
        <div class="d-flex mb-3 mt-2">
          <div class="license-label flex-grow-0 flex-shrink-0">{{$t('scope.text_146')}}</div>
          <div class="flex-fill">{{ productName }}</div>
        </div>
        <div class="d-flex mb-3">
          <div class="license-label flex-grow-0 flex-shrink-0">{{$t('scope.text_147')}}</div>
          <div class="flex-fill">{{ version || '-' }}</div>
        </div>
        <div class="d-flex mb-3">
          <div class="license-label flex-grow-0 flex-shrink-0">{{$t('scope.text_156')}}</div>
          <div class="flex-fill">{{ copyright }}</div>
        </div>
        <div class="d-flex mb-3">
          <div class="license-label flex-grow-0 flex-shrink-0">{{$t('scope.text_154')}}</div>
          <div class="flex-fill">
            <img style="max-width:250px;min-width: 100px" src="@/assets/contact.png" />
          </div>
        </div>
      </div>
    </a-card>
  </div>
</template>

<script>
import setting from '@/config/setting'

export default {
  name: 'Licenses',
  props: {
  },
  data () {
    return {
      email: 'info@yunion.cn',
      copyright: '北京云联壹云技术有限公司',
    }
  },
  computed: {
    version () {
      if (setting.oemVersion) {
        return `v${setting.oemVersion.replace(/^[v]/, '')}`
      }
      return '-'
    },
    productName () {
      if (process.env.PRODUCT) {
        return setting.product[setting.language] || 'Cloudpods'
      }
      return 'Cloudpods'
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
</style>
