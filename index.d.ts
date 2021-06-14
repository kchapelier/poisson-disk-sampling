declare module "poisson-disk-sampling" {
    export var tinyNDArray: any;

    export function squaredEuclideanDistance(point1: any[], point2: any[]): number;

    export class FixedDensityPDS {
        constructor(options: {
            shape: any[];
            minDistance: number;
            tries?: number;
        }, rng?: ((...params: any[]) => any) | null);
        addRandomPoint(): any[];
        addPoint(point: any[]): any[] | null;
        protected directAddPoint(point: any[]): any[];
        protected inNeighbourhood(point: any[]): boolean;
        next(): any[] | null;
        fill(): any[][];
        getAllPoints(): any[][];
        getAllPointsWithDistance(): void;
        reset(): void;
        addRandomPoint(): any[];
        addPoint(point: any[]): any[] | null;
        protected directAddPoint(point: any[]): any[];
        protected inNeighbourhood(point: any[]): boolean;
        next(): any[] | null;
        fill(): any[][];
        getAllPoints(): any[][];
        getAllPointsWithDistance(): void;
        reset(): void;
    }

    export function euclideanDistance(point1: any[], point2: any[]): number;

    export class VariableDensityPDS {
        constructor(options: {
            shape: any[];
            minDistance: number;
            maxDistance?: number;
            tries?: number;
            distanceFunction: (...params: any[]) => any;
            bias?: number;
        }, rng: ((...params: any[]) => any) | null);
        addRandomPoint(): any[];
        addPoint(point: any[]): any[] | null;
        protected directAddPoint(point: any[]): any[];
        protected inNeighbourhood(point: any[]): boolean;
        next(): any[] | null;
        fill(): any[][];
        getAllPoints(): any[][];
        getAllPointsWithDistance(): any[][];
        reset(): void;
    }

    export function getNeighbourhood(dimensionNumber: number): any[];

    export function getNeighbourhoodMemoized(dimensionNumber: number): any[];

    export class PoissonDiskSampling {
        constructor(options: {
            shape: any[];
            minDistance: number;
            maxDistance?: number;
            tries?: number;
            distanceFunction?: ((...params: any[]) => any) | null;
            bias?: ((...params: any[]) => any) | null;
        }, rng?: ((...params: any[]) => any) | null);
        addRandomPoint(): any[];
        addPoint(point: any[]): any[] | null;
        next(): any[] | null;
        fill(): any[][];
        getAllPoints(): any[][];
        getAllPointsWithDistance(): any[][];
        reset(): void;
    }

    export function sampleSphere(d: number, rng: (...params: any[]) => any): any[];
}
