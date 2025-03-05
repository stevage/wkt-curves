/*
Normalizing a curve makes it easier to work with by breaking down everything into a small number of regular forms. Notably, after normalization:
- the top level element is either compoundcurve or curvepolygon
- every ring of a curvepolygon is a compoundcurve
- every circularstring consists of exactly 3 points (by splitting those of more than 3 points)
*/
function normalizeCurve([type, ...rest]) {
    function normalizeElement([type, ...coords]) {
        if (type === 'circularstring' && coords.length > 3) {
            const out = [];
            for (let i = 0; i < coords.length - 2; i += 2) {
                out.push(['circularstring', ...coords.slice(i, i + 3)]);
            }
            return out;
        } else {
            return [[type, ...coords]]; // return same level of nesting
        }
    }
    if (type === 'circularstring') {
        // actually let's turn everything into compoundcurve
        return ['compoundcurve', ...normalizeElement([type, ...rest])];
    } else if (type === 'compoundcurve') {
        return [type, ...rest.flatMap(normalizeElement)];
    } else if (type === 'curvepolygon') {
        // we want each ring to be a compoundcurve. probably only 1 ring in practice.
        return [type, ...rest.map(normalizeCurve)];
    } else if (type === 'linestring') {
        // maybe a linear ring within a curvepolygon
        return ['compoundcurve', [type, ...rest]];
    } else {
        throw `Unsuppported type in normalizeCurve: ${type}`;
    }
}

/**
 * Parses a WKT (well-known string) to an object structure as required by the curves functions.
 * Caveats:
 * - no validation
 * - focuses on handling possible outputs from PostGIS
 * - inserts a fictional 'linestring' tag name within CompoundCurve etc
 * - converts tag names to lowercase
 *
 * @param {string} wktString - A WKT string.
 * @param {Object} options - Options for the conversion.
 * @param {boolean} [options.normalize=true] - Whether to normalize the curve. (If yes, the top level element is either compoundcurve or curvepolygon; every ring of a curvepolygon is a compoundcurve; every circularstring consists of exactly 3 points (by splitting those of more than 3 points))

 * @returns {Array} A curve object.
 * @example ['compoundcurve', ['circularstring', [0, 0], [1, 2], [2, 2]], ['linestring', [2,2], [2, 4]]

*/

export default function wktToCurve(wktString, options = { normalize: true }) {
    const s = () => wktString.slice(pos);
    let pos = 0;

    // match a pattern, advance that many characters, and return what matched
    function consume(pattern, optional) {
        const m = s().match(pattern);
        if (m) {
            pos += m[0].length;
        } else {
            if (!optional) {
                throw new Error(`Expected ${pattern} in ${s()}`);
            }
        }
        return m && m[0];
    }

    // parse a parenthesised, comma-separated list of things into an array
    function getList() {
        const ret = [];
        consume(/^\(/);
        while (s()[0] !== ')') {
            ret.push(getElement());
            consume(/^,\s*/, true);
        }
        consume(/^\)\s*/);
        return ret;
    }

    // parse some space-separated numbers into an array of numbers
    // "43.2 -16.9" -> [43.2, -16.9]
    function parseCoord() {
        const coordString = consume(/^[^,)]+/).trim();
        return coordString.split(/\s+/).map(Number);
    }

    // parse an element. It could be one of:
    // - tagname and list:  circularstring(1 2, ...) or compoundcurve(circularstring(...), ...)
    // - implicit linestring and list: (1 2, ...)
    // - coordinate: 1 2
    // because we do this with minimal semantics, we don't really know what to expect any time we're inside parentheses.
    function getElement() {
        const tag = consume(/^([a-z]*)(?=\()/i, true);
        if (tag !== null) {
            return [(tag || 'linestring').toLowerCase(), ...getList()];
        } else if (s().match(/^[0-9-]/)) {
            return parseCoord();
        } else {
            throw new Error(`Unexpected element ${s()}`);
        }
    }
    const r = getElement();
    return options.normalize ? normalizeCurve(r) : r;
}
