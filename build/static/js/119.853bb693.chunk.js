(this["webpackJsonpbms-pro"]=this["webpackJsonpbms-pro"]||[]).push([[119],{2533:function(e,a,t){"use strict";t.r(a);var n=t(18),i=t(25),l=t(30),r=t(29),s=t(0),o=t.n(s),c=t(189),d=t(1261),p=t.n(d),m=t(1263),u=t.n(m),g=t(2331),b=t.n(g),h=t(13),x=t.n(h),T=function(e){Object(l.a)(t,e);var a=Object(r.a)(t);function t(){var e;Object(n.a)(this,t);for(var i=arguments.length,l=new Array(i),r=0;r<i;r++)l[r]=arguments[r];return(e=a.call.apply(a,[this].concat(l))).state={userList:[]},e.columns=[{dataField:"index",text:"No",editable:!1},{dataField:"name",text:"User Name"},{dataField:"email",text:"User Email",editable:!1},{dataField:"company",text:"Company"},{dataField:"balance",text:"Balance",align:"center",headerAlign:"center"},{dataField:"age",text:"Age",align:"center",headerAlign:"center",editable:function(e,a,t,n){return e>17}}],e.paginationOptions={paginationSize:5,pageStartIndex:1,firstPageText:"First",prePageText:"Back",nextPageText:"Next",lastPageText:"Last",nextPageTitle:"First page",prePageTitle:"Pre page",firstPageTitle:"Next page",lastPageTitle:"Last page",showTotal:!0,totalSize:e.state.userList.length},e}return Object(i.a)(t,[{key:"componentDidMount",value:function(){var e=this;x.a.get("/api/user/all").then((function(a){var t=a.data.map((function(e,a){var t=e.id,n=e.name,i=e.email,l=e.age,r=e.company;return{id:t,name:n,email:i,age:l,balance:e.balance,company:r,index:a+1}}));e.setState({userList:t})}))}},{key:"render",value:function(){var e=this.state.userList;return o.a.createElement("div",null,o.a.createElement(c.a,{routeSegments:[{name:"Dashboard",path:"/"},{name:"Data Table",path:"data-table"},{name:"Cell Editor Data Table"}]}),o.a.createElement(c.h,{title:"Cell Editor Data Table"},o.a.createElement("p",null,o.a.createElement("b",null,"Note: ")," Age under 18 can't be edited"),o.a.createElement(p.a,{bootstrap4:!0,keyField:"id",data:e,columns:this.columns,cellEdit:b()({mode:"click"}),pagination:u()(this.paginationOptions),noDataIndication:"Table is empty"})))}}]),t}(s.Component);a.default=T}}]);
//# sourceMappingURL=119.853bb693.chunk.js.map