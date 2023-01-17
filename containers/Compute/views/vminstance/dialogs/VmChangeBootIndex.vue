<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{$t('compute.change_boot_index')}}</div>
    <div slot="body">
      <dialog-selected-tips :name="$t('dictionary.server')" :count="params.data.length" :action="$t('compute.change_boot_index')" />
      <dialog-table :data="params.data" :columns="params.columns.slice(0, 3)" />
      <div class="d-flex">
        <div class="form-label mt-2">{{$t('compute.boot_index')}}:</div>
        <draggable
          style="flex: 1 1 auto"
          handle=".drag-icon"
          ghost-class="ghost"
          v-model="boots">
          <transition-group type="transition" name="flip-list">
            <div class="checkbox-item d-flex" v-for="item in boots" :key="item">
              <div class="d-flex" style="flex: 1 1 auto">
                <div class="type-label">{{typesMap[item.type].label}}</div>
                <div class="type-name">{{item.name}}</div>
              </div>
              <a-icon type="drag" class="drag-icon" style="font-size:18px" @click="iconClick" />
            </div>
          </transition-group>
        </draggable>
      </div>
    </div>
    <div slot="footer">
      <a-button type="primary" @click="handleConfirm" :loading="loading">{{ $t('dialog.ok') }}</a-button>
      <a-button @click="cancelDialog">{{ $t('dialog.cancel') }}</a-button>
    </div>
  </base-dialog>
</template>

<script>
import draggable from 'vuedraggable'
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'
import { sizestr } from '@/utils/utils'

export default {
  name: 'VmChangeBootIndexDialog',
  components: {
    draggable,
  },
  mixins: [DialogMixin, WindowsMixin],
  data () {
    return {
      typesMap: {
        cdrom: {
          label: this.$t('compute.text_1273'),
        },
        data: {
          label: this.$t('compute.text_50'),
        },
        sys: {
          label: this.$t('compute.text_49'),
        },
      },
      boots: [],
      loading: false,
    }
  },
  created () {
    this.initBoots()
  },
  methods: {
    initBoots () {
      const { disks_info = [], cdrom = [] } = this.params.data[0] || {}
      const ret = []
      disks_info.map(item => {
        ret.push({
          type: item.disk_type,
          name: `${item.name} (${sizestr(item.size || 0, 'M', 1024)})`,
          size: item.size,
          boot_index: item.boot_index,
          index: item.index,
        })
      })
      cdrom.map(item => {
        ret.push({
          type: 'cdrom',
          name: item.detail,
          boot_index: item.boot_index,
          ordinal: item.ordinal,
        })
      })
      ret.sort((a, b) => {
        return a.boot_index - b.boot_index
      })
      this.boots = ret
    },
    async handleConfirm () {
      this.loading = true
      try {
        const data = { disks: {}, cdroms: {} }
        this.boots.map((item, index) => {
          if (item.type === 'cdrom') {
            data.cdroms[item.ordinal + ''] = index
          } else {
            data.disks[item.index + ''] = index
          }
        })
        await this.params.onManager('performAction', {
          id: this.params.data[0].id,
          managerArgs: {
            action: 'set-boot-index',
            data,
          },
        })
        this.loading = false
        this.cancelDialog()
      } catch (error) {
        this.loading = false
      }
    },
    iconClick (e) {
      e.preventDefault()
    },
  },
}
</script>

<style lang="less" scoped>
@import '@/styles/less/theme.less';

.tag-fields-wrap {
  max-height: 100px;
  overflow: auto;
}
.checkbox-item {
  position: relative;
  padding: 5px 0;
  margin-bottom: 10px;
  background: #eee;
  ::v-deep {
    .checkbox-property {
      padding-right: 15px;
    }
  }
  .type-label {
    flex: 0 0 80px;
    background: var(--antd-wave-shadow-color);
    color: #fff;
    text-align: center;
    height: 25px;
    line-height: 25px;
    max-height: 25px;
    margin: 0 5px;
    font-size: 12px;
  }
  .type-name {
    line-height: 25px;
    padding-right: 20px;
    white-space: wrap;
    word-break: wrap;
  }
}
.flip-list-move {
  transition: transform 0.5s;
}
.drag-icon {
  position: absolute;
  right: 10px;
  cursor: move;
  top: 50%;
  transform: translateY(-50%);
}
.ghost {
  opacity: 0.7;
  background: @primary-color;
  ::v-deep {
    label span {
      color: #fff;
    }
  }
}
.form-label {
  flex: 0 0 100px;
}
</style>
