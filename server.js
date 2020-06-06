const express = require('express')
const app = express()
const port = 3000

app.use(express.static('./', {
  setHeaders: (res) => {
    res.set('Cross-Origin-Embedder-Policy', 'require-corp')
    res.set('Cross-Origin-Opener-Policy', 'same-origin')
  }
}))

app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`))
