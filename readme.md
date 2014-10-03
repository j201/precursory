#precursory

Make cursors for React from any data structure

---

##Rationale

A few implementations have been made for JS cursors in React, for example, [Cortex](https://github.com/mquan/cortex) and [react-cursor](https://github.com/dustingetz/react-cursor). (Quick summary: ClojureScript's Om introduced cursors, which allow you to scope a part of a UI to a part of your app's state while applying state updates to the entire state. They allow you to keep state centralized and easy to manage without having to deal with extremely nested manipulations.) However, they deal with native JS objects, which limits your choice of how you want to represent application state. For example, if you want to use [mori](http://swannodette.github.io/mori/) structures, you're out of luck. So this library lets you construct a cursor implementation given a couple of simple functions you provide for your data structure of choice.

(I feel like I might be slowly recreating a crappy version of [lenses](https://github.com/ekmett/lens), but at least mere mortals can use this library.)

##Usage


