"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateServiceKey = authenticateServiceKey;
var SERVICE_KEY = process.env.SERVICE_SECRET_KEY || '';
function authenticateServiceKey(req, res, next) {
    if (!SERVICE_KEY) {
        console.warn('[Auth] SERVICE_SECRET_KEY not set — skipping auth');
        next();
        return;
    }
    var provided = req.headers['x-service-key'];
    if (provided !== SERVICE_KEY) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
    }
    next();
}
