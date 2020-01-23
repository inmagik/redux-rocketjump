import { fork, cancel, take } from 'redux-saga/effects'
import { mergeActionPatterns, matchActionPattern } from 'rocketjump-core/utils'

export function* takeEveryAndCancel(pattern, cancelPattern, saga, ...args) {
  const task = yield fork(function*() {
    let pendingTasks = []
    while (true) {
      const action = yield take(mergeActionPatterns(pattern, cancelPattern))

      if (matchActionPattern(action, cancelPattern)) {
        // Cancel all pending tasks
        for (let i = 0; i < pendingTasks.length; i++) {
          const task = pendingTasks[i]
          yield cancel(task)
        }
        pendingTasks = []
      } else {
        // Fork saga and remove handled tasks
        const task = yield fork(saga, ...args.concat(action))
        pendingTasks.push(task)
        pendingTasks = pendingTasks.filter(task => !task.isRunning())
      }
    }
  })
  return task
}

export function* takeLatestAndCancel(pattern, cancelPattern, saga, ...args) {
  const task = yield fork(function*() {
    let lastTask
    while (true) {
      const action = yield take(mergeActionPatterns(pattern, cancelPattern))

      // Cancel previous task
      if (lastTask) {
        yield cancel(lastTask)
      }
      // Fork saga only
      if (!matchActionPattern(action, cancelPattern)) {
        lastTask = yield fork(saga, ...args.concat(action))
      }
    }
  })
  return task
}

export function* takeExhaustAndCancel(pattern, cancelPattern, saga, ...args) {
  const task = yield fork(function*() {
    let lastTask
    while (true) {
      const action = yield take(mergeActionPatterns(pattern, cancelPattern))

      if (matchActionPattern(action, cancelPattern)) {
        // Cancel previous task
        if (lastTask) {
          yield cancel(lastTask)
        }
      } else {
        if (!lastTask || !lastTask.isRunning()) {
          // No previous task or last task finish running
          // Fork new task
          lastTask = yield fork(saga, ...args.concat(action))
        }
      }
    }
  })
  return task
}

export function* takeExhaustAndCancelGroupBy(
  pattern,
  cancelPattern,
  saga,
  groupBy,
  ...args
) {
  const task = yield fork(function*() {
    const pendingTasks = {}
    while (true) {
      const action = yield take(mergeActionPatterns(pattern, cancelPattern))
      const key = groupBy(action)

      if (matchActionPattern(action, cancelPattern)) {
        if (key === null) {
          // Cancel all tasks
          const keys = Object.keys(pendingTasks)
          for (let i = 0; i < keys.length; i++) {
            const currentKey = keys[i]
            yield cancel(pendingTasks[currentKey])
            delete pendingTasks[currentKey]
          }
        } else if (pendingTasks[key]) {
          // Cancel previous task by key
          yield cancel(pendingTasks[key])
          delete pendingTasks[key]
        }
      } else {
        let lastTask = pendingTasks[key]
        if (!lastTask || !lastTask.isRunning()) {
          // No previous task or last task finish running
          // Fork new task
          pendingTasks[key] = yield fork(saga, ...args.concat(action))
        }
      }

      // Garbage collect finish tasks
      const keys = Object.keys(pendingTasks)
      for (let i = 0; i < keys.length; i++) {
        const currentKey = keys[i]
        const currentTask = pendingTasks[currentKey]
        if (!currentTask.isRunning()) {
          delete pendingTasks[currentKey]
        }
      }
    }
  })
  return task
}

// Difficult: Perfect Master
export function* takeLatestAndCancelGroupBy(
  pattern,
  cancelPattern,
  saga,
  groupBy,
  ...args
) {
  const task = yield fork(function*() {
    const pendingTasks = {}
    while (true) {
      const action = yield take(mergeActionPatterns(pattern, cancelPattern))
      const key = groupBy(action)

      // Cancel previous task by key
      if (pendingTasks[key]) {
        yield cancel(pendingTasks[key])
      }

      if (!matchActionPattern(action, cancelPattern)) {
        // Fork saga only
        pendingTasks[key] = yield fork(saga, ...args.concat(action))
      } else if (key === null) {
        // Clear all pending tasks
        const keys = Object.keys(pendingTasks)
        for (let i = 0; i < keys.length; i++) {
          const currentKey = keys[i]
          yield cancel(pendingTasks[currentKey])
          delete pendingTasks[currentKey]
        }
      }

      // Garbage collect finish tasks
      const keys = Object.keys(pendingTasks)
      for (let i = 0; i < keys.length; i++) {
        const currentKey = keys[i]
        const currentTask = pendingTasks[currentKey]
        if (!currentTask.isRunning()) {
          delete pendingTasks[currentKey]
        }
      }
    }
  })
  return task
}
