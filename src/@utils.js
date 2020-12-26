import moment from "moment";
import * as titleCase from "titlecase";



export function debounce(func, wait, immediate) {
  var timeout;
  return function() {
    var context = this,
      args = arguments;
    clearTimeout(timeout);
    timeout = setTimeout(function() {
      timeout = null;
      if (!immediate) func.apply(context, args);
    }, wait);
    if (immediate && !timeout) func.apply(context, args);
  };
}

export function setProgressBar(departmentaggregate){

}

export function isMobile() {
  if (window) {
    return window.matchMedia(`(max-width: 767px)`).matches;
  }
  return false;
}

export function isMdScreen() {
  if (window) {
    return window.matchMedia(`(max-width: 1199px)`).matches;
  }
  return false;
}

function currentYPosition() {
  if (!window) {
    return;
  }
  // Firefox, Chrome, Opera, Safari
  if (window.pageYOffset) return window.pageYOffset;
  // Internet Explorer 6 - standards mode
  if (document.documentElement && document.documentElement.scrollTop)
    return document.documentElement.scrollTop;
  // Internet Explorer 6, 7 and 8
  if (document.body.scrollTop) return document.body.scrollTop;
  return 0;
}

function elmYPosition(elm) {
  var y = elm.offsetTop;
  var node = elm;
  while (node.offsetParent && node.offsetParent !== document.body) {
    node = node.offsetParent;
    y += node.offsetTop;
  }
  return y;
}

export function scrollTo(scrollableElement, elmID) {
  var elm = document.getElementById(elmID);
  if (!elmID || !elm) {
    return;
  }
  var startY = currentYPosition();
  var stopY = elmYPosition(elm);
  var distance = stopY > startY ? stopY - startY : startY - stopY;
  if (distance < 100) {
    scrollTo(0, stopY);
    return;
  }
  var speed = Math.round(distance / 50);
  if (speed >= 20) speed = 20;
  var step = Math.round(distance / 25);
  var leapY = stopY > startY ? startY + step : startY - step;
  var timer = 0;
  if (stopY > startY) {
    for (var i = startY; i < stopY; i += step) {
      setTimeout(
        (function(leapY) {
          return () => {
            scrollableElement.scrollTo(0, leapY);
          };
        })(leapY),
        timer * speed
      );
      leapY += step;
      if (leapY > stopY) leapY = stopY;
      timer++;
    }
    return;
  }
  for (let i = startY; i > stopY; i -= step) {
    setTimeout(
      (function(leapY) {
        return () => {
          scrollableElement.scrollTo(0, leapY);
        };
      })(leapY),
      timer * speed
    );
    leapY -= step;
    if (leapY < stopY) leapY = stopY;
    timer++;
  }
  return false;
}

export function getTimeDifference(date) {
  let difference =
    moment(new Date(), "DD/MM/YYYY HH:mm:ss").diff(
      moment(date, "DD/MM/YYYY HH:mm:ss")
    ) / 1000;

  if (difference < 60) return `${Math.floor(difference)} seconds`;
  else if (difference < 3600) return `${Math.floor(difference / 60)} minutes`;
  else if (difference < 86400) return `${Math.floor(difference / 3660)} hours`;
  else if (difference < 86400 * 30)
    return `${Math.floor(difference / 86400)} days`;
  else if (difference < 86400 * 30 * 12)
    return `${Math.floor(difference / 86400 / 30)} months`;
  else return `${(difference / 86400 / 30 / 12).toFixed(1)} years`;
}

export function generateRandomId() {
  let tempId = Math.random().toString();
  let uid = tempId.substr(2, tempId.length - 1);
  return uid;
}

export function getQueryParam(prop) {
  var params = {};
  var search = decodeURIComponent(
    window.location.href.slice(window.location.href.indexOf("?") + 1)
  );
  var definitions = search.split("&");
  definitions.forEach(function(val, key) {
    var parts = val.split("=", 2);
    params[parts[0]] = parts[1];
  });
  return prop && prop in params ? params[prop] : params;
}

export function classList(classes) {
  return Object.entries(classes)
    .filter(entry => entry[1])
    .map(entry => entry[0])
    .join(" ");
}

export function initCodeViewer() {
  if(!document) return;
  const pre = document.getElementsByTagName('pre');
  if(!pre.length) return;
  Array.prototype.map.call(pre, p => {
    // console.log(p);
    p.classList.add('collapsed');
    p.addEventListener('click', (e) => {
      console.log(e.target);
      e.target.classList.remove('collapsed');
    })
  });

  // pre.map(p => {
  //   console.log(p)
  // })

}

export function formatDate(date){

  return moment(date).format('Do MMM, YYYY')

}

export function processErrors(error){
  let errorMessage = '';

  if(error){
    const errorData = error.data;
  const errorStatus = error.status;
  if(errorStatus == 403){
    errorMessage = errorData.detail;
  }else if(errorStatus == 400){
    for(let key in errorData){
      const msg_line = (typeof errorData[key] == 'object') ? errorData[key][0].replace('This',key): errorData[key]
      errorMessage += `${msg_line}\r\n`
    }
  }
  }else{
    errorMessage = 'Server has gone away!. Please try again in a bit.'
  }

  return errorMessage;

}

export function formatNumber(numberValue, toDecimal=true, no_places = 2){
  let val = numberValue || 0;
  let stringValue = toDecimal ? parseFloat(val).toFixed(no_places) : val.toString();
  return stringValue.replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');

}
export function isValid(schema,initialValues){
    return schema.isValidSync(initialValues);
}

export function getGraphColors(){
  let colors = [];
  while (colors.length < 100) {
    let color = Math.floor((Math.random()*1000000)+1);
    const colorCaptured = colors.indexOf(color) >= 0;
    if(!colorCaptured){
      colors.push("#" + ("000000" + color.toString(16)).slice(-6));

    }

    // while (colors.indexOf(color) >= 0);
  }
  return colors;

}


export function toTiltle(stringVal){
  return titleCase(stringVal)
}


export function getComponentPermissions(componentName, authProps){

  const componentPermissions = [];
  if(authProps){
    authProps.forEach((action)=>{
      const permission = `${componentName}__${action}`;
      componentPermissions.push(permission);
    })
  }

  return componentPermissions;


}


export function comparePermissions(userPermissions, componentPermissions){
  if(!userPermissions || !componentPermissions) return [];
  return componentPermissions.filter(p => userPermissions.includes(p));
}
