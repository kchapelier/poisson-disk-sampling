declare module pds {
    
    class FixedDensityPDS {
        
        public shape: number[]
        public minDistance: number
        public maxDistance: number
        public maxTries: number
        public rng: ((...params: any[]) => any) | null
        public dimension: number
        public squaredMinDistance: number
        public minDistancePlusEpsilon: number
        public deltaDistance: number
        public cellSize: number
        public neighbourhood: number[][]
        public currentPoint: number[] | null
        public processList: []
        public samplePoints: number[][]
        public gridShape: number[]
        public grid: { stride: number[], data: Uint32Array }

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

    class VariableDensityPDS {
        
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

    class PoissonDiskSampling {
        
        public shape: number[]
        public implementation: FixedDensityPDS | VariableDensityPDS

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
}

declare module "poisson-disk-sampling" {
    
    export var tinyNDArray: any;

    export function squaredEuclideanDistance(point1: any[], point2: any[]): number;
    export function euclideanDistance(point1: any[], point2: any[]): number;
    export function getNeighbourhood(dimensionNumber: number): any[];
    export function getNeighbourhoodMemoized(dimensionNumber: number): any[];

    var PoissonDiskSampling: typeof pds.PoissonDiskSampling;
    export = PoissonDiskSampling

    export function sampleSphere(d: number, rng: (...params: any[]) => any): any[];
    
}
