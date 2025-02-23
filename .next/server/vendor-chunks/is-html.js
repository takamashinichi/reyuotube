"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
exports.id = "vendor-chunks/is-html";
exports.ids = ["vendor-chunks/is-html"];
exports.modules = {

/***/ "(rsc)/./node_modules/is-html/index.js":
/*!***************************************!*\
  !*** ./node_modules/is-html/index.js ***!
  \***************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

eval("\nconst htmlTags = __webpack_require__(/*! html-tags */ \"(rsc)/./node_modules/html-tags/index.js\");\n\nconst basic = /\\s?<!doctype html>|(<html\\b[^>]*>|<body\\b[^>]*>|<x-[^>]+>)+/i;\nconst full = new RegExp(htmlTags.map(tag => `<${tag}\\\\b[^>]*>`).join('|'), 'i');\n\nmodule.exports = string => basic.test(string) || full.test(string);\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9ub2RlX21vZHVsZXMvaXMtaHRtbC9pbmRleC5qcyIsIm1hcHBpbmdzIjoiQUFBYTtBQUNiLGlCQUFpQixtQkFBTyxDQUFDLDBEQUFXOztBQUVwQztBQUNBLGdEQUFnRCxJQUFJOztBQUVwRCIsInNvdXJjZXMiOlsid2VicGFjazovL3JleW91dHViZS8uL25vZGVfbW9kdWxlcy9pcy1odG1sL2luZGV4LmpzP2Q5YjciXSwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBzdHJpY3QnO1xuY29uc3QgaHRtbFRhZ3MgPSByZXF1aXJlKCdodG1sLXRhZ3MnKTtcblxuY29uc3QgYmFzaWMgPSAvXFxzPzwhZG9jdHlwZSBodG1sPnwoPGh0bWxcXGJbXj5dKj58PGJvZHlcXGJbXj5dKj58PHgtW14+XSs+KSsvaTtcbmNvbnN0IGZ1bGwgPSBuZXcgUmVnRXhwKGh0bWxUYWdzLm1hcCh0YWcgPT4gYDwke3RhZ31cXFxcYltePl0qPmApLmpvaW4oJ3wnKSwgJ2knKTtcblxubW9kdWxlLmV4cG9ydHMgPSBzdHJpbmcgPT4gYmFzaWMudGVzdChzdHJpbmcpIHx8IGZ1bGwudGVzdChzdHJpbmcpO1xuIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(rsc)/./node_modules/is-html/index.js\n");

/***/ })

};
;