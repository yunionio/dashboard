<template>
  <div class="card-list d-flex flex-wrap">
    <div class="card-wrap my-3" v-for="(item, key) in list" :key="key">
      <a-card class="position-relative" hoverable style="width: 240px">
        <actions slot="extra" v-if="showSingleActions(item)" :options="getOptions(item, 'singleActions')" :row="item.data" button-type="link" button-size="small" />
        <img
          :ref="`img${key}`"
          :alt="getData(item.data, 'description')"
          style="height: 150px;"
          :src="getData(item.data, 'url')"
          @error="imgError(item, `img${key}`)"
          slot="cover" />
        <div class="text-wrap position-relative">
          <a-card-meta :title="getData(item.data, 'title')">
            <template slot="description">
              <div class="mutiline-text-truncate">
                {{ getData(item.data, 'description') }}
              </div>
              <div class="mutiline-text-truncate mt-2" v-if="cardFields['desc']" style="font-size: 12px">
                {{ getData(item.data, 'desc') }}
              </div>
            </template>
          </a-card-meta>
          <div class="primary-btn-wrap position-absolute">
            <actions slot="extra" :options="getOptions(item, 'primaryActions')" :row="item.data" :button-block="true" />
          </div>
        </div>
      </a-card>
    </div>
  </div>
</template>

<script>
import * as R from 'ramda'
import Actions from '@/components/PageList/Actions'

export default {
  name: 'CardList',
  components: {
    Actions,
  },
  props: {
    list: {
      type: Object,
      required: true,
    },
    singleActions: {
      type: Array,
    },
    cardFields: {
      type: Object,
      required: true,
      validator: val => val.url && val.title,
    },
  },
  data () {
    return {
      imageDefault: require('../../assets/images/invalidImg.svg'),
    }
  },
  methods: {
    getOptions (item, type) {
      if (type === 'primaryActions') {
        return this.singleActions.filter(val => {
          return R.is(Function, val.meta) && val.meta(item).buttonType === 'primary'
        })
      } else if (type === 'singleActions') {
        return [
          {
            actions: () => {
              return this.singleActions.filter(val => {
                return !(R.is(Function, val.meta) && val.meta(item).buttonType === 'primary')
              })
            },
          },
        ]
      }
    },
    getData (data, item) {
      const field = this.cardFields[item]
      if (R.is(Function, field)) {
        return field(data)
      }
      return data[field] || ''
    },
    imgError (item, ref) {
      this.$refs[ref][0].src = this.imageDefault
    },
    showSingleActions (item) {
      const show = this.getOptions(item, 'singleActions')
      if (show[0].actions().length === 0) {
        return false
      }
      return true
    },
  },
}
</script>

<style lang="scss" scoped>
@import '../../../src/styles/variables';

.card-list {
  .card-wrap {
    margin-right: 16px;
  }
  .text-wrap {
    height: 180px;
    padding: 24px;
    background-color: #efefef;
    color: $text-color-help;
    .primary-btn-wrap {
      bottom: 8px;
      left: 24px;
      right: 24px;
    }
  }
  ::v-deep {
    .ant-card-head {
      border-bottom: 0;
    }
    .ant-card-body {
      padding: 0;
    }
    .ant-card-head {
      position: absolute;
      padding: 0;
      right: 0;
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
