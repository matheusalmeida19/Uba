// signup.js
document.addEventListener('DOMContentLoaded', function() {
    // Previne o envio do formulário se os campos não forem preenchidos corretamente
    document.querySelector('form').onsubmit = function(event) {
      const username = document.querySelector('input[name="username"]').value;
      const password = document.querySelector('input[name="password"]').value;
  
      // Verificar se o nome de usuário e a senha estão preenchidos
      if (!username) {
        alert('Por favor, insira um nome de usuário');
        event.preventDefault(); // Impede o envio do formulário
      } else if (!password) {
        alert('Por favor, insira uma senha');
        event.preventDefault(); // Impede o envio do formulário
      }
    };
  });
  