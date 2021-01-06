const fetch = require('node-fetch');

const api_baseurl = 'https://api.clashofclans.com/v1';
const clash_baseurl = 'https://developer.clashofclans.com/api';
let developer_token = '';
let cookieHeader;

async function getToken(ip, developer_email, developer_password) {

    try {

        if (ip === '' || developer_email === '' || developer_password === '') {
            throw new Error('Invalid input!');
        }

        // Check if we have a valid token set already
        const validtoken = await checkValidToken(developer_token);

        if (validtoken) {
            return developer_token;
        }

        // Lets login to the website and get the login cookies
        const cookies = await getDeveloperCookies(developer_email, developer_password);

        if (!cookies) {
            throw new Error('Unable to login to developer website with provided credentials!');
        }

        // Lets get the session cookies
        const session_cookie = getSessionCookie(cookies);

        if (!session_cookie) {
            throw new Error('Unable to get session cookies!');
        }

        // Store the sessios cookie in our post requests
        cookieHeader = session_cookie;

        // Lets see if we already have a token for this IP
        const existingToken = await getExistingTokenForMyIP(ip);

        if (existingToken) {
            developer_token = existingToken;
        }
        else {
            // Create a token for this IP
            developer_token = await createTokenForMyIP(ip);
        }

        // Remove any old tokens
        await removeOldTokens(ip);

    }
    catch (err) {
        developer_token = '';
        console.error(err);

    }
    finally {
        // eslint-disable-next-line no-unsafe-finally
        return developer_token;
    }

}

exports.getToken = getToken;

async function getDeveloperCookies(developer_email, developer_password) {

    let cookies = '';
    const res = await fetch(clash_baseurl + '/login', {
        method: 'post',
        body:
            JSON.stringify({
                email: developer_email,
                password: developer_password,
            }),

        headers: {
            'cookie': cookieHeader,
            'Content-Type': 'application/json',
        },
    });
    const data = await res.json();

    if (data.status.message) {

        if (data.status.message == 'ok') {
            cookies = res.headers.get('set-cookie');
        }

    }

    return cookies;

}

async function checkValidToken(token) {

    let valid = false;

    if (token != '') {

        // We have an api token created, lets try and fetch some data and see if it still available to use


        const res = await fetch(api_baseurl + '/locations', {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }).then(response => response.json());

        if (res.status == 200) {
            console.log('We have a working api token, no need to create a new one!');
            valid = true;
        }
    }

    return valid;

}

function getSessionCookie(cookies) {

    let session_cookie = '';

    cookies = cookies.toString().split(';');

    for (let x = 0; x < cookies.length; x++) {

        if (cookies[x].includes('session=')) {
            session_cookie = cookies[x].trim();
            break;
        }

    }

    return session_cookie;

}

async function getExistingTokens() {

    let existingTokens = '';
    const res = await fetch(clash_baseurl + '/apikey/list', {
        method: 'post',
        headers: {
            'cookie': cookieHeader,
            'Content-Type': 'application/json',
        },
    }).then(response => response.json());

    if (res.status.message) {

        if (res.status.message == 'ok') {
            existingTokens = res.keys;
        }
    }

    return existingTokens;

}

async function getExistingTokenForMyIP(ip) {

    let existingToken = '';
    const existingTokens = await getExistingTokens();

    if (existingTokens) {

        // Loop through all keys and see if we have one for this IP
        for (let x = 0; x < existingTokens.length; x++) {

            if (existingTokens[x].cidrRanges[0] == ip) {
                existingToken = existingTokens[x].key;
                console.log('Found existing token for this IP!');
                break;
            }
        }

    }

    return existingToken;

}

async function createTokenForMyIP(ip) {

    const res = await fetch(clash_baseurl + '/apikey/create', {
        method: 'post',
        body: JSON.stringify({
            name: ip,
            description: ip,
            cidrRanges: ip,
        }),
        headers: {
            'cookie': cookieHeader,
            'Content-Type': 'application/json',
        },
    }).then(response => response.json());
    let newToken = '';

    if (res.status.message) {

        if (res.status.message == 'ok') {

            console.log('Created new token for this IP!');
            newToken = res.key.key;

        }

    }

    return newToken;

}

async function removeOldTokens(ip) {

    // Lets get all tokens
    const existingTokens = await getExistingTokens();

    if (existingTokens) {

        // Loop through all keys and see if we have one for this IP
        for (let x = 0; x < existingTokens.length; x++) {

            if (existingTokens[x].cidrRanges[0] != ip) {

                const oldkey_id = existingTokens[x].id;
                const oldkey_ip = existingTokens[x].cidrRanges[0];

                const res = await fetch(clash_baseurl + '/apikey/revoke', {
                    method: 'post',
                    body: JSON.stringify({ id: oldkey_id }),
                    headers: {
                        'cookie': cookieHeader,
                        'Content-Type': 'application/json',
                    },
                }).then(response => response.json());

                if (res.status.message) {

                    if (res.status.message == 'ok') {
                        console.log('Deleted token for IP: ' + oldkey_ip);
                    }
                }
            }

        }
    }
}