document.addEventListener('DOMContentLoaded', () => {
    fetchExcelFile(); // verifica se tem algum arquivo inicial
});

function verDetalhes(IdProcesso) {
    const excelFilePath = `./${IdProcesso}`; 

    fetchExcelFile(excelFilePath);
}

function fetchExcelFile(filePath) {
    fetch(filePath)
        .then(response => response.arrayBuffer())
        .then(data => {
            const workbook = XLSX.read(data, { type: 'array' });
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet);
            displayExcelPreview(jsonData);
        })
        .catch(error => console.error('Error fetching Excel file:', error));
}

function displayExcelPreview(data) {
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
}

function saveActivity() {
    $.ajax({
      url: `${url}/saveExcel`,
      type: "POST",
      xhrFields: {
        responseType: 'blob'
      },
      success: function (response, textStatus, xhr) {
        isSaved = true;
        var filename = '';
        var disposition = xhr.getResponseHeader('Content-Disposition');
        if (disposition && disposition.indexOf('attachment') !== -1) {
          var filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
          var matches = filenameRegex.exec(disposition);
          if (matches != null && matches[1]) {
            filename = matches[1].replace(/['"]/g, '');
          }
        }
  
        saveAs(response, filename || 'arquivo.xlsx')
      },
      error: function (xhr, status, error) {
        console.log(error);
      },
    });
  }