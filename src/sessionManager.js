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
exports.createSession = createSession;
exports.getSessionStatus = getSessionStatus;
exports.getSessionQR = getSessionQR;
exports.disconnectSession = disconnectSession;
exports.reconnectSession = reconnectSession;
var baileys_1 = require("@whiskeysockets/baileys");
var fs = require("fs");
var path = require("path");
var pino = require("pino");
var QRCode = require("qrcode");
var sessions = new Map();
var logger = pino({ level: 'silent' });
var SESSIONS_DIR = process.env.SESSIONS_DIR || '/sessions';
function getSessionPath(tenantId) {
    return path.join(SESSIONS_DIR, tenantId);
}
function createSession(tenantId) {
    return __awaiter(this, void 0, void 0, function () {
        var sessionPath, _a, state, saveCreds, sock, info;
        var _this = this;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    sessionPath = getSessionPath(tenantId);
                    fs.mkdirSync(sessionPath, { recursive: true });
                    return [4 /*yield*/, (0, baileys_1.useMultiFileAuthState)(sessionPath)];
                case 1:
                    _a = _b.sent(), state = _a.state, saveCreds = _a.saveCreds;
                    sock = (0, baileys_1.default)({
                        auth: state,
                        logger: logger,
                    });
                    info = {
                        tenantId: tenantId,
                        status: 'connecting',
                        qr: null,
                        qrExpiresAt: null,
                        phoneNumber: null,
                        lastError: null,
                        lastConnectedAt: null,
                    };
                    sessions.set(tenantId, { sock: sock, info: info });
                    sock.ev.on('connection.update', function (update) { return __awaiter(_this, void 0, void 0, function () {
                        var connection, lastDisconnect, qr, _a, shouldReconnect;
                        var _b, _c, _d;
                        return __generator(this, function (_e) {
                            switch (_e.label) {
                                case 0:
                                    connection = update.connection, lastDisconnect = update.lastDisconnect, qr = update.qr;
                                    if (!qr) return [3 /*break*/, 2];
                                    info.status = 'qr_pending';
                                    _a = info;
                                    return [4 /*yield*/, QRCode.toDataURL(qr)];
                                case 1:
                                    _a.qr = _e.sent();
                                    _e.label = 2;
                                case 2:
                                    if (connection === 'open') {
                                        info.status = 'connected';
                                        info.phoneNumber = ((_b = sock.user) === null || _b === void 0 ? void 0 : _b.id) || null;
                                        info.lastConnectedAt = new Date().toISOString();
                                    }
                                    if (connection === 'close') {
                                        shouldReconnect = ((_d = (_c = lastDisconnect === null || lastDisconnect === void 0 ? void 0 : lastDisconnect.error) === null || _c === void 0 ? void 0 : _c.output) === null || _d === void 0 ? void 0 : _d.statusCode) !== baileys_1.DisconnectReason.loggedOut;
                                        if (shouldReconnect) {
                                            createSession(tenantId);
                                        }
                                        else {
                                            info.status = 'disconnected';
                                        }
                                    }
                                    return [2 /*return*/];
                            }
                        });
                    }); });
                    sock.ev.on('creds.update', saveCreds);
                    return [2 /*return*/, info];
            }
        });
    });
}
function getSessionStatus(tenantId) {
    var _a;
    return ((_a = sessions.get(tenantId)) === null || _a === void 0 ? void 0 : _a.info) || {
        tenantId: tenantId,
        status: 'disconnected',
        qr: null,
        qrExpiresAt: null,
        phoneNumber: null,
        lastError: null,
        lastConnectedAt: null,
    };
}
function getSessionQR(tenantId) {
    var info = getSessionStatus(tenantId);
    return {
        qr: info.qr,
        status: info.status,
        expiresAt: info.qrExpiresAt,
    };
}
function disconnectSession(tenantId_1) {
    return __awaiter(this, arguments, void 0, function (tenantId, clear) {
        var session, dir;
        if (clear === void 0) { clear = true; }
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    session = sessions.get(tenantId);
                    if (!session) return [3 /*break*/, 2];
                    return [4 /*yield*/, session.sock.logout()];
                case 1:
                    _a.sent();
                    sessions.delete(tenantId);
                    _a.label = 2;
                case 2:
                    if (clear) {
                        dir = getSessionPath(tenantId);
                        if (fs.existsSync(dir)) {
                            fs.rmSync(dir, { recursive: true, force: true });
                        }
                    }
                    return [2 /*return*/, getSessionStatus(tenantId)];
            }
        });
    });
}
function reconnectSession(tenantId) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, createSession(tenantId)];
        });
    });
}
