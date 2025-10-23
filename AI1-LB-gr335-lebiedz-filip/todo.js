class Todo {
  constructor() {
    this.zadania = JSON.parse(localStorage.getItem('zadania')) || [];
    
    this.dowyszukania = ''; 
    this.edytowany = null; 

    this.lista = document.getElementById('lista');
    this.input = document.getElementById('odczyt');
    this.data = document.getElementById('datazad');
    this.dodaj = document.getElementById('dodaj');
    this.szukaj = document.getElementById('szukaj');

    this.dodaj.addEventListener('click', () => this.dodajzadanie());
    this.szukaj.addEventListener('input', () => this.wyszukaj());
    
    this.input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.dodajzadanie();
    });

    document.addEventListener('click', (e) => {
      if (this.edytowany && !e.target.closest('.zadanie.edytuje')) {
        this.koniecedytowania();
      }
    });

    window.addEventListener('beforeunload', () => {
      this.zapisz();
    });

    this.rysuj();
  }

  zapisz() {
    localStorage.setItem('zadania', JSON.stringify(this.zadania));
  }

  dodajzadanie() {
    const tekst = this.input.value;
    const datazadania = this.data.value;

    if (tekst.length < 3 || tekst.length > 255) {
      alert('Zadanie musi mieć od 3 do 255 znaków.');
      return;
    }

    if (datazadania) {
      const dzisiaj = new Date();
      const wybranaData = new Date(datazadania);
      dzisiaj.setHours(0, 0, 0, 0);
      wybranaData.setHours(0, 0, 0, 0);
      
      if (wybranaData < dzisiaj) {
        alert('Data musi być pusta lub w przyszłości.');
        return;
      }
    }

    this.zadania.push({
      id: Date.now(),
      text: tekst,
      date: datazadania,
      done: false
    });

    this.input.value = '';
    this.data.value = '';
    this.zapisz(); 
    this.rysuj();
  }

  usun(id) {
    this.zadania = this.zadania.filter(z => z.id !== id);
    this.zapisz();
    this.rysuj();
  }

  edytuj(id) {
    this.edytowany = id;
    this.rysuj();
  }

  koniecedytowania() {
    if (!this.edytowany) return;

    const co = document.querySelector(`[data-id="${this.edytowany}"]`);
    if (!co) return;

    const edytownytekst = co.querySelector('.edytujtekst');
    const wprowadzonadata = co.querySelector('.edytujdate');
    
    if (edytownytekst && wprowadzonadata) {
      const nowyTekst = edytownytekst.value;
      const nowaData = wprowadzonadata.value;

      if (nowyTekst.length < 3 || nowyTekst.length > 255) {
        alert('Zadanie musi mieć od 3 do 255 znaków.');
        return;
      }

      if (nowaData) {
        const dzisiaj = new Date();
        const wybranaData = new Date(nowaData);
        dzisiaj.setHours(0, 0, 0, 0);
        wybranaData.setHours(0, 0, 0, 0);
        
        if (wybranaData < dzisiaj) {
          alert('Data musi być pusta lub w przyszłości.');
          return;
        }
      }

      const zadanie = this.zadania.find(z => z.id === this.edytowany);
      if (zadanie) {
        zadanie.text = nowyTekst;
        zadanie.date = nowaData;
        this.zapisz(); 
      }
    }

    this.edytowany = null;
    this.rysuj();
  }

  przełącz(id) {
    const zadanie = this.zadania.find(z => z.id === id);
    if (zadanie) {
      zadanie.done = !zadanie.done;
      this.zapisz(); 
      this.rysuj();
    }
  }

  wyszukaj() {
    this.dowyszukania = this.szukaj.value.toLowerCase();
    this.rysuj();
  }

  get przefiltrowanezadania() {
    if (this.dowyszukania.length < 2) return this.zadania;
    return this.zadania.filter(z => 
      z.text.toLowerCase().includes(this.dowyszukania)
    );
  }

  rysuj() {
    this.lista.innerHTML = '';

    this.przefiltrowanezadania.forEach(zadanie => {
      const div = document.createElement('div');
      div.className = 'zadanie';
      
      if (zadanie.done) div.classList.add('done');
      if (this.edytowany === zadanie.id) div.classList.add('edytuje');
      
      div.dataset.id = zadanie.id;

      if (this.edytowany === zadanie.id) {
        div.innerHTML = `
          <input type="text" class="edytujtekst" value="${zadanie.text}">
          <input type="date" class="edytujdate" value="${zadanie.date || ''}">
          <button class="zapisz">Zapisz</button>
        `;
        
        const saveBtn = div.querySelector('.zapisz');
        saveBtn.addEventListener('click', () => this.koniecedytowania());
        
        const inputTekst = div.querySelector('.edytujtekst');
        inputTekst.addEventListener('keypress', (e) => {
          if (e.key === 'Enter') this.koniecedytowania();
        });
        
      } else {
        let tekst = zadanie.text;
        
        if (this.dowyszukania.length >= 2) {
          const reg = new RegExp(`(${this.dowyszukania})`, 'gi');
          tekst = zadanie.text.replace(reg, '<mark>$1</mark>');
        }

        div.innerHTML = `
          <input type="checkbox" class="checkbox" ${zadanie.done ? 'checked' : ''}>
          <span class="zawartosc">${tekst}</span>
          ${zadanie.date ? `<small class="data-zadania">(${zadanie.date})</small>` : ''}
          <button class="usun">Usuń</button>
        `;

        const checkbox = div.querySelector('.checkbox');
        checkbox.addEventListener('change', () => {
          this.przełącz(zadanie.id);
        });

        const zawartosc = div.querySelector('.zawartosc');
        zawartosc.addEventListener('click', () => {
          this.przełącz(zadanie.id);
        });

        div.addEventListener('dblclick', (e) => {
          if (e.target.classList.contains('usun') || e.target.type === 'checkbox') return;
          this.edytuj(zadanie.id);
        });

        const usunBtn = div.querySelector('.usun');
        usunBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          this.usun(zadanie.id);
        });
      }

      this.lista.appendChild(div);
    });
  }
}

document.addEventListener('DOMContentLoaded', () => new Todo());