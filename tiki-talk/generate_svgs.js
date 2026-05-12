const fs = require('fs');
const path = require('path');

const originalSvg = fs.readFileSync('src/assets/hero-blue-blob.svg', 'utf8');

// The original grey colors and their perceived lightness/role
// blobBase
// #55585D - Dark edge
// #6E7379 - Mid tone
// #A8ADB3 - Highlight
// #595D63 - Dark edge

// stripeGlow
// #6A6F75 - Dark edge
// #C3C7CC - Highlight
// #747A81 - Mid tone

// deepSpot
// #3F4348 - Darkest

// Helper to convert hex to RGB
function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

// Helper to convert RGB to HSL
function rgbToHsl(r, g, b) {
    r /= 255, g /= 255, b /= 255;
    var max = Math.max(r, g, b), min = Math.min(r, g, b);
    var h, s, l = (max + min) / 2;

    if (max == min) {
        h = s = 0; 
    } else {
        var d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }

    return { h, s, l };
}

// Helper to convert HSL to RGB
function hslToRgb(h, s, l) {
    var r, g, b;

    if (s == 0) {
        r = g = b = l; 
    } else {
        var hue2rgb = function hue2rgb(p, q, t) {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1/6) return p + (q - p) * 6 * t;
            if (t < 1/2) return q;
            if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
            return p;
        }

        var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        var p = 2 * l - q;
        r = hue2rgb(p, q, h + 1/3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1/3);
    }

    return {
        r: Math.round(r * 255),
        g: Math.round(g * 255),
        b: Math.round(b * 255)
    };
}

function rgbToHex(r, g, b) {
    return "#" + (1 << 24 | r << 16 | g << 8 | b).toString(16).slice(1).toUpperCase();
}

// Target colors
const colors = {
    blue: '#3A499E',
    red: '#DA292A',
    green: '#42A548',
    yellow: '#F5D72B'
};

function tintSvg(baseColorHex, svgContent) {
    const baseRgb = hexToRgb(baseColorHex);
    const baseHsl = rgbToHsl(baseRgb.r, baseRgb.g, baseRgb.b);
    
    // Map the old grey colors to the new hue/saturation, keeping their relative lightness
    const colorMap = {
        '#55585D': 0.35,
        '#6E7379': 0.45,
        '#A8ADB3': 0.68,
        '#595D63': 0.37,
        '#6A6F75': 0.44,
        '#C3C7CC': 0.78,
        '#747A81': 0.48,
        '#3F4348': 0.26
    };
    
    let newSvg = svgContent;
    for (const [oldHex, oldLightness] of Object.entries(colorMap)) {
        // Adjust lightness by some factor relative to the base color's lightness
        // or just use the old lightness directly to preserve the shape's shading
        const targetLightness = oldLightness; // You could also blend this with baseHsl.l
        const newRgb = hslToRgb(baseHsl.h, baseHsl.s, targetLightness);
        const newHex = rgbToHex(newRgb.r, newRgb.g, newRgb.b);
        
        // Replace globally
        const re = new RegExp(oldHex, 'gi');
        newSvg = newSvg.replace(re, newHex);
    }
    return newSvg;
}

for (const [name, hex] of Object.entries(colors)) {
    const newSvg = tintSvg(hex, originalSvg);
    fs.writeFileSync(`src/assets/hero-${name}-blob.svg`, newSvg);
    console.log(`Created hero-${name}-blob.svg`);
}

// Rename the original to grey
fs.renameSync('src/assets/hero-blue-blob.svg', 'src/assets/hero-grey-blob.svg');
console.log('Renamed hero-blue-blob.svg to hero-grey-blob.svg');

