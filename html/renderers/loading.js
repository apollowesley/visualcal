"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
exports.__esModule = true;
var d3 = __importStar(require("d3"));
var animate = function () {
    function indySoftLogoTransformTween() {
        var i = d3.interpolate(1, 360);
        return function (t) {
            return "translate(0, -20) scale(" + i(t) / 360 + ") rotate(" + i(t) + ")";
        };
    }
    ;
    function visualCalLogoTransformTween() {
        var i = d3.interpolate(-250, 0);
        return function (t) {
            return "translate(" + i(t) + ", 40)";
        };
    }
    ;
    d3.select('#indysoft-group')
        .attr('transform', 'translate(0, -20) scale(0) rotate(1)')
        .transition()
        .duration(1800)
        .attrTween('transform', indySoftLogoTransformTween);
    d3.select('#visualcal-group')
        .attr('transform', 'translate(-250 40)')
        .transition()
        .delay(2000)
        .duration(1000)
        .attrTween('transform', visualCalLogoTransformTween);
};
window.addEventListener('load', animate);
//# sourceMappingURL=loading.js.map