import { curveToGeoJSON } from './wktCurves.js';

export default function curveToWkt([type, ...rest], options = {}) {
    if (options.format === 'html') {
        return compoundCurveToHtmlWkt([type, ...rest]);
    }
    const casing =
        options.case === 'uppercase'
            ? (x) => String(x).toUpperCase()
            : (x) => String(x).toLowerCase();
    const coordsToWkt = (coords) =>
        // '(' + coords.map((coord) => `(${coord.join(' ')})`).join(',') + ')';
        '(' + coords.map((coord) => `${coord.join(' ')}`).join(', ') + ')';

    if (type === 'compoundcurve') {
        return `${casing(type)}(${rest.map(curveToWkt).join(', ')})`;
    } else if (type === 'curvepolygon') {
        return `${casing(type)}(${rest.map(curveToWkt).join(', ')})`;
    } else if (type === 'linestring') {
        // Be careful if we ever use this for more than compoundcurves
        return coordsToWkt(rest);
    } else {
        return `${casing(type)}${coordsToWkt(rest)}`;
    }
}

function compoundCurveToHtmlWkt([type, ...rest]) {
    const coordsToWkt = (coords) =>
        '(<br>&nbsp;&nbsp;' +
        coords
            .map((coord) => `(${coord.join(' ')})`)
            .join(',<br>&nbsp;&nbsp;') +
        '<br>)';

    if (type === 'compoundcurve') {
        return `${type.toUpperCase()}(${rest
            .map(compoundCurveToHtmlWkt)
            .join(',')})`;
    } else if (type === 'linestring') {
        // Be careful if we ever use this for more than compoundcurves
        return coordsToWkt(rest);
    } else {
        return `${type.toUpperCase()}${coordsToWkt(rest)}`;
    }
}
