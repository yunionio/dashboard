<template>
  <div>
    <page-header :title="$t('dictionary.mail_config')" />
    <page-body>
      <template v-for="item of cards">
        <!-- <a-card :title="item.label" :key="item.key" class="mb-4" size="small">
        </a-card> -->
        <a-collapse :bordered="true" :key="item.key" class="collapse-wrap">
          <a-collapse-panel :header="item.label" :key="item.key" class="mb-4">
            <template v-slot:extra v-if="item.loading">
              <a-icon type="loading" />
            </template>
            <component
              :is="item.key"
              :form-item-layout="formItemLayout"
              :offset-wrapper-col="offsetWrapperCol"
              :loading.sync="item.loading" />
          </a-collapse-panel>
        </a-collapse>
      </template>
    </page-body>
  </div>
</template>

<script>
import Email from './components/Email'
// import EmailCallback from './components/EmailCallback'
import Message from './components/Message'
import SMS from './components/SMS'
import DingTalk from './components/DingTalk'
import DingTalkRobot from './components/DingTalkRobot'
import FlyBook from './components/FlyBook'
import FlyBookRobot from './components/FlyBookRobot'
import Workwx from './components/Workwx'
import WorkwxRobot from './components/WorkwxRobot'
import Cmdb from './components/Cmdb'

export default {
  name: 'MailConfigIndex',
  components: {
    Email,
    // EmailCallback,
    Message,
    sms: SMS,
    DingTalk,
    DingTalkRobot,
    FlyBook,
    FlyBookRobot,
    Workwx,
    WorkwxRobot,
    Cmdb,
  },
  data () {
    return {
      loadingLayout: [[16, 8], [15], [16, 8], [12], [16, 8], [20], [16, 8], [14]],
      cards: [
        { label: this.$t('system.text_302'), key: 'email', loading: false },
        // { label: '邮件回调地址', key: 'email-callback', loading: false },
        { label: this.$t('system.text_136'), key: 'ding-talk', loading: false },
        { label: this.$t('system.text_303'), key: 'ding-talk-robot', loading: false },
        { label: this.$t('system.text_133'), key: 'fly-book', loading: false },
        { label: this.$t('system.text_304'), key: 'fly-book-robot', loading: false },
        { label: this.$t('system.wecom.1'), key: 'workwx', loading: false },
        { label: this.$t('system.wecom.bot'), key: 'workwx-robot', loading: false },
        { label: this.$t('system.text_578'), key: 'cmdb', loading: false },
        { label: this.$t('system.text_305'), key: 'message', loading: false },
        { label: this.$t('system.text_306'), key: 'sms', loading: false },
      ],
      formItemLayout: {
        wrapperCol: {
          span: 20,
          xxl: {
            span: 22,
          },
        },
        labelCol: {
          span: 4,
          xxl: {
            span: 2,
          },
        },
      },
      offsetWrapperCol: {
        span: 20,
        offset: 4,
        xxl: {
          span: 22,
          offset: 2,
        },
      },
    }
  },
}
</script>

<style lang="less" scoped>
.collapse-wrap {
  ::v-deep {
    .ant-collapse-header {
      color: #1A2739 !important;
    }
  }
}
</style>
