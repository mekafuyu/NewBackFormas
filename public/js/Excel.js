document.addEventListener('DOMContentLoaded', () => {
  fetchExcelFile(); // verifica se tem algum arquivo inicial
});

function verDetalhes(button) {
const card = button.closest('.card');
const idProcesso = card.getAttribute('card-title');
const excelFilePath = `/files/${idProcesso}.xlsx`;

fetchExcelFile(excelFilePath);
}

function fetchExcelFile(filePath) {
$.ajax({
  url: `${url}/previewExcel/${filePath}`,
  type: "GET",
  xhrFields: {
    responseType: 'arraybuffer'
  },
  success: function (data) {
    const workbook = XLSX.read(data, { type: 'array' }); //lê o conteúdo do excel como um array
    const firstSheetName = workbook.SheetNames[0]; //pega o primeiro nome da planilha
    const worksheet = workbook.Sheets[firstSheetName]; //acessa a primeira planilha q tem esse nome
    const jsonData = XLSX.utils.sheet_to_json(worksheet); // Converte o conteúdo da planilha para um formato JSON. Cada linha da planilha se torna um objeto JSON.
    displayExcelPreview(jsonData);
  },
  error: function(error) {
    console.error('Error ao encontrar o arquivo Excel', error);
}
})
}

function displayExcelPreview(data) { // mostra os dados que achou, em uma tabela
const excelPreview = document.getElementById('excelPreview');
let table = '<table border="1"><thead><tr>';

const headers = Object.keys(data[0]);
headers.forEach(header => {
    table += `<th>${header}</th>`;
});

table += '</tr></thead><tbody>';

data.forEach(row => {
    table += '<tr>';
    headers.forEach(header => {
        table += `<td>${row[header]}</td>`;
    });
    table += '</tr>';
});

table += '</tbody></table>';
excelPreview.innerHTML = table;
};

module.exports = {
fetchExcelFile,

}