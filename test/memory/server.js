import express from 'express'
import fs from 'fs'
const app = express()
const port = 3000

app.use(express.static('./'))

app.get('/', (req, res) => {
  res.set('Cross-Origin-Embedder-Policy', 'require-corp')
    .set('Cross-Origin-Opener-Policy', 'same-origin')
    .type('text/html')
    .send(fs.readFileSync('./test/memory/index.html', 'utf8'))
})

app.listen(port, () => console.log(`Server running at http://localhost:${port}`))
