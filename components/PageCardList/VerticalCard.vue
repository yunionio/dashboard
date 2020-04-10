<template>
  <div>
    <a-card class="position-relative card-wrap" hoverable style="width: 240px">
        <actions slot="extra" v-if="showSingleActions(item)" :options="getOptions(item, 'singleActions')" :row="item.data" button-type="link" button-size="small" />
        <div class="p-2" style="height: 180px;">
          <img
            :ref="`img${listKey}`"
            class="w-100 h-100"
            :alt="getData(item.data, 'description')"
            :src="getData(item.data, 'url')"
            @error="imgError(item, `img${listKey}`)"
            slot="cover" />
        </div>
        <div class="text-wrap position-relative">
          <a-card-meta :title="getData(item.data, 'title')">
            <template slot="description" v-if="cardFields['content']">
              <div class="mutiline-text-truncate mb-2" style="font-size: 12px" v-for="value in getData(item.data, 'content')" :key="value.field">
                <span>{{value.title}}</span>：<slot-dom :dom="getDom(value, item.data)" />
              </div>
            </template>
            <template slot="description" v-else>
              <div class="mutiline-text-truncate mb-2" :title="getData(item.data, 'description')">
                {{ getData(item.data, 'description') }}
              </div>
              <div class="mutiline-text-truncate mb-2" :title="getData(item.data, 'desc')" v-if="cardFields['desc']" style="font-size: 12px">
                {{ getData(item.data, 'desc') }}
              </div>
            </template>
          </a-card-meta>
          <div class="primary-btn-wrap position-absolute mb-2">
            <actions slot="extra" :options="getOptions(item, 'primaryActions')" :row="item.data" :button-block="true" />
          </div>
        </div>
      </a-card>
  </div>
</template>

<script>
import CardMixin from './card'
import Actions from '@/components/PageList/Actions'

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
      item: this.listItem,
    }
  },
}
</script>
<style lang="scss" scoped>
@import '../../../src/styles/variables';

.card-wrap {
  .text-wrap {
    height: 200px;
    padding: 24px;
    background-color: #efefefa1;
    color: $text-color-help;
    .primary-btn-wrap {
      bottom: 8px;
      left: 24px;
      right: 24px;
    }
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
      color: $primary-color;
    }
    .ant-card-meta-description {
      text-align: center;
    }
  }
}

</style>
