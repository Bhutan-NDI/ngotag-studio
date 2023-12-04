interface IValues {
    key: string
    value: string | number | object
}

export const setCookie = async (cookie: IValues[]) => {
    await fetch('/api/auth/set-cookie', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(cookie),
    });
}

export const getCookie = async (cookie: string) => {
    await fetch('/api/auth/get-cookie', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(cookie),
    });
}

export const removeCookie = async (cookie: string) => {
    await fetch('/api/auth/remove-cookie', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(cookie),
    });
}