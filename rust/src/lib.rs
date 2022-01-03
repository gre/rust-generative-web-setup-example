mod utils;
use svg::node::element::path::Data;
use svg::node::element::{Path, Group};
use svg::Document;
use wasm_bindgen::prelude::*;
use serde::{Deserialize};

#[derive(Deserialize)]
pub struct Opts {
    pub seed: f64,
    pub primary_name: String,
    pub secondary_name: String,
}

pub fn art(opts: &Opts) -> Document {
    let width = 210.0;
    let height = 210.0;
    let stroke_width = 0.35;

    let colors = vec!["#0FF", "#F0F"];
    let layers = colors.iter().enumerate().map(|(ci, &color)| {
        let label = if ci == 0 { opts.primary_name.clone() } else { opts.secondary_name.clone() };

        let routes = (0..10).map(|i| vec![
            (20.0 + (20 * ci + i) as f64, 20.0 + (20 * ci + i) as f64),
            (width - 20.0 - (20 * ci + i) as f64, 20.0 + (20 * ci + i) as f64),
            (width - 20.0 - (20 * ci + i) as f64, height - 20.0 - (20 * ci + i) as f64),
            (20.0 + (20 * ci + i) as f64, height - 20.0 - (20 * ci + i) as f64),
            (20.0 + (20 * ci + i) as f64, 20.0 + (20 * ci + i) as f64),
        ]).collect::<Vec<_>>();

        let mut l = Group::new()
            .set("inkscape:groupmode", "layer")
            .set("inkscape:label", label)
            .set("fill", "none")
            .set("stroke", color)
            .set("stroke-width", stroke_width);

        let opacity: f64 = 0.6;
        
        let opdiff = 0.15 / (routes.len() as f64);
        let mut trace = 0f64;
        for r in routes {
            trace += 1f64;
            let data = render_route(Data::new(), r);
            l = l.add(
                Path::new()
                .set("opacity", (1000. * (opacity - trace * opdiff)).floor()/1000.0)
                .set("d", data)
            );
        }
        l
    });
        
    let mut doc = svg::Document::new()
    .set("viewBox", (0, 0, 210, 210))
    .set("width", "210mm")
    .set("height", "210mm")
    .set("style", "background:white")
    .set("xmlns:inkscape", "http://www.inkscape.org/namespaces/inkscape")
    .set("xmlns", "http://www.w3.org/2000/svg" );
    for g in layers {
        doc = doc.add(g);
    }
    return doc;
}

#[wasm_bindgen]
pub fn render(val: &JsValue) -> String {
    let opts = val.into_serde().unwrap();
    let doc = art(&opts);
    let str = doc.to_string();
    return str;
}

fn render_route(
    data: Data,
    route: Vec<(f64, f64)>
) -> Data {
    if route.len() == 0 {
        return data;
    }
    let first_p = route[0];
    let mut d = data.move_to((
        significant_str(first_p.0),
        significant_str(first_p.1)
    ));
    for p in route {
        d = d.line_to((
            significant_str(p.0),
            significant_str(p.1),
        ));
    }
    return d;
}

#[inline]
fn significant_str (f: f64) -> f64 {
  (f * 100.0).floor() / 100.0
}
