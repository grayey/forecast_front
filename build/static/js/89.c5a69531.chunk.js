(this["webpackJsonpbms-pro"]=this["webpackJsonpbms-pro"]||[]).push([[89],{1031:function(e,a,t){"use strict";var r=t(7),n=t(14),s=t(9),l=t.n(s),o=t(0),i=t.n(o),m=t(58),c=t(910),u=i.a.forwardRef((function(e,a){var t=e.bsPrefix,s=e.variant,o=e.size,u=e.active,d=e.className,b=e.block,p=e.type,f=e.as,g=Object(n.a)(e,["bsPrefix","variant","size","active","className","block","type","as"]),v=Object(m.a)(t,"btn"),h=l()(d,v,u&&"active",v+"-"+s,b&&v+"-block",o&&v+"-"+o);if(g.href)return i.a.createElement(c.a,Object(r.a)({},g,{as:f,ref:a,className:l()(h,g.disabled&&"disabled")}));a&&(g.ref=a),p?g.type=p:f||(g.type="button");var w=f||"button";return i.a.createElement(w,Object(r.a)({},g,{className:h}))}));u.displayName="Button",u.defaultProps={variant:"primary",active:!1,disabled:!1},a.a=u},2519:function(e,a,t){"use strict";t.r(a);var r=t(18),n=t(25),s=t(30),l=t(29),o=t(0),i=t.n(o),m=t(1002),c=t(999),u=t(45),d=t(1031),b=t(59),p=function(e){Object(s.a)(t,e);var a=Object(l.a)(t);function t(){var e;Object(r.a)(this,t);for(var n=arguments.length,s=new Array(n),l=0;l<n;l++)s[l]=arguments[l];return(e=a.call.apply(a,[this].concat(s))).state={email:"",username:"",password:"",repassword:""},e.handleSubmit=function(e,a){a.setSubmitting;console.log(e)},e}return Object(n.a)(t,[{key:"render",value:function(){return i.a.createElement("div",{className:"auth-layout-wrap",style:{backgroundImage:"url(/assets/images/photo-wide-4.jpg)"}},i.a.createElement("div",{className:"auth-content"},i.a.createElement("div",{className:"card o-hidden"},i.a.createElement("div",{className:"row"},i.a.createElement("div",{className:"col-md-6 text-center ",style:{backgroundSize:"cover",backgroundImage:"url(/assets/images/photo-long-3.jpg)"}},i.a.createElement("div",{className:"pl-3 auth-right"},i.a.createElement("div",{className:"auth-logo text-center mt-4"},i.a.createElement("img",{src:"assets/images/logo.png",alt:""})),i.a.createElement("div",{className:"flex-grow-1"}),i.a.createElement("div",{className:"w-100 mb-4"},i.a.createElement(b.a,{to:"/session/signin",className:"btn btn-rounded btn-outline-primary btn-outline-email btn-block btn-icon-text"},i.a.createElement("i",{className:"i-Mail-with-At-Sign"})," Sign in with Email"),i.a.createElement(d.a,{className:"btn btn-outline-google btn-block btn-icon-text btn-rounded"},i.a.createElement("i",{className:"i-Google-Plus"})," Sign in with Google"),i.a.createElement(d.a,{className:"btn btn-outline-facebook btn-block btn-icon-text btn-rounded"},i.a.createElement("i",{className:"i-Facebook-2"})," Sign in with Facebook")),i.a.createElement("div",{className:"flex-grow-1"}))),i.a.createElement("div",{className:"col-md-6"},i.a.createElement("div",{className:"p-4"},i.a.createElement("h1",{className:"mb-3 text-18"},"Sign Up"),i.a.createElement(m.b,{initialValues:this.state,validationSchema:f,onSubmit:this.handleSubmit},(function(e){var a=e.values,t=e.errors,r=e.touched,n=e.handleChange,s=e.handleBlur,l=e.handleSubmit;e.isSubmitting;return i.a.createElement("form",{onSubmit:l},i.a.createElement("div",{className:"form-group"},i.a.createElement("label",{htmlFor:"username"},"Your name"),i.a.createElement("input",{className:"form-control form-control-rounded",name:"username",type:"text",onChange:n,onBlur:s,value:a.username}),t.username&&r.username&&i.a.createElement("div",{className:"text-danger mt-1 ml-2"},t.username)),i.a.createElement("div",{className:"form-group"},i.a.createElement("label",{htmlFor:"email"},"Email address"),i.a.createElement("input",{name:"email",className:"form-control form-control-rounded",type:"email",onChange:n,onBlur:s,value:a.email}),t.email&&r.email&&i.a.createElement("div",{className:"text-danger mt-1 ml-2"},t.email)),i.a.createElement("div",{className:"form-group"},i.a.createElement("label",{htmlFor:"password"},"Password"),i.a.createElement("input",{name:"password",className:"form-control form-control-rounded",type:"password",onChange:n,onBlur:s,value:a.password}),t.password&&r.password&&i.a.createElement("div",{className:"text-danger mt-1 ml-2"},t.password)),i.a.createElement("div",{className:"form-group"},i.a.createElement("label",{htmlFor:"repassword"},"Retype password"),i.a.createElement("input",{name:"repassword",className:"form-control form-control-rounded",type:"password",onChange:n,onBlur:s,value:a.repassword}),t.repassword&&r.repassword&&i.a.createElement("div",{className:"text-danger mt-1 ml-2"},t.repassword)),i.a.createElement("button",{className:"btn btn-primary btn-block btn-rounded mt-3",type:"submit"},"Sign Up"))}))))))))}}]),t}(o.Component),f=c.object().shape({username:c.string().required("email is required"),email:c.string().email("Invalid email").required("email is required"),password:c.string().min(8,"Password must be 8 character long").required("password is required"),repassword:c.string().required("repeat password").oneOf([c.ref("password")],"Passwords must match")});a.default=Object(u.b)((function(e){return{user:e.user}}),{})(p)},909:function(e,a,t){"use strict";a.a=function(){for(var e=arguments.length,a=new Array(e),t=0;t<e;t++)a[t]=arguments[t];return a.filter((function(e){return null!=e})).reduce((function(e,a){if("function"!==typeof a)throw new Error("Invalid Argument Type, must only provide functions, undefined, or null.");return null===e?a:function(){for(var t=arguments.length,r=new Array(t),n=0;n<t;n++)r[n]=arguments[n];e.apply(this,r),a.apply(this,r)}}),null)}},910:function(e,a,t){"use strict";var r=t(7),n=t(14),s=t(0),l=t.n(s),o=t(909);function i(e){return!e||"#"===e.trim()}var m=l.a.forwardRef((function(e,a){var t=e.as,s=void 0===t?"a":t,m=e.disabled,c=e.onKeyDown,u=Object(n.a)(e,["as","disabled","onKeyDown"]),d=function(e){var a=u.href,t=u.onClick;(m||i(a))&&e.preventDefault(),m?e.stopPropagation():t&&t(e)};return i(u.href)&&(u.role=u.role||"button",u.href=u.href||"#"),m&&(u.tabIndex=-1,u["aria-disabled"]=!0),l.a.createElement(s,Object(r.a)({ref:a},u,{onClick:d,onKeyDown:Object(o.a)((function(e){" "===e.key&&(e.preventDefault(),d(e))}),c)}))}));m.displayName="SafeAnchor",a.a=m}}]);
//# sourceMappingURL=89.c5a69531.chunk.js.map