<template>
  <div>
    <a-card class="position-relative card-wrap" hoverable style="width: 340px">
      <actions slot="extra" v-if="showSingleActions(item)" :options="getOptions(item, 'singleActions')" :row="item.data" button-type="link" button-size="small" />
      <a-row>
        <a-col :span="8">
          <div class="ml-2" style="height: 100px;width: 100px;margin-top: 24px;">
            <img
              :ref="`img${listKey}`"
              class="w-100 h-100 border"
              :alt="getData(item.data, 'description')"
              :src="getData(item.data, 'url')"
              @error="imgError(item, `img${listKey}`)"
              slot="cover" />
            <div class="link_copy" @click="copyLink(listItem.data)">{{ $t('common.copy_link') }}</div>
          </div>
        </a-col>
        <a-col :span="16">
          <div class="text-wrap position-relative">
            <a-card-meta>
              <div slot="title" class="card-title" :title="getData(item.data, 'title')">{{ getData(item.data, 'title') }}</div>
              <template slot="description" v-if="cardFields['content']">
                <div class="mutiline-text-truncate mb-2" style="font-size: 12px" v-for="value in getData(item.data, 'content')" :key="value.field">
                  <span>{{value.title}}</span>：<slot-dom :dom="getDom(value, item.data)" />
                </div>
              </template>
            </a-card-meta>
            <div class="primary-btn-wrap position-absolute mb-2">
              <actions slot="extra" :options="getOptions(item, 'primaryActions')" :row="item.data" :button-block="true" />
            </div>
          </div>
        </a-col>
      </a-row>
    </a-card>
  </div>
</template>

<script>
import Actions from '@/components/PageList/Actions'
import CardMixin from './card'

export default {
  name: 'HorizontalCard',
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
      item: this.listItem,
    }
  },
  watch: {
    listItem (newVal) {
      this.item = newVal
    },
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
    .ant-card-head {
      border-bottom: 0;
      z-index: 99;
    }
    .ant-card-body {
      padding: 0;
    }
    .ant-card-head {
      position: absolute;
      padding: 0;
      right: 0;
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
