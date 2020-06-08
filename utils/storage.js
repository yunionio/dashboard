const storage = {
  storage: window.localStorage,
  session: {
    storage: window.sessionStorage,
  },
}

const api = {
  set (key, val) {
    if (this.disabled) {
      return
    }
    if (val === undefined) {
      return this.remove(key)
    }
    this.storage.setItem(key, serialize(val))
    return val
  },

  get (key, def) {
    if (this.disabled) {
      return def
    }
    const val = deserialize(this.storage.getItem(key))
    return (val === undefined ? def : val)
  },

  has (key) {
    return this.get(key) !== undefined
  },

  remove (key) {
    if (this.disabled) {
      return
    }
    this.storage.removeItem(key)
  },

  clear () {
    if (this.disabled) {
      return
    }
    this.storage.clear()
  },

  getAll () {
    if (this.disabled) {
      return null
    }
    const ret = {}
    this.forEach((key, val) => {
      ret[key] = val
    })
    return ret
  },

  forEach (callback) {
    if (this.disabled) {
      return
    }
    for (let i = 0; i < this.storage.length; i++) {
      const key = this.storage.key(i)
      callback(key, this.get(key))
    }
  },
}

Object.assign(storage, api)

Object.assign(storage.session, api)

function serialize (val) {
  return JSON.stringify(val)
}

function deserialize (val) {
  if (typeof val !== 'string') {
    return undefined
  }
  try {
    return JSON.parse(val)
  } catch (e) {
    return val || undefined
  }
}

try {
  const testKey = '__oc_storage__'
  storage.set(testKey, testKey)
  if (storage.get(testKey) !== testKey) {
    storage.disabled = true
  }
  storage.remove(testKey)
} catch (e) {
  storage.disabled = true
}

export default storage
