  const els = {
      city: document.getElementById('cityInput'),
      search: document.getElementById('searchBtn'),
      icon: document.getElementById('icon'),
      tempVal: document.getElementById('tempVal'),
      place: document.getElementById('place'),
      humidityVal: document.getElementById('humidityVal'),
      windVal: document.getElementById('windVal'),
      card: document.getElementById('card')
    };

    function iconFor(code){
      if ([0,1].includes(code)) return 'https://cdn.jsdelivr.net/gh/twitter/twemoji/assets/72x72/2600.png';
      if ([2,3].includes(code)) return 'https://cdn.jsdelivr.net/gh/twitter/twemoji/assets/72x72/26c5.png';
      if ([45,48].includes(code)) return 'https://cdn.jsdelivr.net/gh/twitter/twemoji/assets/72x72/1f32b.png';
      if ([51,53,55,61,63,65,80,81,82].includes(code)) return 'https://cdn.jsdelivr.net/gh/twitter/twemoji/assets/72x72/1f327.png';
      if ([71,73,75,85,86,77].includes(code)) return 'https://cdn.jsdelivr.net/gh/twitter/twemoji/assets/72x72/1f328.png';
      if ([95,96,99].includes(code)) return 'https://cdn.jsdelivr.net/gh/twitter/twemoji/assets/72x72/26c8.png';
      return 'https://cdn.jsdelivr.net/gh/twitter/twemoji/assets/72x72/2601.png';
    }

    function setGradientFor(code){
      let left = '#5673c7', right = '#24344a';
      if ([0,1].includes(code)){ left='#7ebcff'; right='#2b6fb3' }
      if ([2,3].includes(code)){ left='#7d9fd6'; right='#27384f' }
      if ([45,48].includes(code)){ left='#6b7380'; right='#1f2b36' }
      if ([61,63,65,80,81,82].includes(code)){ left='#2e4a61'; right='#1b2b3a' }
      if ([71,73,75].includes(code)){ left='#6b7e8f'; right='#3b4c5a' }
      document.documentElement.style.setProperty('--bg1', left);
      document.documentElement.style.setProperty('--bg2', right);
      els.card.style.background = `linear-gradient(90deg, ${left}, ${right})`;
    }

    async function geocode(name){
      const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(name)}&count=1&language=en`;
      const res = await fetch(url);
      if(!res.ok) throw new Error('Location lookup failed');
      const j = await res.json();
      if(!j.results || j.results.length === 0) throw new Error('City not found');
      const r = j.results[0];
      return {lat: r.latitude, lon: r.longitude, name: `${r.name}${r.country ? ', ' + r.country : ''}`};
    }

    async function fetchWeather(lat, lon){
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&hourly=relativehumidity_2m&timezone=auto`;
      const res = await fetch(url);
      if(!res.ok) throw new Error('Weather fetch failed');
      return await res.json();
    }

    function updateUI(placeLabel, weather){
      const cur = weather.current_weather;
      const temp = Math.round(cur.temperature);
      const wind = (cur.windspeed ?? 0);
      const code = cur.weathercode;
      let hum = '--';
      try{
        if(weather.hourly && weather.hourly.relativehumidity_2m){
          const idx = weather.hourly.time.indexOf(cur.time);
          hum = Math.round(weather.hourly.relativehumidity_2m[idx] ?? weather.hourly.relativehumidity_2m[0]);
        }
      }catch(e){ hum = '--' }

      els.tempVal.textContent = temp;
      els.place.textContent = placeLabel;
      els.humidityVal.textContent = `${hum}%`;
      els.windVal.textContent = `${wind} km/h`;
      els.icon.src = iconFor(code);
      setGradientFor(code);
    }

    async function handleSearch(){
      const q = (els.city.value || '').trim();
      if(!q) return alert('Please enter a city name.');
      try{
        els.place.textContent = 'Loading...';
        const geo = await geocode(q);
        const w = await fetchWeather(geo.lat, geo.lon);
        updateUI(geo.name, w);
      }catch(err){
        alert(err.message || 'Error');
        els.place.textContent = '—';
      }
    }

    els.search.addEventListener('click', handleSearch);
    els.city.addEventListener('keydown', (e)=>{ if(e.key === 'Enter') handleSearch(); });

    // Page open → blank
    window.addEventListener('load', ()=>{ 
      els.city.value = ''; 
      els.place.textContent = '—'; 
      els.tempVal.textContent = '--'; 
      els.humidityVal.textContent = '--%'; 
      els.windVal.textContent = '-- km/h'; 
      els.icon.src = ''; 
    });