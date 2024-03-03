$(document).ready(function() {
    $('#openReg').on('click', function(e) {
        e.preventDefault();
        $('#login').hide();
        $('#Register').show();
    });

    $('#goBack').on('click', function(e) {
        e.preventDefault();
        $('#Register').hide();
        $('#login').show();
    });
});

$(document).ready(function() {

    let regexEmail = /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/;
    let regexPassword = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/;
    let user = localStorage.getItem('usuario_gatos');
    if (user) {
        $('#loginHeader').text('Cerrar sesión');
    }

    $('#Register').on('submit', function(e) {
        e.preventDefault();

        let username = $('#regUsername').val();
        let password = $('#regPassword').val();
        let email = $('#email').val();
        let nombre = $('#nombre').val();
        let apellidos = $('#apellidos').val();
        let telefono = $('#telefono').val();
        let DNI = $('#DNI').val();
        let edad = $('#edad').val();

        if (!regexEmail.test(email) || !regexPassword.test(password) || !nombre || !apellidos || !telefono || !DNI || !edad) {
            alert('Por favor, rellene correctamente todos los campos.');
            return;
        }
        let user = {username, password, email, nombre, apellidos, telefono, DNI, edad};
        let users = JSON.parse(localStorage.getItem('UsuariosGatos'));
        if (!Array.isArray(users)) {
            users = [];
        }
        users.push(user);

        localStorage.setItem('UsuariosGatos', JSON.stringify(users));
        alert('Usuario registrado con éxito.');
    });

    $('#login').on('submit', function(e) {
        e.preventDefault();

        let username = $('#username').val();
        let password = $('#password').val();
        let users = JSON.parse(localStorage.getItem('UsuariosGatos')) || [];
        let user = users.find(user => user.username === username && user.password === password);
        if (user) {
            localStorage.setItem('usuario_gatos', username);
            window.location.href = 'index.html';
            alert('Inicio de sesión exitoso.');
        } else {
            alert('Nombre de usuario o contraseña incorrectos.');
        }
    });

    $('#loginHeader').on('click', function(e) {
        if ($(this).text() === 'Cerrar sesión') {
            e.preventDefault();
            // Borrar la sesión del usuario
            localStorage.removeItem('usuario_gatos');
            // Cambiar el texto del enlace a "Iniciar sesión"
            $(this).text('Iniciar sesión');
        }
    });
});