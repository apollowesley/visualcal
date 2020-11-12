(window["webpackJsonp"]=window["webpackJsonp"]||[]).push([["view-session"],{"041c":function(e,t,n){"use strict";n("e439"),n("96cf");var r=n("c973"),i=n("970b"),o=n("5bc3"),c=n("ed6d"),a=n("2d0d"),s=n("7037"),u=this&&this.__decorate||function(e,t,n,r){var i,o=arguments.length,c=o<3?t:null===r?r=Object.getOwnPropertyDescriptor(t,n):r;if("object"===("undefined"===typeof Reflect?"undefined":s(Reflect))&&"function"===typeof Reflect.decorate)c=Reflect.decorate(e,t,n,r);else for(var a=e.length-1;a>=0;a--)(i=e[a])&&(c=(o<3?i(c):o>3?i(t,n,c):i(t,n))||c);return o>3&&c&&Object.defineProperty(t,n,c),c},l=this&&this.__importDefault||function(e){return e&&e.__esModule?e:{default:e}};Object.defineProperty(t,"__esModule",{value:!0});var f=n("60a3"),d=l(n("13f7")),v=l(n("29ec")),h=l(n("5f3d")),p=function(e){c(n,e);var t=a(n);function n(){return i(this,n),t.apply(this,arguments)}return o(n,[{key:"mounted",value:function(){var e=r(regeneratorRuntime.mark((function e(){return regeneratorRuntime.wrap((function(e){while(1)switch(e.prev=e.next){case 0:return e.next=2,this.$store.direct.dispatch.refreshSessionViewInfo();case 2:case"end":return e.stop()}}),e,this)})));function t(){return e.apply(this,arguments)}return t}()}]),n}(f.Vue);p=u([f.Component({components:{SessionCommunicationComponent:d.default,SessionProcedureComponent:v.default,SessionResultsComponent:h.default}})],p),t.default=p},"066d":function(e,t,n){"use strict";n("e439");var r=n("970b"),i=n("5bc3"),o=n("ed6d"),c=n("2d0d"),a=n("7037"),s=this&&this.__decorate||function(e,t,n,r){var i,o=arguments.length,c=o<3?t:null===r?r=Object.getOwnPropertyDescriptor(t,n):r;if("object"===("undefined"===typeof Reflect?"undefined":a(Reflect))&&"function"===typeof Reflect.decorate)c=Reflect.decorate(e,t,n,r);else for(var s=e.length-1;s>=0;s--)(i=e[s])&&(c=(o<3?i(c):o>3?i(t,n,c):i(t,n))||c);return o>3&&c&&Object.defineProperty(t,n,c),c},u=this&&this.__importDefault||function(e){return e&&e.__esModule?e:{default:e}};Object.defineProperty(t,"__esModule",{value:!0});var l=n("60a3"),f=u(n("e325")),d=function(e){o(n,e);var t=c(n);function n(){return r(this,n),t.apply(this,arguments)}return i(n,[{key:"mounted",value:function(){this.fResultsTable=new f.default(this.$refs.resultsTable,{layout:"fitColumns",columns:[{title:"Run name"}]})}}]),n}(l.Vue);d=s([l.Component],d),t.default=d},"13f7":function(e,t,n){"use strict";n.r(t);var r=n("294c"),i=n("60d7");for(var o in i)["default"].indexOf(o)<0&&function(e){n.d(t,e,(function(){return i[e]}))}(o);var c=n("2877"),a=n("6544"),s=n.n(a),u=n("62ad"),l=n("a523"),f=n("0fd9"),d=Object(c["a"])(i["default"],r["a"],r["b"],!1,null,null,null);t["default"]=d.exports,s()(d,{VCol:u["a"],VContainer:l["a"],VRow:f["a"]})},"158d":function(e,t,n){"use strict";n.r(t);var r=n("066d"),i=n.n(r);for(var o in r)["default"].indexOf(o)<0&&function(e){n.d(t,e,(function(){return r[e]}))}(o);t["default"]=i.a},"294c":function(e,t,n){"use strict";n.d(t,"a",(function(){return r})),n.d(t,"b",(function(){return i}));var r=function(){var e=this,t=e.$createElement,n=e._self._c||t;return n("v-container",{attrs:{fluid:""}},[n("v-row",{attrs:{"no-gutters":""}},[n("v-col",[n("div",{ref:"driversTable"})])],1)],1)},i=[]},"29ec":function(e,t,n){"use strict";n.r(t);var r=function(){var e=this,t=e.$createElement,n=e._self._c||t;return n("v-container",{staticClass:"pt-0 pb-0",attrs:{fluid:""}},[n("v-row",[n("v-col",{attrs:{cols:"3"}},[n("v-select",{attrs:{items:e.sections,label:"Section","item-text":"name","return-object":"",required:""},model:{value:e.selectedSection,callback:function(t){e.selectedSection=t},expression:"selectedSection"}})],1),n("v-col",{attrs:{cols:"3"}},[n("v-select",{attrs:{items:e.actions,label:"Action","item-text":"name","return-object":"",required:""},model:{value:e.selectedAction,callback:function(t){e.selectedAction=t},expression:"selectedAction"}})],1),n("v-col",{attrs:{cols:"3"}},[n("v-text-field",{attrs:{label:"Run name",hint:"You can name this run or leave it blank.  It will default to ISO date/time.","persistent-hint":""},model:{value:e.fRunName,callback:function(t){e.fRunName=t},expression:"fRunName"}})],1),n("v-col",[n("v-btn",{attrs:{disabled:e.canRunAction,label:"Action"},on:{click:function(t){return t.preventDefault(),e.onStartStopSelectedAction(t)}}},[e._v(" Start ")])],1)],1)],1)},i=[],o=n("d4ec"),c=n("bee2"),a=n("262e"),s=n("2caf"),u=n("9ab4"),l=n("60a3"),f=function(e){Object(a["a"])(n,e);var t=Object(s["a"])(n);function n(){var e;return Object(o["a"])(this,n),e=t.apply(this,arguments),e.fRunName="",e}return Object(c["a"])(n,[{key:"onStartStopSelectedAction",value:function(){alert("I'm running!")}},{key:"sessionViewInfo",get:function(){return this.$store.direct.state.sessionViewInfo}},{key:"procedure",get:function(){return this.sessionViewInfo?this.sessionViewInfo.procedure:null}},{key:"selectedSection",get:function(){return this.$store.direct.state.selectedSection},set:function(e){this.$store.direct.commit.setSelectedSection(e),!e||e.actions.length<=0||(this.selectedAction=e.actions[0])}},{key:"selectedAction",get:function(){return this.$store.direct.state.selectedAction},set:function(e){this.$store.direct.commit.setSelectedAction(e)}},{key:"sections",get:function(){return this.procedure?this.procedure.sections:[]}},{key:"actions",get:function(){return this.selectedSection?this.selectedSection.actions:[]}},{key:"canRunAction",get:function(){return this.procedure&&this.procedure.sections.length<=0}}]),n}(l["Vue"]);f=Object(u["a"])([l["Component"]],f);var d=f,v=d,h=n("2877"),p=n("6544"),m=n.n(p),b=n("8336"),y=n("62ad"),g=n("a523"),_=n("0fd9"),w=n("b974"),S=n("8654"),C=Object(h["a"])(v,r,i,!1,null,null,null);t["default"]=C.exports;m()(C,{VBtn:b["a"],VCol:y["a"],VContainer:g["a"],VRow:_["a"],VSelect:w["a"],VTextField:S["a"]})},"36ea":function(e,t,n){"use strict";n.d(t,"a",(function(){return r})),n.d(t,"b",(function(){return i}));var r=function(){var e=this,t=e.$createElement,n=e._self._c||t;return n("v-container",{attrs:{fluid:""}},[n("v-row",{attrs:{"no-gutters":""}},[n("v-col",[n("div",{ref:"resultsTable"})])],1)],1)},i=[]},"5f3d":function(e,t,n){"use strict";n.r(t);var r=n("36ea"),i=n("158d");for(var o in i)["default"].indexOf(o)<0&&function(e){n.d(t,e,(function(){return i[e]}))}(o);var c=n("2877"),a=n("6544"),s=n.n(a),u=n("62ad"),l=n("a523"),f=n("0fd9"),d=Object(c["a"])(i["default"],r["a"],r["b"],!1,null,null,null);t["default"]=d.exports,s()(d,{VCol:u["a"],VContainer:l["a"],VRow:f["a"]})},"60d7":function(e,t,n){"use strict";n.r(t);var r=n("f062"),i=n.n(r);for(var o in r)["default"].indexOf(o)<0&&function(e){n.d(t,e,(function(){return r[e]}))}(o);t["default"]=i.a},"6f20":function(e,t,n){"use strict";n.r(t);var r=n("041c"),i=n.n(r);for(var o in r)["default"].indexOf(o)<0&&function(e){n.d(t,e,(function(){return r[e]}))}(o);t["default"]=i.a},"78b4":function(e,t,n){"use strict";n.r(t);var r=n("a123"),i=n("6f20");for(var o in i)["default"].indexOf(o)<0&&function(e){n.d(t,e,(function(){return i[e]}))}(o);var c=n("2877"),a=n("6544"),s=n.n(a),u=n("b0af"),l=n("99d9"),f=n("62ad"),d=n("a523"),v=n("0fd9"),h=Object(c["a"])(i["default"],r["a"],r["b"],!1,null,null,null);t["default"]=h.exports,s()(h,{VCard:u["a"],VCardTitle:l["c"],VCol:f["a"],VContainer:d["a"],VRow:v["a"]})},a123:function(e,t,n){"use strict";n.d(t,"a",(function(){return r})),n.d(t,"b",(function(){return i}));var r=function(){var e=this,t=e.$createElement,n=e._self._c||t;return n("v-container",{staticClass:"pl-7 pr-7",attrs:{fluid:""}},[n("v-row",{attrs:{align:"start",justify:"center","no-gutters":""}},[n("v-col",[n("v-row",[n("v-col",{attrs:{cols:"6"}},[n("v-card",{attrs:{height:"100%"}},[n("v-card-title",{attrs:{"primary-title":""}},[e._v("Communication")]),n("SessionCommunicationComponent")],1)],1),n("v-col",{attrs:{cols:"6"}},[n("v-card",{attrs:{height:"100%"}},[n("v-card-title",{attrs:{"primary-title":""}},[e._v("Troubleshooting")]),n("SessionProcedureComponent")],1)],1)],1),n("v-row",[n("v-col",{attrs:{cols:"12"}},[n("v-card",{attrs:{height:"100%"}},[n("v-card-title",{attrs:{"primary-title":""}},[e._v("Procedure")]),n("SessionProcedureComponent")],1)],1)],1),n("v-row",[n("v-col",{attrs:{cols:"12"}},[n("v-card",{attrs:{height:"100%"}},[n("v-card-title",{attrs:{"primary-title":""}},[e._v("Results")]),n("SessionResultsComponent")],1)],1)],1)],1)],1)],1)},i=[]},c973:function(e,t,n){function r(e,t,n,r,i,o,c){try{var a=e[o](c),s=a.value}catch(u){return void n(u)}a.done?t(s):Promise.resolve(s).then(r,i)}function i(e){return function(){var t=this,n=arguments;return new Promise((function(i,o){var c=e.apply(t,n);function a(e){r(c,i,o,a,s,"next",e)}function s(e){r(c,i,o,a,s,"throw",e)}a(void 0)}))}}n("d3b7"),e.exports=i},f062:function(e,t,n){"use strict";n("e439");var r=n("970b"),i=n("5bc3"),o=n("ed6d"),c=n("2d0d"),a=n("7037"),s=this&&this.__decorate||function(e,t,n,r){var i,o=arguments.length,c=o<3?t:null===r?r=Object.getOwnPropertyDescriptor(t,n):r;if("object"===("undefined"===typeof Reflect?"undefined":a(Reflect))&&"function"===typeof Reflect.decorate)c=Reflect.decorate(e,t,n,r);else for(var s=e.length-1;s>=0;s--)(i=e[s])&&(c=(o<3?i(c):o>3?i(t,n,c):i(t,n))||c);return o>3&&c&&Object.defineProperty(t,n,c),c},u=this&&this.__importDefault||function(e){return e&&e.__esModule?e:{default:e}};Object.defineProperty(t,"__esModule",{value:!0});var l=n("60a3"),f=u(n("e325")),d=function(e){o(n,e);var t=c(n);function n(){return r(this,n),t.apply(this,arguments)}return i(n,[{key:"mounted",value:function(){this.fDriversTable=new f.default(this.$refs.driversTable,{layout:"fitColumns",columns:[{title:"Instrument Name"},{title:"Instrument Driver"},{title:"Interface Name"},{title:"GPIB Address (if required)"}]}),this.activeSession}},{key:"user",get:function(){return this.$store.direct.getters.user}},{key:"activeSession",get:function(){return this.$store.direct.getters.activeSession}},{key:"activeBenchConfig",get:function(){return this.$store.direct.getters.activeBenchConfig}}]),n}(l.Vue);d=s([l.Component],d),t.default=d}}]);
//# sourceMappingURL=view-session.fa388d5f.js.map