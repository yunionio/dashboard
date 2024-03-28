<template>
  <div>
    <a-tabs hideAdd v-model="active" type="editable-card" @edit="onEdit">
      <a-tab-pane v-for="(pane, i) in panes" :key="pane.key" :closable="panes.length > 1">
        <template v-slot:tab>
          <a-badge :dot="showBadge(pane)" :offset="[(panes.length > 1 ? 24 : 10), -5]">
            <span>{{$t('compute.container', [i+1])}}</span>
          </a-badge>
        </template>
        <spec-container-form :decorators="getDecorators(pane.key)" :cluster="cluster" :namespace="namespace" :form="form" />
      </a-tab-pane>
      <template v-slot:tabBarExtraContent>
        <a-button type="link" @click="add">{{$t('compute.add_container')}}</a-button>
      </template>
    </a-tabs>
  </div>
</template>

<script>
import * as R from 'ramda'
import SpecContainerForm from './Form'
import { uuid } from '@/utils/utils'

export default {
  name: 'SpecContainers',
  components: {
    SpecContainerForm,
  },
  props: {
    decorators: {
      type: Object,
      required: true,
    },
    cluster: String,
    namespace: String,
    form: {
      type: Object,
      validator: v => v.fc,
    },
    errPanes: {
      type: Array,
      default: () => [],
    },
  },
  data () {
    const key = uuid()
    return {
      active: key,
      panes: [
        { key },
      ],
    }
  },
  created () {
    this.syncPanes()
  },
  methods: {
    syncPanes () {
      this.$emit('update:panes', this.panes)
    },
    showBadge (pane) {
      return this.errPanes.includes(pane.key)
    },
    add () {
      const key = uuid()
      this.panes.push({
        key,
      })
      this.active = key
      this.syncPanes()
    },
    onEdit (targetKey, action) {
      if (action === 'remove') {
        const index = this.panes.findIndex(val => val.key === targetKey)
        this.panes.splice(index, 1)
        if (this.active === targetKey) {
          this.active = this.panes[0].key
        }
        this.syncPanes()
      }
    },
    getDecorators (k) {
      const ret = {}
      R.forEachObjIndexed((item, key) => {
        if (R.is(Function, item)) {
          ret[key] = item(k)
        }
      }, this.decorators)
      return ret
    },
  },
}
</script>
