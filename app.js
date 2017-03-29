const { createStore } = require('redux')
const { createSelector } = require('reselect')
const LRU = require('lru-cache')

function createLRU() {
  return new LRU({ max: 300, length: () => 1 })
}

const UPDATE_BUFFER = 'UPDATE_BUFFER'

function updateBuffer(key) {
  const now = Date.now()

  console.log(`updateBuffer - ${now}`)

  return {
    type: UPDATE_BUFFER,
    key,
    data: now
  }
}

const reducerCache = createLRU()
function reducer(state = { buffer: {} }, action) {
  switch (action.type) {
    case UPDATE_BUFFER:
      const { buffer } = state

      reducerCache.load(buffer)
      reducerCache.set(action.key, action.data)
      
      return Object.assign({}, state, { buffer: reducerCache.dump() })
    default:
      return state
  }
}

const selectorCache = createLRU()
const bufferSelector = createSelector(
  [
    (state, _key) => state.buffer,
    (_state, key) => key
  ],
  (buffer, key) => {
    selectorCache.load(buffer)
    return selectorCache.get(key)
  }
)

const store = createStore(reducer)

const unsubscribe = store.subscribe(() => {
  const state = store.getState()
  console.log(`bufferSelector - ${bufferSelector(state, 'someKey')}`)
})

store.dispatch(updateBuffer('someKey'))

setTimeout(() => {
  store.dispatch(updateBuffer('someKey'))
  unsubscribe()
}, 2000)
