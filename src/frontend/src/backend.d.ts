import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export interface FilmSubmission {
    submitterName: string;
    country: string;
    filmTitle: string;
    submittedAt: Time;
    description: string;
    director: string;
    videoBlob?: ExternalBlob;
    contactEmail: string;
    ageGroup: string;
}
export type Time = bigint;
export interface Rating {
    createdAt: bigint;
    stars: bigint;
    filmId: string;
    raterName: string;
}
export interface Comment {
    id: bigint;
    commenterName: string;
    createdAt: bigint;
    text: string;
    filmId: string;
}
export interface backendInterface {
    addComment(filmId: string, commenterName: string, text: string): Promise<bigint>;
    addRating(filmId: string, raterName: string, stars: bigint): Promise<void>;
    getAllSubmissions(): Promise<Array<FilmSubmission>>;
    getAverageRating(filmId: string): Promise<number>;
    getComments(filmId: string): Promise<Array<Comment>>;
    getRatings(filmId: string): Promise<Array<Rating>>;
    submitFilm(submitterName: string, filmTitle: string, director: string, country: string, ageGroup: string, description: string, contactEmail: string, videoBlob: ExternalBlob | null): Promise<void>;
}
