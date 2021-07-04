import { DoublyLinkedList } from '@datastructures-js/doubly-linked-list';
import {sayHello} from "euklid";

export class Triangulation {

    vertices;
    ears;
    triangles;

    constructor(polygon) {
        this.vertices = new DoublyLinkedList();
        if (polygon.getGeometry().getType() === 'MultiPolygon') {
            polygon.getGeometry().getCoordinates()[0][0].forEach(coord => this.vertices.insertLast(coord));
        } else {
            polygon.getGeometry().getCoordinates()[0].forEach(coord => this.vertices.insertLast(coord));
        }
        console.log(this.vertices);
        sayHello();
    }

    identifyEars() {

    }
}
