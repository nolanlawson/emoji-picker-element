// Implementation left/right or up/down navigation, circling back when you
// reach the start/end of the list
export function incrementOrDecrement (decrement, val, arr) {
  val += (decrement ? -1 : 1)
  if (val < 0) {
    val = arr.length - 1
  } else if (val >= arr.length) {
    val = 0
  }
  return val
}
