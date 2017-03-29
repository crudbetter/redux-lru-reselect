const { createStore } = require('redux')
const { createSelector } = require('reselect')
const LRU = require('lru-cache')

const millisInOneDay = 86400000

const initialState = {
  buffer: { cache: new LRU({ max: 300, length: () => 1 }) }
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

function reducer(state = initialState, action) {
  switch (action.type) {
    case UPDATE_BUFFER:
      const { buffer: { cache } } = state

      cache.set(action.key, action.data)
      
      return Object.assign({}, state, {
        buffer: { cache: cache },
      })
    default:
      return state
  }
}

const bufferSelector = createSelector(
  [
    (state, _key) => state.buffer,
    (_state, key) => key
  ],
  ({ cache }, key) => {
    return buffer.get(key)
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
