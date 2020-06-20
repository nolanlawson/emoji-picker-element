import express from 'express'
import fs from 'fs'
const app = express()
const port = 3000

app.use(express.static('./'))

app.get('/', (req, res) => {
  res.type('text/html').send(fs.readFileSync('./test/leak/index.html', 'utf8'))
})

app.listen(port, () => console.log(`Server running at http://localhost:${port}`))
