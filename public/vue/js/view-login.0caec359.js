(window["webpackJsonp"]=window["webpackJsonp"]||[]).push([["view-login"],{"4bd4":function(t,e,n){"use strict";n("4de4"),n("7db0"),n("4160"),n("caad"),n("07ac"),n("2532"),n("159b");var r=n("5530"),s=n("58df"),a=n("7e2b"),i=n("3206");e["a"]=Object(s["a"])(a["a"],Object(i["b"])("form")).extend({name:"v-form",provide:function(){return{form:this}},inheritAttrs:!1,props:{disabled:Boolean,lazyValidation:Boolean,readonly:Boolean,value:Boolean},data:function(){return{inputs:[],watchers:[],errorBag:{}}},watch:{errorBag:{handler:function(t){var e=Object.values(t).includes(!0);this.$emit("input",!e)},deep:!0,immediate:!0}},methods:{watchInput:function(t){var e=this,n=function(t){return t.$watch("hasError",(function(n){e.$set(e.errorBag,t._uid,n)}),{immediate:!0})},r={_uid:t._uid,valid:function(){},shouldValidate:function(){}};return this.lazyValidation?r.shouldValidate=t.$watch("shouldValidate",(function(s){s&&(e.errorBag.hasOwnProperty(t._uid)||(r.valid=n(t)))})):r.valid=n(t),r},validate:function(){return 0===this.inputs.filter((function(t){return!t.validate(!0)})).length},reset:function(){this.inputs.forEach((function(t){return t.reset()})),this.resetErrorBag()},resetErrorBag:function(){var t=this;this.lazyValidation&&setTimeout((function(){t.errorBag={}}),0)},resetValidation:function(){this.inputs.forEach((function(t){return t.resetValidation()})),this.resetErrorBag()},register:function(t){this.inputs.push(t),this.watchers.push(this.watchInput(t))},unregister:function(t){var e=this.inputs.find((function(e){return e._uid===t._uid}));if(e){var n=this.watchers.find((function(t){return t._uid===e._uid}));n&&(n.valid(),n.shouldValidate()),this.watchers=this.watchers.filter((function(t){return t._uid!==e._uid})),this.inputs=this.inputs.filter((function(t){return t._uid!==e._uid})),this.$delete(this.errorBag,e._uid)}}},render:function(t){var e=this;return t("form",{staticClass:"v-form",attrs:Object(r["a"])({novalidate:!0},this.attrs$),on:{submit:function(t){return e.$emit("submit",t)}}},this.$slots.default)}})},a55b:function(t,e,n){"use strict";n.r(e);var r=function(){var t=this,e=t.$createElement,n=t._self._c||e;return n("v-container",{staticClass:"grey",attrs:{fluid:"","fill-height":""}},[n("v-row",[n("v-col",[n("v-form",[n("v-row",[n("v-col",[n("h1",{staticClass:"text-center"},[t._v("Login to VisualCal")])])],1),n("v-row",{attrs:{"no-gutters":""}},[n("v-col",[n("v-text-field",{staticClass:"pa-15",attrs:{rules:[t.passwordRules.required,t.passwordRules.email],autofocus:"",label:"Username",hint:"Email address (Use demo@indysoft.com for now)","persistent-hint":""},model:{value:t.fUsername,callback:function(e){t.fUsername=e},expression:"fUsername"}})],1)],1),n("v-row",{attrs:{"no-gutters":""}},[n("v-col",[n("v-text-field",{staticClass:"pa-15",attrs:{"append-icon":t.fPasswordVisible?"mdi-eye":"mdi-eye-off",type:t.fPasswordVisible?"text":"password",rules:[t.passwordRules.required,t.passwordRules.min],autocomplete:"current-password",label:"Password",hint:"Enter any password of at least 8 characters.  Passwords are not checked currently.","persistent-hint":""},on:{"click:append":function(e){t.fPasswordVisible=!t.fPasswordVisible}},model:{value:t.fPassword,callback:function(e){t.fPassword=e},expression:"fPassword"}})],1)],1),n("v-row",{staticClass:"text-center",attrs:{"no-gutters":""}},[n("v-col",[n("v-btn",{attrs:{disabled:t.fIsLoginButtonDisabled,type:"submit"},on:{click:function(e){return e.preventDefault(),t.onLoginButtonClicked(e)}}},[t._v("Login")])],1)],1)],1)],1)],1)],1)},s=[],a=(n("96cf"),n("1da1")),i=n("d4ec"),o=n("bee2"),u=n("262e"),c=n("2caf"),d=n("9ab4"),l=n("60a3"),f=n("ec68"),h=n("f5e2"),p=function(t){Object(u["a"])(n,t);var e=Object(c["a"])(n);function n(){var t;return Object(i["a"])(this,n),t=e.apply(this,arguments),t.fPasswordVisible=!1,t.fIsLoginButtonDisabled=!0,t.fUsername="",t.fPassword="",t}return Object(o["a"])(n,[{key:"onUsernameChanged",value:function(){this.updateIsLoginButtonDisabled()}},{key:"onPasswordChanged",value:function(){this.updateIsLoginButtonDisabled()}},{key:"updateIsLoginButtonDisabled",value:function(){this.fIsLoginButtonDisabled=this.fUsername.length<=0||!Object(h["a"])(this.fUsername)||this.fPassword.length<=0}},{key:"onLoginButtonClicked",value:function(){var t=Object(a["a"])(regeneratorRuntime.mark((function t(){var e;return regeneratorRuntime.wrap((function(t){while(1)switch(t.prev=t.next){case 0:return this.fIsLoginButtonDisabled=!0,e={username:this.fUsername,password:this.fPassword},t.prev=2,t.next=5,this.$store.direct.dispatch.login(e);case 5:t.next=12;break;case 7:t.prev=7,t.t0=t["catch"](2),console.error(t.t0),this.fIsLoginButtonDisabled=!1,console.info(this.fIsLoginButtonDisabled);case 12:this.fIsLoginButtonDisabled=!1;case 13:case"end":return t.stop()}}),t,this,[[2,7]])})));function e(){return t.apply(this,arguments)}return e}()},{key:"passwordRules",get:function(){return f["a"]}}]),n}(l["c"]);Object(d["a"])([Object(l["d"])("fUsername")],p.prototype,"onUsernameChanged",null),Object(d["a"])([Object(l["d"])("fPassword")],p.prototype,"onPasswordChanged",null),p=Object(d["a"])([l["a"]],p);var v=p,w=v,b=(n("d6db"),n("2877")),m=n("6544"),g=n.n(m),B=n("8336"),y=n("62ad"),V=n("a523"),O=n("4bd4"),P=n("0fd9"),j=n("8654"),_=Object(b["a"])(w,r,s,!1,null,null,null);e["default"]=_.exports;g()(_,{VBtn:B["a"],VCol:y["a"],VContainer:V["a"],VForm:O["a"],VRow:P["a"],VTextField:j["a"]})},d6db:function(t,e,n){"use strict";var r=n("e67a"),s=n.n(r);s.a},e67a:function(t,e,n){},ec68:function(t,e,n){"use strict";n.d(e,"b",(function(){return s})),n.d(e,"a",(function(){return a}));var r=n("f5e2"),s=function(t){return t&&t.length>0||"Required"},a={required:s,min:function(t){return t&&t.length>=8||"Min 8 characters"},email:function(t){return Object(r["a"])(t)||"Please enter a valid email address"}}},f5e2:function(t,e,n){"use strict";n.d(e,"a",(function(){return r}));var r=function(t){return/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(t)}}}]);
//# sourceMappingURL=view-login.0caec359.js.map