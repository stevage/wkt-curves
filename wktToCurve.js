/*

Parses a WKT (well-known string) to an object structure as required by the curves functions.
Caveats:
- no validation
- only attempts to implemnt what might come out of PostGIS
- inserts a fictional 'linestring' tag name within CompoundCurve etc
- lowercases

Output format: ['compoundcurve', ['circularstring', [0, 0], [1, 2], [2, 2]], ['linestring', [2,2], [2, 4]]

*/

export default function parseWkt(wktString) {
    const s = () => wktString.slice(pos);
    let pos = 0;

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

    function getList() {
        const ret = [];
        consume(/^\(/);
        while (s()[0] !== ')') {
            ret.push(getElement());
            consume(/^,\s*/, true);
        }
        consume(/^\)/);
        return ret;
    }

    function parseCoord() {
        const coordString = consume(/^[^,)]+/);
        return coordString.split(/\s+/).map(Number);
    }

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
    return getElement();
}
