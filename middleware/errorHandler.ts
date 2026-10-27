import { NextFunction, Request, Response } from 'express'
import { HttpError } from '../utils/httpError'

export const notFound = (req: Request, res: Response) => {
  res.status(404).json({ error: `Route ${req.method} ${req.originalUrl} not found` })
}

export const errorHandler = (err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof HttpError) {
    res.status(err.status).json({ error: err.message })
    return
  }
  console.error(err)
  res.status(500).json({ error: 'Internal server error' })
}
