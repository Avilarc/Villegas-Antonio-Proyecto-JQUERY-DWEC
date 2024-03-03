const API_KEY = 'live_zwSjl5d422mzAzT4qrKzd3RWjP3WzRhvxy1FGi2kdgojOG98sdydTgip6KQaoJXs';
let vista = false;
let currentPage = 0;
let ordenCampo = 'nombre';
let ordenAscendente = true;
let datos = [];
let gatosCargados = [];
let isLoading = false;

async function fetchData(url) {
    try {
        let response = await $.ajax({ url, method: 'GET' });
        return response;
    } catch (error) {
        console.error(error);
    }
}

function getFacts() {
    let urlFacts = "https://catfact.ninja/facts?limit=20";
    return $.ajax({
        url: urlFacts,
        method: 'GET'
    });
}

function getBreeds() {
    let urlBreeds = `https://api.thecatapi.com/v1/breeds?limit=20&page=${currentPage}&api_key=${API_KEY}`;
    return $.ajax({
        url: urlBreeds,
        method: 'GET'
    }).done(function(data) {
        let ids = data.map((item) => item.id);
        ids = ids.filter(id => !gatosCargados.includes(id));
        gatosCargados = [...gatosCargados, ...ids];

        return ids;
    });
}



function getImagenes(ids) {
    return getFacts().then(function(facts) {

        let promises = ids.map(id => {
            let urlImagenes = `https://api.thecatapi.com/v1/images/search?limit=1&page=${currentPage}&breed_ids=${id.id}&api_key=${API_KEY}`;
            return $.ajax({
                url: urlImagenes,
                method: 'GET'
            });
        });

        //$.when.apply hace que se resuelvan todas las promesas antes de continuar

        return $.when.apply($, promises).then(function() {
            let results = Array.prototype.slice.call(arguments);
            for (let i = 0; i < results.length; i++) {
                let data = results[i][0];
                if (data && data[0] && data[0].breeds && data[0].breeds[0]) {
                    let imageUrl = data[0].url;
                    let breedName = data[0].breeds[0].name;
                    let fact = facts && facts.data && facts.data[i] ? facts.data[i].fact : '';
                    datos.push({ breedName, imageUrl, fact });
                }
            }
            return datos;
        });
    });
}

function addScrollEvent() {
    $(window).scroll(function() {
        if ($(window).scrollTop() + $(window).height() == $(document).height()) {
            getBreeds().then(getImagenes).then(ordenarDatos);
        }
    });
}

function getBreedDetails(breedName) {
    let urlDetails = `https://api.thecatapi.com/v1/breeds?&api_key=${API_KEY}`;
    return new Promise((resolve, reject) => {
        $.ajax({
            url: urlDetails,
            method: 'GET',
            success: (datos) => {
                datos.forEach((data) => {
                    if (breedName === data.name) {
                        let breadDetail = data;
                        console.log(breadDetail.id);
                        resolve(breadDetail.id);
                    }
                });
            },
            error: (error) => {
                reject(error);
            }
        });
    });
}

function getImagenesDetails(id) {
    let urlImagenes = `https://api.thecatapi.com/v1/images/search?limit=3&breed_ids=${id}&api_key=${API_KEY}`;
    let imagenesGatos = [];
    let datosGato = [];

    // Devuelve una nueva promesa
    return new Promise((resolve, reject) => {
        $.ajax({
            url: urlImagenes,
            method: 'GET',
            success: (datos) => {
                let datosCompletos = [];
                datos.forEach((data) => {
                    let imageUrl = data.url;
                    imagenesGatos.push(imageUrl);
                });
                datosGato.push(datos[0].breeds[0]);
                datosCompletos.push(imagenesGatos, datosGato);
                // Resuelve la promesa con los datos completos
                resolve(datosCompletos);
            },
            error: (error) => {
                // Rechaza la promesa si hay un error
                reject(error);
            }
        });
    });
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
    let ul = $('<ul>').addClass('item');
    let li = $('<li>');
    let h2 = $('<h2>').text(breedName);
    let img = $('<img>').attr('src', imageUrl).attr('alt', breedName);
    let p = $('<p>').text(fact);
    let likeCount = localStorage.getItem(breedName + 'like') || 0;
    let dislikeCount = localStorage.getItem(breedName + 'dislike') || 0;
    let favCount = localStorage.getItem(breedName + 'favorite') || 0;
    let likeButton = $('<button>').addClass('like').data('breed', breedName).html(`<i class="fas fa-thumbs-up"></i> <span>${likeCount}</span>`);
    let dislikeButton = $('<button>').addClass('dislike').data('breed', breedName).html(`<i class="fas fa-thumbs-down"></i> <span>${dislikeCount}</span>`);
    let favButton = $('<button>').addClass('favorite').data('breed', breedName).html(`<i class="fas fa-star"></i> <span>${favCount}</span>`);

    li.append(h2, img, p, likeButton, dislikeButton, favButton);
    ul.append(li);

    return ul;
}

function generateTable(breedName, imageUrl, fact) {
    let table = $('<table>');
    let tr = $('<tr>');
    let td1 = $('<td>').text(breedName);
    let td2 = $('<td>');
    let img = $('<img>').attr('src', imageUrl).attr('alt', breedName);
    let td3 = $('<td>').text(fact);
    let td4 = $('<td>');
    let likeCount = localStorage.getItem(breedName + 'like') || 0;
    let dislikeCount = localStorage.getItem(breedName + 'dislike') || 0;
    let favCount = localStorage.getItem(breedName + 'favorite') || 0;
    let likeButton = $('<button>').addClass('like').data('breed', breedName).html(`<i class="fas fa-thumbs-up"></i> <span>${likeCount}</span>`);
    let dislikeButton = $('<button>').addClass('dislike').data('breed', breedName).html(`<i class="fas fa-thumbs-down"></i> <span>${dislikeCount}</span>`);
    let favButton = $('<button>').addClass('favorite').data('breed', breedName).html(`<i class="fas fa-star"></i> <span>${favCount}</span>`);

    td2.append(img);
    td4.append(likeButton, dislikeButton, favButton);
    tr.append(td1, td2, td3, td4);
    table.append(tr);

    return table;
}

function showBreedDetails(data) {
    let urlImagenes = data[0];
    let datosGato = data[1];
    console.log(datosGato[0]);
    let div = $('<div>').addClass('breed-details');
    let h1Titulo = $('<h1>').addClass('breed-title').text(datosGato[0].name);
    let imagesDiv = $('<div>').addClass('breed-images');
    let imagen1 = $('<img>').addClass('breed-image').attr('src', urlImagenes[0]);
    let imagen2 = $('<img>').addClass('breed-image').attr('src', urlImagenes[1]);
    let imagen3 = $('<img>').addClass('breed-image').attr('src', urlImagenes[2]);
    imagesDiv.append(imagen1, imagen2, imagen3);
    let edad = $('<p>').addClass('breed-info').text('Edad Media: ' + datosGato[0].life_span);
    let descripcion = $('<p>').addClass('breed-info').text(datosGato[0].description);
    let origen = $('<p>').addClass('breed-info').text('Origen: ' + datosGato[0].origin);
    let peso = $('<p>').addClass('breed-info').text('Peso: ' + datosGato[0].weight.metric);
    let temperamento = $('<p>').addClass('breed-info').text('Temperamento: ' + datosGato[0].temperament);
    let wikipedia = $('<a>').addClass('breed-link').attr('href', datosGato[0].wikipedia_url).text('Wikipedia');
    let enlace = $('<p>').addClass('breed-info').append(wikipedia);
    div.append(h1Titulo, imagesDiv, edad, descripcion, origen, peso, temperamento, enlace);
    $('.contenedor').append(div);
}

function ordenarDatos(datos) {
    datos.sort((a, b) => {
        let campoA = a['breedName'];
        let campoB = b['breedName'];
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


$(document).ready(function() {
    // Verificar si hay un usuario logueado
    let user = localStorage.getItem('usuario_gatos');
    if (user) {
        // Cambiar el texto del enlace de inicio de sesión a "Cerrar sesión"
        $('#loginHeader').text('Cerrar sesión');
    }




    $('#lista').on('click', () => {
        vista = false;
        $('.contenedor').empty();
        ordenarDatos(datos);
        // Add the scroll event back when returning to list view
        addScrollEvent();
    });
    $('#tabla').on('click', function() {
        vista = true;
        $('.contenedor').empty();
        ordenarDatos(datos);
        // Add the scroll event back when returning to table view
        addScrollEvent();
    });

    $('#ascendente').on('click', function() {
        ordenAscendente = true;
        $('.contenedor').empty();
        ordenarDatos(datos);
    });

    $('#descendente').on('click', function() {
        ordenAscendente = false;
        $('.contenedor').empty();
        ordenarDatos(datos);
    });

    $(window).scroll(function() {
        if (!isLoading && $(window).scrollTop() + $(window).height() == $(document).height()) {
            isLoading = true;
            currentPage++;
            getBreeds().then(function(ids) {
                if (ids.length === 0) {
                    $(window).off('scroll');
                } else {
                    getImagenes(ids).then(function() {
                        $('.contenedor').empty(); // Vaciar el contenido HTML del contenedor
                        ordenarDatos(datos);
                        isLoading = false;
                    });
                }
            });
        }
    });

    $(document).on('click', '.item, tr', function() {
        let breedName = $(this).find('h2, td:first-child').text();
        $('.contenedor').empty();
        // Remove the scroll event when showing breed details
        $(window).off('scroll');
        getBreedDetails(breedName).then(getImagenesDetails).then(showBreedDetails);
    });


    // Evento de clic en "Cerrar sesión"
    $('#loginHeader').on('click', function(e) {
        if ($(this).text() === 'Cerrar sesión') {
            e.preventDefault();
            localStorage.removeItem('usuario_gatos');
            $(this).text('Iniciar sesión');
        }
    });

    $(document).on('click', '.like, .dislike, .favorite', function(event) {
        event.stopPropagation();
        let breedName = $(this).data('breed');
        let buttonType = $(this).attr('class');
        let count = localStorage.getItem(breedName + buttonType) || 0;
        count++;
        localStorage.setItem(breedName + buttonType, count);
        let buttonText = '';
        switch(buttonType) {
            case 'like':
                buttonText = `<i class="fas fa-thumbs-up"></i> <span>${count}</span>`;
                break;
            case 'dislike':
                buttonText = `<i class="fas fa-thumbs-down"></i> <span>${count}</span>`;
                break;
            case 'favorite':
                buttonText = `<i class="fas fa-star"></i> <span>${count}</span>`;
                break;
        }
        $(this).html(buttonText);
    });

    $('.like, .dislike, .favorite').each(function() {
        let breedName = $(this).data('breed');
        let buttonType = $(this).attr('class');
        let count = localStorage.getItem(breedName + buttonType) || 0;
        let buttonText = '';
        switch(buttonType) {
            case 'like':
                buttonText = `Me gusta <span>(${count})</span>`;
                break;
            case 'dislike':
                buttonText = `No me gusta <span>(${count})</span>`;
                break;
            case 'favorite':
                buttonText = `Favorito <span>(${count})</span>`;
                break;
        }
        $(this).html(buttonText);
    });

    getBreeds().then(getImagenes).then(ordenarDatos);
    addScrollEvent();
});


