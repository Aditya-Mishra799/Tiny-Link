import urlServices from "../services/url.service.js";
import ApiError from "../utils/ApiError.js";
import { getSHA1Digest } from "../utils/sha1.js";
import { encode } from "../utils/base62.js";
import {logClick} from "../services/clicks.service.js";
const addURL = async (req, res, next) => {
    console.log("EXECuting 1")
    console.log("body", req?.body)
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
const getUserURLs = async (req, res, next) => { }
const getURL = async (req, res, next) => { }
const getURLStats = async (req, res, next) => { }

export { addURL, redirectUser, inActivateURL, getUserURLs, getURL, getURLStats };
