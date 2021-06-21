import 'ol/ol.css';
import Map from 'ol/Map';
import OSM from 'ol/source/OSM';
import {Tile as TileLayer, Vector as VectorLayer} from 'ol/layer';
import View from 'ol/View';
import Feature from 'ol/Feature';
import GeoJSON from 'ol/format/GeoJSON';
import {Vector as VectorSource} from 'ol/source';
import Fill from 'ol/style/Fill';
import Stroke from 'ol/style/Stroke';
import Style from 'ol/style/Style';
import Select from 'ol/interaction/Select';
import {borders} from './data';
import { Triangulation } from './earClipping';

const highlightStyle = new Style({
    fill: new Fill({
        color: 'rgba(255,255,255,0.7)',
    }),
    stroke: new Stroke({
        color: '#3399CC',
        width: 3,
    }),
});

const vectorSource = new VectorSource({
    features: new GeoJSON().readFeatures(borders, {
        dataProjection: 'EPSG:4326',
        featureProjection: 'EPSG:3857'
    }),
});

const vectorLayer = new VectorLayer({
    source: vectorSource
});

const view = new View({
    center: [0, 0],
    zoom: 1,
});

const map = new Map({
    view: view,
    layers: [
        new TileLayer({
            source: new OSM(),
        }),
        vectorLayer
    ],
    target: 'ol-map'
});

view.fit(vectorSource.getExtent());

const button = document.getElementById('addButton');
button.disabled = true;

const selectionDisplay = document.getElementById('selectionDisplay');

let selected = null;

const selectSingleClick = new Select();

map.addInteraction(selectSingleClick);
selectSingleClick.on('select', function (e) {
    selected?.setStyle(undefined);
    selected = e.selected[0];
    if (selected) {
        selectionDisplay.innerHTML = selected.get('GEN');
        button.disabled = false;
    } else {
        selectionDisplay.innerHTML = '';
        button.disabled = true;
    }

});

let hover = null;
map.on('pointermove', function (e) {
    if (hover !== null && hover !== selected) {
        hover.setStyle(undefined);
        hover = null;
    }

    map.forEachFeatureAtPixel(e.pixel, function (f) {
        f.setStyle(highlightStyle);
        hover = f;
        return true;
    });
});

const ul = document.createElement('ul');

document.getElementById('areaContainer').appendChild(ul);

const features = vectorSource.getFeatures();
features.sort((a, b) => a.get('GEN').localeCompare(b.get('GEN')));

features.forEach(feature => {
    if (feature.get('GEN') !== 'Leer' && feature.get('GF') === 4) {
        let li = document.createElement('li');
        li.addEventListener("mouseenter", () => {
            console.log('Mousenter ', feature.get('DEBKG_ID'));
            feature.setStyle(highlightStyle);
        });
        li.addEventListener("mouseleave", () => {
            if (feature !== selected) {
                feature.setStyle(undefined);
            }
        });
        li.addEventListener("click", () => {
            selected?.setStyle(undefined);
            feature.setStyle(highlightStyle);
            selected = feature;
            selectionDisplay.innerHTML = selected.get('GEN');
            button.disabled = false
        });
        ul.appendChild(li);
        li.innerHTML += feature.get('GEN');
    }
});




button.addEventListener('click', () => {
    new Triangulation(selected);
});


