(window["webpackJsonp"]=window["webpackJsonp"]||[]).push([["view-bench-config"],{"0992":function(e,t,n){"use strict";var i=n("a0be"),r=n.n(i);r.a},"169a":function(e,t,n){"use strict";n("7db0"),n("caad"),n("45fc"),n("a9e3"),n("2532"),n("498a");var i=n("5530"),r=n("2909"),a=n("ade3"),o=(n("368e"),n("480e")),s=n("4ad4"),c=n("b848"),l=n("75eb"),u=(n("3c93"),n("a9ad")),d=n("7560"),h=n("f2e7"),f=n("58df"),v=Object(f["a"])(u["a"],d["a"],h["a"]).extend({name:"v-overlay",props:{absolute:Boolean,color:{type:String,default:"#212121"},dark:{type:Boolean,default:!0},opacity:{type:[Number,String],default:.46},value:{default:!0},zIndex:{type:[Number,String],default:5}},computed:{__scrim:function(){var e=this.setBackgroundColor(this.color,{staticClass:"v-overlay__scrim",style:{opacity:this.computedOpacity}});return this.$createElement("div",e)},classes:function(){return Object(i["a"])({"v-overlay--absolute":this.absolute,"v-overlay--active":this.isActive},this.themeClasses)},computedOpacity:function(){return Number(this.isActive?this.opacity:0)},styles:function(){return{zIndex:this.zIndex}}},methods:{genContent:function(){return this.$createElement("div",{staticClass:"v-overlay__content"},this.$slots.default)}},render:function(e){var t=[this.__scrim];return this.isActive&&t.push(this.genContent()),e("div",{staticClass:"v-overlay",class:this.classes,style:this.styles},t)}}),m=v,g=n("80d2"),b=n("2b0e"),p=b["a"].extend().extend({name:"overlayable",props:{hideOverlay:Boolean,overlayColor:String,overlayOpacity:[Number,String]},data:function(){return{animationFrame:0,overlay:null}},watch:{hideOverlay:function(e){this.isActive&&(e?this.removeOverlay():this.genOverlay())}},beforeDestroy:function(){this.removeOverlay()},methods:{createOverlay:function(){var e=new m({propsData:{absolute:this.absolute,value:!1,color:this.overlayColor,opacity:this.overlayOpacity}});e.$mount();var t=this.absolute?this.$el.parentNode:document.querySelector("[data-app]");t&&t.insertBefore(e.$el,t.firstChild),this.overlay=e},genOverlay:function(){var e=this;if(this.hideScroll(),!this.hideOverlay)return this.overlay||this.createOverlay(),this.animationFrame=requestAnimationFrame((function(){e.overlay&&(void 0!==e.activeZIndex?e.overlay.zIndex=String(e.activeZIndex-1):e.$el&&(e.overlay.zIndex=Object(g["r"])(e.$el)),e.overlay.value=!0)})),!0},removeOverlay:function(){var e=this,t=!(arguments.length>0&&void 0!==arguments[0])||arguments[0];this.overlay&&(Object(g["a"])(this.overlay.$el,"transitionend",(function(){e.overlay&&e.overlay.$el&&e.overlay.$el.parentNode&&!e.overlay.value&&(e.overlay.$el.parentNode.removeChild(e.overlay.$el),e.overlay.$destroy(),e.overlay=null)})),cancelAnimationFrame(this.animationFrame),this.overlay.value=!1),t&&this.showScroll()},scrollListener:function(e){if("keydown"===e.type){if(["INPUT","TEXTAREA","SELECT"].includes(e.target.tagName)||e.target.isContentEditable)return;var t=[g["t"].up,g["t"].pageup],n=[g["t"].down,g["t"].pagedown];if(t.includes(e.keyCode))e.deltaY=-1;else{if(!n.includes(e.keyCode))return;e.deltaY=1}}(e.target===this.overlay||"keydown"!==e.type&&e.target===document.body||this.checkPath(e))&&e.preventDefault()},hasScrollbar:function(e){if(!e||e.nodeType!==Node.ELEMENT_NODE)return!1;var t=window.getComputedStyle(e);return["auto","scroll"].includes(t.overflowY)&&e.scrollHeight>e.clientHeight},shouldScroll:function(e,t){return 0===e.scrollTop&&t<0||e.scrollTop+e.clientHeight===e.scrollHeight&&t>0},isInside:function(e,t){return e===t||null!==e&&e!==document.body&&this.isInside(e.parentNode,t)},checkPath:function(e){var t=e.path||this.composedPath(e),n=e.deltaY;if("keydown"===e.type&&t[0]===document.body){var i=this.$refs.dialog,r=window.getSelection().anchorNode;return!(i&&this.hasScrollbar(i)&&this.isInside(r,i))||this.shouldScroll(i,n)}for(var a=0;a<t.length;a++){var o=t[a];if(o===document)return!0;if(o===document.documentElement)return!0;if(o===this.$refs.content)return!0;if(this.hasScrollbar(o))return this.shouldScroll(o,n)}return!0},composedPath:function(e){if(e.composedPath)return e.composedPath();var t=[],n=e.target;while(n){if(t.push(n),"HTML"===n.tagName)return t.push(document),t.push(window),t;n=n.parentElement}return t},hideScroll:function(){this.$vuetify.breakpoint.smAndDown?document.documentElement.classList.add("overflow-y-hidden"):(Object(g["b"])(window,"wheel",this.scrollListener,{passive:!1}),window.addEventListener("keydown",this.scrollListener))},showScroll:function(){document.documentElement.classList.remove("overflow-y-hidden"),window.removeEventListener("wheel",this.scrollListener),window.removeEventListener("keydown",this.scrollListener)}}}),y=n("e4d3"),C=n("21be"),w=n("a293"),B=n("d9bd"),O=Object(f["a"])(s["a"],c["a"],l["a"],p,y["a"],C["a"],h["a"]);t["a"]=O.extend({name:"v-dialog",directives:{ClickOutside:w["a"]},props:{dark:Boolean,disabled:Boolean,fullscreen:Boolean,light:Boolean,maxWidth:{type:[String,Number],default:"none"},noClickAnimation:Boolean,origin:{type:String,default:"center center"},persistent:Boolean,retainFocus:{type:Boolean,default:!0},scrollable:Boolean,transition:{type:[String,Boolean],default:"dialog-transition"},width:{type:[String,Number],default:"auto"}},data:function(){return{activatedBy:null,animate:!1,animateTimeout:-1,isActive:!!this.value,stackMinZIndex:200}},computed:{classes:function(){var e;return e={},Object(a["a"])(e,"v-dialog ".concat(this.contentClass).trim(),!0),Object(a["a"])(e,"v-dialog--active",this.isActive),Object(a["a"])(e,"v-dialog--persistent",this.persistent),Object(a["a"])(e,"v-dialog--fullscreen",this.fullscreen),Object(a["a"])(e,"v-dialog--scrollable",this.scrollable),Object(a["a"])(e,"v-dialog--animated",this.animate),e},contentClasses:function(){return{"v-dialog__content":!0,"v-dialog__content--active":this.isActive}},hasActivator:function(){return Boolean(!!this.$slots.activator||!!this.$scopedSlots.activator)}},watch:{isActive:function(e){e?(this.show(),this.hideScroll()):(this.removeOverlay(),this.unbind())},fullscreen:function(e){this.isActive&&(e?(this.hideScroll(),this.removeOverlay(!1)):(this.showScroll(),this.genOverlay()))}},created:function(){this.$attrs.hasOwnProperty("full-width")&&Object(B["d"])("full-width",this)},beforeMount:function(){var e=this;this.$nextTick((function(){e.isBooted=e.isActive,e.isActive&&e.show()}))},beforeDestroy:function(){"undefined"!==typeof window&&this.unbind()},methods:{animateClick:function(){var e=this;this.animate=!1,this.$nextTick((function(){e.animate=!0,window.clearTimeout(e.animateTimeout),e.animateTimeout=window.setTimeout((function(){return e.animate=!1}),150)}))},closeConditional:function(e){var t=e.target;return!(this._isDestroyed||!this.isActive||this.$refs.content.contains(t)||this.overlay&&t&&!this.overlay.$el.contains(t))&&this.activeZIndex>=this.getMaxZIndex()},hideScroll:function(){this.fullscreen?document.documentElement.classList.add("overflow-y-hidden"):p.options.methods.hideScroll.call(this)},show:function(){var e=this;!this.fullscreen&&!this.hideOverlay&&this.genOverlay(),this.$nextTick((function(){e.$refs.content.focus(),e.bind()}))},bind:function(){window.addEventListener("focusin",this.onFocusin)},unbind:function(){window.removeEventListener("focusin",this.onFocusin)},onClickOutside:function(e){this.$emit("click:outside",e),this.persistent?this.noClickAnimation||this.animateClick():this.isActive=!1},onKeydown:function(e){if(e.keyCode===g["t"].esc&&!this.getOpenDependents().length)if(this.persistent)this.noClickAnimation||this.animateClick();else{this.isActive=!1;var t=this.getActivator();this.$nextTick((function(){return t&&t.focus()}))}this.$emit("keydown",e)},onFocusin:function(e){if(e&&this.retainFocus){var t=e.target;if(t&&![document,this.$refs.content].includes(t)&&!this.$refs.content.contains(t)&&this.activeZIndex>=this.getMaxZIndex()&&!this.getOpenDependentElements().some((function(e){return e.contains(t)}))){var n=this.$refs.content.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'),i=Object(r["a"])(n).find((function(e){return!e.hasAttribute("disabled")}));i&&i.focus()}}},genContent:function(){var e=this;return this.showLazyContent((function(){return[e.$createElement(o["a"],{props:{root:!0,light:e.light,dark:e.dark}},[e.$createElement("div",{class:e.contentClasses,attrs:Object(i["a"])({role:"document",tabindex:e.isActive?0:void 0},e.getScopeIdAttrs()),on:{keydown:e.onKeydown},style:{zIndex:e.activeZIndex},ref:"content"},[e.genTransition()])])]}))},genTransition:function(){var e=this.genInnerContent();return this.transition?this.$createElement("transition",{props:{name:this.transition,origin:this.origin,appear:!0}},[e]):e},genInnerContent:function(){var e={class:this.classes,ref:"dialog",directives:[{name:"click-outside",value:{handler:this.onClickOutside,closeConditional:this.closeConditional,include:this.getOpenDependentElements}},{name:"show",value:this.isActive}],style:{transformOrigin:this.origin}};return this.fullscreen||(e.style=Object(i["a"])(Object(i["a"])({},e.style),{},{maxWidth:"none"===this.maxWidth?void 0:Object(g["g"])(this.maxWidth),width:"auto"===this.width?void 0:Object(g["g"])(this.width)})),this.$createElement("div",e,this.getContentSlot())}},render:function(e){return e("div",{staticClass:"v-dialog__container",class:{"v-dialog__container--attached":""===this.attach||!0===this.attach||"attach"===this.attach},attrs:{role:"dialog"}},[this.genActivator(),this.genContent()])}})},"16ce":function(e,t,n){},"1ab2":function(e,t,n){"use strict";n.r(t);var i=function(){var e=this,t=e.$createElement,n=e._self._c||t;return n("v-container",{staticClass:"grey",staticStyle:{height:"100vh"},attrs:{fluid:""}},[n("ConfirmDeleteDialogComponent",{attrs:{"should-show":e.confirmDeleteDialogShouldShow,"configuration-name":e.selectedBenchConfig?e.selectedBenchConfig.name:""},on:{confirm:e.deleteSelectedBenchConfiguration,cancel:function(t){e.confirmDeleteDialogShouldShow=!1}}}),n("v-row",[n("v-col",[n("v-container",{attrs:{fluid:""}},[n("v-row",[n("v-col",[n("h1",{staticClass:"text-center"},[e._v("Bench Configuration Editor")])])],1),e.currentUser?n("v-row",[n("v-col",[n("v-btn",{on:{click:e.addNewBenchConfiguration}},[e._v(" Add new bench configruration ")])],1)],1):e._e(),n("v-row",{attrs:{"no-gutters":""}},[n("v-col",[n("v-select",{attrs:{items:e.benchConfigs,label:"Bench configuration","item-text":"name","return-object":""},model:{value:e.selectedBenchConfig,callback:function(t){e.selectedBenchConfig=t},expression:"selectedBenchConfig"}})],1),e.selectedBenchConfig?n("v-col",[n("v-btn",{on:{click:e.confirmDeleteSelectedConfiguration}},[e._v(" Delete Configuration ")])],1):e._e()],1),e.selectedBenchConfig?n("v-row",{staticClass:"text-center",attrs:{"no-gutters":""}},[n("v-col",[n("v-text-field",{attrs:{label:"Selected bench configuration name"},model:{value:e.selectedBenchConfig.name,callback:function(t){e.$set(e.selectedBenchConfig,"name",t)},expression:"selectedBenchConfig.name"}})],1)],1):e._e(),e.selectedBenchConfig?n("v-row",{staticClass:"text-center",attrs:{"no-gutters":""}},[n("v-col",[n("v-select",{attrs:{items:e.interfaceTypes,label:"Interface type to add"},model:{value:e.selectedInterfaceTypeToAdd,callback:function(t){e.selectedInterfaceTypeToAdd=t},expression:"selectedInterfaceTypeToAdd"}})],1),n("v-btn",{on:{click:e.addInterface}},[e._v(" Add Interface ")])],1):e._e(),e.selectedBenchConfig?n("v-row",{attrs:{"no-gutters":""}},[n("v-col",[n("BenchConfigComponent",{attrs:{"bench-config":e.selectedBenchConfig,"serial-ports":e.serialPorts},on:{"delete-interface":e.deleteInterface}})],1)],1):e._e(),n("v-row",{staticClass:"text-center"},[n("v-col",[n("v-btn",{staticStyle:{"margin-right":"20px"},attrs:{disabled:!e.canSave.value,width:"100px",color:"primary"},on:{click:e.save}},[e._v(" Save ")]),n("v-btn",{attrs:{width:"100px"},on:{click:e.cancel}},[e._v(" Cancel ")])],1)],1),e.canSave.reason?n("v-row",{staticClass:"text-center"},[n("v-col",[n("h4",{staticClass:"red"},[e._v(e._s(e.canSave.reason))])])],1):e._e()],1)],1)],1)],1)},r=[],a=(n("c740"),n("4160"),n("d81d"),n("a434"),n("b0c0"),n("d3b7"),n("6062"),n("3ca3"),n("159b"),n("ddb0"),n("96cf"),n("1da1")),o=n("d4ec"),s=n("bee2"),c=n("262e"),l=n("2caf"),u=n("9ab4"),d=n("60a3"),h=n("c4b2"),f=function(){var e=this,t=e.$createElement,n=e._self._c||t;return n("v-card",[n("v-container",{attrs:{fluid:""}},[n("v-row",{attrs:{"no-gutters":""}},[n("v-col",[n("h2",[e._v("Interfaces")])])],1),n("v-row",[n("v-col",[n("TabulatorComponent",{attrs:{columns:e.columns,layout:"fitData","show-row-hover":!1,data:e.communicationInterfaces}})],1)],1)],1)],1)},v=[],m=n("b85c"),g=n("356c"),b=function(e){Object(c["a"])(n,e);var t=Object(l["a"])(n);function n(){var e;return Object(o["a"])(this,n),e=t.apply(this,arguments),e.fDeleteInterfaceButtons=[],e.columns=[{title:"Name",field:"name",editable:!0,editor:"input",frozen:!0},{title:"Type",field:"type"},{title:"Reset on connect",field:"resetOnConnect",editable:!0,editor:"tickCross"},{title:"GPIB Address",field:"nationalInstrumentsGpib.address",formatter:function(t){return void 0!==t.getValue()?t.getValue():e.createUnusedCell()},editable:function(e){return void 0!==e.getValue()},editor:"number"},{title:"TCP",columns:[{title:"Host",field:"tcp.host",formatter:function(t){return void 0!==t.getValue()?t.getValue():e.createUnusedCell()},editable:function(e){return void 0!==e.getValue()},editor:"input"},{title:"Port",field:"tcp.port",formatter:function(t){return void 0!==t.getValue()?t.getValue():e.createUnusedCell()},editable:function(e){return void 0!==e.getValue()&&"Prologix GPIB TCP"!==e.getRow().getCell("type").getValue()},editor:"number"}]},{title:"Serial",columns:[{title:"Port Name (Path)",field:"serial.port",formatter:function(t){return void 0!==t.getValue()?t.getValue():e.createUnusedCell()},editable:function(e){return void 0!==e.getValue()},editor:"select",editorParams:function(){return e.getSerialPortEditorParams()}},{title:"Baud Rate",field:"serial.baudRate",formatter:function(t){return void 0!==t.getValue()?t.getValue():e.createUnusedCell()}},{title:"Parity",field:"serial.parity",formatter:function(t){return void 0!==t.getValue()?t.getValue():e.createUnusedCell()}},{title:"Stop Bits",field:"serial.stopBits",formatter:function(t){return void 0!==t.getValue()?t.getValue():e.createUnusedCell()}},{title:"Data Bits",field:"serial.dataBits",formatter:function(t){return void 0!==t.getValue()?t.getValue():e.createUnusedCell()}}]},{title:"Timing (all times are in milliseconds)",columns:[{title:"Connect Timeout",field:"timing.connectTimeout",editable:!0,editor:"number",validator:"min: 0",cellEdited:e.optionalNumberCellEdited},{title:"Delay before write",field:"timing.delayBeforeWrite",editable:!0,editor:"number",validator:"min: 0",cellEdited:e.optionalNumberCellEdited},{title:"Delay after write",field:"timing.delayAfterWrite",editable:!0,editor:"number",validator:"min: 0",cellEdited:e.optionalNumberCellEdited},{title:"Delay before read",field:"timing.delayBeforeRead",editable:!0,editor:"number",validator:"min: 0",cellEdited:e.optionalNumberCellEdited},{title:"Delay after read",field:"timing.delayAfterRead",editable:!0,editor:"number",validator:"min: 0",cellEdited:e.optionalNumberCellEdited}]},{title:"",formatter:e.createDeleteInterfaceColumnButton}],e}return Object(s["a"])(n,[{key:"setSelectSessionButtonsDisabled",value:function(e){var t,n=Object(m["a"])(this.fDeleteInterfaceButtons);try{for(n.s();!(t=n.n()).done;){var i=t.value;i.disabled=e}}catch(r){n.e(r)}finally{n.f()}}},{key:"onSelectSessionButtonClicked",value:function(e){this.setSelectSessionButtonsDisabled(!0),this.$emit("delete-interface",e),this.setSelectSessionButtonsDisabled(!1)}},{key:"createDeleteInterfaceColumnButton",value:function(e){var t=this,n=document.createElement("button");return n.textContent="Delete",n.style.backgroundColor="#b5b5b5",n.style.marginLeft="7px",n.style.marginRight="7px",n.style.padding="7px",n.style.width="90%",n.style.boxShadow="2px 2px #888888",n.id=e.getRow().getData().name,n.onclick=function(){return t.onSelectSessionButtonClicked(n.id)},this.fDeleteInterfaceButtons.push(n),n}},{key:"createUnusedCell",value:function(){var e=document.createElement("div");return e.style.backgroundColor="#b5b5b5",e.style.height="100%",e.style.width="100%",e}},{key:"getSerialPortEditorParams",value:function(){return this.serialPorts?this.serialPorts.map((function(e){return{label:e,value:e}})):[]}},{key:"optionalNumberCellEdited",value:function(e){var t=e.getRow().getData();t.timing&&(t.timing.delayBeforeWrite||(t.timing.delayBeforeWrite=void 0),t.timing.delayAfterWrite||(t.timing.delayAfterWrite=void 0),t.timing.delayBeforeRead||(t.timing.delayBeforeRead=void 0),t.timing.delayAfterRead||(t.timing.delayAfterRead=void 0))}},{key:"communicationInterfaces",get:function(){return this.benchConfig?this.benchConfig.interfaces:[]}},{key:"name",get:function(){return this.benchConfig?this.benchConfig.name:""}}]),n}(d["c"]);Object(u["a"])([Object(d["b"])({type:Array,required:!1})],b.prototype,"serialPorts",void 0),Object(u["a"])([Object(d["b"])({type:Object,required:!1})],b.prototype,"benchConfig",void 0),b=Object(u["a"])([Object(d["a"])({components:{TabulatorComponent:g["a"]}})],b);var p=b,y=p,C=n("2877"),w=n("6544"),B=n.n(w),O=n("b0af"),S=n("62ad"),k=n("a523"),x=n("0fd9"),j=Object(C["a"])(y,f,v,!1,null,null,null),T=j.exports;B()(j,{VCard:O["a"],VCol:S["a"],VContainer:k["a"],VRow:x["a"]});var I=function(){var e=this,t=e.$createElement,n=e._self._c||t;return n("v-row",{attrs:{justify:"center"}},[n("v-dialog",{attrs:{persistent:"","max-width":"500"},model:{value:e.shouldShow,callback:function(t){e.shouldShow=t},expression:"shouldShow"}},[n("v-card",[n("v-card-title",{staticClass:"headline"},[e._v(" Delete bench configuration? ")]),n("v-card-text",[e._v("Are you sure you want to delete bench configuration named "+e._s(e.configurationName)+"?")]),n("v-card-actions",[n("v-spacer"),n("v-btn",{attrs:{color:"green darken-1"},on:{click:e.confirm}},[e._v(" Yes ")]),n("v-btn",{attrs:{color:"green darken-1"},on:{click:e.cancel}},[e._v(" No ")])],1)],1)],1)],1)},D=[],P=function(e){Object(c["a"])(n,e);var t=Object(l["a"])(n);function n(){return Object(o["a"])(this,n),t.apply(this,arguments)}return Object(s["a"])(n,[{key:"confirm",value:function(){this.$emit("confirm")}},{key:"cancel",value:function(){this.$emit("cancel")}}]),n}(d["c"]);Object(u["a"])([Object(d["b"])({type:Boolean,required:!0})],P.prototype,"shouldShow",void 0),Object(u["a"])([Object(d["b"])({type:String,required:!0})],P.prototype,"configurationName",void 0),P=Object(u["a"])([d["a"]],P);var E=P,A=E,_=n("8336"),$=n("99d9"),V=n("169a"),N=n("2fa4"),R=Object(C["a"])(A,I,D,!1,null,null,null),U=R.exports;B()(R,{VBtn:_["a"],VCard:O["a"],VCardActions:$["a"],VCardText:$["b"],VCardTitle:$["c"],VDialog:V["a"],VRow:x["a"],VSpacer:N["a"]});var G=function(e){Object(c["a"])(n,e);var t=Object(l["a"])(n);function n(){var e;return Object(o["a"])(this,n),e=t.apply(this,arguments),e.confirmDeleteDialogShouldShow=!1,e.serialPorts=[],e.currentUser=null,e.selectedBenchConfig=null,e.interfaceTypes=[],e.selectedInterfaceTypeToAdd="",e}return Object(s["a"])(n,[{key:"hasDuplicates",value:function(e){return new Set(e).size!==e.length}},{key:"mounted",value:function(){var e=Object(a["a"])(regeneratorRuntime.mark((function e(){var t,n=this;return regeneratorRuntime.wrap((function(e){while(1)switch(e.prev=e.next){case 0:return e.next=2,window.ipc.getSerialPorts();case 2:return t=e.sent,this.serialPorts=t.map((function(e){return e.path})),h["CommunicationInterfaceTypes"].forEach((function(e){return n.interfaceTypes.push(e)})),this.interfaceTypes.sort(),this.selectedInterfaceTypeToAdd=this.interfaceTypes[0],e.next=9,window.ipc.getCurrentUser();case 9:if(this.currentUser=e.sent,this.currentUser&&!(this.currentUser.benchConfigs.length<=0)){e.next=12;break}return e.abrupt("return");case 12:this.sortBenchConfigs(),this.selectedBenchConfig=this.currentUser.benchConfigs[0];case 14:case"end":return e.stop()}}),e,this)})));function t(){return e.apply(this,arguments)}return t}()},{key:"sortBenchConfigs",value:function(){this.currentUser&&this.currentUser.benchConfigs.sort((function(e,t){return e.name>t.name?1:e.name<t.name?-1:0}))}},{key:"addNewBenchConfiguration",value:function(){if(this.currentUser){var e={name:"New config",username:this.currentUser.email,interfaces:[]};this.benchConfigs.push(e),this.sortBenchConfigs(),this.selectedBenchConfig=e}}},{key:"addInterface",value:function(){if(this.selectedBenchConfig)switch(this.selectedInterfaceTypeToAdd){case"Emulated":this.selectedBenchConfig.interfaces.push({type:"Emulated",name:"Emulated",timing:h["DefaultTiming"]});break;case"National Instruments GPIB":this.selectedBenchConfig.interfaces.push({type:"National Instruments GPIB",name:"National Instruments GPIB",nationalInstrumentsGpib:{address:0},timing:h["DefaultTiming"]});break;case"Prologix GPIB TCP":this.selectedBenchConfig.interfaces.push({type:"Prologix GPIB TCP",name:"Prologix GPIB TCP",tcp:{host:"hostname",port:1234},timing:h["DefaultTiming"]});break;case"Prologix GPIB USB":this.selectedBenchConfig.interfaces.push({type:"Prologix GPIB USB",name:"Prologix GPIB USB",serial:{port:"",baudRate:9600},timing:h["DefaultTiming"]});break;case"Serial Port":this.selectedBenchConfig.interfaces.push({type:"Serial Port",name:"Serial Port",serial:{port:"",baudRate:9600},timing:h["DefaultTiming"]});break}}},{key:"deleteInterface",value:function(e){if(this.selectedBenchConfig){var t=this.selectedBenchConfig.interfaces.findIndex((function(t){return t.name===e}));this.selectedBenchConfig.interfaces.splice(t,1)}}},{key:"confirmDeleteSelectedConfiguration",value:function(){this.confirmDeleteDialogShouldShow=!0}},{key:"deleteSelectedBenchConfiguration",value:function(){var e=this;if(this.confirmDeleteDialogShouldShow=!1,this.selectedBenchConfig){var t=this.benchConfigs.findIndex((function(t){return e.selectedBenchConfig&&t.name===e.selectedBenchConfig.name}));this.benchConfigs.splice(t,1),this.selectedBenchConfig=this.benchConfigs.length>0?this.benchConfigs[0]:null}}},{key:"save",value:function(){var e=Object(a["a"])(regeneratorRuntime.mark((function e(){return regeneratorRuntime.wrap((function(e){while(1)switch(e.prev=e.next){case 0:return e.next=2,window.ipc.saveBenchConfigurationsForCurrentUser(this.benchConfigs);case 2:close();case 3:case"end":return e.stop()}}),e,this)})));function t(){return e.apply(this,arguments)}return t}()},{key:"cancel",value:function(){close()}},{key:"benchConfigs",get:function(){return this.currentUser?this.currentUser.benchConfigs:[]}},{key:"canSave",get:function(){var e=this,t={value:!0};return this.hasDuplicates(this.benchConfigs.map((function(e){return e.name})))?(t={value:!1,reason:"Duplicate bench configuration names"},t):(this.benchConfigs.forEach((function(n){if(e.hasDuplicates(n.interfaces.map((function(e){return e.name}))))return t={value:!1,reason:"Duplicate interface names"},t})),t)}}]),n}(d["c"]);G=Object(u["a"])([Object(d["a"])({components:{BenchConfigComponent:T,ConfirmDeleteDialogComponent:U}})],G);var L=G,q=L,F=(n("ec80"),n("b974")),W=n("8654"),z=Object(C["a"])(q,i,r,!1,null,null,null);t["default"]=z.exports;B()(z,{VBtn:_["a"],VCol:S["a"],VContainer:k["a"],VRow:x["a"],VSelect:F["a"],VTextField:W["a"]})},"356c":function(e,t,n){"use strict";var i=function(){var e=this,t=e.$createElement,n=e._self._c||t;return n("div",[n("div",{ref:"tabulatorElement"})])},r=[],a=(n("96cf"),n("1da1")),o=n("d4ec"),s=n("bee2"),c=n("262e"),l=n("2caf"),u=n("9ab4"),d=n("60a3"),h=n("e325"),f=function(e){Object(c["a"])(n,e);var t=Object(l["a"])(n);function n(){return Object(o["a"])(this,n),t.apply(this,arguments)}return Object(s["a"])(n,[{key:"createTable",value:function(){var e=Object(a["a"])(regeneratorRuntime.mark((function e(){var t;return regeneratorRuntime.wrap((function(e){while(1)switch(e.prev=e.next){case 0:return t=new h["a"](this.tabulatorElement,{layout:this.layout,columns:this.columns}),e.next=3,t.setData(this.data);case 3:return t.redraw(),e.abrupt("return",t);case 5:case"end":return e.stop()}}),e,this)})));function t(){return e.apply(this,arguments)}return t}()},{key:"getTable",value:function(){var e=Object(a["a"])(regeneratorRuntime.mark((function e(){return regeneratorRuntime.wrap((function(e){while(1)switch(e.prev=e.next){case 0:if(this.fTable){e.next=4;break}return e.next=3,this.createTable();case 3:this.fTable=e.sent;case 4:return e.abrupt("return",this.fTable);case 5:case"end":return e.stop()}}),e,this)})));function t(){return e.apply(this,arguments)}return t}()},{key:"mounted",value:function(){this.createTable()}},{key:"onDataChanged",value:function(){var e=Object(a["a"])(regeneratorRuntime.mark((function e(t){var n;return regeneratorRuntime.wrap((function(e){while(1)switch(e.prev=e.next){case 0:return e.next=2,this.getTable();case 2:return n=e.sent,e.next=5,n.setData(t);case 5:n.redraw();case 6:case"end":return e.stop()}}),e,this)})));function t(t){return e.apply(this,arguments)}return t}()},{key:"tabulatorElement",get:function(){return this.$refs.tabulatorElement}}]),n}(d["c"]);Object(u["a"])([Object(d["b"])({type:Array,required:!0})],f.prototype,"columns",void 0),Object(u["a"])([Object(d["b"])({type:String,required:!1,default:"fitColumns"})],f.prototype,"layout",void 0),Object(u["a"])([Object(d["b"])({type:Array,required:!1,default:function(){return{}}})],f.prototype,"data",void 0),Object(u["a"])([Object(d["b"])({type:Boolean,required:!1,default:!1})],f.prototype,"showRowHover",void 0),Object(u["a"])([Object(d["d"])("data")],f.prototype,"onDataChanged",null),f=Object(u["a"])([d["a"]],f);var v=f,m=v,g=(n("0992"),n("2877")),b=Object(g["a"])(m,i,r,!1,null,null,null);t["a"]=b.exports},"368e":function(e,t,n){},"3c93":function(e,t,n){},6062:function(e,t,n){"use strict";var i=n("6d61"),r=n("6566");e.exports=i("Set",(function(e){return function(){return e(this,arguments.length?arguments[0]:void 0)}}),r)},a0be:function(e,t,n){},c4b2:function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.DefaultTiming=t.CommunicationInterfaceTypes=t.IpcChannels=void 0,function(e){e["GetSerialPortsRequest"]="get-serial-ports-request",e["GetSerialPortsResponse"]="get-serial-ports-response",e["GetSerialPortsError"]="get-serial-ports-error",e["SaveConfigsForCurrentUserRequest"]="save-bench-configs-for-current-user-request",e["SaveConfigsForCurrentUserResponse"]="save-bench-configs-for-current-user-response",e["SaveConfigsForCurrentUserError"]="save-bench-configs-for-current-user-error",e["Updated"]="bench-configs-for-current-user-updated"}(t.IpcChannels||(t.IpcChannels={})),t.CommunicationInterfaceTypes=["National Instruments GPIB","Prologix GPIB TCP","Prologix GPIB USB","Serial Port","Emulated"],t.DefaultTiming={connectTimeout:3e3}},ec80:function(e,t,n){"use strict";var i=n("16ce"),r=n.n(i);r.a}}]);
//# sourceMappingURL=view-bench-config.362c16ce.js.map