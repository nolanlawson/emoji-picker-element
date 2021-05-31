// Find one good representative emoji from each version to test by checking its color.
// Ideally it should have color in the center. For some inspiration, see:
// https://about.gitlab.com/blog/2018/05/30/journey-in-native-unicode-emoji/
//
// Note that for certain versions (12.1, 13.1), there is no point in testing them explicitly, because
// all the emoji from this version are compound-emoji from previous versions. So they would pass a color
// test, even in browsers that display them as double emoji. (E.g. "face in clouds" might render as
// "face without mouth" plus "fog".) These emoji can only be filtered using the width test,
// which happens in checkZwjSupport.js.
export const versionsAndTestEmoji = {
  '😃': 0.6,
  '😐️': 0.7,
  '😀': 1,
  '👁️‍🗨️': 2,
  '🤣': 3,
  '👱‍♀️': 4,
  '🤩': 5,
  '🥰': 11, // smiling face with hearts
  '🥻': 12.1, // sari, technically from v12 but see note above
  '🥲': 13.1 // smiling face with tear, technically from v13 but see note above
}
