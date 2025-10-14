<template>
  <div>
    <a-card class="position-relative card-wrap" hoverable style="width: 240px">
        <actions slot="extra" v-if="showSingleActions(listItem)" :options="getOptions(listItem, 'singleActions')" :row="listItem.data" button-type="link" button-size="small" />
        <div class="p-2 d-flex justify-content-center align-items-center" style="height: 180px;">
          <img
            :ref="`img${listKey}`"
            style="width: 120px;"
            alt=""
            :src="getData(listItem.data, 'url')"
            @error="imgError(listItem, `img${listKey}`)"
            slot="cover" />
          <div class="link_copy" @click="copyLink(listItem.data)">{{ $t('common.copy_link') }}</div>
        </div>
        <div class="text-wrap position-relative">
          <a-card-meta>
            <div class="card-title" :title="getData(listItem.data, 'title')" slot="title">{{ getData(listItem.data, 'title') }}</div>
            <template slot="description" v-if="cardFields['content']">
              <div class="mutiline-text-truncate mb-2" style="font-size: 12px" v-for="value in getData(listItem.data, 'content')" :key="value.field">
                <span>{{value.title}}</span>：<slot-dom :dom="getDom(value, listItem.data)" />
              </div>
            </template>
            <template slot="description" v-else>
              <div class="mutiline-text-truncate mb-2" :title="getData(listItem.data, 'description')">
                {{ getData(listItem.data, 'description') }}
              </div>
              <div class="mutiline-text-truncate mb-2" :title="getData(listItem.data, 'desc')" v-if="cardFields['desc']" style="font-size: 12px">
                {{ getData(listItem.data, 'desc') }}
              </div>
            </template>
          </a-card-meta>
          <div class="primary-btn-wrap position-absolute mb-2">
            <actions slot="extra" :options="getOptions(listItem, 'primaryActions')" :row="listItem.data" :button-block="true" />
          </div>
        </div>
      </a-card>
  </div>
</template>

<script>
import Actions from '@/components/PageList/Actions'
import CardMixin from './card'

export default {
  name: 'VerticalCard',
  components: {
    Actions,
    SlotDom: {
      props: ['dom'],
      render () {
        return this.dom
      },
    },
  },
  mixins: [CardMixin],
  props: {
    singleActions: {
      type: Array,
    },
    cardFields: {
      type: Object,
      required: true,
      validator: val => val.url && val.title,
    },
    listItem: {
      type: Object,
      required: true,
    },
    listKey: {
      type: String,
      required: true,
    },
  },
  data () {
    return {
      imageDefault: require('../../assets/images/invalidImg.svg'),
      // item: this.listItem,
    }
  },
  methods: {
    copyLink (data) {
      this.$copyText(data.url)
      this.$message.success(this.$t('common.copy'))
    },
  },
}
</script>
<style lang="less" scoped>
@import '../../../src/styles/less/theme';

.card-wrap {
  .text-wrap {
    height: 200px;
    padding: 24px;
    background-color: #efefefa1;
    color: @border-color-base;
    .primary-btn-wrap {
      bottom: 8px;
      left: 24px;
      right: 24px;
    }
  }
  .card-title {
    overflow: hidden;
    text-overflow: ellipsis;
  }
  ::v-deep {
    .ant-card-body {
      padding: 0;
    }
    .ant-card-head {
      position: absolute;
      padding: 0;
      right: 0;
      border-bottom: 0;
    }
    .ant-card-meta-title {
      text-align: center;
      color: @primary-color;
    }
    .ant-card-meta-description {
      text-align: center;
    }
  }
}
.link_copy {
  position: absolute;
  top: 0px;
  right: 0px;
  cursor: pointer;
  color: @primary-color;
  font-size: 12px;
  padding: 5px 10px;
  display: none;
}
.card-wrap:hover .link_copy {
  display: block;
}
</style>
