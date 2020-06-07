import Database from '../Database'
import { pick } from 'lodash-es'
import { basicAfterEach, basicBeforeEach, ALL_EMOJI } from './shared'

beforeEach(basicBeforeEach)
afterEach(basicAfterEach)

describe('getEmojiBySearchQuery', () => {
  test('basic searches', async () => {
    const db = new Database({ dataSource: ALL_EMOJI })
    await db.ready()
    const search = async query => (await db.getEmojiBySearchQuery(query)).map(_ => pick(_, ['annotation', 'order']))
    expect(await search('face')).toStrictEqual([
      { annotation: 'grinning face', order: 1 },
      { annotation: 'grinning face with big eyes', order: 2 },
      { annotation: 'grinning face with smiling eyes', order: 3 },
      { annotation: 'beaming face with smiling eyes', order: 4 },
      { annotation: 'grinning squinting face', order: 5 },
      { annotation: 'grinning face with sweat', order: 6 },
      { annotation: 'rolling on the floor laughing', order: 7 },
      { annotation: 'face with tears of joy', order: 8 },
      { annotation: 'slightly smiling face', order: 9 },
      { annotation: 'upside-down face', order: 10 },
      { annotation: 'winking face', order: 11 },
      { annotation: 'smiling face with smiling eyes', order: 12 },
      { annotation: 'smiling face with halo', order: 13 },
      { annotation: 'smiling face with hearts', order: 14 },
      { annotation: 'smiling face with heart-eyes', order: 15 },
      { annotation: 'star-struck', order: 16 },
      { annotation: 'face blowing a kiss', order: 17 },
      { annotation: 'kissing face', order: 18 },
      { annotation: 'smiling face', order: 20 },
      { annotation: 'kissing face with closed eyes', order: 21 },
      { annotation: 'monkey face', order: 2657 },
      { annotation: 'dog face', order: 2661 },
      { annotation: 'wolf', order: 2666 },
      { annotation: 'fox', order: 2667 },
      { annotation: 'cat face', order: 2669 },
      { annotation: 'lion', order: 2672 },
      { annotation: 'tiger face', order: 2673 },
      { annotation: 'horse face', order: 2676 }
    ])
    expect(await search('monk')).toStrictEqual([
      { annotation: 'monkey face', order: 2657 },
      { annotation: 'monkey', order: 2658 }
    ])
    expect(await search('monkey')).toStrictEqual([
      { annotation: 'monkey face', order: 2657 },
      { annotation: 'monkey', order: 2658 }
    ])
    expect(await search('monkey')).toStrictEqual([
      { annotation: 'monkey face', order: 2657 },
      { annotation: 'monkey', order: 2658 }
    ])
    expect(await search('MoNkEy')).toStrictEqual([
      { annotation: 'monkey face', order: 2657 },
      { annotation: 'monkey', order: 2658 }
    ])
    expect(await search('monkey fac')).toStrictEqual([
      { annotation: 'monkey face', order: 2657 }
    ])
    expect(await search('face monk')).toStrictEqual([
      { annotation: 'monkey face', order: 2657 }
    ])
    expect(await search('monkey facee')).toStrictEqual([])
    expect(await search('monk face')).toStrictEqual([])
    await db.delete()
  })
})
