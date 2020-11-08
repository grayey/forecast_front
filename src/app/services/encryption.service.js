import * as CryptoJS from "crypto-js";
import * as dotenv from "dotenv";
dotenv.config();
/**
 *
 * @param {*} data
 *
 * This method is used to encrypt tokens
 */
export const encryptData = (data) =>{

  const encryptionKey = process.env.ENCRYPTION_KEY;
  const ciphertext = CryptoJS.AES.encrypt(JSON.stringify(data), encryptionKey).toString();
  return ciphertext;
}


/**
 *
 * @param {*} data
 *
 * This function is used to decrypt tokens
 */
export const decryptData = (ciphertext)=>{
  let decryptionKey = process.env.REACT_APP_DECRYPTION_KEY;
  decryptionKey = decryptionKey.slice(0,16);
  // because backend was prepending b' and appending '

  const str_length = ciphertext.length;
  const str = ciphertext.slice(2,str_length-1);
  console.log("STRTTRT", str)
  return new_decrypt(str, decryptionKey)


  // const bytes  = CryptoJS.AES.decrypt(str, decryptionKey);
  // // const decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
  //   console.log(bytes, "BYTESS", "dddd")
  //
  //  // console.log(str,"Sttrtrttrtr", bytes.toString(CryptoJS.enc.Utf8))
  // return ciphertext;

}

export const new_decrypt = (ciphertext, decryptionKey)=>{


  // Decode the base64 data so we can separate iv and crypt text.
   // var rawData = atob(data);
   // Split by 16 because my IV size
   var iv = ciphertext.substring(0, 16);
   var crypttext = ciphertext.substring(16);


   //Parsers
   // crypttext = CryptoJS.enc.Utf8.parse(crypttext);

   const uint8array = new TextEncoder().encode(ciphertext);
   crypttext = new TextDecoder('utf-8').decode(uint8array);


   console.log("CRYPTEXTXTX+N", crypttext)
   iv = CryptoJS.enc.Utf8.parse(iv);
  var key = CryptoJS.enc.Utf8.parse(decryptionKey);



   // Decrypt
   var plaintextArray = CryptoJS.AES.decrypt(
     { ciphertext:  crypttext},
     key,
     {iv: iv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7}
   );

   const output_plaintext = plaintextArray.toString(CryptoJS.enc.Utf8)
   // CryptoJS.enc.Utf8.stringify(plaintextArray);
   console.log("plain text : " + output_plaintext);
}

export const setCharAt = (str,index,chr) => {
    if(index > str.length-1) return str;
    return str.substring(0,index) + chr + str.substring(index+1);
}
