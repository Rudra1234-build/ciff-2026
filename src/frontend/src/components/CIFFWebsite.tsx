import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Award,
  ChevronDown,
  Clock,
  Film,
  Globe,
  Menu,
  Send,
  Sparkles,
  Star,
  Upload,
  Video,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import type { FilmSubmission } from "../backend";
import { ExternalBlob } from "../backend";
import { useGetAllSubmissions, useSubmitFilm } from "../hooks/useQueries";
import SubmittedFilmsSection from "./FilmsSection";

const SCHEDULE = [
  {
    id: 1,
    date: "July 14, 2026",
    day: "Monday",
    time: "7:00 PM",
    title: "Opening Ceremony & Gala Screening",
    venue: "Live Online",
    type: "ceremony",
    description:
      "Red carpet arrival, welcome speeches by festival directors, followed by the opening gala film screening.",
  },
  {
    id: 2,
    date: "July 15–17, 2026",
    day: "Tue–Thu",
    time: "10:00 AM – 8:00 PM",
    title: "Main Competition Screenings",
    venue: "Live Online",
    type: "screening",
    description:
      "Full slate of 24 competition films across three cinema halls. Films screened by age category with interactive Q&A sessions.",
  },
  {
    id: 3,
    date: "July 16, 2026",
    day: "Wednesday",
    time: "2:00 PM",
    title: "Young Filmmakers Workshop",
    venue: "Live Online",
    type: "workshop",
    description:
      "Hands-on storytelling and filmmaking workshop for children aged 8–16. Led by professional directors from festival entries.",
  },
  {
    id: 4,
    date: "July 17, 2026",
    day: "Thursday",
    time: "6:00 PM",
    title: "International Panel: Stories Without Borders",
    venue: "Live Online",
    type: "panel",
    description:
      "Festival directors, filmmakers, and child advocates discuss the power of children's stories as global diplomacy and empathy.",
  },
  {
    id: 5,
    date: "July 18, 2026",
    day: "Friday",
    time: "6:00 PM",
    title: "Awards Night & Closing Ceremony",
    venue: "Live Online",
    type: "awards",
    description:
      "The grand finale! Announcing winners of Best Film, Best Director, Audience Favourite, and the prestigious Golden Star Award.",
  },
];

const scheduleTypeStyles: Record<
  string,
  { bg: string; text: string; icon: React.ReactNode }
> = {
  ceremony: {
    bg: "bg-primary/10",
    text: "text-primary",
    icon: <Sparkles className="w-4 h-4" />,
  },
  screening: {
    bg: "bg-accent/10",
    text: "text-accent-foreground",
    icon: <Film className="w-4 h-4" />,
  },
  workshop: {
    bg: "bg-secondary/10",
    text: "text-secondary-foreground",
    icon: <Star className="w-4 h-4" />,
  },
  panel: {
    bg: "bg-destructive/10",
    text: "text-destructive",
    icon: <Globe className="w-4 h-4" />,
  },
  awards: {
    bg: "bg-primary/20",
    text: "text-primary",
    icon: <Award className="w-4 h-4" />,
  },
};

export default function CIFFWebsite() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [formData, setFormData] = useState({
    submitterName: "",
    filmTitle: "",
    director: "",
    country: "",
    ageGroup: "",
    description: "",
    contactEmail: "",
  });
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUploadProgress, setVideoUploadProgress] = useState<number>(0);
  const [isPreparingVideo, setIsPreparingVideo] = useState(false);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const submitMutation = useSubmitFilm();
  const { data: rawSubmissions = [], isLoading: submissionsLoading } =
    useGetAllSubmissions();
  const submissions = rawSubmissions as FilmSubmission[];
  const submitRef = useRef<HTMLElement>(null);

  const navLinks = [
    { label: "Home", href: "#hero", ocid: "nav.home_link" },
    { label: "About", href: "#about", ocid: "nav.link" },
    { label: "Schedule", href: "#schedule", ocid: "nav.schedule_link" },
    { label: "Films", href: "#films", ocid: "nav.films_link" },
    { label: "Submit", href: "#submit", ocid: "nav.submit_link" },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !formData.submitterName ||
      !formData.filmTitle ||
      !formData.director ||
      !formData.country ||
      !formData.ageGroup ||
      !formData.description ||
      !formData.contactEmail
    ) {
      toast.error("Please fill in all fields before submitting.");
      return;
    }
    try {
      let videoBlob: ExternalBlob | null = null;
      if (videoFile) {
        setIsPreparingVideo(true);
        const arrayBuffer = await videoFile.arrayBuffer();
        const bytes = new Uint8Array(arrayBuffer);
        videoBlob = ExternalBlob.fromBytes(bytes).withUploadProgress((pct) => {
          setVideoUploadProgress(pct);
        });
        setIsPreparingVideo(false);
      }
      await submitMutation.mutateAsync({ ...formData, videoBlob });
      toast.success(
        "Your film has been submitted successfully! We'll be in touch soon.",
      );
      setFormData({
        submitterName: "",
        filmTitle: "",
        director: "",
        country: "",
        ageGroup: "",
        description: "",
        contactEmail: "",
      });
      setVideoFile(null);
      setVideoUploadProgress(0);
      if (videoInputRef.current) videoInputRef.current.value = "";
    } catch {
      setIsPreparingVideo(false);
      toast.error("Submission failed. Please try again.");
    }
  };

  const scrollToSubmit = () => {
    submitRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* NAV */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-md border-b border-border/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <a
              href="#hero"
              className="flex items-center gap-2"
              data-ocid="nav.home_link"
            >
              <div className="w-9 h-9 rounded-full festival-gradient flex items-center justify-center shadow-festival">
                <Film className="w-5 h-5 text-white" />
              </div>
              <span className="font-display font-800 text-lg text-foreground tracking-tight">
                CIFF <span className="text-primary">2026</span>
              </span>
            </a>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  data-ocid={link.ocid}
                  className="px-4 py-2 rounded-full text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-200"
                >
                  {link.label}
                </a>
              ))}
              <a href="#submit">
                <Button
                  size="sm"
                  className="ml-2 rounded-full festival-gradient text-white border-0 shadow-festival hover:opacity-90 transition-opacity"
                >
                  Submit Film
                </Button>
              </a>
            </nav>

            {/* Mobile menu toggle */}
            <button
              type="button"
              className="md:hidden p-2 rounded-lg text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-border bg-background"
            >
              <nav className="flex flex-col p-4 gap-1">
                {navLinks.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    data-ocid={link.ocid}
                    onClick={() => setMenuOpen(false)}
                    className="px-4 py-3 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
                  >
                    {link.label}
                  </a>
                ))}
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <main>
        {/* HERO */}
        <section
          id="hero"
          className="relative min-h-screen flex items-center justify-center overflow-hidden"
        >
          {/* Full-bleed poster background */}
          <div className="absolute inset-0">
            <img
              src="/assets/uploads/CIFF-1.jpg"
              alt="CIFF 2026 Festival Poster"
              className="w-full h-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-[oklch(0.18_0.06_290/0.55)] via-[oklch(0.18_0.06_290/0.3)] to-[oklch(0.18_0.06_290/0.85)]" />
          </div>

          {/* Stars overlay */}
          <div className="absolute inset-0 star-bg opacity-60" />

          <div className="relative z-10 text-center px-4 sm:px-6 max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <Badge className="mb-6 px-4 py-1.5 text-sm font-semibold rounded-full bg-white/10 text-white border-white/20 backdrop-blur-sm">
                🌐 14–18 July 2026 · Online Festival
              </Badge>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.15, ease: "easeOut" }}
              className="font-display font-extrabold text-white leading-none mb-4"
              style={{
                fontSize: "clamp(3rem, 10vw, 7rem)",
                textShadow: "0 4px 24px oklch(0 0 0 / 0.5)",
              }}
            >
              CIFF
              <span
                className="block"
                style={{
                  WebkitTextStroke: "2px white",
                  WebkitTextFillColor: "transparent",
                  fontSize: "clamp(1.5rem, 5vw, 3.5rem)",
                  letterSpacing: "0.3em",
                }}
              >
                2026
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.3, ease: "easeOut" }}
              className="text-white/90 font-display font-semibold mb-2"
              style={{
                fontSize: "clamp(1.1rem, 3vw, 1.8rem)",
                textShadow: "0 2px 12px oklch(0 0 0 / 0.5)",
              }}
            >
              Children International Film Festival
            </motion.p>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.45 }}
              className="text-white/70 text-base sm:text-lg mb-10 max-w-xl mx-auto"
            >
              Where young imaginations light up screens around the world.
              Stories from every corner of the globe, told for children, by
              children — streaming live online.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                duration: 0.7,
                delay: 0.6,
                type: "spring",
                stiffness: 200,
              }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Button
                data-ocid="hero.primary_button"
                size="lg"
                onClick={scrollToSubmit}
                className="rounded-full festival-gradient text-white border-0 shadow-festival text-base px-8 py-6 font-semibold hover:opacity-90 transition-opacity"
              >
                <Send className="w-5 h-5 mr-2" />
                Submit Your Film
              </Button>
            </motion.div>
          </div>

          {/* Scroll indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2"
          >
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{
                repeat: Number.POSITIVE_INFINITY,
                duration: 2,
                ease: "easeInOut",
              }}
            >
              <ChevronDown className="w-7 h-7 text-white/60" />
            </motion.div>
          </motion.div>
        </section>

        {/* ABOUT */}
        <section id="about" className="py-24 px-4 sm:px-6 lg:px-8 confetti-bg">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.7 }}
              className="text-center mb-16"
            >
              <Badge className="mb-4 px-4 py-1.5 rounded-full bg-primary/10 text-primary border-primary/20 font-semibold text-sm">
                About the Festival
              </Badge>
              <h2 className="font-display font-extrabold text-4xl sm:text-5xl text-foreground mb-6">
                Stories That Cross
                <span className="block festival-text-gradient">
                  Every Border
                </span>
              </h2>
              <p className="text-muted-foreground text-lg max-w-3xl mx-auto leading-relaxed">
                The Children International Film Festival is a celebration of the
                universal language of childhood — wonder, courage, friendship,
                and belonging. Since its founding, CIFF has brought together
                filmmakers, educators, and young audiences from over 60
                countries. In 2026, the festival goes fully online — accessible
                to everyone, everywhere.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  icon: <Globe className="w-8 h-8" />,
                  color: "text-primary",
                  bg: "bg-primary/10",
                  title: "60+ Countries",
                  desc: "Films submitted from every continent, representing cultures and perspectives that enrich us all.",
                },
                {
                  icon: <Film className="w-8 h-8" />,
                  color: "text-secondary-foreground",
                  bg: "bg-secondary/10",
                  title: "200+ Films Screened",
                  desc: "A curated selection of short and feature films created by and for children of all ages.",
                },
                {
                  icon: <Award className="w-8 h-8" />,
                  color: "text-accent-foreground",
                  bg: "bg-accent/10",
                  title: "The Golden Star Award",
                  desc: "Our highest honour, recognising films that inspire empathy, creativity, and global understanding.",
                },
              ].map((item, i) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ duration: 0.6, delay: i * 0.15 }}
                >
                  <Card className="h-full border-border/60 shadow-card hover:shadow-festival transition-shadow duration-300">
                    <CardContent className="p-8">
                      <div
                        className={`w-14 h-14 rounded-2xl ${item.bg} ${item.color} flex items-center justify-center mb-5`}
                      >
                        {item.icon}
                      </div>
                      <h3 className="font-display font-bold text-xl text-foreground mb-3">
                        {item.title}
                      </h3>
                      <p className="text-muted-foreground leading-relaxed">
                        {item.desc}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* SCHEDULE */}
        <section
          id="schedule"
          className="py-24 px-4 sm:px-6 lg:px-8 confetti-bg"
        >
          <div className="max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.7 }}
              className="text-center mb-16"
            >
              <Badge className="mb-4 px-4 py-1.5 rounded-full bg-accent/10 text-accent-foreground border-accent/20 font-semibold text-sm">
                Festival Schedule
              </Badge>
              <h2 className="font-display font-extrabold text-4xl sm:text-5xl text-foreground mb-4">
                Five Days of
                <span className="block festival-text-gradient">
                  Cinema Magic
                </span>
              </h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                July 14–18, 2026 · Online Festival
              </p>
            </motion.div>

            <div className="space-y-4">
              {SCHEDULE.map((event, i) => {
                const style =
                  scheduleTypeStyles[event.type] ||
                  scheduleTypeStyles.screening;
                return (
                  <motion.div
                    key={event.id}
                    data-ocid={`schedule.item.${event.id}`}
                    initial={{ opacity: 0, x: -30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: "-60px" }}
                    transition={{ duration: 0.6, delay: i * 0.1 }}
                  >
                    <Card className="border-border/60 shadow-card hover:shadow-festival transition-shadow duration-300">
                      <CardContent className="p-6">
                        <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                          <div className="flex-shrink-0 text-center sm:text-left">
                            <div className="w-20 h-20 rounded-2xl festival-gradient flex flex-col items-center justify-center text-white shadow-festival">
                              <span className="text-xs font-semibold opacity-80">
                                {event.day}
                              </span>
                              <span className="text-sm font-bold leading-tight">
                                {event.date
                                  .split(",")[0]
                                  .replace("July ", "")
                                  .replace("–", "–")}
                              </span>
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2 mb-2">
                              <span
                                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${style.bg} ${style.text}`}
                              >
                                {style.icon}
                                {event.type.charAt(0).toUpperCase() +
                                  event.type.slice(1)}
                              </span>
                              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Clock className="w-3.5 h-3.5" />
                                {event.time}
                              </span>
                            </div>
                            <h3 className="font-display font-bold text-lg text-foreground mb-1">
                              {event.title}
                            </h3>
                            <p className="text-sm text-muted-foreground mb-2">
                              {event.description}
                            </p>
                            <span className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Globe className="w-3.5 h-3.5" />
                              {event.venue}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        <div className="section-divider mx-8 sm:mx-16 lg:mx-32" />

        {/* SUBMIT */}
        <section
          id="submit"
          ref={submitRef as React.RefObject<HTMLElement>}
          className="py-24 px-4 sm:px-6 lg:px-8"
        >
          <div className="max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.7 }}
              className="text-center mb-12"
            >
              <Badge className="mb-4 px-4 py-1.5 rounded-full bg-primary/10 text-primary border-primary/20 font-semibold text-sm">
                Film Submissions Open
              </Badge>
              <h2 className="font-display font-extrabold text-4xl sm:text-5xl text-foreground mb-4">
                Share Your
                <span className="block festival-text-gradient">
                  Story With the World
                </span>
              </h2>
              <p className="text-muted-foreground text-lg max-w-xl mx-auto">
                Submit your film for the CIFF 2026 Official Selection.
                Submissions close May 31, 2026.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.7, delay: 0.15 }}
            >
              <Card className="border-border/60 shadow-festival">
                <CardContent className="p-8">
                  <AnimatePresence mode="wait">
                    {submitMutation.isSuccess ? (
                      <motion.div
                        key="success"
                        data-ocid="submit.success_state"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        className="text-center py-12"
                      >
                        <div className="w-20 h-20 rounded-full bg-accent/20 flex items-center justify-center mx-auto mb-6">
                          <Star className="w-10 h-10 text-accent-foreground" />
                        </div>
                        <h3 className="font-display font-bold text-2xl text-foreground mb-3">
                          Submission Received!
                        </h3>
                        <p className="text-muted-foreground mb-6">
                          Thank you for submitting to CIFF 2026. Our team will
                          review your film and contact you within 4–6 weeks.
                        </p>
                        <Button
                          variant="outline"
                          onClick={() => submitMutation.reset()}
                          className="rounded-full"
                        >
                          Submit Another Film
                        </Button>
                      </motion.div>
                    ) : (
                      <motion.form
                        key="form"
                        onSubmit={handleSubmit}
                        className="space-y-6"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                      >
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                          <div className="space-y-2">
                            <Label
                              htmlFor="submitterName"
                              className="font-semibold text-sm"
                            >
                              Your Name
                            </Label>
                            <Input
                              id="submitterName"
                              data-ocid="submit.input"
                              placeholder="Jane Smith"
                              value={formData.submitterName}
                              onChange={(e) =>
                                setFormData((p) => ({
                                  ...p,
                                  submitterName: e.target.value,
                                }))
                              }
                              className="rounded-xl border-border/70 focus:ring-primary"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label
                              htmlFor="filmTitle"
                              className="font-semibold text-sm"
                            >
                              Film Title
                            </Label>
                            <Input
                              id="filmTitle"
                              data-ocid="submit.film_title.input"
                              placeholder="The Magic Lantern"
                              value={formData.filmTitle}
                              onChange={(e) =>
                                setFormData((p) => ({
                                  ...p,
                                  filmTitle: e.target.value,
                                }))
                              }
                              className="rounded-xl border-border/70"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label
                              htmlFor="director"
                              className="font-semibold text-sm"
                            >
                              Director Name
                            </Label>
                            <Input
                              id="director"
                              data-ocid="submit.director.input"
                              placeholder="Alex Johnson"
                              value={formData.director}
                              onChange={(e) =>
                                setFormData((p) => ({
                                  ...p,
                                  director: e.target.value,
                                }))
                              }
                              className="rounded-xl border-border/70"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label
                              htmlFor="country"
                              className="font-semibold text-sm"
                            >
                              Country of Origin
                            </Label>
                            <Input
                              id="country"
                              data-ocid="submit.country.input"
                              placeholder="United Kingdom"
                              value={formData.country}
                              onChange={(e) =>
                                setFormData((p) => ({
                                  ...p,
                                  country: e.target.value,
                                }))
                              }
                              className="rounded-xl border-border/70"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label
                              htmlFor="ageGroup"
                              className="font-semibold text-sm"
                            >
                              Target Age Group
                            </Label>
                            <Select
                              value={formData.ageGroup}
                              onValueChange={(v) =>
                                setFormData((p) => ({ ...p, ageGroup: v }))
                              }
                            >
                              <SelectTrigger
                                id="ageGroup"
                                data-ocid="submit.age_group.select"
                                className="rounded-xl border-border/70"
                              >
                                <SelectValue placeholder="Select age group" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Under 6">Under 6</SelectItem>
                                <SelectItem value="6-9">6–9 years</SelectItem>
                                <SelectItem value="10-12">
                                  10–12 years
                                </SelectItem>
                                <SelectItem value="13-17">
                                  13–17 years
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label
                              htmlFor="contactEmail"
                              className="font-semibold text-sm"
                            >
                              Contact Email
                            </Label>
                            <Input
                              id="contactEmail"
                              type="email"
                              data-ocid="submit.email.input"
                              placeholder="you@example.com"
                              value={formData.contactEmail}
                              onChange={(e) =>
                                setFormData((p) => ({
                                  ...p,
                                  contactEmail: e.target.value,
                                }))
                              }
                              className="rounded-xl border-border/70"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label
                            htmlFor="description"
                            className="font-semibold text-sm"
                          >
                            Film Description
                          </Label>
                          <Textarea
                            id="description"
                            data-ocid="submit.description.textarea"
                            placeholder="Tell us about your film — its story, themes, and what makes it special..."
                            value={formData.description}
                            onChange={(e) =>
                              setFormData((p) => ({
                                ...p,
                                description: e.target.value,
                              }))
                            }
                            rows={4}
                            className="rounded-xl border-border/70 resize-none"
                          />
                        </div>

                        {/* VIDEO UPLOAD */}
                        <div className="space-y-2">
                          <Label
                            htmlFor="videoUpload"
                            className="font-semibold text-sm"
                          >
                            Upload Movie Video
                            <span className="ml-2 text-xs font-normal text-muted-foreground">
                              (Optional — MP4, MOV, AVI, MKV)
                            </span>
                          </Label>
                          <div
                            className={`relative rounded-xl border-2 border-dashed transition-all duration-200 ${
                              videoFile
                                ? "border-primary/50 bg-primary/5"
                                : "border-border/50 hover:border-primary/40 hover:bg-muted/30"
                            }`}
                          >
                            <input
                              ref={videoInputRef}
                              id="videoUpload"
                              type="file"
                              accept="video/mp4,video/quicktime,video/x-msvideo,video/x-matroska,.mp4,.mov,.avi,.mkv"
                              data-ocid="submit.video_upload.input"
                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                              onChange={(e) => {
                                const file = e.target.files?.[0] ?? null;
                                setVideoFile(file);
                                setVideoUploadProgress(0);
                              }}
                            />
                            <div className="flex items-center gap-4 p-4">
                              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                                {videoFile ? (
                                  <Video className="w-6 h-6 text-primary" />
                                ) : (
                                  <Upload className="w-6 h-6 text-muted-foreground" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                {videoFile ? (
                                  <>
                                    <p className="text-sm font-semibold text-foreground truncate">
                                      {videoFile.name}
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-0.5">
                                      {(videoFile.size / (1024 * 1024)).toFixed(
                                        1,
                                      )}{" "}
                                      MB
                                    </p>
                                  </>
                                ) : (
                                  <>
                                    <p className="text-sm font-medium text-foreground">
                                      Click to browse or drag your video here
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-0.5">
                                      Accepted formats: MP4, MOV, AVI, MKV
                                    </p>
                                  </>
                                )}
                              </div>
                              {videoFile && (
                                <button
                                  type="button"
                                  aria-label="Remove video"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setVideoFile(null);
                                    setVideoUploadProgress(0);
                                    if (videoInputRef.current)
                                      videoInputRef.current.value = "";
                                  }}
                                  className="flex-shrink-0 w-8 h-8 rounded-full hover:bg-destructive/10 text-muted-foreground hover:text-destructive flex items-center justify-center transition-colors"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                            {isPreparingVideo && (
                              <div className="px-4 pb-4">
                                <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                                  <motion.div
                                    className="h-full festival-gradient rounded-full"
                                    initial={{ width: "0%" }}
                                    animate={{
                                      width: `${videoUploadProgress}%`,
                                    }}
                                    transition={{ duration: 0.3 }}
                                  />
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">
                                  Preparing video… {videoUploadProgress}%
                                </p>
                              </div>
                            )}
                          </div>
                        </div>

                        {submitMutation.isError && (
                          <div
                            data-ocid="submit.error_state"
                            className="p-4 rounded-xl bg-destructive/10 text-destructive text-sm font-medium"
                          >
                            ⚠️ Submission failed. Please check your connection
                            and try again.
                          </div>
                        )}

                        <Button
                          type="submit"
                          data-ocid="submit.submit_button"
                          disabled={
                            submitMutation.isPending || isPreparingVideo
                          }
                          className="w-full rounded-xl festival-gradient text-white border-0 shadow-festival py-6 text-base font-semibold hover:opacity-90 transition-opacity"
                        >
                          {submitMutation.isPending || isPreparingVideo ? (
                            <span
                              data-ocid="submit.loading_state"
                              className="flex items-center gap-2"
                            >
                              <svg
                                role="img"
                                aria-label="Loading"
                                className="animate-spin w-5 h-5"
                                viewBox="0 0 24 24"
                                fill="none"
                              >
                                <circle
                                  className="opacity-25"
                                  cx="12"
                                  cy="12"
                                  r="10"
                                  stroke="currentColor"
                                  strokeWidth="4"
                                />
                                <path
                                  className="opacity-75"
                                  fill="currentColor"
                                  d="M4 12a8 8 0 018-8v8H4z"
                                />
                              </svg>
                              {isPreparingVideo
                                ? "Preparing video..."
                                : "Submitting your film..."}
                            </span>
                          ) : (
                            <span className="flex items-center gap-2">
                              <Send className="w-5 h-5" />
                              Submit Your Film
                            </span>
                          )}
                        </Button>
                      </motion.form>
                    )}
                  </AnimatePresence>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </section>

        <div className="section-divider mx-8 sm:mx-16 lg:mx-32" />

        {/* SUBMITTED FILMS */}
        <SubmittedFilmsSection
          films={submissions}
          isLoading={submissionsLoading}
        />
      </main>

      {/* FOOTER */}
      <footer className="festival-gradient text-white py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-12">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <Film className="w-6 h-6 text-white" />
                </div>
                <span className="font-display font-bold text-2xl">
                  CIFF 2026
                </span>
              </div>
              <p className="text-white/70 text-sm leading-relaxed">
                Children International Film Festival — celebrating the art of
                storytelling for and by children everywhere.
              </p>
            </div>
            <div>
              <h4 className="font-display font-bold text-base mb-4 text-white/90">
                Quick Links
              </h4>
              <nav className="flex flex-col gap-2">
                {navLinks.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    className="text-white/60 hover:text-white text-sm transition-colors"
                  >
                    {link.label}
                  </a>
                ))}
              </nav>
            </div>
            <div>
              <h4 className="font-display font-bold text-base mb-4 text-white/90">
                Contact
              </h4>
              <div className="space-y-2 text-white/70 text-sm">
                <p>🌐 Online Festival</p>
                <p>📅 July 14–18, 2026</p>
              </div>
            </div>
          </div>
          <div className="border-t border-white/20 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-white/60 text-sm">
              © {new Date().getFullYear()} Children International Film Festival.
              All rights reserved.
            </p>
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== "undefined" ? window.location.hostname : "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/50 hover:text-white/80 text-xs transition-colors"
            >
              Built with ❤️ using caffeine.ai
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
