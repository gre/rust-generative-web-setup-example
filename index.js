// @flow

import init, { render } from "./rust/pkg/main";
import wasm from "base64-inline-loader!./rust/pkg/main_bg.wasm";

function decode(dataURI) {
  const binaryString = atob(dataURI.split(",")[1]);
  var bytes = new Uint8Array(binaryString.length);
  for (var i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}
let wasmLoaded = false;
const promiseOfLoad = init(decode(wasm)).then(() => {
  wasmLoaded = true;
});

const MAX = 4096;

const ratio = 210 / 210;
const svgSize = ["210mm", "210mm"];
const widths = [500, 1000, 2000];

function adaptiveSvgWidth(width) {
  let i = 0;
  let w;
  do {
    w = widths[i];
    i++;
  } while (i < widths.length && width > widths[i]);
  return w;
}

const colors = [
  {
    name: "Bloody Brexit",
    main: [0.02, 0.12, 0.42],
    highlight: [0.18, 0.0, 0.2],
  },
  {
    name: "Indigo",
    main: [0.45, 0.55, 0.7],
    highlight: [0.2, 0.3, 0.4],
  },
  {
    name: "Turquoise",
    main: [0 / 255, 180 / 255, 230 / 255],
    highlight: [0 / 255, 90 / 255, 140 / 255],
  },
]

async function renderSVG ({ width, height }) {
  const primary = colors[0]
  const secondary = colors[2]
  const dpr = window.devicePixelRatio || 1;
  let W = width;
  let H = height;
  H = Math.min(H, W / ratio);
  W = Math.min(W, H * ratio);
  W = Math.floor(W);
  H = Math.floor(H);
  let w = Math.min(MAX, dpr * W);
  let h = Math.min(MAX, dpr * H);
  h = Math.min(h, w / ratio);
  w = Math.min(w, h * ratio);
  w = Math.floor(w);
  h = Math.floor(h);
  const svgW = adaptiveSvgWidth(w);
  const widthPx = svgW + "px";
  const heightPx = Math.floor(svgW / ratio) + "px";

  await promiseOfLoad;

  let prev = Date.now();
  const svg = render({
    seed: 0.0,
    primary_name: primary.name,
    secondary_name: secondary.name,
  });
  console.log(
    "svg calc time = " +
      (Date.now() - prev) +
      "ms – " +
      svg.length +
      " bytes"
  );
  
  // this one would be a <img> that could be used as texture input to a WebGL post process
  /* const renderedSVGURI = "data:image/svg+xml;base64," + btoa(svg.replace(svgSize[1], heightPx).replace(svgSize[0], widthPx));
      */

  // for now, just going to return this and write in DOM
  const downloadableSVG = svg
  .replace(/opacity="[^"]*"/g, 'style="mix-blend-mode: multiply"')
  .replace(
    /#0FF/g,
    "rgb(" +
      primary.main.map((n) => Math.round(n * 255)).join(",") +
      ")"
  )
  .replace(
    /#F0F/g,
    "rgb(" +
      secondary.main.map((n) => Math.round(n * 255)).join(",") +
      ")"
  );

  /* const downloadableSVGURI = "data:image/svg+xml;base64," + btoa(downloadableSVG);*/

  return {  downloadableSVG }
};


// for now, just going to return this and write in DOM
renderSVG({ width: 800, height: 600 }).then(r => {
  document.body.innerHTML = r.downloadableSVG;
})