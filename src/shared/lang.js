// Avoid using a bunch of extra memory for throwaway read-only empty objects/arrays
export const EMPTY_ARRAY = []
export const EMPTY_OBJECT = {}

if (process.env.NODE_ENV !== 'production') {
  Object.freeze(EMPTY_ARRAY)
  Object.freeze(EMPTY_OBJECT)
}
