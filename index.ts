import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { connectDB } from './config/db'
import routes from './routes'
import { errorHandler, notFound } from './middleware/errorHandler'

const app = express()
const PORT = process.env.PORT || 5000

app.use(cors({ origin: 'http://localhost:5173' }))
app.use(express.json())

app.get('/', (_req, res) => {
  res.send('Traffic Signal API is running')
})

app.use('/api', routes)

app.use(notFound)
app.use(errorHandler)

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`)
    })
  })
  .catch((err) => {
    const errors = err.errors ?? [err]
    console.error('Database connection failed:')
    for (const e of errors) {
      console.error(` - ${e.code ?? ''} ${e.message ?? ''} (${e.address ?? ''}:${e.port ?? ''})`)
    }
    process.exit(1)
  })
