import React, { useState, useEffect } from 'react';
import './App.css';

export default function AlbumList() {
  const [albums, setAlbums] = useState([]);
  const [band, setBand] = useState("");
  const [newAlbum, setNewAlbum] = useState({ band: "", title: "", year: "" });


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
          alert(data.message || "Wystąpił błąd.");
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
      .then(response => response.json())
      .then(data => updateLocalStorage([...albums, data]))
      .catch(error => console.error("Błąd dodawania albumu:", error));
  };
  const updateAlbum = (id, newTitle) => {
    fetch(`http://localhost:3000/albums/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: newTitle })
    })
      .then(response => response.json())
      .then(() => {
        const updatedAlbums = albums.map(album => album.id === id ? { ...album, title: newTitle }
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
          type="text"
          placeholder="Rok"
          value={newAlbum.year}
          onChange={(e) =>
            setNewAlbum({ ...newAlbum, year: e.target.value })}
          className="input"
        />
        <button onClick={addAlbum} className="button green">Dodaj Album</button>
      </div>

      <ul className="album-list">
        {albums.map(album => (
          <li key={album.id} className="album-item">
            <span>
              <strong>{album.band}</strong> - {album.title} ({album.year})
            </span>
            <div className="action-buttons">
              <button onClick={() => updateAlbum(album.id)} className="button yellow">Edytuj</button>
              <button onClick={() => deleteAlbum(album.id)} className="button red">Usuń</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );

}