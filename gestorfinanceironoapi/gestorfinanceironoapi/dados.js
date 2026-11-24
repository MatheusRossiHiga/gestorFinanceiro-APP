export function dinheiro(valor) {
  return 'R$ ' + valor.toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

export function paraNumero(texto) {
  return Number(String(texto).replace(',', '.'));
}

export function agora() {
  const data = new Date();
  const ano = data.getFullYear();
  const mes = String(data.getMonth() + 1).padStart(2, '0');
  const dia = String(data.getDate()).padStart(2, '0');
  const hora = String(data.getHours()).padStart(2, '0');
  const minuto = String(data.getMinutes()).padStart(2, '0');
  const segundo = String(data.getSeconds()).padStart(2, '0');
  return ano + '-' + mes + '-' + dia + ' ' + hora + ':' + minuto + ':' + segundo;
}

export function mesAtual() {
  return agora().slice(0, 7);
}

export function dataBR(data) {
  return data.slice(0, 10).split('-').reverse().join('/');
}

export function dataParaBanco(texto) {
  const partes = texto.split('/');
  if (partes.length !== 3 || partes[2].length !== 4) {
    return null;
  }
  return partes[2] + '-' + partes[1].padStart(2, '0') + '-' + partes[0].padStart(2, '0');
}

export function saudacao() {
  const hora = new Date().getHours();
  if (hora < 12) return 'Bom dia';
  if (hora < 18) return 'Boa tarde';
  return 'Boa noite';
}

export function dataExtenso() {
  const dias = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
  const meses = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
  const data = new Date();
  return dias[data.getDay()] + ', ' + data.getDate() + ' de ' + meses[data.getMonth()] + ' de ' + data.getFullYear();
}
