import Vue from 'vue'
import VeLine from 'v-charts/lib/line.common'
import VeHistogram from 'v-charts/lib/histogram.common'
import VeBar from 'v-charts/lib/bar.common'
import VePie from 'v-charts/lib/pie.common'
import VeRing from 'v-charts/lib/ring.common'

export default {
  install () {
    Vue.component(VeLine.name, VeLine)
    Vue.component(VeHistogram.name, VeHistogram)
    Vue.component(VeBar.name, VeBar)
    Vue.component(VePie.name, VePie)
    Vue.component(VeRing.name, VeRing)
  },
}
