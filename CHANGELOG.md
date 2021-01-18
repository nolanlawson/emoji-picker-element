# [1.4.0](https://github.com/nolanlawson/emoji-picker-element/compare/v1.3.4...v1.4.0) (2021-01-18)


### Features

* support emoji 13.1 ([#114](https://github.com/nolanlawson/emoji-picker-element/issues/114)) ([4b5d4e3](https://github.com/nolanlawson/emoji-picker-element/commit/4b5d4e39df7e1770d12181c14ec1ac191263e5c4))



## [1.3.4](https://github.com/nolanlawson/emoji-picker-element/compare/v1.3.3...v1.3.4) (2020-12-29)


### Bug Fixes

* fix getEmojiByShortcode when shortcodes are optional ([#98](https://github.com/nolanlawson/emoji-picker-element/issues/98)) ([f4e7ad8](https://github.com/nolanlawson/emoji-picker-element/commit/f4e7ad8bdf063b0ca07dbbd3f9d1dcf50138de8a))


### Performance Improvements

* reduce bundle size by optimizing HTML/CSS a bit ([#97](https://github.com/nolanlawson/emoji-picker-element/issues/97)) ([3bf8225](https://github.com/nolanlawson/emoji-picker-element/commit/3bf8225b41f3cee9a8ec37cc00afd8f32a1a6499))
* simplify baseline emoji html ([#96](https://github.com/nolanlawson/emoji-picker-element/issues/96)) ([4f03bfc](https://github.com/nolanlawson/emoji-picker-element/commit/4f03bfc961145a95ebfa2deb3d6b5c23ded60d37))



## [1.3.3](https://github.com/nolanlawson/emoji-picker-element/compare/v1.3.2...v1.3.3) (2020-12-25)


### Performance Improvements

* use batch cursor for full DB scan ([#94](https://github.com/nolanlawson/emoji-picker-element/issues/94)) ([e5b1750](https://github.com/nolanlawson/emoji-picker-element/commit/e5b17505722ea0800431b5b9b53d7d59d03142ab))



## [1.3.2](https://github.com/nolanlawson/emoji-picker-element/compare/v1.3.1...v1.3.2) (2020-12-24)


### Bug Fixes

* fix short tokens in getEmojiByShortcode ([#90](https://github.com/nolanlawson/emoji-picker-element/issues/90)) ([992ac10](https://github.com/nolanlawson/emoji-picker-element/commit/992ac10164a46b28d87c348894cdd12d8eaaa015))



## [1.3.1](https://github.com/nolanlawson/emoji-picker-element/compare/v1.3.0...v1.3.1) (2020-12-19)


### Bug Fixes

* fix race condition on custom emoji ([#85](https://github.com/nolanlawson/emoji-picker-element/issues/85)) ([9170e19](https://github.com/nolanlawson/emoji-picker-element/commit/9170e19734dac7d4aa90ad373dc76c493b89dcc7))
* fix warning message having wrong URL to readme ([#76](https://github.com/nolanlawson/emoji-picker-element/issues/76)) ([93f1da8](https://github.com/nolanlawson/emoji-picker-element/commit/93f1da8058682da054c973e72896c611f6059f7a))



# [1.3.0](https://github.com/nolanlawson/emoji-picker-element/compare/v1.2.3...v1.3.0) (2020-11-06)


### Features

* use emoji-picker-element-data, make shortcodes optional ([#75](https://github.com/nolanlawson/emoji-picker-element/issues/75)) ([f40beed](https://github.com/nolanlawson/emoji-picker-element/commit/f40beeddd10c70392041ec9b045c299488beaa9a))



## [1.2.3](https://github.com/nolanlawson/emoji-picker-element/compare/v1.2.2...v1.2.3) (2020-11-06)


### Bug Fixes

* emoticon is not a required field ([#73](https://github.com/nolanlawson/emoji-picker-element/issues/73)) ([c72bb44](https://github.com/nolanlawson/emoji-picker-element/commit/c72bb44a28ef7844a886beb8900caa5cc198af66))
* fix types for addEventListener and removeEventListener ([#61](https://github.com/nolanlawson/emoji-picker-element/issues/61)) ([f6b3d83](https://github.com/nolanlawson/emoji-picker-element/commit/f6b3d834b89a0be7d86258b3a762469ca82431f3))
* use @^ for versions ([#72](https://github.com/nolanlawson/emoji-picker-element/issues/72)) ([8261856](https://github.com/nolanlawson/emoji-picker-element/commit/82618562f1cc283a86e7939fce331705519ca9f6)), closes [#71](https://github.com/nolanlawson/emoji-picker-element/issues/71)



## [1.2.2](https://github.com/nolanlawson/emoji-picker-element/compare/v1.2.1...v1.2.2) (2020-11-02)


### Bug Fixes

* remove unnecessary aria-hidden ([#66](https://github.com/nolanlawson/emoji-picker-element/issues/66)) ([5038363](https://github.com/nolanlawson/emoji-picker-element/commit/50383632ce9dd3434812e6db2fa16d7774a9f6f3))
* remove unused CSS rule ([#56](https://github.com/nolanlawson/emoji-picker-element/issues/56)) ([251d29b](https://github.com/nolanlawson/emoji-picker-element/commit/251d29b3097461252f1b36de49037451501f7de2))
* use consistent HTML for custom emoji ([#64](https://github.com/nolanlawson/emoji-picker-element/issues/64)) ([60f8c04](https://github.com/nolanlawson/emoji-picker-element/commit/60f8c04e4c8dd82a1bebc997eb972651ac5a101a))


### Performance Improvements

* use lazy image loading ([#65](https://github.com/nolanlawson/emoji-picker-element/issues/65)) ([73d7639](https://github.com/nolanlawson/emoji-picker-element/commit/73d76399f77c86bb9f43e67925c0fde8d5935861))



## [1.2.1](https://github.com/nolanlawson/emoji-picker-element/compare/v1.2.0...v1.2.1) (2020-09-24)


### Bug Fixes

* fix emoji support detection on Chrome on Mac ([#49](https://github.com/nolanlawson/emoji-picker-element/issues/49)) ([0a9e3bb](https://github.com/nolanlawson/emoji-picker-element/commit/0a9e3bb0734fbb868324dfaaf0e591b84ce6bccf))
* fix ZWJ detection on windows ([#50](https://github.com/nolanlawson/emoji-picker-element/issues/50)) ([a467685](https://github.com/nolanlawson/emoji-picker-element/commit/a4676858801f51057c5831e5fed07b5fadf4748b))



# [1.2.0](https://github.com/nolanlawson/emoji-picker-element/compare/v1.1.0...v1.2.0) (2020-09-13)


### Bug Fixes

* rename customCategorySort to customCategorySorting ([#45](https://github.com/nolanlawson/emoji-picker-element/issues/45)) ([117b201](https://github.com/nolanlawson/emoji-picker-element/commit/117b201ac00836091f5df9176640fb175354a9c8))


### Features

* add customCategorySort function ([#43](https://github.com/nolanlawson/emoji-picker-element/issues/43)) ([6be51f1](https://github.com/nolanlawson/emoji-picker-element/commit/6be51f18063198676fc3091405a9c9d62f85f910)), closes [#41](https://github.com/nolanlawson/emoji-picker-element/issues/41)
* add Home/End keyboard shortcuts ([#44](https://github.com/nolanlawson/emoji-picker-element/issues/44)) ([c2d4b95](https://github.com/nolanlawson/emoji-picker-element/commit/c2d4b950dbe6d1061ed75d06da66a79b92dbe601)), closes [#2](https://github.com/nolanlawson/emoji-picker-element/issues/2)



# [1.1.0](https://github.com/nolanlawson/emoji-picker-element/compare/v1.0.3...v1.1.0) (2020-08-21)


### Features

* support attribute format for some properties ([#33](https://github.com/nolanlawson/emoji-picker-element/issues/33)) ([83e516c](https://github.com/nolanlawson/emoji-picker-element/commit/83e516ce2168ec32e661e962d1429c989cf7b7e8)), closes [#7](https://github.com/nolanlawson/emoji-picker-element/issues/7)


### Performance Improvements

* reduce idb migration code ([#22](https://github.com/nolanlawson/emoji-picker-element/issues/22)) ([50445d4](https://github.com/nolanlawson/emoji-picker-element/commit/50445d4db58716df6305856d1d01730504683ee7)), closes [#21](https://github.com/nolanlawson/emoji-picker-element/issues/21)



## [1.0.3](https://github.com/nolanlawson/emoji-picker-element/compare/v1.0.2...v1.0.3) (2020-07-01)


### Bug Fixes

* fix aXe warning about aria-owns ([#19](https://github.com/nolanlawson/emoji-picker-element/issues/19)) ([8f1ed54](https://github.com/nolanlawson/emoji-picker-element/commit/8f1ed5434e6166b1ff9f551e4a97d9e98723ebd2))



## [1.0.2](https://github.com/nolanlawson/emoji-picker-element/compare/v1.0.1...v1.0.2) (2020-07-01)


### Bug Fixes

* collapse skin tone picker on blur ([#17](https://github.com/nolanlawson/emoji-picker-element/issues/17)) ([b551e12](https://github.com/nolanlawson/emoji-picker-element/commit/b551e1276be80d06e3a48fbb98e506c7dba9d5e7)), closes [#16](https://github.com/nolanlawson/emoji-picker-element/issues/16)
* tabs are not aria-selected in search mode ([#18](https://github.com/nolanlawson/emoji-picker-element/issues/18)) ([4737d02](https://github.com/nolanlawson/emoji-picker-element/commit/4737d023b7d01a8280a028d49f594f46743a4059))



## [1.0.1](https://github.com/nolanlawson/emoji-picker-element/compare/v1.0.0...v1.0.1) (2020-06-30)


### Bug Fixes

* remove blur/focusout event for now ([#15](https://github.com/nolanlawson/emoji-picker-element/issues/15)) ([d0bb1fd](https://github.com/nolanlawson/emoji-picker-element/commit/d0bb1fd51dc66ebfdd3d817f00335966773e7ec2)), closes [#14](https://github.com/nolanlawson/emoji-picker-element/issues/14)



# [1.0.0](https://github.com/nolanlawson/emoji-picker-element/compare/28c6864d754ac7391893bbef45455e7df6eee93d...v1.0.0) (2020-06-28)

Initial release.