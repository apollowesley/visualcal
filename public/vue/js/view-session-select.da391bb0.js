(window["webpackJsonp"]=window["webpackJsonp"]||[]).push([["view-session-select"],{"011a":function(t,e,n){},"0992":function(t,e,n){"use strict";var i=n("a0be"),a=n.n(i);a.a},"10d2":function(t,e,n){"use strict";var i=n("8dd9");e["a"]=i["a"]},"1c87":function(t,e,n){"use strict";n("99af"),n("ac1f"),n("5319"),n("498a"),n("9911");var i=n("ade3"),a=n("5530"),s=n("2b0e"),r=n("5607"),o=n("80d2");e["a"]=s["a"].extend({name:"routable",directives:{Ripple:r["a"]},props:{activeClass:String,append:Boolean,disabled:Boolean,exact:{type:Boolean,default:void 0},exactActiveClass:String,link:Boolean,href:[String,Object],to:[String,Object],nuxt:Boolean,replace:Boolean,ripple:{type:[Boolean,Object],default:null},tag:String,target:String},data:function(){return{isActive:!1,proxyClass:""}},computed:{classes:function(){var t={};return this.to||(this.activeClass&&(t[this.activeClass]=this.isActive),this.proxyClass&&(t[this.proxyClass]=this.isActive)),t},computedRipple:function(){var t;return null!=(t=this.ripple)?t:!this.disabled&&this.isClickable},isClickable:function(){return!this.disabled&&Boolean(this.isLink||this.$listeners.click||this.$listeners["!click"]||this.$attrs.tabindex)},isLink:function(){return this.to||this.href||this.link},styles:function(){return{}}},watch:{$route:"onRouteChange"},methods:{click:function(t){this.$emit("click",t)},generateRouteLink:function(){var t,e,n=this.exact,s=(t={attrs:{tabindex:"tabindex"in this.$attrs?this.$attrs.tabindex:void 0},class:this.classes,style:this.styles,props:{},directives:[{name:"ripple",value:this.computedRipple}]},Object(i["a"])(t,this.to?"nativeOn":"on",Object(a["a"])(Object(a["a"])({},this.$listeners),{},{click:this.click})),Object(i["a"])(t,"ref","link"),t);if("undefined"===typeof this.exact&&(n="/"===this.to||this.to===Object(this.to)&&"/"===this.to.path),this.to){var r=this.activeClass,o=this.exactActiveClass||r;this.proxyClass&&(r="".concat(r," ").concat(this.proxyClass).trim(),o="".concat(o," ").concat(this.proxyClass).trim()),e=this.nuxt?"nuxt-link":"router-link",Object.assign(s.props,{to:this.to,exact:n,activeClass:r,exactActiveClass:o,append:this.append,replace:this.replace})}else e=(this.href?"a":this.tag)||"div","a"===e&&this.href&&(s.attrs.href=this.href);return this.target&&(s.attrs.target=this.target),{tag:e,data:s}},onRouteChange:function(){var t=this;if(this.to&&this.$refs.link&&this.$route){var e="".concat(this.activeClass," ").concat(this.proxyClass||"").trim(),n="_vnode.data.class.".concat(e);this.$nextTick((function(){Object(o["l"])(t.$refs.link,n)&&t.toggle()}))}},toggle:function(){}}})},"356c":function(t,e,n){"use strict";var i=function(){var t=this,e=t.$createElement,n=t._self._c||e;return n("div",[n("div",{ref:"tabulatorElement"})])},a=[],s=(n("96cf"),n("1da1")),r=n("d4ec"),o=n("bee2"),c=n("262e"),u=n("2caf"),l=n("9ab4"),h=n("60a3"),d=n("e325"),b=function(t){Object(c["a"])(n,t);var e=Object(u["a"])(n);function n(){return Object(r["a"])(this,n),e.apply(this,arguments)}return Object(o["a"])(n,[{key:"createTable",value:function(){var t=Object(s["a"])(regeneratorRuntime.mark((function t(){var e;return regeneratorRuntime.wrap((function(t){while(1)switch(t.prev=t.next){case 0:return e=new d["a"](this.tabulatorElement,{layout:this.layout,columns:this.columns}),t.next=3,e.setData(this.data);case 3:return e.redraw(),t.abrupt("return",e);case 5:case"end":return t.stop()}}),t,this)})));function e(){return t.apply(this,arguments)}return e}()},{key:"getTable",value:function(){var t=Object(s["a"])(regeneratorRuntime.mark((function t(){return regeneratorRuntime.wrap((function(t){while(1)switch(t.prev=t.next){case 0:if(this.fTable){t.next=4;break}return t.next=3,this.createTable();case 3:this.fTable=t.sent;case 4:return t.abrupt("return",this.fTable);case 5:case"end":return t.stop()}}),t,this)})));function e(){return t.apply(this,arguments)}return e}()},{key:"mounted",value:function(){this.createTable()}},{key:"onDataChanged",value:function(){var t=Object(s["a"])(regeneratorRuntime.mark((function t(e){var n;return regeneratorRuntime.wrap((function(t){while(1)switch(t.prev=t.next){case 0:return t.next=2,this.getTable();case 2:return n=t.sent,t.next=5,n.setData(e);case 5:n.redraw();case 6:case"end":return t.stop()}}),t,this)})));function e(e){return t.apply(this,arguments)}return e}()},{key:"tabulatorElement",get:function(){return this.$refs.tabulatorElement}}]),n}(h["c"]);Object(l["a"])([Object(h["b"])({type:Array,required:!0})],b.prototype,"columns",void 0),Object(l["a"])([Object(h["b"])({type:String,required:!1,default:"fitColumns"})],b.prototype,"layout",void 0),Object(l["a"])([Object(h["b"])({type:Array,required:!1,default:function(){return{}}})],b.prototype,"data",void 0),Object(l["a"])([Object(h["b"])({type:Boolean,required:!1,default:!1})],b.prototype,"showRowHover",void 0),Object(l["a"])([Object(h["d"])("data")],b.prototype,"onDataChanged",null),b=Object(l["a"])([h["a"]],b);var f=b,p=f,v=(n("0992"),n("2877")),g=Object(v["a"])(p,i,a,!1,null,null,null);e["a"]=g.exports},"4e82":function(t,e,n){"use strict";n.d(e,"a",(function(){return s}));var i=n("ade3"),a=n("3206");function s(t,e,n){return Object(a["a"])(t,e,n).extend({name:"groupable",props:{activeClass:{type:String,default:function(){if(this[t])return this[t].activeClass}},disabled:Boolean},data:function(){return{isActive:!1}},computed:{groupClasses:function(){return this.activeClass?Object(i["a"])({},this.activeClass,this.isActive):{}}},created:function(){this[t]&&this[t].register(this)},beforeDestroy:function(){this[t]&&this[t].unregister(this)},methods:{toggle:function(){this.$emit("change")}}})}s("itemGroup")},7002:function(t,e,n){"use strict";var i=n("011a"),a=n.n(i);a.a},"760d":function(t,e,n){"use strict";n.r(e);var i=function(){var t=this,e=t.$createElement,n=t._self._c||e;return n("v-container",{staticClass:"grey",attrs:{fluid:"","fill-height":""}},[n("v-row",{attrs:{"no-gutters":""}},[n("v-col",[n("h2",[t._v("Select a session")])])],1),n("v-row",[n("v-col",[n("TabulatorComponent",{attrs:{columns:t.columns,layout:"fitColumns","show-row-hover":!1,data:t.fSessions}})],1)],1),n("v-row",{attrs:{"no-gutters":""}},[n("v-col",[n("h2",[t._v("Or create a new one")])])],1),n("v-row",[n("v-col",[n("v-btn",{attrs:{to:{name:"SessionCreate"}}},[t._v(" Create ")])],1)],1)],1)},a=[],s=(n("4de4"),n("b0c0"),n("96cf"),n("1da1")),r=n("b85c"),o=n("d4ec"),c=n("bee2"),u=n("262e"),l=n("2caf"),h=n("9ab4"),d=n("60a3"),b=n("356c"),f=function(t){Object(u["a"])(n,t);var e=Object(l["a"])(n);function n(){var t;return Object(o["a"])(this,n),t=e.apply(this,arguments),t.procedureName="",t.fSessions=[],t.fSelectSessionButtons=[],t.columns=[{title:"Name",field:"name",width:"40%"},{title:"Procedure",field:"procedureName",width:"40%"},{title:"",formatter:t.createSelectSessionColumnButton}],t}return Object(c["a"])(n,[{key:"setSelectSessionButtonsDisabled",value:function(t){var e,n=Object(r["a"])(this.fSelectSessionButtons);try{for(n.s();!(e=n.n()).done;){var i=e.value;i.disabled=t}}catch(a){n.e(a)}finally{n.f()}}},{key:"onSelectSessionButtonClicked",value:function(){var t=Object(s["a"])(regeneratorRuntime.mark((function t(e){return regeneratorRuntime.wrap((function(t){while(1)switch(t.prev=t.next){case 0:return this.setSelectSessionButtonsDisabled(!0),t.next=3,window.ipc.setActiveSession(e);case 3:this.setSelectSessionButtonsDisabled(!1);case 4:case"end":return t.stop()}}),t,this)})));function e(e){return t.apply(this,arguments)}return e}()},{key:"createSelectSessionColumnButton",value:function(t){var e=this,n=document.createElement("button");return n.textContent="Select",n.style.backgroundColor="#b5b5b5",n.style.marginLeft="7px",n.style.marginRight="7px",n.style.padding="7px",n.style.width="90%",n.style.boxShadow="2px 2px #888888",n.id=t.getRow().getData().name,n.onclick=Object(s["a"])(regeneratorRuntime.mark((function t(){return regeneratorRuntime.wrap((function(t){while(1)switch(t.prev=t.next){case 0:return t.next=2,e.onSelectSessionButtonClicked(n.id);case 2:return t.abrupt("return",t.sent);case 3:case"end":return t.stop()}}),t)}))),this.fSelectSessionButtons.push(n),n}},{key:"mounted",value:function(){var t=Object(s["a"])(regeneratorRuntime.mark((function t(){var e,n=this;return regeneratorRuntime.wrap((function(t){while(1)switch(t.prev=t.next){case 0:return t.next=2,window.ipc.getCurrentUser();case 2:return e=t.sent,this.user=e||void 0,t.next=6,window.ipc.getActiveProcedureName();case 6:return this.procedureName=t.sent,t.next=9,window.ipc.getSessions();case 9:this.fSessions=t.sent.filter((function(t){return t.procedureName===n.procedureName}));case 10:case"end":return t.stop()}}),t,this)})));function e(){return t.apply(this,arguments)}return e}()},{key:"userEmail",get:function(){return this.user?this.user.email:""}}]),n}(d["c"]);f=Object(h["a"])([Object(d["a"])({components:{TabulatorComponent:b["a"]}})],f);var p=f,v=p,g=(n("7002"),n("2877")),m=n("6544"),y=n.n(m),x=n("8336"),O=n("62ad"),C=n("a523"),j=n("0fd9"),w=Object(g["a"])(v,i,a,!1,null,null,null);e["default"]=w.exports;y()(w,{VBtn:x["a"],VCol:O["a"],VContainer:C["a"],VRow:j["a"]})},8336:function(t,e,n){"use strict";n("4160"),n("caad"),n("c7cd");var i=n("53ca"),a=n("3835"),s=n("5530"),r=(n("86cc"),n("10d2")),o=n("490a"),c=o["a"],u=n("4e82"),l=n("f2e7"),h=n("fe6c"),d=n("1c87"),b=n("af2b"),f=n("58df"),p=n("d9bd"),v=Object(f["a"])(r["a"],d["a"],h["a"],b["a"],Object(u["a"])("btnToggle"),Object(l["b"])("inputValue"));e["a"]=v.extend().extend({name:"v-btn",props:{activeClass:{type:String,default:function(){return this.btnToggle?this.btnToggle.activeClass:""}},block:Boolean,depressed:Boolean,fab:Boolean,icon:Boolean,loading:Boolean,outlined:Boolean,retainFocusOnClick:Boolean,rounded:Boolean,tag:{type:String,default:"button"},text:Boolean,tile:Boolean,type:{type:String,default:"button"},value:null},data:function(){return{proxyClass:"v-btn--active"}},computed:{classes:function(){return Object(s["a"])(Object(s["a"])(Object(s["a"])(Object(s["a"])(Object(s["a"])({"v-btn":!0},d["a"].options.computed.classes.call(this)),{},{"v-btn--absolute":this.absolute,"v-btn--block":this.block,"v-btn--bottom":this.bottom,"v-btn--contained":this.contained,"v-btn--depressed":this.depressed||this.outlined,"v-btn--disabled":this.disabled,"v-btn--fab":this.fab,"v-btn--fixed":this.fixed,"v-btn--flat":this.isFlat,"v-btn--icon":this.icon,"v-btn--left":this.left,"v-btn--loading":this.loading,"v-btn--outlined":this.outlined,"v-btn--right":this.right,"v-btn--round":this.isRound,"v-btn--rounded":this.rounded,"v-btn--router":this.to,"v-btn--text":this.text,"v-btn--tile":this.tile,"v-btn--top":this.top},this.themeClasses),this.groupClasses),this.elevationClasses),this.sizeableClasses)},contained:function(){return Boolean(!this.isFlat&&!this.depressed&&!this.elevation)},computedRipple:function(){var t,e=!this.icon&&!this.fab||{circle:!0};return!this.disabled&&(null!=(t=this.ripple)?t:e)},isFlat:function(){return Boolean(this.icon||this.text||this.outlined)},isRound:function(){return Boolean(this.icon||this.fab)},styles:function(){return Object(s["a"])({},this.measurableStyles)}},created:function(){var t=this,e=[["flat","text"],["outline","outlined"],["round","rounded"]];e.forEach((function(e){var n=Object(a["a"])(e,2),i=n[0],s=n[1];t.$attrs.hasOwnProperty(i)&&Object(p["a"])(i,s,t)}))},methods:{click:function(t){!this.retainFocusOnClick&&!this.fab&&t.detail&&this.$el.blur(),this.$emit("click",t),this.btnToggle&&this.toggle()},genContent:function(){return this.$createElement("span",{staticClass:"v-btn__content"},this.$slots.default)},genLoader:function(){return this.$createElement("span",{class:"v-btn__loader"},this.$slots.loader||[this.$createElement(c,{props:{indeterminate:!0,size:23,width:2}})])}},render:function(t){var e=[this.genContent(),this.loading&&this.genLoader()],n=this.isFlat?this.setTextColor:this.setBackgroundColor,a=this.generateRouteLink(),s=a.tag,r=a.data;return"button"===s&&(r.attrs.type=this.type,r.attrs.disabled=this.disabled),r.attrs.value=["string","number"].includes(Object(i["a"])(this.value))?this.value:JSON.stringify(this.value),t(s,this.disabled?r:n(this.color,r),e)}})},"86cc":function(t,e,n){},9911:function(t,e,n){"use strict";var i=n("23e7"),a=n("857a"),s=n("af03");i({target:"String",proto:!0,forced:s("link")},{link:function(t){return a(this,"a","href",t)}})},a0be:function(t,e,n){}}]);
//# sourceMappingURL=view-session-select.da391bb0.js.map