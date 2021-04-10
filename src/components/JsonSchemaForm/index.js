import Vue from 'vue'
import Form from './form'
import Fieldset from './fieldset'
import List from './array'
import Inline from './inline'
import Control from './control'
import Checkbox from './checkbox'
import Radio from './radio'
import DateTimePicker from './datetime'
import Html from './html'

import JCloudregionList from './JComponents/JCloudregionList/index'
import JZoneList from './JComponents/JZoneList/index'
import JNetworkList from './JComponents/JNetworkList/index'
import JSKUList from './JComponents/JSKUList/index'
import JVPCList from './JComponents/JVPCList/index'
import JStorageBackendList from './JComponents/JStorageBackendList/index'

const components = [
  Form,
  Fieldset,
  List,
  Inline,
  Control,
  Checkbox,
  Radio,
  DateTimePicker,
  Html,
  JCloudregionList,
  JZoneList,
  JNetworkList,
  JSKUList,
  JStorageBackendList,
  JVPCList,
]

components.map(component => {
  Vue.use(component)
})

export default Form
