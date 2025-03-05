## wkt-curves

This library supports parsing WKT (well-known text) strings representing curves based on arcs of circles, and converts to and from GeoJSON.

It supports these types:

* `CIRCULARSTRING` (an arc of a circle, defined by three points that lie on the arc, including the start and end).
* `COMPOUNDCURVE` (a series of connected arcs, the first defined by three points, and each subsequent arc defined by two).
* `CURVEPOLYGON` (a closed shape defined by an outer COMPOUNDCURVE and optional inner COMPOUNDCURVE rings)

See the [PostGIS documentation](https://postgis.net/docs/manual-1.4/ch04.html) for more complete definitions of these types.

This library does *not* support `MULTICURVE` or `MULTISURFACE`.

API documentation: https://stevage.github.io/wkt-curves

## Usage

```js
import {
    arcFromPoints,
    curveToCoords,
    regularizeMidpoints,
    curveToGeoJSON,
    wktToCurve,
    curveToWkt,
} from 'wkt-curves'

const curveWkt = 'CURVEPOLYGON(COMPOUNDCURVE(CIRCULARSTRING(0 0,2 0, 2 1, 2 3, 4 3),(4 3, 4 5, 1 4, 0 0)), CIRCULARSTRING(1.7 1, 1.4 0.4, 1.6 0.4, 1.6 0.5, 1.7 1) )'

const curveGeoJSON = curveToGeoJSON(wktToCurve(curveWkt));
```

* `wktToCurve` parses a WKT string into an intermediate representation.
* `curveToGeoJSON` converts a parsed curve into GeoJSON.

## Credits

This library was written by [Steve Bennett](https://hire.stevebennett.me).