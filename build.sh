set -e

wasm-pack build --target web rust --release
NODE_ENV=production webpack --mode production --config main.webpack.config.js
cp index.html dist
rm -f dist/*.wasm