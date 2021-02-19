(this["webpackJsonpbms-pro"]=this["webpackJsonpbms-pro"]||[]).push([[130],{2517:function(e,a,t){"use strict";t.r(a);var l=t(18),i=t(25),r=t(30),n=t(29),m=t(0),s=t.n(m),o=t(189),d=t(1002),c=t(999),u=t(32),v=function(e){Object(r.a)(t,e);var a=Object(n.a)(t);function t(){var e;Object(l.a)(this,t);for(var i=arguments.length,r=new Array(i),n=0;n<i;n++)r[n]=arguments[n];return(e=a.call.apply(a,[this].concat(r))).state={firstName:"",lastName:"",phone:"",username:"",city:"",cardNumber:"4444444444444444",state:"",password:"",repassword:"",zip:"",agree:[],checkbox1:"",checkbox2:"",radio:"",range:{startDate:new Date,endDate:function(){var e=new Date;return e.setDate(e.getDate()+7),e}()}},e.handleSubmit=function(e,a){a.setSubmitting;console.log(e)},e}return Object(i.a)(t,[{key:"render",value:function(){return s.a.createElement("div",null,s.a.createElement(o.a,{routeSegments:[{name:"Forms",path:"/forms"},{name:"Form Validation"}]}),s.a.createElement("div",{className:"row"},s.a.createElement("div",{className:"col-md-8"},s.a.createElement("p",null,"For custom Bootstrap form validation messages, you\u2019ll need to add the ",s.a.createElement("code",null,"novalidate")," boolean attribute to your",s.a.createElement("code",null,"form"),". This disables the browser default feedback tooltips, but still provides access to the form validation APIs in JavaScript. Try to submit the form below; our JavaScript will intercept the submit button and relay feedback to you. When attempting to submit, you\u2019ll see the ",s.a.createElement("code",null,":invalid")," and",s.a.createElement("code",null,":valid")," styles applied to your form controls."),s.a.createElement("div",{className:"card mb-4"},s.a.createElement("div",{className:"card-body"},s.a.createElement(d.b,{initialValues:this.state,validationSchema:p,onSubmit:this.handleSubmit},(function(e){var a=e.values,t=e.errors,l=e.touched,i=e.handleChange,r=e.handleBlur,n=e.handleSubmit;e.isSubmitting;return s.a.createElement("form",{className:"needs-validation",onSubmit:n,noValidate:!0},s.a.createElement("div",{className:"form-row"},s.a.createElement("div",{className:Object(u.a)({"col-md-4 mb-3":!0,"valid-field":!t.firstName&&l.firstName,"invalid-field":t.firstName&&l.firstName})},s.a.createElement("label",{htmlFor:"validationCustom202"},"First name"),s.a.createElement("input",{type:"text",className:"form-control",id:"validationCustom202",placeholder:"First name",name:"firstName",value:a.firstName,onChange:i,onBlur:r,required:!0}),s.a.createElement("div",{className:"valid-feedback"},"Looks good!"),s.a.createElement("div",{className:"invalid-feedback"},"First name is required")),s.a.createElement("div",{className:Object(u.a)({"col-md-4 mb-3":!0,"valid-field":l.lastName&&!t.lastName,"invalid-field":l.lastName&&t.lastName})},s.a.createElement("label",{htmlFor:"validationCustom222"},"Last name"),s.a.createElement("input",{type:"text",className:"form-control",id:"validationCustom222",placeholder:"Last name",value:a.lastName,onChange:i,onBlur:r,name:"lastName",required:!0}),s.a.createElement("div",{className:"valid-feedback"},"Looks good!"),s.a.createElement("div",{className:"invalid-feedback"},"Last name is required")),s.a.createElement("div",{className:Object(u.a)({"col-md-4 mb-3":!0,"valid-field":l.username&&!t.username,"invalid-field":l.username&&t.username})},s.a.createElement("label",{htmlFor:"validationCustomUsername"},"Username"),s.a.createElement("div",{className:"input-group"},s.a.createElement("div",{className:"input-group-prepend"},s.a.createElement("span",{className:"input-group-text",id:"inputGroupPrepend"},"@")),s.a.createElement("input",{type:"text",className:"form-control",id:"validationCustomUsername",placeholder:"Username","aria-describedby":"inputGroupPrepend",name:"username",onChange:i,onBlur:r,value:a.username,required:!0}),s.a.createElement("div",{className:"invalid-feedback"},"Please choose a username.")))),s.a.createElement("div",{className:"form-row"},s.a.createElement("div",{className:Object(u.a)({"col-md-4 mb-3":!0,"valid-field":l.city&&!t.city,"invalid-field":l.city&&t.city})},s.a.createElement("label",{htmlFor:"validationCustom03"},"City"),s.a.createElement("input",{type:"text",className:"form-control",id:"validationCustom03",placeholder:"City",name:"city",value:a.city,onChange:i,onBlur:r,required:!0}),s.a.createElement("div",{className:"invalid-feedback"},"Please provide a valid city.")),s.a.createElement("div",{className:Object(u.a)({"col-md-4 mb-3":!0,"valid-field":l.state&&!t.state,"invalid-field":l.state&&t.state})},s.a.createElement("label",{htmlFor:"validationCustom204"},"State"),s.a.createElement("input",{type:"text",className:"form-control",id:"validationCustom204",placeholder:"State",name:"state",value:a.state,onChange:i,onBlur:r,required:!0}),s.a.createElement("div",{className:"invalid-feedback"},"Please provide a valid state.")),s.a.createElement("div",{className:Object(u.a)({"col-md-4 mb-3":!0,"valid-field":l.zip&&!t.zip,"invalid-field":l.zip&&t.zip})},s.a.createElement("label",{htmlFor:"validationCustom05"},"Zip"),s.a.createElement("input",{type:"number",className:"form-control",id:"validationCustom05",placeholder:"Zip",name:"zip",value:a.zip,onChange:i,onBlur:r,required:!0}),s.a.createElement("div",{className:"invalid-feedback"},"Please provide a valid zip."))),s.a.createElement("div",{className:Object(u.a)({"col-md-4 mb-3":!0,"valid-field":l.agree&&!t.agree&&a.agree.length,"invalid-field":l.agree&&t.agree&&!a.agree.length})},s.a.createElement("label",{className:"checkbox checkbox-primary"},s.a.createElement("input",{type:"checkbox",name:"agree",value:a.agree,checked:a.agree.length,onChange:i,onBlur:r,required:!0}),s.a.createElement("span",null,"Agree to terms and conditions"),s.a.createElement("span",{className:"checkmark"})),s.a.createElement("div",{className:"invalid-feedback"},"You must agree before submitting.")),s.a.createElement("button",{className:"btn btn-primary",type:"submit"},"Submit form"))}))))),s.a.createElement("div",{className:"col-md-8"},s.a.createElement("div",{className:"card"},s.a.createElement("div",{className:"card-body"},s.a.createElement("div",{className:"card-title"},"Tooltip message"),s.a.createElement(d.b,{initialValues:this.state,validationSchema:p,onSubmit:this.handleSubmit},(function(e){var a=e.values,t=e.errors,l=e.touched,i=e.handleChange,r=e.handleBlur,n=e.handleSubmit;e.isSubmitting;return s.a.createElement("form",{className:"needs-validation",onSubmit:n,noValidate:!0},s.a.createElement("div",{className:"form-row"},s.a.createElement("div",{className:Object(u.a)({"col-md-4 mb-3":!0,"valid-field":!t.firstName&&l.firstName,"invalid-field":t.firstName&&l.firstName})},s.a.createElement("label",{htmlFor:"validationCustom01"},"First name"),s.a.createElement("input",{type:"text",className:"form-control",id:"validationCustom01",placeholder:"First name",name:"firstName",value:a.firstName,onChange:i,onBlur:r,required:!0}),s.a.createElement("div",{className:"valid-tooltip"},"Looks good!"),s.a.createElement("div",{className:"invalid-tooltip"},"First name is required")),s.a.createElement("div",{className:Object(u.a)({"col-md-4 mb-3":!0,"valid-field":l.lastName&&!t.lastName,"invalid-field":l.lastName&&t.lastName})},s.a.createElement("label",{htmlFor:"validationCustom02"},"Last name"),s.a.createElement("input",{type:"text",className:"form-control",id:"validationCustom02",placeholder:"Last name",value:a.lastName,onChange:i,onBlur:r,name:"lastName",required:!0}),s.a.createElement("div",{className:"valid-tooltip"},"Looks good!"),s.a.createElement("div",{className:"invalid-tooltip"},"Last name is required")),s.a.createElement("div",{className:Object(u.a)({"col-md-4 mb-3":!0,"valid-field":l.username&&!t.username,"invalid-field":l.username&&t.username})},s.a.createElement("label",{htmlFor:"validationCustomUsername1"},"Username"),s.a.createElement("div",{className:"input-group"},s.a.createElement("div",{className:"input-group-prepend"},s.a.createElement("span",{className:"input-group-text",id:"inputGroupPrepend"},"@")),s.a.createElement("input",{type:"text",className:"form-control",id:"validationCustomUsername1",placeholder:"Username","aria-describedby":"inputGroupPrepend",name:"username",onChange:i,onBlur:r,value:a.username,required:!0}),s.a.createElement("div",{className:"invalid-tooltip"},"Please choose a username.")))),s.a.createElement("div",{className:"form-row"},s.a.createElement("div",{className:Object(u.a)({"col-md-4 mb-3":!0,"valid-field":l.city&&!t.city,"invalid-field":l.city&&t.city})},s.a.createElement("label",{htmlFor:"validationCustom203"},"City"),s.a.createElement("input",{type:"text",className:"form-control",id:"validationCustom203",placeholder:"City",name:"city",value:a.city,onChange:i,onBlur:r,required:!0}),s.a.createElement("div",{className:"invalid-tooltip"},"Please provide a valid city.")),s.a.createElement("div",{className:Object(u.a)({"col-md-4 mb-3":!0,"valid-field":l.state&&!t.state,"invalid-field":l.state&&t.state})},s.a.createElement("label",{htmlFor:"validationCustom04"},"State"),s.a.createElement("input",{type:"text",className:"form-control",id:"validationCustom04",placeholder:"State",name:"state",value:a.state,onChange:i,onBlur:r,required:!0}),s.a.createElement("div",{className:"invalid-tooltip"},"Please provide a valid state.")),s.a.createElement("div",{className:Object(u.a)({"col-md-4 mb-3":!0,"valid-field":l.zip&&!t.zip,"invalid-field":l.zip&&t.zip})},s.a.createElement("label",{htmlFor:"validationCustom205"},"Zip"),s.a.createElement("input",{type:"number",className:"form-control",id:"validationCustom205",placeholder:"Zip",name:"zip",value:a.zip,onChange:i,onBlur:r,required:!0}),s.a.createElement("div",{className:"invalid-tooltip"},"Please provide a valid zip."))),s.a.createElement("div",{className:Object(u.a)({"col-md-4 mb-3":!0,"valid-field":l.agree&&!t.agree&&a.agree.length,"invalid-field":l.agree&&t.agree&&!a.agree.length})},s.a.createElement("label",{className:"checkbox checkbox-primary"},s.a.createElement("input",{type:"checkbox",name:"agree",value:a.agree,checked:a.agree.length,onChange:i,onBlur:r,required:!0}),s.a.createElement("span",null,"Agree to terms and conditions"),s.a.createElement("span",{className:"checkmark"})),s.a.createElement("div",{className:"invalid-tooltip"},"You must agree before submitting.")),s.a.createElement("button",{className:"btn btn-primary",type:"submit"},"Submit form"))})))))))}}]),t}(m.Component),p=c.object().shape({firstName:c.string().required("first name is required"),lastName:c.string().required("last name is required"),username:c.string().required("select any option"),city:c.string().required("birthDay is required"),zip:c.number().required("email is required"),agree:c.string().required("Required"),state:c.string().required("Required")});c.object().shape({firstName:c.string().required("first name is required"),lastName:c.string().required("last name is required"),username:c.string().required("select any option"),city:c.string().required("birthDay is required"),zip:c.number().required("email is required"),agree:c.string().required("Required"),state:c.string().required("Required")});a.default=v}}]);
//# sourceMappingURL=130.43418e8e.chunk.js.map