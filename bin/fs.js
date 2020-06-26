import fs from 'fs'
import { promisify } from 'util'

export const readFile = promisify(fs.readFile)
export const writeFile = promisify(fs.writeFile)
export const copyFile = promisify(fs.copyFile)
export const readdir = promisify(fs.readdir)
