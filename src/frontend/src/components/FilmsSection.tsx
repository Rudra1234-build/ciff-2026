import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { MessageCircle, Star, ThumbsUp } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import type { Comment, FilmSubmission, Rating } from "../backend";
import {
  useAddComment,
  useAddRating,
  useGetAverageRating,
  useGetComments,
  useGetRatings,
} from "../hooks/useQueries";

function formatDate(ts: bigint): string {
  const ms = Number(ts / 1_000_000n);
  return new Date(ms).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function StarRow({
  count,
  filled,
  interactive,
  hovered,
  onHover,
  onClick,
  size = "w-5 h-5",
}: {
  count: number;
  filled: number;
  interactive?: boolean;
  hovered?: number;
  onHover?: (n: number) => void;
  onClick?: (n: number) => void;
  size?: string;
}) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: count }, (_, i) => {
        const val = i + 1;
        const active = hovered != null ? val <= hovered : val <= filled;
        return (
          <button
            key={val}
            type="button"
            aria-label={`Rate ${val} star${val > 1 ? "s" : ""}`}
            disabled={!interactive}
            onClick={() => onClick?.(val)}
            onMouseEnter={() => onHover?.(val)}
            onMouseLeave={() => onHover?.(0)}
            className={`transition-transform ${interactive ? "cursor-pointer hover:scale-110" : "cursor-default"}`}
          >
            <Star
              className={`${size} transition-colors ${active ? "fill-[oklch(0.82_0.18_52)] text-[oklch(0.82_0.18_52)]" : "text-muted-foreground/40"}`}
            />
          </button>
        );
      })}
    </div>
  );
}

function FilmRatings({ filmId }: { filmId: string }) {
  const [raterName, setRaterName] = useState("");
  const [hoveredStar, setHoveredStar] = useState(0);
  const { data: ratings = [], isLoading: ratingsLoading } =
    useGetRatings(filmId);
  const { data: avgRaw = 0 } = useGetAverageRating(filmId);
  const addRatingMutation = useAddRating();

  const avg = typeof avgRaw === "number" ? avgRaw : 0;
  const count = (ratings as Rating[]).length;

  const handleRate = async (stars: number) => {
    if (!raterName.trim()) {
      toast.error("Please enter your name before rating.");
      return;
    }
    try {
      await addRatingMutation.mutateAsync({
        filmId,
        raterName: raterName.trim(),
        stars: BigInt(stars),
      });
      toast.success("Your rating has been saved!");
    } catch {
      toast.error("Failed to save rating. Please try again.");
    }
  };

  return (
    <div className="space-y-3">
      {/* Average display */}
      <div className="flex items-center gap-3 flex-wrap">
        <StarRow count={5} filled={Math.round(avg)} size="w-4 h-4" />
        {ratingsLoading ? (
          <Skeleton className="h-4 w-24" />
        ) : (
          <span className="text-sm font-semibold text-foreground">
            {count > 0
              ? `★ ${avg.toFixed(1)} / 5 (${count} ${count === 1 ? "rating" : "ratings"})`
              : "No ratings yet"}
          </span>
        )}
      </div>

      {/* Rating input */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
        <Input
          placeholder="Your name"
          value={raterName}
          onChange={(e) => setRaterName(e.target.value)}
          className="h-8 text-sm rounded-lg border-border/60 max-w-[160px]"
          data-ocid="film.rater_name.input"
        />
        <div className="flex items-center gap-1.5">
          <StarRow
            count={5}
            filled={0}
            interactive
            hovered={hoveredStar}
            onHover={setHoveredStar}
            onClick={handleRate}
            size="w-5 h-5"
          />
          {addRatingMutation.isPending && (
            <span className="text-xs text-muted-foreground animate-pulse">
              Saving…
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function FilmComments({ filmId }: { filmId: string }) {
  const [commenterName, setCommenterName] = useState("");
  const [commentText, setCommentText] = useState("");
  const { data: rawComments = [], isLoading } = useGetComments(filmId);
  const addCommentMutation = useAddComment();

  const comments = useMemo(() => {
    return [...(rawComments as Comment[])].sort((a, b) =>
      Number(b.createdAt - a.createdAt),
    );
  }, [rawComments]);

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commenterName.trim() || !commentText.trim()) {
      toast.error("Please enter your name and a comment.");
      return;
    }
    try {
      await addCommentMutation.mutateAsync({
        filmId,
        commenterName: commenterName.trim(),
        text: commentText.trim(),
      });
      toast.success("Comment posted!");
      setCommentText("");
    } catch {
      toast.error("Failed to post comment. Please try again.");
    }
  };

  return (
    <div className="space-y-4">
      <h4 className="font-display font-semibold text-sm text-foreground flex items-center gap-1.5">
        <MessageCircle className="w-4 h-4 text-primary" />
        Comments
      </h4>

      {/* Existing comments */}
      {isLoading ? (
        <div className="space-y-2">
          {[1, 2].map((k) => (
            <Skeleton key={k} className="h-12 w-full rounded-lg" />
          ))}
        </div>
      ) : comments.length === 0 ? (
        <p
          className="text-xs text-muted-foreground italic"
          data-ocid="film.comments.empty_state"
        >
          No comments yet — be the first to say something!
        </p>
      ) : (
        <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
          {comments.map((c) => (
            <div
              key={String(c.id)}
              className="p-3 rounded-lg bg-muted/40 border border-border/40"
              data-ocid="film.comment.item"
            >
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="text-xs font-semibold text-foreground">
                  {c.commenterName}
                </span>
                <span className="text-xs text-muted-foreground">
                  {formatDate(c.createdAt)}
                </span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed break-words">
                {c.text}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Post comment form */}
      <form onSubmit={handlePost} className="space-y-2">
        <Input
          placeholder="Your name"
          value={commenterName}
          onChange={(e) => setCommenterName(e.target.value)}
          className="h-8 text-sm rounded-lg border-border/60"
          data-ocid="film.comment_name.input"
        />
        <Textarea
          placeholder="Write a comment…"
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          rows={2}
          className="text-sm rounded-lg border-border/60 resize-none"
          data-ocid="film.comment_text.textarea"
        />
        <Button
          type="submit"
          size="sm"
          disabled={addCommentMutation.isPending}
          className="rounded-lg festival-gradient text-white border-0 text-xs font-semibold hover:opacity-90 transition-opacity"
          data-ocid="film.post_comment.button"
        >
          {addCommentMutation.isPending ? "Posting…" : "Post Comment"}
        </Button>
      </form>
    </div>
  );
}

function VideoPlayer({
  videoBlob,
}: { videoBlob?: FilmSubmission["videoBlob"] }) {
  const [src, setSrc] = useState<string | null>(null);

  useEffect(() => {
    if (!videoBlob) return;
    let url: string;
    const run = async () => {
      try {
        const bytes = await videoBlob.getBytes();
        const blob = new Blob([bytes], { type: "video/mp4" });
        url = URL.createObjectURL(blob);
        setSrc(url);
      } catch {
        // silently ignore if blob not available
      }
    };
    run();
    return () => {
      if (url) URL.revokeObjectURL(url);
    };
  }, [videoBlob]);

  if (!src) return null;

  return (
    <div className="rounded-xl overflow-hidden border border-border/40 bg-black aspect-video">
      {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
      <video
        src={src}
        controls
        preload="metadata"
        className="w-full h-full object-contain"
        data-ocid="film.video_player"
      >
        <track kind="captions" />
      </video>
    </div>
  );
}

export function FilmCard({
  film,
  index,
}: {
  film: FilmSubmission;
  index: number;
}) {
  const [expanded, setExpanded] = useState(false);
  const filmId = String(film.submittedAt);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.55, delay: index * 0.08 }}
    >
      <Card
        className="h-full border-border/60 shadow-card hover:shadow-festival transition-shadow duration-300 flex flex-col"
        data-ocid="film.card"
      >
        <CardContent className="p-6 flex flex-col gap-5 flex-1">
          {/* Header */}
          <div className="space-y-1">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <h3 className="font-display font-bold text-lg text-foreground leading-tight">
                {film.filmTitle}
              </h3>
              <Badge className="text-xs rounded-full bg-primary/10 text-primary border-primary/20 shrink-0">
                {film.ageGroup}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">
                {film.director}
              </span>
              {film.country ? ` · ${film.country}` : ""}
            </p>
            <p className="text-xs text-muted-foreground">
              Submitted {formatDate(film.submittedAt)}
            </p>
          </div>

          {/* Description */}
          <div>
            <p
              className={`text-sm text-muted-foreground leading-relaxed ${!expanded ? "line-clamp-3" : ""}`}
            >
              {film.description}
            </p>
            {film.description.length > 160 && (
              <button
                type="button"
                onClick={() => setExpanded(!expanded)}
                className="text-xs text-primary hover:underline mt-1 font-medium"
                data-ocid="film.expand_description.button"
              >
                {expanded ? "Show less" : "Read more"}
              </button>
            )}
          </div>

          {/* Video */}
          {film.videoBlob && <VideoPlayer videoBlob={film.videoBlob} />}

          {/* Contact */}
          <a
            href={`mailto:${film.contactEmail}`}
            className="text-xs text-primary hover:underline break-all"
            data-ocid="film.contact_email.link"
          >
            ✉ {film.contactEmail}
          </a>

          <div className="border-t border-border/40 pt-4 space-y-4">
            {/* Ratings */}
            <FilmRatings filmId={filmId} />
            {/* Comments */}
            <FilmComments filmId={filmId} />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function SubmittedFilmsSection({
  films,
  isLoading,
}: {
  films: FilmSubmission[];
  isLoading: boolean;
}) {
  const hasFilms = films.length > 0;

  return (
    <section id="films" className="py-24 px-4 sm:px-6 lg:px-8 confetti-bg">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <Badge className="mb-4 px-4 py-1.5 rounded-full bg-secondary/10 text-secondary-foreground border-secondary/20 font-semibold text-sm">
            🎬 Submitted Films
          </Badge>
          <h2 className="font-display font-extrabold text-4xl sm:text-5xl text-foreground mb-4">
            From Young Filmmakers
            <span className="block festival-text-gradient">
              Around the World
            </span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Watch, rate, and leave a comment for the films submitted to CIFF
            2026.
          </p>
        </motion.div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((k) => (
              <Card key={k} className="border-border/60">
                <CardContent className="p-6 space-y-4">
                  <Skeleton className="h-6 w-3/4 rounded" />
                  <Skeleton className="h-4 w-1/2 rounded" />
                  <Skeleton className="h-32 w-full rounded-xl" />
                  <Skeleton className="h-4 w-full rounded" />
                  <Skeleton className="h-4 w-2/3 rounded" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : !hasFilms ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center py-20"
            data-ocid="films.empty_state"
          >
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <ThumbsUp className="w-10 h-10 text-primary" />
            </div>
            <h3 className="font-display font-bold text-2xl text-foreground mb-3">
              No films submitted yet
            </h3>
            <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
              Be the first filmmaker to submit your story to CIFF 2026!
            </p>
            <a href="#submit">
              <Button className="rounded-full festival-gradient text-white border-0 shadow-festival hover:opacity-90 transition-opacity">
                Submit Your Film
              </Button>
            </a>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {films.map((film, i) => (
              <FilmCard key={String(film.submittedAt)} film={film} index={i} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
