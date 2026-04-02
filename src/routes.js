"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var sessionManager_1 = require("./sessionManager");
var router = (0, express_1.Router)();
router.post('/create', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var tenantId, info, err_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                tenantId = req.body.tenantId;
                if (!tenantId) {
                    res.status(400).json({ error: 'tenantId is required' });
                    return [2 /*return*/];
                }
                return [4 /*yield*/, (0, sessionManager_1.createSession)(tenantId)];
            case 1:
                info = _a.sent();
                res.json({
                    status: info.status,
                    phoneNumber: info.phoneNumber,
                    lastConnectedAt: info.lastConnectedAt,
                });
                return [3 /*break*/, 3];
            case 2:
                err_1 = _a.sent();
                console.error('[Route] create error:', err_1);
                res.status(500).json({ error: 'Failed to create session' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
router.get('/qr/:tenantId', function (req, res) {
    try {
        var tenantId = String(req.params.tenantId);
        var result = (0, sessionManager_1.getSessionQR)(tenantId);
        if (!result.qr) {
            res.json({
                qr: null,
                status: result.status,
                message: result.status === 'connected'
                    ? 'Already connected'
                    : result.status === 'expired'
                        ? 'QR expired, request new session'
                        : 'QR not yet available',
            });
            return;
        }
        res.json({
            qr: result.qr,
            expiresAt: result.expiresAt,
            status: result.status,
        });
    }
    catch (err) {
        console.error('[Route] qr error:', err);
        res.status(500).json({ error: 'Failed to get QR' });
    }
});
router.get('/status/:tenantId', function (req, res) {
    try {
        var tenantId = String(req.params.tenantId);
        var info = (0, sessionManager_1.getSessionStatus)(tenantId);
        res.json({
            status: info.status,
            phoneNumber: info.phoneNumber,
            lastConnectedAt: info.lastConnectedAt,
            lastError: info.lastError,
        });
    }
    catch (err) {
        console.error('[Route] status error:', err);
        res.status(500).json({ error: 'Failed to get status' });
    }
});
router.post('/disconnect', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, tenantId, clearSession, info, err_2;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                _a = req.body, tenantId = _a.tenantId, clearSession = _a.clearSession;
                if (!tenantId) {
                    res.status(400).json({ error: 'tenantId is required' });
                    return [2 /*return*/];
                }
                return [4 /*yield*/, (0, sessionManager_1.disconnectSession)(tenantId, clearSession !== null && clearSession !== void 0 ? clearSession : true)];
            case 1:
                info = _b.sent();
                res.json({
                    status: info.status,
                    message: 'Session disconnected',
                });
                return [3 /*break*/, 3];
            case 2:
                err_2 = _b.sent();
                console.error('[Route] disconnect error:', err_2);
                res.status(500).json({ error: 'Failed to disconnect' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
router.post('/reconnect', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var tenantId, info, err_3;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                tenantId = req.body.tenantId;
                if (!tenantId) {
                    res.status(400).json({ error: 'tenantId is required' });
                    return [2 /*return*/];
                }
                return [4 /*yield*/, (0, sessionManager_1.reconnectSession)(tenantId)];
            case 1:
                info = _a.sent();
                res.json({
                    status: info.status,
                    phoneNumber: info.phoneNumber,
                    lastConnectedAt: info.lastConnectedAt,
                });
                return [3 /*break*/, 3];
            case 2:
                err_3 = _a.sent();
                console.error('[Route] reconnect error:', err_3);
                res.status(500).json({ error: 'Failed to reconnect' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
exports.default = router;
