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

const getClicksByURLID = async (urlID, skip, limit) => {
    const query = `
        SELECT id, ip_address, user_agent, device_type, os_used, browser,
               country, region, city, latitude, longitude, referrer, created_at
        FROM url_clicks
        WHERE url_id = $1
        ORDER BY created_at DESC
        OFFSET $2 LIMIT $3
    `;
    const countQuery = 'SELECT COUNT(*) AS total FROM url_clicks WHERE url_id = $1';
    const values = [urlID, skip, limit];
    const countValues = [urlID];

    try {
        const { rows } = await pool.query(query, values);
        const { rows: countRows } = await pool.query(countQuery, countValues);
        return { clicks: rows, total: countRows[0]?.total || 0 };
    } catch (error) {
        console.error("Failed to get clicks for URL:", error);
        throw error;
    }
};

const getClickStatsByURLID = async (urlID) => {
    const deviceQuery = `
        SELECT device_type, COUNT(*)::int as count
        FROM url_clicks
        WHERE url_id = $1
        GROUP BY device_type
    `;
    const browserQuery = `
        SELECT browser, COUNT(*)::int as count
        FROM url_clicks
        WHERE url_id = $1
        GROUP BY browser
    `;
    const osQuery = `
        SELECT os_used, COUNT(*)::int as count
        FROM url_clicks
        WHERE url_id = $1
        GROUP BY os_used
    `;
    const geoQuery = `
        SELECT country, region, city, latitude, longitude, COUNT(*)::int as count
        FROM url_clicks
        WHERE url_id = $1 AND latitude IS NOT NULL AND longitude IS NOT NULL
        GROUP BY country, region, city, latitude, longitude
    `;

    try {
        const [deviceRes, browserRes, osRes, geoRes] = await Promise.all([
            pool.query(deviceQuery, [urlID]),
            pool.query(browserQuery, [urlID]),
            pool.query(osQuery, [urlID]),
            pool.query(geoQuery, [urlID])
        ]);

        return {
            byDevice: deviceRes.rows,
            byBrowser: browserRes.rows,
            byOS: osRes.rows,
            byGeo: geoRes.rows
        };
    } catch (error) {
        console.error("Failed to get click stats:", error);
        throw error;
    }
};

export { logClick, getClicksByURLID, getClickStatsByURLID };