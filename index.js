const api = 'http://localhost:3000';
var consumersSelect = document.getElementById('consumers-select');
var advertisersSelect = document.getElementById('advertisers-select');
var consumerSelected = '0';
var advertiserSelected = '0';

const fillConsumers = (consumers) => {
  consumersSelect = document.getElementById('consumers-select');
  consumers.map((consumer) => {
    consumersSelect.innerHTML += `<option value="${consumer.id}">${consumer.name} ${consumer.surname}</option>`;
  });
}

const fillAdvertisers = (advertisers) => {
  advertisersSelect = document.getElementById('advertisers-select');
  advertisers.map((advertiser) => {
    advertisersSelect.innerHTML += `<option value="${advertiser.id}">${advertiser.name} ${advertiser.surname}</option>`;
  });
}

const fillAds = (ads) => {
  var adsContainer = document.getElementById('ads-container');
  ads.map((ad) => {
    adsContainer.innerHTML += `
      <div class="ad">
        <h4><b>${ad.title}</b></h4>
        <p id="${ad.id}" hidden>${ad.description}</p>
        <button onclick="watchAd('${ad.id}')">Ver</button>
        <button onclick="hideAd('${ad.id}')">Ocultar</button>
      </div>
    `;
  })
}

const getConsumers = async () => {
  const consumers = await axios.get(`${api}/consumers`);
  consumers.data && fillConsumers(consumers.data);
}

const getAdvertisers = async () => {
  const advertisers = await axios.get(`${api}/advertisers`);
  advertisers.data && fillAdvertisers(advertisers.data);
}

const getHistory = async () => {
  const history = await axios.get(`${api}/history`);
  let historyContainer = document.getElementById('search-history-container');
  if (history.data.length) {
    historyContainer.innerHTML = '';
    history.data.map((history) => {
      historyContainer.innerHTML += `
        <div class="ad">
          <h4><b>${history.search_term}</b></h4>
        </div>
      `;
    })
  }
}

const getAds = async () => {
  const ads = await axios.get(`${api}/ads`);
  ads.data && fillAds(ads.data.sort(() => Math.random() - 0.5));
}

const getAdvertiserAds = async (id) => {
  const advertiser = await axios.get(`${api}/advertisers/${id}`);
  if (advertiser.data.length) { 
    document.getElementById('aah-name').innerHTML = `(${advertiser.data[0].name})`;
    const ads = await axios.get(`${api}/advertisers/${id}/ads`);
    if (ads.data.length) {
      document.getElementById('ads-advicer-container').innerHTML = '';
      ads.data.map(async (ad) => {
        const views = await axios.get(`${api}/ads/${ad.id}/views`);
        document.getElementById('ads-advicer-container').innerHTML += `
          <div class="ad">
            <h4><b>${ad.title} (${views.data[0].views} vista${views.data[0].views === 1 ? '': 's'})</b></h4>
            <p id="${ad.id}">${ad.description}</p>
          </div>
        `;
      });
    } else {
      document.getElementById('ads-advicer-container').innerHTML = '<p>No hay anuncios</p>';
    }
  }
}

consumersSelect.addEventListener('change', (event) => {
  consumerSelected = +event.target.value;
});

advertisersSelect.addEventListener('change', (event) => {
  advertiserSelected = +event.target.value;
  if (advertiserSelected === 0 || advertiserSelected === '0') return alert('Selecciona un anunciante');
  getAdvertiserAds(advertiserSelected);
});

const watchAd = async (id) => {
  if (consumerSelected === '0' || consumerSelected === 0) return alert('Selecciona un consumidor');
  document.getElementById(id).removeAttribute('hidden');
  await axios.post(`${api}/ads/${id}/consumers/${consumerSelected}`);
}

const hideAd = (id) => {
  document.getElementById(id).setAttribute('hidden', true);
}

const displayRequired = (id) => {
  switch (id) {
    case 'display-ads':
      document.getElementById(id).setAttribute('class', 'selected-btn');
      document.getElementById('display-ads-by-advertiser').removeAttribute('class');
      document.getElementById('display-search').removeAttribute('class');
      document.getElementById('ads-container').removeAttribute('hidden');
      document.getElementById('ads-advicer').setAttribute('hidden', true);
      document.getElementById('search-history').setAttribute('hidden', true);
      break;
    case 'display-ads-by-advertiser':
      document.getElementById(id).setAttribute('class', 'selected-btn');
      document.getElementById('display-ads').removeAttribute('class');
      document.getElementById('display-search').removeAttribute('class');
      document.getElementById('ads-container').setAttribute('hidden', true);
      document.getElementById('ads-advicer').removeAttribute('hidden');
      document.getElementById('search-history').setAttribute('hidden', true);
      break;
    default:
      document.getElementById(id).setAttribute('class', 'selected-btn');
      document.getElementById('display-ads').removeAttribute('class');
      document.getElementById('display-ads-by-advertiser').removeAttribute('class');
      document.getElementById('ads-container').setAttribute('hidden', true);
      document.getElementById('ads-advicer').setAttribute('hidden', true);
      document.getElementById('search-history').removeAttribute('hidden');
      getHistory();
      break;
  }
}

const search = async () => {
  if (consumerSelected === '0' || consumerSelected === 0) return alert('Selecciona un consumidor')
  let toSearch = document.getElementById('to-search').value;
  if (toSearch.trim() === '') return alert('Escribe algo para buscar');
  await axios.post(`${api}/history`, {
    consumer_id: +consumerSelected,
    search_term: toSearch
  });
  toSearch.value = '';
  await getHistory();
}

window.onload = async () => {
  Promise.all([getConsumers(), getAdvertisers(), getAds(), getHistory()]);
}