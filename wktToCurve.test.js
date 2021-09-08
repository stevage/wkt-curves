import wktToCurve from './wktToCurve';

test('circularstring', () => {
    expect(wktToCurve('CIRCULARSTRING(0 0, 4 4, 8 2)')).toEqual([
        'circularstring',
        [0, 0],
        [4, 4],
        [8, 2],
    ]);
});
test('curve', () => {
    expect(
        wktToCurve(
            'CompoundCurve(CircularString(5.5 0, 6 -1, 6 -2), (6 -2, 3 4))'
        )
    ).toEqual([
        'compoundcurve',
        ['circularstring', [5.5, 0], [6, -1], [6, -2]],
        ['linestring', [6, -2], [3, 4]],
    ]);
});
test('curve', () => {
    expect(
        wktToCurve(
            'CurvePolygon(CompoundCurve(CircularString(5.5 0, 6 -1, 6 -2), (6 -2, 3 4)),CircularString(5.75 -0.5, 6 -0.5, 6 -0.8))'
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
