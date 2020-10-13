import {
    NotificationManager
  } from "react-notifications";


export default class AppNotification {
    constructor(props){
        const notificationType = props.type;
        const timeOut = props.timeOut || 10000;
        const message = props.msg
        const title = notificationType;
          NotificationManager[notificationType](
              message,
              title,
              timeOut
            );
        }


        
         
  }

   
