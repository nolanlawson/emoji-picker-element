// return an array of results representing all items that are found in each one of the arrays
//
import { minBy } from './minBy'

export function findCommonMembers (arrays, uniqByFunc) {
  const shortestArray = minBy(arrays, _ => _.length)
  const results = []
  for (const item of shortestArray) {
    // if this item is included in every array in the intermediate results, add it to the final results
    if (!arrays.some(array => array.findIndex(_ => uniqByFunc(_) === uniqByFunc(item)) === -1)) {
      results.push(item)
    }
  }
  return results
}
