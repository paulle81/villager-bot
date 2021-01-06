const fetch = require('node-fetch');

exports.getMyIP = getMyIP;

async function getMyIP() {

    const urls = new Array();
    let ip;

    urls.push('https://myexternalip.com/raw');
    urls.push('https://api.ipify.org');
    urls.push('https://ifconfig.co/ip');

    try {

        for (let x = 0; x < urls.length; x++) {

            const res = await fetch(urls[x]).then(response => response.text());

            if (res) {
                ip = res;
                break;
            }

        }

    }
    catch (err) {
        console.log(err);
    }

    return ip;

}