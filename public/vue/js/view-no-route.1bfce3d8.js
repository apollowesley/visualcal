(window["webpackJsonp"]=window["webpackJsonp"]||[]).push([["view-no-route"],{"4b85":function(t,a,r){},a523:function(t,a,r){"use strict";r("99af"),r("4de4"),r("b64b"),r("2ca0"),r("20f6"),r("4b85"),r("a15b"),r("498a");var e=r("2b0e");function n(t){return e["a"].extend({name:"v-".concat(t),functional:!0,props:{id:String,tag:{type:String,default:"div"}},render:function(a,r){var e=r.props,n=r.data,i=r.children;n.staticClass="".concat(t," ").concat(n.staticClass||"").trim();var o=n.attrs;if(o){n.attrs={};var s=Object.keys(o).filter((function(t){if("slot"===t)return!1;var a=o[t];return t.startsWith("data-")?(n.attrs[t]=a,!1):a||"string"===typeof a}));s.length&&(n.staticClass+=" ".concat(s.join(" ")))}return e.id&&(n.domProps=n.domProps||{},n.domProps.id=e.id),a(e.tag,n,i)}})}var i=r("d9f7");a["a"]=n("container").extend({name:"v-container",functional:!0,props:{id:String,tag:{type:String,default:"div"},fluid:{type:Boolean,default:!1}},render:function(t,a){var r,e=a.props,n=a.data,o=a.children,s=n.attrs;return s&&(n.attrs={},r=Object.keys(s).filter((function(t){if("slot"===t)return!1;var a=s[t];return t.startsWith("data-")?(n.attrs[t]=a,!1):a||"string"===typeof a}))),e.id&&(n.domProps=n.domProps||{},n.domProps.id=e.id),t(e.tag,Object(i["a"])(n,{staticClass:"container",class:Array({"container--fluid":e.fluid}).concat(r||[])}),o)}})},eae9:function(t,a,r){"use strict";r.r(a);var e=function(){var t=this,a=t.$createElement,r=t._self._c||a;return r("v-container",[t._v(" You're here because the page you requested doesn't exist ")])},n=[],i=r("d4ec"),o=r("262e"),s=r("2caf"),c=r("9ab4"),u=r("60a3"),d=function(t){Object(o["a"])(r,t);var a=Object(s["a"])(r);function r(){return Object(i["a"])(this,r),a.apply(this,arguments)}return r}(u["c"]);d=Object(c["a"])([u["a"]],d);var f=d,l=f,p=r("2877"),v=r("6544"),b=r.n(v),g=r("a523"),h=Object(p["a"])(l,e,n,!1,null,null,null);a["default"]=h.exports;b()(h,{VContainer:g["a"]})}}]);
//# sourceMappingURL=view-no-route.1bfce3d8.js.map