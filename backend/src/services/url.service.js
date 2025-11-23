import pool from "../config/db.js";
import ApiError from "../utils/ApiError.js";

const toggleURLActivation = async (urlID, isActive) => {
    const query = 'UPDATE urls SET is_active = $1, WHERE id = $2 RETURNING id, long_url, shortcode, user_id, is_active';
    const values = [isActive, urlID];
    try {
        const { rows } = await pool.query(query, values);
        return rows[0];
    } catch (error) {
        throw new ApiError(500, "Failed to update URL activation status", "DATABASE_ERROR", { originalError: error });
    }
}
const checkURLExistsBySHA1 = async (userId, sha1Digest) => {
    const query = 'SELECT id, long_url, shortcode, user_id, is_active, created_at FROM urls WHERE user_id = $1 AND sha1_digest = $2';
    const values = [userId, sha1Digest];
    try {
        const { rows } = await pool.query(query, values);
        // if already exists then activate, if inactive
        if (rows.length === 0) return null;
        if (!rows[0].is_active) {
            await toggleURLActivation(rows[0].id, true);
        }
        return { ...rows[0], is_active: true };
    } catch (error) {
        throw new ApiError(500, "Failed to check URL existence by SHA1", "DATABASE_ERROR", { originalError: error });
    }
}
const addURL = async (originalURL, userID, urlSHA1Digest, shortcode) => {
    const query = 'INSERT INTO urls (long_url, user_id, sha1_digest, shortcode) VALUES ($1, $2, $3, $4) RETURNING id, long_url, shortcode, user_id, created_at, is_active';
    const values = [originalURL, userID, urlSHA1Digest, shortcode];
    try {
        const { rows } = await pool.query(query, values);
        return rows[0];
    } catch (error) {
        throw new ApiError(500, "Failed to add URL", "DATABASE_ERROR", { originalError: error });
    }
}
const getURLByShortcode = async (shortcode) => {
    const query = 'SELECT id, long_url, shortcode, user_id, is_active, created_at, clicks FROM urls WHERE shortcode = $1';
    const values = [shortcode];
    try {
        const { rows } = await pool.query(query, values);
        if (rows.length === 0) {
            throw new ApiError(404, "URL does not Exists", "URL not found.", { originalError: error });
        }
        return rows[0]
    }
    catch (error) {
        throw new ApiError(500, "Failed to get URL by shortcode", "DATABASE_ERROR", { originalError: error });
    }

}
const getURLsByUserID = async (userID, skip, limit) => {
    const query = "SELECT id, long_url, shortcode, user_id, is_active, created_at, clicks, last_clicked_at FROM urls WHERE user_id = $1"
    const values = [userID];
    try {
        const { rows } = await pool.query(query, values);
        return rows;
    } catch (error) {
        throw new ApiError(500, "Failed to get URLs for user", "DATABASE_ERROR", { originalError: error });
    }
}

const getNextUrlId = async () => {
    const query = "SELECT nextval('urls_id_seq') AS next_id";
    try {
        const { rows } = await pool.query(query);
        return rows[0].next_id;
    } catch (error) {
        throw new ApiError(500, "Failed to get next URL ID", "DATABASE_ERROR", { originalError: error });
    }
}

const incrementClickCount = async (urlID, ipExists) => {
    const incrUniqueClick = ipExists ? 0 : 1;
    const query = 'UPDATE urls SET clicks = clicks + 1, unique_clicks = unique_clicks + $2, last_clicked_at = NOW() WHERE id = $1';
    const values = [urlID, incrUniqueClick];
    try {
        await pool.query(query, values);
    } catch (error) {
        throw new ApiError(500, "Failed to increment click count", "DATABASE_ERROR", { originalError: error });
    }
}

export default {
    addURL, getURLByShortcode, getURLsByUserID, toggleURLActivation, getNextUrlId, checkURLExistsBySHA1, incrementClickCount
};