(this["webpackJsonpbms-pro"]=this["webpackJsonpbms-pro"]||[]).push([[72],{1031:function(e,a,t){"use strict";var n=t(7),l=t(14),r=t(9),s=t.n(r),i=t(0),c=t.n(i),o=t(58),m=t(910),u=c.a.forwardRef((function(e,a){var t=e.bsPrefix,r=e.variant,i=e.size,u=e.active,d=e.className,f=e.block,p=e.type,b=e.as,v=Object(l.a)(e,["bsPrefix","variant","size","active","className","block","type","as"]),h=Object(o.a)(t,"btn"),g=s()(d,h,u&&"active",h+"-"+r,f&&h+"-block",i&&h+"-"+i);if(v.href)return c.a.createElement(m.a,Object(n.a)({},v,{as:b,ref:a,className:s()(g,v.disabled&&"disabled")}));a&&(v.ref=a),p?v.type=p:b||(v.type="button");var E=b||"button";return c.a.createElement(E,Object(n.a)({},v,{className:g}))}));u.displayName="Button",u.defaultProps={variant:"primary",active:!1,disabled:!1},a.a=u},1032:function(e,a,t){"use strict";var n=t(7),l=t(14),r=t(9),s=t.n(r),i=t(0),c=t.n(i),o=t(58),m=["xl","lg","md","sm","xs"],u=c.a.forwardRef((function(e,a){var t=e.bsPrefix,r=e.className,i=e.noGutters,u=e.as,d=void 0===u?"div":u,f=Object(l.a)(e,["bsPrefix","className","noGutters","as"]),p=Object(o.a)(t,"row"),b=p+"-cols",v=[];return m.forEach((function(e){var a,t=f[e];delete f[e];var n="xs"!==e?"-"+e:"";null!=(a=null!=t&&"object"===typeof t?t.cols:t)&&v.push(""+b+n+"-"+a)})),c.a.createElement(d,Object(n.a)({ref:a},f,{className:s.a.apply(void 0,[r,p,i&&"no-gutters"].concat(v))}))}));u.displayName="Row",u.defaultProps={noGutters:!1},a.a=u},2534:function(e,a,t){"use strict";t.r(a);var n=t(2),l=t(10),r=t(31),s=t(18),i=t(25),c=t(30),o=t(29),m=t(0),u=t.n(m),d=t(189),f=t(1031),p=t(323),b=t(1032),v=t(917),h=t(998),g=function(e){Object(c.a)(t,e);var a=Object(o.a)(t);function t(){var e;Object(s.a)(this,t);for(var i=arguments.length,c=new Array(i),o=0;o<i;o++)c[o]=arguments[o];return(e=a.call.apply(a,[this].concat(c))).state={dragClass:"",files:[],statusList:[],queProgress:0},e.handleFileSelect=function(a){var t,n=a.target.files,l=[],s=Object(r.a)(n);try{for(s.s();!(t=s.n()).done;){var i=t.value;l.push({file:i,uploading:!1,error:!1,progress:0})}}catch(c){s.e(c)}finally{s.f()}e.setState({files:[].concat(l)})},e.handleDragOver=function(a){a.preventDefault(),e.setState({dragClass:"drag-shadow"})},e.handleDrop=function(a){a.preventDefault(),a.persist();var t,n=a.dataTransfer.files,l=[],s=Object(r.a)(n);try{for(s.s();!(t=s.n()).done;){var i=t.value;l.push({file:i,uploading:!1,error:!1,progress:0})}}catch(c){s.e(c)}finally{s.f()}return e.setState({dragClass:"",files:[].concat(l)}),!1},e.handleDragStart=function(a){e.setState({dragClass:"drag-shadow"})},e.handleSingleRemove=function(a){var t=Object(l.a)(e.state.files);t.splice(a,1),e.setState({files:Object(l.a)(t)})},e.handleAllRemove=function(){e.setState({files:[],queProgress:0})},e.uploadSingleFile=function(a){var t=Object(l.a)(e.state.files),r=e.state.files[a];t[a]=Object(n.a)(Object(n.a)({},r),{},{uploading:!0,error:!1}),e.setState({files:Object(l.a)(t)})},e.uploadAllFile=function(){var a=[];e.state.files.map((function(e){return a.push(Object(n.a)(Object(n.a)({},e),{},{uploading:!0,error:!1})),e})),e.setState({files:[].concat(a),queProgress:35})},e.handleSingleCancel=function(a){var t=Object(l.a)(e.state.files),r=e.state.files[a];t[a]=Object(n.a)(Object(n.a)({},r),{},{uploading:!1,error:!0}),e.setState({files:Object(l.a)(t)})},e.handleCancelAll=function(){var a=[];e.state.files.map((function(e){return a.push(Object(n.a)(Object(n.a)({},e),{},{uploading:!1,error:!0})),e})),e.setState({files:[].concat(a),queProgress:0})},e}return Object(i.a)(t,[{key:"render",value:function(){var e=this,a=this.state,t=a.dragClass,n=a.files,l=a.queProgress,r=0===n.length;return u.a.createElement("div",null,u.a.createElement(d.a,{routeSegments:[{name:"Home",path:"/"},{name:"Extra Kits",path:"/extra-kits"},{name:"Upload"}]}),u.a.createElement(d.h,{title:"File Upload"},u.a.createElement("div",{className:"d-flex flex-wrap mb-4"},u.a.createElement("label",{htmlFor:"upload-single-file"},u.a.createElement(f.a,{className:"btn-rounded",as:"span"},u.a.createElement("div",{className:"flex flex-middle"},u.a.createElement("i",{className:"i-Share-on-Cloud"}," "),u.a.createElement("span",null,"Single File")))),u.a.createElement("input",{className:"d-none",onChange:this.handleFileSelect,id:"upload-single-file",type:"file"}),u.a.createElement("div",{className:"px-3"}),u.a.createElement("label",{htmlFor:"upload-multiple-file"},u.a.createElement(f.a,{className:"btn-rounded",as:"span"},u.a.createElement("div",{className:"flex flex-middle"},u.a.createElement("i",{className:"i-Share-on-Cloud "}," "),u.a.createElement("span",null,"Multiple File")))),u.a.createElement("input",{className:"d-none",onChange:this.handleFileSelect,id:"upload-multiple-file",type:"file",multiple:!0})),u.a.createElement("div",{className:"".concat(t," dropzone mb-4 d-flex justify-content-center align-items-center"),onDragEnter:this.handleDragStart,onDragOver:this.handleDragOver,onDrop:this.handleDrop},r?u.a.createElement("span",null,"Drop your files here"):u.a.createElement("h5",{className:"m-0"},n.length," file",n.length>1?"s":""," selected...")),u.a.createElement(p.a,{className:"mb-4"},u.a.createElement(b.a,{className:"align-items-center p-3"},u.a.createElement(v.a,{lg:4,md:4},"Name"),u.a.createElement(v.a,{lg:1,md:1},"Size"),u.a.createElement(v.a,{lg:2,md:2},"Progress"),u.a.createElement(v.a,{lg:1,md:1},"Status"),u.a.createElement(v.a,{lg:4,md:4},"Actions")),u.a.createElement("hr",{className:"mt-0 mb-3"}),r&&u.a.createElement("p",{className:"p-3 py-0"},"Que is empty"),n.map((function(a,t){var n=a.file,l=a.uploading,r=a.error,s=a.progress;return u.a.createElement(b.a,{className:"align-items-center px-3",key:n.name},u.a.createElement(v.a,{lg:4,md:4,sm:12,xs:12,className:"mb-3"},n.name),u.a.createElement(v.a,{lg:1,md:1,sm:12,xs:12,className:"mb-3"},(n.size/1024/1024).toFixed(1)," MB"),u.a.createElement(v.a,{lg:2,md:2,sm:12,xs:12,className:"mb-3"},u.a.createElement(h.a,{now:s,variant:"success",className:"progress-thin"})),u.a.createElement(v.a,{lg:1,md:1,sm:12,xs:12,className:"mb-3"},r&&u.a.createElement("i",{className:"i-Information text-danger text-18"}," ")),u.a.createElement(v.a,{lg:4,md:4,sm:12,xs:12,className:"mb-3"},u.a.createElement("div",{className:"d-flex"},u.a.createElement(f.a,{disabled:l,onClick:function(){return e.uploadSingleFile(t)}},"Upload"),u.a.createElement(f.a,{className:"mx-8",variant:"warning",disabled:!l,onClick:function(){return e.handleSingleCancel(t)}},"Cancel"),u.a.createElement(f.a,{variant:"danger",onClick:function(){return e.handleSingleRemove(t)}},"Remove"))))}))),u.a.createElement("div",null,u.a.createElement("p",{className:"m-0"},"Queue progress:"),u.a.createElement("div",{className:"py-3"},u.a.createElement(h.a,{now:l,variant:"success",className:"progress-thin"})),u.a.createElement("div",{className:"flex"},u.a.createElement(f.a,{disabled:r,onClick:this.uploadAllFile},"Upload All"),u.a.createElement(f.a,{className:"mx-8",variant:"warning",disabled:r,onClick:this.handleCancelAll},"Cancel All"),!r&&u.a.createElement(f.a,{variant:"danger",onClick:this.handleAllRemove},"Remove All")))))}}]),t}(m.Component);a.default=g},882:function(e,a,t){"use strict";t.d(a,"b",(function(){return r})),t.d(a,"a",(function(){return s}));var n=t(0),l=t.n(n);function r(e,a){var t=0;return l.a.Children.map(e,(function(e){return l.a.isValidElement(e)?a(e,t++):e}))}function s(e,a){var t=0;l.a.Children.forEach(e,(function(e){l.a.isValidElement(e)&&a(e,t++)}))}},909:function(e,a,t){"use strict";a.a=function(){for(var e=arguments.length,a=new Array(e),t=0;t<e;t++)a[t]=arguments[t];return a.filter((function(e){return null!=e})).reduce((function(e,a){if("function"!==typeof a)throw new Error("Invalid Argument Type, must only provide functions, undefined, or null.");return null===e?a:function(){for(var t=arguments.length,n=new Array(t),l=0;l<t;l++)n[l]=arguments[l];e.apply(this,n),a.apply(this,n)}}),null)}},910:function(e,a,t){"use strict";var n=t(7),l=t(14),r=t(0),s=t.n(r),i=t(909);function c(e){return!e||"#"===e.trim()}var o=s.a.forwardRef((function(e,a){var t=e.as,r=void 0===t?"a":t,o=e.disabled,m=e.onKeyDown,u=Object(l.a)(e,["as","disabled","onKeyDown"]),d=function(e){var a=u.href,t=u.onClick;(o||c(a))&&e.preventDefault(),o?e.stopPropagation():t&&t(e)};return c(u.href)&&(u.role=u.role||"button",u.href=u.href||"#"),o&&(u.tabIndex=-1,u["aria-disabled"]=!0),s.a.createElement(r,Object(n.a)({ref:a},u,{onClick:d,onKeyDown:Object(i.a)((function(e){" "===e.key&&(e.preventDefault(),d(e))}),m)}))}));o.displayName="SafeAnchor",a.a=o},917:function(e,a,t){"use strict";var n=t(7),l=t(14),r=t(9),s=t.n(r),i=t(0),c=t.n(i),o=t(58),m=["xl","lg","md","sm","xs"],u=c.a.forwardRef((function(e,a){var t=e.bsPrefix,r=e.className,i=e.as,u=void 0===i?"div":i,d=Object(l.a)(e,["bsPrefix","className","as"]),f=Object(o.a)(t,"col"),p=[],b=[];return m.forEach((function(e){var a,t,n,l=d[e];if(delete d[e],"object"===typeof l&&null!=l){var r=l.span;a=void 0===r||r,t=l.offset,n=l.order}else a=l;var s="xs"!==e?"-"+e:"";a&&p.push(!0===a?""+f+s:""+f+s+"-"+a),null!=n&&b.push("order"+s+"-"+n),null!=t&&b.push("offset"+s+"-"+t)})),p.length||p.push(f),c.a.createElement(u,Object(n.a)({},d,{ref:a,className:s.a.apply(void 0,[r].concat(p,b))}))}));u.displayName="Col",a.a=u},998:function(e,a,t){"use strict";var n=t(7),l=t(14),r=t(9),s=t.n(r),i=t(0),c=t.n(i),o=t(58),m=t(882);function u(e,a,t){var n=(e-a)/(t-a)*100;return Math.round(1e3*n)/1e3}function d(e,a){var t,r=e.min,i=e.now,o=e.max,m=e.label,d=e.srOnly,f=e.striped,p=e.animated,b=e.className,v=e.style,h=e.variant,g=e.bsPrefix,E=Object(l.a)(e,["min","now","max","label","srOnly","striped","animated","className","style","variant","bsPrefix"]);return c.a.createElement("div",Object(n.a)({ref:a},E,{role:"progressbar",className:s()(b,g+"-bar",(t={},t["bg-"+h]=h,t[g+"-bar-animated"]=p,t[g+"-bar-striped"]=p||f,t)),style:Object(n.a)({width:u(i,r,o)+"%"},v),"aria-valuenow":i,"aria-valuemin":r,"aria-valuemax":o}),d?c.a.createElement("span",{className:"sr-only"},m):m)}var f=c.a.forwardRef((function(e,a){var t=e.isChild,r=Object(l.a)(e,["isChild"]);if(r.bsPrefix=Object(o.a)(r.bsPrefix,"progress"),t)return d(r,a);var u=r.min,f=r.now,p=r.max,b=r.label,v=r.srOnly,h=r.striped,g=r.animated,E=r.bsPrefix,N=r.variant,O=r.className,x=r.children,y=Object(l.a)(r,["min","now","max","label","srOnly","striped","animated","bsPrefix","variant","className","children"]);return c.a.createElement("div",Object(n.a)({ref:a},y,{className:s()(O,E)}),x?Object(m.b)(x,(function(e){return Object(i.cloneElement)(e,{isChild:!0})})):d({min:u,now:f,max:p,label:b,srOnly:v,striped:h,animated:g,bsPrefix:E,variant:N},a))}));f.displayName="ProgressBar",f.defaultProps={min:0,max:100,animated:!1,isChild:!1,srOnly:!1,striped:!1},a.a=f}}]);
//# sourceMappingURL=72.69e3dd4f.chunk.js.map