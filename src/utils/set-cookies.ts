interface IValues {
    key: string
    value: string | number | object
}

const setCookies = async (cookie: IValues[]) => {
    await fetch('/api/auth/cookie', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(cookie),
    });
}

export default setCookies