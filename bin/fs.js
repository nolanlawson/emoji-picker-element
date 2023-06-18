import { rm, mkdir } from 'node:fs/promises'

export { readFile, writeFile, copyFile, readdir } from 'node:fs/promises'

export const rimraf = (...args) => rm(...args, { recursive: true, force: true })
export const mkdirp = (...args) => mkdir(...args, { recursive: true })
