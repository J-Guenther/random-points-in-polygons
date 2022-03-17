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
import earcut from 'earcut';
import Point from 'ol/geom/Point';

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

const pointSource = new VectorSource({});
const pointLayer = new VectorLayer({
    source: pointSource
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
        vectorLayer,
        pointLayer
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


function sliceIntoChunks(arr, chunkSize) {
    const res = [];
    for (let i = 0; i < arr.length; i += chunkSize) {
        const chunk = arr.slice(i, i + chunkSize);
        res.push(chunk);
    }
    return res;
}

button.addEventListener('click', () => {
    let data;
    let coordinates;
    if (selected.getGeometry().getType() === 'MultiPolygon') {
        coordinates = selected.getGeometry().getCoordinates()[0];
    } else {
        coordinates = selected.getGeometry().getCoordinates();
    }
    console.log(coordinates);
    console.log(coordinates.length);
    data = earcut.flatten(coordinates);
    console.log(data);
    const triangles = earcut(data.vertices, data.holes, data.dimensions);
    console.log(Math.max(...triangles));
    const slices = sliceIntoChunks(triangles, 3);
    console.log(slices)
    // TODO Dreiecke nach Flächengröße gewichten
    const triangleIndecies = slices[Math.floor(Math.random() * slices.length)];
    console.log(triangleIndecies)
    const triangle = [
        coordinates[0][triangleIndecies[0]][0],
        coordinates[0][triangleIndecies[0]][1],
        coordinates[0][triangleIndecies[1]][0],
        coordinates[0][triangleIndecies[1]][1],
        coordinates[0][triangleIndecies[2]][0],
        coordinates[0][triangleIndecies[2]][1]
    ]
    console.log(triangle);

    const r1 = Math.random();
    const r2 = Math.random();
    const x = (1 - Math.sqrt(r1)) * triangle[0] + (Math.sqrt(r1) * (1 - r2)) * triangle[2] + (Math.sqrt(r1) * r2) * triangle[4];
    const y = (1 - Math.sqrt(r1)) * triangle[1] + (Math.sqrt(r1) * (1 - r2)) * triangle[3] + (Math.sqrt(r1) * r2) * triangle[5];

    const point = new Feature({
            geometry: new Point([x, y])
        }
    );
    pointSource.addFeature(point);
    console.log(point);
    console.log(x);
    console.log(y);
});


