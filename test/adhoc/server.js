import express from 'express'
import compression from 'compression'
import fs from 'fs'
import process from 'process'

const app = express()
const port = process.env.PORT || 3000

app.use(compression())
app.use(express.static('./'))

app.get('/', (req, res) => {
  res.type('text/html')
    .send(fs.readFileSync('./test/adhoc/index.html', 'utf8'))
})

app.listen(port, '0.0.0.0', () => console.log(`Server running at http://localhost:${port}`))
