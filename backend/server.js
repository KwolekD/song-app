const express = require('express');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const fs = require('fs');
const app = express();
const port = 3000;
// Dane - lista albumów 
const albums = [
    { id: 1, band: "Metallica", title: "Master of Puppets", year: 1986, genre: "Rock", img: null },
    { id: 2, band: "Metallica", title: "Ride the Lightning", year: 1984, genre: "Rock", img: null },
    { id: 3, band: "AC/DC", title: "Back in Black", year: 1980, genre: "Rock", img: null },
    { id: 4, band: "AC/DC", title: "Highway to Hell", year: 1979, genre: "Rock", img: null },
    { id: 5, band: "Iron Maiden", title: "The Number of the Beast", genre: "Rock", year: 1982, img: null },
    { id: 6, band: "Iron Maiden", title: "Powerslave", year: 1984, genre: "Rock", img: null }
];

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const upload = multer({ storage: storage });

// Middleware do obsługi JSON
app.use(express.json());

app.use(cors()); // Middleware do obsługi CORS

const uploadsPath = path.join(__dirname, 'uploads');

app.use('/uploads', express.static(uploadsPath));

app.put('/albums/:id/img', upload.single('img'), (req, res) => {
    const id = parseInt(req.params.id);
    const album = albums.find(album => album.id === id);
    if (!album) {
        return res.status(404).json({ message: "Album nie znaleziony." });
    }
    if (!req.file) {
        return res.status(400).json({ message: "Brak pliku obrazu." });
    }
    if (album.img) {
        // Jeśli album już ma obraz, usuwamy stary plik
        const oldImgPath = path.join(uploadsPath, album.img.split('/').pop());
        fs.unlink(oldImgPath, (err) => {
            if (err) {
                console.error("Błąd podczas usuwania starego obrazu:", err);
            }
        });
    }
    album.img = `http://localhost:3000/uploads/${req.file.filename}`;
    res.json(album);
});

// Endpoint do pobierania albumów konkretnego zespołu
app.get('/albums/:band', (req, res) => {
    const
        band = req.params.band.toLowerCase();
    const filteredAlbums = albums.filter(album => album.band.toLowerCase().includes(band));

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
    if (!band || !title || !year || !genre) {
        return res.status(400).json({ message: "Brak wymaganych danych." });
    }
    const newAlbum = { id: albums[albums.length - 1].id + 1, band, title, year, genre, cover };
    albums.push(newAlbum);
    res.status(201).json(newAlbum);
});
// Endpoint do aktualizacji albumu
app.put('/albums/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const { title, genre, cover } = req.body;
    const album = albums.find(album => album.id === id);
    if (!album) {
        return res.status(404).json({ message: "Album nie znaleziony." });
    }
    if (title) album.title = title;
    if (genre) album.genre = genre;
    if (cover) album.cover = cover;
    res.json(album);
});
// Endpoint do usuwania albumu
app.delete('/albums/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const index = albums.findIndex(album => album.id === id); if
        (index === -1) {
        return res.status(404).json({ message: "Album nie znaleziony." });
    }
    // Sprawdzenie, czy album ma przypisany obrazek
    if (albums[index].img) {
        const fs = require('fs');
        const imgPath = path.join(uploadsPath, albums[index].img.split('/').pop());
        fs.unlink(imgPath, (err) => {
            if (err) {
                console.error("Błąd podczas usuwania obrazu:", err);
            }
        });
    }
    albums.splice(index, 1);
    res.json({ message: "Album usunięty." });
});
// Uruchomienie serwera 
app.listen(port,
    () => {
        if (!fs.existsSync(uploadsPath)) {
            fs.mkdirSync(uploadsPath, { recursive: true });
        }
        console.log(`Serwer REST API działa na http://localhost:${port}`);
    });
