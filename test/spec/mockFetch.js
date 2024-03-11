// centralize all our fetch mocks in one place so we can have
// consistent timeouts, and smooth over some of the boilerplate

export function mockFetch (method, url, response, { headers, delay } = {}) {
  let responseToUse
  if (!response) {
    responseToUse = null
  } else if (typeof response === 'string') {
    responseToUse = response
  } else {
    responseToUse = JSON.stringify(response)
  }

  fetch[method](
    url,
    () => new Response(responseToUse, { headers }),
    // use a delay of 1 because it's more realistic than a fetch() that resolves in a microtask
    { delay: typeof delay === 'number' ? delay : 1 }
  )
}

// convenience util for mocking a typical get and a head
export function mockGetAndHead (url, response, options = {}) {
  mockFetch('get', url, response, options)
  mockFetch('head', url, null, options)
}

export function mock500GetAndHead (url) {
  fetch.get(url, { body: null, status: 500 })
  fetch.head(url, { body: null, status: 500 })
}
