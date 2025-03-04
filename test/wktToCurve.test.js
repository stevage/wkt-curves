import wktToCurve from '../src/wktToCurve';

describe('Basic parsing', () => {
    test('circularstring', () => {
        expect(
            wktToCurve('CIRCULARSTRING(0 0, 4 4, 8 2)', {
                normalize: false,
            })
        ).toEqual(['circularstring', [0, 0], [4, 4], [8, 2]]);
    });
    test('compoundcurve', () => {
        expect(
            wktToCurve(
                'CompoundCurve(CircularString(5.5 0, 6 -1, 6 -2), (6 -2, 3 4))',
                { normalize: false }
            )
        ).toEqual([
            'compoundcurve',
            ['circularstring', [5.5, 0], [6, -1], [6, -2]],
            ['linestring', [6, -2], [3, 4]],
        ]);
    });
    test('curvepolygon', () => {
        expect(
            wktToCurve(
                'CurvePolygon(CompoundCurve(CircularString(5.5 0, 6 -1, 6 -2), (6 -2, 3 4)),CircularString(5.75 -0.5, 6 -0.5, 6 -0.8))',
                { normalize: false }
            )
        ).toEqual([
            'curvepolygon',
            [
                'compoundcurve',
                ['circularstring', [5.5, 0], [6, -1], [6, -2]],
                ['linestring', [6, -2], [3, 4]],
            ],
            ['circularstring', [5.75, -0.5], [6, -0.5], [6, -0.8]],
        ]);
    });
    test('handle decimal points and extra whitespace in real example', () => {
        expect(
            wktToCurve(
                'CURVEPOLYGON(COMPOUNDCURVE(CIRCULARSTRING(0 0,2 0, 2 1, 2 3, 4 3),(4 3, 4 5, 1 4, 0 0)), CIRCULARSTRING(1.7 1, 1.4 0.4, 1.6 0.4, 1.6 0.5, 1.7 1) ) ',
                { normalize: false }
            )
        ).toEqual([
            'curvepolygon',
            [
                'compoundcurve',
                ['circularstring', [0, 0], [2, 0], [2, 1], [2, 3], [4, 3]],
                ['linestring', [4, 3], [4, 5], [1, 4], [0, 0]],
            ],
            [
                'circularstring',
                [1.7, 1],
                [1.4, 0.4],
                [1.6, 0.4],
                [1.6, 0.5],
                [1.7, 1],
            ],
        ]);
    });
});

describe('Normalize result', () => {
    test("Doesn't mess up a compoundcurve", () => {
        expect(
            wktToCurve(
                'CompoundCurve(CircularString(5.5 0, 6 -1, 6 -2), (6 -2, 3 4))',
                { normalize: true }
            )
        ).toEqual([
            'compoundcurve',
            ['circularstring', [5.5, 0], [6, -1], [6, -2]],
            ['linestring', [6, -2], [3, 4]],
        ]);
    });
    // test('Turn a linestring into a compoundcurve containing a linestring', () => {
    //     expect(
    //         wktToCurve('LINESTRING(-3 0, 4 4)', {
    //             normalize: true,
    //         })
    //     ).toEqual(['compoundcurve', ['linestring', [-3, 0], [4, 4]]]);
    // });
    test('Normalize a 5 point circularstring into compoundcurve with two 3-point circularstrings', () => {
        expect(
            wktToCurve('CIRCULARSTRING(0 0, 4 4, 8 2, 5 5, 3 5)', {
                normalize: true,
            })
        ).toEqual([
            'compoundcurve',
            ['circularstring', [0, 0], [4, 4], [8, 2]],
            ['circularstring', [8, 2], [5, 5], [3, 5]],
        ]);
    });
    test('Makes every ring of a curvepolygon a compoundcurve', () => {
        // example from https://postgis.net/docs/using_postgis_dbmanagement.html
        expect(
            wktToCurve(
                'CURVEPOLYGON(CIRCULARSTRING(0 0, 4 0, 4 4, 0 4, 0 0),(1 1, 3 3, 3 1, 1 1))',
                { normalize: true }
            )
        ).toEqual([
            'curvepolygon',
            [
                'compoundcurve',
                ['circularstring', [0, 0], [4, 0], [4, 4]],
                ['circularstring', [4, 4], [0, 4], [0, 0]],
            ],
            // hmm, is a polygon ring really a linestring?
            ['compoundcurve', ['linestring', [1, 1], [3, 3], [3, 1], [1, 1]]],
        ]);
    });
    test('handle decimal points and extra whitespace in real example', () => {
        // from https://postgis.net/docs/using_postgis_dbmanagement.html
        expect(
            wktToCurve(
                'CURVEPOLYGON(COMPOUNDCURVE(CIRCULARSTRING(0 0,2 0, 2 1, 2 3, 4 3),(4 3, 4 5, 1 4, 0 0)), CIRCULARSTRING(1.7 1, 1.4 0.4, 1.6 0.4, 1.6 0.5, 1.7 1) ) ',
                { normalize: true }
            )
        ).toEqual([
            'curvepolygon',
            [
                'compoundcurve',
                ['circularstring', [0, 0], [2, 0], [2, 1]],
                ['circularstring', [2, 1], [2, 3], [4, 3]],
                ['linestring', [4, 3], [4, 5], [1, 4], [0, 0]],
            ],
            [
                'compoundcurve',
                ['circularstring', [1.7, 1], [1.4, 0.4], [1.6, 0.4]],
                ['circularstring', [1.6, 0.4], [1.6, 0.5], [1.7, 1]],
            ],
        ]);
    });
});
