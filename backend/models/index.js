const sequelize = require('../config/database');

const User = require('./User');
const Artist = require('./Artist');
const Album = require('./Album');
const Song = require('./Song');
const Playlist = require('./Playlist');
const PlaylistSong = require('./PlaylistSong');
const PlaylistCollaborator = require('./PlaylistCollaborator');
const UserLikedSong = require('./UserLikedSong');
const UserFollow = require('./UserFollow');
const PlaylistLike = require('./PlaylistLike');
const SavedAlbum = require('./SavedAlbum');
const ListeningHistory = require('./ListeningHistory');
const Podcast = require('./Podcast');
const PodcastEpisode = require('./PodcastEpisode');
const Comment = require('./Comment');
const Notification = require('./Notification');

// User <-> Artist (One-to-One)
User.hasOne(Artist, { foreignKey: 'userId', as: 'artistProfile' });
Artist.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Artist -> Album (One-to-Many)
Artist.hasMany(Album, { foreignKey: 'artistId', as: 'albums' });
Album.belongsTo(Artist, { foreignKey: 'artistId', as: 'artist' });

// Album -> Song (One-to-Many)
Album.hasMany(Song, { foreignKey: 'albumId', as: 'songs' });
Song.belongsTo(Album, { foreignKey: 'albumId', as: 'album' });

// Artist -> Song (One-to-Many)
Artist.hasMany(Song, { foreignKey: 'artistId', as: 'songs' });
Song.belongsTo(Artist, { foreignKey: 'artistId', as: 'artist' });

// User -> Playlist (One-to-Many)
User.hasMany(Playlist, { foreignKey: 'userId', as: 'playlists' });
Playlist.belongsTo(User, { foreignKey: 'userId', as: 'owner' });

// Playlist <-> Song (Many-to-Many)
Playlist.belongsToMany(Song, { through: PlaylistSong, foreignKey: 'playlistId', as: 'songs' });
Song.belongsToMany(Playlist, { through: PlaylistSong, foreignKey: 'songId', as: 'playlists' });

// User <-> Song (Many-to-Many - Liked Songs)
User.belongsToMany(Song, { through: UserLikedSong, foreignKey: 'userId', as: 'likedSongs' });
Song.belongsToMany(User, { through: UserLikedSong, foreignKey: 'songId', as: 'likedBy' });

// User <-> User (Many-to-Many - Follows)
User.belongsToMany(User, { through: UserFollow, foreignKey: 'followerId', as: 'following' });
User.belongsToMany(User, { through: UserFollow, foreignKey: 'followingId', as: 'followers' });

// User <-> Playlist (Many-to-Many - Likes)
User.belongsToMany(Playlist, { through: PlaylistLike, foreignKey: 'userId', as: 'likedPlaylists' });
Playlist.belongsToMany(User, { through: PlaylistLike, foreignKey: 'playlistId', as: 'likedBy' });

// User <-> Playlist (Many-to-Many - Collaborators)
Playlist.belongsToMany(User, { through: PlaylistCollaborator, foreignKey: 'playlistId', as: 'collaborators' });
User.belongsToMany(Playlist, { through: PlaylistCollaborator, foreignKey: 'userId', as: 'collaboratingPlaylists' });

User.belongsToMany(Album, { through: SavedAlbum, foreignKey: 'userId', as: 'savedAlbums' });
Album.belongsToMany(User, { through: SavedAlbum, foreignKey: 'albumId', as: 'savedBy' });

// User -> ListeningHistory (One-to-Many)
User.hasMany(ListeningHistory, { foreignKey: 'userId', as: 'listeningHistory' });
ListeningHistory.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Song -> ListeningHistory (One-to-Many)
Song.hasMany(ListeningHistory, { foreignKey: 'songId', as: 'historyEntries' });
ListeningHistory.belongsTo(Song, { foreignKey: 'songId', as: 'song' });

// Artist -> Podcast (One-to-Many)
Artist.hasMany(Podcast, { foreignKey: 'hostId', as: 'podcasts' });
Podcast.belongsTo(Artist, { foreignKey: 'hostId', as: 'host' });

// Podcast -> PodcastEpisode (One-to-Many)
Podcast.hasMany(PodcastEpisode, { foreignKey: 'podcastId', as: 'episodes' });
PodcastEpisode.belongsTo(Podcast, { foreignKey: 'podcastId', as: 'podcast' });

// Comment (Song <-> User)
Song.hasMany(Comment, { foreignKey: 'songId', as: 'comments' });
Comment.belongsTo(Song, { foreignKey: 'songId', as: 'song' });

User.hasMany(Comment, { foreignKey: 'userId', as: 'userComments' });
Comment.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Notifications (destinatario + actor)
User.hasMany(Notification, { foreignKey: 'userId', as: 'notifications' });
Notification.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Notification.belongsTo(User, { foreignKey: 'actorId', as: 'actor' });

module.exports = {
  sequelize,
  User,
  Artist,
  Album,
  Song,
  Playlist,
  PlaylistSong,
  PlaylistCollaborator,
  UserLikedSong,
  UserFollow,
  PlaylistLike,
  SavedAlbum,
  ListeningHistory,
  Podcast,
  PodcastEpisode,
  Comment,
  Notification
};
