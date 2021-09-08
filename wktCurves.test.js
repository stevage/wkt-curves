import { curveToCoords, curveToGeoJSON } from './wktCurves';

const circularstring1 = ['circularstring', [5.5, 0], [6, -1], [6, -2]];

const compoundCurve1 = [
    'compoundcurve',
    circularstring1,
    ['linestring', [6, -2], [3, 4]],
];

const curvePolygon1 = ['curvepolygon', compoundCurve1];

describe('curveToCoords', () => {
    test('circularstring', () => {
        expect(curveToCoords(circularstring1, { steps: 3 })).toEqual([
            [5.5, 0],
            [5.98606797749979, -0.9409830056250525],
            [6, -2],
        ]);
    });
    test('circularstring "steps" option is respected', () => {
        expect(curveToCoords(circularstring1, { steps: 43 }).length).toEqual(
            43
        );
    });
    test('linestring', () => {
        expect(curveToCoords(['linestring', [1, 2], [3, 4], [0, 0]])).toEqual([
            [1, 2],
            [3, 4],
            [0, 0],
        ]);
    });
    test('compoundCurve', () => {
        expect(curveToCoords(compoundCurve1, { steps: 3 })).toEqual([
            [5.5, 0],
            [5.98606797749979, -0.9409830056250525],
            [6, -2],
            [3, 4],
        ]);
    });
    test('curvePolygon', () => {
        expect(curveToCoords(curvePolygon1, { steps: 3 })).toEqual([
            [
                [5.5, 0],
                [5.98606797749979, -0.9409830056250525],
                [6, -2],
                [3, 4],
            ],
        ]);
    });
});

describe('curveToGeoJSON', () => {
    test('circularstring', () => {
        expect(curveToGeoJSON(circularstring1, { steps: 3 })).toEqual({
            type: 'LineString',
            coordinates: [
                [5.5, 0],
                [5.98606797749979, -0.9409830056250525],
                [6, -2],
            ],
        });
    });
    test('linestring', () => {
        expect(curveToGeoJSON(['linestring', [1, 2], [3, 4], [0, 0]])).toEqual({
            type: 'LineString',
            coordinates: [
                [1, 2],
                [3, 4],
                [0, 0],
            ],
        });
    });
    test('compoundCurve', () => {
        expect(curveToGeoJSON(compoundCurve1, { steps: 3 })).toEqual({
            type: 'LineString',
            coordinates: [
                [5.5, 0],
                [5.98606797749979, -0.9409830056250525],
                [6, -2],
                [3, 4],
            ],
        });
    });
    test('curvePolygon', () => {
        expect(curveToGeoJSON(curvePolygon1, { steps: 3 })).toEqual({
            type: 'Polygon',
            coordinates: [
                [
                    [5.5, 0],
                    [5.98606797749979, -0.9409830056250525],
                    [6, -2],
                    [3, 4],
                ],
            ],
        });
    });
});
