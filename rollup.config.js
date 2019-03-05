import resolve from 'rollup-plugin-node-resolve';
import babel from 'rollup-plugin-babel';
import commonjs from 'rollup-plugin-commonjs';
import fs from 'fs';

const plugins = fs
            .readdirSync('src/plugins')
            .filter(item => item[0] !== '.')

const cfg = [
    ...['esm', 'cjs'].map(format => ({
        input: 'src/index.js',
        output: {
            file: `lib/index.${format}.js`,
            format
        },
        plugins: [
            resolve(),
            commonjs(),
            babel({
                exclude: 'node_modules/**'
            })
        ]
    })),
    ...['esm', 'cjs'].map(format => {
        return plugins
            .map(file => ({
            input: `src/plugins/${file}/index.js`,
            output: {
                file: `lib/plugins/${file}/index.${format}.js`,
                format,
                exports: 'named'
            },
            plugins: [
                resolve(),
                commonjs({
                    namedExports: {
                        'node_modules/object-path-immutable/index.js': [
                            'set'
                        ]
                    }
                }),
                babel({
                    exclude: 'node_modules/**'
                })
            ]
        }))
    }).reduce((carry, current) => carry.concat(current), [])
];

export default cfg;