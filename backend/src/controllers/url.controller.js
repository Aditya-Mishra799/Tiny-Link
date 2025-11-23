import urlServices from "../services/url.service.js";
import ApiError from "../utils/ApiError.js";
import { getSHA1Digest } from "../utils/sha1.js";
import { encode } from "../utils/base62.js";
import { logClick, getClicksByURLID, getClickStatsByURLID } from "../services/clicks.service.js";
import pool from "../config/db.js";
const addURL = async (req, res, next) => {
    const { url } = req.body;
    const userId = req.user.id;
    if (!url) {
        throw new ApiError(400, "URL is required", "URL_REQUIRED")
    }
    try {
        const sha1Digest = getSHA1Digest(url);
        const alreadyExists = await urlServices.checkURLExistsBySHA1(userId, sha1Digest);
        if (alreadyExists) {
            return res.status(200).json({
                success: true,
                data: alreadyExists
            })
        }
        const nextID = await urlServices.getNextUrlId();
        const shortcode = encode(parseInt(nextID) + 1)

        let newURL = await urlServices.addURL(url, userId, sha1Digest, shortcode);
        return res.status(201).json({
            success: true,
            data: newURL
        })
    } catch (error) {
        next(error)
    }
}
const redirectUser = async (req, res, next) => {
    const { code } = req.params;
    try {
        const urlData = await urlServices.getURLByShortcode(code);
        if (!urlData.is_active) {
            throw new ApiError(403, "This URL has been deactivated", "URL_INACTIVE");
        }
        // do not wait for logging to complete redirect user first
        logClick(req, urlData.id);
        return res.redirect(urlData.long_url);
    }
    catch (error) {
        next(error)
    }
}
const inActivateURL = async (req, res, next) => {
    const { id } = req.params;
    try {
        const deactivated = await urlServices.toggleURLActivation(id, false)
        return res.status(200).json({
            success: true,
            data: deactivated
        })
    } catch (error) {
        next(error)
    }
}
const getUserURLs = async (req, res, next) => {
    let { page, limit } = req.query
    page = parseInt(page) || 1
    limit = parseInt(limit) || 10

    let skip = (page - 1) * limit
    const userID = req.user.id
    try {
        const urls = await urlServices.getURLsByUserID(userID, skip, limit)
        return res.status(200).json({
            success: true,
            data: urls
        })
    } catch (error) {
        next(error)
    }
}
const getURL = async (req, res, next) => {
    const { id } = req.params;
    let { page, limit } = req.query;
    page = parseInt(page) || 1;
    limit = parseInt(limit) || 10;
    const skip = (page - 1) * limit;
    const userID = req.user.id;

    try {
        const urlQuery = 'SELECT id, long_url, shortcode, user_id, is_active, created_at, clicks, last_clicked_at, unique_clicks FROM urls WHERE id = $1';
        const { rows } = await pool.query(urlQuery, [id]);

        if (rows.length === 0) {
            throw new ApiError(404, "URL not found", "URL_NOT_FOUND");
        }

        const urlData = rows[0];
        if (urlData.user_id !== userID) {
            throw new ApiError(403, "You don't have permission to view this URL", "FORBIDDEN");
        }

        const clicksData = await getClicksByURLID(id, skip, limit);

        return res.status(200).json({
            success: true,
            data: {
                url: urlData,
                clicks: clicksData.clicks,
                total: clicksData.total
            }
        });
    } catch (error) {
        next(error);
    }
};

const getURLStats = async (req, res, next) => {
    const { id } = req.params;
    const userID = req.user.id;

    try {
        const urlQuery = 'SELECT user_id FROM urls WHERE id = $1';
        const { rows } = await pool.query(urlQuery, [id]);

        if (rows.length === 0) {
            throw new ApiError(404, "URL not found", "URL_NOT_FOUND");
        }

        if (rows[0].user_id !== userID) {
            throw new ApiError(403, "You don't have permission to view this URL", "FORBIDDEN");
        }

        const stats = await getClickStatsByURLID(id);

        return res.status(200).json({
            success: true,
            data: stats
        });
    } catch (error) {
        next(error);
    }
}

export { addURL, redirectUser, inActivateURL, getUserURLs, getURL, getURLStats };
