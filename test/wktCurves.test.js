import {
    curveToCoords,
    curveToGeoJSON,
    regularizeMidpoints,
} from '../src/wktCurves.js';

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
    test('compoundcurve', () => {
        expect(curveToCoords(compoundCurve1, { steps: 3 })).toEqual([
            [5.5, 0],
            [5.98606797749979, -0.9409830056250525],
            [6, -2],
            [3, 4],
        ]);
    });
    test('curvepolygon', () => {
        expect(curveToCoords(curvePolygon1, { steps: 3 })).toEqual([
            [
                [5.5, 0],
                [5.98606797749979, -0.9409830056250525],
                [6, -2],
                [3, 4],
            ],
        ]);
    });
    test('first and last coordinates match inputs for floating numbers', () => {
        const result = curveToCoords(
            [
                'circularstring',
                [-0.036869378137254216, 70.10959424218481],
                [0.02508068082758541, 70.13944153930098],
                [0.08915474181469563, 70.11669890981523],
            ],
            { steps: 64 }
        );
        expect(result[0]).toEqual([-0.036869378137254216, 70.10959424218481]);
        expect(result[63]).toEqual([0.08915474181469563, 70.11669890981523]);
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
    test('compoundcurve', () => {
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
    test('curvepolygon', () => {
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

describe('regularizeMidpoints', () => {
    test('circularstring', () => {
        expect(regularizeMidpoints(circularstring1)).toEqual([
            'circularstring',
            [5.5, 0],
            [5.98606797749979, -0.9409830056250525],
            [6, -2],
        ]);
    });
    test('compoundcurve', () => {
        expect(regularizeMidpoints(compoundCurve1)).toEqual([
            'compoundcurve',
            [
                'circularstring',
                [5.5, 0],
                [5.98606797749979, -0.9409830056250525],
                [6, -2],
            ],
            ['linestring', [6, -2], [3, 4]],
        ]);
    });
});
