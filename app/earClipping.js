import { DoublyLinkedList } from '@datastructures-js/doubly-linked-list';

export class Triangulation {

    vertices;
    ears;
    triangles;

    constructor(polygon) {
        // this.vertices = polygon.getCoordinates();
        this.vertices = new DoublyLinkedList();

    }

    identifyEars() {

    }
}
