import express from 'express'
import compression from 'compression'
import fs from 'fs'
const app = express()
const port = 3000

app.use(compression())
app.use(express.static('./'))

const html = fs.readFileSync('./test/lighthouse/index.html', 'utf8')

app.get('/', (req, res) => {
  res.type('text/html')
    .send(html)
})

app.listen(port, '0.0.0.0', () => console.log(`Server running at http://localhost:${port}`))
