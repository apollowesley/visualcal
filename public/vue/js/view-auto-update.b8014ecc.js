(window["webpackJsonp"]=window["webpackJsonp"]||[]).push([["view-auto-update"],{"08ec":function(e,t,r){"use strict";var a=r("f845"),n=r.n(a);n.a},"5b49":function(e,t,r){"use strict";r.r(t);var a=function(){var e=this,t=e.$createElement,r=e._self._c||t;return r("v-container",{staticClass:"grey",staticStyle:{height:"100vh"},attrs:{fluid:""}},[r("v-row",[r("v-col",[r("v-row",[r("v-col",[e.updateNotAvailable?e._e():r("h1",{staticClass:"text-center"},[e._v(e._s(e.updateInfo?"An update for VisualCal is available":"Checking for updates"))]),e.updateNotAvailable?r("h1",{staticClass:"text-center"},[e._v("No update is available")]):e._e()])],1),e.updateInfo?r("v-row",{staticClass:"text-center",attrs:{"no-gutters":""}},[r("v-col")],1):e._e(),r("v-row",{staticClass:"text-center",attrs:{"no-gutters":""}},[r("v-col",[e.progress?r("h3",[e._v("Downloading update")]):e._e()])],1),e.progress?r("v-row",{staticClass:"text-center",attrs:{"no-gutters":""}},[r("v-col",[r("v-progress-linear",{attrs:{value:e.progress?e.progress.percent:75,height:"45px"}})],1)],1):e._e()],1)],1)],1)},n=[],i=(r("96cf"),r("1da1")),s=r("d4ec"),o=r("bee2"),c=r("262e"),l=r("2caf"),u=r("9ab4"),d=r("60a3"),h=function(e){Object(c["a"])(r,e);var t=Object(l["a"])(r);function r(){var e;return Object(s["a"])(this,r),e=t.apply(this,arguments),e.updateInfo=null,e.progress=null,e.updateError=null,e.startedCheckingForUpdates=!1,e.updateNotAvailable=!1,e}return Object(o["a"])(r,[{key:"mounted",value:function(){var e=Object(i["a"])(regeneratorRuntime.mark((function e(){var t=this;return regeneratorRuntime.wrap((function(e){while(1)switch(e.prev=e.next){case 0:window.ipc.on("error",(function(e){return t.updateError=e})),window.ipc.once("checkingForUpdatesStarted",(function(){return t.startedCheckingForUpdates=!0})),window.ipc.once("updateAvailable",(function(e){t.updateInfo=e,window.ipc.on("downloadProgressChanged",(function(e){return t.updateProgress(e)}))})),window.ipc.once("updateNotAvailable",(function(){return t.updateNotAvailable=!0})),window.ipc.once("updateDownloaded",(function(){return window.ipc.removeAllListeners("downloadProgressChanged")})),window.ipc.listenForAutoUpdateEvents();case 6:case"end":return e.stop()}}),e)})));function t(){return e.apply(this,arguments)}return t}()},{key:"updateProgress",value:function(e){this.progress=e}},{key:"beforeDestroy",value:function(){window.ipc.removeAutoUpdateEventListeners()}}]),r}(d["Vue"]);h=Object(u["a"])([d["Component"]],h);var p=h,v=p,f=(r("08ec"),r("2877")),g=r("6544"),m=r.n(g),b=r("62ad"),_=r("a523"),w=r("8e36"),y=r("0fd9"),C=Object(f["a"])(v,a,n,!1,null,null,null);t["default"]=C.exports;m()(C,{VCol:b["a"],VContainer:_["a"],VProgressLinear:w["a"],VRow:y["a"]})},"6ece":function(e,t,r){},"8e36":function(e,t,r){"use strict";r("a9e3"),r("c7cd");var a=r("5530"),n=r("ade3"),i=(r("6ece"),r("0789")),s=r("a9ad"),o=r("fe6c"),c=r("a452"),l=r("7560"),u=r("80d2"),d=r("58df"),h=Object(d["a"])(s["a"],Object(o["b"])(["absolute","fixed","top","bottom"]),c["a"],l["a"]);t["a"]=h.extend({name:"v-progress-linear",props:{active:{type:Boolean,default:!0},backgroundColor:{type:String,default:null},backgroundOpacity:{type:[Number,String],default:null},bufferValue:{type:[Number,String],default:100},color:{type:String,default:"primary"},height:{type:[Number,String],default:4},indeterminate:Boolean,query:Boolean,reverse:Boolean,rounded:Boolean,stream:Boolean,striped:Boolean,value:{type:[Number,String],default:0}},data:function(){return{internalLazyValue:this.value||0}},computed:{__cachedBackground:function(){return this.$createElement("div",this.setBackgroundColor(this.backgroundColor||this.color,{staticClass:"v-progress-linear__background",style:this.backgroundStyle}))},__cachedBar:function(){return this.$createElement(this.computedTransition,[this.__cachedBarType])},__cachedBarType:function(){return this.indeterminate?this.__cachedIndeterminate:this.__cachedDeterminate},__cachedBuffer:function(){return this.$createElement("div",{staticClass:"v-progress-linear__buffer",style:this.styles})},__cachedDeterminate:function(){return this.$createElement("div",this.setBackgroundColor(this.color,{staticClass:"v-progress-linear__determinate",style:{width:Object(u["g"])(this.normalizedValue,"%")}}))},__cachedIndeterminate:function(){return this.$createElement("div",{staticClass:"v-progress-linear__indeterminate",class:{"v-progress-linear__indeterminate--active":this.active}},[this.genProgressBar("long"),this.genProgressBar("short")])},__cachedStream:function(){return this.stream?this.$createElement("div",this.setTextColor(this.color,{staticClass:"v-progress-linear__stream",style:{width:Object(u["g"])(100-this.normalizedBuffer,"%")}})):null},backgroundStyle:function(){var e,t=null==this.backgroundOpacity?this.backgroundColor?1:.3:parseFloat(this.backgroundOpacity);return e={opacity:t},Object(n["a"])(e,this.isReversed?"right":"left",Object(u["g"])(this.normalizedValue,"%")),Object(n["a"])(e,"width",Object(u["g"])(this.normalizedBuffer-this.normalizedValue,"%")),e},classes:function(){return Object(a["a"])({"v-progress-linear--absolute":this.absolute,"v-progress-linear--fixed":this.fixed,"v-progress-linear--query":this.query,"v-progress-linear--reactive":this.reactive,"v-progress-linear--reverse":this.isReversed,"v-progress-linear--rounded":this.rounded,"v-progress-linear--striped":this.striped},this.themeClasses)},computedTransition:function(){return this.indeterminate?i["d"]:i["e"]},isReversed:function(){return this.$vuetify.rtl!==this.reverse},normalizedBuffer:function(){return this.normalize(this.bufferValue)},normalizedValue:function(){return this.normalize(this.internalLazyValue)},reactive:function(){return Boolean(this.$listeners.change)},styles:function(){var e={};return this.active||(e.height=0),this.indeterminate||100===parseFloat(this.normalizedBuffer)||(e.width=Object(u["g"])(this.normalizedBuffer,"%")),e}},methods:{genContent:function(){var e=Object(u["p"])(this,"default",{value:this.internalLazyValue});return e?this.$createElement("div",{staticClass:"v-progress-linear__content"},e):null},genListeners:function(){var e=this.$listeners;return this.reactive&&(e.click=this.onClick),e},genProgressBar:function(e){return this.$createElement("div",this.setBackgroundColor(this.color,{staticClass:"v-progress-linear__indeterminate",class:Object(n["a"])({},e,!0)}))},onClick:function(e){if(this.reactive){var t=this.$el.getBoundingClientRect(),r=t.width;this.internalValue=e.offsetX/r*100}},normalize:function(e){return e<0?0:e>100?100:parseFloat(e)}},render:function(e){var t={staticClass:"v-progress-linear",attrs:{role:"progressbar","aria-valuemin":0,"aria-valuemax":this.normalizedBuffer,"aria-valuenow":this.indeterminate?void 0:this.normalizedValue},class:this.classes,style:{bottom:this.bottom?0:void 0,height:this.active?Object(u["g"])(this.height):0,top:this.top?0:void 0},on:this.genListeners()};return e("div",t,[this.__cachedStream,this.__cachedBackground,this.__cachedBuffer,this.__cachedBar,this.genContent()])}})},a452:function(e,t,r){"use strict";var a=r("ade3"),n=r("2b0e");function i(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:"value",t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:"change";return n["a"].extend({name:"proxyable",model:{prop:e,event:t},props:Object(a["a"])({},e,{required:!1}),data:function(){return{internalLazyValue:this[e]}},computed:{internalValue:{get:function(){return this.internalLazyValue},set:function(e){e!==this.internalLazyValue&&(this.internalLazyValue=e,this.$emit(t,e))}}},watch:Object(a["a"])({},e,(function(e){this.internalLazyValue=e}))})}var s=i();t["a"]=s},f845:function(e,t,r){}}]);
//# sourceMappingURL=view-auto-update.b8014ecc.js.map