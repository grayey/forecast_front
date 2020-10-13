import axios from 'axios';
import { APP_ENVIRONMENT } from '../environment/environment';

const BASE_URL = APP_ENVIRONMENT.base_url;


export const get = async (url, id = null) => {
    let path = `${BASE_URL}/${url}`;
    path = (!id) ? path : `${path}/${id}`;
    return await axios.get(path).then(
        (response) => {
            return response.data;
        }
    ).then(
        (jsonData) => {
            return jsonData
        })
        .catch(
            (error) => {
                const errorResponse = {
                    data: error,
                    message: error.message,
                    requestStatus: false,
                    statusCode: error
                }
                throw errorResponse;
            }
        )

}


export const post = async (url, data) => {
    const path = `${BASE_URL}/${url}`;
    return await axios.post(path, data).then(
        (response) => { return response.data; }).catch((error) => {
            
            const errorResponse= error.response
            console.log(errorResponse)
            throw errorResponse;
        })
}

export const put = async (url, data = null) => {
    const path = `${BASE_URL}/${url}`;
    return await axios.put(path, data).then(
        (response) => { return response.data; }).catch((error) => {
            const errorResponse= error.response
            throw errorResponse;
        }
        )

}

export const patch = async (url, data = null) => {
    const path = `${BASE_URL}/${url}`;
    return await axios.patch(path, data).then(
        (response) => { return response.data; }).catch((error) => {
            const errorResponse= error.response
            throw errorResponse;
        }
        )

}


export const del = async (url) => {
    const path = `${BASE_URL}/${url}`;
    return await axios.delete(path).then(
        (response) => { return response.data; }).catch((error) => {
            const errorResponse= error.response
            throw errorResponse;
        }
        )

}


export const postFile = async (url, file, data = null) => {
    const path = extractDataAsParam(`${BASE_URL}/${url}`, data);
    return await axios.post(path, file, data).then(
        (response) => { return response.data; }).catch((error) => {
            const errorResponse= error.response
            throw errorResponse;
        }
        )

}


// async function post(url, data) {
//     return fetch(path).then(res => res.json()).catch(error => error.json());
// }

// async function put(url, data) {
//     return fetch(path).then(res => res.json()).catch(error => error.json());
// }

// async function del(url) {
//     return fetch(path).then(res => res.json()).catch(error => error.json());
// }



function extractDataAsParam(path, data = null) {
    if (data) {
        let dataParams = '?';
        let appendment = '';
        for (let key in data) {
            appendment += `${key}=${data[key]}&`;
        }
        path += `${dataParams}${appendment}`;
    }
    return path;
}