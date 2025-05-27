import React, { useState, useEffect, useRef } from 'react';
import './App.css';



export default function AlbumList() {
  const [albums, setAlbums] = useState([]);
  const [band, setBand] = useState("");
  const [newAlbum, setNewAlbum] = useState({ band: "", title: "", year: "", genre: "", img: undefined });
  const AlbumImgUpload = ({ albumId }) => {
    const fileInputRef = useRef(null);

    const uploadAlbumImg = async (albumId, file) => {
      const formData = new FormData();
      formData.append('img', file);
      const response = await fetch(`http://localhost:3000/albums/${albumId}/img`, {
        method: 'PUT',
        body: formData,
      })
        .then(async response => {
          const data = await response.json();
          if (!response.ok) {
            console.error('Błąd podczas przesyłania okładki:', data.message);
            throw new Error('Błąd serwera');
          }
          else {
            console.log('Okładka przesłana pomyślnie:', data);
            // Aktualizacja lokalnego stanu albumów
            const updatedAlbums = albums.map(album => album.id === albumId ? { ...album, img: data.img }
              : album);
            updateLocalStorage(updatedAlbums);
            return data;

          }
        })
        .catch(error => {
          console.error('Błąd podczas przesyłania okładki:', error);
        });
    };
    const handleUpload = async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      try {
        await uploadAlbumImg(albumId, file);
      } catch (error) {
        console.error('Błąd podczas przesyłania okładki:', error);
      }
    };

    return (
      <div>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleUpload}
          accept="image/*"
          style={{ display: 'none' }}
        />
        <button
          onClick={() => fileInputRef.current.click()}
          className="upload-button"
        >
          Dodaj okładkę
        </button>
      </div>
    );
  };

  const updateLocalStorage = (updatedAlbums) => {
    setAlbums(updatedAlbums);
    localStorage.setItem("albums", JSON.stringify(updatedAlbums));
  };
  const fetchBandAlbums = () => {
    fetch(`http://localhost:3000/albums/${band}`)
      .then(async (response) => {
        const data = await response.json();

        if (!response.ok) {
          // Obsługa błędu (np. 404)
          console.warn("Błąd z serwera:", data.message);
          setAlbums([]);
          return;
        }

        if (Array.isArray(data)) {
          updateLocalStorage(data);
        } else {
          console.warn("Nieprawidłowy format danych:", data);
          setAlbums([]);
        }
      })
      .catch(error => {
        console.error("Błąd sieci:", error);
        alert("Nie udało się pobrać danych.");
      });
  };



  const addAlbum = () => {
    fetch("http://localhost:3000/albums", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newAlbum)
    })
      .then(async response => {
        const data = await response.json();
        if (!response.ok) {
          // Obsługa błędu (np. 400)
          console.warn("Błąd z serwera:", data.message);
          return;
        }
        else {
          setNewAlbum({ band: "", title: "", year: "", genre: "" });
          updateLocalStorage([...albums, data]);
        }
      })
      .catch(error => console.error("Błąd dodawania albumu:", error));
  };
  const updateAlbum = (id) => {
    fetch(`http://localhost:3000/albums/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newAlbum)
    })
      .then(response => response.json())
      .then(() => {
        const updatedAlbums = albums.map(album => album.id === id ? {
          id: id,
          band: newAlbum.band || album.band,
          title: newAlbum.title || album.title,
          year: newAlbum.year || album.year,
          genre: newAlbum.genre || album.genre,
          img: album.img
        }
          : album);
        updateLocalStorage(updatedAlbums);
      })
      .catch(error => console.error("Błąd aktualizacji albumu:", error));
  };

  const deleteAlbum = (id) => {
    fetch(`http://localhost:3000/albums/${id}`, {
      method: "DELETE"
    })
      .then(() => {
        const updatedAlbums = albums.filter(album => album.id !== id);
        updateLocalStorage(updatedAlbums);
      })
      .catch(error => console.error("Błąd usuwania albumu:", error));
  };

  useEffect(() => {
    const storedAlbums = localStorage.getItem("albums");
    if (storedAlbums) {
      setAlbums(JSON.parse(storedAlbums));
    } else {
      fetch("http://localhost:3000/albums")
        .then(response => response.json())
        .then(data => {
          setAlbums(data);
          localStorage.setItem("albums", JSON.stringify(data));
        })
        .catch(error => console.error("Błąd pobierania danych:", error));
    }
  }, []);


  return (
    <div className="container">
      <h1 className="heading">Lista Albumów</h1>

      <div className="search-bar">
        <input
          type="text"
          placeholder="Wpisz nazwę zespołu"
          value={band}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              fetchBandAlbums();
            }
          }
          }
          onChange={(e) => setBand(e.target.value)}
          className="input"
        />
        <button onClick={fetchBandAlbums} className="button blue">
          Szukaj
        </button>
      </div>

      <div className="form">
        <input
          type="text"
          placeholder="Zespół"
          value={newAlbum.band}
          onChange={(e) =>
            setNewAlbum({ ...newAlbum, band: e.target.value })}
          className="input"
        />
        <input
          type="text"
          placeholder="Tytuł"
          value={newAlbum.title}
          onChange={(e) =>
            setNewAlbum({ ...newAlbum, title: e.target.value })}
          className="input"
        />
        <input
          type="number"
          placeholder="Rok"
          value={newAlbum.year}
          onChange={(e) =>
            setNewAlbum({ ...newAlbum, year: e.target.value })}
          className="input"
        />
        <input
          type="text"
          placeholder="Gatunek"
          value={newAlbum.genre}
          onChange={(e) =>
            setNewAlbum({ ...newAlbum, genre: e.target.value })}
          className="input"
        />

      </div>
      <div className="search-buttons">
        <button onClick={addAlbum} disabled={
          !newAlbum.band || !newAlbum.title || !newAlbum.year || !newAlbum.genre
        } className="button green">Dodaj Album</button>
        <button onClick={() => setNewAlbum({ band: "", title: "", year: "", genre: "" })} className="button gray">Wyczyść</button>
      </div>


      <ul className="album-list">
        {albums.map(album => (
          <li key={album.id} className="album-item">
            <div className="album-img-container">
              <img src={album.img || "https://placehold.co/100"} alt={`${album.band} - ${album.title}`} className="album-img" />
            </div>
            <span>
              <strong>{album.band}</strong> - {album.title} ({album.year}) - {album.genre}
            </span>
            <div className="action-buttons">
              <button onClick={() => updateAlbum(album.id)} disabled={
                newAlbum.band == "" && newAlbum.title == "" && newAlbum.year == "" && newAlbum.genre == ""
              } className="button yellow">Edytuj</button>
              <button onClick={() => deleteAlbum(album.id)} className="button red">Usuń</button>
              <AlbumImgUpload albumId={album.id} />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );

}