import 'ol/ol.css';
import Map from 'ol/Map';
import OSM from 'ol/source/OSM';
import {Tile as TileLayer, Vector as VectorLayer} from 'ol/layer';
import View from 'ol/View';
import Feature from 'ol/Feature';
import GeoJSON from 'ol/format/GeoJSON';
import {Vector as VectorSource} from 'ol/source';
import { borders } from './data';

const vectorSource = new VectorSource({
    features: new GeoJSON().readFeatures(borders, {
        dataProjection: 'EPSG:4326',
        featureProjection: 'EPSG:3857'
    }),
});

const vectorLayer = new VectorLayer({
    source: vectorSource
});

const map = new Map({
    view: new View({
        center: [0, 0],
        zoom: 1,
    }),
    layers: [
        new TileLayer({
            source: new OSM(),
        }),
        vectorLayer
    ],
    target: 'ol-map'
});
