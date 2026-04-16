import Time "mo:core/Time";
import Text "mo:core/Text";
import List "mo:core/List";
import Int "mo:core/Int";
import Nat "mo:core/Nat";
import Float "mo:core/Float";
import Order "mo:core/Order";
import MixinObjectStorage "mo:caffeineai-object-storage/Mixin";
import Storage "mo:caffeineai-object-storage/Storage";



actor {
  type FilmSubmission = {
    submitterName : Text;
    filmTitle : Text;
    director : Text;
    country : Text;
    ageGroup : Text;
    description : Text;
    contactEmail : Text;
    submittedAt : Time.Time;
    videoBlob : ?Storage.ExternalBlob;
  };

  module FilmSubmission {
    public func compare(a : FilmSubmission, b : FilmSubmission) : Order.Order {
      Int.compare(b.submittedAt, a.submittedAt);
    };
  };

  type Comment = {
    id : Nat;
    filmId : Text;
    commenterName : Text;
    text : Text;
    createdAt : Int;
  };

  module Comment {
    public func compare(a : Comment, b : Comment) : Order.Order {
      Int.compare(b.createdAt, a.createdAt);
    };
  };

  type Rating = {
    filmId : Text;
    raterName : Text;
    stars : Nat;
    createdAt : Int;
  };

  let filmSubmissions = List.empty<FilmSubmission>();
  let comments = List.empty<Comment>();
  let ratings = List.empty<Rating>();
  var nextCommentId : Nat = 0;

  include MixinObjectStorage();

  public shared ({ caller = _ }) func submitFilm(
    submitterName : Text,
    filmTitle : Text,
    director : Text,
    country : Text,
    ageGroup : Text,
    description : Text,
    contactEmail : Text,
    videoBlob : ?Storage.ExternalBlob,
  ) : async () {
    let newSubmission : FilmSubmission = {
      submitterName;
      filmTitle;
      director;
      country;
      ageGroup;
      description;
      contactEmail;
      submittedAt = Time.now();
      videoBlob;
    };

    filmSubmissions.add(newSubmission);
  };

  public query ({ caller = _ }) func getAllSubmissions() : async [FilmSubmission] {
    filmSubmissions.toArray().sort();
  };

  public shared ({ caller = _ }) func addComment(
    filmId : Text,
    commenterName : Text,
    text : Text,
  ) : async Nat {
    let id = nextCommentId;
    nextCommentId += 1;
    let newComment : Comment = {
      id;
      filmId;
      commenterName;
      text;
      createdAt = Time.now();
    };
    comments.add(newComment);
    id;
  };

  public query ({ caller = _ }) func getComments(filmId : Text) : async [Comment] {
    comments.filter(func(c) { c.filmId == filmId }).toArray().sort();
  };

  public shared ({ caller = _ }) func addRating(
    filmId : Text,
    raterName : Text,
    stars : Nat,
  ) : async () {
    if (stars < 1 or stars > 5) {
      return;
    };
    // Overwrite existing rating by same rater for same film, or add new
    let existingIdx = ratings.findIndex(func(r) { r.filmId == filmId and r.raterName == raterName });
    switch (existingIdx) {
      case (?idx) {
        ratings.put(idx, { filmId; raterName; stars; createdAt = Time.now() });
      };
      case null {
        ratings.add({ filmId; raterName; stars; createdAt = Time.now() });
      };
    };
  };

  public query ({ caller = _ }) func getRatings(filmId : Text) : async [Rating] {
    ratings.filter(func(r) { r.filmId == filmId }).toArray();
  };

  public query ({ caller = _ }) func getAverageRating(filmId : Text) : async Float {
    let filmRatings = ratings.filter(func(r) { r.filmId == filmId });
    let count = filmRatings.size();
    if (count == 0) {
      return 0.0;
    };
    let total = filmRatings.foldLeft(0, func(acc, r) { acc + r.stars });
    total.toFloat() / count.toFloat();
  };
};
