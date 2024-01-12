// handleButtonClick(1) - убил 1палубник
// handleButtonClick(2) - убил 2палубник
// handleButtonClick(3) - убил 3палубник
// handleButtonClick(4) - убил 4палубник
// handleButtonClick(5) - выиграл
// handleButtonClick(6) - проиграл

function handleButtonClick(buttonNumber) {
  alert("Вы нажали на кнопку " + buttonNumber);
  if (buttonNumber === 1) {
    fetch("/ship_kill", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Дополнительные заголовки, если необходимо
      },
      body: JSON.stringify({
        ship_type: "p",
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Успешный ответ от сервера:", data);
        // Обработка успешного ответа от сервера
      })
      .catch((error) => {
        console.error("Ошибка при выполнении запроса:", error);
        // Обработка ошибки
      });
  } else if (buttonNumber === 2) {
    fetch("/ship_kill", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Дополнительные заголовки, если необходимо
      },
      body: JSON.stringify({
        ship_type: "pp",
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Успешный ответ от сервера:", data);
        // Обработка успешного ответа от сервера
      })
      .catch((error) => {
        console.error("Ошибка при выполнении запроса:", error);
        // Обработка ошибки
      });
  } else if (buttonNumber === 3) {
    fetch("/ship_kill", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Дополнительные заголовки, если необходимо
      },
      body: JSON.stringify({
        ship_type: "ppp",
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Успешный ответ от сервера:", data);
        // Обработка успешного ответа от сервера
      })
      .catch((error) => {
        console.error("Ошибка при выполнении запроса:", error);
        // Обработка ошибки
      });
  } else if (buttonNumber === 4) {
    fetch("/ship_kill", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Дополнительные заголовки, если необходимо
      },
      body: JSON.stringify({
        ship_type: "pppp",
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Успешный ответ от сервера:", data);
        // Обработка успешного ответа от сервера
      })
      .catch((error) => {
        console.error("Ошибка при выполнении запроса:", error);
        // Обработка ошибки
      });
  } else if (buttonNumber === 5) {
    fetch("/add_match", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        // Дополнительные заголовки, если необходимо
      },
      body: new URLSearchParams({
        result: "1",
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Успешный ответ от сервера:", data);
        // Обработка успешного ответа от сервера
      })
      .catch((error) => {
        console.error("Ошибка при выполнении запроса:", error);
        // Обработка ошибки
      });
  } else if (buttonNumber === 6) {
    fetch("/add_match", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        // Дополнительные заголовки, если необходимо
      },
      body: new URLSearchParams({
        result: "0",
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Успешный ответ от сервера:", data);
      })
      .catch((error) => {
        console.error("Ошибка при выполнении запроса:", error);
        // Обработка ошибки
      });
  }
}
