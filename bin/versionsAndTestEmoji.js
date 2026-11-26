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
  '🫫': 18, // cracking face
  '🫪': 17, // distorted face
  '🫩': 16, // face with bags under eyes
  '🫨': 15.1, // shaking head, technically from v15 but see note above
  '🫠': 14,
  '🥲': 13.1, // smiling face with tear, technically from v13 but see note above
  '🥻': 12.1, // sari, technically from v12 but see note above
  '🥰': 11,
  '🤩': 5,
  '👱‍♀️': 4,
  '🤣': 3,
  '👁️‍🗨️': 2,
  '😀': 1,
  '😐️': 0.7,
  '😃': 0.6
}
