// signup.js

function regClick(event) {
    alert("OK signup skript")
    console.log("OK signup skript")
    // await sleep(2)
    const login = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const repeatPassword = document.getElementById('confirmPassword').value;

    // Проверяем, что пароли совпадают
    if (password !== repeatPassword) {
        alert('Пароли не совпадают!');
        return;
    }

    // Создаем объект с данными для отправки на сервер
    const data = {
        login: login,
        password: password
    };
    console.log(data);

    // Отправляем POST-запрос на сервер
    fetch('/reg', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('Регистрация успешна!');
                // window.location.href = "/";
            } else {
                alert('Ошибка при регистрации: ' + data.reason);
            }
        })
        .catch(error => {
            console.error('Ошибка при отправке запроса:', error);
            console.error('Содержимое ответа:', error.message);
        });

}


