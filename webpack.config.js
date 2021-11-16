const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const path = require('path');

module.exports = (env, argv) => {
    const devMode = argv.mode !== "production";
    return ({
        entry: './src/index.js',
        output: {
            path: path.resolve(__dirname, 'dist'),
            filename: 'bundle.js',
        },
        module: {
            rules: [
                {
                    test: /\.css$/,
                    use: [
                        MiniCssExtractPlugin.loader,
                        'css-loader'
                    ]
                },
                {
                    test: /\.scss$/,
                    use: [
                        devMode ? 'style-loader' : MiniCssExtractPlugin.loader,
                        {
                            loader: 'css-loader'
                        },
                        {
                            loader: 'sass-loader'
                        }
                    ]
                },
                {
                    test: /\.glsl$/,
                    use: 'raw-loader'
                },
                {
                    test: /\.gltf$/,
                    loader: 'gltf-webpack-loader',
                },
                {
                    test: /\.(\d+|png|jpg|jpeg|bin|exr)/,
                    loader: 'file-loader',
                },
                {
                    test: /\.json$/,
                    loader: 'file-loader',
                    type: 'javascript/auto'
                },
            ]
        },
        devtool: 'inline-source-map',
        devServer: {
            contentBase: './dist',
            hot: true,
        },
        resolve: {
            extensions: [
                '.tsx',
                '.ts',
                '.js'
            ],
            alias: {
                'three/OrbitControls': path.join(__dirname, 'node_modules/three/examples/js/controls/OrbitControls.js'),
                'three/OBJLoader': path.join(__dirname, 'node_modules/three/examples/js/loaders/OBJLoader.js')
            }
        },
        plugins: [
            new HtmlWebpackPlugin({
                template: "./dist/index.html",
                inject: false
            }),
        new MiniCssExtractPlugin(),
            new BundleAnalyzerPlugin({
                analyzerMode: 'static',
                openAnalyzer: false,
            }),
        ]
    });
};