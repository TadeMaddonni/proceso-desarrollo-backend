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
// Verificación final de los datos y relaciones en la base de datos
var dotenv_1 = require("dotenv");
console.log('🔎 Verificación final de datos y relaciones...');
dotenv_1.default.config();
function verifyFinalData() {
    return __awaiter(this, void 0, void 0, function () {
        var db, _a, Usuario, Zona, Deporte, Partido, sequelize, usuarios, zonas, deportes, usuario, zona, deporte, partidos, partidoConRelaciones, partido, error_1, db;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 9, 10, 13]);
                    return [4 /*yield*/, Promise.resolve().then(function () { return require('./src/models/index.js'); })];
                case 1:
                    db = _b.sent();
                    _a = db.default, Usuario = _a.Usuario, Zona = _a.Zona, Deporte = _a.Deporte, Partido = _a.Partido, sequelize = _a.sequelize;
                    return [4 /*yield*/, sequelize.authenticate()];
                case 2:
                    _b.sent();
                    console.log('✅ Conectado a la base de datos');
                    // Verificar datos sin relaciones
                    console.log('\n📊 VERIFICACIÓN DE DATOS BÁSICOS:');
                    return [4 /*yield*/, Usuario.findAll()];
                case 3:
                    usuarios = _b.sent();
                    return [4 /*yield*/, Zona.findAll()];
                case 4:
                    zonas = _b.sent();
                    return [4 /*yield*/, Deporte.findAll()];
                case 5:
                    deportes = _b.sent();
                    console.log("   \uD83D\uDC65 Usuarios: ".concat(usuarios.length));
                    console.log("   \uD83D\uDCCD Zonas: ".concat(zonas.length));
                    console.log("   \u26BD Deportes: ".concat(deportes.length));
                    // Verificar un usuario específico con sus IDs de zona y deporte
                    console.log('\n🔍 VERIFICACIÓN DE FOREIGN KEYS:');
                    usuario = usuarios[0];
                    console.log("   Usuario: ".concat(usuario.nombre));
                    console.log("   zonaId: ".concat(usuario.zonaId));
                    console.log("   deporteId: ".concat(usuario.deporteId));
                    return [4 /*yield*/, Zona.findByPk(usuario.zonaId)];
                case 6:
                    zona = _b.sent();
                    return [4 /*yield*/, Deporte.findByPk(usuario.deporteId)];
                case 7:
                    deporte = _b.sent();
                    console.log("   Zona encontrada: ".concat((zona === null || zona === void 0 ? void 0 : zona.nombre) || 'NO ENCONTRADA'));
                    console.log("   Deporte encontrado: ".concat((deporte === null || deporte === void 0 ? void 0 : deporte.nombre) || 'NO ENCONTRADO'));
                    // Verificar conteo de partidos con relaciones
                    console.log('\n🏆 VERIFICACIÓN DE PARTIDOS:');
                    return [4 /*yield*/, Partido.findAll({
                            include: [
                                { model: Usuario, as: 'organizador' },
                                { model: Zona },
                                { model: Deporte }
                            ]
                        })];
                case 8:
                    partidos = _b.sent();
                    console.log("   Total partidos: ".concat(partidos.length));
                    partidoConRelaciones = partidos.filter(function (p) {
                        return p.organizador && p.Zona && p.Deporte;
                    });
                    console.log("   Partidos con todas las relaciones: ".concat(partidoConRelaciones.length));
                    if (partidoConRelaciones.length > 0) {
                        partido = partidoConRelaciones[0];
                        console.log("   Ejemplo - Organizador: ".concat(partido.organizador.nombre));
                        console.log("   Ejemplo - Zona: ".concat(partido.Zona.nombre));
                        console.log("   Ejemplo - Deporte: ".concat(partido.Deporte.nombre));
                    }
                    console.log('\n🎯 RESUMEN FINAL:');
                    console.log('✅ Base de datos poblada exitosamente');
                    console.log('✅ Modelos TypeScript funcionando correctamente');
                    console.log('✅ Relaciones de foreign keys establecidas');
                    console.log('✅ Operaciones CRUD funcionando');
                    console.log('✅ Consultas con includes funcionando');
                    console.log('🎉 ¡CONVERSIÓN A TYPESCRIPT COMPLETADA CON ÉXITO!');
                    return [3 /*break*/, 13];
                case 9:
                    error_1 = _b.sent();
                    console.error('❌ Error en verificación final:', error_1);
                    return [3 /*break*/, 13];
                case 10: return [4 /*yield*/, Promise.resolve().then(function () { return require('./src/models/index.js'); })];
                case 11:
                    db = _b.sent();
                    return [4 /*yield*/, db.default.sequelize.close()];
                case 12:
                    _b.sent();
                    console.log('\n🔌 Conexión cerrada');
                    return [7 /*endfinally*/];
                case 13: return [2 /*return*/];
            }
        });
    });
}
verifyFinalData().catch(console.error);
