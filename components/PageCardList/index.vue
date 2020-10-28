<template>
  <div>
    <div class="mb-2 d-flex justify-content-between">
      <div class="d-flex">
        <refresh-button :loading="loading" @refresh="refresh" v-show="isRefreshed" />
        <template v-if="groupActions">
          <actions :options="groupActions" button-type="default" group />
        </template>
        <slot name="group-actions-append" />
      </div>
      <slot name="tool-actions-between" />
    </div>
    <slot name="tool-actions-append" />
    <card-list v-if="hasData" :list="list.data" :cardFields="cardFields" :singleActions="singleActions" :layoutDirection="layoutDirection" />
    <loader v-else :loading="loading" class="mt-3" />
    <div class="d-flex align-items-center justify-content-end" v-show="showPageer && list.total !== 0">
      <a-pagination
        class="my-3 text-center"
        showSizeChanger
        :pageSize.sync="list.limit"
        :total="list.total"
        @change="pageChange"
        @showSizeChange="sizeChange"
        :default-current="1" />
        <div class="vxe-pager--total" style="font-size: 12px;">{{ $t('common_717', [list.total]) }}</div>
    </div>
  </div>
</template>

<script>
import * as R from 'ramda'
import CardList from './CardList'
import Loader from './Loader'
import Actions from '@/components/PageList/Actions'
import RefreshButton from '@/components/PageList/RefreshButton'

export default {
  name: 'PageCardList',
  components: {
    Actions,
    RefreshButton,
    CardList,
    Loader,
  },
  props: {
    list: {
      type: Object,
      required: true,
    },
    singleActions: {
      type: Array,
    },
    groupActions: {
      type: Array,
    },
    cardFields: {
      type: Object,
      required: true,
    },
    showPageer: {
      type: Boolean,
      default: true,
    },
    isRefreshed: {
      type: Boolean,
      default: true,
    },
    layoutDirection: {
      type: String,
      default: 'vertical',
      validator: val => ['horizontal', 'vertical'].includes(val),
    },
  },
  data () {
    return {
      currentPage: 1,
    }
  },
  computed: {
    loading () {
      return this.list.loading
    },
    hasData () {
      return !R.isEmpty(this.list.data) && !R.isNil(this.list.data)
    },
  },
  watch: {
    currentPage (val) {
      this.list.offset = (val - 1) * this.list.limit
      this.refresh()
    },
  },
  methods: {
    refresh () {
      this.list.refresh()
    },
    sizeChange (current, limit) {
      this.list.offset = (Math.max(current, 1) - 1) * this.list.limit
      this.list.limit = limit
      this.refresh()
    },
    pageChange (page) {
      this.currentPage = page
    },
  },
}
</script>
