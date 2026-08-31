const sequelize = require('./database');
const {
  User, Artist, Album, Song, Playlist, PlaylistSong,
  UserLikedSong, ListeningHistory, Podcast, PodcastEpisode
} = require('../models');

const seed = async () => {
  try {
    await sequelize.sync({ force: true });
    console.log('Database synced');

    // Users
    const admin = await User.create({
      username: 'admin',
      email: 'admin@audioly.com',
      password: 'admin123',
      role: 'admin'
    });

    const user1 = await User.create({
      username: 'carlos',
      email: 'carlos@audioly.com',
      password: 'user123',
      role: 'user'
    });

    const artistUser1 = await User.create({
      username: 'badbunny',
      email: 'badbunny@audioly.com',
      password: 'artist123',
      role: 'artist'
    });

    const artistUser2 = await User.create({
      username: 'rosalia',
      email: 'rosalia@audioly.com',
      password: 'artist123',
      role: 'artist'
    });

    console.log('Users created');

    // Artists
    const badbunny = await Artist.create({
      userId: artistUser1.id,
      name: 'Bad Bunny',
      bio: 'Artista puertorriqueño de reggaeton y trap latino',
      verified: true,
      monthlyListeners: 50000000,
      image: 'https://i.scdn.co/image/ab6761610000e5ebc4f0f9e5c5f5c5f5c5f5c5f5'
    });

    const rosalia = await Artist.create({
      userId: artistUser2.id,
      name: 'Rosalía',
      bio: 'Cantante y compositora española de flamenco y pop',
      verified: true,
      monthlyListeners: 25000000
    });

    console.log('Artists created');

    // Albums
    const album1 = await Album.create({
      title: 'Un Verano Sin Ti',
      artistId: badbunny.id,
      releaseDate: '2022-05-06',
      genre: 'Reggaeton',
      description: 'Album de Bad Bunny'
    });

    const album2 = await Album.create({
      title: 'Motomami',
      artistId: rosalia.id,
      releaseDate: '2022-03-18',
      genre: 'Pop',
      description: 'Album de Rosalía'
    });

    console.log('Albums created');

    // Songs
    const songs = await Song.bulkCreate([
      {
        title: 'Tití Me Preguntó',
        artistId: badbunny.id,
        albumId: album1.id,
        duration: 243,
        url: 'https://example.com/audio/titi.mp3',
        genre: 'Reggaeton',
        plays: 450000000,
        isExplicit: true,
        lyrics: 'Tití me preguntó si tengo muchas novias...'
      },
      {
        title: 'Efecto',
        artistId: badbunny.id,
        albumId: album1.id,
        duration: 196,
        url: 'https://example.com/audio/efecto.mp3',
        genre: 'Reggaeton',
        plays: 380000000,
        lyrics: 'Un efecto en ti, tiene lo mío...'
      },
      {
        title: 'La Corriente',
        artistId: badbunny.id,
        albumId: album1.id,
        duration: 242,
        url: 'https://example.com/audio/corriente.mp3',
        genre: 'Reggaeton',
        plays: 310000000
      },
      {
        title: 'Motomami',
        artistId: rosalia.id,
        albumId: album2.id,
        duration: 181,
        url: 'https://example.com/audio/motomami.mp3',
        genre: 'Pop',
        plays: 250000000,
        isExplicit: true,
        lyrics: 'Motomami, dame gasolina...'
      },
      {
        title: 'DESPECHÁ',
        artistId: rosalia.id,
        duration: 157,
        url: 'https://example.com/audio/despecha.mp3',
        genre: 'Pop',
        plays: 200000000
      }
    ]);

    console.log('Songs created');

    // Playlists
    const playlist1 = await Playlist.create({
      name: 'Mis Favoritas',
      description: 'Todas mis canciones favoritas',
      userId: user1.id,
      isPublic: true
    });

    const playlist2 = await Playlist.create({
      name: 'Reggaeton Hits',
      description: 'Los mejores temas de reggaeton',
      userId: admin.id,
      isPublic: true
    });

    // Add songs to playlists
    await PlaylistSong.bulkCreate([
      { playlistId: playlist1.id, songId: songs[0].id },
      { playlistId: playlist1.id, songId: songs[3].id },
      { playlistId: playlist2.id, songId: songs[0].id },
      { playlistId: playlist2.id, songId: songs[1].id },
      { playlistId: playlist2.id, songId: songs[2].id }
    ]);

    // Liked songs
    await UserLikedSong.bulkCreate([
      { userId: user1.id, songId: songs[0].id },
      { userId: user1.id, songId: songs[3].id }
    ]);

    // Listening history
    await ListeningHistory.bulkCreate([
      { userId: user1.id, songId: songs[0].id, durationPlayed: 243 },
      { userId: user1.id, songId: songs[1].id, durationPlayed: 150 },
      { userId: user1.id, songId: songs[3].id, durationPlayed: 181 }
    ]);

    // Podcasts
    const podcast = await Podcast.create({
      title: 'El Mejor Podcast Musical',
      hostId: badbunny.id,
      description: 'Discusión sobre la música latina actual',
      genre: 'Música'
    });

    await PodcastEpisode.create({
      podcastId: podcast.id,
      title: 'Episodio 1: Historia del Reggaeton',
      audioUrl: 'https://example.com/audio/ep1.mp3',
      duration: 3600,
      releaseDate: '2024-01-15',
      description: 'Explorando los orígenes del reggaeton'
    });

    console.log('All seed data created successfully');
    process.exit(0);

  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seed();
