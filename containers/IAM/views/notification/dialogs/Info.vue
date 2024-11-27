<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{$t('iam.message_content')}}</div>
    <div slot="body">
      <div class="title mb-3">{{ showTitle }}</div>
      <div class="list-item mb-2" v-for="(item, index) in showList" :key="index">
        <div class="label">{{ item.label }}:</div>
        <div class="value">{{ item.value }}</div>
      </div>
    </div>
    <div slot="footer">
      <!-- <a-button type="primary" :loading="loading" @click="cancelDialog">{{ $t('dialog.ok') }}</a-button> -->
      <a-button @click="cancelDialog">{{ $t('dialog.cancel') }}</a-button>
    </div>
  </base-dialog>
</template>

<script>
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'NotificationViewInfoDialog',
  mixins: [DialogMixin, WindowsMixin],
  data () {
    return {
      loading: false,
      formItemLayout: {
        wrapperCol: {
          span: 18,
        },
        labelCol: {
          span: 3,
        },
      },
      content: this.params.data[0].content,
    }
  },
  computed: {
    contentList () {
      return (this.params.data[0].content || '').replaceAll('：', ':').split('\n')
    },
    showTitle () {
      const list = this.contentList.filter(str => !str.includes(':'))
      return list.length ? list[0] : ''
    },
    showList () {
      const list = this.contentList.filter(str => str.includes(':'))
      return list.map(str => {
        const t = str.split(':')
        let value = ''
        t.forEach((str, index) => {
          if (index === t.length - 1) {
            value = value + str
          } else if (index !== 0) {
            value = value + str + ':'
          }
        })
        return { label: t[0], value }
      })
    },
  },
}
</script>

<style lang="less" scoped>
.title {
  font-size: 18px;
  font-weight: bold;
}
.list-item {
  display: flex;
  .label {
    flex: 0 0 100px;
  }
  .value {
    flex: 1 1 auto;
  }
}
</style>
