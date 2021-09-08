// given the location of three points on a circle and its center, gives angles clockwise from positive X axis (east)
function findAngles(a, b, c, center) {
    const start = -Math.atan2(a.y - center.y, a.x - center.x);
    const mid = -Math.atan2(b.y - center.y, b.x - center.x);
    const end = -Math.atan2(c.y - center.y, c.x - center.x);

    const clockwise =
        (start < mid && mid < end) ||
        (end < start && start < mid) ||
        (mid < end && end < start);
    return {
        start,
        mid,
        end,
        anticlockwise: !clockwise,
    };
}

export function arcFromPoints(points) {
    const toXY = ([x, y]) => ({ x, y });

    const [a, b, c] = points.map(toXY);
    const square = (x) => x * x;
    if (a.x === c.x && a.y == c.y) {
        // first and last points the same, it's a complete circle - special case
        return {
            x: a.x + (b.x - a.x) / 2,
            y: a.y + (b.y - a.y) / 2,
            radius: Math.sqrt(square(b.x - a.x) + square(b.y - a.y)) / 2,
            start: -Math.PI,
            end: Math.PI,
            a,
            b,
            c,
        };
    }
    const [x1, y1, x2, y2, x3, y3] = [a.x, a.y, b.x, b.y, c.x, c.y];
    const x12 = x1 - x2;
    const x13 = x1 - x3;

    const y12 = y1 - y2;
    const y13 = y1 - y3;

    const y31 = y3 - y1;
    const y21 = y2 - y1;

    const x31 = x3 - x1;
    const x21 = x2 - x1;

    // x1^2 - x3^2
    const sx13 = square(x1) - square(x3);

    // y1^2 - y3^2
    const sy13 = square(y1) - square(y3);

    const sx21 = square(x2) - square(x1);
    const sy21 = square(y2) - square(y1);

    const f =
        (sx13 * x12 + sy13 * x12 + sx21 * x13 + sy21 * x13) /
        (2 * (y31 * x12 - y21 * x13));

    const g =
        (sx13 * y12 + sy13 * y12 + sx21 * y13 + sy21 * y13) /
        (2 * (x31 * y12 - x21 * y13));

    const cc = -square(x1) - square(y1) - 2 * g * x1 - 2 * f * y1;

    // eqn of circle be x^2 + y^2 + 2*g*x + 2*f*y + c = 0
    // where centre is (h = -g, k = -f) and radius r
    // as r^2 = h^2 + k^2 - c
    const h = -g;
    const k = -f;

    // r is the radius
    const r = Math.sqrt(h * h + k * k - cc);
    const center = {
        x: h,
        y: k,
    };
    return {
        ...center,
        radius: r,
        ...findAngles(a, b, c, center),
        a,
        b,
        c,
    };
}

/* Given a computed arc, return many points along it */
function arcToCoords({ x, y, radius, start, end, anticlockwise }, steps) {
    const coords = [];
    if (anticlockwise && start < end) {
        start += Math.PI * 2;
    } else if (!anticlockwise && end < start) {
        end += Math.PI * 2;
    }
    const stepAngle = (end - start) / (steps - 1);
    for (let i = 0; i < steps; i++) {
        const angle = start + i * stepAngle;
        coords.push([
            x + radius * Math.cos(angle),
            y - radius * Math.sin(angle),
        ]);
    }
    return coords;
}

export function arcPointsToCoords(arcPoints, { steps = 64 } = {}) {
    const arc = arcFromPoints(arcPoints);
    const ret = arcToCoords(arc, steps);
    return ret;
}
export function curveToCoords([type, ...rest], options = { steps: 64 }) {
    if (type === 'curvepolygon') {
        return rest.map((x) => curveToCoords(x, options));
    } else if (type === 'compoundcurve') {
        // return rest.flatMap(elementToCoords);
        // strip out the duplicate coords by dropping first coord of every group after the first
        // hmm, this may make managing vertices/control points hard
        return rest
            .map((x) => curveToCoords(x, options))
            .map((coords, i) => (i > 0 ? coords.slice(1) : coords))
            .flat();
    } else if (type === 'circularstring') {
        const coords = [];
        for (let i = 0; i < rest.length - 2; i += 2) {
            coords.push(...arcPointsToCoords(rest.slice(i, i + 3), options));
        }
        return coords;
    } else {
        return rest;
    }
}

export function regularizeMidpoints([type, ...rest]) {
    if (type === 'curvepolygon') {
        return [type, ...rest.map(regularizeMidpoints)];
    } else if (type === 'compoundcurve') {
        return [type, ...rest.map(regularizeMidpoints)];
    } else if (type === 'circularstring') {
        // magically simple: find the arc, then turn it back into 3 points
        return [type, ...arcPointsToCoords(rest, 3)];
    } else {
        return [type, ...rest];
    }
}

export function compoundCurveToGeoJSON(curve) {
    return;
}

export function curvePolygonToGeoJSON([type, ...curves]) {
    return {
        type: 'Polygon',
        coordinates: curves.map(compoundCurveToCoords),
    };
}

export function curveToGeoJSON([type, ...rest], options) {
    if (type === 'curvepolygon') {
        return {
            type: 'Polygon',
            coordinates: rest.map((x) => curveToCoords(x, options)),
        };
    } else {
        return {
            type: 'LineString',
            coordinates: curveToCoords([type, ...rest], options),
        };
    }
}

if (typeof module !== 'undefined') module.exports = {};
