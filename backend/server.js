// Importujemy Express 
const express = require('express');
const cors = require('cors');
const app = express();
const port = 3000;
// Dane - lista albumów 
const albums = [
    { id: 1, band: "Metallica", title: "Master of Puppets", year: 1986 },
    { id: 2, band: "Metallica", title: "Ride the Lightning", year: 1984 },
    { id: 3, band: "AC/DC", title: "Back in Black", year: 1980 },
    { id: 4, band: "AC/DC", title: "Highway to Hell", year: 1979 },
    { id: 5, band: "Iron Maiden", title: "The Number of the Beast", year: 1982 },
    { id: 6, band: "Iron Maiden", title: "Powerslave", year: 1984 }
];

// Middleware do obsługi JSON
app.use(express.json());

app.use(cors()); // Middleware do obsługi CORS

// Endpoint do pobierania albumów konkretnego zespołu
app.get('/albums/:band', (req, res) => {
    const
        band = req.params.band.toLowerCase();
    const filteredAlbums = albums.filter(album => album.band.toLowerCase() === band);

    if (filteredAlbums.length > 0) {
        res.json(filteredAlbums);
    } else {
        res.status(404).json({ message: "Nie znaleziono albumów dla tego zespołu." });
    }
});

app.get('/albums', (req, res) => {
    // Endpoint do pobierania wszystkich albumów
    res.json(albums);
});
// Endpoint do dodawania nowego albumu
app.post('/albums', (req, res) => {
    const { band, title, year, genre, cover } = req.body;
    if (!band || !title || !year || !genre || !cover) {
        return res.status(400).json({ message: "Brak wymaganych danych." });
    }
    const newAlbum = { id: albums.length + 1, band, title, year, genre, cover };
    albums.push(newAlbum);
    res.status(201).json(newAlbum);
});
// Endpoint do aktualizacji albumu
app.put('/albums/:id', (req, res) => {
    const id = parseInt(req.params.id); const
        { title, genre, cover } = req.body;
    const album = albums.find(album => album.id === id); if
        (!album) {
        return res.status(404).json({ message: "Album nie znaleziony." });
    }
    if (title) album.title = title; if
        (genre) album.genre = genre; if
        (cover) album.cover = cover;
    res.json(album);
});
// Endpoint do usuwania albumu
app.delete('/albums/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const index = albums.findIndex(album => album.id === id); if
        (index === -1) {
        return res.status(404).json({ message: "Album nie znaleziony." });
    }
    albums.splice(index, 1);
    res.json({ message: "Album usunięty." });
});
// Uruchomienie serwera 
app.listen(port,
    () => {
        console.log(`Serwer REST API działa na http://localhost:${port}`);
    });
