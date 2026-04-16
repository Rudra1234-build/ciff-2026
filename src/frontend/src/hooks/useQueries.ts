import { useActor } from "@caffeineai/core-infrastructure";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Comment, ExternalBlob, Rating } from "../backend";
import { createActor } from "../backend";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ActorWithMethods = Record<
  string,
  (...args: unknown[]) => Promise<unknown>
>;

function useBackendActor() {
  const { actor, isFetching } = useActor(createActor);
  return { actor: actor as unknown as ActorWithMethods | null, isFetching };
}

export type SubmitFilmData = {
  submitterName: string;
  filmTitle: string;
  director: string;
  country: string;
  ageGroup: string;
  description: string;
  contactEmail: string;
  videoBlob?: ExternalBlob | null;
};

export function useGetAllSubmissions() {
  const { actor, isFetching } = useBackendActor();
  return useQuery({
    queryKey: ["submissions"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllSubmissions() as Promise<unknown[]>;
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSubmitFilm() {
  const { actor } = useBackendActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: SubmitFilmData) => {
      if (!actor) throw new Error("Not connected");
      return actor.submitFilm(
        data.submitterName,
        data.filmTitle,
        data.director,
        data.country,
        data.ageGroup,
        data.description,
        data.contactEmail,
        data.videoBlob ? [data.videoBlob] : [],
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["submissions"] });
    },
  });
}

export function useGetComments(filmId: string) {
  const { actor, isFetching } = useBackendActor();
  return useQuery({
    queryKey: ["comments", filmId],
    queryFn: async () => {
      if (!actor) return [] as Comment[];
      return actor.getComments(filmId) as Promise<Comment[]>;
    },
    enabled: !!actor && !isFetching && !!filmId,
  });
}

export function useAddComment() {
  const { actor } = useBackendActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      filmId,
      commenterName,
      text,
    }: {
      filmId: string;
      commenterName: string;
      text: string;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.addComment(filmId, commenterName, text) as Promise<bigint>;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["comments", variables.filmId],
      });
    },
  });
}

export function useGetRatings(filmId: string) {
  const { actor, isFetching } = useBackendActor();
  return useQuery({
    queryKey: ["ratings", filmId],
    queryFn: async () => {
      if (!actor) return [] as Rating[];
      return actor.getRatings(filmId) as Promise<Rating[]>;
    },
    enabled: !!actor && !isFetching && !!filmId,
  });
}

export function useAddRating() {
  const { actor } = useBackendActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      filmId,
      raterName,
      stars,
    }: {
      filmId: string;
      raterName: string;
      stars: bigint;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.addRating(filmId, raterName, stars) as Promise<void>;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["ratings", variables.filmId],
      });
      queryClient.invalidateQueries({
        queryKey: ["averageRating", variables.filmId],
      });
    },
  });
}

export function useGetAverageRating(filmId: string) {
  const { actor, isFetching } = useBackendActor();
  return useQuery({
    queryKey: ["averageRating", filmId],
    queryFn: async () => {
      if (!actor) return 0;
      return actor.getAverageRating(filmId) as Promise<number>;
    },
    enabled: !!actor && !isFetching && !!filmId,
  });
}
