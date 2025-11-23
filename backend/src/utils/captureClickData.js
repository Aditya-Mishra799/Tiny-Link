import {UAParser} from 'ua-parser-js';

const captureClickData = async (req) => {
    const capturedData = {}
    const forwarded = req.headers["x-forwarded-for"];
    const ip = forwarded ? forwarded.split(",")[0].trim() : req.socket.remoteAddress;
    capturedData.ip_address = ip

    try {
        const res = await fetch('https://ipapi.co/' + capturedData.ip_address + '/json/')
        const geoData = await res.json();
        capturedData.country = geoData.country || 'Unknown';
        capturedData.region = geoData.region || 'Unknown';
        capturedData.city = geoData.city || 'Unknown';
        capturedData.latitude = geoData.latitude || null;
        capturedData.longitude = geoData.longitude || null;
    } catch (error) {
        console.error("Geolocation fetch failed:", error);
        capturedData.country = 'Unknown';
        capturedData.region = 'Unknown';
        capturedData.city = 'Unknown';
        capturedData.latitude = null;
        capturedData.longitude = null;
    }

    capturedData.language = req.headers['accept-language'] || null;
    capturedData.referrer = req.headers["referer"] || null;

    capturedData.user_agent = req.headers["user-agent"] || 'Unknown';
    const parser = new UAParser(capturedData.user_agent);
    capturedData.device_type = parser.getDevice().type || 'desktop';
    capturedData.os_used = parser.getOS().name || 'Unknown';
    capturedData.browser = parser.getBrowser().name || 'Unknown';

    return capturedData
}

export default captureClickData;