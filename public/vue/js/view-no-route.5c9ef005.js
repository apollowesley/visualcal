(window["webpackJsonp"]=window["webpackJsonp"]||[]).push([["view-no-route"],{"4b85":function(t,a,e){},a523:function(t,a,e){"use strict";e("99af"),e("4de4"),e("b64b"),e("2ca0"),e("20f6"),e("4b85"),e("a15b"),e("498a");var n=e("2b0e");function r(t){return n["a"].extend({name:"v-".concat(t),functional:!0,props:{id:String,tag:{type:String,default:"div"}},render:function(a,e){var n=e.props,r=e.data,i=e.children;r.staticClass="".concat(t," ").concat(r.staticClass||"").trim();var o=r.attrs;if(o){r.attrs={};var s=Object.keys(o).filter((function(t){if("slot"===t)return!1;var a=o[t];return t.startsWith("data-")?(r.attrs[t]=a,!1):a||"string"===typeof a}));s.length&&(r.staticClass+=" ".concat(s.join(" ")))}return n.id&&(r.domProps=r.domProps||{},r.domProps.id=n.id),a(n.tag,r,i)}})}var i=e("d9f7");a["a"]=r("container").extend({name:"v-container",functional:!0,props:{id:String,tag:{type:String,default:"div"},fluid:{type:Boolean,default:!1}},render:function(t,a){var e,n=a.props,r=a.data,o=a.children,s=r.attrs;return s&&(r.attrs={},e=Object.keys(s).filter((function(t){if("slot"===t)return!1;var a=s[t];return t.startsWith("data-")?(r.attrs[t]=a,!1):a||"string"===typeof a}))),n.id&&(r.domProps=r.domProps||{},r.domProps.id=n.id),t(n.tag,Object(i["a"])(r,{staticClass:"container",class:Array({"container--fluid":n.fluid}).concat(e||[])}),o)}})},eae9:function(t,a,e){"use strict";e.r(a);var n=function(){var t=this,a=t.$createElement,e=t._self._c||a;return e("v-container",[t._v(" You're here because the page you requested doesn't exist ")])},r=[],i=e("d4ec"),o=e("262e"),s=e("2caf"),c=e("9ab4"),u=e("60a3"),d=function(t){Object(o["a"])(e,t);var a=Object(s["a"])(e);function e(){return Object(i["a"])(this,e),a.apply(this,arguments)}return e}(u["Vue"]);d=Object(c["a"])([u["Component"]],d);var f=d,l=f,p=e("2877"),v=e("6544"),b=e.n(v),g=e("a523"),h=Object(p["a"])(l,n,r,!1,null,null,null);a["default"]=h.exports;b()(h,{VContainer:g["a"]})}}]);
//# sourceMappingURL=view-no-route.5c9ef005.js.map