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
  let decryptionKey = process.env.REACT_APP_DECRYPTION_KEY.slice(0,16);
  // decryptionKey = btoa(decryptionKey);
  const key = CryptoJS.enc.Utf8.parse(decryptionKey);


 console.log('KEY', decryptionKey)

  const iv = CryptoJS.enc.Utf8.parse(ciphertext.substring(0, 16));
  const padding = CryptoJS.pad.Pkcs7;
  const mode = CryptoJS.mode.CBC
  const encrypted_text = ciphertext.substring(16);

  // Decrypt
  // const plainText = CryptoJS.AES.decrypt({ ciphertext:  encrypted_text}, decryptionKey, {iv: iv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7}).toString(CryptoJS.enc.Utf8);

    const plainText = CryptoJS.AES.decrypt(encrypted_text, key, { iv, mode, padding });
  // console.log('plainText', plainText);
  return plainText.toString(CryptoJS.enc.Utf8);
  //
  // return new_decrypt(encrypted_text, decryptionKey)

}

export const new_decrypt = (ciphertext, decryptionKey)=>{




  // Decode the base64 data so we can separate iv and crypt text.
   // var rawData = atob(data);
   // Split by 16 because my IV size
   var iv = ciphertext.substring(0, 16);
   var crypttext = ciphertext.substring(16);



   //Parsers
   // crypttext = CryptoJS.enc.Utf8.parse(crypttext);

   const uint8array = new TextEncoder().encode(crypttext);
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
