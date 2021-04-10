<template>
  <base-dialog @cancel="cancelDialog" :modal-props="modalProps" :width="params.dialogParams.width || 900">
    <div slot="header">{{ params.dialogParams.title || $t('common.select') }}</div>
    <div class="clearfix pr-2" slot="body">
      <div class="d-flex mb-2">
        <div class="text-left flex-shrink-0 flex-grow-0">{{ params.dialogParams.selectLabel || $t('common.text00040') }}：</div>
        <div class="selected-warp p-2 flex-fill ml-2">
          <template v-for="item of details">
            <a-tag
              class="mb-2 text-wrap"
              closable
              :key="item[idKey]"
              :color="item[idKey] === currentId ? '#108ee9' : ''"
              @close="handleRemove(item)">{{ params.formatterLabel(item) }}</a-tag>
          </template>
          <div class="clearfix">
            <div class="mini-text text-color-help float-left">{{ params.dialogParams.selectedTip || $t('common.text00041') }}：{{ details.length }}</div>
            <div class="mini-text select-all-close ml-2 float-left" @click="clearAllChoose" v-if="details.length > 0">{{$t('common_97')}}</div>
          </div>
        </div>
      </div>
      <div class="page-list-wrapper">
        <page-list
          ref="page-list"
          v-bind="listProps"
          @radio-change="handleRadioChange" />
        <template v-if="params.multiple">
          <a-button type="link" size="small" class="choose-all" @click="chooseAllHandle" v-if="isShowChooseAll">{{$t('common_98')}}</a-button>
        </template>
      </div>
    </div>
    <div slot="footer">
      <a-button @click="handleOk">{{$t('common_99')}}</a-button>
      <a-button @click="cancelDialog">{{ $t('dialog.cancel') }}</a-button>
    </div>
  </base-dialog>
</template>

<script>
import * as R from 'ramda'
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'ListSelectDialog',
  mixins: [DialogMixin, WindowsMixin],
  data () {
    return {
      selected: this.params.selected,
      details: this.params.details,
      current: {},
    }
  },
  computed: {
    listProps () {
      return {
        selectionType: 'radio',
        showSingleActions: false,
        showGroupActions: false,
        pagerLayout: ['PrevPage', 'Jump', 'PageCount', 'NextPage', 'Total'],
        ...this.params.listProps,
      }
    },
    idKey () {
      return this.params.idKey
    },
    currentId () {
      return this.current[this.idKey]
    },
    modalProps () {
      let mask = true
      if (!R.isNil(this.params.dialogParams.mask)) {
        mask = this.params.dialogParams.mask
      }
      return {
        mask,
      }
    },
    isShowChooseAll () {
      return !R.isEmpty(this.listProps.list.data)
    },
  },
  created () {
    this.listProps.list.fetchData()
  },
  methods: {
    handleRadioChange (row) {
      this.current = row
      if (!this.params.multiple) {
        this.selected = [row[this.idKey]]
        this.details = [row]
        return
      }
      const id = row[this.idKey]
      if (this.selected.includes(id)) {
        return
      }
      this.selected.push(id)
      this.details.push(row)
    },
    handleRemove (item) {
      const id = item[this.idKey]
      const index = this.selected.indexOf(id)
      if (index !== -1) {
        this.details.splice(index, 1)
        this.selected.splice(index, 1)
      }
      if (this.current[this.idKey] === id) {
        this.$refs['page-list'].clearSelected()
      }
    },
    handleOk () {
      this.params.ok(this.selected, this.details)
      this.cancelDialog()
    },
    chooseAllHandle () {
      Object.keys(this.listProps.list.data).forEach((v) => {
        if (!this.selected.includes(v)) {
          this.selected.push(v)
          this.details.push(this.listProps.list.data[v].data)
        }
      })
    },
    clearAllChoose () {
      this.selected = []
      this.details = []
    },
  },
}
</script>

<style lang="less" scoped>
.selected-warp {
  position: relative;
  border: 1px solid #d9d9d9;
  max-height: 180px;
  overflow-y: auto;
  .select-all-close{
    display: inline-block;
    color: #1890ff;
    cursor: pointer;
  }
}
.page-list-wrapper{
  position: relative;
  .choose-all{
    position: absolute;
    left: 0;
    bottom: 14px;
    font-size: 12px;
  }
}
</style>
