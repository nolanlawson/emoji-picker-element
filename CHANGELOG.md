## [1.22.5](https://github.com/nolanlawson/emoji-picker-element/compare/v1.22.4...v1.22.5) (2024-09-09)


### Bug Fixes

* fix favorites `aria-selected` rendering ([#451](https://github.com/nolanlawson/emoji-picker-element/issues/451)) ([497c7e0](https://github.com/nolanlawson/emoji-picker-element/commit/497c7e071c4584cf566665bb5a2b84cf1d53e166))


### Performance Improvements

* avoid recalculating custom emoji index ([#446](https://github.com/nolanlawson/emoji-picker-element/issues/446)) ([0c09f56](https://github.com/nolanlawson/emoji-picker-element/commit/0c09f56339be3b6f0cb563fee294721c2be79b62))
* optimize trie construction ([#448](https://github.com/nolanlawson/emoji-picker-element/issues/448)) ([9954aef](https://github.com/nolanlawson/emoji-picker-element/commit/9954aef155d6983b770e2908f772dac7cf937fd4))
* use `background-image` instead of `<img>` ([#450](https://github.com/nolanlawson/emoji-picker-element/issues/450)) ([a9351bc](https://github.com/nolanlawson/emoji-picker-element/commit/a9351bc8457fb6e4847b4a37108df3cedcb0cbdb))
* use `content-visibility` for custom emoji ([#445](https://github.com/nolanlawson/emoji-picker-element/issues/445)) ([9268c67](https://github.com/nolanlawson/emoji-picker-element/commit/9268c6763b01274342375d29bc5eaf70e3c158bd))



## [1.22.4](https://github.com/nolanlawson/emoji-picker-element/compare/v1.22.3...v1.22.4) (2024-08-17)


### Performance Improvements

* use `willReadFrequently` ([#442](https://github.com/nolanlawson/emoji-picker-element/issues/442)) ([d5bbdf7](https://github.com/nolanlawson/emoji-picker-element/commit/d5bbdf7bd80162af1c4a14d15b45f1f9fcfbe71d))



## [1.22.3](https://github.com/nolanlawson/emoji-picker-element/compare/v1.22.2...v1.22.3) (2024-08-16)


### Performance Improvements

* avoid unnecessary re-renders ([#437](https://github.com/nolanlawson/emoji-picker-element/issues/437)) ([586ba43](https://github.com/nolanlawson/emoji-picker-element/commit/586ba4375bda30b2f7aca195e50d88d5fc244654))



## [1.22.2](https://github.com/nolanlawson/emoji-picker-element/compare/v1.22.1...v1.22.2) (2024-08-06)


### Bug Fixes

* allow for emoji with no tags ([#434](https://github.com/nolanlawson/emoji-picker-element/issues/434)) ([e91717b](https://github.com/nolanlawson/emoji-picker-element/commit/e91717b3d2f7d8f0fc7d7f1d53803fdde7412104))



## [1.22.1](https://github.com/nolanlawson/emoji-picker-element/compare/v1.22.0...v1.22.1) (2024-08-05)


### Bug Fixes

* use `scrollbar-gutter: stable` ([#433](https://github.com/nolanlawson/emoji-picker-element/issues/433)) ([c3cd0b8](https://github.com/nolanlawson/emoji-picker-element/commit/c3cd0b89ed1a9bc4b75d24a81727a6ac6bc64da5))



# [1.22.0](https://github.com/nolanlawson/emoji-picker-element/compare/v1.21.3...v1.22.0) (2024-07-27)


### Features

* add CSS variable for custom border-radius ([#428](https://github.com/nolanlawson/emoji-picker-element/issues/428)) ([212b12f](https://github.com/nolanlawson/emoji-picker-element/commit/212b12f6bc764ad5c2d12b3eea0d9b65594c2161))



## [1.21.3](https://github.com/nolanlawson/emoji-picker-element/compare/v1.21.2...v1.21.3) (2024-04-09)


### Bug Fixes

* improved French translations ([#417](https://github.com/nolanlawson/emoji-picker-element/issues/417)) ([e528676](https://github.com/nolanlawson/emoji-picker-element/commit/e52867681ab07f9eca575e7899f453b9fcd2070a))



## [1.21.2](https://github.com/nolanlawson/emoji-picker-element/compare/v1.21.1...v1.21.2) (2024-03-22)


### Bug Fixes

* avoid HTML comments, simplify replacement logic ([#409](https://github.com/nolanlawson/emoji-picker-element/issues/409)) ([ce950ff](https://github.com/nolanlawson/emoji-picker-element/commit/ce950ff740292e6914ed0744b5587db2f3dcc1f7))
* minor refactor to reduce code size ([#406](https://github.com/nolanlawson/emoji-picker-element/issues/406)) ([55872ba](https://github.com/nolanlawson/emoji-picker-element/commit/55872ba99647425008b5b047960893cca9f88713))



## [1.21.1](https://github.com/nolanlawson/emoji-picker-element/compare/v1.21.0...v1.21.1) (2024-02-17)


### Bug Fixes

* avoid calling getRootNode ([#399](https://github.com/nolanlawson/emoji-picker-element/issues/399)) ([19331c6](https://github.com/nolanlawson/emoji-picker-element/commit/19331c6be6de9da9199a43c6aa13e48fd310a952))



# [1.21.0](https://github.com/nolanlawson/emoji-picker-element/compare/v1.20.1...v1.21.0) (2023-12-17)


### Performance Improvements

* add more benchmarks ([#389](https://github.com/nolanlawson/emoji-picker-element/issues/389)) ([6eb3089](https://github.com/nolanlawson/emoji-picker-element/commit/6eb3089dc666124a96d2bf7c1039672bdde77593))
* replace Svelte with vanilla JS ([#381](https://github.com/nolanlawson/emoji-picker-element/issues/381)) ([5699285](https://github.com/nolanlawson/emoji-picker-element/commit/56992858c00513f5ee95025a55a20cea8c4b5f72))
* run all benchmark tests locally ([#391](https://github.com/nolanlawson/emoji-picker-element/issues/391)) ([750e849](https://github.com/nolanlawson/emoji-picker-element/commit/750e8493e33a67ecd81424fa6307787b1468acba))
* wait for initial load in benchmarks ([#390](https://github.com/nolanlawson/emoji-picker-element/issues/390)) ([8a4e4d6](https://github.com/nolanlawson/emoji-picker-element/commit/8a4e4d658686f24bd50b561dd755f2a64980593a))



## [1.20.1](https://github.com/nolanlawson/emoji-picker-element/compare/v1.20.0...v1.20.1) (2023-12-04)


### Bug Fixes

* use correct "red heart" in default favorites ([#385](https://github.com/nolanlawson/emoji-picker-element/issues/385)) ([baf2908](https://github.com/nolanlawson/emoji-picker-element/commit/baf29084c1031a01a2534f3ad4c72131a9a4497f))



# [1.20.0](https://github.com/nolanlawson/emoji-picker-element/compare/v1.19.2...v1.20.0) (2023-12-04)


### Features

* add support for emoji v15.1 ([#383](https://github.com/nolanlawson/emoji-picker-element/issues/383)) ([2bf5aff](https://github.com/nolanlawson/emoji-picker-element/commit/2bf5aff0104586557915c692932ec5e8b2389cd0))



## [1.19.2](https://github.com/nolanlawson/emoji-picker-element/compare/v1.19.1...v1.19.2) (2023-11-24)


### Bug Fixes

* avoid newer JS syntax to support old Safari ([#380](https://github.com/nolanlawson/emoji-picker-element/issues/380)) ([77e6e35](https://github.com/nolanlawson/emoji-picker-element/commit/77e6e35bd5e738e43e1f94b418e44228a3cb8c36))



## [1.19.1](https://github.com/nolanlawson/emoji-picker-element/compare/v1.19.0...v1.19.1) (2023-11-12)


### Bug Fixes

* fix sourcemap in svelte.js ([#377](https://github.com/nolanlawson/emoji-picker-element/issues/377)) ([140574e](https://github.com/nolanlawson/emoji-picker-element/commit/140574ed1897d08482a72362f8e15c217227461c))



# [1.19.0](https://github.com/nolanlawson/emoji-picker-element/compare/v1.18.4...v1.19.0) (2023-11-11)


### Features

* upgrade to svelte 4 ([#372](https://github.com/nolanlawson/emoji-picker-element/issues/372)) ([e5fde55](https://github.com/nolanlawson/emoji-picker-element/commit/e5fde551febf7209cf453d42efb975066525f396))



## [1.18.4](https://github.com/nolanlawson/emoji-picker-element/compare/v1.18.3...v1.18.4) (2023-10-08)


### Bug Fixes

* put annotation in title/aria-label ([#369](https://github.com/nolanlawson/emoji-picker-element/issues/369)) ([bd2004b](https://github.com/nolanlawson/emoji-picker-element/commit/bd2004b25d46554b6ecc46ea817f0233b1ec6bc5)), closes [#366](https://github.com/nolanlawson/emoji-picker-element/issues/366)



## [1.18.3](https://github.com/nolanlawson/emoji-picker-element/compare/v1.18.2...v1.18.3) (2023-06-30)


### Bug Fixes

* make "People and body" category work in Firefox content script ([#357](https://github.com/nolanlawson/emoji-picker-element/issues/357)) ([b829d4c](https://github.com/nolanlawson/emoji-picker-element/commit/b829d4c8ce546cbe9bef03fb35e4d8ffa412c9cf))


### Performance Improvements

* hoist global check ([#358](https://github.com/nolanlawson/emoji-picker-element/issues/358)) ([60eeb8e](https://github.com/nolanlawson/emoji-picker-element/commit/60eeb8ef17287d96298539343fb75b93f8580b17))



## [1.18.2](https://github.com/nolanlawson/emoji-picker-element/compare/v1.18.1...v1.18.2) (2023-06-18)

* Updated dependencies; this affects code comments in the `dist/` files and size of SVGs in docs page

## [1.18.1](https://github.com/nolanlawson/emoji-picker-element/compare/v1.18.0...v1.18.1) (2023-06-11)


### Bug Fixes

* simplify skintone listbox ([#336](https://github.com/nolanlawson/emoji-picker-element/issues/336)) ([7d9096b](https://github.com/nolanlawson/emoji-picker-element/commit/7d9096b06ca40ea9785fbfd782fe62317f68b5ab))



# [1.18.0](https://github.com/nolanlawson/emoji-picker-element/compare/v1.17.0...v1.18.0) (2023-06-11)


### Features

* add support for emoji v15 ([#333](https://github.com/nolanlawson/emoji-picker-element/issues/333)) ([c68ecf5](https://github.com/nolanlawson/emoji-picker-element/commit/c68ecf515b4e6f73674172f4e38ed9513d5f4169))



# [1.17.0](https://github.com/nolanlawson/emoji-picker-element/compare/v1.16.0...v1.17.0) (2023-04-18)


### Features

* added polish translation file ([#325](https://github.com/nolanlawson/emoji-picker-element/issues/325)) ([69b2f81](https://github.com/nolanlawson/emoji-picker-element/commit/69b2f81e551a74da52dc0030e2db8880cd4ff766))



# [1.16.0](https://github.com/nolanlawson/emoji-picker-element/compare/v1.15.1...v1.16.0) (2023-02-25)


### Features

* added Hindi & Indonesian text ([#322](https://github.com/nolanlawson/emoji-picker-element/issues/322)) ([db7021a](https://github.com/nolanlawson/emoji-picker-element/commit/db7021aaadb7d47aa8f148418aa9c228bf08b6ba))



## [1.15.1](https://github.com/nolanlawson/emoji-picker-element/compare/v1.15.0...v1.15.1) (2023-01-22)


### Bug Fixes

* preserve state if component disconnects then immediately reconnects ([#313](https://github.com/nolanlawson/emoji-picker-element/issues/313)) ([5a8fc19](https://github.com/nolanlawson/emoji-picker-element/commit/5a8fc19b961ffbd02aa58a9b8cb41e0034f5aeda)), closes [#312](https://github.com/nolanlawson/emoji-picker-element/issues/312)



# [1.15.0](https://github.com/nolanlawson/emoji-picker-element/compare/v1.14.1...v1.15.0) (2022-12-29)


### Features

* add support for custom emoji fonts ([#308](https://github.com/nolanlawson/emoji-picker-element/issues/308)) ([da524c2](https://github.com/nolanlawson/emoji-picker-element/commit/da524c240de84d790fa110306c211b2b2a9671a5)), closes [#82](https://github.com/nolanlawson/emoji-picker-element/issues/82)



## [1.14.1](https://github.com/nolanlawson/emoji-picker-element/compare/v1.14.0...v1.14.1) (2022-12-19)


### Bug Fixes

* remove unused code ([#301](https://github.com/nolanlawson/emoji-picker-element/issues/301)) ([5fafdbd](https://github.com/nolanlawson/emoji-picker-element/commit/5fafdbd8f7340801091c1760cd62608b55db8639))
* simpler solution to avoid svelte invalidations ([#303](https://github.com/nolanlawson/emoji-picker-element/issues/303)) ([4af86a8](https://github.com/nolanlawson/emoji-picker-element/commit/4af86a8b54afe46d85c7b2ab68dd3eb9c4b02735))



# [1.14.0](https://github.com/nolanlawson/emoji-picker-element/compare/v1.13.1...v1.14.0) (2022-11-25)


### Features

* add ru_RU locale ([#296](https://github.com/nolanlawson/emoji-picker-element/issues/296)) ([70946d9](https://github.com/nolanlawson/emoji-picker-element/commit/70946d95a22e017e6e9b3ba7ccd45ff3d924fa45))



## [1.13.1](https://github.com/nolanlawson/emoji-picker-element/compare/v1.13.0...v1.13.1) (2022-10-23)


### Bug Fixes

* used dark colors for scrollbar in dark mode ([#294](https://github.com/nolanlawson/emoji-picker-element/issues/294)) ([af959ae](https://github.com/nolanlawson/emoji-picker-element/commit/af959ae7fc1801f91b8291ea82009d9e7443cf44))



# [1.13.0](https://github.com/nolanlawson/emoji-picker-element/compare/v1.12.1...v1.13.0) (2022-10-17)


### Features

* add italian translation file ([#291](https://github.com/nolanlawson/emoji-picker-element/issues/291)) ([0607ac3](https://github.com/nolanlawson/emoji-picker-element/commit/0607ac39b5f8573704179ad367f038091a6b83a5))



## [1.12.1](https://github.com/nolanlawson/emoji-picker-element/compare/v1.12.0...v1.12.1) (2022-06-24)


### Bug Fixes

* rename zh-CN to match other intl files ([#288](https://github.com/nolanlawson/emoji-picker-element/issues/288)) ([27ef3fd](https://github.com/nolanlawson/emoji-picker-element/commit/27ef3fd4fdab112375a20d57e7da640e92b9fc7e))



# [1.12.0](https://github.com/nolanlawson/emoji-picker-element/compare/v1.11.3...v1.12.0) (2022-06-24)


### Features

* create zh-CN.js ([#284](https://github.com/nolanlawson/emoji-picker-element/issues/284)) ([01986b4](https://github.com/nolanlawson/emoji-picker-element/commit/01986b4740d22def4538016837ac0e6c9b8868bb))


### Performance Improvements

* trim unused svelte options ([#280](https://github.com/nolanlawson/emoji-picker-element/issues/280)) ([149cfa9](https://github.com/nolanlawson/emoji-picker-element/commit/149cfa94598fd6d21398bbfe9e3ef27d7cf42a38))



## [1.11.3](https://github.com/nolanlawson/emoji-picker-element/compare/v1.11.2...v1.11.3) (2022-04-16)


### Bug Fixes

* fix category with unsetting customEmoji ([#277](https://github.com/nolanlawson/emoji-picker-element/issues/277)) ([3601f79](https://github.com/nolanlawson/emoji-picker-element/commit/3601f79eafefccc481685d512b18f003d83f1814)), closes [#276](https://github.com/nolanlawson/emoji-picker-element/issues/276)



## [1.11.2](https://github.com/nolanlawson/emoji-picker-element/compare/v1.11.1...v1.11.2) (2022-04-08)


### Bug Fixes

* remove aria-owns ([#275](https://github.com/nolanlawson/emoji-picker-element/issues/275)) ([306ca06](https://github.com/nolanlawson/emoji-picker-element/commit/306ca067aa29e896bd16d06fb80578c426786642))



## [1.11.1](https://github.com/nolanlawson/emoji-picker-element/compare/v1.11.0...v1.11.1) (2022-03-20)


### Bug Fixes

* newer emoji and flags on Firefox on Windows ([#271](https://github.com/nolanlawson/emoji-picker-element/issues/271)) ([c45e3e9](https://github.com/nolanlawson/emoji-picker-element/commit/c45e3e9b4368d36716eaf325217b81c2c29905c5))



# [1.11.0](https://github.com/nolanlawson/emoji-picker-element/compare/v1.10.1...v1.11.0) (2022-03-12)


### Features

* added Dutch translation file ([#267](https://github.com/nolanlawson/emoji-picker-element/issues/267)) ([d7727a3](https://github.com/nolanlawson/emoji-picker-element/commit/d7727a3d2e5b8f3b88cc9327c7467c1b1d87a148))



## [1.10.1](https://github.com/nolanlawson/emoji-picker-element/compare/v1.10.0...v1.10.1) (2022-02-08)


### Bug Fixes

* customElements.define called twice ([#246](https://github.com/nolanlawson/emoji-picker-element/issues/246)) ([7588bd1](https://github.com/nolanlawson/emoji-picker-element/commit/7588bd1652af885cef470a80607fca58b33163da))



# [1.10.0](https://github.com/nolanlawson/emoji-picker-element/compare/v1.9.0...v1.10.0) (2021-12-21)


### Features

* update to emoji 14.0 ([#237](https://github.com/nolanlawson/emoji-picker-element/issues/237)) ([7b0f17a](https://github.com/nolanlawson/emoji-picker-element/commit/7b0f17aaf2f5652b04f02531ddd7184d03d5fe70))



# [1.9.0](https://github.com/nolanlawson/emoji-picker-element/compare/v1.8.2...v1.9.0) (2021-12-19)


### Features

* added ms_MY.js (Malaysian text) ([#234](https://github.com/nolanlawson/emoji-picker-element/issues/234)) ([f30160d](https://github.com/nolanlawson/emoji-picker-element/commit/f30160db6689fd31f924f78d430eb7ef40dd3f00))



## [1.8.2](https://github.com/nolanlawson/emoji-picker-element/compare/v1.8.1...v1.8.2) (2021-09-26)


### Bug Fixes

* fix db undefined when adding/removing element ([#227](https://github.com/nolanlawson/emoji-picker-element/issues/227)) ([fa24942](https://github.com/nolanlawson/emoji-picker-element/commit/fa2494223dbc241e18fab764f7ec1a659618d8a9)), closes [#225](https://github.com/nolanlawson/emoji-picker-element/issues/225)



## [1.8.1](https://github.com/nolanlawson/emoji-picker-element/compare/v1.8.0...v1.8.1) (2021-09-03)


### Bug Fixes

* respect the hidden attribute ([#221](https://github.com/nolanlawson/emoji-picker-element/issues/221)) ([b3a5138](https://github.com/nolanlawson/emoji-picker-element/commit/b3a51381194af1f9ec6031a0afb1af39b4444a6f))


### Performance Improvements

* use relaxed IDB transactions and manually commit ([#218](https://github.com/nolanlawson/emoji-picker-element/issues/218)) ([d732610](https://github.com/nolanlawson/emoji-picker-element/commit/d732610e7fede78df4e9bbc6ce964690d2fe4adf))



# [1.8.0](https://github.com/nolanlawson/emoji-picker-element/compare/v1.7.1...v1.8.0) (2021-08-18)


### Features

* add new translations ([#217](https://github.com/nolanlawson/emoji-picker-element/issues/217)) ([267c55b](https://github.com/nolanlawson/emoji-picker-element/commit/267c55b3fbb17f4e49fcb8c42839ddf74bf5f44b)), closes [#216](https://github.com/nolanlawson/emoji-picker-element/issues/216)



## [1.7.1](https://github.com/nolanlawson/emoji-picker-element/compare/v1.7.0...v1.7.1) (2021-08-14)


### Bug Fixes

* support RTL direction ([#213](https://github.com/nolanlawson/emoji-picker-element/issues/213)) ([7875925](https://github.com/nolanlawson/emoji-picker-element/commit/7875925be09d4a851edcea48c0f897d139398264)), closes [#212](https://github.com/nolanlawson/emoji-picker-element/issues/212)
* update favorites only on mount ([#210](https://github.com/nolanlawson/emoji-picker-element/issues/210)) ([567da73](https://github.com/nolanlawson/emoji-picker-element/commit/567da7316aa0aae29b3e853c99c0a4e73f94bb1d)), closes [#205](https://github.com/nolanlawson/emoji-picker-element/issues/205)


### Performance Improvements

* remove pixel-based indicator animation ([#211](https://github.com/nolanlawson/emoji-picker-element/issues/211)) ([468fd80](https://github.com/nolanlawson/emoji-picker-element/commit/468fd805b955413914e2ccd321927acbed795d8b))
* use IDBObjectStore.clear ([#208](https://github.com/nolanlawson/emoji-picker-element/issues/208)) ([ed0ffac](https://github.com/nolanlawson/emoji-picker-element/commit/ed0ffac1e12634f1e7a5cf40045853ffb1c77654))



# [1.7.0](https://github.com/nolanlawson/emoji-picker-element/compare/v1.6.7...v1.7.0) (2021-08-06)


### Bug Fixes

* actually publish i18n files ([#202](https://github.com/nolanlawson/emoji-picker-element/issues/202)) ([3fd2eae](https://github.com/nolanlawson/emoji-picker-element/commit/3fd2eaef2a3404c513175b57654efd86b607e934))


### Features

* add built-in translations ([#200](https://github.com/nolanlawson/emoji-picker-element/issues/200)) ([96d0d1d](https://github.com/nolanlawson/emoji-picker-element/commit/96d0d1d171aa95519be36e763a1708c9ff9e2431))
* create pt_PT.js ([#188](https://github.com/nolanlawson/emoji-picker-element/issues/188)) ([69541a3](https://github.com/nolanlawson/emoji-picker-element/commit/69541a3957f2f03517066925138edf2cc9a2a3b0))



## [1.6.7](https://github.com/nolanlawson/emoji-picker-element/compare/v1.6.6...v1.6.7) (2021-08-02)


### Bug Fixes

* use Object.prototype.hasOwnProperty ([#198](https://github.com/nolanlawson/emoji-picker-element/issues/198)) ([b8302b2](https://github.com/nolanlawson/emoji-picker-element/commit/b8302b215bbecd8e4f1aeb5e9095c5e672b9ede2))



## [1.6.6](https://github.com/nolanlawson/emoji-picker-element/compare/v1.6.5...v1.6.6) (2021-07-27)


### Bug Fixes

* fix setting props before element upgrade ([#194](https://github.com/nolanlawson/emoji-picker-element/issues/194)) ([8e7b5d5](https://github.com/nolanlawson/emoji-picker-element/commit/8e7b5d5aab55788f07cc894e8e72489b13bdfc1f)), closes [#190](https://github.com/nolanlawson/emoji-picker-element/issues/190)



## [1.6.5](https://github.com/nolanlawson/emoji-picker-element/compare/v1.6.4...v1.6.5) (2021-07-25)


### Bug Fixes

* fix types for event listeners, remove typedoc ([#193](https://github.com/nolanlawson/emoji-picker-element/issues/193)) ([8c7bbc7](https://github.com/nolanlawson/emoji-picker-element/commit/8c7bbc7a89e8eca0254676aa56ee5202788cb39e)), closes [#191](https://github.com/nolanlawson/emoji-picker-element/issues/191)
* remove Svelte assignment invalidation ([#182](https://github.com/nolanlawson/emoji-picker-element/issues/182)) ([ed63bed](https://github.com/nolanlawson/emoji-picker-element/commit/ed63bedd617bdbf5301804977756be480956f326))



## [1.6.4](https://github.com/nolanlawson/emoji-picker-element/compare/v1.6.3...v1.6.4) (2021-07-11)


### Bug Fixes

* fix tabPanel scrollTop bug ([#180](https://github.com/nolanlawson/emoji-picker-element/issues/180)) ([0554821](https://github.com/nolanlawson/emoji-picker-element/commit/05548210a4fc54f3662c99aa9b7dc2e44a177d50))



## [1.6.3](https://github.com/nolanlawson/emoji-picker-element/compare/v1.6.2...v1.6.3) (2021-07-11)


### Bug Fixes

* make database read-only ([#174](https://github.com/nolanlawson/emoji-picker-element/issues/174)) ([ede65df](https://github.com/nolanlawson/emoji-picker-element/commit/ede65df9f330b3c7622bb754803f08e3f4ebed4c))
* render custom category if only one exists ([#173](https://github.com/nolanlawson/emoji-picker-element/issues/173)) ([7a2e2c1](https://github.com/nolanlawson/emoji-picker-element/commit/7a2e2c141ad29b5aac4ccd6362e25ce2378a38e7)), closes [#172](https://github.com/nolanlawson/emoji-picker-element/issues/172)
* use our own custom element implementation ([#170](https://github.com/nolanlawson/emoji-picker-element/issues/170)) ([d63c1f8](https://github.com/nolanlawson/emoji-picker-element/commit/d63c1f8c0b0af93bc309c392be91a9d45d4a240b)), closes [#176](https://github.com/nolanlawson/emoji-picker-element/issues/176)



## [1.6.2](https://github.com/nolanlawson/emoji-picker-element/compare/v1.6.1...v1.6.2) (2021-07-07)


### Bug Fixes

* esc key dismisses listbox ([#169](https://github.com/nolanlawson/emoji-picker-element/issues/169)) ([13e6c12](https://github.com/nolanlawson/emoji-picker-element/commit/13e6c128d4931d7ea1d09ad635b13729c1b8852e)), closes [#168](https://github.com/nolanlawson/emoji-picker-element/issues/168)



## [1.6.1](https://github.com/nolanlawson/emoji-picker-element/compare/v1.6.0...v1.6.1) (2021-07-03)


### Performance Improvements

* determine emoji support in reverse order ([#160](https://github.com/nolanlawson/emoji-picker-element/issues/160)) ([2603055](https://github.com/nolanlawson/emoji-picker-element/commit/2603055d1a9983fdaf3217ea753c3e77485e7638))



# [1.6.0](https://github.com/nolanlawson/emoji-picker-element/compare/v1.5.0...v1.6.0) (2021-06-29)


### Bug Fixes

* update svelte to 3.37.0 ([#152](https://github.com/nolanlawson/emoji-picker-element/pull/152)) ([50ac48d](https://github.com/nolanlawson/emoji-picker-element/commit/50ac48d4c8133c71ba94ed2c0f2daa964b34092c)), closes [#149](https://github.com/nolanlawson/emoji-picker-element/issues/149) and [#116](https://github.com/nolanlawson/emoji-picker-element/issues/116)
* fix rollup compiler warning ([#154](https://github.com/nolanlawson/emoji-picker-element/issues/154)) ([f5e9dcb](https://github.com/nolanlawson/emoji-picker-element/commit/f5e9dcbfe3c5a17250f190ba987954eb12e2d57c))
* remove unused code ([#148](https://github.com/nolanlawson/emoji-picker-element/issues/148)) ([304a18d](https://github.com/nolanlawson/emoji-picker-element/commit/304a18d2f769c1aeadb1792432a3ae1c5502f808))


### Features

* add custom-elements.json ([#142](https://github.com/nolanlawson/emoji-picker-element/issues/142)) ([fd3e0f3](https://github.com/nolanlawson/emoji-picker-element/commit/fd3e0f3dfbef7a2f48decf7716ed151b5194354a)), closes [#31](https://github.com/nolanlawson/emoji-picker-element/issues/31)


### Performance Improvements

* reduce bundle size ([#155](https://github.com/nolanlawson/emoji-picker-element/issues/155)) ([2f05ce7](https://github.com/nolanlawson/emoji-picker-element/commit/2f05ce790dbe5873c33559616421efb181fec4c8))



# [1.5.0](https://github.com/nolanlawson/emoji-picker-element/compare/v1.4.0...v1.5.0) (2021-05-31)


### Bug Fixes

* guess latest emoji version on canvas error ([#138](https://github.com/nolanlawson/emoji-picker-element/issues/138)) ([599a8dd](https://github.com/nolanlawson/emoji-picker-element/commit/599a8ddaaf0d64f0d1964319199509ad324dc970)), closes [#132](https://github.com/nolanlawson/emoji-picker-element/issues/132)
* simplify emoji color check algorithm ([#139](https://github.com/nolanlawson/emoji-picker-element/issues/139)) ([ff6865c](https://github.com/nolanlawson/emoji-picker-element/commit/ff6865ce859669e1a1510daf377f9be67d140b8c))


### Features

* allow styling category emoji separately ([#137](https://github.com/nolanlawson/emoji-picker-element/issues/137)) ([1b5ab86](https://github.com/nolanlawson/emoji-picker-element/commit/1b5ab86baf6d854fe3b5a52fa570b7688b9763be)), closes [#133](https://github.com/nolanlawson/emoji-picker-element/issues/133)



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
