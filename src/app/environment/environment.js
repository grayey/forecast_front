const env = process.env.NODE_ENV;
const app_mode = env ? env.trim() : "development";
console.log("env", env, process.env)

const environment = {
    development: {
        base_url: 'http://localhost:8000/api',
        base_url_front: ''
    },
    production: {
        base_url: 'https://bmspro.herokuapp.com',
        base_url_front: ''
    }

}

export const APP_ENVIRONMENT = environment[app_mode];