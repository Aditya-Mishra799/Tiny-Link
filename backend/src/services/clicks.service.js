import captureClickData from "../utils/captureClickData.js";
import pool from "../config/db.js";
import urlServices from "./url.service.js";

const checkIfIPExistsForURL = async (urlID, ipAddress) => {
    const query = 'SELECT id FROM url_clicks WHERE url_id = $1 AND ip_address = $2';
    const values = [urlID, ipAddress];;
    try {
        const { rows } = await pool.query(query, values);
        return rows.length > 0;
    } catch (error) {
        console.error("Failed to check existing IP for URL:", error);
        return false;
    }
}
const logClick = async (req, urlID) => {
    const clickData = await captureClickData(req);
    const query = `
  INSERT INTO url_clicks (
    url_id, ip_address, user_agent, device_type, os_used, browser,
    country, region, city, latitude, longitude, referrer
  ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
`;
    const values = [
        urlID,
        clickData.ip_address,
        clickData.user_agent,
        clickData.device_type,
        clickData.os_used,
        clickData.browser,
        clickData.country,
        clickData.region,
        clickData.city,
        clickData.latitude,
        clickData.longitude,
        clickData.referrer,
    ];
    try {
        await pool.query(query, values);
        // skip incrementing click count if ip address is missing
        const ipExists = clickData?.ip_address ? await checkIfIPExistsForURL(urlID, clickData.ip_address) : true;
        await urlServices.incrementClickCount(urlID, ipExists);

    } catch (error) {
        console.error("Failed to log click data:", error);
    }

}

export { logClick };