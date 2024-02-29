const API_KEY = 'live_zwSjl5d422mzAzT4qrKzd3RWjP3WzRhvxy1FGi2kdgojOG98sdydTgip6KQaoJXs';
let vista = false;
let currentPage = 1;
let ordenCampo = 'nombre';
let ordenAscendente = true;

async function fetchData(url) {
    try {
        let response = await $.ajax({ url, method: 'GET' });
        return response;
    } catch (error) {
        console.error(error);
    }
}

async function getFacts() {
    let urlFacts = "https://catfact.ninja/facts?limit=20";
    return await fetchData(urlFacts);
}

async function getBreeds() {
    let urlBreeds = `https://api.thecatapi.com/v1/breeds?limit=20&page=${currentPage}&api_key=${API_KEY}`;
    let data = await fetchData(urlBreeds);
    return data.map((item) => item.id);
}

async function getImagenes(ids) {
    let facts = await getFacts();
    let datos = [];

    // Crear un array de promesas
    let promises = ids.map(id => {
        let urlImagenes = `https://api.thecatapi.com/v1/images/search?limit=1&page=${currentPage}&breed_ids=${id}&api_key=${API_KEY}`;
        return fetchData(urlImagenes);
    });

    // Ejecutar todas las promesas en paralelo
    let results = await Promise.all(promises);

    for (let i = 0; i < results.length; i++) {
        let data = results[i];
        if (data && data[0] && data[0].breeds && data[0].breeds[0]) {
            let imageUrl = data[0].url;
            let breedName = data[0].breeds[0].name;
            let fact = facts && facts.data && facts.data[i] ? facts.data[i].fact : '';
            datos.push({ breedName, imageUrl, fact });
        }
    }

    return datos;
}

function toggleVista(breedName, imageUrl, fact) {
    let html;
    if (vista) {
        html = generateTable(breedName, imageUrl, fact);
    } else {
        html = generateList(breedName, imageUrl, fact);
    }
    $('.contenedor').append(html);
}

function generateList(breedName, imageUrl, fact) {
    return `
        <ul class="item">
            <li>
                <h2>${breedName}</h2>
                <img src="${imageUrl}" alt="${breedName}">
                <p>${fact}</p>
            </li>
        </ul>
    `;
}

function generateTable(breedName, imageUrl, fact) {
    return `
        <tr>
            <td>${breedName}</td>
            <td><img src="${imageUrl}" alt="${breedName}"></td>
            <td>${fact}</td>
        </tr>
    `;
}

function ordenarDatos(datos) {
    datos.sort((a, b) => {
        let campoA = a[ordenCampo];
        let campoB = b[ordenCampo];
        if (campoA < campoB) {
            return ordenAscendente ? -1 : 1;
        }
        if (campoA > campoB) {
            return ordenAscendente ? 1 : -1;
        }
        return 0;
    });

    for (let dato of datos) {
        toggleVista(dato.breedName, dato.imageUrl, dato.fact);
    }
}

$('#lista, #Tabla').click(async function() {
    $('.contenedor').empty();
    vista = this.id === 'Tabla';
    let breedIds = await getBreeds();
    getImagenes(breedIds);
});

$(window).scroll(async function() {
    if ($(window).scrollTop() + $(window).height() == $(document).height()) {
        currentPage++;
        let breedIds = await getBreeds();
        getImagenes(breedIds);
    }
});

$('#ordenarNombre, #ordenarFact').click(async function() {
    ordenCampo = this.id.substring(7).toLowerCase();
    $('.contenedor').empty();
    let breedIds = await getBreeds();
    let datos = await getImagenes(breedIds);
    ordenarDatos(datos);
});

$('#ascendente, #descendente').click(async function() {
    ordenAscendente = this.id === 'ascendente';
    $('.contenedor').empty();
    let breedIds = await getBreeds();
    let datos = await getImagenes(breedIds);
    ordenarDatos(datos);
});

getBreeds().then(getImagenes).then(ordenarDatos);