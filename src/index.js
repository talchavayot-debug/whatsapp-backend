"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express = require("express");
var auth_1 = require("./auth");
var routes_1 = require("./routes");
var app = express();
var PORT = parseInt(process.env.PORT || '3100', 10);
app.use(express.json());
app.get('/health', function (_req, res) {
    res.json({ ok: true, timestamp: new Date().toISOString() });
});
app.use('/session', auth_1.authenticateServiceKey, routes_1.default);
app.listen(PORT, '0.0.0.0', function () {
    console.log("[WhatsApp Backend] Running on port ".concat(PORT));
});
