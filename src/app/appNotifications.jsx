import {
    NotificationManager
  } from "react-notifications";
// import { renderToStaticMarkup } from "react-dom/server";


export default class AppNotification {
    constructor(props){
        const notificationType = props.type;
        const timeOut = props.timeOut || 10000;
        let message = props.msg
        // if(message.startsWith('<!DOCTYPE')){
        //   message = renderToStaticMarkup(message);
        // }
        const title = notificationType;
          NotificationManager[notificationType](
              message,
              title,
              timeOut
            );
        }




  }
