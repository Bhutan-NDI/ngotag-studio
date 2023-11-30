import { getHeaderConfigs } from './GetHeaderConfigs';
import { envConfig } from './envConfig';

interface IProps {
	token: string;
	url: string;
	method: 'GET' | 'POST' | 'PUT' | 'DELETE';
	payload?: any;
}

const API = async ({ token, url, method, payload }: IProps) => {
    console.log(65636, token, url, method, payload)
	try {
        const config = {
            ...(await getHeaderConfigs(token)),
            method,
            body: JSON.stringify(payload),
        };
        const baseURL = globalThis.baseUrl || envConfig.PUBLIC_BASE_URL;
        const apiURL = baseURL + url;
        const res = await fetch(apiURL, {
            ...config,
        });
    
        // console.log(76765, res)
    
        const { data } = (await res.json()) || {};
        console.log(34123, data);
        return data;
    } catch(err){
        console.error("ERROR::", err)
        return null
    }
};

export default API;
