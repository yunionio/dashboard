<template>
  <div class="browse-wrapper">
    <page-header title="查看" />
    <h4 class="header mt-4">工单基本信息</h4>
    <vxe-grid
      class="mt-2"
      :data="dataSource"
      :columns="columns" />
    <div class="reply-wrapper mt-4">
      <template v-if="isEdit">
        <h4 class="header mt-4">工单记录</h4>
        <div class="mb-1">回复</div>
        <a-textarea
          v-model="reply"
          placeholder="请输入回复信息"
          :auto-size="{ minRows: 3, maxRows: 5 }" />
        <div class="d-flex flex-row-reverse mt-4">
          <a-button type="primary" @click="handleConfirm" :loading="loading">提交</a-button>
          <a-button class="mr-2" @click="cancel">{{$t('compute.text_908')}}</a-button>
        </div>
      </template>
      <a-list
        header="回复记录"
        class="comment-list"
        item-layout="horizontal"
        :data-source="replyData">
        <a-list-item slot="renderItem" slot-scope="item">
          <a-comment :author="item.name">
            <a-avatar slot="avatar" style="color: #f56a00; backgroundColor: #fde3cf">{{ getAvatar(item.name) }}</a-avatar>
            <p slot="content">
              {{ item.comment }}
            </p>
            <div slot="datetime" :title="item.start_time | dateFormat">
              <span>{{ item.start_time | dateFormat }}</span>
            </div>
          </a-comment>
        </a-list-item>
      </a-list>
    </div>
    <page-footer>
      <div slot="right">
        <a-button type="primary" @click="cancel">返回列表</a-button>
      </div>
    </page-footer>
  </div>
</template>

<script>
import moment from 'moment'
import { mapGetters } from 'vuex'
import { escapeHTML } from '@/utils/utils'

export default {
  name: 'WorkflowSupportMeProcessBrowse',
  filters: {
    dateFormat (time) {
      return moment(time).format('YYYY-MM-DD HH:mm:ss')
    },
  },
  props: {
    idKey: {
      type: String,
      default: 'id',
    },
    dataSource: {
      type: Array,
      default () {
        return []
      },
    },
    columns: {
      type: Array,
      required: true,
    },
    isEdit: {
      type: Boolean,
      default: true,
    },
  },
  data () {
    return {
      reply: '',
      loading: false,
      replyData: this.dataSource[0]?.variables?.chat_list || [],
    }
  },
  computed: {
    ...mapGetters(['userInfo']),
    curData () {
      return this.dataSource[0]
    },
    id () {
      return this.curData[this.idKey]
    },
  },
  watch: {
    dataSource (val) {
      this.replyData = val[0]?.variables?.chat_list || []
    },
  },
  methods: {
    handleConfirm () {
      const params = {
        comment: escapeHTML(this.reply),
        is_initial: true,
        satisfied: false,
        approved: true,
        user_id: this.userInfo.id,
      }
      new this.$Manager('process-instances', 'v1').update({
        id: `${this.id}/process_comment`,
        data: params,
      }).then((res) => {
        this.reply = ''
        this.replyData = res.data.chat_list || []
      })
    },
    getAvatar (val) {
      return val.toUpperCase().substr(0, 1) || 'M'
    },
    cancel () {
      this.$router.go(-1)
    },
  },
}
</script>

<style lang="less" scoped>
.browse-wrapper{
  .header{
    font-size: 16px;
    font-weight: normal;
    height: 40px;
    line-height: 40px;
    position: relative;
    &::before{
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 1px;
      content: "";
      box-shadow: inset 0 -1px 0 0 #d9d9d9;
      opacity: 0.3;
    }
  }
  .reply-wrapper{
    margin-bottom: 80px;
  }
  /deep/ .page-footer{
    left: 0 !important;
  }
}
</style>
