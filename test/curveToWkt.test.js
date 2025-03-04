import curveToWkt from '../src/curveToWkt';

test('circularstring', () => {
    expect(curveToWkt(['circularstring', [0, 0], [4, 4], [8, 2]])).toEqual(
        'circularstring(0 0, 4 4, 8 2)'
    );
});
test('curve', () => {
    expect(
        curveToWkt([
            'compoundcurve',
            ['circularstring', [5.5, 0], [6, -1], [6, -2]],
            ['linestring', [6, -2], [3, 4]],
        ])
    ).toEqual('compoundcurve(circularstring(5.5 0, 6 -1, 6 -2), (6 -2, 3 4))');
});
test('curve', () => {
    expect(
        curveToWkt([
            'curvepolygon',
            [
                'compoundcurve',
                ['circularstring', [5.5, 0], [6, -1], [6, -2]],
                ['linestring', [6, -2], [3, 4]],
            ],
            ['circularstring', [5.75, -0.5], [6, -0.5], [6, -0.8]],
        ])
    ).toEqual(
        'curvepolygon(compoundcurve(circularstring(5.5 0, 6 -1, 6 -2), (6 -2, 3 4)), circularstring(5.75 -0.5, 6 -0.5, 6 -0.8))'
    );
});
